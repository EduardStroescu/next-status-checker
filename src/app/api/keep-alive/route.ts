import { NextRequest, NextResponse } from "next/server";
import {
  getLiveReportForAllApis,
  getLiveReportForAllFrontends,
  refreshLiveReportForAllSupabaseProjects,
  storeLatestStatusResult,
} from "@/lib/server/queries";
import { getCurrentUser } from "@/lib/server/helpers";
import * as z from "zod/v4";

export async function POST(req: NextRequest) {
  let ownerId: number | undefined;

  const ownerFromParams = req.nextUrl.searchParams.get("ownerId");
  ownerId = z.coerce.number().safeParse(ownerFromParams).data;

  try {
    if (!ownerId) {
      const user = await getCurrentUser();
      if (!user)
        return NextResponse.json(
          { error: "Not logged in and no ownerId provided" },
          { status: 401 }
        );
      ownerId = user.id;
    }

    const results = await Promise.all([
      refreshLiveReportForAllSupabaseProjects(ownerId),
      getLiveReportForAllFrontends(ownerId),
      getLiveReportForAllApis(ownerId),
    ]);

    setTimeout(() => {
      Promise.allSettled(
        results.flatMap((result) =>
          result.map((project) =>
            storeLatestStatusResult(project).catch((err) => {
              console.error("Failed to store:", project.name, err);
            })
          )
        )
      );
    }, 0);

    return NextResponse.json(results[0], { status: 200 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
