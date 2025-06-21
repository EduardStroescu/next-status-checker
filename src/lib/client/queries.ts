import { Project } from "../types";

export const getProjectDetails = async (projectId: string) => {
  const res = await fetch(`/api/projects/${projectId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch project details");
  }

  return (await res.json()) as Project;
};

export const refreshAllProjects = async () => {
  const response = await fetch("/api/keep-alive", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return response.json();
};
