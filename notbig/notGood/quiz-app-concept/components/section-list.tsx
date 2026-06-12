"use client"

import React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { ExpandableItem, type ItemData } from "./expandable-item"
import { cn } from "@/lib/utils"

interface SectionListProps {
  title: string
  icon?: React.ReactNode
  items: ItemData[]
  defaultExpanded?: boolean
  onItemNavigate?: (item: ItemData) => void
}

export function SectionList({
  title,
  icon,
  items,
  defaultExpanded = false,
  onItemNavigate,
}: SectionListProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-4 bg-card/80 rounded-2xl transition-all",
          "hover:bg-card active:scale-[0.99]"
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-primary">{icon}</span>}
          <span className="text-foreground font-semibold text-lg">{title}</span>
        </div>
        <div className="text-muted-foreground">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {isExpanded && items.length > 0 && (
        <div className="mt-2 space-y-2">
          {items.map((item) => (
            <ExpandableItem
              key={item.id}
              item={item}
              onNavigate={onItemNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
