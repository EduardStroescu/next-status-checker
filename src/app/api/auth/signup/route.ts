import { env } from "@/env/server";
import { issueTokens } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { users_table } from "@/lib/db/schema";
import { signupSchema } from "@/lib/schemas";
import { CustomError } from "@/lib/utils";
import { hash } from "bcrypt";
import { eq } from "drizzle-orm";
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

    const { access_token, refresh_token } = await issueTokens(user.id);

    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set("access_token", access_token, {
      httpOnly: true,
      path: "/",
      secure: env.NODE_ENV === "production",
      domain:
        env.NODE_ENV === "production"
          ? process.env.VERCEL_PROJECT_PRODUCTION_URL!
          : undefined,
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
    });
    res.cookies.set("refresh_token", refresh_token, {
      httpOnly: true,
      path: "/",
      secure: env.NODE_ENV === "production",
      domain:
        env.NODE_ENV === "production"
          ? process.env.VERCEL_PROJECT_PRODUCTION_URL!
          : undefined,
      sameSite: "lax",
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
