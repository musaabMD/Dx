"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrashIcon, SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProjectsDisplay({ projects, selectedProject, onProjectSelect, onProjectDelete }) {
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const filteredProjects = React.useMemo(() => {
    if (!searchQuery.trim()) return projects
    const query = searchQuery.toLowerCase()
    return projects.filter(project => 
      project.name.toLowerCase().includes(query)
    )
  }, [projects, searchQuery])
  const getProgressColor = (percentage) => {
    return "bg-foreground/50"
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-border bg-background">
        <h2 className="text-lg sm:text-xl font-semibold">Projects ({projects.length})</h2>
      </div>
      
      <div className="px-4 sm:px-6 py-3 border-b border-border bg-background">
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-background border-border/50"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((item) => {
            const percentage = item.percentage || 0
            const correct = item.correct || 0
            const total = item.total || 0
            const itemId = item._id || item.id
            const isSelected = selectedProject?.name === item.name || selectedProject?._id === item._id || selectedProject?.id === itemId

            return (
              <div
                key={itemId}
                className={cn(
                  "border rounded-md p-3 sm:p-4 transition-all cursor-pointer relative group",
                  "bg-background border-border/50",
                  "hover:bg-muted/50",
                  isSelected && "bg-muted border-border"
                )}
                onClick={() => onProjectSelect?.(item)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  onClick={async (e) => {
                    e.stopPropagation()
                    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
                      await onProjectDelete?.(item.name)
                    }
                  }}
                >
                  <TrashIcon className="h-3 w-3" />
                </Button>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{percentage}%</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {correct} of {total} Tasks
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all bg-foreground/50"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-8">
              No projects found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
