import { env } from "@/env/server";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  dialect: "singlestore",
  tablesFilter: ["statusChecker_*"],
  dbCredentials: {
    host: env.SINGLESTORE_HOST,
    port: env.SINGLESTORE_PORT,
    user: env.SINGLESTORE_USER,
    password: env.SINGLESTORE_PASS,
    database: env.SINGLESTORE_DB_NAME,
    ssl: {},
  },
});
