import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getBreadcrumbs } from "../utils";
import { getProjectDetails } from "../client/queries";

export function useBreadcrumbs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTabFromQuery = searchParams.get("tab") ?? "supabase";
  const crumbs = getBreadcrumbs(pathname);
  const isActualProjectIdx = crumbs.findIndex(
    (crumb) => !isNaN(Number(crumb.label))
  );

  const { data: project } = useQuery({
    queryKey: ["projectDetails", crumbs[isActualProjectIdx]?.label],
    queryFn: () => getProjectDetails(crumbs[isActualProjectIdx]?.label),
    enabled: isActualProjectIdx !== -1,
  });

  return useMemo(
    () =>
      crumbs.map((crumb, idx) =>
        idx === isActualProjectIdx
          ? {
              label: project?.name ? project.name : "",
              href: crumb.href + `?tab=${currentTabFromQuery || "supabase"}`,
            }
          : {
              label: crumb.label,
              href: crumb.href + `?tab=${currentTabFromQuery || "supabase"}`,
            }
      ),

    [crumbs, project?.name, currentTabFromQuery, isActualProjectIdx]
  );
}
