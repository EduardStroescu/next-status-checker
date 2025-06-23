import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProjectHistory, ProjectWithHistory, SafeProject } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLastCheckedText(project: ProjectWithHistory) {
  if (!project.history?.[0]?.lastChecked) return null;

  const date = new Date(project.history[0].lastChecked);
  return date.toLocaleString("en-US", {
    timeZone: "Europe/Bucharest",
    hour12: false,
  });
}

export function getImageUrl(project: ProjectWithHistory) {
  return (
    project?.image ||
    "https://placehold.co/2000x3000/070B11/06b6d4?text=A+picture+is+worth\\na+thousand+words,\\nbut+not+today.&font=sans"
  );
}

export function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    return {
      label: segment[0].toUpperCase() + segment.slice(1),
      href,
    };
  });

  return crumbs;
}

export function groupProjectsByCategory(projects: SafeProject[]) {
  const grouped = new Map<string, (SafeProject & { internalURL: string })[]>();

  for (const project of projects) {
    const category = project.category.toLowerCase();
    if (!grouped.has(category)) grouped.set(category, []);

    grouped.get(category)!.push({
      ...project,
      internalURL: `/dashboard/${project.id}`,
    });
  }

  return Array.from(grouped.entries()).map(([category, items]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    items,
    url: category,
  }));
}

export function processHistoryForChart(history: ProjectHistory[]) {
  return history.map((item) => ({
    ...item,
    status: item.status === "Active" ? 1 : 0.2,
    lastChecked: new Date(item.lastChecked).toISOString().slice(0, 10),
  }));
}

type CustomErrorOptions = {
  statusCode: number;
};

export class CustomError extends Error {
  customOptions?: CustomErrorOptions;

  constructor(message: string, customOptions?: CustomErrorOptions) {
    super(message);
    this.customOptions = customOptions;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
