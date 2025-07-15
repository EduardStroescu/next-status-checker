import { NextRequest, NextResponse } from "next/server";
import { decryptAndValidate } from "./lib/server/edge-only";

const PUBLIC_PATHS_WITH_REDIRECT = ["/login", "/signup"];
const PUBLIC_PATHS = [...PUBLIC_PATHS_WITH_REDIRECT, "/generator/og"];

const isPublicPath = (paths: string[], currentPath: string) =>
  paths.some((publicPath) => currentPath.startsWith(publicPath));

export async function middleware(req: NextRequest) {
  const access_token = req.cookies.get("access_token")?.value;

  if (!access_token) {
    if (!isPublicPath(PUBLIC_PATHS, req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  const validationSuccess = await decryptAndValidate(access_token);

  if (!validationSuccess) {
    const res = NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
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
