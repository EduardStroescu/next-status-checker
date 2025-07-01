"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface TabsProps {
  options: string[];
  onChange: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({ options, onChange, children }: TabsProps) {
  const [active, setActive] = useState(options[0]);

  return (
    <div className="flex flex-col flex-1 grow w-full h-full">
      <div className="inline-flex relative text-xs -mb-px select-none whitespace-nowrap max-w-[calc(100%-15px)] z-[1]">
        {options.map((option) => (
          <div
            title={option}
            className={cn(
              "bg-background h-5 border border-white rounded-t py-0.5 px-2 cursor-default text-ellipsis overflow-hidden",
              active === option &&
                "text-black font-bold border border-b-0 bg-white"
            )}
            key={option}
            onClick={() => {
              setActive(option);
              onChange(option);
            }}
          >
            {option}
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
