"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { AppSidebar } from "@/components/app-sidebar"
import { ArticlesList } from "@/components/articles-list"
import { ArticleDetailView } from "@/components/article-detail-view"
import { DetailViewLayout } from "@/components/detail-view-layout"
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

export default function ReadPage() {
  const articles = useQuery(api.articles.get) || []
  const updateArticle = useMutation(api.articles.update)
  const deleteArticle = useMutation(api.articles.remove)
  
  const [selectedArticleId, setSelectedArticleId] = React.useState(null)

  const selectedArticle = articles.find((article) => article._id === selectedArticleId)

  const handleArticleSelect = (articleId) => {
    setSelectedArticleId(articleId === selectedArticleId ? null : articleId)
  }

  const handleArticleToggle = async (articleId, read) => {
    await updateArticle({ id: articleId, read })
  }

  const handleArticleDelete = async (articleId) => {
    if (confirm("Are you sure you want to delete this article?")) {
      await deleteArticle({ id: articleId })
      if (selectedArticleId === articleId) {
        setSelectedArticleId(null)
      }
    }
  }

  const handleCloseDetail = () => {
    setSelectedArticleId(null)
  }

  // Convert Convex _id to id for compatibility with existing components
  const articlesWithId = articles.map(article => ({ ...article, id: article._id }))

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" counts={{ articles: articles.length }} />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Read</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <DetailViewLayout
          showDetail={!!selectedArticle}
          onDismiss={handleCloseDetail}
          detailView={
            <ArticleDetailView
              article={selectedArticle ? { ...selectedArticle, id: selectedArticle._id } : null}
              onClose={handleCloseDetail}
              onDelete={handleArticleDelete}
            />
          }
        >
          <ArticlesList
            articles={articlesWithId}
            selectedArticleId={selectedArticleId}
            onArticleSelect={handleArticleSelect}
            onArticleToggle={handleArticleToggle}
            onArticleDelete={handleArticleDelete}
          />
        </DetailViewLayout>
      </SidebarInset>
    </SidebarProvider>
  )
}
