import { Hono } from "hono";
import api from "./routes-api.ts";

const app = new Hono().route("/api", api);

export default app;

export type AppType = typeof app;
