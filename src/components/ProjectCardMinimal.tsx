"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ExternalLink, Circle, RefreshCw } from "lucide-react";
import { ProjectWithHistory } from "@/lib/types";
import { getImageUrl, getLastCheckedText } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { refreshIndividualProjectAction } from "@/lib/server/actions";

export default function ProjectCardMinimal({
  project,
}: {
  project: ProjectWithHistory;
}) {
  const searchParams = useSearchParams();
  const currentTabFromQuery = searchParams.get("tab") ?? "supabase";
  const [copied, setCopied] = useState(false);
  const isProjectActive = project.history?.[0]?.status === "Active";

  const handleCopyUrl = async () => {
    if (!project.url) return;
    try {
      await navigator.clipboard.writeText(project.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL to clipboard.");
    }
  };

  return (
    <Card
      className={`${
        isProjectActive ? "border-cyan-500" : "border-red-700"
      } bg-cyan-800/40 backdrop-blur-lg border-[1px] relative w-full max-w-sm py-0 pb-1.5 gap-0 shadow-none`}
    >
      <div
        className="absolute pointer-events-none inset-0 rounded-xl animate-pulse"
        style={{
          boxShadow: `0 0 5px, 0 0 20px ${
            isProjectActive ? "var(--color-cyan-500)" : "var(--color-red-700)"
          }`,
        }}
      />
      <CardHeader className="p-0 relative">
        <Link
          href={`/dashboard/${project.id}?tab=${
            currentTabFromQuery || "supabase"
          }
      `}
        >
          <Image
            src={getImageUrl(project)}
            alt={project.name}
            data-loaded="false"
            onLoad={(evt) =>
              evt.currentTarget.setAttribute("data-loaded", "true")
            }
            width={300}
            height={200}
            className="data-[loaded=false]:animate-pulse data-[loaded=false]:bg-gray-500/40 w-full h-48 object-cover rounded-t-xl"
            priority
          />
        </Link>
        <div className="flex justify-between items-center w-full cursor-default absolute px-3 top-3 text-xs">
          <Badge variant="secondary">
            <Circle
              className={`${
                isProjectActive ? "fill-cyan-500" : "fill-red-700"
              }`}
            />
            {isProjectActive ? "ACTIVE" : "DOWN"}
          </Badge>
          <Badge variant="default">{getLastCheckedText(project)}</Badge>
        </div>
      </CardHeader>

      <CardContent className="px-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-lg leading-tight">
                {project.name}
              </h3>
              <Button
                aria-label="Refresh project"
                onClick={() =>
                  refreshIndividualProjectAction(project.id, project.category)
                }
                variant="ghost"
                size="sm"
                className="group/refresh"
              >
                <RefreshCw className="size-3.5 group-hover/refresh:rotate-360 group-hover/refresh:transition-transform duration-1000" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                aria-label="Copy URL"
                variant="default"
                size="sm"
                onClick={handleCopyUrl}
                className="h-6 w-6 p-0 shrink-0"
              >
                {copied ? <Check className="text-green-500" /> : <Copy />}
                <span className="sr-only">Copy URL</span>
              </Button>
              <Button variant="ghost" size="sm" asChild aria-label="Open URL">
                <a
                  href={project.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
