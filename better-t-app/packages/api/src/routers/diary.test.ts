/**
 * 日記ルーターのユニットテスト
 * Bun test runner を使用
 */
import { describe, expect, it } from "bun:test";
import { z } from "zod";

// ルーター内部のスキーマと同等のバリデーションロジックをテスト
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

describe("diary - diaryInputSchema", () => {
  it("最小限の入力でパースできる", () => {
    const result = diaryInputSchema.safeParse({
      date: "2024-01-01",
      title: "テスト日記",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPublic).toBe(false);
    }
  });

  it("日付フォーマットが正しくない場合はエラー", () => {
    const result = diaryInputSchema.safeParse({
      date: "2024/01/01",
      title: "テスト日記",
    });
    expect(result.success).toBe(false);
  });

  it("titleが空文字の場合はエラー", () => {
    const result = diaryInputSchema.safeParse({
      date: "2024-01-01",
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("titleが101文字以上の場合はエラー", () => {
    const result = diaryInputSchema.safeParse({
      date: "2024-01-01",
      title: "あ".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("weatherに正しい値を設定できる", () => {
    const weathers = ["sunny", "cloudy", "rainy", "snowy", "other"] as const;
    for (const w of weathers) {
      const result = diaryInputSchema.safeParse({
        date: "2024-01-01",
        title: "テスト",
        weather: w,
      });
      expect(result.success).toBe(true);
    }
  });

  it("weatherに不正な値はエラー", () => {
    const result = diaryInputSchema.safeParse({
      date: "2024-01-01",
      title: "テスト",
      weather: "windy",
    });
    expect(result.success).toBe(false);
  });

  it("moodに正しい値を設定できる", () => {
    const moods = ["great", "good", "neutral", "bad", "terrible"] as const;
    for (const m of moods) {
      const result = diaryInputSchema.safeParse({
        date: "2024-01-01",
        title: "テスト",
        mood: m,
      });
      expect(result.success).toBe(true);
    }
  });

  it("habitChecksを配列で設定できる", () => {
    const result = diaryInputSchema.safeParse({
      date: "2024-01-01",
      title: "テスト",
      habitChecks: [
        { label: "運動", checked: true },
        { label: "読書", checked: false },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.habitChecks).toHaveLength(2);
    }
  });

  it("todayInOneWordが100文字を超えるとエラー", () => {
    const result = diaryInputSchema.safeParse({
      date: "2024-01-01",
      title: "テスト",
      todayInOneWord: "あ".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("isPublicをtrueに設定できる", () => {
    const result = diaryInputSchema.safeParse({
      date: "2024-01-01",
      title: "テスト",
      isPublic: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPublic).toBe(true);
    }
  });

  it("fieldVisibilityを省略できる（undefined）", () => {
    const result = diaryInputSchema.safeParse({
      date: "2024-01-01",
      title: "テスト",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fieldVisibility).toBeUndefined();
    }
  });

  it("fieldVisibilityに全フィールドを指定できる", () => {
    const result = diaryInputSchema.safeParse({
      date: "2024-01-01",
      title: "テスト",
      fieldVisibility: {
        events: true,
        goodThings: false,
        reflections: true,
        gratitude: false,
        tomorrowGoals: true,
        tomorrowJoys: false,
        learnings: true,
        habitChecks: false,
        todayInOneWord: true,
        freeText: false,
      },
    });
    expect(result.success).toBe(true);
    if (result.success && result.data.fieldVisibility) {
      expect(result.data.fieldVisibility.events).toBe(true);
      expect(result.data.fieldVisibility.goodThings).toBe(false);
      expect(result.data.fieldVisibility.freeText).toBe(false);
    }
  });

  it("fieldVisibilityの各フィールドはデフォルトがtrue", () => {
    const result = diaryInputSchema.safeParse({
      date: "2024-01-01",
      title: "テスト",
      fieldVisibility: {},
    });
    expect(result.success).toBe(true);
    if (result.success && result.data.fieldVisibility) {
      expect(result.data.fieldVisibility.events).toBe(true);
      expect(result.data.fieldVisibility.freeText).toBe(true);
    }
  });

  it("fieldVisibilityにboolean以外を渡すとエラー", () => {
    const result = diaryInputSchema.safeParse({
      date: "2024-01-01",
      title: "テスト",
      fieldVisibility: {
        events: "yes",
      },
    });
    expect(result.success).toBe(false);
  });
});

describe("diary - generateId", () => {
  it("IDが20文字であること", () => {
    const generateId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 20);
    const id = generateId();
    expect(id).toHaveLength(20);
  });

  it("IDが英数字のみであること", () => {
    const generateId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 20);
    const id = generateId();
    expect(id).toMatch(/^[a-f0-9]+$/);
  });

  it("IDが一意であること（100回生成して重複なし）", () => {
    const generateId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 20);
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
