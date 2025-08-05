import { env } from "@/env/server";
import {
  deleteSessionFromDatabase,
  getCurrentUserWithRefreshAction,
} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await getCurrentUserWithRefreshAction();
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const res = NextResponse.redirect(new URL("/login", req.url));

  if (user && refreshToken) {
    try {
      await deleteSessionFromDatabase(user.id, refreshToken);
    } catch {
      // Do Nothing
    }
  }
  res.cookies.delete({
    name: "access_token",
    path: "/",
    domain:
      env.NODE_ENV === "production"
        ? process.env.VERCEL_PROJECT_PRODUCTION_URL!
        : undefined,
  });
  res.cookies.delete({
    name: "refresh_token",
    path: "/",
    domain:
      env.NODE_ENV === "production"
        ? process.env.VERCEL_PROJECT_PRODUCTION_URL!
        : undefined,
  });
  return res;
}
