"use client";

import ErrorComponent from "@/components/ErrorComponent";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorComponent
      message={
        process.env.NODE_ENV === "production"
          ? error.digest
            ? `Please include the error code in your support ticket in order for our team to investigate into the cause of the problem. Code: ${error.digest}`
            : "We'll look into the issue on our side as soon as possible. Please try again later!"
          : error.message
      }
      reset={reset}
    />
  );
}
