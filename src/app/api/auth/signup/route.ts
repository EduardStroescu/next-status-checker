import { env } from "@/env/server";
import { db } from "@/lib/db/drizzle";
import { users_table } from "@/lib/db/schema";
import { signupSchema } from "@/lib/schemas";
import { CustomError } from "@/lib/utils";
import { hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const reqBody = await req.json();

  const bodyParse = signupSchema.safeParse(reqBody);

  if (!bodyParse.success) {
    return NextResponse.json(
      { error: bodyParse.error.issues.map((issue) => issue.message).join(",") },
      { status: 400 }
    );
  }

  try {
    const hashedPassword = await hash(bodyParse.data.password, 10);

    const [insertResult] = await db
      .insert(users_table)
      .values({
        ...bodyParse.data,
        password: hashedPassword,
      })
      .execute();

    if (insertResult.affectedRows === 0)
      throw new Error("Could not create user");

    const [user] = await db
      .select()
      .from(users_table)
      .where(eq(users_table.id, insertResult.insertId));

    if (!user) throw new Error("Could not create user");

    const secret = new TextEncoder().encode(env.NEXTAUTH_SECRET);
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

    const res = NextResponse.redirect(new URL("/", req.url));
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
  } catch (err) {
    if (err instanceof CustomError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.customOptions?.statusCode || 400 }
      );
    }
    return NextResponse.json(
      { error: "Unknown Server Error" },
      { status: 500 }
    );
  }
}
