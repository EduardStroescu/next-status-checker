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
  res.cookies.delete("access_token");
  res.cookies.delete("refresh_token");
  return res;
}
