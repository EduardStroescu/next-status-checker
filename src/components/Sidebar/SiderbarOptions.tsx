import { fetchAllProjects } from "@/lib/server/actions";
import { SidebarContent, SidebarFooter } from "../ui/sidebar";
import NavMain from "./NavMain";
import { NavUser } from "./SidebarUser";
import { groupProjectsByCategory } from "@/lib/utils";
import { getCurrentUser } from "@/lib/server/helpers";
import { Suspense } from "react";

export async function SidebarOptions() {
  const response = await fetchAllProjects();
  const user = await getCurrentUser();

  if (!response.success || !user) return null;

  const navMain = groupProjectsByCategory(response.data);

  const navUser = {
    username: user.username,
    email: user.email,
    avatar: user.avatar ?? undefined,
  };

  return (
    <Suspense fallback={null}>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Suspense>
  );
}
