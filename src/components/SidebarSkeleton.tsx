import { Fragment } from "react";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
} from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";

export default function SidebarSkeleton() {
  return (
    <>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {Array.from({ length: 3 }).map((_, index) => (
              <Fragment key={index}>
                <SidebarMenuSkeleton key={index} showIcon />
                <SidebarMenuSub>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <SidebarMenuSkeleton key={index} showIcon />
                  ))}
                </SidebarMenuSub>
              </Fragment>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center p-2 gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex flex-col gap-3 w-full">
              <SidebarMenuSkeleton className="max-h-1" />
              <SidebarMenuSkeleton className="max-h-1" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
