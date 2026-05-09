import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "../index";
import { diaryRouter } from "./diary";
import { profileRouter } from "./profile";
import { userSettingsRouter } from "./user-settings";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  diary: diaryRouter,
  userSettings: userSettingsRouter,
  profile: profileRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
