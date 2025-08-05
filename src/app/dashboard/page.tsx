import ErrorComponent from "@/components/ErrorComponent";
import TabViewer from "@/components/TabViewer";
import { getAllProjects } from "@/lib/server/queries";

export default async function Dashboard() {
  const projects = await getAllProjects();

  if (!projects.success) return <ErrorComponent message={projects.message} />;

  return <TabViewer projects={projects.data} />;
}
