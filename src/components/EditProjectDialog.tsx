"use client";

import { Database, Globe, ImageIcon, Save } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ProjectWithHistory, UpdateProject } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v4";
import { Dispatch, ReactNode } from "react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { updateProjectAction } from "@/lib/server/actions";

const editProjectSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  url: z.url().optional(),
  healthCheckUrl: z
    .url()
    .transform((val) => (val === "" ? null : val))
    .optional()
    .nullable(),
  image: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional()
    .refine((val) => val === null || z.url().safeParse(val).success, {
      error: "Must be a valid URL or empty",
    }),
  category: z.string().optional(),
  enabled: z.boolean().optional(),
  dbURL: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .optional()
    .nullable(),
  dbKey: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .optional()
    .nullable(),
});

export default function EditProjectDialog({
  children,
  project,
  open,
  setOpen,
}: {
  children: ReactNode;
  project: ProjectWithHistory;
  open: boolean;
  setOpen: Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    handleSubmit,
    register,
    control,
    formState: { isSubmitting, errors },
    reset,
    watch,
  } = useForm<z.infer<typeof editProjectSchema>>({
    resolver: zodResolver(editProjectSchema),
    mode: "onSubmit",
    defaultValues: project,
    values: project,
  });
  const [image, name, category] = watch(["image", "name", "category"]);

  const { mutateAsync: updateProject } = useMutation({
    mutationFn: async (data: UpdateProject) => updateProjectAction(data),
    onSuccess: () => {
      setOpen(false);
      toast.success("Project updated");
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => reset(),
  });

  const categories = [
    { value: "frontend", label: "Web Application" },
    { value: "api", label: "API Service" },
    { value: "supabase", label: "Supabase Project" },
  ];

  const onSubmit: SubmitHandler<z.infer<typeof editProjectSchema>> = (data) => {
    const newData: UpdateProject = { ...data };

    (Object.keys(newData) as (keyof typeof newData)[]).forEach((key) => {
      if (key !== "id" && newData[key] === project[key]) delete newData[key];
    });

    if (Object.keys(data).length === 0) return toast.info("No changes made");
    updateProject(data);
  };

  const isSupabase = category === "supabase";

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-cyan-800/40 backdrop-blur-lg border-[1px]">
        <form onSubmit={handleSubmit(onSubmit)} className="gap-4 flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <DialogDescription hidden />
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                {...register("name")}
                id="name"
                placeholder="My Awesome Project"
                autoComplete="off"
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Project URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("url")}
                  id="url"
                  placeholder="https://myproject.com"
                  className="pl-10"
                />
              </div>
              {errors.url && (
                <p className="text-red-500 text-xs">{errors.url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    name="category"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select project category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-red-500 text-xs">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          {/* Conditional Fields */}
          {category && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-primary" />
                <h3 className="font-medium">
                  {isSupabase
                    ? "Database Configuration"
                    : "Health Check Configuration"}
                </h3>
              </div>

              {isSupabase ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dbUrl">Database URL</Label>
                    <Input
                      {...register("dbURL")}
                      id="dbUrl"
                      placeholder="postgresql://..."
                    />
                    {errors.dbURL && (
                      <p className="text-red-500 text-xs">
                        {errors.dbURL.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dbKey">Database Key</Label>
                    <Input
                      {...register("dbKey")}
                      id="dbKey"
                      placeholder="Your Supabase anon key"
                    />
                    {errors.dbKey && (
                      <p className="text-red-500 text-xs">
                        {errors.dbKey.message}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="healthCheckUrl">Health Check URL</Label>
                  <Input
                    {...register("healthCheckUrl")}
                    id="healthCheckUrl"
                    placeholder="https://myproject.com/health"
                  />
                  {errors.healthCheckUrl && (
                    <p className="text-red-500 text-xs">
                      {errors.healthCheckUrl.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Project Image</Label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...register("image")}
                id="image"
                placeholder="https://example.com/image.png"
                className="pl-10"
              />
            </div>
            {errors.image && (
              <p className="text-red-500 text-xs">{errors.image.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Provide an image URL (recommended: 1200x630px)
            </p>
            {image && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  data-loaded="false"
                  onLoad={(evt) =>
                    evt.currentTarget.setAttribute("data-loaded", "true")
                  }
                  alt={name + " project image"}
                  className={`${
                    image ? "" : "hidden"
                  } data-[loaded=false]:animate-pulse data-[loaded=false]:bg-gray-500/40 max-h-48 object-cover mx-auto rounded-xl`}
                />
              </>
            )}
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="enabled" className="text-base font-medium">
                Enable Project
              </Label>
              <p className="text-sm text-muted-foreground">
                Project will be active and monitored when enabled
              </p>
            </div>
            <Controller
              name="enabled"
              control={control}
              render={({ field }) => (
                <Switch
                  name="enabled"
                  id="enabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          <DialogFooter className="flex gap-3">
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              <Save />
              {isSubmitting ? "Loading..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
