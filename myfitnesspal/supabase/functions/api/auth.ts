import type { Context, Next } from "hono";
import { createClient } from "@supabase/supabase-js";
import type { AppEnv } from "./types.ts";

// Only used to ask Supabase Auth "whose token is this?". That call works with the
// public key, so the function never needs a secret key.
function publicKey(): string {
  const raw = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (raw) {
    try {
      const keys = JSON.parse(raw) as Record<string, string>;
      if (keys.default) return keys.default;
    } catch {
      // fall through to the legacy key
    }
  }
  return Deno.env.get("SUPABASE_ANON_KEY") ?? "";
}

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, publicKey(), {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error(`[auth] ${c.req.method} ${c.req.path} - missing bearer token`);
    return c.json({ error: "Missing or invalid authorization header" }, 401);
  }

  const token = authHeader.slice("Bearer ".length);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    console.error(
      `[auth] ${c.req.method} ${c.req.path} - token rejected: ${error?.message ?? "no user returned"}`
    );
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  c.set("user", user);

  await next();
}
