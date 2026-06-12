"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { XIcon, TrashIcon } from "lucide-react"

export function BookDetailView({ book, onClose, onBookUpdate, onBookDelete }) {
  const [name, setName] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [aiSummary, setAiSummary] = React.useState("")

  React.useEffect(() => {
    if (book) {
      setName(book.name || "")
      setCategory(book.category || "")
      setAiSummary(book.aiSummary || "")
    }
  }, [book])

  const handleSave = async () => {
    if (book && onBookUpdate) {
      const bookId = book._id || book.id
      await onBookUpdate(bookId, { name, category, aiSummary })
    }
  }

  const handleDelete = async () => {
    if (book && confirm(`Are you sure you want to delete "${book.name}"?`)) {
      const bookId = book._id || book.id
      await onBookDelete?.(bookId)
      onClose()
    }
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a book to view details
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-lg m-4 shadow-sm border border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold truncate flex-1 mr-2">Book Details</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleDelete}
            title="Delete book"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
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
      
      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="editBookName">Book Name</Label>
            <Input
              id="editBookName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              onBlur={handleSave}
            />
          </div>

          <div>
            <Label htmlFor="editBookCategory">Category</Label>
            <Input
              id="editBookCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1"
              onBlur={handleSave}
            />
          </div>

          <div>
            <Label htmlFor="editBookSummary">AI Summary</Label>
            <Textarea
              id="editBookSummary"
              value={aiSummary}
              onChange={(e) => setAiSummary(e.target.value)}
              className="mt-1"
              rows={4}
              onBlur={handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
