import Breadcrumbs from "@/components/Breadcrumbs";
import { AppSidebar } from "@/components/Sidebar/DashboardSidebar";
import { SidebarOptions } from "@/components/Sidebar/SiderbarOptions";
import SidebarSkeleton from "@/components/SidebarSkeleton";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Suspense } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function DashboardLayout({
  children,
  modal,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar>
        <Suspense fallback={<SidebarSkeleton />}>
          <SidebarOptions />
        </Suspense>
      </AppSidebar>
      <SidebarInset>
        <header className="flex border-b h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Suspense fallback={null}>
              <Breadcrumbs />
            </Suspense>
          </div>
        </header>
        <div className="flex flex-1 flex-col p-4">
          <div className="relative bg-pattern min-h-full flex-1 rounded-2xl md:min-h-min flex flex-col border-[1px] border-solid border-cyan-400">
            {children}
            {modal}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
