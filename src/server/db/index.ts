import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DB_URL!);

const db = drizzle(sql, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

export default db;
