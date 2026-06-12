"use client"

import Link from "next/link"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useCounts } from "@/contexts/counts-context"
import { cn } from "@/lib/utils"

export function NavMain({ items }) {
  const counts = useCounts()
  
  const getCount = (title) => {
    if (title === "Projects") return counts.projects || 0
    if (title === "Tasks") return counts.tasks || 0
    if (title === "Read") return counts.articles || 0
    if (title === "Books") return counts.books || 0
    return 0
  }
  
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const count = getCount(item.title)
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                  {count > 0 && (
                    <span className={cn(
                      "ml-auto text-xs font-medium text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
