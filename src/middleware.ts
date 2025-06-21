import { NextResponse } from "next/server";

export async function middleware() {
  return NextResponse.next();

  // if (
  //   req.nextUrl.pathname.startsWith("/api/auth") ||
  //   req.nextUrl.pathname.startsWith("/api/keep-alive") ||
  //   req.nextUrl.pathname.startsWith("/api/health")
  // ) {
  //   return NextResponse.next();
  // }

  // try {
  //   const access_token = req.cookies.get("access_token")?.value;
  //   const refresh_token = req.cookies.get("refresh_token")?.value;

  //   if (!access_token)
  //     return NextResponse.redirect(new URL("/login", req.nextUrl.origin));

  //   const token = await decryptAndValidate(access_token);

  //   if (!token)
  //     return NextResponse.redirect(new URL("/login", req.nextUrl.origin));

  //   const validateUser = await fetch(
  //     new URL("/api/auth/validate", req.nextUrl.origin),
  //     {
  //       method: "GET",
  //       headers: {
  //         Cookie: `access_token=${access_token}; refresh_token=${refresh_token}`,
  //       },
  //     }
  //   );

  //   if (!validateUser.ok) {
  //     // Clear cookie and redirect
  //     const res = NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  //     res.cookies.delete("access_token");
  //     res.cookies.delete("refresh_token");
  //     return res;
  //   }

  //   return NextResponse.next();
  // } catch {
  //   const res = NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  //   res.cookies.delete("access_token");
  //   res.cookies.delete("refresh_token");
  //   return res;
  // }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!login|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api)(.*)",
  ],
};
