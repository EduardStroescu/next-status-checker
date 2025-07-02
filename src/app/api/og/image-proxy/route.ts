import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing 'url' parameter", { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        // Add a User-Agent to avoid being blocked by some sites
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", { status: 500 });
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // cache for 1 day
      },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return new NextResponse("Error fetching image", { status: 500 });
  }
}
