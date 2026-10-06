import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "./db.ts";
import { weightEntries } from "./schema.ts";
import type { AppEnv } from "./types.ts";

const uuidParam = z.string().uuid();
const dateParam = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const logWeightSchema = z.object({
  weightKg: z.number().min(20).max(500),
  loggedDate: dateParam,
});

function serializeWeightEntry(entry: typeof weightEntries.$inferSelect) {
  return {
    id: entry.id,
    weightKg: Number(entry.weightKg),
    loggedDate: entry.loggedDate,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

const weightsRoutes = new Hono<AppEnv>()
  .get("/", async (c) => {
    const authUser = c.get("user");

    const rows = await db
      .select()
      .from(weightEntries)
      .where(eq(weightEntries.userId, authUser.id))
      .orderBy(asc(weightEntries.loggedDate));

    return c.json({ items: rows.map(serializeWeightEntry) });
  })

  // Logs a weigh-in, replacing any existing one for the same day.
  .post("/", zValidator("json", logWeightSchema), async (c) => {
    const authUser = c.get("user");
    const body = c.req.valid("json");
    const weightKg = body.weightKg.toFixed(2);

    const [saved] = await db
      .insert(weightEntries)
      .values({ userId: authUser.id, weightKg, loggedDate: body.loggedDate })
      .onConflictDoUpdate({
        target: [weightEntries.userId, weightEntries.loggedDate],
        set: { weightKg, updatedAt: new Date() },
      })
      .returning();

    return c.json(serializeWeightEntry(saved));
  })

  .delete("/:id", async (c) => {
    const authUser = c.get("user");
    const id = c.req.param("id");

    const parsed = uuidParam.safeParse(id);
    if (!parsed.success) {
      return c.json({ error: "Invalid weight entry id" }, 400);
    }

    const existing = await db.query.weightEntries.findFirst({
      where: eq(weightEntries.id, parsed.data),
      columns: { id: true, userId: true },
    });

    if (!existing) {
      return c.json({ error: "Weight entry not found" }, 404);
    }

    if (existing.userId !== authUser.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await db.delete(weightEntries).where(eq(weightEntries.id, parsed.data));

    return c.json({ id: parsed.data });
  });

export default weightsRoutes;
