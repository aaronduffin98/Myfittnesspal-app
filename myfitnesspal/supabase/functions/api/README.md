# api (Supabase Edge Function)

A port of `myfitnesspal/backend/src` so the mobile app's diary routes run inside Supabase.

- Deployed to project `rgptsjtydiuohtbwgmlp` as the function `api`.
- Base URL for the app: `https://rgptsjtydiuohtbwgmlp.supabase.co/functions/v1` (the app adds `/api/...`).
- Platform JWT verification is off on purpose. `auth.ts` checks the user's token on every route.
- Database access comes from `SUPABASE_DB_URL`, which Supabase provides. There are no secrets to set.

Files map one to one with the original backend:

| Here | Original |
| --- | --- |
| `index.ts` | `src/index.ts` |
| `app.ts` | `src/app.ts` |
| `auth.ts` | `src/middleware/auth.ts` and `src/lib/supabase.ts` |
| `db.ts` | `src/db/index.ts` |
| `schema.ts` | `src/db/schema.ts` (identical) |
| `routes-api.ts` | `src/routes/api.ts` (imports changed only) |
| `routes-food-entries.ts` | `src/routes/food-entries.ts` (imports changed only) |

Differences from the original: runs on Deno, uses the public key instead of the service role key to check tokens, turns off prepared statements for the database client, and no longer writes parts of tokens to the logs.
