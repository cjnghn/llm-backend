import "dotenv/config";

import type { Config } from "drizzle-kit";
import { env } from "@/env";

export default {
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
  driver: "pg",
  strict: true,
} satisfies Config;
