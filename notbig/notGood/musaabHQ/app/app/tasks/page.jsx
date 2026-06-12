"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { AppSidebar } from "@/components/app-sidebar"
import { TasksList } from "@/components/tasks-list"
import { TaskDetailView } from "@/components/task-detail-view"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { DetailViewLayout } from "@/components/detail-view-layout"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function TasksPage() {
  const tasks = useQuery(api.tasks.get) || []
  const createTask = useMutation(api.tasks.create)
  const updateTask = useMutation(api.tasks.update)
  const deleteTask = useMutation(api.tasks.remove)
  
  const [selectedTaskId, setSelectedTaskId] = React.useState(null)
  const [isCreatingDialogOpen, setIsCreatingDialogOpen] = React.useState(false)

  const selectedTask = tasks.find((task) => task._id === selectedTaskId)

  const handleTaskSelect = (taskId) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId)
  }

  const handleTaskUpdate = async (taskId, updates) => {
    await updateTask({ id: taskId, ...updates })
  }

  const handleTaskToggle = async (taskId, completed) => {
    await handleTaskUpdate(taskId, { completed })
  }

  const handleTaskCreate = async (newTask) => {
    const id = await createTask(newTask)
    setSelectedTaskId(id)
  }

  const handleCreateTaskFromColumn = (column) => {
    setIsCreatingDialogOpen(true)
    // You could pre-populate urgency/importance based on column if needed
  }

  const handleTaskDelete = async (taskId) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask({ id: taskId })
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null)
      }
    }
  }

  const handleDismissDetails = () => {
    setSelectedTaskId(null)
  }

  // Convert Convex _id to id for compatibility with existing components
  const tasksWithId = tasks.map(task => ({ ...task, id: task._id }))

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" counts={{ tasks: tasks.length }} />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Tasks</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-3">
            <Button onClick={() => setIsCreatingDialogOpen(true)} size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </header>
        <CreateTaskDialog
          open={isCreatingDialogOpen}
          onOpenChange={setIsCreatingDialogOpen}
          onTaskCreate={handleTaskCreate}
        />
        <DetailViewLayout
          showDetail={!!selectedTask}
          onDismiss={handleDismissDetails}
          detailView={
            <div className="bg-card rounded-lg m-2 shadow-sm border border-border">
              <TaskDetailView
                task={selectedTask ? { ...selectedTask, id: selectedTask._id } : null}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
              />
            </div>
          }
        >
          <TasksList
            tasks={tasksWithId}
            selectedTaskId={selectedTaskId}
            onTaskSelect={handleTaskSelect}
            onTaskToggle={handleTaskToggle}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            onCreateTask={handleCreateTaskFromColumn}
          />
        </DetailViewLayout>
      </SidebarInset>
    </SidebarProvider>
  )
}
