"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Copy,
  Edit,
  Check,
  ExternalLink,
  Circle,
  RefreshCw,
  Trash,
} from "lucide-react";
import { ProjectWithHistory } from "@/lib/types";
import { getImageUrl } from "@/lib/utils";
import { startTransition, useOptimistic, useState } from "react";
import Link from "next/link";
import {
  deleteProjectAction,
  refreshIndividualProjectAction,
  switchProjectStatus,
} from "@/lib/server/actions";
import EditProjectDialog from "./EditProjectDialog";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

export default function ProjectCard({
  project,
}: {
  project: ProjectWithHistory;
}) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [optimisticEnabled, switchOptimisticEnabled] = useOptimistic(
    project.enabled,
    (_, newEnabled: boolean) => newEnabled
  );
  const isProjectActive = project?.history?.[0]?.status === "Active";

  const { mutateAsync: deleteProject } = useMutation({
    mutationFn: async (projectId: ProjectWithHistory["id"]) =>
      deleteProjectAction(projectId),
    onSuccess: () => toast.success("Project deleted"),
    onError: (error) => toast.error(error.message),
  });

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

  const handleEnabledChange = async (checked: boolean) => {
    startTransition(() => {
      switchOptimisticEnabled(checked);
    });
    await switchProjectStatus(project.id, checked);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      supabase: "bg-green-100 text-green-800 hover:bg-green-200",
      api: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      frontend: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      backend: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      database: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      default: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  return (
    <Card
      className={`${
        isProjectActive ? "border-cyan-500" : "border-red-700"
      } bg-cyan-800/40 backdrop-blur-lg border-[1px] relative w-full xl:max-w-sm py-0 pb-4 gap-4 shadow-none`}
    >
      <div
        className="absolute pointer-events-none inset-0 rounded-xl animate-pulse"
        style={{
          boxShadow: `0 0 5px, 0 0 20px ${
            isProjectActive ? "var(--color-cyan-500)" : "var(--color-red-700)"
          }`,
        }}
      />
      <CardHeader className="p-0">
        <div className="relative">
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
          <div className="absolute flex items-center justify-between w-full px-3 top-3 text-xs">
            <Badge variant="secondary" className="cursor-default">
              <Circle
                className={`${
                  isProjectActive ? "fill-cyan-500" : "fill-red-700"
                }`}
              />
              {isProjectActive ? "ACTIVE" : "DOWN"}
            </Badge>
            <Link href={`/dashboard?tab=${project.category}`}>
              <Badge
                variant="secondary"
                className={getCategoryColor(project.category)}
              >
                {project.category.toUpperCase()}
              </Badge>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4">
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
            <div className="flex gap-1">
              <EditProjectDialog
                open={editModalOpen}
                setOpen={setEditModalOpen}
                project={project}
              >
                <Button variant="ghost" size="sm" aria-label="Edit project">
                  <Edit />
                  <span className="sr-only">Edit project</span>
                </Button>
              </EditProjectDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Delete project">
                    <Trash />
                    <span className="sr-only">Delete project</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your project and remove its history from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteProject(project.id)}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {optimisticEnabled ? "Enabled" : "Disabled"}
              </span>
              <Switch
                checked={optimisticEnabled}
                onCheckedChange={handleEnabledChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-sm text-muted-foreground">
              Project URL
            </span>
            <div className="flex gap-1 items-center">
              <div className="flex flex-1 items-center gap-2 px-2 bg-muted rounded-md overflow-hidden">
                <code
                  title={project.url!}
                  className="py-2 text-sm flex-1 text-nowrap overflow-x-auto"
                >
                  {project.url}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="h-6 w-6 p-0 shrink-0"
                  aria-label="Copy URL"
                >
                  {copied ? <Check className="text-green-500" /> : <Copy />}
                  <span className="sr-only">Copy URL</span>
                </Button>
              </div>
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
