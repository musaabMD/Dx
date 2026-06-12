"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlayIcon, ExternalLinkIcon, TrashIcon, SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ArticlesList({ articles, selectedArticleId, onArticleSelect, onArticleToggle, onArticleDelete }) {
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const filteredArticles = React.useMemo(() => {
    if (!searchQuery.trim()) return articles
    const query = searchQuery.toLowerCase()
    return articles.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.summary?.toLowerCase().includes(query)
    )
  }, [articles, searchQuery])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-border bg-background">
        <h2 className="text-lg sm:text-xl font-semibold">Articles ({articles.length})</h2>
      </div>
      
      <div className="px-4 sm:px-6 py-3 border-b border-border bg-background">
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-background border-border/50"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="space-y-2 sm:space-y-3">
          {filteredArticles.map((article) => (
            <ArticleItem
              key={article._id || article.id}
              article={article}
              selected={selectedArticleId === (article._id || article.id)}
              onSelect={onArticleSelect}
              onToggle={onArticleToggle}
              onDelete={onArticleDelete}
            />
          ))}
          {filteredArticles.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No articles found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ArticleItem({ article, selected, onSelect, onToggle, onDelete }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 sm:p-3 rounded-md border cursor-pointer transition-all hover:bg-muted/50",
        "bg-background border-border/50",
        selected && "bg-muted border-border"
      )}
      onClick={() => onSelect(article._id || article.id)}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={article.read}
          onCheckedChange={async (checked) => {
            const articleId = article._id || article.id
            await onToggle?.(articleId, checked)
          }}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-semibold text-sm mb-0.5",
          article.read && "text-muted-foreground"
        )}>
          {article.title}
        </h3>
        <p className={cn(
          "text-xs text-muted-foreground line-clamp-1",
          article.read && "opacity-70"
        )}>
          {article.summary}
        </p>
      </div>
      
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            // Handle play button click
            console.log("Play article:", article.id)
          }}
          title="Play article"
        >
          <PlayIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
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
          onClick={async (e) => {
            e.stopPropagation()
            if (confirm(`Are you sure you want to delete "${article.title}"?`)) {
              const articleId = article._id || article.id
              await onDelete(articleId)
            }
          }}
            title="Delete article"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
