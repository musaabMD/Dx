"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export function CreateBookDialog({ open, onOpenChange, onBookCreate }) {
  const [name, setName] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [aiSummary, setAiSummary] = React.useState("")

  React.useEffect(() => {
    if (!open) {
      setName("")
      setCategory("")
      setAiSummary("")
    }
  }, [open])

  const handleSave = async () => {
    if (!name.trim()) return
    
    const newBook = {
      name,
      category: category || undefined,
      aiSummary: aiSummary || undefined,
      read: false,
    }
    await onBookCreate?.(newBook, true)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="bookName">Book Name</Label>
            <Input
              id="bookName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter book name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="bookCategory">Category</Label>
            <Input
              id="bookCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category (e.g., Fiction, Non-Fiction, Science)"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="bookSummary">AI Summary</Label>
            <Textarea
              id="bookSummary"
              value={aiSummary}
              onChange={(e) => setAiSummary(e.target.value)}
              placeholder="Enter AI-generated summary or description"
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Create Book
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
