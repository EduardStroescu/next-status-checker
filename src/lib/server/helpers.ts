import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { users_table } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { decryptAndValidate } from "./edge-only";
import { NextResponse } from "next/server";

// Cached helper methods makes it easy to get the same value in many places
// without manually passing it around. This discourages passing it from Server
// Component to Server Component which minimizes risk of passing it to a Client
// Component.
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return null;

  const decodedToken = await decryptAndValidate(token);

  if (!decodedToken) return null;

  const [user] = await db
    .select({
      id: users_table.id,
      email: users_table.email,
      username: users_table.username,
      avatar: users_table.avatar,
      createdAt: users_table.createdAt,
    })
    .from(users_table)
    .where(eq(users_table.id, parseInt(decodedToken.id)));

  return user;
});

export function redirectWithError(msg: string, baseUrl: string) {
  return NextResponse.redirect(
    new URL("?errors=" + encodeURIComponent(msg), baseUrl)
  );
}
