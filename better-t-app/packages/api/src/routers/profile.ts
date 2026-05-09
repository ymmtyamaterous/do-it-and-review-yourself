import { db } from "@better-t-app/db";
import { user } from "@better-t-app/db/schema/auth";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

export const profileRouter = {
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50).optional(),
        image: z.string().url().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const existing = await db.query.user.findFirst({ where: eq(user.id, userId) });
      if (!existing) throw new ORPCError("NOT_FOUND");

      await db
        .update(user)
        .set({
          ...(input.name !== undefined && { name: input.name }),
          ...(input.image !== undefined && { image: input.image }),
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      return { success: true };
    }),
};
