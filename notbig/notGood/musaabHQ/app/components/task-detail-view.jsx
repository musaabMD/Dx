"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckIcon, TrashIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function TaskDetailView({ task, onTaskUpdate, onTaskDelete }) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [project, setProject] = React.useState("")
  const [urgency, setUrgency] = React.useState(false)
  const [importance, setImportance] = React.useState(false)
  const [dueDate, setDueDate] = React.useState("")

  React.useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setProject(task.project || "")
      setUrgency(task.urgency ?? false)
      setImportance(task.importance ?? false)
      setDueDate(task.dueDate || "")
    }
  }, [task])

  const handleSave = async () => {
    if (task) {
      const taskId = task._id || task.id
      await onTaskUpdate(taskId, {
        title,
        description,
        project,
        urgency,
        importance,
        dueDate: dueDate || undefined
      })
    }
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a task to view details
      </div>
    )
  }

  const handleDelete = async () => {
    if (task && confirm(`Are you sure you want to delete "${task.title}"?`)) {
      const taskId = task._id || task.id
      await onTaskDelete?.(taskId)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-auto">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <Checkbox
            checked={task.completed}
            onCheckedChange={async (checked) => {
              const taskId = task._id || task.id
              await onTaskUpdate(taskId, { completed: checked })
            }}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-semibold border-none p-0 h-auto focus-visible:ring-0 flex-1"
              onBlur={handleSave}
            />
            {task && onTaskDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={handleDelete}
                title="Delete task"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-muted-foreground mb-4 border-none p-0 resize-none focus-visible:ring-0"
            rows={2}
            onBlur={handleSave}
          />
          <div className="flex items-center gap-2 mb-4">
            <Input
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="Project/Category"
              className="w-auto border-none p-0 h-auto focus-visible:ring-0"
              onBlur={handleSave}
            />
            {task.dueDate && (
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-auto border-none p-0 h-auto focus-visible:ring-0"
                onBlur={handleSave}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Label>Priority</Label>
        {/* Urgent Checkbox */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center w-5 h-5 rounded border cursor-pointer transition-colors",
              urgency
                ? "bg-foreground border-foreground text-background"
                : "bg-background border-border text-muted-foreground"
            )}
            onClick={async () => {
              setUrgency(!urgency)
              const taskId = task._id || task.id
              await onTaskUpdate(taskId, { urgency: !urgency })
            }}
          >
            {urgency && <CheckIcon className="w-3.5 h-3.5" />}
          </div>
          <Label className="cursor-pointer">Urgent</Label>
        </div>

        {/* Important Checkbox */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center w-5 h-5 rounded border cursor-pointer transition-colors",
              importance
                ? "bg-foreground border-foreground text-background"
                : "bg-background border-border text-muted-foreground"
            )}
            onClick={async () => {
              setImportance(!importance)
              const taskId = task._id || task.id
              await onTaskUpdate(taskId, { importance: !importance })
            }}
          >
            {importance && <CheckIcon className="w-3.5 h-3.5" />}
          </div>
          <Label className="cursor-pointer">Important</Label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Generated Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {task.aiDetails || "No AI generated details available."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
