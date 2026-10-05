import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.ts";

// SUPABASE_DB_URL is provided to every Edge Function by Supabase. No secret to manage.
const connectionString = Deno.env.get("SUPABASE_DB_URL")!;

// prepare: false keeps this safe if the URL ever points at a transaction pooler.
// A small pool is plenty for one user and avoids holding connections open.
const client = postgres(connectionString, {
  prepare: false,
  max: 2,
  idle_timeout: 20,
});

export const db = drizzle(client, { schema });
