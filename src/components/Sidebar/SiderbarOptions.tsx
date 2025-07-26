import { SidebarContent, SidebarFooter } from "../ui/sidebar";
import NavMain from "./NavMain";
import { NavUser } from "./SidebarUser";
import { groupProjectsByCategory } from "@/lib/utils";
import { SearchForm } from "./SearchForm";
import { fetchAllProjects } from "@/lib/server/queries";
import { NavTools } from "./NavTools";
import { getCurrentUser } from "@/lib/auth";

const navTools = [{ name: "OG Generator", url: "/generator/og" }];

export async function SidebarOptions() {
  const response = await fetchAllProjects();
  const user = await getCurrentUser();

  if (!response.success || !user) return null;

  const navMain = groupProjectsByCategory(response.data);

  return (
    <>
      <SearchForm searchItems={navMain} />
      <SidebarContent>
        <NavMain items={navMain} />
        <NavTools items={navTools} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </>
  );
}
