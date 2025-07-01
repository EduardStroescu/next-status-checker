import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { errors } = await searchParams;

  return (
    <div className="flex flex-col gap-16 items-center justify-center h-[100dvh]">
      <h2 className="text-6xl">Sign In</h2>
      {!!errors && <div className="text-red-500 text-sm -my-10">{errors}</div>}
      <form
        className="min-w-[300px] flex flex-col gap-8"
        method="post"
        action="/api/auth/login"
      >
        <Label htmlFor="email" className="flex flex-col gap-2">
          <span className="text-xl">Email</span>
          <Input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            placeholder="Enter your email"
          />
        </Label>
        <Label htmlFor="password" className="flex flex-col gap-2">
          <span className="text-xl">Password</span>
          <Input
            type="password"
            id="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="Enter your password"
          />
        </Label>
        <Button variant="secondary" type="submit" className="rounded-full">
          Proceed
        </Button>
        <div className="flex gap-2 items-center">
          <span className="text-xs">New to StatuChecker?</span>
          <Link href="/signup" className="text-sm text-cyan-500">
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}
