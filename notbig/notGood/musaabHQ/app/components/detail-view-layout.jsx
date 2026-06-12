"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function DetailViewLayout({ 
  children, 
  detailView, 
  showDetail = false,
  onDismiss,
  className 
}) {
  const containerRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDetail && containerRef.current && !containerRef.current.contains(e.target)) {
        onDismiss?.()
      }
    }

    if (showDetail) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [showDetail, onDismiss])

  return (
    <div 
      ref={containerRef}
      className={cn("flex-1 overflow-auto", className)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full">
        <div 
          className={cn(
            "border-r overflow-hidden rounded-lg m-2 shadow-sm transition-all",
            showDetail ? "lg:col-span-1" : "lg:col-span-2"
          )}
        >
          {children}
        </div>
        {showDetail && (
          <div className="overflow-auto">
            {detailView}
          </div>
        )}
      </div>
    </div>
  )
}
