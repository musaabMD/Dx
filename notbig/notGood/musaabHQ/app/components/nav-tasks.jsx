"use client"

import * as React from "react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export function NavTasks({ tasks, selectedTaskId, onTaskSelect, onTaskToggle }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Tasks</SidebarGroupLabel>
      <SidebarMenu>
        {tasks.map((task) => (
          <SidebarMenuItem key={task.id}>
            <div
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer",
                selectedTaskId === task.id && "bg-accent"
              )}
              onClick={() => onTaskSelect(task.id)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={(checked) => {
                    onTaskToggle?.(task.id, checked)
                  }}
                />
              </div>
              <span className="flex-1 truncate">{task.title}</span>
            </div>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
