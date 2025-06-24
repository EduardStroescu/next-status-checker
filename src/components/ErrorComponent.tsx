"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ErrorComponent({
  message,
  reset,
}: {
  message: string;
  reset?: () => void;
}) {
  const router = useRouter();

  return (
    <div className="absolute top-1/2 left-1/2">
      <Card className="-translate-y-[50%] -translate-x-[50%] max-w-[80dvw] w-sm">
        <CardHeader>
          <CardTitle>Something went wrong!</CardTitle>
          <CardDescription>
            Description:{" "}
            <span className="text-red-600 animate-pulse">{message}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-between items-center gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href="/">Return to safety</Link>
          </Button>
          <Button
            onClick={() => (reset ? reset() : router.refresh())}
            size="sm"
            className="flex-1 hover:cursor-pointer"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
