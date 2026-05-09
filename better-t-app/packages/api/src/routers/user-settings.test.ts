/**
 * ユーザー設定ルーターのユニットテスト
 * Bun test runner を使用
 */
import { describe, expect, it } from "bun:test";
import { z } from "zod";

// visibleFieldsスキーマのバリデーションテスト
const visibleFieldsSchema = z.object({
  events: z.boolean(),
  mood: z.boolean(),
  goodThings: z.boolean(),
  reflections: z.boolean(),
  gratitude: z.boolean(),
  tomorrowGoals: z.boolean(),
  learnings: z.boolean(),
  habitChecks: z.boolean(),
  tomorrowJoys: z.boolean(),
  todayInOneWord: z.boolean(),
});

const habitCheckItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  order: z.number().int(),
});

const DEFAULT_VISIBLE_FIELDS = {
  events: true,
  mood: true,
  goodThings: true,
  reflections: true,
  gratitude: true,
  tomorrowGoals: true,
  tomorrowJoys: true,
  learnings: true,
  habitChecks: true,
  todayInOneWord: true,
};

describe("userSettings - visibleFields schema", () => {
  it("全フィールドが true のデフォルト値をパースできる", () => {
    const result = visibleFieldsSchema.safeParse(DEFAULT_VISIBLE_FIELDS);
    expect(result.success).toBe(true);
  });

  it("一部フィールドが false でもパースできる", () => {
    const result = visibleFieldsSchema.safeParse({
      ...DEFAULT_VISIBLE_FIELDS,
      mood: false,
      habitChecks: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mood).toBe(false);
      expect(result.data.habitChecks).toBe(false);
    }
  });

  it("必須フィールドが欠けている場合はエラー", () => {
    const result = visibleFieldsSchema.safeParse({ events: true });
    expect(result.success).toBe(false);
  });

  it("boolean 以外の値はエラー", () => {
    const result = visibleFieldsSchema.safeParse({
      ...DEFAULT_VISIBLE_FIELDS,
      mood: "yes",
    });
    expect(result.success).toBe(false);
  });
});

describe("userSettings - habitCheckItem schema", () => {
  it("正しいアイテムをパースできる", () => {
    const result = habitCheckItemSchema.safeParse({
      id: "abc123",
      label: "運動した",
      order: 0,
    });
    expect(result.success).toBe(true);
  });

  it("orderが小数の場合はエラー", () => {
    const result = habitCheckItemSchema.safeParse({
      id: "abc123",
      label: "運動した",
      order: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("labelが必須", () => {
    const result = habitCheckItemSchema.safeParse({
      id: "abc123",
      order: 0,
    });
    expect(result.success).toBe(false);
  });
});
