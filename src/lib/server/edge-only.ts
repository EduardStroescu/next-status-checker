import { env } from "@/env/server";
import { jwtVerify } from "jose";

export const decryptAndValidateJWT = async (
  token: string
): Promise<{ id: string } | null> => {
  try {
    const secret = new TextEncoder().encode(env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify<{ id: string }>(token, secret);

    if (!payload || typeof payload !== "object" || !("id" in payload)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};
