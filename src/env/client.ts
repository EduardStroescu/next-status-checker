import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export const env = createEnv({
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_SIGNUP_CLOSED: z.coerce.boolean().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NEXT_PUBLIC_SIGNUP_CLOSED: process.env.NEXT_PUBLIC_SIGNUP_CLOSED,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
