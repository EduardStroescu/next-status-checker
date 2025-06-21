"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Database, Globe, ImageIcon } from "lucide-react";
import z from "zod/v4";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProjectAction } from "@/lib/server/actions";

const createProjectSchema = z.object({
  name: z.string({ error: "A project name is required" }).min(1),
  url: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .optional()
    .nullable(),
  healthCheckUrl: z
    .string()
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
  category: z.string({ error: "Please select a category" }),
  enabled: z.boolean(),
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

export default function CreateProjectCard() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      url: "",
      healthCheckUrl: "",
      image: "",
      category: "",
      enabled: true,
      dbURL: "",
      dbKey: "",
    },
  });
  const [image, name, category] = watch(["image", "name", "category"]);

  const { mutateAsync: createProject } = useMutation({
    mutationFn: async (data: z.infer<typeof createProjectSchema>) =>
      createProjectAction(data),
    onSuccess: () => {
      toast.success("Project created");
      router.back();
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => reset(),
  });

  const categories = [
    { value: "frontend", label: "Web Application" },
    { value: "api", label: "API Service" },
    { value: "supabase", label: "Supabase Project" },
  ];

  const onSubmit: SubmitHandler<z.infer<typeof createProjectSchema>> = async (
    data
  ) => createProject(data);

  const isSupabase = category === "supabase";

  return (
    <Card className="w-full max-w-2xl mx-auto p-4 bg-cyan-800/40 backdrop-blur-lg border-[1px]">
      <CardHeader className="space-y-1 px-0 md:px-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Create New Project</CardTitle>
            <CardDescription>
              Add a new project to your dashboard with monitoring and
              configuration
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="gap-4 flex flex-col">
        <CardContent className="space-y-6 px-0 md:px-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                {...register("name")}
                id="name"
                placeholder="My Awesome Project"
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Project URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                    value={field.value}
                    onValueChange={field.onChange}
                    required
                  >
                    <SelectTrigger>
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
          {!!category && (
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
                    <Label htmlFor="dburl">Database URL</Label>
                    <Input
                      {...register("dbURL")}
                      id="dbURL"
                      placeholder="postgresql://..."
                    />
                    {errors.dbURL && (
                      <p className="text-red-500 text-xs">
                        {errors.dbURL.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dbkey">Database Key</Label>
                    <Input
                      {...register("dbKey")}
                      id="dbKey"
                      placeholder="Your Supabase anon key"
                      className="min-h-[80px] font-mono text-sm"
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
            {!!image && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={name + " project image"}
                  data-loaded="false"
                  onLoad={(evt) =>
                    evt.currentTarget.setAttribute("data-loaded", "true")
                  }
                  className={`${
                    !!image ? "" : "hidden"
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
                  id="enabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            onClick={() => router.back()}
            type="button"
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button disabled={isSubmitting} type="submit" className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            {isSubmitting ? "Loading..." : "Create Project"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
