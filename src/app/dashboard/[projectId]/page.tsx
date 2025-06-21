import { ChartAreaInteractive } from "@/components/ChartAreaInteractive";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchProjectWithHistory } from "@/lib/server/actions";
import ProjectCard from "@/components/ProjectCard";
import { processHistoryForChart } from "@/lib/utils";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const response = await fetchProjectWithHistory(parseInt(projectId));

  if (!response.success) return <div>Error: {response.message}</div>;

  const projectDetails = response.data;
  const projectHistory = processHistoryForChart(projectDetails.history);

  return (
    <div className="w-full max-h-full h-full overflow-hidden p-4">
      <div className="flex flex-col gap-2 w-full h-full">
        <div className="flex flex-col xl:flex-row gap-2 ">
          <ProjectCard project={projectDetails} />
          <ChartAreaInteractive projectHistory={projectHistory.reverse()} />
        </div>
        <Card className="bg-cyan-800/40 backdrop-blur-lg h-full flex justify-center">
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable data={projectDetails.history} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
