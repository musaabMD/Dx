"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { XIcon, ExternalLinkIcon, TrashIcon } from "lucide-react"

export function ArticleDetailView({ article, onClose, onDelete }) {
  if (!article) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select an article to read
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-lg m-4 shadow-sm border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold truncate flex-1 mr-2">{article.title}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (article.url) {
                window.open(article.url, "_blank", "noopener,noreferrer")
              }
            }}
            title="Open in new tab"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={async () => {
                if (confirm(`Are you sure you want to delete "${article.title}"?`)) {
                  const articleId = article._id || article.id
                  await onDelete(articleId)
                  onClose()
                }
              }}
              title="Delete article"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
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
      
      {/* Webview */}
      <div className="flex-1 overflow-hidden">
        {article.url ? (
          <iframe
            src={article.url}
            className="w-full h-full border-0"
            title={article.title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No URL available for this article
          </div>
        )}
      </div>
    </div>
  )
}
