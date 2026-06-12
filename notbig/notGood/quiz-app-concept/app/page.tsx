"use client"

import React from "react"
import { useState } from "react"
import {
  ChevronRight,
  ChevronLeft,
  X,
  MessageCircle,
  Send,
  Flame,
  Search,
  BookOpen,
  Layers,
  FolderOpen,
  BarChart3,
  Zap,
  FileText,
  RefreshCw,
  Trophy,
  Target,
  Settings,
  Plus,
  Minus,
  Flag,
  Bookmark,
  Pause,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ItemData } from "@/components/expandable-item"
import {
  subjectsData,
  flashcardsData,
  libraryData,
  analysisData,
  rapidReviewData,
  mockExamData,
  reviewData,
  mcqQuestions,
  flashcardDecks,
  type FlashcardItem,
} from "@/lib/quiz-data"

interface MainSection {
  id: string
  title: string
  items: ItemData[]
  icon: React.ReactNode
  total: number
  showProgress?: boolean
}

const mainSections: MainSection[] = [
  { id: "subjects", title: "Subjects", items: subjectsData, icon: <BookOpen className="w-5 h-5 text-primary" />, total: 390, showProgress: true },
  { id: "flashcards", title: "Flashcards", items: flashcardsData, icon: <Layers className="w-5 h-5 text-primary" />, total: 90 },
  { id: "library", title: "Library", items: libraryData, icon: <FolderOpen className="w-5 h-5 text-primary" />, total: 480 },
  { id: "analysis", title: "Analysis", items: analysisData, icon: <BarChart3 className="w-5 h-5 text-primary" />, total: 300 },
  { id: "rapidreview", title: "Rapid Review", items: rapidReviewData, icon: <Zap className="w-5 h-5 text-orange-500" />, total: 175 },
  { id: "mockexam", title: "Mock Exam", items: mockExamData, icon: <FileText className="w-5 h-5 text-primary" />, total: 200 },
  { id: "review", title: "Review", items: reviewData, icon: <RefreshCw className="w-5 h-5 text-primary" />, total: 150 },
]

type ViewType = "home" | "list" | "quiz" | "analysis" | "flashcards"

