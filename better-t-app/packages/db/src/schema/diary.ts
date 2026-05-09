import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth";

export const diary = sqliteTable(
  "diary",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD
    title: text("title").notNull(),
    weather: text("weather"), // sunny | cloudy | rainy | snowy | other
    events: text("events"),
    mood: text("mood"), // great | good | neutral | bad | terrible
    goodThings: text("good_things"),
    reflections: text("reflections"),
    gratitude: text("gratitude"),
    tomorrowGoals: text("tomorrow_goals"),
    tomorrowJoys: text("tomorrow_joys"),
    learnings: text("learnings"),
    habitChecks: text("habit_checks"), // JSON string
    todayInOneWord: text("today_in_one_word"),
    freeText: text("free_text"),
    isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("idx_diary_userId_date").on(table.userId, table.date),
    index("idx_diary_isPublic_date").on(table.isPublic, table.date),
    index("idx_diary_deletedAt").on(table.deletedAt),
  ],
);

export const diaryMedia = sqliteTable(
  "diary_media",
  {
    id: text("id").primaryKey(),
    diaryId: text("diary_id")
      .notNull()
      .references(() => diary.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // image | audio
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    order: integer("order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("idx_diary_media_diaryId").on(table.diaryId)],
);

export const userSettings = sqliteTable("user_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  visibleFields: text("visible_fields").notNull(), // JSON string
  habitCheckItems: text("habit_check_items").notNull(), // JSON string
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

// Relations
export const diaryRelations = relations(diary, ({ one, many }) => ({
  user: one(user, { fields: [diary.userId], references: [user.id] }),
  media: many(diaryMedia),
}));

export const diaryMediaRelations = relations(diaryMedia, ({ one }) => ({
  diary: one(diary, { fields: [diaryMedia.diaryId], references: [diary.id] }),
  user: one(user, { fields: [diaryMedia.userId], references: [user.id] }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(user, { fields: [userSettings.userId], references: [user.id] }),
}));
