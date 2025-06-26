"use client";

import { useCallback, useRef, useEffect, type MouseEventHandler } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function Modal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const overlay = useRef(null);
  const wrapper = useRef(null);
  const router = useRouter();

  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  const onClick: MouseEventHandler = useCallback(
    (e) => {
      if (e.target === overlay.current || e.target === wrapper.current) {
        if (onDismiss) onDismiss();
      }
    },
    [onDismiss]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    },
    [onDismiss]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return (
    <div
      ref={overlay}
      className="fixed inset-0 z-[20] flex w-screen flex-col items-center justify-around bg-black/60 duration-300 ease-in animate-in fade-in"
      onClick={onClick}
    >
      <div
        ref={wrapper}
        className={cn(
          "absolute max-w-[90dvw] w-auto max-h-[calc(100dvh-4rem)] overflow-x-hidden overflow-y-auto px-2",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
