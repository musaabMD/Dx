"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Database,
  Gift,
  HelpCircle,
  MessageSquareText,
  PlayCircle,
  Settings,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { LnkbaseMark } from "@/components/brand";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const mainNav = [
  { label: "Chat", href: "/dashboard/chat", icon: MessageSquareText },
  { label: "Playground", href: "/admin/playground", icon: PlayCircle },
  { label: "Conversations", href: "/dashboard/activity", icon: MessageSquareText },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Audience", href: "/dashboard/contacts", icon: Users },
];

const libraryNav = [
  { label: "Sources", href: "/dashboard/data-sources", icon: Database },
  { label: "Integrations", href: "/dashboard/widgets", icon: Wrench },
  { label: "Actions", href: "/dashboard/actions", icon: Activity },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function AppSidebar({
  agentCount,
}: React.ComponentProps<typeof Sidebar> & {
  agentCount?: number;
}) {
  const pathname = usePathname();

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="border-r border-black/[0.07] bg-[#f6f6f4]"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Lnkbase"
              render={<Link href="/dashboard" />}
              className="h-11 text-[#111111] hover:bg-white"
            >
              <LnkbaseMark />
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">Lnkbase</span>
                <span className="truncate text-xs text-[#777780]">Workspace</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup
          label="Workspace"
          items={mainNav}
          isActive={(href) =>
            pathname === href ||
            pathname.startsWith(`${href}/`)
          }
        />
        <NavGroup
          label="Library"
          items={libraryNav}
          isActive={(href) => pathname === href || pathname.startsWith(href)}
        />
      </SidebarContent>

      <SidebarFooter className="gap-3 border-t border-black/[0.07] p-3">
        <div className="space-y-2 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between text-xs text-[#777780]">
            <span>Usage</span>
            <span>{agentCount ?? 1} of 25 agents</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.08]">
            <div className="h-full w-[18%] rounded-full bg-[#2563eb]" />
          </div>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Upgrade plan"
              render={<Link href="/pricing" />}
              className="h-9 justify-center bg-[#111111] font-semibold text-white hover:bg-[#2b2b2b] hover:text-white group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0"
            >
              <Sparkles size={15} />
              <span className="group-data-[collapsible=icon]:hidden">Upgrade plan</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex items-center justify-between px-1 text-[#777780] group-data-[collapsible=icon]:justify-center">
          <Gift size={17} />
          <HelpCircle size={17} className="group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function NavGroup({
  label,
  items,
  isActive,
}: {
  label: string;
  items: typeof mainNav;
  isActive: (href: string) => boolean;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = isActive(item.href);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.label}
                  render={<Link href={item.href} />}
                  className={
                    active
                      ? "bg-[#eaf1ff] text-[#2563eb] hover:bg-[#eaf1ff] hover:text-[#2563eb]"
                      : "text-[#4c4c55] hover:bg-white hover:text-[#111111]"
                  }
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
