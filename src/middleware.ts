import { NextRequest, NextResponse } from "next/server";
import { decryptAndValidateJWT } from "./lib/server/edge-only";

const PUBLIC_PATHS_WITH_REDIRECT = ["/login", "/signup"];
const PUBLIC_PATHS = [...PUBLIC_PATHS_WITH_REDIRECT, "/generator/og"];

const isPublicPath = (paths: string[], currentPath: string) =>
  paths.some((publicPath) => currentPath.startsWith(publicPath));

export async function middleware(req: NextRequest) {
  const refresh_token = req.cookies.get("refresh_token")?.value;

  if (!refresh_token) {
    if (!isPublicPath(PUBLIC_PATHS, req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  const refreshValidationSuccess = await decryptAndValidateJWT(refresh_token);
  if (!refreshValidationSuccess) {
    const res = NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    return res;
  }

  const access_token = req.cookies.get("access_token")?.value;
  let needsRefresh = true;
  if (access_token) {
    const accessValidationSuccess = await decryptAndValidateJWT(access_token);
    if (accessValidationSuccess) needsRefresh = false;
  }

  if (needsRefresh) {
    const res = NextResponse.redirect(
      new URL("/api/auth/refresh", req.nextUrl.origin)
    );
    res.cookies.set("x-original-url", req.nextUrl.toString(), { path: "/" });
    return res;
  }

  if (isPublicPath(PUBLIC_PATHS_WITH_REDIRECT, req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|api|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)",
  ],
};
