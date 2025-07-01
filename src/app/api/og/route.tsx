import { loadGoogleFont } from "@/app/generator/og/utils";
import { cn } from "@/lib/utils";
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const runtime = "edge";

const ogSchema = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
  containerClass: z.string().optional(),
  containerBackground: z.string().optional(),
  title: z.string().optional(),
  titleClass: z.string().optional(),
  description: z.string().optional(),
  descriptionClass: z.string().optional(),
  fontName: z.union([z.string(), z.array(z.string())]).optional(),
});

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const parsedParams = ogSchema.safeParse(Object.fromEntries(searchParams));

  if (!parsedParams.success)
    return NextResponse.json("Invalid search parameters", { status: 400 });

  const {
    width,
    height,
    containerClass,
    containerBackground,
    title,
    titleClass,
    description,
    descriptionClass,
    fontName,
  } = parsedParams.data;

  const fonts = await Promise.all(
    Array.isArray(fontName)
      ? fontName.map(async (font) =>
          loadGoogleFont(
            font,
            (title || "No Title Provided") + " " + (description || "").trim()
          )
        )
      : [
          await loadGoogleFont(
            fontName || "Rye",
            (title || "No Title Provided") + " " + (description || "").trim()
          ),
        ]
  );

  try {
    return new ImageResponse(
      (
        <div
          tw={cn(
            "relative w-full h-full flex flex-col items-center justify-center overflow-hidden p-10",
            containerClass
          )}
        >
          {/* Blurred background layer */}
          <div
            tw="flex absolute inset-0"
            style={{
              ...(containerBackground && {
                filter: "blur(2px)",
                backgroundImage: `url("${containerBackground}")`,
                backgroundSize: "cover",
              }),
            }}
          >
            {/* Tinted glass overlay */}
            <div tw="w-full h-full bg-black/40" />
          </div>

          <h1 tw={cn("text-center text-8xl", titleClass)}>
            {title || "No Title Provided"}
          </h1>
          {!!description && (
            <p tw={cn("text-center mx-24 text-2xl", descriptionClass)}>
              {description}
            </p>
          )}
        </div>
      ),
      {
        width: width || 1200,
        height: height || 630,
        fonts,
      }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json("Could not generate image", { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const template =
  "http://localhost:3000/api/og?title=StatusChecker&containerClass=text-white&description=Track%20the%20live%20progress%20of%20your%20projects%20at%20a%20glance.%20Instantly%20see%20what's%20on%20track,%20delayed,%20or%20completed%20%E2%80%94%20all%20in%20one%20place.&containerBackground=https://images.tmcnet.com/tmc/misc/articles/image/2025-may/7624642146-cybersecurity-IoT-network-supersize-1200x630.jpg";
