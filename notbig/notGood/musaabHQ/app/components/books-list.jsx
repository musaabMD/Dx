"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrashIcon, SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function BooksList({ books, selectedBookId, onBookSelect, onBookToggle, onBookDelete }) {
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const filteredBooks = React.useMemo(() => {
    if (!searchQuery.trim()) return books
    const query = searchQuery.toLowerCase()
    return books.filter(book => 
      book.name.toLowerCase().includes(query) ||
      book.category?.toLowerCase().includes(query) ||
      book.aiSummary?.toLowerCase().includes(query)
    )
  }, [books, searchQuery])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-border bg-background">
        <h2 className="text-lg sm:text-xl font-semibold">Books ({books.length})</h2>
      </div>
      
      <div className="px-4 sm:px-6 py-3 border-b border-border bg-background">
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-background border-border/50"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="space-y-2 sm:space-y-3">
          {filteredBooks.map((book) => (
            <BookItem
              key={book._id || book.id}
              book={book}
              selectedBookId={selectedBookId}
              onSelect={onBookSelect}
              onToggle={onBookToggle}
              onDelete={onBookDelete}
            />
          ))}
          {filteredBooks.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No books found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Generate a subtle gray tone based on book id - minimal design
function getBookColor(bookId) {
  const grays = [
    { square: "bg-foreground/15" },
    { square: "bg-foreground/20" },
    { square: "bg-foreground/18" },
    { square: "bg-foreground/22" },
    { square: "bg-foreground/16" },
    { square: "bg-foreground/24" },
    { square: "bg-foreground/14" },
    { square: "bg-foreground/21" },
    { square: "bg-foreground/17" },
    { square: "bg-foreground/23" },
  ]
  // Use book id to consistently assign a subtle gray tone
  const index = parseInt(bookId) % grays.length
  return grays[index] || grays[0]
}

function BookItem({ book, selectedBookId, onSelect, onToggle, onDelete }) {
  const selected = selectedBookId === (book._id || book.id)
  const bookId = book._id || book.id
  const bookColor = getBookColor(bookId)
  
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 sm:p-3 rounded-md border border-border cursor-pointer transition-all hover:bg-muted/50 group",
        "bg-background",
        selected && "bg-muted border-foreground/20"
      )}
      onClick={() => onSelect(book._id || book.id)}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={book.read}
          onCheckedChange={async (checked) => {
            const bookId = book._id || book.id
            await onToggle?.(bookId, checked)
          }}
        />
      </div>
      
      {/* Color square - subtle gray */}
      <div className={cn("w-3 h-3 rounded shrink-0 bg-gray-300 dark:bg-gray-600")} />
      
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-semibold text-sm mb-0.5",
          book.read && "text-muted-foreground"
        )}>
          {book.name}
        </h3>
        {book.category && (
          <p className={cn(
            "text-xs text-muted-foreground",
            book.read && "opacity-70"
          )}>
            {book.category}
          </p>
        )}
      </div>
      
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={async (e) => {
            e.stopPropagation()
            if (confirm(`Are you sure you want to delete "${book.name}"?`)) {
              const bookId = book._id || book.id
              await onDelete(bookId)
            }
          }}
          title="Delete book"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
