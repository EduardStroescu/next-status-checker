import { NextRequest, NextResponse } from "next/server";
import {
  getLiveReportForAllApis,
  getLiveReportForAllFrontends,
  refreshLiveReportForAllSupabaseProjects,
  storeLatestStatusResult,
} from "@/lib/server/queries";
import * as z from "zod/v4";
import { getCurrentUserWithRefreshAction } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let ownerId: number | undefined;

  const ownerFromParams = req.nextUrl.searchParams.get("ownerId");
  ownerId = z.coerce.number().safeParse(ownerFromParams).data;

  try {
    if (!ownerId) {
      const user = await getCurrentUserWithRefreshAction();
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

    await Promise.allSettled(
      results.flatMap((result) =>
        result.map((project) => storeLatestStatusResult(project))
      )
    );

    return NextResponse.json(results[0], { status: 200 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
