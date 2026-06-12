"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { CheckIcon, SearchIcon, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

// Helper function to categorize tasks into columns
function categorizeTask(task) {
  const urgency = task.urgency ?? false
  const importance = task.importance ?? false
  
  if (urgency && importance) return "I"      // Urgent & Important
  if (!urgency && importance) return "II"    // Not Urgent & Important
  if (urgency && !importance) return "III"   // Urgent & Unimportant
  return "IV"                                 // Not Urgent & Unimportant
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// Column configuration - Trello-like design
const columns = {
  I: {
    label: "Urgent & Important",
    id: "I"
  },
  II: {
    label: "Not Urgent & Important",
    id: "II"
  },
  III: {
    label: "Urgent & Unimportant",
    id: "III"
  },
  IV: {
    label: "Not Urgent & Unimportant",
    id: "IV"
  }
}

function TaskColumn({ column, tasks, selectedTaskId, onTaskSelect, onTaskToggle = () => {}, onTaskUpdate = () => {}, onTaskDelete = () => {}, onCreateTask }) {
  const config = columns[column]
  
  return (
    <div className="flex flex-col h-full min-w-[280px] sm:min-w-[300px] bg-muted/60 rounded-lg group shadow-sm">
      {/* Column Header */}
      <div className="px-3 sm:px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground/90">
          {config.label}
        </h3>
        <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      
      {/* Column Content - Scrollable Cards */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-2 space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs py-4">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              selected={selectedTaskId === (task._id || task.id)}
              onSelect={onTaskSelect}
              onToggle={onTaskToggle}
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
            />
          ))
        )}
      </div>
      
      {/* Add Card Button */}
      <div className="px-2 sm:px-3 py-2">
        <button 
          onClick={() => onCreateTask?.(column)}
          className="w-full text-left text-sm text-muted-foreground hover:text-foreground py-2 px-2 rounded hover:bg-muted/40 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>Add a card</span>
        </button>
      </div>
    </div>
  )
}

function TaskCard({ task, selected, onSelect, onToggle = () => {}, onUpdate = () => {}, onDelete = () => {} }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
  
  return (
    <div
      className={cn(
        "bg-background/95 rounded-md border border-border/50 shadow-sm p-3 cursor-pointer transition-all hover:shadow-md hover:border-border/70 group relative",
        selected && "ring-2 ring-primary/50 ring-offset-1",
        task.completed && "opacity-60"
      )}
      onClick={() => onSelect(task._id || task.id)}
    >
      {/* Checkbox and Title */}
      <div className="flex items-start gap-2 mb-2">
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={task.completed}
            onCheckedChange={async (checked) => {
              const taskId = task._id || task.id
              await onToggle?.(taskId, checked)
            }}
            className="mt-0.5"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn(
            "text-sm font-medium leading-snug",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </div>
        </div>
      </div>
      
      {/* Details Row */}
      {(task.project || task.dueDate || task.urgency || task.importance) && (
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {/* Project Badge */}
          {task.project && (
            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {task.project}
            </span>
          )}
          
          {/* Date */}
          {task.dueDate && (
            <span className={cn(
              "text-xs flex items-center gap-1",
              isOverdue ? "text-destructive" : "text-muted-foreground"
            )}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(task.dueDate)}
            </span>
          )}
          
          {/* Urgent & Important Indicators */}
          <div className="flex items-center gap-1 ml-auto">
            {task.urgency && (
              <div
                className="w-2.5 h-2.5 rounded-full bg-foreground/70 cursor-pointer hover:bg-foreground transition-colors"
              onClick={async (e) => {
                e.stopPropagation()
                const taskId = task._id || task.id
                await onUpdate?.(taskId, { urgency: !task.urgency })
              }}
                title="Urgent"
              />
            )}
            {task.importance && (
              <div
                className="w-2.5 h-2.5 rounded-full bg-foreground/70 cursor-pointer hover:bg-foreground transition-colors"
              onClick={async (e) => {
                e.stopPropagation()
                const taskId = task._id || task.id
                await onUpdate?.(taskId, { importance: !task.importance })
              }}
                title="Important"
              />
            )}
          </div>
        </div>
      )}
      
      {/* Delete Button */}
      {onDelete && (
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 text-muted-foreground hover:text-destructive p-1"
          onClick={async (e) => {
            e.stopPropagation()
            if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
              const taskId = task._id || task.id
              await onDelete(taskId)
            }
          }}
          title="Delete task"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export function TasksList({ tasks, selectedTaskId, onTaskSelect, onTaskToggle, onTaskUpdate, onTaskDelete, onCreateTask }) {
  const [searchQuery, setSearchQuery] = React.useState("")
  
  // Filter tasks based on search
  const filteredTasks = React.useMemo(() => {
    if (!searchQuery.trim()) return tasks
    const query = searchQuery.toLowerCase()
    return tasks.filter(task => 
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.project?.toLowerCase().includes(query)
    )
  }, [tasks, searchQuery])
  
  // Categorize tasks into columns
  const columnTasks = {
    I: [],
    II: [],
    III: [],
    IV: []
  }
  
  filteredTasks.forEach(task => {
    const column = categorizeTask(task)
    columnTasks[column].push(task)
  })
  
  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-border/50 bg-background/50">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground/90">Tasks ({tasks.length})</h2>
      </div>
      
      {/* Search */}
      <div className="px-4 sm:px-6 py-3 border-b border-border/50 bg-background/50">
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-background/80 border-border/50"
          />
        </div>
      </div>
      
      {/* Trello-like Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-muted/40">
        <div className="flex gap-3 sm:gap-4 h-full p-3 sm:p-4">
          <TaskColumn
            column="I"
            tasks={columnTasks.I}
            selectedTaskId={selectedTaskId}
            onTaskSelect={onTaskSelect}
            onTaskToggle={onTaskToggle}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
            onCreateTask={onCreateTask}
          />
          <TaskColumn
            column="II"
            tasks={columnTasks.II}
            selectedTaskId={selectedTaskId}
            onTaskSelect={onTaskSelect}
            onTaskToggle={onTaskToggle}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
            onCreateTask={onCreateTask}
          />
          <TaskColumn
            column="III"
            tasks={columnTasks.III}
            selectedTaskId={selectedTaskId}
            onTaskSelect={onTaskSelect}
            onTaskToggle={onTaskToggle}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
            onCreateTask={onCreateTask}
          />
          <TaskColumn
            column="IV"
            tasks={columnTasks.IV}
            selectedTaskId={selectedTaskId}
            onTaskSelect={onTaskSelect}
            onTaskToggle={onTaskToggle}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
            onCreateTask={onCreateTask}
          />
        </div>
      </div>
    </div>
  )
}
