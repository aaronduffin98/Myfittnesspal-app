import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "./db.ts";
import { userGoals } from "./schema.ts";
import type { AppEnv } from "./types.ts";

const goalsSchema = z.object({
  calories: z.number().int().min(500).max(10000),
  carbs: z.number().int().min(0).max(2000),
  fat: z.number().int().min(0).max(1000),
  protein: z.number().int().min(0).max(1000),
});

function serializeGoals(row: typeof userGoals.$inferSelect) {
  return {
    calories: row.calories,
    carbs: row.carbs,
    fat: row.fat,
    protein: row.protein,
  };
}

const goalsRoutes = new Hono<AppEnv>()
  .get("/", async (c) => {
    const authUser = c.get("user");

    const row = await db.query.userGoals.findFirst({
      where: eq(userGoals.userId, authUser.id),
    });

    return c.json({ goals: row ? serializeGoals(row) : null });
  })

  .put("/", zValidator("json", goalsSchema), async (c) => {
    const authUser = c.get("user");
    const body = c.req.valid("json");

    const [saved] = await db
      .insert(userGoals)
      .values({ userId: authUser.id, ...body })
      .onConflictDoUpdate({
        target: userGoals.userId,
        set: { ...body, updatedAt: new Date() },
      })
      .returning();

    return c.json({ goals: serializeGoals(saved) });
  });

export default goalsRoutes;
