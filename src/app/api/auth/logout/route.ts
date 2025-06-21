import { NextRequest, NextResponse } from "next/server";

export function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.delete("access_token");
  res.cookies.delete("refresh_token");
  return res;
}
