import {
  deserializeReactElement,
  loadGoogleFont,
} from "@/app/generator/og/_utils/server-utils";
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import * as fflate from "fflate";
import { Base64 } from "js-base64";
import { Font } from "node_modules/next/dist/compiled/@vercel/og/satori";
import { apis } from "@/app/generator/og/_utils/twemoji";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ share: string }> }
) {
  const share = (await params).share;
  const shared = share.replace(/\.png$/, "");
  if (!shared) {
    return new NextResponse("Missing share param", { status: 400 });
  }

  try {
    const decompressedData = fflate.strFromU8(
      fflate.decompressSync(Base64.toUint8Array(shared))
    );
    const decoded = JSON.parse(decompressedData);
    const code = decoded.code;
    const satoriOptions: {
      width: number;
      height: number;
      debug: boolean;
      emojiType: keyof typeof apis;
      fontEmbed: boolean;
      fonts: Omit<Font, "data">[];
    } = decoded.options;

    // Deserialize to React element
    const reactElement = deserializeReactElement(code);

    const fonts = await Promise.all(
      satoriOptions.fonts.map((font) => loadGoogleFont(font))
    );

    if (!reactElement)
      return new NextResponse("Error generating image", { status: 500 });

    // Render OG image using next/og
    return new ImageResponse(reactElement, {
      width: satoriOptions.width || 1200,
      height: satoriOptions.height || 630,
      emoji: satoriOptions.emojiType || "twemoji",
      fonts,
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Content-Disposition": 'inline; filename="og.png"',
        "Cross-Origin-Resource-Policy": "cross-origin",
        "cross-origin-embedder-policy": "unsafe-none",
        "cross-origin-opener-policy": "same-origin",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error generating image", { status: 500 });
  }
}
