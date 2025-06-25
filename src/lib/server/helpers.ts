import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { users_table } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { decryptAndValidate } from "./edge-only";
import { NextResponse } from "next/server";
import * as z from "zod/v4";

// Cached helper methods makes it easy to get the same value in many places
// without manually passing it around. This discourages passing it from Server
// Component to Server Component which minimizes risk of passing it to a Client
// Component.
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return null;

  const decodedToken = await decryptAndValidate(token);

  if (!decodedToken) return null;

  const parsedDecodedToken = z.coerce.number().safeParse(decodedToken.id);

  if (!parsedDecodedToken.success) return null;

  const [user] = await db
    .select({
      id: users_table.id,
      email: users_table.email,
      username: users_table.username,
      avatar: users_table.avatar,
      createdAt: users_table.createdAt,
    })
    .from(users_table)
    .where(eq(users_table.id, parsedDecodedToken.data));

  return user;
});

export function redirectWithError(msg: string, baseUrl: string) {
  return NextResponse.redirect(
    new URL("?errors=" + encodeURIComponent(msg), baseUrl)
  );
}

type SafeResponse<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export const getServerDataSafe = async <T>(
  cb: () => Promise<T>
): Promise<SafeResponse<T>> => {
  try {
    const data = await cb();
    return { success: true, data };
  } catch (error) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error.message as string)
        : String(error);
    return { success: false, message };
  }
};
