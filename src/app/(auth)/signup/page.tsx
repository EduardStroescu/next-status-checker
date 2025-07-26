"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { env } from "@/env/client";
import { signupSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod/v4";

const SIGNUP_CLOSED = !!env.NEXT_PUBLIC_SIGNUP_CLOSED;

export default function SignupPage() {
  const { mutateAsync: signUp } = useMutation({
    mutationFn: async (data: z.infer<typeof signupSchema>) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to sign up");
      }

      return res.json();
    },
    onSuccess: () => {},
    onError: (error) => toast.error(error.message),
  });

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      avatar: "",
    },
    disabled: SIGNUP_CLOSED,
  });
  const [avatar, username] = watch(["avatar", "username"]);

  const onSubmit: SubmitHandler<z.infer<typeof signupSchema>> = (data) => {
    if (SIGNUP_CLOSED) return toast.error("Signup is closed");
    signUp(data);
  };

  return (
    <div className="flex flex-col gap-16 items-center justify-center h-[100dvh]">
      <h2 className="text-6xl">Sign Up</h2>
      {SIGNUP_CLOSED && (
        <div className="flex flex-col text-red-500 text-center text-sm max-w-xs -my-10">
          <span>{"We aren't currently accepting new members."}</span>
          <span>{"Sorry for the inconvenience!"}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-w-[300px] flex flex-col gap-4"
        method="post"
        action="/api/auth/login"
      >
        <div className="space-y-2 flex flex-col items-center">
          <Label htmlFor="email">Email</Label>
          <Input
            {...register("email")}
            id="email"
            autoComplete="email"
            placeholder="John.Doe@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2 flex flex-col items-center">
          <Label htmlFor="username">Username</Label>
          <Input
            {...register("username")}
            id="username"
            autoComplete="username"
            placeholder="John"
          />
          {errors.username && (
            <p className="text-red-500 text-xs">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2 flex flex-col items-center">
          <Label htmlFor="password">Password</Label>
          <Input
            {...register("password")}
            type="password"
            id="password"
            autoComplete="current-password"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2 flex flex-col items-center">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            {...register("confirmPassword")}
            type="password"
            id="confirmPassword"
            autoComplete="off"
            placeholder="Enter your password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2 flex flex-col">
          <Label htmlFor="avatar" className="self-center">
            Avatar
          </Label>
          <div className="relative">
            <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              {...register("avatar")}
              id="avatar"
              placeholder="https://example.com/image.png"
              className="pl-10"
            />
          </div>
          {errors.avatar && (
            <p className="text-red-500 text-xs">{errors.avatar.message}</p>
          )}
          <p className="text-xs text-muted-foreground">Provide an image URL</p>

          {!!avatar && (
            <Avatar className="mx-auto size-32">
              <AvatarImage
                src={avatar}
                alt="Avatar"
                data-loaded="false"
                onLoad={(evt) =>
                  evt.currentTarget.setAttribute("data-loaded", "true")
                }
                className="data-[loaded=false]:animate-pulse data-[loaded=false]:bg-gray-500/40"
              />
              <AvatarFallback>{username?.slice(0, 1)}</AvatarFallback>
            </Avatar>
          )}
        </div>
        <Button
          disabled={isSubmitting || SIGNUP_CLOSED}
          aria-disabled={isSubmitting || SIGNUP_CLOSED}
          variant="secondary"
          type="submit"
          className="rounded-full"
        >
          {isSubmitting ? "Loading..." : "Register"}
        </Button>
        <div className="flex gap-2 items-center">
          <span className="text-xs">Already have an account?</span>
          <Link href="/login" className="text-sm text-cyan-500">
            Log In
          </Link>
        </div>
      </form>
    </div>
  );
}
