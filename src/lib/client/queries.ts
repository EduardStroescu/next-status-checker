import { env } from "@/env/client";
import { Project } from "../types";

export const getProjectDetails = async (projectId: string) => {
  const res = await fetch(
    `${env.NEXT_PUBLIC_BASE_URL}/api/projects/${projectId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch project details");
  }

  return (await res.json()) as Project;
};

export const refreshAllProjects = async () => {
  const response = await fetch(`${env.NEXT_PUBLIC_BASE_URL}/api/keep-alive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return response.json();
};
