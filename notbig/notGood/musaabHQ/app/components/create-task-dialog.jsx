"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function CreateTaskDialog({ open, onOpenChange, onTaskCreate }) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [project, setProject] = React.useState("")
  const [urgency, setUrgency] = React.useState(false)
  const [importance, setImportance] = React.useState(false)
  const [dueDate, setDueDate] = React.useState("")

  React.useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setTitle("")
      setDescription("")
      setProject("")
      setUrgency(false)
      setImportance(false)
      setDueDate("")
    }
  }, [open])

  const handleSave = async () => {
    if (!title.trim()) return
    
    const newTask = {
      title,
      description: description || undefined,
      project: project || undefined,
      urgency,
      importance,
      dueDate: dueDate || undefined,
      completed: false,
      aiDetails: undefined
    }
    await onTaskCreate?.(newTask)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="project">Project/Category</Label>
            <Input
              id="project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="Enter project or category"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1"
            />
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
                onClick={() => setUrgency(!urgency)}
              >
                {urgency && <CheckIcon className="w-3.5 h-3.5" />}
              </div>
              <Label htmlFor="urgent" className="cursor-pointer">
                Urgent
              </Label>
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
                onClick={() => setImportance(!importance)}
              >
                {importance && <CheckIcon className="w-3.5 h-3.5" />}
              </div>
              <Label htmlFor="important" className="cursor-pointer">
                Important
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
