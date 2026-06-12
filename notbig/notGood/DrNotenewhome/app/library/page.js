"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  X,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Image,
  Tag,
  Copy,
  Check,
  Zap,
  HelpCircle,
  Layers,
  Pin,
  Grid3X3,
  Bot,
  Send,
  LayoutList,
  MessageSquare,
} from "lucide-react";

const libraryItems = [
  {
    type: "topic",
    name: "Cardiovascular System",
    abbr: "CVS",
    color: "#E11D48",
    bg: "#F43F5E",
    count: "24 cards",
  },
  {
    type: "content",
    id: 1,
    title: "First-line Antihypertensives",
    body:
      "ACE inhibitors (e.g., Enalapril) and ARBs (e.g., Losartan) are first-line for hypertension with comorbid diabetes or CKD. Thiazide diuretics and CCBs are preferred in uncomplicated hypertension.\n\nKey point: ACEi are contraindicated in pregnancy and bilateral renal artery stenosis.",
    tags: ["Pharmacology", "Cardiology"],
    sources: [
      {
        title: "Harrison's Principles of Internal Medicine",
        chapter: "Ch. 271 — Hypertensive Vascular Disease",
        page: "pp. 1890–1905",
      },
      {
        title: "NICE Guidelines CG127",
        chapter: "Hypertension in Adults",
        page: "Updated 2022",
      },
      {
        title: "First Aid for USMLE Step 1",
        chapter: "Cardiovascular Pharmacology",
        page: "p. 323",
      },
    ],
    hasImage: false,
    hasTable: false,
  },
  {
    type: "flashcard",
    id: 10,
    front: "What is the mechanism of action of ACE inhibitors?",
    back:
      "ACE inhibitors block the conversion of angiotensin I to angiotensin II, reducing vasoconstriction and aldosterone secretion, lowering blood pressure.",
    tags: ["Pharmacology"],
  },
  {
    type: "content",
    id: 2,
    title: "ECG Interpretation: ST-Elevation Patterns",
    body:
      "ST elevation in leads II, III, aVF indicates inferior MI (RCA occlusion). ST elevation in V1–V4 indicates anterior MI (LAD occlusion). Always check reciprocal changes for confirmation.",
    tags: ["Cardiology", "Diagnostics"],
    sources: [
      {
        title: "Braunwald's Heart Disease",
        chapter: "Ch. 13 — Electrocardiography",
        page: "pp. 126–148",
      },
      {
        title: "ECG Made Easy by Hampton",
        chapter: "ST Segment Changes",
        page: "pp. 78–92",
      },
    ],
    hasImage: true,
    imageLabel: "12-lead ECG showing inferior STEMI pattern",
    hasTable: false,
  },
  {
    type: "question",
    id: 20,
    question:
      "A 58-year-old male presents with acute chest pain. ECG shows ST elevation in leads II, III, and aVF. Which coronary artery is most likely occluded?",
    options: [
      "Left anterior descending",
      "Right coronary artery",
      "Left circumflex",
      "Left main",
    ],
    answer: 1,
    explanation:
      "ST elevation in leads II, III, and aVF indicates an inferior MI, which is most commonly caused by occlusion of the right coronary artery (RCA).",
    tags: ["Cardiology"],
  },
  {
    type: "topic",
    name: "Renal Physiology",
    abbr: "RENAL",
    color: "#0E7490",
    bg: "#0891B2",
    count: "18 cards",
  },
  {
    type: "content",
    id: 3,
    title: "Electrolyte Imbalances: Quick Reference",
    body:
      "Critical values to memorize for exam day. Hypokalemia and hyperkalemia both cause cardiac arrhythmias — always check ECG findings.",
    tags: ["Biochemistry", "Emergency"],
    sources: [
      {
        title: "Guyton & Hall Textbook of Medical Physiology",
        chapter: "Ch. 30 — Regulation of Potassium",
        page: "pp. 381–396",
      },
      {
        title: "First Aid for USMLE Step 1",
        chapter: "Renal Physiology",
        page: "p. 590",
      },
      {
        title: "UpToDate",
        chapter: "Clinical manifestations of hyperkalemia",
        page: "2024 Review",
      },
      {
        title: "Kaplan Biochemistry Lecture Notes",
        chapter: "Electrolyte Disorders",
        page: "pp. 201–215",
      },
    ],
    hasImage: false,
    hasTable: true,
    tableData: {
      headers: ["Condition", "Key Lab", "ECG Finding", "Treatment"],
      rows: [
        ["Hypokalemia", "K⁺ < 3.5", "U waves, flat T", "KCl replacement"],
        ["Hyperkalemia", "K⁺ > 5.5", "Peaked T, wide QRS", "Ca gluconate, insulin"],
        ["Hyponatremia", "Na⁺ < 135", "—", "Fluid restrict / NS"],
        ["Hypocalcemia", "Ca²⁺ < 8.5", "Prolonged QT", "IV calcium"],
      ],
    },
  },
  {
    type: "flashcard",
    id: 11,
    front: "What are the ECG findings in hyperkalemia?",
    back:
      "Peaked T waves → widened QRS → sine wave pattern → ventricular fibrillation. Treat urgently with IV calcium gluconate to stabilize the myocardium.",
    tags: ["Biochemistry", "Emergency"],
  },
  {
    type: "content",
    id: 4,
    title: "Drug-Induced Lupus",
    body:
      'Classic triad: arthralgias, serositis, positive anti-histone antibodies. Unlike SLE, renal and CNS involvement are rare.\n\nHigh-yield drugs: Hydralazine, Procainamide, Isoniazid, Minocycline, TNF-α inhibitors.\n\nMnemonic: "HIP Mine TNF"',
    tags: ["Pharmacology", "Rheumatology"],
    sources: [
      {
        title: "Robbins & Cotran Pathologic Basis of Disease",
        chapter: "Ch. 6 — Autoimmunity",
        page: "pp. 224–228",
      },
      {
        title: "First Aid for USMLE Step 1",
        chapter: "Immunology",
        page: "p. 472",
      },
    ],
    hasImage: false,
    hasTable: false,
  },
  {
    type: "topic",
    name: "Neuroanatomy",
    abbr: "NEURO",
    color: "#5B21B6",
    bg: "#7C3AED",
    count: "31 cards",
  },
  {
    type: "question",
    id: 21,
    question:
      "A patient presents with loss of pain and temperature sensation on the right side of the body and loss of proprioception on the left. Which condition is most likely?",
    options: [
      "Brown-Séquard syndrome (left)",
      "Anterior cord syndrome",
      "Posterior cord syndrome",
      "Syringomyelia",
    ],
    answer: 0,
    explanation:
      "Brown-Séquard syndrome (hemisection of spinal cord) causes ipsilateral motor loss and proprioception loss, with contralateral pain/temperature loss.",
    tags: ["Neurology"],
  },
  {
    type: "content",
    id: 5,
    title: "Cranial Nerves: Motor vs Sensory",
    body:
      "Pure motor: III, IV, VI, XI, XII. Pure sensory: I, II, VIII. Mixed: V, VII, IX, X.\n\nClinical pearl: CN VII (facial nerve) — UMN lesion spares the forehead; LMN lesion affects the entire half of the face.",
    tags: ["Anatomy", "Neurology"],
    sources: [
      {
        title: "Gray's Anatomy for Students",
        chapter: "Ch. 8 — Head and Neck",
        page: "pp. 812–845",
      },
    ],
    hasImage: true,
    imageLabel: "Cranial nerve exit points from brainstem",
    hasTable: false,
  },
  {
    type: "topic",
    name: "Microbiology",
    abbr: "MICRO",
    color: "#047857",
    bg: "#059669",
    count: "22 cards",
  },
  {
    type: "flashcard",
    id: 12,
    front: "Catalase-positive, coagulase-positive gram-positive cocci — what organism?",
    back:
      "Staphylococcus aureus. Key virulence factors include protein A, coagulase, and various toxins (TSST-1, exfoliative toxin, enterotoxins).",
    tags: ["Microbiology"],
  },
  {
    type: "content",
    id: 6,
    title: "Gram-Positive Cocci: Classification",
    body:
      "Catalase-positive → Staphylococci. Then coagulase test: positive = S. aureus, negative = S. epidermidis / S. saprophyticus.\n\nCatalase-negative → Streptococci. Then hemolysis pattern: α = S. pneumoniae / viridans, β = S. pyogenes (Group A) / S. agalactiae (Group B).",
    tags: ["Microbiology"],
    sources: [
      {
        title: "Jawetz Medical Microbiology",
        chapter: "Ch. 13 — The Staphylococci",
        page: "pp. 199–212",
      },
      {
        title: "Sketchy Micro",
        chapter: "Gram-Positive Cocci",
        page: "Video + Notes",
      },
      {
        title: "First Aid for USMLE Step 1",
        chapter: "Microbiology",
        page: "p. 133",
      },
    ],
    hasImage: false,
    hasTable: false,
  },
];

