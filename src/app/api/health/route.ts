import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "Instance is healthy!" },
    { status: 200 }
  );
}
