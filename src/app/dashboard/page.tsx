import TabViewer from "@/components/TabViewer";
import { getAllProjects } from "@/lib/server/actions";
import { Suspense } from "react";

export default async function Dashboard() {
  const projects = await getAllProjects();

  if (!projects?.success) return <div>Error</div>;

  return (
    <Suspense fallback={null}>
      <TabViewer projects={projects.data} />
    </Suspense>
  );
}
