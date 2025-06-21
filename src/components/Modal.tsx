"use client";

import { useCallback, useRef, useEffect, type MouseEventHandler } from "react";
import { useRouter } from "next/navigation";

export function Modal({ children }: { children: React.ReactNode }) {
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
    [onDismiss, overlay, wrapper]
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
      className="fixed inset-0 z-[20] flex w-screen flex-col items-center justify-around bg-black/60 duration-300 ease-in-out animate-in fade-in"
      onClick={onClick}
    >
      <div
        ref={wrapper}
        className="absolute max-w-[90dvw] w-auto max-h-[calc(100dvh-4rem)] overflow-x-hidden overflow-y-auto px-2"
      >
        {children}
      </div>
    </div>
  );
}
