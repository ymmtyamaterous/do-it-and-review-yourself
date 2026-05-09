import { db } from "@better-t-app/db";
import { userSettings } from "@better-t-app/db/schema/diary";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

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

const DEFAULT_HABIT_CHECK_ITEMS: { id: string; label: string; order: number }[] = [];

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}

const visibleFieldsSchema = z.object({
  events: z.boolean(),
  mood: z.boolean(),
  goodThings: z.boolean(),
  reflections: z.boolean(),
  gratitude: z.boolean(),
  tomorrowGoals: z.boolean(),
  tomorrowJoys: z.boolean(),
  learnings: z.boolean(),
  habitChecks: z.boolean(),
  todayInOneWord: z.boolean(),
});

const habitCheckItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  order: z.number().int(),
});

export const userSettingsRouter = {
  get: protectedProcedure.handler(async ({ context }) => {
    const existing = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, context.session.user.id),
    });
    if (!existing) {
      return {
        visibleFields: DEFAULT_VISIBLE_FIELDS,
        habitCheckItems: DEFAULT_HABIT_CHECK_ITEMS,
      };
    }
    return {
      visibleFields: JSON.parse(existing.visibleFields) as typeof DEFAULT_VISIBLE_FIELDS,
      habitCheckItems: JSON.parse(existing.habitCheckItems) as typeof DEFAULT_HABIT_CHECK_ITEMS,
    };
  }),

  update: protectedProcedure
    .input(
      z.object({
        visibleFields: visibleFieldsSchema.optional(),
        habitCheckItems: z.array(habitCheckItemSchema).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const existing = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, userId),
      });

      const now = new Date();
      if (!existing) {
        await db.insert(userSettings).values({
          id: generateId(),
          userId,
          visibleFields: JSON.stringify(input.visibleFields ?? DEFAULT_VISIBLE_FIELDS),
          habitCheckItems: JSON.stringify(input.habitCheckItems ?? DEFAULT_HABIT_CHECK_ITEMS),
          createdAt: now,
          updatedAt: now,
        });
      } else {
        const currentVisible = JSON.parse(existing.visibleFields) as typeof DEFAULT_VISIBLE_FIELDS;
        const currentHabit = JSON.parse(existing.habitCheckItems) as typeof DEFAULT_HABIT_CHECK_ITEMS;
        await db
          .update(userSettings)
          .set({
            visibleFields: JSON.stringify(input.visibleFields ?? currentVisible),
            habitCheckItems: JSON.stringify(input.habitCheckItems ?? currentHabit),
            updatedAt: now,
          })
          .where(eq(userSettings.userId, userId));
      }
      return { success: true };
    }),
};
