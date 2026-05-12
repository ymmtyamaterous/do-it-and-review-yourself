import { db } from "@better-t-app/db";
import { diary, diaryMedia } from "@better-t-app/db/schema/diary";
import { auth } from "@better-t-app/auth";
import { and, eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { mkdir, unlink } from "node:fs/promises";
import { join } from "node:path";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  // audio - ブラウザ・OS によって送信される MIME タイプが異なるため広めに許可
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/aac",
  "audio/x-aac",
  "audio/webm",
  "audio/flac",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOADS_DIR = "./uploads";

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/wave": "wav",
    "audio/ogg": "ogg",
    "audio/mp4": "m4a",
    "audio/x-m4a": "m4a",
    "audio/m4a": "m4a",
    "audio/aac": "aac",
    "audio/x-aac": "aac",
    "audio/webm": "webm",
    "audio/flac": "flac",
  };
  return map[mimeType] ?? "bin";
}

async function getUserId(req: Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

export const uploadsRouter = new Hono();

// POST /api/diary/:diaryId/media
uploadsRouter.post("/api/diary/:diaryId/media", async (c) => {
  const userId = await getUserId(c.req.raw);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const diaryId = c.req.param("diaryId");

  // 日記の所有権確認
  const [entry] = await db
    .select({ id: diary.id })
    .from(diary)
    .where(and(eq(diary.id, diaryId), eq(diary.userId, userId), isNull(diary.deletedAt)));

  if (!entry) {
    return c.json({ error: "Diary not found" }, 404);
  }

  const formData = await c.req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return c.json({ error: "No file provided" }, 400);
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return c.json({ error: `Unsupported file type: ${file.type}` }, 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return c.json({ error: "File too large (max 10MB)" }, 400);
  }

  const mediaType = file.type.startsWith("image/") ? "image" : "audio";
  const ext = getExtension(file.type);
  const mediaId = generateId();
  const filename = `${mediaId}.${ext}`;
  const filePath = join(UPLOADS_DIR, filename);

  await mkdir(UPLOADS_DIR, { recursive: true });

  const buffer = await file.arrayBuffer();
  await Bun.write(filePath, buffer);

  // 既存メディアの最大 order を取得
  const existingMedia = await db
    .select({ order: diaryMedia.order })
    .from(diaryMedia)
    .where(eq(diaryMedia.diaryId, diaryId))
    .orderBy(diaryMedia.order);
  const maxOrder = existingMedia.length > 0
    ? Math.max(...existingMedia.map((m) => m.order))
    : -1;

  await db.insert(diaryMedia).values({
    id: mediaId,
    diaryId,
    userId,
    type: mediaType,
    url: `/uploads/${filename}`,
    filename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    order: maxOrder + 1,
  });

  return c.json({
    id: mediaId,
    type: mediaType,
    url: `/uploads/${filename}`,
    filename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    order: maxOrder + 1,
  });
});

// DELETE /api/diary/:diaryId/media/:mediaId
uploadsRouter.delete("/api/diary/:diaryId/media/:mediaId", async (c) => {
  const userId = await getUserId(c.req.raw);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const diaryId = c.req.param("diaryId");
  const mediaId = c.req.param("mediaId");

  const [media] = await db
    .select()
    .from(diaryMedia)
    .where(
      and(
        eq(diaryMedia.id, mediaId),
        eq(diaryMedia.diaryId, diaryId),
        eq(diaryMedia.userId, userId),
      ),
    );

  if (!media) {
    return c.json({ error: "Media not found" }, 404);
  }

  // ファイルを削除
  const filePath = join(UPLOADS_DIR, media.url.replace("/uploads/", ""));
  try {
    await unlink(filePath);
  } catch {
    // ファイルが存在しない場合は無視
  }

  await db.delete(diaryMedia).where(eq(diaryMedia.id, mediaId));

  return c.json({ success: true });
});
