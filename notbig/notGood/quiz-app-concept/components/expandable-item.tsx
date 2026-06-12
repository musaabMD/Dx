"use client"

import React from "react"

import { useState } from "react"
import { Plus, Minus, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ItemData {
  id: string
  title: string
  completed: number
  total: number
  children?: ItemData[]
}

interface ExpandableItemProps {
  item: ItemData
  level?: number
  onNavigate?: (item: ItemData) => void
}

export function ExpandableItem({ item, level = 0, onNavigate }: ExpandableItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onNavigate?.(item)
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex items-center justify-between px-4 py-4 cursor-pointer transition-colors",
          level === 0
            ? "bg-card rounded-2xl"
            : "bg-secondary/50 rounded-xl ml-4 border-t border-border/30"
        )}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-4">
          {hasChildren ? (
            <button
              className="text-primary font-medium text-xl"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          ) : (
            <Plus className="w-5 h-5 text-primary" />
          )}
          <span className="text-foreground font-medium text-base">{item.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-accent font-semibold text-lg leading-tight">{item.completed}</div>
            <div className="text-muted-foreground text-lg leading-tight">{item.total}</div>
          </div>
          <button
            onClick={handleNavigate}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Navigate"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <ExpandableItem
              key={child.id}
              item={child}
              level={level + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
