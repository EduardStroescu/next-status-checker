"use client";

import { RefreshIcon } from "./icons";
import ProjectCardMinimal from "./ProjectCardMinimal";
import { useRouter, useSearchParams } from "next/navigation";
import { ProjectsByCategory } from "@/lib/types";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { refreshAllProjects } from "@/lib/client/queries";
import { CirclePlus } from "lucide-react";
import Link from "next/link";

interface TabViewerProps {
  projects: ProjectsByCategory;
}

export default function TabViewer({ projects }: TabViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTabFromQuery = searchParams.get("tab") ?? "supabase";
  const { mutateAsync: refreshAllProjectsMutation, isPending } = useMutation({
    mutationFn: refreshAllProjects,
    onSuccess: () => {
      router.refresh();
      toast.success("Projects refreshed");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const TABS = Object.keys(projects).map(
    (key) => key[0].toUpperCase() + key.slice(1)
  );

  const handleTabClick = (tab: (typeof TABS)[number]) => {
    // Update URL query param without full reload
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("tab", tab.toLowerCase());

    window.history.replaceState(null, "", `?${newSearchParams.toString()}`);
  };

  return (
    <div className="h-full">
      <div className="rounded-t-2xl bg-background flex justify-center items-center p-2 gap-2 flex-wrap overflow-hidden">
        <ToggleGroup
          type="single"
          value={currentTabFromQuery}
          onValueChange={handleTabClick}
          variant="outline"
          className="*:data-[slot=toggle-group-item]:!px-6 flex flex-wrap"
        >
          {TABS.map((tab, idx) => (
            <ToggleGroupItem
              key={idx}
              value={tab}
              className={`${
                tab.toLowerCase() === currentTabFromQuery ? "bg-accent" : ""
              } text-xl`}
            >
              {tab}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button
          onClick={() => refreshAllProjectsMutation()}
          variant="ghost"
          size="icon"
          className="group/refresh"
          disabled={isPending}
          aria-label="Refresh projects"
        >
          <RefreshIcon
            className={`${
              isPending ? "animate-spin" : ""
            } size-7 group-hover/refresh:rotate-360 group-hover/refresh:transition-transform duration-[900ms]`}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          asChild
          aria-label="Create new project"
        >
          <Link href={`/dashboard/create?tab=${currentTabFromQuery}`}>
            <CirclePlus className="size-7 stroke-1" />
          </Link>
        </Button>
      </div>
      <div className="border-t-[1px] boder-t-[1px] border-t-cyan-400 rounded-t-2xl grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] justify-center gap-8 p-6 justify-items-center">
        {projects?.[currentTabFromQuery]?.map((project) => {
          return <ProjectCardMinimal key={project.id} project={project} />;
        })}
      </div>
    </div>
  );
}
