import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas and handlers
import { addFoodEntryInputSchema } from './schema';
import { addFoodEntry } from './handlers/add_food_entry';
import { getDailyEntries } from './handlers/get_daily_entries';
import { getDailyCaloriesTotal } from './handlers/get_daily_calories_total';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Add a new food entry
  addFoodEntry: publicProcedure
    .input(addFoodEntryInputSchema)
    .mutation(({ input }) => addFoodEntry(input)),
  
  // Get all food entries for a specific date (defaults to today)
  getDailyEntries: publicProcedure
    .input(z.object({ date: z.string().optional() }).optional())
    .query(({ input }) => getDailyEntries(input?.date)),
  
  // Get total calories for a specific date (defaults to today)
  getDailyCaloriesTotal: publicProcedure
    .input(z.object({ date: z.string().optional() }).optional())
    .query(({ input }) => getDailyCaloriesTotal(input?.date)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();