"use client"

import * as React from "react"
import Link from "next/link"
import {
  Command,
  Frame,
  Map,
  PieChart,
  FolderKanban,
  CheckSquare,
  Book,
  Library,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { CountsProvider } from "@/contexts/counts-context"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export const projectsData = [
  {
    name: "Anesthesia",
    url: "#",
    icon: Frame,
    percentage: 85,
    correct: 78,
    total: 92,
  },
  {
    name: "Sales & Marketing",
    url: "#",
    icon: PieChart,
    percentage: 45,
    correct: 27,
    total: 60,
  },
  {
    name: "Travel",
    url: "#",
    icon: Map,
    percentage: 92,
    correct: 110,
    total: 120,
  },
]

const data = {
  navMain: [
    {
      title: "Projects",
      url: "/projects",
      icon: FolderKanban,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: CheckSquare,
    },
    {
      title: "Read",
      url: "/read",
      icon: Book,
    },
    {
      title: "Books",
      url: "/books",
      icon: Library,
    },
  ],
}

export function AppSidebar({ counts, ...props }) {
  return (
    <CountsProvider counts={counts || {}}>
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Musaab</span>
                    <span className="truncate text-xs">HQ</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>
      </Sidebar>
    </CountsProvider>
  )
}
