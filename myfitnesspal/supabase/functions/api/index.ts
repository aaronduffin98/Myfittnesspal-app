// Supabase Edge Function entry point.
// This is a port of myfitnesspal/backend/src (Hono + Drizzle) so the mobile app
// can call the same routes without a separate server.
//
// The function is named "api", and Supabase passes paths prefixed with the
// function name, so the original "/api/..." routes work unchanged.
import app from "./app.ts";

Deno.serve(app.fetch);