export default function DrKardApp() {
  const [currentView, setCurrentView] = useState<ViewType>("home")
  const [currentSection, setCurrentSection] = useState<MainSection | null>(null)
  const [currentSubject, setCurrentSubject] = useState<ItemData | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [streak] = useState(7)
  const [score] = useState(78)
  const [rank] = useState(156)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizIncorrect, setQuizIncorrect] = useState(0)
  const [quizSkipped, setQuizSkipped] = useState(0)
  const [quizRevealAllAnswers, setQuizRevealAllAnswers] = useState(false)
  const [quizExplainOpen, setQuizExplainOpen] = useState(false)
  const [bookmarkedQuiz, setBookmarkedQuiz] = useState<Set<string>>(new Set())
  const [reportedQuiz, setReportedQuiz] = useState<Set<string>>(new Set())

  const quizBookmarkKey = currentSubject ? `${currentSubject.id}-${currentQuestionIndex}` : ""
  const isBookmarked = bookmarkedQuiz.has(quizBookmarkKey)
  const isReported = reportedQuiz.has(quizBookmarkKey)

  // Flashcards state
  const [flashcardDeckTitle, setFlashcardDeckTitle] = useState<string | null>(null)
  const [flashcardIndex, setFlashcardIndex] = useState(0)
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false)
  const [flashcardCounts, setFlashcardCounts] = useState({ due: 0, again: 0, good: 0 })
  const [expandedFlashcardId, setExpandedFlashcardId] = useState<string | null>("fc-part2")

  const flashcardCards: FlashcardItem[] = flashcardDeckTitle
    ? flashcardDecks[flashcardDeckTitle] ?? []
    : []
  const currentFlashcard = flashcardCards[flashcardIndex]
  const isFlashcardSessionDone = flashcardCards.length > 0 && flashcardIndex >= flashcardCards.length

  const goBack = () => {
    if (currentView === "quiz") {
      setCurrentView("list")
      setCurrentQuestionIndex(0)
      setSelectedAnswer(null)
      setShowExplanation(false)
      setQuizScore(0)
      setQuizIncorrect(0)
      setQuizSkipped(0)
      setQuizRevealAllAnswers(false)
      setQuizExplainOpen(false)
    } else if (currentView === "flashcards") {
      setCurrentView("list")
      setFlashcardDeckTitle(null)
      setFlashcardIndex(0)
      setShowFlashcardAnswer(false)
      setFlashcardCounts({ due: 0, again: 0, good: 0 })
    } else if (currentView === "list" || currentView === "analysis") {
      setCurrentView("home")
      setCurrentSection(null)
      setExpandedFlashcardId(null)
    }
    setSearchQuery("")
    setSearchOpen(false)
  }

  const handleSectionClick = (section: MainSection) => {
    setCurrentSection(section)
    setCurrentView("list")
  }

  const handleSubjectClick = (item: ItemData) => {
    if (currentSection?.id === "subjects") {
      setCurrentSubject(item)
      setCurrentView("quiz")
      setCurrentQuestionIndex(0)
      setSelectedAnswer(null)
      setShowExplanation(false)
      setQuizScore(0)
      setQuizIncorrect(0)
      setQuizSkipped(0)
      setQuizRevealAllAnswers(false)
      setQuizExplainOpen(false)
    } else if (currentSection?.id === "flashcards") {
      const cards = flashcardDecks[item.title] ?? []
      if (cards.length > 0) {
        setFlashcardDeckTitle(item.title)
        setCurrentView("flashcards")
        setFlashcardIndex(0)
        setShowFlashcardAnswer(false)
        setFlashcardCounts({ due: cards.length, again: 0, good: 0 })
      }
    }
  }

  const handleFlashcardRate = (rating: "again" | "hard" | "good" | "easy") => {
    setFlashcardCounts((prev) => ({
      ...prev,
      due: Math.max(0, prev.due - 1),
      again: rating === "again" ? prev.again + 1 : prev.again,
      good: rating === "good" || rating === "easy" ? prev.good + 1 : prev.good,
    }))
    setShowFlashcardAnswer(false)
    if (flashcardIndex < flashcardCards.length - 1) {
      setFlashcardIndex((i) => i + 1)
    } else {
      setFlashcardIndex((i) => i + 1) // will show done state
    }
  }

  const handleBadgeClick = () => {
    const analysisSection = mainSections.find(s => s.id === "analysis")
    if (analysisSection) {
      setCurrentSection(analysisSection)
      setCurrentView("analysis")
    }
  }

  const filteredItems = currentSection?.items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const questions = currentSubject ? mcqQuestions[currentSubject.title] || mcqQuestions["Anatomy"] : []
  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(index)
    setShowExplanation(true)
    if (index === currentQuestion.correctAnswer) {
      setQuizScore(prev => prev + 1)
    } else {
      setQuizIncorrect(prev => prev + 1)
    }
  }

  const showAnswerDirectly = () => {
    if (selectedAnswer !== null) return
    setQuizRevealAllAnswers(true)
    setSelectedAnswer(currentQuestion.correctAnswer)
    setShowExplanation(true)
    setQuizSkipped(prev => prev + 1)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      setQuizExplainOpen(false)
      if (quizRevealAllAnswers) {
        const nextQ = questions[nextIndex]
        setSelectedAnswer(nextQ.correctAnswer)
        setShowExplanation(true)
        setQuizSkipped(prev => prev + 1)
      } else {
        setSelectedAnswer(null)
        setShowExplanation(false)
      }
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(prevIndex)
      setQuizExplainOpen(false)
      if (quizRevealAllAnswers) {
        const prevQ = questions[prevIndex]
        setSelectedAnswer(prevQ.correctAnswer)
        setShowExplanation(true)
      } else {
        setSelectedAnswer(null)
        setShowExplanation(false)
      }
    } else {
      goBack()
    }
  }

  const toggleBookmark = () => {
    if (!quizBookmarkKey) return
    setBookmarkedQuiz(s => {
      const next = new Set(s)
      if (next.has(quizBookmarkKey)) next.delete(quizBookmarkKey)
      else next.add(quizBookmarkKey)
      return next
    })
  }

  const toggleReport = () => {
    if (!quizBookmarkKey) return
    setReportedQuiz(s => {
      const next = new Set(s)
      if (next.has(quizBookmarkKey)) {
        next.delete(quizBookmarkKey)
      } else {
        next.add(quizBookmarkKey)
        if (typeof window !== "undefined") window.alert("Question reported.")
      }
      return next
    })
  }

  const handlePause = () => {
    if (typeof window !== "undefined" && window.confirm("Pause and resume later?")) {
      goBack()
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Home View */}
      {currentView === "home" && (
        <>
          <header className="px-5 pt-14 pb-4">
            <div className="max-w-lg mx-auto flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">DrKard</h1>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleBadgeClick}
                  className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-full hover:bg-secondary transition-colors"
                >
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-foreground">{streak}</span>
                </button>
                <button 
                  onClick={handleBadgeClick}
                  className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-full hover:bg-secondary transition-colors"
                >
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-foreground">{score}%</span>
                </button>
                <button 
                  onClick={handleBadgeClick}
                  className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-full hover:bg-secondary transition-colors"
                >
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">#{rank}</span>
                </button>
              </div>
            </div>
          </header>

          <main className="max-w-lg mx-auto px-4 pt-2 pb-32">
            <div className="bg-card rounded-2xl overflow-hidden border border-border">
              {mainSections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section)}
                  className={cn(
                    "w-full flex items-center px-4 py-3.5 transition-all active:bg-secondary/50",
                    index !== mainSections.length - 1 && "border-b border-border"
                  )}
                >
                  <div className="w-8 flex-shrink-0">
                    {section.icon}
                  </div>
                  <span className="flex-1 text-left text-foreground font-medium text-base">{section.title}</span>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-muted-foreground text-base">{section.total}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
                  </div>
                </button>
              ))}
            </div>
          </main>
        </>
      )}

      {/* List View */}
      {currentView === "list" && currentSection && (
        <div className="min-h-screen bg-background animate-in slide-in-from-right-4 duration-200">
          <header className="px-4 pt-14 pb-2">
            <div className="max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goBack}
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center active:bg-secondary transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSearchOpen(!searchOpen)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors border",
                      searchOpen ? "bg-primary border-primary" : "bg-card border-border active:bg-secondary"
                    )}
                  >
                    <Search className={cn("w-5 h-5", searchOpen ? "text-primary-foreground" : "text-foreground")} />
                  </button>
                  
                  <button className="px-4 h-10 rounded-full bg-card border border-border flex items-center justify-center active:bg-secondary transition-colors">
                    <span className="text-foreground font-medium text-sm">Select</span>
                  </button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                {currentSection.title}
              </h1>

              {searchOpen && (
                <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      autoFocus
                      className="flex-1 bg-transparent text-foreground text-base placeholder:text-muted-foreground focus:outline-none"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="p-1">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </header>

          <main className="max-w-lg mx-auto px-4 pt-4 pb-32">
            <div className="bg-card rounded-2xl overflow-hidden border border-border">
              {currentSection.id === "flashcards" ? (
                <>
                  {(() => {
                    const rows: { item: ItemData; isChild: boolean }[] = []
                    filteredItems.forEach((item) => {
                      rows.push({ item, isChild: false })
                      if (item.children?.length && expandedFlashcardId === item.id) {
                        item.children.forEach((child) => rows.push({ item: child, isChild: true }))
                      }
                    })
                    return rows.map(({ item, isChild }, index) => {
                      const hasChildren = item.children && item.children.length > 0
                      const isExpanded = expandedFlashcardId === item.id
                      const canNavigate = !!flashcardDecks[item.title]?.length
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center justify-between py-4 transition-colors",
                            isChild ? "pl-10 pr-4 bg-muted/30" : "px-4",
                            index !== rows.length - 1 && "border-b border-border"
                          )}
                        >
                          <div className="flex flex-1 items-center gap-4 min-w-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (hasChildren) {
                                  setExpandedFlashcardId((id) => (id === item.id ? null : item.id))
                                }
                              }}
                              className={cn(
                                "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                                hasChildren
                                  ? "text-primary hover:bg-primary/10 active:bg-primary/20"
                                  : "text-primary/50 cursor-default"
                              )}
                              aria-label={hasChildren ? (isExpanded ? "Collapse sub-decks" : "Expand sub-decks") : undefined}
                            >
                              {hasChildren ? (
                                isExpanded ? (
                                  <Minus className="w-5 h-5" />
                                ) : (
                                  <Plus className="w-5 h-5" />
                                )
                              ) : (
                                <Plus className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                if (canNavigate) {
                                  handleSubjectClick(item)
                                } else if (hasChildren && item.children?.length) {
                                  handleSubjectClick(item.children[0])
                                }
                              }}
                              className="flex-1 text-left min-w-0 active:opacity-80"
                            >
                              <span className="text-foreground font-medium text-base truncate block">
                                {item.title}
                              </span>
                            </button>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-green-600 dark:text-green-400 font-semibold text-base leading-tight">
                                {item.completed}
                              </div>
                              <div className="text-primary text-base leading-tight">
                                {item.total}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (canNavigate) {
                                  handleSubjectClick(item)
                                } else if (hasChildren && item.children?.length) {
                                  handleSubjectClick(item.children[0])
                                }
                              }}
                              className="text-muted-foreground hover:text-foreground transition-colors p-1"
                              aria-label="Open deck"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  })()}
                  {filteredItems.length === 0 && (
                    <div className="px-4 py-8 text-center text-muted-foreground">
                      No items found
                    </div>
                  )}
                </>
              ) : (
                <>
                  {filteredItems.map((item, index) => {
                    const progressPercent = (item.completed / item.total) * 100
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSubjectClick(item)}
                        className={cn(
                          "w-full flex items-center px-4 py-3.5 transition-all active:bg-secondary/50",
                          index !== filteredItems.length - 1 && "border-b border-border"
                        )}
                      >
                        <div className="flex-1 text-left">
                          <span className="text-foreground font-medium text-base">{item.title}</span>
                          {currentSection.showProgress && (
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[180px]">
                                <div
                                  className="h-full bg-accent rounded-full transition-all duration-500"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(progressPercent)}%
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <div className="text-right">
                            <span className="text-accent font-semibold text-base">
                              {item.completed}
                            </span>
                            <span className="text-muted-foreground text-base">/{item.total}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
                        </div>
                      </button>
                    )
                  })}
                  {filteredItems.length === 0 && (
                    <div className="px-4 py-8 text-center text-muted-foreground">
                      No items found
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      )}

      {/* Analysis View */}
      {currentView === "analysis" && (
        <div className="min-h-screen bg-background animate-in slide-in-from-right-4 duration-200">
          <header className="px-4 pt-14 pb-2">
            <div className="max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goBack}
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center active:bg-secondary transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
              </div>

              <h1 className="text-3xl font-bold text-foreground tracking-tight">Analysis</h1>
            </div>
          </header>

          <main className="max-w-lg mx-auto px-4 pt-4 pb-32 space-y-4">
            {/* Score Card */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Overall Score</h2>
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-foreground">{score}%</span>
                <span className="text-sm text-accent mb-1">+3% this week</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${score}%` }} />
              </div>
            </div>

            {/* Rank Card */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Your Rank</h2>
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-foreground">#{rank}</span>
                <span className="text-sm text-accent mb-1">Top 15%</span>
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Current Streak</h2>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-foreground">{streak}</span>
                <span className="text-sm text-muted-foreground mb-1">days</span>
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Subject Breakdown</h2>
              <div className="space-y-3">
                {subjectsData.map(subject => {
                  const percent = Math.round((subject.completed / subject.total) * 100)
                  return (
                    <div key={subject.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{subject.title}</span>
                        <span className="text-muted-foreground">{percent}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Quiz View */}
      {currentView === "quiz" && currentSubject && currentQuestion && (
        <div className="min-h-screen bg-background animate-in slide-in-from-right-4 duration-200">
          <header className="px-4 pt-14 pb-4">
            <div className="max-w-lg mx-auto flex items-center gap-2">
              <button
                onClick={goBack}
                className="w-10 h-10 flex-shrink-0 rounded-full bg-card border border-border flex items-center justify-center active:bg-secondary transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-lg font-bold text-foreground tracking-tight truncate flex-1 min-w-0">
                {currentSubject.title}
              </h1>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="px-2 py-1 rounded-md bg-green-500/15 text-green-600 dark:text-green-400 text-xs font-semibold">
                  ✓ {quizScore}
                </span>
                <span className="text-muted-foreground/60 text-xs">|</span>
                <span className="px-2 py-1 rounded-md bg-red-500/15 text-red-600 dark:text-red-400 text-xs font-semibold">
                  ✗ {quizIncorrect}
                </span>
                <span className="text-muted-foreground/60 text-xs">|</span>
                <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                  Skip {quizSkipped}
                </span>
              </div>
            </div>
          </header>

          <main className="max-w-lg mx-auto px-4 pb-28">
            {/* Question */}
            <div className="bg-card rounded-2xl p-5 mb-4 border border-border">
              <div className="flex items-start justify-between gap-3">
                <p className="text-foreground text-lg font-medium leading-relaxed flex-1 min-w-0">
                  {currentQuestion.question}
                </p>
                <button
                  onClick={() => setQuizExplainOpen((o) => !o)}
                  className={cn(
                    "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                    quizExplainOpen ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                  aria-label="Explain question"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
              {quizExplainOpen && (
                <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Explanation</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentQuestion.correctAnswer
                const showResult = selectedAnswer !== null
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={cn(
                      "w-full p-4 rounded-xl text-left transition-all border",
                      !showResult && "bg-card border-border active:bg-secondary/50",
                      showResult && isCorrect && "bg-green-50 border-2 border-accent",
                      showResult && isSelected && !isCorrect && "bg-red-50 border-2 border-red-500",
                      showResult && !isSelected && !isCorrect && "bg-card border-border opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0",
                        !showResult && "bg-secondary text-foreground",
                        showResult && isCorrect && "bg-accent text-accent-foreground",
                        showResult && isSelected && !isCorrect && "bg-red-500 text-white"
                      )}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-foreground font-medium">{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="mt-4 bg-card rounded-2xl p-5 border border-border animate-in slide-in-from-bottom-2 duration-200">
                <h3 className="text-sm font-semibold text-primary mb-2">Explanation</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Quiz Complete */}
            {showExplanation && currentQuestionIndex === questions.length - 1 && (
              <div className="mt-4 bg-card rounded-2xl p-6 text-center border border-border">
                <h3 className="text-xl font-bold text-foreground mb-2">Quiz Complete!</h3>
                <p className="text-muted-foreground mb-2">
                  ✓ {quizScore} correct · ✗ {quizIncorrect} incorrect · Skipped {quizSkipped}
                </p>
                <p className="text-muted-foreground text-sm mb-4">{questions.length} questions</p>
                <button
                  onClick={goBack}
                  className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl active:opacity-80 transition-opacity"
                >
                  Back to {currentSection?.title}
                </button>
              </div>
            )}
          </main>

          {/* Fixed bottom bar */}
          <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card border-t border-border px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-2 z-20">
            <button
              onClick={prevQuestion}
              className="flex flex-col items-center gap-0.5 py-1 min-w-[52px] text-muted-foreground hover:text-foreground active:opacity-80 transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-[10px] font-medium">Back</span>
            </button>
            <button
              onClick={toggleReport}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 min-w-[52px] transition-colors active:opacity-80",
                isReported ? "text-destructive" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Report"
            >
              <Flag className="w-5 h-5" />
              <span className="text-[10px] font-medium">Report</span>
            </button>
            <button
              onClick={toggleBookmark}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 min-w-[52px] transition-colors active:opacity-80",
                isBookmarked ? "text-primary fill-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Bookmark"
            >
              <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
              <span className="text-[10px] font-medium">Save</span>
            </button>
            <button
              onClick={showAnswerDirectly}
              disabled={selectedAnswer !== null}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 min-w-[48px] transition-colors active:opacity-80",
                selectedAnswer === null
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-muted-foreground/50 cursor-not-allowed"
              )}
              aria-label="Show answer"
            >
              <Eye className="w-5 h-5" />
              <span className="text-[10px] font-medium">Answer</span>
            </button>
            <button
              onClick={handlePause}
              className="flex flex-col items-center gap-0.5 py-1 min-w-[48px] text-muted-foreground hover:text-foreground active:opacity-80 transition-colors"
              aria-label="Pause - resume later"
            >
              <Pause className="w-5 h-5" />
              <span className="text-[10px] font-medium">Pause</span>
            </button>
            <button
              onClick={() => {
                if (showExplanation && currentQuestionIndex === questions.length - 1) {
                  goBack()
                } else {
                  nextQuestion()
                }
              }}
              disabled={!showExplanation && selectedAnswer === null}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 min-w-[52px] transition-colors active:opacity-80",
                showExplanation || selectedAnswer !== null
                  ? "text-primary hover:text-primary/90"
                  : "text-muted-foreground/50 cursor-not-allowed"
              )}
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
              <span className="text-[10px] font-medium">
                {currentQuestionIndex === questions.length - 1 ? "Done" : "Next"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Flashcards View */}
      {currentView === "flashcards" && flashcardDeckTitle && (
        <div className="min-h-screen bg-background flex flex-col animate-in slide-in-from-right-4 duration-200">
          <header className="px-4 pt-14 pb-3 flex-shrink-0">
            <div className="max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={goBack}
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center active:bg-secondary transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <span className="text-muted-foreground text-sm font-medium">
                  {Math.min(flashcardIndex + 1, flashcardCards.length)} / {flashcardCards.length}
                </span>
                <div className="w-10" />
              </div>
              <h1 className="text-lg font-semibold text-foreground truncate pr-2">
                {flashcardDeckTitle}
              </h1>
            </div>
          </header>

          <main className="flex-1 max-w-lg mx-auto w-full px-4 flex flex-col min-h-0">
            {!isFlashcardSessionDone && currentFlashcard ? (
              <>
                <button
                  onClick={() => !showFlashcardAnswer && setShowFlashcardAnswer(true)}
                  className={cn(
                    "flex-1 flex flex-col rounded-2xl border border-border overflow-hidden transition-all",
                    "bg-card text-left min-h-[280px]",
                    !showFlashcardAnswer && "active:bg-secondary/50"
                  )}
                >
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-foreground text-lg font-medium leading-relaxed">
                      {currentFlashcard.front}
                    </p>
                    {showFlashcardAnswer && (
                      <>
                        <div className="border-t border-border my-4 w-full" />
                        <p className="text-foreground text-base leading-relaxed text-muted-foreground">
                          {currentFlashcard.back}
                        </p>
                      </>
                    )}
                  </div>
                </button>

                {showFlashcardAnswer && (
                  <div className="grid grid-cols-4 gap-2 py-4 flex-shrink-0">
                    <button
                      onClick={() => handleFlashcardRate("again")}
                      className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-600 dark:text-red-400 active:opacity-80 transition-opacity"
                    >
                      <span className="text-xs font-medium">&lt;1m</span>
                      <span className="text-xs font-semibold">Again</span>
                    </button>
                    <button
                      onClick={() => handleFlashcardRate("hard")}
                      className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-600 dark:text-orange-400 active:opacity-80 transition-opacity"
                    >
                      <span className="text-xs font-medium">&lt;6m</span>
                      <span className="text-xs font-semibold">Hard</span>
                    </button>
                    <button
                      onClick={() => handleFlashcardRate("good")}
                      className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-green-500/20 border border-green-500/40 text-green-600 dark:text-green-400 active:opacity-80 transition-opacity"
                    >
                      <span className="text-xs font-medium">&lt;10m</span>
                      <span className="text-xs font-semibold">Good</span>
                    </button>
                    <button
                      onClick={() => handleFlashcardRate("easy")}
                      className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-primary/20 border border-primary/40 text-primary active:opacity-80 transition-opacity"
                    >
                      <span className="text-xs font-medium">5d</span>
                      <span className="text-xs font-semibold">Easy</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <div className="bg-card rounded-2xl p-6 border border-border text-center max-w-sm">
                  <h2 className="text-xl font-bold text-foreground mb-2">Session complete</h2>
                  <p className="text-muted-foreground mb-4">
                    You reviewed {flashcardCards.length} card{flashcardCards.length !== 1 ? "s" : ""}.
                  </p>
                  <button
                    onClick={goBack}
                    className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl active:opacity-80 transition-opacity"
                  >
                    Back to Flashcards
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Bottom bar: due + again + good, settings */}
          {!isFlashcardSessionDone && (
            <div className="max-w-lg mx-auto w-full px-4 pb-8 pt-2 flex-shrink-0">
              <div className="bg-card rounded-xl border border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-primary font-semibold underline underline-offset-2">
                    {flashcardCounts.due}
                  </span>
                  <span className="text-muted-foreground">+</span>
                  <span className="text-orange-500 font-semibold">{flashcardCounts.again}</span>
                  <span className="text-muted-foreground">+</span>
                  <span className="text-green-500 font-semibold">{flashcardCounts.good}</span>
                </div>
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center text-primary active:bg-secondary transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={cn(
          "fixed bottom-6 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 z-30 border",
          chatOpen ? "bg-primary border-primary" : "bg-card border-border"
        )}
      >
        {chatOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary" />
        )}
      </button>

      {/* AI Chat Window */}
      {chatOpen && <AIChatWindow onClose={() => setChatOpen(false)} />}
    </div>
  )
}

function AIChatWindow({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "Hi! I'm your DrKard AI assistant. How can I help you study today?" },
  ])

  const sendMessage = () => {
    if (!message.trim()) return
    setMessages((prev) => [...prev, { role: "user", content: message }])
    setMessage("")
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "I can help you with quiz questions, explain concepts, or suggest study strategies. What would you like to focus on?",
        },
      ])
    }, 1000)
  }

  return (
    <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:w-80 bg-card rounded-2xl shadow-2xl z-40 animate-in slide-in-from-bottom-4 duration-200 overflow-hidden border border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground text-sm">DrKard AI</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] p-3 rounded-2xl text-sm",
              msg.role === "ai"
                ? "bg-secondary text-foreground"
                : "bg-primary text-primary-foreground ml-auto"
            )}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask anything..."
            className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={sendMessage}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center active:opacity-80 transition-opacity"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