const aiResponses = [
  "That's a great question! Let me explain this in more detail.",
  "Based on the content, here's what you should focus on for the exam.",
  "Think of it this way — the key mechanism involves the RAAS pathway.",
  "Good thinking! Here's a clinical scenario to help you remember this.",
];

/* ─── Themes ─── */
const THEMES = {
  current: {
    id: "current",
    pageBg: "#F4F4F3",
    cardBg: "#fff",
    cardBorder: "1px solid #E4E4E7",
    textPrimary: "#18181B",
    textSecondary: "#52525B",
    textTertiary: "#A1A1AA",
    textBody: "#374151",
    textMuted: "#6B7280",
    tagBg: "#F4F4F5",
    tagColor: "#52525B",
    divider: "#F4F4F5",
    dividerStrong: "#E4E4E7",
    barBg: "rgba(255,255,255,0.88)",
    barBorder: "rgba(228,228,231,0.7)",
    barShadow: "0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
    searchBg: "#fff",
    searchBorderIdle: "#E4E4E7",
    searchBorderFocus: "#18181B",
    searchShadowFocus: "0 0 0 4px rgba(24,24,27,0.06), 0 2px 8px rgba(0,0,0,0.04)",
    searchColor: "#111827",
    placeholderColor: "#A1A1AA",
    clearBtnBg: "#F4F4F5",
    clearBtnColor: "#52525B",
    filterActiveBg: "#18181B",
    filterActiveColor: "#fff",
    filterActiveBorder: "#18181B",
    filterInactiveBg: "rgba(255,255,255,0.7)",
    filterInactiveBorder: "#E4E4E7",
    filterInactiveColor: "#52525B",
    filterInactiveHoverBg: "#FAFAFA",
    filterInactiveHoverBorder: "#D4D4D8",
    topicCardBg: null,
    topicAbbrBg: "rgba(255,255,255,0.9)",
    topicAbbrColor: null,
    topicCountColor: "rgba(255,255,255,0.75)",
    qBadgeBg: "#FEF3C7",
    qBadgeColor: "#D97706",
    qBadgeIconColor: "#D97706",
    fcBadgeBg: "#EDE9FE",
    fcBadgeColor: "#7C3AED",
    fcBadgeIconColor: "#7C3AED",
    aiColor: "#7C3AED",
    optionBg: "#FAFAFA",
    optionBorder: "1.5px solid #E4E4E7",
    optionColor: "#3F3F46",
    optionLetterBg: "#F4F4F5",
    optionLetterColor: "#71717A",
    optionCorrectBg: "#F0FDF4",
    optionCorrectBorder: "1.5px solid #86EFAC",
    optionCorrectColor: "#15803D",
    optionCorrectLetterBg: "#DCFCE7",
    optionCorrectLetterColor: "#16A34A",
    optionWrongBg: "#FEF2F2",
    optionWrongBorder: "1.5px solid #FECACA",
    optionWrongColor: "#DC2626",
    optionWrongLetterBg: "#FEE2E2",
    optionWrongLetterColor: "#DC2626",
    explBg: "#F9FAFB",
    explBorder: "1px solid #E4E4E7",
    explColor: "#374151",
    tableHeadBg: "#F9FAFB",
    tableHeadColor: "#18181B",
    tableCellColor: "#3F3F46",
    tableBorder: "#E4E4E7",
    tableRowBorder: "#F4F4F5",
    footerBtnColor: "#71717A",
    footerBtnHoverBg: "#F4F4F5",
    copySuccessColor: "#16A34A",
    feedbackUpBg: "#F0FDF4",
    feedbackUpBorder: "#BBF7D0",
    feedbackUpColor: "#16A34A",
    feedbackDownBg: "#FEF2F2",
    feedbackDownBorder: "#FECACA",
    feedbackDownColor: "#DC2626",
    feedbackIdleColor: "#A1A1AA",
    pinActiveBg: "#FEF3C7",
    pinActiveBorder: "1px solid #FDE68A",
    pinActiveColor: "#D97706",
    pinIdleColor: "#C4C4CC",
    panelBg: "#fff",
    panelBorder: "#F4F4F5",
    panelOverlay: "rgba(0,0,0,0.25)",
    panelShadow: "-8px 0 40px rgba(0,0,0,0.1)",
    panelTitleColor: "#18181B",
    panelCloseBg: "#F4F4F5",
    panelCloseColor: "#52525B",
    sourceIconBg: "#F4F4F5",
    sourceIconColor: "#71717A",
    sourceTitleColor: "#18181B",
    sourceChapterColor: "#6B7280",
    sourcePageColor: "#A1A1AA",
    chatInputBg: "#FAFAFA",
    chatInputBorder: "#E4E4E7",
    chatInputColor: "#18181B",
    chatBarBorder: "#F4F4F5",
    chatUserBubbleBg: "#18181B",
    chatUserBubbleColor: "#fff",
    chatAIBubbleBg: "#F4F4F5",
    chatAIBubbleColor: "#18181B",
    chatSendActiveBg: "#18181B",
    chatSendActiveIcon: "#fff",
    chatSendInactiveBg: "#E4E4E7",
    chatSendInactiveIcon: "#A1A1AA",
    chatDotColor: "#A1A1AA",
    imgPlaceholderBg: "#F4F4F5",
    imgPlaceholderBorder: "#E4E4E7",
    imgPlaceholderIcon: "#A1A1AA",
    imgPlaceholderText: "#71717A",
    emptyIconColor: "#A1A1AA",
    emptyTitleColor: "#3F3F46",
    emptySubColor: "#6B7280",
    countColor: "#A1A1AA",
    flashDividerLabelBg: "#fff",
    flashDividerLabelColor: "#A1A1AA",
    flashAnswerColor: "#374151",
    headerIconColor: "#18181B",
    headerTitleColor: "#18181B",
    headerSubColor: "#52525B",
    switcherBg: "#fff",
    switcherBorder: "#E4E4E7",
    switcherShadow: "0 2px 8px rgba(0,0,0,0.08)",
    switcherDotBg: "#F4F4F3",
    switcherDotBorder: "#D4D4D8",
  },
  dark: {
    id: "dark",
    pageBg: "#0A0A0A",
    cardBg: "#141414",
    cardBorder: "1px solid #2A2A2A",
    textPrimary: "#FAFAFA",
    textSecondary: "#A1A1AA",
    textTertiary: "#525252",
    textBody: "#D4D4D8",
    textMuted: "#737373",
    tagBg: "#1E1E1E",
    tagColor: "#A1A1AA",
    divider: "#222222",
    dividerStrong: "#333333",
    barBg: "rgba(18,18,18,0.96)",
    barBorder: "rgba(50,50,50,0.9)",
    barShadow: "0 20px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
    searchBg: "#1A1A1A",
    searchBorderIdle: "#2A2A2A",
    searchBorderFocus: "#FAFAFA",
    searchShadowFocus: "0 0 0 4px rgba(250,250,250,0.06), 0 2px 8px rgba(0,0,0,0.2)",
    searchColor: "#FAFAFA",
    placeholderColor: "#525252",
    clearBtnBg: "#2A2A2A",
    clearBtnColor: "#A1A1AA",
    filterActiveBg: "#FAFAFA",
    filterActiveColor: "#0A0A0A",
    filterActiveBorder: "#FAFAFA",
    filterInactiveBg: "rgba(30,30,30,0.9)",
    filterInactiveBorder: "#333333",
    filterInactiveColor: "#A1A1AA",
    filterInactiveHoverBg: "#1E1E1E",
    filterInactiveHoverBorder: "#444444",
    topicCardBg: null,
    topicAbbrBg: "rgba(0,0,0,0.45)",
    topicAbbrColor: "#fff",
    topicCountColor: "rgba(255,255,255,0.55)",
    qBadgeBg: "#2D1F00",
    qBadgeColor: "#FCD34D",
    qBadgeIconColor: "#FCD34D",
    fcBadgeBg: "#1E1040",
    fcBadgeColor: "#A78BFA",
    fcBadgeIconColor: "#A78BFA",
    aiColor: "#A78BFA",
    optionBg: "#1A1A1A",
    optionBorder: "1.5px solid #2A2A2A",
    optionColor: "#D4D4D8",
    optionLetterBg: "#222222",
    optionLetterColor: "#737373",
    optionCorrectBg: "#052E16",
    optionCorrectBorder: "1.5px solid #166534",
    optionCorrectColor: "#4ADE80",
    optionCorrectLetterBg: "#14532D",
    optionCorrectLetterColor: "#4ADE80",
    optionWrongBg: "#2D0A0A",
    optionWrongBorder: "1.5px solid #7F1D1D",
    optionWrongColor: "#F87171",
    optionWrongLetterBg: "#450A0A",
    optionWrongLetterColor: "#F87171",
    explBg: "#1A1A1A",
    explBorder: "1px solid #2A2A2A",
    explColor: "#D4D4D8",
    tableHeadBg: "#1E1E1E",
    tableHeadColor: "#FAFAFA",
    tableCellColor: "#A1A1AA",
    tableBorder: "#2A2A2A",
    tableRowBorder: "#1E1E1E",
    footerBtnColor: "#737373",
    footerBtnHoverBg: "#222222",
    copySuccessColor: "#4ADE80",
    feedbackUpBg: "#052E16",
    feedbackUpBorder: "#166534",
    feedbackUpColor: "#4ADE80",
    feedbackDownBg: "#2D0A0A",
    feedbackDownBorder: "#7F1D1D",
    feedbackDownColor: "#F87171",
    feedbackIdleColor: "#525252",
    pinActiveBg: "#2D1F00",
    pinActiveBorder: "1px solid #854D0E",
    pinActiveColor: "#FCD34D",
    pinIdleColor: "#444444",
    panelBg: "#141414",
    panelBorder: "#222222",
    panelOverlay: "rgba(0,0,0,0.55)",
    panelShadow: "-8px 0 40px rgba(0,0,0,0.5)",
    panelTitleColor: "#FAFAFA",
    panelCloseBg: "#222222",
    panelCloseColor: "#A1A1AA",
    sourceIconBg: "#222222",
    sourceIconColor: "#737373",
    sourceTitleColor: "#FAFAFA",
    sourceChapterColor: "#737373",
    sourcePageColor: "#525252",
    chatInputBg: "#1A1A1A",
    chatInputBorder: "#2A2A2A",
    chatInputColor: "#FAFAFA",
    chatBarBorder: "#222222",
    chatUserBubbleBg: "#FAFAFA",
    chatUserBubbleColor: "#0A0A0A",
    chatAIBubbleBg: "#1E1E1E",
    chatAIBubbleColor: "#D4D4D8",
    chatSendActiveBg: "#FAFAFA",
    chatSendActiveIcon: "#0A0A0A",
    chatSendInactiveBg: "#222222",
    chatSendInactiveIcon: "#525252",
    chatDotColor: "#525252",
    imgPlaceholderBg: "#1A1A1A",
    imgPlaceholderBorder: "#2A2A2A",
    imgPlaceholderIcon: "#525252",
    imgPlaceholderText: "#737373",
    emptyIconColor: "#525252",
    emptyTitleColor: "#A1A1AA",
    emptySubColor: "#737373",
    countColor: "#525252",
    flashDividerLabelBg: "#141414",
    flashDividerLabelColor: "#525252",
    flashAnswerColor: "#D4D4D8",
    headerIconColor: "#FAFAFA",
    headerTitleColor: "#FAFAFA",
    headerSubColor: "#A1A1AA",
    switcherBg: "#141414",
    switcherBorder: "#2A2A2A",
    switcherShadow: "0 2px 8px rgba(0,0,0,0.4)",
    switcherDotBg: "#0A0A0A",
    switcherDotBorder: "#444444",
  },
  mono: {
    id: "mono",
    pageBg: "#FFFFFF",
    cardBg: "#FAFAFA",
    cardBorder: "1px solid #E5E5E5",
    textPrimary: "#111111",
    textSecondary: "#555555",
    textTertiary: "#999999",
    textBody: "#333333",
    textMuted: "#777777",
    tagBg: "#EBEBEB",
    tagColor: "#444444",
    divider: "#E5E5E5",
    dividerStrong: "#CCCCCC",
    barBg: "rgba(255,255,255,0.96)",
    barBorder: "rgba(200,200,200,0.8)",
    barShadow: "0 20px 60px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
    searchBg: "#fff",
    searchBorderIdle: "#CCCCCC",
    searchBorderFocus: "#111111",
    searchShadowFocus: "0 0 0 4px rgba(17,17,17,0.05), 0 2px 8px rgba(0,0,0,0.04)",
    searchColor: "#111111",
    placeholderColor: "#999999",
    clearBtnBg: "#EBEBEB",
    clearBtnColor: "#444444",
    filterActiveBg: "#111111",
    filterActiveColor: "#fff",
    filterActiveBorder: "#111111",
    filterInactiveBg: "rgba(255,255,255,0.9)",
    filterInactiveBorder: "#CCCCCC",
    filterInactiveColor: "#555555",
    filterInactiveHoverBg: "#F0F0F0",
    filterInactiveHoverBorder: "#BBBBBB",
    topicCardBg: "#111111",
    topicAbbrBg: "rgba(255,255,255,0.15)",
    topicAbbrColor: "#fff",
    topicCountColor: "rgba(255,255,255,0.6)",
    qBadgeBg: "#EBEBEB",
    qBadgeColor: "#333333",
    qBadgeIconColor: "#555555",
    fcBadgeBg: "#EBEBEB",
    fcBadgeColor: "#333333",
    fcBadgeIconColor: "#555555",
    aiColor: "#333333",
    optionBg: "#F5F5F5",
    optionBorder: "1.5px solid #E5E5E5",
    optionColor: "#333333",
    optionLetterBg: "#EBEBEB",
    optionLetterColor: "#555555",
    optionCorrectBg: "#F0F0F0",
    optionCorrectBorder: "1.5px solid #999999",
    optionCorrectColor: "#111111",
    optionCorrectLetterBg: "#E0E0E0",
    optionCorrectLetterColor: "#111111",
    optionWrongBg: "#F0F0F0",
    optionWrongBorder: "1.5px solid #999999",
    optionWrongColor: "#444444",
    optionWrongLetterBg: "#E0E0E0",
    optionWrongLetterColor: "#444444",
    explBg: "#F5F5F5",
    explBorder: "1px solid #E5E5E5",
    explColor: "#333333",
    tableHeadBg: "#F0F0F0",
    tableHeadColor: "#111111",
    tableCellColor: "#333333",
    tableBorder: "#E5E5E5",
    tableRowBorder: "#EBEBEB",
    footerBtnColor: "#777777",
    footerBtnHoverBg: "#EBEBEB",
    copySuccessColor: "#111111",
    feedbackUpBg: "#EBEBEB",
    feedbackUpBorder: "#CCCCCC",
    feedbackUpColor: "#111111",
    feedbackDownBg: "#EBEBEB",
    feedbackDownBorder: "#CCCCCC",
    feedbackDownColor: "#444444",
    feedbackIdleColor: "#BBBBBB",
    pinActiveBg: "#EBEBEB",
    pinActiveBorder: "1px solid #CCCCCC",
    pinActiveColor: "#333333",
    pinIdleColor: "#CCCCCC",
    panelBg: "#FAFAFA",
    panelBorder: "#E5E5E5",
    panelOverlay: "rgba(0,0,0,0.12)",
    panelShadow: "-8px 0 40px rgba(0,0,0,0.06)",
    panelTitleColor: "#111111",
    panelCloseBg: "#EBEBEB",
    panelCloseColor: "#444444",
    sourceIconBg: "#EBEBEB",
    sourceIconColor: "#777777",
    sourceTitleColor: "#111111",
    sourceChapterColor: "#555555",
    sourcePageColor: "#999999",
    chatInputBg: "#F5F5F5",
    chatInputBorder: "#E5E5E5",
    chatInputColor: "#111111",
    chatBarBorder: "#E5E5E5",
    chatUserBubbleBg: "#111111",
    chatUserBubbleColor: "#fff",
    chatAIBubbleBg: "#EBEBEB",
    chatAIBubbleColor: "#333333",
    chatSendActiveBg: "#111111",
    chatSendActiveIcon: "#fff",
    chatSendInactiveBg: "#E5E5E5",
    chatSendInactiveIcon: "#BBBBBB",
    chatDotColor: "#BBBBBB",
    imgPlaceholderBg: "#F0F0F0",
    imgPlaceholderBorder: "#E5E5E5",
    imgPlaceholderIcon: "#BBBBBB",
    imgPlaceholderText: "#999999",
    emptyIconColor: "#BBBBBB",
    emptyTitleColor: "#333333",
    emptySubColor: "#777777",
    countColor: "#BBBBBB",
    flashDividerLabelBg: "#FAFAFA",
    flashDividerLabelColor: "#999999",
    flashAnswerColor: "#333333",
    headerIconColor: "#111111",
    headerTitleColor: "#111111",
    headerSubColor: "#555555",
    switcherBg: "#FAFAFA",
    switcherBorder: "#E5E5E5",
    switcherShadow: "0 2px 8px rgba(0,0,0,0.06)",
    switcherDotBg: "#FFFFFF",
    switcherDotBorder: "#CCCCCC",
  },
};

