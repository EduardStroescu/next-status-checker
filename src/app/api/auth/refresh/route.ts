import { issueTokens, validateTokenOwnership } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { users_table } from "@/lib/db/schema";
import { decryptAndValidateJWT } from "@/lib/server/edge-only";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export async function GET(req: NextRequest) {
  const cookieStore = req.cookies;
  const originalURL = cookieStore.get("x-original-url")?.value ?? "/dashboard";
  const res = NextResponse.redirect(originalURL);
  res.cookies.delete("x-original-url");
  try {
    const refreshToken = cookieStore.get("refresh_token")?.value;
    if (!refreshToken) throw new Error("Invalid token");

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
      parsedDecodedToken.data,
      refreshToken
    );

    res.cookies.set("access_token", access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
    });
    res.cookies.set("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error) {
    console.error(error);
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    return res;
  }
}
