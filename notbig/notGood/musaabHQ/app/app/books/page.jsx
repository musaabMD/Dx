"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { AppSidebar } from "@/components/app-sidebar"
import { BooksList } from "@/components/books-list"
import { BookDetailView } from "@/components/book-detail-view"
import { CreateBookDialog } from "@/components/create-book-dialog"
import { DetailViewLayout } from "@/components/detail-view-layout"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
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

export default function BooksPage() {
  const books = useQuery(api.books.get) || []
  const createBook = useMutation(api.books.create)
  const updateBook = useMutation(api.books.update)
  const deleteBook = useMutation(api.books.remove)
  
  const [selectedBookId, setSelectedBookId] = React.useState(null)
  const [isCreatingDialogOpen, setIsCreatingDialogOpen] = React.useState(false)

  const selectedBook = books.find((book) => book._id === selectedBookId)

  const handleBookSelect = (bookId) => {
    setSelectedBookId(bookId === selectedBookId ? null : bookId)
  }

  const handleBookToggle = async (bookId, read) => {
    await updateBook({ id: bookId, read })
  }

  const handleBookUpdate = async (bookIdOrNewBook, updatesOrIsNew) => {
    // Check if it's a new book (second param is true boolean)
    if (updatesOrIsNew === true) {
      // Adding new book
      const id = await createBook(bookIdOrNewBook)
      setSelectedBookId(id)
    } else {
      // Updating existing book
      const bookId = bookIdOrNewBook
      const updates = updatesOrIsNew || {}
      await updateBook({ id: bookId, ...updates })
    }
  }

  const handleBookDelete = async (bookId) => {
    if (confirm("Are you sure you want to delete this book?")) {
      await deleteBook({ id: bookId })
      if (selectedBookId === bookId) {
        setSelectedBookId(null)
      }
    }
  }

  const handleDismissDetails = () => {
    setSelectedBookId(null)
  }

  // Convert Convex _id to id for compatibility with existing components
  const booksWithId = books.map(book => ({ ...book, id: book._id }))

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" counts={{ books: books.length }} />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Books</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-3">
            <Button onClick={() => setIsCreatingDialogOpen(true)} size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Book
            </Button>
          </div>
        </header>
        <CreateBookDialog
          open={isCreatingDialogOpen}
          onOpenChange={setIsCreatingDialogOpen}
          onBookCreate={handleBookUpdate}
        />
        <DetailViewLayout
          showDetail={!!selectedBook}
          onDismiss={handleDismissDetails}
          detailView={
            <BookDetailView
              book={selectedBook ? { ...selectedBook, id: selectedBook._id } : null}
              onClose={handleDismissDetails}
              onBookUpdate={handleBookUpdate}
              onBookDelete={handleBookDelete}
            />
          }
        >
          <BooksList
            books={booksWithId}
            selectedBookId={selectedBookId}
            onBookSelect={handleBookSelect}
            onBookToggle={handleBookToggle}
            onBookDelete={handleBookDelete}
          />
        </DetailViewLayout>
      </SidebarInset>
    </SidebarProvider>
  )
}
