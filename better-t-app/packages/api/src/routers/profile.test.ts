/**
 * プロフィールルーターのユニットテスト
 * Bun test runner を使用
 */
import { describe, expect, it } from "bun:test";
import { z } from "zod";

// profile.tsの入力スキーマと同等
const profileUpdateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  image: z.string().url().optional(),
});

describe("profile - profileUpdateSchema", () => {
  it("nameのみ更新できる", () => {
    const result = profileUpdateSchema.safeParse({ name: "山田 太郎" });
    expect(result.success).toBe(true);
  });

  it("imageのみ更新できる", () => {
    const result = profileUpdateSchema.safeParse({
      image: "https://example.com/avatar.png",
    });
    expect(result.success).toBe(true);
  });

  it("両方同時に更新できる", () => {
    const result = profileUpdateSchema.safeParse({
      name: "山田 太郎",
      image: "https://example.com/avatar.png",
    });
    expect(result.success).toBe(true);
  });

  it("空オブジェクトはOK（省略可能なフィールド）", () => {
    const result = profileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("nameが空文字はエラー", () => {
    const result = profileUpdateSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("nameが51文字以上はエラー", () => {
    const result = profileUpdateSchema.safeParse({ name: "あ".repeat(51) });
    expect(result.success).toBe(false);
  });

  it("imageがURL形式でない場合はエラー", () => {
    const result = profileUpdateSchema.safeParse({ image: "not-a-url" });
    expect(result.success).toBe(false);
  });
});
