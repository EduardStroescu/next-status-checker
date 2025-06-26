"use client";

import { ChevronRight, LucideProps, Monitor, Server, Zap } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { SafeProject } from "@/lib/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const CATEGORY_ICONS: Record<
  string,
  ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >
> = {
  supabase: Zap,
  api: Server,
  frontend: Monitor,
};

export default function NavMain({
  items,
}: {
  items: {
    name: string;
    url: string;
    isActive?: boolean;
    items?: (SafeProject & { internalURL: string })[];
  }[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleParamNavigation = (
    e: {
      preventDefault: () => void;
    },
    param: string
  ) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", param.toLowerCase());
    if (pathname !== "/dashboard")
      return router.push(`/dashboard?${params.toString()}`);

    if (!document.startViewTransition) {
      return window.history.replaceState(
        null,
        "",
        `/dashboard?${params.toString()}`
      );
    }

    document.startViewTransition(() => {
      window.history.replaceState(null, "", `/dashboard?${params.toString()}`);
    });
  };

  let totalDelaySoFar = 0;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, itemIdx) => {
          const childCount = item.items?.length || 0;
          const parentDelay = totalDelaySoFar;
          const childBaseDelay = parentDelay + 200;
          totalDelaySoFar += 200 + childCount * 100;

          return (
            <Collapsible
              key={item.name}
              asChild
              defaultOpen={true}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.name}
                    className="w-full starting:opacity-0 opacity-100 transition-opacity "
                    style={{
                      transitionDelay: `${parentDelay}ms`,
                      animationDelay: `${itemIdx * 100}ms`,
                      transitionDuration: "250ms",
                    }}
                  >
                    {(() => {
                      const Icon = CATEGORY_ICONS[item.name.toLowerCase()];
                      return Icon ? <Icon /> : null;
                    })()}
                    <Link
                      href={`/dashboard?tab=${item.url}`}
                      onClick={(e) => e.stopPropagation()}
                      onNavigate={(e) => handleParamNavigation(e, item.url)}
                      className="w-full py-2"
                    >
                      {item.name}
                    </Link>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem, subItemIdx) => (
                      <SidebarMenuSubItem key={subItem.name}>
                        <SidebarMenuSubButton asChild>
                          <Link
                            href={`${
                              subItem.internalURL
                            }?${searchParams.toString()}`}
                            className="starting:opacity-0 opacity-100 transition-opacity "
                            style={{
                              transitionDelay: `${
                                childBaseDelay + subItemIdx * 100
                              }ms`,
                              animationDelay: `${itemIdx * 100}ms`,
                              transitionDuration: "250ms",
                            }}
                          >
                            <span>{subItem.name}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
