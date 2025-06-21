"use client";

import { Maximize2, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function MaximizeModal() {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="relative w-[calc(100%-1rem)] h-4">
      <div className="flex gap-2 absolute right-0 z-[10] top-0">
        <a
          aria-label="Maximize Modal"
          className="bg-white rounded-full p-1.5"
          href={`${pathname}?${search.toString()}`}
        >
          <Maximize2 className="stroke-black size-5" />
        </a>
        <button
          onClick={handleClose}
          aria-label="Close Modal"
          className="bg-white rounded-full p-1.5 hover:cursor-pointer"
        >
          <X className="stroke-black size-5" />
        </button>
      </div>
    </div>
  );
}
