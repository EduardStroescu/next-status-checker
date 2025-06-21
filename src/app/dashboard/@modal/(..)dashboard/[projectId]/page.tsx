import { ChartAreaInteractive } from "@/components/ChartAreaInteractive";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchProjectWithHistory } from "@/lib/server/actions";
import ProjectCard from "@/components/ProjectCard";
import { processHistoryForChart } from "@/lib/utils";

export default async function ProjectModal({
  params,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { projectId } = await params;

  const response = await fetchProjectWithHistory(parseInt(projectId));

  if (!response.success) return <div>Error: {response.message}</div>;

  const projectDetails = response.data;
  const projectHistory = processHistoryForChart(projectDetails.history);

  return (
    <div className="w-7xl max-w-full max-h-full border-[1px] border-cyan-500 backdrop-blur-xl rounded-xl p-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col xl:flex-row gap-2">
          <ProjectCard project={projectDetails} />
          <ChartAreaInteractive projectHistory={projectHistory.reverse()} />
        </div>
        <Card className="bg-cyan-800/40 backdrop-blur-sm">
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
