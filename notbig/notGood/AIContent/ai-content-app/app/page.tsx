"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Search,
  Filter,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  BookOpen,
  Video,
  HelpCircle,
  MessageCircle,
  Image,
  CreditCard,
  X,
  Bot,
  Hash,
  Send,
  File,
  Type as TypeIcon,
  Sparkles,
  Settings2,
  StickyNote
} from "lucide-react"

const exams = ["All Exams", "USMLE Step 1", "USMLE Step 2 CK", "PLAB 1", "SMLE"]
const contentTypes = ["Telegram", "MCQ", "Summary", "Images", "Flashcards"]

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: '2-digit'
  }).replace(/ /g, ' ');
}

export default function ContentHQ() {
  const [items, setItems] = React.useState([
    {
      id: "7",
      qNumber: "1107",
      mcqCount: 3,
      mcqs: [
        { q: "What is the primary rate-limiting enzyme in glycolysis?", a: "PFK-1" },
        { q: "Which vitamin is a cofactor for pyruvate carboxylase?", a: "Biotin" },
        { q: "Where does the TCA cycle occur?", a: "Mitochondrial Matrix" }
      ],
      title: "Med Ed Telegram Post",
      originalPost: "Top 10 High Yield Biochemistry Topics for Step 1. Check out the full breakdown below. Includes anatomy, physiology, and pathology correlations.",
      channelName: "MedEd Elite",
      telegramType: "txt",
      postDate: "2024-02-14",
      aiDone: true,
      status: "ai done",
      type: "Telegram",
      exam: "USMLE Step 2 CK"
    },
    {
      id: "8",
      qNumber: "1108",
      mcqCount: 1,
      mcqs: [
        { q: "What is the most likely diagnosis for sudden onset chest pain with a widened mediastinum on CXR?", a: "Aortic Dissection" }
      ],
      title: "Radiology Case 101",
      originalPost: "Case of the day: 45y/o male with sudden onset chest pain. CXR attached. Please review the findings and suggest the next best step in management.",
      channelName: "Radiology Daily",
      telegramType: "img",
      postDate: "2024-02-14",
      aiDone: false,
      status: "pending",
      type: "Telegram",
      exam: "USMLE Step 2 CK"
    },
    {
      id: "9",
      qNumber: "1109",
      mcqCount: 5,
      mcqs: [
        { q: "What is the BP threshold for Stage 1 Hypertension?", a: "130/80" },
        { q: "First line drug for hypertension in patients with diabetes?", a: "ACE Inhibitor" },
        { q: "Side effect of Hydrochlorothiazide?", a: "Hypokalemia" },
        { q: "Recommended salt intake per day?", a: "< 2.3g" },
        { q: "Definition of Hypertensive Emergency?", a: ">180/120 with end-organ damage" }
      ],
      title: "Internal Med Guidelines",
      originalPost: "New AHA Hypertension Guidelines 2024 PDF summary. Covers everything from initial diagnosis to complex management in comorbid patients.",
      channelName: "Internal Med MD",
      telegramType: "file",
      postDate: "2024-02-13",
      aiDone: true,
      status: "published",
      type: "Telegram",
      exam: "USMLE Step 2 CK"
    },
    {
      id: "10",
      qNumber: "1110",
      mcqCount: 0,
      mcqs: [],
      title: "Quick Tips: Renal Physiology",
      originalPost: "Remember the GFR calculation for your exams!",
      channelName: "MedEd Elite",
      telegramType: "txt",
      postDate: "2024-02-12",
      aiDone: false,
      status: "pending",
      type: "Telegram",
      exam: "USMLE Step 2 CK"
    },
    {
      id: "1",
      title: "Cardiology MCQ Set",
      type: "MCQ",
      exam: "USMLE Step 1",
      status: "Published",
      lastUpdated: "2024-02-13",
      originalPost: "A 55-year-old male presents with sudden onset chest pain radiating to the left arm...",
      providedAnswer: "B",
      note: "High yield cardiology case.",
      topic: "Cardiology",
      aiEdit: "Consider clarifying the timing of the pain."
    },
    {
      id: "2",
      title: "Respiratory Pathophysiology Summary",
      type: "Summary",
      exam: "USMLE Step 1",
      status: "Draft",
      lastUpdated: "2024-02-12"
    },
    {
      id: "3",
      title: "Pediatrics Shelf Review MCQ",
      type: "MCQ",
      exam: "USMLE Step 2 CK",
      status: "Published",
      lastUpdated: "2024-02-10",
      originalPost: "A 6-year-old girl is brought to the clinic due to a 3-day history of low-grade fever and a rash...",
      providedAnswer: "D",
      note: "Common infectious diseases in children.",
      topic: "Pediatrics",
      aiEdit: "Ensure the rash description is clear."
    },
    {
      id: "4",
      title: "Internal Medicine Ethics Flashcards",
      type: "Flashcards",
      exam: "PLAB 1",
      status: "Published",
      lastUpdated: "2024-02-11"
    },
    {
      id: "5",
      title: "Surgery Fundamentals Images",
      type: "Images",
      exam: "SMLE",
      status: "Review",
      lastUpdated: "2024-02-09",
      image: null,
      aiInterpretation: "The image shows a classic presentation of acute appendicitis with a dilated appendix and periappendiceal fluid.",
      aiQuestion: "What is the most common cause of appendicitis in adults?",
      providedText: "CT scan showing appendiceal findings.",
      originalPost: "Clinical case of acute abdomen."
    },
    {
      id: "6",
      title: "ObGyn High Yield Summary",
      type: "Summary",
      exam: "USMLE Step 2 CK",
      status: "Published",
      lastUpdated: "2024-02-08"
    },
    {
      id: "11",
      title: "Chest X-Ray Pathology",
      type: "Images",
      exam: "USMLE Step 2 CK",
      status: "ai done",
      lastUpdated: "2024-02-07",
      image: null,
      aiInterpretation: "Chest X-ray showing bilateral patchy infiltrates consistent with pulmonary edema.",
      aiQuestion: "Which clinical finding is most associated with this radiological presentation?",
      providedText: "72 y/o patient with SOB.",
      originalPost: "Radiology rounds: Case 42."
    },
  ])

  const [selectedExam, setSelectedExam] = React.useState("USMLE Step 2 CK")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedType, setSelectedType] = React.useState("Telegram")
  const [selectedRows, setSelectedRows] = React.useState<string[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  // Editing state
  const [editingCell, setEditingCell] = React.useState<{ id: string, field: string } | null>(null)
  const [editValue, setEditValue] = React.useState("")

  // OpenRouter Integration
  const [openRouterApiKey] = React.useState("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")
  const [selectedModel, setSelectedModel] = React.useState("openai/gpt-4")
  const [totalCredits, setTotalCredits] = React.useState<number | null>(null)
  const [totalUsage, setTotalUsage] = React.useState<number | null>(null)
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const [isFieldManagerOpen, setIsFieldManagerOpen] = React.useState(false)
  const [selectedItemForMcqs, setSelectedItemForMcqs] = React.useState<any>(null)
  const [availableModels, setAvailableModels] = React.useState<any[]>([])
  const [modelSearch, setModelSearch] = React.useState("")
  const [isModelsLoading, setIsModelsLoading] = React.useState(true)

  // Track which columns have prompts configured
  const [columnPrompts, setColumnPrompts] = React.useState({
    qNumber: "",
    originalPost: "Extract high-yield medical facts from this text",
    channelName: "",
    mcqCount: "Count how many MCQs are in the text",
    postDate: "",
    status: "Determine if content is ready for publishing",
    title: "",
    type: "Generate content type based on the title",
    exam: "",
    lastUpdated: ""
  })

  const [aiFields, setAiFields] = React.useState<string[]>(['originalPost', 'mcqCount', 'status'])

  const handleCellEdit = (id: string, field: string, value: any) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
    setEditingCell(null)
  }

  const filteredContent = items.filter(item => {
    const matchExam = selectedExam === "All Exams" || item.exam === selectedExam
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.originalPost?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.qNumber?.toString() || "").includes(searchTerm) ||
      (item.mcqCount?.toString() || "").includes(searchTerm)
    const matchType = selectedType === "Telegram" || item.type === selectedType
    return matchExam && matchSearch && matchType
  })

  // Pagination
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedContent = filteredContent.slice(startIndex, endIndex)

  const getIcon = (type: string) => {
    switch (type) {
      case "MCQ": return <HelpCircle className="h-4 w-4" />
      case "Summary": return <BookOpen className="h-4 w-4" />
      case "Images": return <Video className="h-4 w-4" />
      case "Flashcards": return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTabIcon = (type: string) => {
    switch (type) {
      case "Telegram": return <MessageCircle className="h-5 w-5" />
      case "MCQ": return <HelpCircle className="h-5 w-5" />
      case "Summary": return <BookOpen className="h-5 w-5" />
      case "Images": return <Image className="h-5 w-5" />
      case "Flashcards": return <CreditCard className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const toggleAllRows = () => {
    if (selectedRows.length === paginatedContent.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(paginatedContent.map(item => item.id))
    }
  }

  const isAllSelected = paginatedContent.length > 0 && selectedRows.length === paginatedContent.length

  // Fetch credits and models from OpenRouter
  React.useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/credits', {
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
          }
        })
        const data = await response.json()
        if (data.data) {
          setTotalCredits(data.data.total_credits)
          setTotalUsage(data.data.total_usage)
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error)
      }
    }

    const fetchModels = async () => {
      setIsModelsLoading(true)
      try {
        const response = await fetch('https://openrouter.ai/api/v1/models')
        const data = await response.json()
        if (data.data) {
          const formatted = data.data.map((m: any) => {
            const provider = m.id.split('/')[0]
            const promptCost = parseFloat(m.pricing?.prompt || "0") * 1000000
            const completionCost = parseFloat(m.pricing?.completion || "0") * 1000000

            // Premium color mapping
            const colors: Record<string, string> = {
              'openai': '#10a37f',
              'anthropic': '#d97757',
              'google': '#4285f4',
              'meta': '#0668E1',
              'mistralai': '#F5D140',
              'perplexity': '#20C997',
              'microsoft': '#00A4EF',
              'deepseek': '#60A5FA'
            }

            return {
              id: m.id,
              name: m.name,
              company: provider.charAt(0).toUpperCase() + provider.slice(1),
              cost: promptCost === 0 ? "Free" : `$${promptCost.toFixed(2)}`,
              completionCost: completionCost === 0 ? "Free" : `$${completionCost.toFixed(2)}`,
              color: colors[provider] || '#6B7280'
            }
          })
          setAvailableModels(formatted)
        }
      } catch (error) {
        console.error('Failed to fetch models:', error)
      } finally {
        setIsModelsLoading(false)
      }
    }

    fetchCredits()
    fetchModels()

    // Refresh credits every 60 seconds
    const interval = setInterval(fetchCredits, 60000)
    return () => clearInterval(interval)
  }, [openRouterApiKey])

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-8 py-3">
          <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full lg:w-auto flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 whitespace-nowrap">HQ</h1>
              <div className="h-8 w-px bg-gray-200 hidden lg:block"></div>

              {/* Exam Filter */}
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="w-[180px] border-gray-200 shadow-sm">
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(exam => (
                    <SelectItem key={exam} value={exam}>{exam}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative flex-1 lg:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search content..."
                  className="pl-9 bg-white border-gray-200 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Content Type Text Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl">
                {contentTypes.map((type) => {
                  const count = type === "Telegram"
                    ? items.filter(item => {
                      const matchExam = selectedExam === "All Exams" || item.exam === selectedExam
                      const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
                      return matchExam && matchSearch
                    }).length
                    : items.filter(item => {
                      const matchExam = selectedExam === "All Exams" || item.exam === selectedExam
                      const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
                      return matchExam && matchSearch && item.type === type
                    }).length

                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${selectedType === type
                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                        : "text-gray-600 hover:bg-gray-200/50"
                        }`}
                    >
                      <span>{type}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${selectedType === type
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-200 text-gray-500"
                        }`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-3">
              {/* Model Selection with Full OpenRouter List */}
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[300px] border-gray-200 shadow-sm bg-gray-50/50 hover:bg-gray-100 transition-colors">
                  <SelectValue placeholder={isModelsLoading ? "Loading models..." : "Select Model"} />
                </SelectTrigger>
                <SelectContent className="max-h-[500px] w-[350px]">
                  <div className="p-2 border-b bg-gray-50/50 sticky top-0 z-10">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-gray-400" />
                      <Input
                        placeholder="Search 200+ models..."
                        className="pl-8 h-9 text-sm bg-white border-gray-200"
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="py-1">
                    {availableModels
                      .filter(m =>
                        m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
                        m.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
                        m.company.toLowerCase().includes(modelSearch.toLowerCase())
                      )
                      .slice(0, 300) // Support searching through 300+ models
                      .map(model => (
                        <SelectItem key={model.id} value={model.id} className="cursor-pointer py-3 border-b border-gray-50 last:border-0">
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: model.color }}
                                />
                                <span className="font-bold text-gray-900 text-sm">{model.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-tighter">In: {model.cost}</span>
                                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 uppercase tracking-tighter">Out: {model.completionCost}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                              <span>{model.company}</span>
                              <span className="opacity-50 truncate ml-4 font-mono">{model.id}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    {availableModels.length === 0 && !isModelsLoading && (
                      <div className="py-8 text-center text-sm text-gray-400">No models found</div>
                    )}
                  </div>
                </SelectContent>
              </Select>

              {/* Credit Balance & Today's Cost */}
              <div className="flex items-center gap-2">
                {(totalCredits !== null && totalUsage !== null) && (
                  <div className="px-3 py-1.5 bg-green-50/50 border border-green-200 rounded-lg text-sm">
                    <span className="font-semibold text-green-700">${((totalCredits || 0) - (totalUsage || 0)).toFixed(2)}</span>
                    <span className="text-[10px] text-green-600 ml-1 uppercase tracking-wider font-bold">remaining</span>
                  </div>
                )}
                {totalUsage !== null && (
                  <div className="px-3 py-1.5 bg-orange-50/50 border border-orange-200 rounded-lg text-sm">
                    <span className="font-semibold text-orange-700">${totalUsage.toFixed(2)}</span>
                    <span className="text-[10px] text-orange-600 ml-1 uppercase tracking-wider font-bold">used</span>
                  </div>
                )}
              </div>

              {/* Fields Manager Button */}
              <Button
                variant="outline"
                size="sm"
                className="bg-white whitespace-nowrap border-gray-200 shadow-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => setIsFieldManagerOpen(true)}
              >
                <Settings2 className="mr-2 h-4 w-4" /> Fields
              </Button>

              {/* Filter Button */}
              <Button
                variant="outline"
                size="sm"
                className="bg-white whitespace-nowrap border-gray-200 shadow-sm font-semibold"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Table - Full Width */}
      <div className="w-full flex-1 overflow-auto bg-white px-8 pb-8">
        <div className="min-w-full inline-block align-middle border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <Table className="border-collapse">
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-b border-gray-200">
                <TableHead className="w-16 pl-6 text-center">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleAllRows}
                    aria-label="Select all"
                  />
                </TableHead>
                {selectedType === "Telegram" ? (
                  <>
                    <TableHead className="font-bold text-gray-900 h-12 w-20 text-center uppercase text-[11px] tracking-wider">ID</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 min-w-[400px] uppercase text-[11px] tracking-wider">
                      <div className="flex items-center gap-2">
                        Original Post
                        {aiFields.includes('originalPost') && <Sparkles className="h-3 w-3 text-blue-500" />}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 w-48 uppercase text-[11px] tracking-wider">Channel</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 w-20 text-center uppercase text-[11px] tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        MCQs
                        {aiFields.includes('mcqCount') && <Sparkles className="h-3 w-3 text-blue-500" />}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 w-32 uppercase text-[11px] tracking-wider">Post Date</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 w-40 uppercase text-[11px] tracking-wider">
                      <div className="flex items-center gap-2">
                        Status
                        {aiFields.includes('status') && <Sparkles className="h-3 w-3 text-blue-500" />}
                      </div>
                    </TableHead>
                  </>
                ) : selectedType === "Images" ? (
                  <>
                    <TableHead className="font-bold text-gray-900 h-12 w-24 uppercase text-[11px] tracking-wider pl-4">Image</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 w-64 uppercase text-[11px] tracking-wider">Post Data</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 min-w-[300px] uppercase text-[11px] tracking-wider">AI Interpretation ✨</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 min-w-[250px] uppercase text-[11px] tracking-wider">AI Question ✨</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 w-48 uppercase text-[11px] tracking-wider">Caption</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 w-32 uppercase text-[11px] tracking-wider">Status ✨</TableHead>
                  </>
                ) : selectedType === "MCQ" ? (
                  <>
                    <TableHead className="font-bold text-gray-900 h-12 min-w-[300px] uppercase text-[11px] tracking-wider">Original Post</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 w-32 uppercase text-[11px] tracking-wider">Tele Answer</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 w-48 uppercase text-[11px] tracking-wider">Note</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 w-40 uppercase text-[11px] tracking-wider">Category/Topic</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 w-48 uppercase text-[11px] tracking-wider">AI Edit ✨</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 w-32 uppercase text-[11px] tracking-wider">Status</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="font-bold text-gray-900 h-12 uppercase text-[11px] tracking-wider">Title</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 w-32 uppercase text-[11px] tracking-wider">Type</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 w-40 uppercase text-[11px] tracking-wider">Exam</TableHead>
                    <TableHead className="font-bold text-gray-900 h-12 w-32 uppercase text-[11px] tracking-wider">Status</TableHead>
                    <TableHead className="text-right pr-6 font-bold text-gray-900 h-12 w-40 uppercase text-[11px] tracking-wider">Last Updated</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContent.length > 0 ? (
                paginatedContent.map((item, index) => (
                  <TableRow
                    key={item.id}
                    onClick={() => toggleRowSelection(item.id)}
                    className={`group transition-all hover:bg-blue-50/30 border-b border-gray-100 last:border-0 ${selectedRows.includes(item.id)
                      ? "bg-blue-50/50 hover:bg-blue-100/40"
                      : "bg-white"
                      }`}
                  >
                    <TableCell className="pl-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.includes(item.id)}
                        onCheckedChange={() => toggleRowSelection(item.id)}
                      />
                    </TableCell>

                    {selectedType === "Telegram" ? (
                      <>
                        <TableCell
                          className="py-4 text-center"
                        >
                          <span className="font-mono text-sm font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 transition-colors">
                            {item.qNumber || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div
                            className="flex flex-col gap-1 max-w-[600px]"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation()
                              setEditingCell({ id: item.id, field: 'originalPost' })
                              setEditValue(item.originalPost || "")
                            }}
                          >
                            {editingCell?.id === item.id && editingCell?.field === 'originalPost' ? (
                              <Textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleCellEdit(item.id, 'originalPost', editValue)}
                                autoFocus
                                className="min-h-[120px] text-sm"
                              />
                            ) : (
                              <p className="text-sm leading-relaxed text-gray-700 whitespace-normal break-words cursor-text line-clamp-3 hover:line-clamp-none transition-all">
                                {item.originalPost}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className="py-4 text-sm"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            setEditingCell({ id: item.id, field: 'channelName' })
                            setEditValue(item.channelName || "")
                          }}
                        >
                          {editingCell?.id === item.id && editingCell?.field === 'channelName' ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleCellEdit(item.id, 'channelName', editValue)}
                              onKeyDown={(e) => e.key === 'Enter' && handleCellEdit(item.id, 'channelName', editValue)}
                              autoFocus
                              className="h-8"
                            />
                          ) : (
                            <div className="flex items-center gap-1.5 text-gray-500 font-medium italic truncate max-w-[150px]">
                              <Hash className="h-3 w-3 opacity-50" />
                              {item.channelName}
                            </div>
                          )}
                        </TableCell>
                        <TableCell
                          className="py-4 text-center"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            if ((item.mcqCount || 0) > 0) {
                              setSelectedItemForMcqs(item)
                            }
                          }}
                        >
                          <div className={`inline-flex items-center justify-center gap-1 group/mcq min-w-[32px] h-7 px-2 rounded-full text-[11px] font-bold transition-all border ${(item.mcqCount || 0) > 0 ? 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white cursor-pointer shadow-sm' : 'bg-gray-50 text-gray-400 border-gray-100 shadow-none pointer-events-none'}`}>
                            {item.mcqCount || 0}
                            {aiFields.includes('mcqCount') && (item.mcqCount || 0) > 0 && <Sparkles className="h-3 w-3 fill-current opacity-70" />}
                          </div>
                        </TableCell>
                        <TableCell
                          className="py-4 text-sm text-gray-500 font-bold whitespace-nowrap"
                        >
                          {formatDate(item.postDate || "")}
                        </TableCell>
                        <TableCell
                          className="py-4"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            setEditingCell({ id: item.id, field: 'status' })
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation()
                                handleCellEdit(item.id, 'aiDone', !item.aiDone)
                              }}
                              className={`p-1 rounded-md transition-all shadow-sm border ${item.aiDone ? 'bg-blue-600 text-white border-blue-700 shadow-blue-200/50' : 'bg-white text-gray-400 border-gray-200 hover:text-gray-600 hover:bg-gray-50'}`}
                            >
                              <Bot className="h-4 w-4" />
                            </button>

                            {editingCell?.id === item.id && editingCell?.field === 'status' ? (
                              <Select
                                defaultValue={item.status}
                                onValueChange={(val) => handleCellEdit(item.id, 'status', val)}
                                open={true}
                              >
                                <SelectContent>
                                  <SelectItem value="published">published</SelectItem>
                                  <SelectItem value="ai done">ai done</SelectItem>
                                  <SelectItem value="pending">pending</SelectItem>
                                  <SelectItem value="rejected">rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className={`flex items-center gap-1.5 font-bold text-[10px] px-2.5 py-1 rounded-full w-fit border uppercase shadow-sm ${item.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' :
                                item.status === 'ai done' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  item.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'published' ? 'bg-green-500' :
                                  item.status === 'ai done' ? 'bg-blue-500' :
                                    item.status === 'pending' ? 'bg-amber-500' :
                                      'bg-red-500'
                                  }`} />
                                {item.status}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </>
                    ) : selectedType === "Images" ? (
                      <>
                        <TableCell className="py-4 pl-4">
                          <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden relative shadow-inner group-hover:border-blue-200 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-200/20 to-gray-400/10 animate-pulse" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Image className="h-5 w-5 text-gray-400 opacity-50" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col gap-1.5 max-w-[250px]">
                            <span className="font-bold text-gray-900 text-sm truncate">{item.title}</span>
                            <span className="text-[11px] text-gray-500 line-clamp-2 italic leading-relaxed">{item.originalPost}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-[11px] leading-relaxed text-gray-700 font-medium max-w-[300px]">
                            {item.aiInterpretation || "Awaiting AI interpretation..."}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-[11px] leading-relaxed text-gray-900 font-bold italic max-w-[250px]">
                            {item.aiQuestion || "Generating question..."}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 text-[11px] text-gray-600 bg-gray-50 px-2.5 py-2 rounded-lg border border-gray-100 w-fit">
                            <MessageCircle className="h-3 w-3 opacity-50" />
                            <span className="truncate max-w-[150px] font-medium">{item.providedText || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className={`flex items-center gap-1.5 font-bold text-[10px] px-2.5 py-1 rounded-full w-fit border uppercase shadow-sm ${item.status === 'published' || item.status === 'Published' ? 'bg-green-50 text-green-700 border-green-200' :
                            item.status === 'ai done' || item.status === 'Review' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              item.status === 'pending' || item.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'published' || item.status === 'Published' ? 'bg-green-500' :
                              item.status === 'ai done' || item.status === 'Review' ? 'bg-blue-500' :
                                item.status === 'pending' || item.status === 'Draft' ? 'bg-amber-500' :
                                  'bg-red-500'
                              }`} />
                            {item.status}
                          </div>
                        </TableCell>
                      </>
                    ) : selectedType === "MCQ" ? (
                      <>
                        <TableCell className="py-4">
                          <div className="flex flex-col gap-1 max-w-[400px]">
                            <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-2 italic">{item.originalPost || ""}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-700 font-bold border border-green-100 mx-auto">
                            {item.providedAnswer || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-start gap-2 bg-gray-50/50 p-2 rounded-lg border border-gray-100 text-xs text-gray-600 italic">
                            <StickyNote className="h-3 w-3 mt-0.5 opacity-50" />
                            <span className="line-clamp-2">{item.note || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                            {item.topic || "General"}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 text-[11px] text-amber-900 font-medium italic leading-relaxed max-w-[200px]">
                            {item.aiEdit || "Standard AI review pending..."}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className={`flex items-center gap-1.5 font-bold text-[10px] px-2.5 py-1 rounded-full w-fit border uppercase shadow-sm ${item.status === 'Published' || item.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' :
                            item.status === 'Draft' || item.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Published' || item.status === 'published' ? 'bg-green-500' :
                              item.status === 'Draft' || item.status === 'pending' ? 'bg-amber-500' :
                                'bg-red-500'
                              }`} />
                            {item.status}
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="py-4">
                          <div
                            className="flex items-center gap-3"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation()
                              setEditingCell({ id: item.id, field: 'title' })
                              setEditValue(item.title || "")
                            }}
                          >
                            <div className={`p-1.5 rounded-lg border ${item.type === "MCQ" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"}`}>
                              {item.type === "MCQ" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <BookOpen className="h-4 w-4" />
                              )}
                            </div>
                            {editingCell?.id === item.id && editingCell?.field === 'title' ? (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleCellEdit(item.id, 'title', editValue)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCellEdit(item.id, 'title', editValue)}
                                autoFocus
                                className="h-8 py-1"
                              />
                            ) : (
                              <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className="py-4"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            setEditingCell({ id: item.id, field: 'type' })
                          }}
                        >
                          {editingCell?.id === item.id && editingCell?.field === 'type' ? (
                            <Select
                              defaultValue={item.type}
                              onValueChange={(val) => handleCellEdit(item.id, 'type', val)}
                              open={true}
                            >
                              <SelectContent>
                                {contentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-gray-50 text-gray-500 border border-gray-100">
                              {item.type.toUpperCase()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell
                          className="py-4"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            setEditingCell({ id: item.id, field: 'exam' })
                            setEditValue(item.exam || "")
                          }}
                        >
                          <div className="text-sm font-medium text-gray-700 bg-gray-50/50 px-2 py-1 rounded inline-block border border-gray-100">
                            {item.exam}
                          </div>
                        </TableCell>
                        <TableCell
                          className="py-4"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            setEditingCell({ id: item.id, field: 'status' })
                          }}
                        >
                          <div className={`flex items-center gap-1.5 font-bold text-[10px] px-2.5 py-1 rounded-full w-fit border uppercase shadow-sm ${item.status === 'Published' || item.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' :
                            item.status === 'Draft' || item.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Published' || item.status === 'published' ? 'bg-green-500' :
                              item.status === 'Draft' ? 'bg-amber-500' :
                                'bg-red-500'
                              }`} />
                            {item.status}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6 py-4">
                          <span className="text-xs font-mono text-gray-400">{item.lastUpdated}</span>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={selectedType === "Telegram" || selectedType === "Images" || selectedType === "MCQ" ? 7 : 6} className="h-64 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-8 w-8 opacity-20" />
                      <p className="font-medium">No results found for your search criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Container */}
      {
        filteredContent.length > 0 && (
          <div className="p-4 border-t border-gray-300 bg-white">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 font-medium">
                Showing <span className="text-gray-900">{startIndex + 1}</span> to{" "}
                <span className="text-gray-900">{Math.min(endIndex, filteredContent.length)}</span> of{" "}
                <span className="text-gray-900">{filteredContent.length}</span> results
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50 font-medium" : "cursor-pointer font-medium"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer font-medium"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50 font-medium" : "cursor-pointer font-medium"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )
      }

      {/* Field Manager Sidebar */}
      {
        isFieldManagerOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-50 transition-opacity"
              onClick={() => setIsFieldManagerOpen(false)}
            />
            <div className="fixed right-0 top-0 bottom-0 w-[450px] bg-white shadow-2xl z-50 border-l border-gray-200 overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8 border-b pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Field Manager</h2>
                    <p className="text-sm text-gray-500">Configure AI rules and field properties</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsFieldManagerOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <div className="space-y-8">
                  {Object.keys(columnPrompts).map((key) => {
                    const isAiEnabled = aiFields.includes(key)
                    const label = key.replace(/([A-Z])/g, ' $1').trim()

                    return (
                      <div key={key} className={`p-4 rounded-xl border transition-all ${isAiEnabled ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 bg-gray-50/30'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isAiEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                              {isAiEnabled ? <Sparkles className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 capitalize text-sm">{label}</h3>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                {isAiEnabled ? 'AI Managed' : 'Manual Entry'}
                              </p>
                            </div>
                          </div>
                          <Checkbox
                            checked={isAiEnabled}
                            onCheckedChange={() => {
                              setAiFields(prev =>
                                prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
                              )
                            }}
                          />
                        </div>

                        {isAiEnabled && (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-xs font-bold text-blue-700/70 uppercase">AI Prompt / Rule</label>
                            <Textarea
                              placeholder={`Define how AI should handle ${label}...`}
                              value={columnPrompts[key as keyof typeof columnPrompts]}
                              onChange={(e) => setColumnPrompts(prev => ({ ...prev, [key]: e.target.value }))}
                              className="text-sm min-h-[80px] bg-white border-blue-100 focus:border-blue-400 focus:ring-blue-100 transition-all rounded-lg"
                            />
                            <div className="flex gap-2">
                              <div className="px-2 py-1 bg-blue-100 rounded text-[10px] font-bold text-blue-600 uppercase">Auto-updates</div>
                              <div className="px-2 py-1 bg-white border border-blue-100 rounded text-[10px] font-bold text-blue-600 uppercase">Live Preview</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )
      }

      {/* Filter Sidebar */}
      {
        isFilterOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-50 transition-opacity"
              onClick={() => setIsFilterOpen(false)}
            />
            <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 border-l border-gray-200 overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-gray-900">Advanced Filter</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsFilterOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <p className="text-sm text-gray-500">Filter controls will go here...</p>
                </div>
              </div>
            </div>
          </>
        )
      }
      {/* MCQ Viewer Modal */}
      {
        selectedItemForMcqs && (
          <>
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity animate-in fade-in duration-300"
              onClick={() => setSelectedItemForMcqs(null)}
            />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl z-[70] overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg shadow-blue-200/50 shadow-lg">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">AI Identified MCQs</h2>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Extracted from ID #{selectedItemForMcqs.qNumber}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedItemForMcqs(null)} className="rounded-full hover:bg-white/50">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)] space-y-6">
                {selectedItemForMcqs.mcqs?.map((mcq: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                    <div className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
                        {i + 1}
                      </span>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-800 leading-relaxed italic">"{mcq.q}"</p>
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-0.5 rounded bg-green-100 text-[10px] font-bold text-green-700 uppercase">Correct Answer</div>
                          <p className="text-sm font-bold text-gray-900">{mcq.a}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <Button onClick={() => setSelectedItemForMcqs(null)} className="bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-200/50">
                  Close Viewer
                </Button>
              </div>
            </div>
          </>
        )
      }
    </div>
  );
}
