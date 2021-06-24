import * as trpc from "@trpc/server";
import { inferAsyncReturnType, inferProcedureOutput } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import calendarApi from "routers/calendar";
import freeAgentsApi from "routers/freeagents";
import playApi from "routers/play";
import plusApi from "routers/plus";
import superjson from "superjson";
import { getMySession } from "utils/api";
import { createSSGHelpers } from "@trpc/react/ssg";

const createContext = async ({ req }: trpcNext.CreateNextContextOptions) => {
  const user = await getMySession(req);
  return { user };
};

type Context = inferAsyncReturnType<typeof createContext>;

export function createRouter() {
  return trpc.router<Context>();
}
// Important: only use this export with SSR/SSG
export const appRouter = createRouter()
  .transformer(superjson)
  .merge("plus.", plusApi)
  .merge("calendar.", calendarApi)
  .merge("freeAgents.", freeAgentsApi)
  .merge("play.", playApi);

// Exporting type _type_ AppRouter only exposes types that can be used for inference
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export
export type AppRouter = typeof appRouter;

/**
 * This is a helper method to infer the output of a query resolver
 * @example type HelloOutput = inferQueryOutput<'hello'>
 */
export type inferQueryOutput<
  TRouteKey extends keyof AppRouter["_def"]["queries"]
> = inferProcedureOutput<AppRouter["_def"]["queries"][TRouteKey]>;

export const ssg = createSSGHelpers({ router: appRouter, ctx: { user: null } });

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
  batching: {
    enabled: true,
  },
});
