"use client"

import Link from "next/link"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function NavProjects({ projects }) {
  const getProgressColor = (percentage) => {
    if (percentage < 60) return "bg-red-500"
    if (percentage >= 90) return "bg-green-500"
    return "bg-orange-500"
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          const percentage = item.percentage || 0
          const correct = item.correct || 0
          const total = item.total || 0

          return (
            <SidebarMenuItem key={item.name}>
              <Link href={item.url} className="block w-full">
                <div className="flex flex-col gap-2 p-2 rounded-md hover:bg-accent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{percentage}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {correct} of {total} Correct
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        getProgressColor(percentage)
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </Link>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
