import { db } from "@better-t-app/db";
import { diary, diaryMedia } from "@better-t-app/db/schema/diary";
import { user } from "@better-t-app/db/schema/auth";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, isNull, like, or, sql } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../index";

const habitCheckItemSchema = z.object({
  label: z.string(),
  checked: z.boolean(),
});

const fieldVisibilitySchema = z.object({
  events: z.boolean().default(true),
  goodThings: z.boolean().default(true),
  reflections: z.boolean().default(true),
  gratitude: z.boolean().default(true),
  tomorrowGoals: z.boolean().default(true),
  tomorrowJoys: z.boolean().default(true),
  learnings: z.boolean().default(true),
  habitChecks: z.boolean().default(true),
  todayInOneWord: z.boolean().default(true),
  freeText: z.boolean().default(true),
}).optional();

const weatherEnum = z.enum(["sunny", "cloudy", "rainy", "snowy", "other"]).optional();
const moodEnum = z.enum(["great", "good", "neutral", "bad", "terrible"]).optional();

const diaryInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  title: z.string().min(1).max(100),
  weather: weatherEnum,
  events: z.string().optional(),
  mood: moodEnum,
  goodThings: z.string().optional(),
  reflections: z.string().optional(),
  gratitude: z.string().optional(),
  tomorrowGoals: z.string().optional(),
  tomorrowJoys: z.string().optional(),
  learnings: z.string().optional(),
  habitChecks: z.array(habitCheckItemSchema).optional(),
  todayInOneWord: z.string().max(100).optional(),
  freeText: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
  fieldVisibility: fieldVisibilitySchema,
});

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}

