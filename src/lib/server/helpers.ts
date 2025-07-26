import "server-only";

import { NextResponse } from "next/server";

export function redirectWithError(msg: string, baseUrl: string) {
  return NextResponse.redirect(
    new URL("?errors=" + encodeURIComponent(msg), baseUrl)
  );
}

type SafeResponse<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export const getServerDataSafe = async <T>(
  cb: () => Promise<T>
): Promise<SafeResponse<T>> => {
  try {
    const data = await cb();
    return { success: true, data };
  } catch (error) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error.message as string)
        : String(error);
    return { success: false, message };
  }
};
