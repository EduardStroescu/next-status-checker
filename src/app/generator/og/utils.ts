import { Font, FontStyle, FontWeight } from "satori";
import { apis, getIconCode, loadEmoji } from "./twemoji";
import { languageFontMap } from "./font";

export async function initDefaultFonts() {
  if (typeof window === "undefined") return [];

  const [font, fontBold, fontIcon] =
    window.__resource ||
    (window.__resource = await Promise.all([
      fetch("/inter-latin-ext-400-normal.woff").then((res) =>
        res.arrayBuffer()
      ),
      fetch("/inter-latin-ext-700-normal.woff").then((res) =>
        res.arrayBuffer()
      ),
      fetch("/material-icons-base-400-normal.woff").then((res) =>
        res.arrayBuffer()
      ),
    ]));

  return [
    {
      name: "Inter",
      data: font,
      weight: 400 as FontWeight,
      style: "normal" as FontStyle,
    },
    {
      name: "Inter",
      data: fontBold,
      weight: 700 as FontWeight,
      style: "normal" as FontStyle,
    },
    {
      name: "Material Icons",
      data: fontIcon,
      weight: 400 as FontWeight,
      style: "normal" as FontStyle,
    },
  ];
}

export function withCache<Args extends string[], Return>(
  fn: (...args: Args) => Promise<Return>
) {
  const cache = new Map<string, Return>();

  return async (...args: Args): Promise<Return> => {
    const key = args.join(":");
    if (cache.has(key)) return cache.get(key)!;
    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
}

export const loadDynamicAsset = withCache(
  async (emojiType: keyof typeof apis, _code: string, text: string) => {
    if (_code === "emoji") {
      // It's an emoji, load the image.
      return (
        `data:image/svg+xml;base64,` +
        btoa(await loadEmoji(emojiType, getIconCode(text)))
      );
    }

    const codes = _code.split("|");

    // Try to load from Google Fonts.
    const names = codes
      .map((code) => languageFontMap[code as keyof typeof languageFontMap])
      .filter(Boolean);

    if (names.length === 0) return [];

    const params = new URLSearchParams();
    for (const name of names.flat()) {
      params.append("fonts", name);
    }
    params.set("text", text);

    try {
      const response = await fetch(`/api/og/font?${params.toString()}`);

      if (response.status === 200) {
        const data = await response.arrayBuffer();
        const fonts: Font[] = [];

        // Decode the encoded font format.
        const decodeFontInfoFromArrayBuffer = (buffer: ArrayBuffer) => {
          let offset = 0;
          const bufferView = new Uint8Array(buffer);

          while (offset < bufferView.length) {
            // 1 byte for font name length.
            const languageCodeLength = bufferView[offset];
            offset += 1;
            let languageCode = "";
            for (let i = 0; i < languageCodeLength; i++) {
              languageCode += String.fromCharCode(bufferView[offset + i]);
            }
            offset += languageCodeLength;

            // 4 bytes for font data length.
            const fontDataLength = new DataView(buffer).getUint32(
              offset,
              false
            );
            offset += 4;
            const fontData = buffer.slice(offset, offset + fontDataLength);
            offset += fontDataLength;

            fonts.push({
              name: `satori_${languageCode}_fallback_${text}`,
              data: fontData,
              weight: 400,
              style: "normal",
              lang: languageCode === "unknown" ? undefined : languageCode,
            });
          }
        };

        decodeFontInfoFromArrayBuffer(data);

        return fonts;
      }
    } catch (e) {
      console.error("Failed to load dynamic font for", text, ". Error:", e);
    }
    return [];
  }
);

export async function loadGoogleFont(font: string, text?: string) {
  let url = `https://fonts.googleapis.com/css2?family=${font}`;

  if (text) {
    url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
      text
    )}`;
  }

  const css = await (
    await fetch(url, {
      headers: {
        // Make sure it returns TTF.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    })
  ).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return {
        name: font,
        data: await response.arrayBuffer(),
        style: "normal" as const,
      };
    }
  }

  throw new Error("failed to load font data");
}
