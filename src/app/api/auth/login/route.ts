import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcrypt";
import { SignJWT } from "jose";
import { db } from "@/lib/db/drizzle";
import { users_table } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/env/server";
import * as z from "zod/v4";
import { redirectWithError } from "@/lib/server/helpers";

const loginSchema = z.object({
  email: z.email({ error: "A valid email is required" }).toLowerCase(),
  password: z
    .string({ error: "Password is required." })
    .describe("Password")
    .min(5, "Password must be at least 5 characters long")
    .max(20, "Password must be at most 20 characters long"),
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const loginData = Object.fromEntries(formData.entries());
  const inputParse = loginSchema.safeParse(loginData);

  if (!inputParse.success) {
    return redirectWithError(
      inputParse.error.issues.map((issue) => issue.message).join(","),
      req.nextUrl.origin + "/login"
    );
  }

  try {
    const [user] = await db
      .select()
      .from(users_table)
      .where(eq(users_table.email, inputParse.data.email));
    if (!user)
      return redirectWithError(
        "Wrong email or password",
        req.nextUrl.origin + "/login"
      );

    let passwordMatch: boolean;
    try {
      passwordMatch = await compare(inputParse.data.password, user.password);
    } catch {
      return redirectWithError(
        "Wrong email or password",
        req.nextUrl.origin + "/login"
      );
    }

    if (!passwordMatch) {
      return redirectWithError(
        "Wrong email or password",
        req.nextUrl.origin + "/login"
      );
    }

    const secret = new TextEncoder().encode(env.NEXTAUTH_SECRET!);
    const accessToken = await new SignJWT({ id: user.id.toString() })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);
    const refreshToken = await new SignJWT({ id: user.id.toString() })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const res = NextResponse.redirect(
      new URL("/dashboard", req.nextUrl.origin)
    );

    res.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    res.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch {
    return redirectWithError(
      "Unknown Server Error",
      req.nextUrl.origin + "/login"
    );
  }
}
