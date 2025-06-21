import { getCurrentUser } from "@/lib/server/helpers";
import { NextResponse } from "next/server";

export async function GET() {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ success: false }, { status: 401 });

  return NextResponse.json({ success: true }, { status: 200 });
}