export const diaryRouter = {
  create: protectedProcedure
    .input(diaryInputSchema)
    .handler(async ({ input, context }) => {
      const id = generateId();
      const now = new Date();
      await db.insert(diary).values({
        id,
        userId: context.session.user.id,
        date: input.date,
        title: input.title,
        weather: input.weather ?? null,
        events: input.events ?? null,
        mood: input.mood ?? null,
        goodThings: input.goodThings ?? null,
        reflections: input.reflections ?? null,
        gratitude: input.gratitude ?? null,
        tomorrowGoals: input.tomorrowGoals ?? null,
        tomorrowJoys: input.tomorrowJoys ?? null,
        learnings: input.learnings ?? null,
        habitChecks: input.habitChecks ? JSON.stringify(input.habitChecks) : null,
        todayInOneWord: input.todayInOneWord ?? null,
        freeText: input.freeText ?? null,
        isPublic: input.isPublic ?? false,
        fieldVisibility: input.fieldVisibility ? JSON.stringify(input.fieldVisibility) : null,
        createdAt: now,
        updatedAt: now,
      });
      return { id, createdAt: now.toISOString() };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        title: z.string().min(1).max(100).optional(),
        weather: weatherEnum,
        events: z.string().optional(),
        mood: moodEnum,
        goodThings: z.string().optional(),
        reflections: z.string().optional(),
        gratitude: z.string().optional(),
        tomorrowGoals: z.string().optional(),
        tomorrowJoys: z.string().optional(),
        learnings: z.string().optional(),
        habitChecks: z.array(habitCheckItemSchema).optional(),
        todayInOneWord: z.string().max(100).optional(),
        freeText: z.string().optional(),
        isPublic: z.boolean().optional(),
        fieldVisibility: fieldVisibilitySchema,
      }),
    )
    .handler(async ({ input, context }) => {
      const { id, ...fields } = input;
      const existing = await db.query.diary.findFirst({
        where: and(eq(diary.id, id), isNull(diary.deletedAt)),
      });
      if (!existing) throw new ORPCError("NOT_FOUND");
      if (existing.userId !== context.session.user.id) throw new ORPCError("FORBIDDEN");

      await db
        .update(diary)
        .set({
          ...(fields.date !== undefined && { date: fields.date }),
          ...(fields.title !== undefined && { title: fields.title }),
          ...(fields.weather !== undefined && { weather: fields.weather }),
          ...(fields.events !== undefined && { events: fields.events }),
          ...(fields.mood !== undefined && { mood: fields.mood }),
          ...(fields.goodThings !== undefined && { goodThings: fields.goodThings }),
          ...(fields.reflections !== undefined && { reflections: fields.reflections }),
          ...(fields.gratitude !== undefined && { gratitude: fields.gratitude }),
          ...(fields.tomorrowGoals !== undefined && { tomorrowGoals: fields.tomorrowGoals }),
          ...(fields.tomorrowJoys !== undefined && { tomorrowJoys: fields.tomorrowJoys }),
          ...(fields.learnings !== undefined && { learnings: fields.learnings }),
          ...(fields.habitChecks !== undefined && {
            habitChecks: JSON.stringify(fields.habitChecks),
          }),
          ...(fields.todayInOneWord !== undefined && { todayInOneWord: fields.todayInOneWord }),
          ...(fields.freeText !== undefined && { freeText: fields.freeText }),
          ...(fields.isPublic !== undefined && { isPublic: fields.isPublic }),
          ...(fields.fieldVisibility !== undefined && {
            fieldVisibility: fields.fieldVisibility ? JSON.stringify(fields.fieldVisibility) : null,
          }),
          updatedAt: new Date(),
        })
        .where(eq(diary.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const existing = await db.query.diary.findFirst({
        where: and(eq(diary.id, input.id), isNull(diary.deletedAt)),
      });
      if (!existing) throw new ORPCError("NOT_FOUND");
      if (existing.userId !== context.session.user.id) throw new ORPCError("FORBIDDEN");

      await db
        .update(diary)
        .set({ deletedAt: new Date() })
        .where(eq(diary.id, input.id));
      return { success: true };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const entry = await db.query.diary.findFirst({
        where: and(eq(diary.id, input.id), isNull(diary.deletedAt)),
        with: { media: true },
      });
      if (!entry) throw new ORPCError("NOT_FOUND");
      if (!entry.isPublic && entry.userId !== context.session.user.id) {
        throw new ORPCError("FORBIDDEN");
      }
      return {
        ...entry,
        habitChecks: entry.habitChecks ? JSON.parse(entry.habitChecks) : null,
        fieldVisibility: entry.fieldVisibility ? JSON.parse(entry.fieldVisibility) : null,
      };
    }),

  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        keyword: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const offset = (input.page - 1) * input.limit;
      const conditions = [
        eq(diary.userId, context.session.user.id),
        isNull(diary.deletedAt),
        ...(input.keyword
          ? [
              or(
                like(diary.title, `%${input.keyword}%`),
                like(diary.freeText, `%${input.keyword}%`),
              ),
            ]
          : []),
      ];

      const [items, totalResult] = await Promise.all([
        db.query.diary.findMany({
          where: and(...(conditions as [ReturnType<typeof eq>])),
          orderBy: [desc(diary.date)],
          limit: input.limit,
          offset,
          with: { media: true },
        }),
        db
          .select({ count: sql<number>`count(*)` })
          .from(diary)
          .where(and(...(conditions as [ReturnType<typeof eq>]))),
      ]);

      return {
        items: items.map((item) => ({
          ...item,
          habitChecks: item.habitChecks ? JSON.parse(item.habitChecks) : null,
          fieldVisibility: item.fieldVisibility ? JSON.parse(item.fieldVisibility) : null,
        })),
        total: totalResult[0]?.count ?? 0,
        page: input.page,
        limit: input.limit,
      };
    }),

  listPublic: publicProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .handler(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;
      const conditions = [eq(diary.isPublic, true), isNull(diary.deletedAt)];

      const [items, totalResult] = await Promise.all([
        db
          .select({
            id: diary.id,
            userId: diary.userId,
            date: diary.date,
            title: diary.title,
            weather: diary.weather,
            events: diary.events,
            mood: diary.mood,
            goodThings: diary.goodThings,
            reflections: diary.reflections,
            gratitude: diary.gratitude,
            tomorrowGoals: diary.tomorrowGoals,
            tomorrowJoys: diary.tomorrowJoys,
            learnings: diary.learnings,
            habitChecks: diary.habitChecks,
            todayInOneWord: diary.todayInOneWord,
            freeText: diary.freeText,
            isPublic: diary.isPublic,
            fieldVisibility: diary.fieldVisibility,
            createdAt: diary.createdAt,
            updatedAt: diary.updatedAt,
            authorName: user.name,
            authorImage: user.image,
          })
          .from(diary)
          .innerJoin(user, eq(diary.userId, user.id))
          .where(and(...conditions))
          .orderBy(desc(diary.date))
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(diary)
          .where(and(...conditions)),
      ]);

      return {
        items: items.map((item) => {
          const fv: Record<string, boolean> | null = item.fieldVisibility ? JSON.parse(item.fieldVisibility) : null;
          return {
            ...item,
            events: fv === null || fv.events !== false ? item.events : null,
            goodThings: fv === null || fv.goodThings !== false ? item.goodThings : null,
            reflections: fv === null || fv.reflections !== false ? item.reflections : null,
            gratitude: fv === null || fv.gratitude !== false ? item.gratitude : null,
            tomorrowGoals: fv === null || fv.tomorrowGoals !== false ? item.tomorrowGoals : null,
            tomorrowJoys: fv === null || fv.tomorrowJoys !== false ? item.tomorrowJoys : null,
            learnings: fv === null || fv.learnings !== false ? item.learnings : null,
            habitChecks: (fv === null || fv.habitChecks !== false) && item.habitChecks ? JSON.parse(item.habitChecks) : null,
            todayInOneWord: fv === null || fv.todayInOneWord !== false ? item.todayInOneWord : null,
            freeText: fv === null || fv.freeText !== false ? item.freeText : null,
            fieldVisibility: fv,
            author: { name: item.authorName, image: item.authorImage ?? null },
          };
        }),
        total: totalResult[0]?.count ?? 0,
        page: input.page,
        limit: input.limit,
      };
    }),

  getPublicById: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const [entry] = await db
        .select({
          id: diary.id,
          userId: diary.userId,
          date: diary.date,
          title: diary.title,
          weather: diary.weather,
          events: diary.events,
          mood: diary.mood,
          goodThings: diary.goodThings,
          reflections: diary.reflections,
          gratitude: diary.gratitude,
          tomorrowGoals: diary.tomorrowGoals,
          tomorrowJoys: diary.tomorrowJoys,
          learnings: diary.learnings,
          habitChecks: diary.habitChecks,
          todayInOneWord: diary.todayInOneWord,
          freeText: diary.freeText,
          isPublic: diary.isPublic,
            fieldVisibility: diary.fieldVisibility,
          updatedAt: diary.updatedAt,
          authorName: user.name,
          authorImage: user.image,
        })
        .from(diary)
        .innerJoin(user, eq(diary.userId, user.id))
        .where(and(eq(diary.id, input.id), eq(diary.isPublic, true), isNull(diary.deletedAt)));

      if (!entry) throw new ORPCError("NOT_FOUND");
      const fv: Record<string, boolean> | null = entry.fieldVisibility ? JSON.parse(entry.fieldVisibility) : null;
      return {
        ...entry,
        events: fv === null || fv.events !== false ? entry.events : null,
        goodThings: fv === null || fv.goodThings !== false ? entry.goodThings : null,
        reflections: fv === null || fv.reflections !== false ? entry.reflections : null,
        gratitude: fv === null || fv.gratitude !== false ? entry.gratitude : null,
        tomorrowGoals: fv === null || fv.tomorrowGoals !== false ? entry.tomorrowGoals : null,
        tomorrowJoys: fv === null || fv.tomorrowJoys !== false ? entry.tomorrowJoys : null,
        learnings: fv === null || fv.learnings !== false ? entry.learnings : null,
        habitChecks: (fv === null || fv.habitChecks !== false) && entry.habitChecks ? JSON.parse(entry.habitChecks) : null,
        todayInOneWord: fv === null || fv.todayInOneWord !== false ? entry.todayInOneWord : null,
        freeText: fv === null || fv.freeText !== false ? entry.freeText : null,
        fieldVisibility: fv,
        author: { name: entry.authorName, image: entry.authorImage ?? null },
      };
    }),

  listByMonth: protectedProcedure
    .input(
      z.object({
        year: z.number().int().min(2000).max(2100),
        month: z.number().int().min(1).max(12),
      }),
    )
    .handler(async ({ input, context }) => {
      const yearStr = String(input.year);
      const monthStr = String(input.month).padStart(2, "0");
      const prefix = `${yearStr}-${monthStr}-`;

      const items = await db
        .select({ id: diary.id, date: diary.date })
        .from(diary)
        .where(
          and(
            eq(diary.userId, context.session.user.id),
            isNull(diary.deletedAt),
            like(diary.date, `${prefix}%`),
          ),
        )
        .orderBy(diary.date);

      return items;
    }),

  getMedia: protectedProcedure
    .input(z.object({ diaryId: z.string() }))
    .handler(async ({ input, context }) => {
      // 日記の所有者確認（公開日記でも自分のみ取得可）
      const [entry] = await db
        .select({ id: diary.id })
        .from(diary)
        .where(
          and(
            eq(diary.id, input.diaryId),
            eq(diary.userId, context.session.user.id),
            isNull(diary.deletedAt),
          ),
        );
      if (!entry) throw new ORPCError("NOT_FOUND");

      const media = await db
        .select()
        .from(diaryMedia)
        .where(eq(diaryMedia.diaryId, input.diaryId))
        .orderBy(diaryMedia.order);

      return media;
    }),
};
