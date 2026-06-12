"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { XIcon, TrashIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProjectDetailView({ project, onClose, onDelete }) {
  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a project to view details
      </div>
    )
  }

  // Sample tasks for the project
  const [tasks, setTasks] = React.useState([
    { id: "1", title: "Task 1", completed: false },
    { id: "2", title: "Task 2", completed: true },
    { id: "3", title: "Task 3", completed: false },
  ])

  const handleTaskToggle = (taskId, completed) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed } : task
      )
    )
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      await onDelete?.(project.name)
      onClose()
    }
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-lg m-4 shadow-sm border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{project.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleDelete}
            title="Delete project"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
            title="Close"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-semibold">{project.percentage}%</div>
            <div className="text-xs text-muted-foreground">Progress</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">{project.correct}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">{project.total}</div>
            <div className="text-xs text-muted-foreground">Total Tasks</div>
          </div>
        </div>
        <div className="mt-4 w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all bg-foreground/40"
            )}
            style={{ width: `${project.percentage}%` }}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto p-4">
        <h3 className="font-semibold mb-4">Tasks</h3>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) => {
                  handleTaskToggle(task.id, checked)
                }}
              />
              <span className={cn(
                "flex-1 text-sm",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
