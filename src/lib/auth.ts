import { cache } from "react";
import { cookies } from "next/headers";
import { sessions_table, users_table } from "./db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "./db/drizzle";
import { decryptAndValidateJWT } from "./server/edge-only";
import * as z from "zod/v4";
import { User } from "./types";
import { SignJWT } from "jose";
import { env } from "@/env/server";

// Cached helper methods makes it easy to get the same value in many places
// without manually passing it around. This discourages passing it from Server
// Component to Server Component which minimizes risk of passing it to a Client Component.
export const getCurrentUser = cache(async () => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return null;

    const decodedToken = await decryptAndValidateJWT(accessToken);
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

    return user ?? null;
  } catch {
    return null;
  }
});

export const validateTokenOwnership = async (refreshToken: string) => {
  if (!refreshToken) throw new Error("Missing token");

  const [session] = await db
    .select()
    .from(sessions_table)
    .where(eq(sessions_table.refreshToken, refreshToken));

  return session ?? null;
};

export const saveSessionToDatabase = async (
  userId: User["id"],
  token: string
) => {
  if (!userId || !token) throw new Error("User not found");

  await db.insert(sessions_table).values({
    userId,
    refreshToken: token,
  });
};

export const updateSessionInDatabase = async (
  userId: User["id"],
  oldToken: string,
  newToken: string
) => {
  if (!userId || !newToken) throw new Error("User not found");

  await db
    .update(sessions_table)
    .set({
      refreshToken: newToken,
    })
    .where(
      and(
        eq(sessions_table.userId, userId),
        eq(sessions_table.refreshToken, oldToken)
      )
    );
};

export const deleteSessionFromDatabase = async (
  userId: User["id"],
  refreshToken: string
) => {
  if (!userId || !refreshToken) throw new Error("User not found");

  await db
    .delete(sessions_table)
    .where(
      and(
        eq(sessions_table.userId, userId),
        eq(sessions_table.refreshToken, refreshToken)
      )
    );
};

export const issueTokens = async (userId: User["id"], oldToken?: string) => {
  if (!userId) throw new Error("User not found");
  const secret = new TextEncoder().encode(env.NEXTAUTH_SECRET!);

  const access_token = await new SignJWT({ id: userId.toString() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
  const refresh_token = await new SignJWT({ id: userId.toString() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  try {
    if (oldToken) {
      await updateSessionInDatabase(userId, oldToken, refresh_token);
    } else {
      await saveSessionToDatabase(userId, refresh_token);
    }
    return { access_token, refresh_token };
  } catch {
    throw new Error("Could not save session.");
  }
};

export const getCurrentUserWithRefreshAction = async () => {
  const user = await getCurrentUser();
  if (user) return user;

  const cookieStore = await cookies();
  try {
    const refreshToken = cookieStore.get("refresh_token")?.value;
    if (!refreshToken) throw new Error("Missing token");

    const decodedToken = await decryptAndValidateJWT(refreshToken);
    if (!decodedToken) throw new Error("Invalid token");

    const correctTokenOwnership = await validateTokenOwnership(refreshToken);
    if (!correctTokenOwnership) throw new Error("Invalid token");

    const parsedDecodedToken = z.coerce.number().safeParse(decodedToken.id);
    if (!parsedDecodedToken.success) throw new Error("Invalid token");

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
    if (!user) throw new Error("Invalid token");

    const { access_token, refresh_token } = await issueTokens(
      user.id,
      refreshToken
    );

    cookieStore.set("access_token", access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
    });
    cookieStore.set("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return user;
  } catch {
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    return null;
  }
};