/* ─── Theme Switcher ─── */
function ThemeSwitcher({ theme, setTheme, t }) {
  const options = [
    { id: "current", fill: "#F4F4F3", border: "#D4D4D8", label: "Light" },
    { id: "dark",    fill: "#141414", border: "#444444", label: "Dark" },
    { id: "mono",    fill: "#FFFFFF", border: "#CCCCCC", label: "Mono" },
  ];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: t.switcherBg,
        border: `1px solid ${t.switcherBorder}`,
        borderRadius: 100,
        padding: "4px 6px",
        boxShadow: t.switcherShadow,
      }}
    >
      {options.map((o) => {
        const active = theme === o.id;
        return (
          <button
            key={o.id}
            onClick={() => setTheme(o.id)}
            title={o.label}
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: active
                ? `2.5px solid ${t.textPrimary}`
                : `2px solid ${o.border}`,
              background: o.fill,
              cursor: "pointer",
              padding: 0,
              transition: "all 0.15s",
              flexShrink: 0,
              outline: "none",
              boxShadow: active ? `0 0 0 2px ${t.pageBg}, 0 0 0 4px ${t.textPrimary}` : "none",
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Side Panel ─── */
function SidePanel({ title, onClose, t, children }) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: t.panelOverlay,
          zIndex: 100,
          animation: "fadeIn 0.2s ease both",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 92vw)",
          background: t.panelBg,
          zIndex: 101,
          boxShadow: t.panelShadow,
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight 0.25s cubic-bezier(.4,0,.2,1) both",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${t.panelBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: t.panelTitleColor }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: t.panelCloseBg,
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: t.panelCloseColor,
            }}
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

/* ─── Source Panel Content ─── */
function SourcePanelContent({ sources, t }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 20px" }}>
      {sources.map((src, i) => (
        <div
          key={i}
          style={{
            padding: "14px 0",
            borderBottom: i < sources.length - 1 ? `1px solid ${t.panelBorder}` : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: t.sourceIconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              <BookOpen size={13} strokeWidth={2} color={t.sourceIconColor} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: t.sourceTitleColor, margin: 0, lineHeight: 1.35 }}>
                {src.title}
              </p>
              <p style={{ fontSize: 14, color: t.sourceChapterColor, margin: "4px 0 0" }}>
                {src.chapter}
              </p>
              <p style={{ fontSize: 12, color: t.sourcePageColor, margin: "2px 0 0" }}>
                {src.page}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── AI Chat Panel Content ─── */
function AIChatPanelContent({ cardTitle, t }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Hi! I can help you understand "${cardTitle}" better. Ask me anything about this topic.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text:
            aiResponses[Math.floor(Math.random() * aiResponses.length)] +
            `\n\nRegarding your question about "${userMsg.slice(0, 40)}${
              userMsg.length > 40 ? "..." : ""
            }" — this is a key concept that frequently appears in exams. Make sure you understand the underlying mechanism and can apply it to clinical scenarios.`,
        },
      ]);
      setLoading(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "10px 14px",
                borderRadius: 14,
                background: msg.role === "user" ? t.chatUserBubbleBg : t.chatAIBubbleBg,
                color: msg.role === "user" ? t.chatUserBubbleColor : t.chatAIBubbleColor,
                fontSize: 15,
                lineHeight: 1.55,
                whiteSpace: "pre-line",
                borderBottomRightRadius: msg.role === "user" ? 4 : 14,
                borderBottomLeftRadius: msg.role === "ai" ? 4 : 14,
              }}
            >
              {msg.role === "ai" && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <Bot size={13} strokeWidth={2.2} color={t.aiColor} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.aiColor }}>
                    DrNote AI
                  </span>
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 14,
                borderBottomLeftRadius: 4,
                background: t.chatAIBubbleBg,
                fontSize: 15,
                color: t.chatAIBubbleColor,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <Bot size={13} strokeWidth={2.2} color={t.aiColor} />
                <span style={{ fontSize: 11, fontWeight: 700, color: t.aiColor }}>DrNote AI</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className={`dot-${n}`}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: t.chatDotColor }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${t.chatBarBorder}`,
          flexShrink: 0,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          placeholder="Ask about this topic..."
          style={{
            flex: 1,
            padding: "12px 14px",
            fontSize: 14,
            fontFamily: "inherit",
            border: `1.5px solid ${t.chatInputBorder}`,
            borderRadius: 12,
            outline: "none",
            background: t.chatInputBg,
            color: t.chatInputColor,
            minWidth: 0,
          }}
        />
        <button
          onClick={handleSend}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: "none",
            background: input.trim() ? t.chatSendActiveBg : t.chatSendInactiveBg,
            cursor: input.trim() ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
        >
          <Send size={16} strokeWidth={2} color={input.trim() ? t.chatSendActiveIcon : t.chatSendInactiveIcon} />
        </button>
      </div>
    </>
  );
}

/* ─── Pin Button ─── */
function PinButton({ t }) {
  const [pinned, setPinned] = useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); setPinned(!pinned); }}
      title={pinned ? "Unpin" : "Pin"}
      style={{
        background: pinned ? t.pinActiveBg : "transparent",
        border: pinned ? t.pinActiveBorder : "1px solid transparent",
        borderRadius: 7,
        width: 30,
        height: 30,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: pinned ? t.pinActiveColor : t.pinIdleColor,
        transition: "all 0.15s",
        flexShrink: 0,
      }}
    >
      <Pin
        size={13}
        strokeWidth={2.2}
        style={{ transform: pinned ? "rotate(-45deg)" : "none", transition: "transform 0.2s" }}
      />
    </button>
  );
}

/* ─── Topic Card ─── */
function TopicCard({ item, t }) {
  const [hovered, setHovered] = useState(false);
  const bg = t.topicCardBg !== null ? t.topicCardBg : item.bg;
  const abbrColor = t.topicAbbrColor !== null ? t.topicAbbrColor : item.color;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg,
        borderRadius: 12,
        cursor: "pointer",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "transform 0.18s cubic-bezier(.4,0,.2,1), box-shadow 0.18s",
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? `0 8px 24px -6px ${bg}66` : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.name}
        </h3>
        <div
          style={{
            background: t.topicAbbrBg,
            padding: "2px 8px",
            borderRadius: 4,
            transform: "rotate(-3deg)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 800, color: abbrColor, letterSpacing: "0.03em" }}>
            {item.abbr}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <PinButton t={t} />
        <span style={{ fontSize: 12, color: t.topicCountColor, fontWeight: 500 }}>{item.count}</span>
        <ChevronRight size={14} color={t.topicCountColor} strokeWidth={2.5} />
      </div>
    </div>
  );
}

/* ─── Question Card ─── */
function QuestionCard({ item, onOpenChat, t }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const handleSelect = (idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
  };
  return (
    <div style={{ background: t.cardBg, borderRadius: 14, border: t.cardBorder, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: t.qBadgeBg,
            padding: "3px 9px",
            borderRadius: 5,
          }}
        >
          <HelpCircle size={11} strokeWidth={2.5} color={t.qBadgeIconColor} />
          <span style={{ fontSize: 11, fontWeight: 700, color: t.qBadgeColor }}>Question</span>
        </div>
        <PinButton t={t} />
      </div>
      <div style={{ padding: "8px 16px 0" }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, margin: 0, lineHeight: 1.5 }}>
          {item.question}
        </p>
      </div>
      <div style={{ padding: "10px 16px 0", display: "flex", flexDirection: "column", gap: 6 }}>
        {item.options.map((opt, idx) => {
          const isCorrect = idx === item.answer;
          const isSelected = idx === selected;
          let bg = t.optionBg, border = t.optionBorder, color = t.optionColor,
            lBg = t.optionLetterBg, lColor = t.optionLetterColor;
          if (revealed && isCorrect) {
            bg = t.optionCorrectBg; border = t.optionCorrectBorder; color = t.optionCorrectColor;
            lBg = t.optionCorrectLetterBg; lColor = t.optionCorrectLetterColor;
          } else if (revealed && isSelected && !isCorrect) {
            bg = t.optionWrongBg; border = t.optionWrongBorder; color = t.optionWrongColor;
            lBg = t.optionWrongLetterBg; lColor = t.optionWrongLetterColor;
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              style={{
                background: bg, border, borderRadius: 10, padding: "10px 14px",
                fontSize: 15, fontFamily: "inherit", fontWeight: 500, color,
                cursor: revealed ? "default" : "pointer", textAlign: "left",
                transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10,
              }}
            >
              <span
                style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: lBg, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 12, fontWeight: 700, color: lColor,
                }}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div
          style={{
            margin: "10px 16px 0",
            padding: "10px 14px",
            background: t.explBg,
            borderRadius: 10,
            border: t.explBorder,
          }}
        >
          <p style={{ fontSize: 14, color: t.explColor, margin: 0, lineHeight: 1.6 }}>
            {item.explanation}
          </p>
        </div>
      )}
      <div style={{ padding: "8px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {item.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 12, fontWeight: 600, color: t.tagColor, background: t.tagBg,
                padding: "2px 8px", borderRadius: 4, display: "flex", alignItems: "center", gap: 3,
              }}
            >
              <Tag size={9} strokeWidth={2.5} />{tag}
            </span>
          ))}
        </div>
        <button
          onClick={() => onOpenChat(item.question)}
          className="footer-btn"
          style={{
            display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
            cursor: "pointer", padding: "5px 10px", color: t.aiColor, fontSize: 12, fontWeight: 600,
            fontFamily: "inherit", borderRadius: 6, transition: "all 0.12s",
          }}
        >
          <MessageSquare size={13} strokeWidth={2} /> Ask AI
        </button>
      </div>
    </div>
  );
}

/* ─── Flashcard ─── */
function FlashcardCard({ item, onOpenChat, t }) {
  return (
    <div style={{ background: t.cardBg, borderRadius: 14, border: t.cardBorder, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: t.fcBadgeBg, padding: "3px 9px", borderRadius: 5,
          }}
        >
          <Layers size={11} strokeWidth={2.5} color={t.fcBadgeIconColor} />
          <span style={{ fontSize: 11, fontWeight: 700, color: t.fcBadgeColor }}>Flashcard</span>
        </div>
        <PinButton t={t} />
      </div>
      <div style={{ padding: "8px 16px 0" }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, margin: 0, lineHeight: 1.5 }}>
          {item.front}
        </p>
        <div style={{ height: 1, background: t.dividerStrong, margin: "12px 0", position: "relative" }}>
          <span
            style={{
              position: "absolute", top: "50%", left: 16,
              transform: "translateY(-50%)",
              background: t.flashDividerLabelBg,
              padding: "0 8px", fontSize: 10, fontWeight: 700,
              color: t.flashDividerLabelColor, letterSpacing: "0.05em", textTransform: "uppercase",
            }}
          >
            Answer
          </span>
        </div>
        <p style={{ fontSize: 15, fontWeight: 500, color: t.flashAnswerColor, margin: 0, lineHeight: 1.7 }}>
          {item.back}
        </p>
      </div>
      <div style={{ padding: "10px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {item.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 11, fontWeight: 600, color: t.tagColor, background: t.tagBg,
                padding: "2px 8px", borderRadius: 4, display: "flex", alignItems: "center", gap: 3,
              }}
            >
              <Tag size={9} strokeWidth={2.5} />{tag}
            </span>
          ))}
        </div>
        <button
          onClick={() => onOpenChat(item.front)}
          className="footer-btn"
          style={{
            display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
            cursor: "pointer", padding: "5px 10px", color: t.aiColor, fontSize: 12, fontWeight: 600,
            fontFamily: "inherit", borderRadius: 6, transition: "all 0.12s",
          }}
        >
          <MessageSquare size={13} strokeWidth={2} /> Ask AI
        </button>
      </div>
    </div>
  );
}

/* ─── Content Card ─── */
function ContentCard({ item, onOpenSources, onOpenChat, t }) {
  const [feedback, setFeedback] = useState(null);
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(`${item.title}\n\n${item.body}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div style={{ background: t.cardBg, borderRadius: 14, border: t.cardBorder, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, margin: 0, lineHeight: 1.35, flex: 1 }}>
          {item.title}
        </h3>
        <div style={{ display: "flex", gap: 2, marginLeft: 8, flexShrink: 0 }}>
          <PinButton t={t} />
        </div>
      </div>
      <div style={{ padding: "6px 16px 0", display: "flex", flexWrap: "wrap", gap: 5 }}>
        {item.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: 12, fontWeight: 600, color: t.tagColor, background: t.tagBg,
              padding: "2px 8px", borderRadius: 4, display: "flex", alignItems: "center", gap: 3,
            }}
          >
            <Tag size={9} strokeWidth={2.5} />{tag}
          </span>
        ))}
      </div>
      <div style={{ padding: "10px 16px 0" }}>
        <p style={{ fontSize: 15, color: t.textBody, lineHeight: 1.7, margin: 0, whiteSpace: "pre-line" }}>
          {item.body}
        </p>
      </div>
      {item.hasImage && (
        <div
          style={{
            margin: "12px 16px 0",
            background: t.imgPlaceholderBg,
            borderRadius: 10,
            padding: "28px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            border: `1px solid ${t.imgPlaceholderBorder}`,
          }}
        >
          <Image size={22} color={t.imgPlaceholderIcon} strokeWidth={1.5} />
          <span style={{ fontSize: 12, color: t.imgPlaceholderText, textAlign: "center", fontWeight: 500 }}>
            {item.imageLabel}
          </span>
        </div>
      )}
      {item.hasTable && item.tableData && (
        <div style={{ margin: "12px 16px 0", borderRadius: 10, border: `1px solid ${t.tableBorder}`, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 400 }}>
              <thead>
                <tr style={{ background: t.tableHeadBg }}>
                  {item.tableData.headers.map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 10px", textAlign: "left", fontWeight: 700,
                        color: t.tableHeadColor, borderBottom: `1px solid ${t.tableBorder}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {item.tableData.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    style={{ borderBottom: ri < item.tableData.rows.length - 1 ? `1px solid ${t.tableRowBorder}` : "none" }}
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        style={{ padding: "7px 10px", color: t.tableCellColor, fontWeight: ci === 0 ? 600 : 400, whiteSpace: "nowrap" }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div
        style={{
          padding: "8px 16px 10px",
          marginTop: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${t.divider}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button
            onClick={() => onOpenSources(item.sources)}
            className="footer-btn"
            style={{
              display: "flex", alignItems: "center", gap: 5, background: "none", border: "none",
              cursor: "pointer", padding: "5px 10px", color: t.footerBtnColor, fontSize: 12,
              fontWeight: 500, fontFamily: "inherit", borderRadius: 6, transition: "all 0.12s",
            }}
          >
            <ExternalLink size={13} strokeWidth={2} />
            {item.sources.length} source{item.sources.length !== 1 ? "s" : ""}
          </button>
          <button
            onClick={handleCopy}
            className="footer-btn"
            style={{
              display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
              cursor: "pointer", padding: "5px 10px",
              color: copied ? t.copySuccessColor : t.footerBtnColor,
              fontSize: 12, fontWeight: 500, fontFamily: "inherit", borderRadius: 6, transition: "all 0.12s",
            }}
          >
            {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={() => onOpenChat(item.title)}
            className="footer-btn"
            style={{
              display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
              cursor: "pointer", padding: "5px 10px", color: t.aiColor, fontSize: 12, fontWeight: 600,
              fontFamily: "inherit", borderRadius: 6, transition: "all 0.12s",
            }}
          >
            <MessageSquare size={13} strokeWidth={2} /> Ask AI
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button
            onClick={() => setFeedback(feedback === "up" ? null : "up")}
            style={{
              background: feedback === "up" ? t.feedbackUpBg : "transparent",
              border: feedback === "up" ? `1px solid ${t.feedbackUpBorder}` : "1px solid transparent",
              borderRadius: 7, width: 30, height: 30, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: feedback === "up" ? t.feedbackUpColor : t.feedbackIdleColor,
              transition: "all 0.15s",
            }}
          >
            <ThumbsUp size={13} strokeWidth={2} />
          </button>
          <button
            onClick={() => setFeedback(feedback === "down" ? null : "down")}
            style={{
              background: feedback === "down" ? t.feedbackDownBg : "transparent",
              border: feedback === "down" ? `1px solid ${t.feedbackDownBorder}` : "1px solid transparent",
              borderRadius: 7, width: 30, height: 30, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: feedback === "down" ? t.feedbackDownColor : t.feedbackIdleColor,
              transition: "all 0.15s",
            }}
          >
            <ThumbsDown size={13} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function LibraryPage() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [filter, setFilter] = useState("all");
  const [panel, setPanel] = useState(null);
  const [theme, setTheme] = useState("current");
  const inputRef = useRef(null);
  const CW = 980;

  const t = THEMES[theme];

  useEffect(() => {
    document.documentElement.style.setProperty("--page-bg", t.pageBg);
    document.body.style.background = t.pageBg;
  }, [t]);

  const filters = [
    { id: "all", label: "All", icon: Grid3X3 },
    { id: "topic", label: "Topics", icon: BookOpen },
    { id: "content", label: "Content", icon: LayoutList },
    { id: "question", label: "Questions", icon: HelpCircle },
    { id: "flashcard", label: "Flashcards", icon: Layers },
    { id: "hy", label: "High Yield", icon: Zap },
  ];

  const filtered = libraryItems.filter((item) => {
    if (filter !== "all" && filter !== "hy" && item.type !== filter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    if (item.type === "topic")
      return item.name.toLowerCase().includes(q) || item.abbr.toLowerCase().includes(q);
    if (item.type === "question")
      return item.question.toLowerCase().includes(q) || item.tags.some((tg) => tg.toLowerCase().includes(q));
    if (item.type === "flashcard")
      return (
        item.front.toLowerCase().includes(q) ||
        item.back.toLowerCase().includes(q) ||
        item.tags.some((tg) => tg.toLowerCase().includes(q))
      );
    return (
      item.title.toLowerCase().includes(q) ||
      item.body.toLowerCase().includes(q) ||
      item.tags.some((tg) => tg.toLowerCase().includes(q))
    );
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.pageBg,
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: t.textPrimary,
        "--page-bg": t.pageBg,
        transition: "background 0.2s ease",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap"
        rel="stylesheet"
      />

      {panel && (
        <SidePanel
          title={panel.type === "sources" ? `Sources (${panel.data.length})` : "Chat with AI"}
          onClose={() => setPanel(null)}
          t={t}
        >
          {panel.type === "sources" ? (
            <SourcePanelContent sources={panel.data} t={t} />
          ) : (
            <AIChatPanelContent cardTitle={panel.title} t={t} />
          )}
        </SidePanel>
      )}

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
        <div
          style={{
            paddingTop: "max(2.5vh, 18px)",
            textAlign: "center",
            animation: "fadeDown 0.4s cubic-bezier(.4,0,.2,1) both",
            position: "relative",
          }}
        >
          {/* Theme switcher — top right */}
          <div style={{ position: "absolute", right: 0, top: "max(2.5vh, 18px)" }}>
            <ThemeSwitcher theme={theme} setTheme={setTheme} t={t} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <BookOpen size={22} strokeWidth={2} color={t.headerIconColor} />
            <h1
              style={{
                fontSize: "clamp(22px, 5vw, 28px)",
                fontWeight: 800,
                letterSpacing: "-0.035em",
                color: t.headerTitleColor,
                margin: 0,
              }}
            >
              Library
            </h1>
          </div>
          <p style={{ fontSize: 15, color: t.headerSubColor, margin: "6px 0 0", fontWeight: 500 }}>
            Browse topics and study content
          </p>
        </div>

        <div
          style={{
            marginTop: 18,
            paddingBottom: 160,
            maxWidth: CW,
            marginLeft: "auto",
            marginRight: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 20px", animation: "fadeDown 0.3s ease both" }}>
              <Search size={26} strokeWidth={1.5} style={{ marginBottom: 8, opacity: 0.3, color: t.emptyIconColor }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: t.emptyTitleColor }}>
                No results for "{query}"
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 14, color: t.emptySubColor }}>
                Try a different search term
              </p>
            </div>
          ) : (
            filtered.map((item, i) => (
              <div
                key={item.type + (item.id || item.abbr || i)}
                style={{ animation: `slideUp 0.3s cubic-bezier(.4,0,.2,1) ${i * 0.025}s both` }}
              >
                {item.type === "topic" && <TopicCard item={item} t={t} />}
                {item.type === "content" && (
                  <ContentCard
                    item={item}
                    t={t}
                    onOpenSources={(s) => setPanel({ type: "sources", data: s })}
                    onOpenChat={(title) => setPanel({ type: "chat", title })}
                  />
                )}
                {item.type === "question" && (
                  <QuestionCard item={item} t={t} onOpenChat={(title) => setPanel({ type: "chat", title })} />
                )}
                {item.type === "flashcard" && (
                  <FlashcardCard item={item} t={t} onOpenChat={(title) => setPanel({ type: "chat", title })} />
                )}
              </div>
            ))
          )}
          {filtered.length > 0 && (
            <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: t.countColor, paddingBottom: 32 }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </main>

      {/* ─── Fixed Floating Search Bar ─── */}
      <div
        style={{
          position: "fixed",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(640px, calc(100vw - 32px))",
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "12px 14px 14px",
          background: t.barBg,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: 22,
          boxShadow: t.barShadow,
          border: `1px solid ${t.barBorder}`,
          animation: "floatUp 0.4s cubic-bezier(.4,0,.2,1) 0.1s both",
          transition: "background 0.2s ease, border-color 0.2s ease",
        }}
      >
        {/* Search input */}
        <div
          style={{
            borderRadius: 13,
            border: focused ? `2px solid ${t.searchBorderFocus}` : `2px solid ${t.searchBorderIdle}`,
            background: t.searchBg,
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: focused ? t.searchShadowFocus : "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", padding: "0 10px 0 16px" }}>
            <Search
              size={18}
              strokeWidth={2}
              style={{ color: focused ? t.searchBorderFocus : t.textTertiary, transition: "color 0.15s", flexShrink: 0 }}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search topics, content, tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                flex: 1, padding: "14px 10px", fontSize: 15, fontFamily: "inherit",
                fontWeight: 500, background: "transparent", border: "none", outline: "none",
                color: t.searchColor, minWidth: 0,
              }}
            />
            {query && (
              <button
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                style={{
                  background: t.clearBtnBg, border: "none", borderRadius: 8,
                  width: 30, height: 30, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: t.clearBtnColor, flexShrink: 0,
                }}
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
          {filters.map((f) => {
            const active = filter === f.id;
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={active ? "" : "filter-pill-inactive"}
                style={{
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  fontFamily: "inherit",
                  color: active ? t.filterActiveColor : t.filterInactiveColor,
                  background: active ? t.filterActiveBg : t.filterInactiveBg,
                  border: active ? `1.5px solid ${t.filterActiveBorder}` : `1.5px solid ${t.filterInactiveBorder}`,
                  borderRadius: 100,
                  padding: "5px 12px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {Icon && <Icon size={12} strokeWidth={2.2} />}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatUp { from { opacity: 0; transform: translateX(-50%) translateY(16px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes pulse { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }
        ::placeholder { color: ${t.placeholderColor} !important; }
        * { box-sizing: border-box; margin: 0; }
        .filter-pill-inactive:hover { background: ${t.filterInactiveHoverBg} !important; border-color: ${t.filterInactiveHoverBorder} !important; }
        .footer-btn:hover { background: ${t.footerBtnHoverBg} !important; }
        .dot-1 { animation: pulse 1.2s ease-in-out infinite; }
        .dot-2 { animation: pulse 1.2s ease-in-out 0.2s infinite; }
        .dot-3 { animation: pulse 1.2s ease-in-out 0.4s infinite; }
        @media (max-width: 400px) { .btn-gs { display: none !important; } }
      `}</style>
    </div>
  );
}
