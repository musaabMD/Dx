"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { AppSidebar } from "@/components/app-sidebar"
import { ProjectsDisplay } from "@/components/projects-display"
import { ProjectDetailView } from "@/components/project-detail-view"
import { CreateProjectDialog } from "@/components/create-project-dialog"
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

export default function ProjectsPage() {
  const projects = useQuery(api.projects.get) || []
  const createProject = useMutation(api.projects.create)
  const updateProject = useMutation(api.projects.update)
  const deleteProject = useMutation(api.projects.remove)
  
  const [selectedProject, setSelectedProject] = React.useState(null)
  const [isCreatingDialogOpen, setIsCreatingDialogOpen] = React.useState(false)

  const handleProjectSelect = (project) => {
    setSelectedProject(project === selectedProject ? null : project)
  }

  const handleProjectDelete = async (projectName) => {
    const project = projects.find(p => p.name === projectName)
    if (project && confirm(`Are you sure you want to delete "${projectName}"?`)) {
      await deleteProject({ id: project._id })
      if (selectedProject?.name === projectName || selectedProject?._id === project._id) {
        setSelectedProject(null)
      }
    }
  }

  const handleProjectCreate = async (newProject) => {
    await createProject(newProject)
  }

  const handleDismiss = () => {
    setSelectedProject(null)
  }

  // Convert Convex _id to id for compatibility with existing components
  const projectsWithId = projects.map(project => ({ ...project, id: project._id }))

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" counts={{ projects: projects.length }} />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Projects</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-3">
            <Button onClick={() => setIsCreatingDialogOpen(true)} size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </header>
        <CreateProjectDialog
          open={isCreatingDialogOpen}
          onOpenChange={setIsCreatingDialogOpen}
          onProjectCreate={handleProjectCreate}
        />
        <DetailViewLayout
          showDetail={!!selectedProject}
          onDismiss={handleDismiss}
          detailView={
            <ProjectDetailView
              project={selectedProject ? { ...selectedProject, id: selectedProject._id || selectedProject.id } : null}
              onClose={handleDismiss}
              onDelete={handleProjectDelete}
            />
          }
        >
          <ProjectsDisplay
            projects={projectsWithId}
            selectedProject={selectedProject}
            onProjectSelect={handleProjectSelect}
            onProjectDelete={handleProjectDelete}
          />
        </DetailViewLayout>
      </SidebarInset>
    </SidebarProvider>
  )
}
