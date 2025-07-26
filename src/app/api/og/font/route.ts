import { FontDetector, languageFontMap } from "@/app/generator/og/_utils/font";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const detector = new FontDetector();

// Our own encoding of multiple fonts and their code, so we can fetch them in one request. The structure is:
// [1 byte = X, length of language code][X bytes of language code string][4 bytes = Y, length of font][Y bytes of font data]
// Note that:
// - The language code can't be longer than 255 characters.
// - The language code can't contain non-ASCII characters.
// - The font data can't be longer than 4GB.
// When there are multiple fonts, they are concatenated together.
function encodeFontInfoAsArrayBuffer(code: string, fontData: ArrayBuffer) {
  // 1 byte per char
  const buffer = new ArrayBuffer(1 + code.length + 4 + fontData.byteLength);
  const bufferView = new Uint8Array(buffer);
  // 1 byte for the length of the language code
  bufferView[0] = code.length;
  // X bytes for the language code
  for (let i = 0; i < code.length; i++) {
    bufferView[i + 1] = code.charCodeAt(i);
  }

  // 4 bytes for the length of the font data
  new DataView(buffer).setUint32(1 + code.length, fontData.byteLength, false);

  // Y bytes for the font data
  bufferView.set(new Uint8Array(fontData), 1 + code.length + 4);

  return buffer;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const fonts = searchParams.getAll("fonts");
  const text = searchParams.get("text");

  if (!fonts || fonts.length === 0) return;
  if (!text) {
    const font = await fetchFont(fonts[0]);
    if (!font) return new NextResponse("Font not found", { status: 404 });
    return new NextResponse(font, {
      headers: {
        "Content-Type": "font/woff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const textByFont = await detector.detect(text, fonts);

  const _fonts = Object.keys(textByFont);

  const encodedFontBuffers: ArrayBuffer[] = [];
  let fontBufferByteLength = 0;
  (
    await Promise.all(_fonts.map((font) => fetchFont(font, textByFont[font])))
  ).forEach((fontData, i) => {
    if (fontData) {
      // TODO: We should be able to directly get the language code here :)
      const langCode = Object.entries(languageFontMap).find(
        ([, v]) => v === _fonts[i]
      )?.[0];

      if (langCode) {
        const buffer = encodeFontInfoAsArrayBuffer(langCode, fontData);
        encodedFontBuffers.push(buffer);
        fontBufferByteLength += buffer.byteLength;
      }
    }
  });

  const responseBuffer = new ArrayBuffer(fontBufferByteLength);
  const responseBufferView = new Uint8Array(responseBuffer);
  let offset = 0;
  encodedFontBuffers.forEach((buffer) => {
    responseBufferView.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  });

  return new NextResponse(responseBuffer, {
    headers: {
      "Content-Type": "font/woff",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

async function fetchFont(
  font: string,
  text?: string
): Promise<ArrayBuffer | null> {
  let API = `https://fonts.googleapis.com/css2?family=${font}`;
  if (text) {
    API += `&text=${encodeURIComponent(text)}`;
  }

  let css: string;

  try {
    const res = await fetch(API, {
      headers: {
        // Make sure it returns TTF.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    });

    if (!res.ok) {
      return null;
    }

    css = await res.text();
  } catch {
    return null;
  }

  if (!css.includes("@font-face")) {
    console.warn(`No @font-face found for font: ${font}`);
    return null;
  }

  const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!match) {
    console.warn(`No valid font URL found for font: ${font}`);
    return null;
  }

  try {
    const res = await fetch(match[1]);
    if (!res.ok) {
      console.error(
        `Failed to fetch font file: ${res.status} ${res.statusText}`
      );
      return null;
    }
    return await res.arrayBuffer();
  } catch (err) {
    console.error("Error fetching font file:", err);
    return null;
  }
}
