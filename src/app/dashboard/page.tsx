import TabViewer from "@/components/TabViewer";
import { getAllProjects } from "@/lib/server/queries";

export default async function Dashboard() {
  const projects = await getAllProjects();

  if (!projects?.success) return <div>Error</div>;

  return <TabViewer projects={projects.data} />;
}
