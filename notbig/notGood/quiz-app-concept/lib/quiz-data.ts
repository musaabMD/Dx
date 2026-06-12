import type { ItemData } from "@/components/expandable-item"

// MCQ Questions for subjects
export interface MCQQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export const mcqQuestions: Record<string, MCQQuestion[]> = {
  "Anatomy": [
    {
      id: "mcq-1",
      question: "Which muscle is the primary flexor of the forearm at the elbow?",
      options: ["Biceps brachii", "Triceps brachii", "Brachioradialis", "Pronator teres"],
      correctAnswer: 0,
      explanation: "The biceps brachii is the primary flexor of the forearm at the elbow joint."
    },
    {
      id: "mcq-2",
      question: "The median nerve passes through which structure at the wrist?",
      options: ["Guyon's canal", "Carpal tunnel", "Cubital tunnel", "Radial tunnel"],
      correctAnswer: 1,
      explanation: "The median nerve passes through the carpal tunnel along with the flexor tendons."
    },
    {
      id: "mcq-3",
      question: "Which heart chamber has the thickest wall?",
      options: ["Right atrium", "Left atrium", "Right ventricle", "Left ventricle"],
      correctAnswer: 3,
      explanation: "The left ventricle has the thickest wall because it pumps blood to the systemic circulation."
    },
    {
      id: "mcq-4",
      question: "The femoral nerve innervates which muscle?",
      options: ["Gluteus maximus", "Quadriceps femoris", "Hamstrings", "Adductor magnus"],
      correctAnswer: 1,
      explanation: "The femoral nerve (L2-L4) innervates the quadriceps femoris muscle."
    },
    {
      id: "mcq-5",
      question: "Which structure passes through the foramen magnum?",
      options: ["Internal carotid artery", "Vertebral arteries", "External jugular vein", "Facial nerve"],
      correctAnswer: 1,
      explanation: "The vertebral arteries and the medulla oblongata pass through the foramen magnum."
    },
  ],
  "Physiology": [
    {
      id: "mcq-p1",
      question: "What is the normal resting membrane potential of a cardiac myocyte?",
      options: ["-90 mV", "-70 mV", "-55 mV", "-40 mV"],
      correctAnswer: 0,
      explanation: "The resting membrane potential of a cardiac myocyte is approximately -90 mV."
    },
    {
      id: "mcq-p2",
      question: "Which hormone increases calcium absorption in the intestine?",
      options: ["PTH", "Calcitonin", "Vitamin D", "Cortisol"],
      correctAnswer: 2,
      explanation: "Vitamin D (1,25-dihydroxycholecalciferol) increases intestinal calcium absorption."
    },
    {
      id: "mcq-p3",
      question: "The main site of erythropoietin production is the:",
      options: ["Liver", "Bone marrow", "Kidney", "Spleen"],
      correctAnswer: 2,
      explanation: "The kidney is the main site of erythropoietin (EPO) production in adults."
    },
  ],
  "Biochemistry": [
    {
      id: "mcq-b1",
      question: "Which enzyme is deficient in phenylketonuria (PKU)?",
      options: ["Tyrosinase", "Phenylalanine hydroxylase", "Homogentisate oxidase", "Cystathionine synthase"],
      correctAnswer: 1,
      explanation: "PKU is caused by deficiency of phenylalanine hydroxylase."
    },
    {
      id: "mcq-b2",
      question: "The rate-limiting enzyme in glycolysis is:",
      options: ["Hexokinase", "Phosphofructokinase-1", "Pyruvate kinase", "Aldolase"],
      correctAnswer: 1,
      explanation: "Phosphofructokinase-1 (PFK-1) is the rate-limiting enzyme in glycolysis."
    },
  ],
  "Pathology": [
    {
      id: "mcq-pa1",
      question: "Reed-Sternberg cells are pathognomonic for:",
      options: ["Non-Hodgkin lymphoma", "Hodgkin lymphoma", "Multiple myeloma", "CLL"],
      correctAnswer: 1,
      explanation: "Reed-Sternberg cells (owl-eye cells) are diagnostic for Hodgkin lymphoma."
    },
    {
      id: "mcq-pa2",
      question: "Which type of necrosis is seen in MI?",
      options: ["Liquefactive", "Coagulative", "Caseous", "Fat necrosis"],
      correctAnswer: 1,
      explanation: "Coagulative necrosis is characteristic of myocardial infarction and most solid organ infarcts."
    },
  ],
  "Pharmacology": [
    {
      id: "mcq-ph1",
      question: "Which drug is a selective COX-2 inhibitor?",
      options: ["Aspirin", "Ibuprofen", "Celecoxib", "Naproxen"],
      correctAnswer: 2,
      explanation: "Celecoxib is a selective COX-2 inhibitor used to reduce GI side effects."
    },
  ],
}

// Subjects - 390 total
export const subjectsData: ItemData[] = [
  { id: "sub-1", title: "Anatomy", completed: 85, total: 120 },
  { id: "sub-2", title: "Physiology", completed: 63, total: 100 },
  { id: "sub-3", title: "Biochemistry", completed: 45, total: 80 },
  { id: "sub-4", title: "Pathology", completed: 38, total: 90 },
]

// Flashcard card type (question / answer)
export interface FlashcardItem {
  id: string
  front: string
  back: string
}

// Flashcards per deck (by deck title)
export const flashcardDecks: Record<string, FlashcardItem[]> = {
  "Done": [
    {
      id: "fc-done-1",
      front: "Diabetes screen freq?",
      back: "SORT and the ADA recommend routine screening in asymptomatic patients every 3 years starting at age 45 and in overweight persons <45 years old or persons with a risk factor.",
    },
    {
      id: "fc-done-2",
      front: "First-line drug for stable angina?",
      back: "Beta-blockers or calcium channel blockers. Nitrates for acute relief.",
    },
  ],
  "Cardiology Deck": [
    {
      id: "fc-card-1",
      front: "Diabetes screen freq?",
      back: "SORT and the ADA recommend routine screening in asymptomatic patients every 3 years starting at age 45 and in overweight persons <45 years old or persons with a risk factor.",
    },
    {
      id: "fc-card-2",
      front: "First-line drug for stable angina?",
      back: "Beta-blockers or calcium channel blockers. Nitrates for acute relief.",
    },
    {
      id: "fc-card-3",
      front: "ECG finding in STEMI?",
      back: "ST elevation ≥1mm in 2 contiguous leads (or ≥2mm in V2–V3). Reciprocal ST depression may be present.",
    },
    {
      id: "fc-card-4",
      front: "Main cause of aortic stenosis?",
      back: "Calcific degeneration (aging). Bicuspid aortic valve is the most common cause in younger patients.",
    },
    {
      id: "fc-card-5",
      front: "CHF class IV treatment?",
      back: "Loop diuretics, ACEi/ARB, beta-blockers, MRA, SGLT2i. Consider digoxin, hydralazine/nitrates, or device therapy.",
    },
  ],
  "Neurology Deck": [
    {
      id: "fc-neuro-1",
      front: "Classic triad of Parkinson disease?",
      back: "Resting tremor, rigidity, bradykinesia. Postural instability is the fourth cardinal feature.",
    },
    {
      id: "fc-neuro-2",
      front: "First-line imaging for acute stroke?",
      back: "Non-contrast CT head to rule out hemorrhage before thrombolysis.",
    },
    {
      id: "fc-neuro-3",
      front: "Gold standard for MS diagnosis?",
      back: "MRI showing dissemination in space and time. CSF oligoclonal bands support the diagnosis.",
    },
  ],
  "Pharmacology Deck": [
    {
      id: "fc-pharm-1",
      front: "Mechanism of ACE inhibitors?",
      back: "Block conversion of angiotensin I to II, reducing vasoconstriction and aldosterone. Causes dry cough and angioedema (bradykinin).",
    },
    {
      id: "fc-pharm-2",
      front: "Reversal agent for warfarin?",
      back: "Vitamin K (slow). For life-threatening bleeding: 4-factor PCC or fresh frozen plasma.",
    },
    {
      id: "fc-pharm-3",
      front: "Black box warning for fluoroquinolones?",
      back: "Tendon rupture, aortic aneurysm/dissection, CNS effects, hypoglycemia. Avoid in myasthenia gravis.",
    },
  ],
  "(1) Bio/Epi/Demo": [
    {
      id: "fc-bio-1",
      front: "Diabetes screen freq?",
      back: "SORT and the ADA recommend routine screening in asymptomatic patients every 3 years starting at age 45 and in overweight persons <45 years old or persons with a risk factor.",
    },
    {
      id: "fc-bio-2",
      front: "First-line drug for stable angina?",
      back: "Beta-blockers or calcium channel blockers. Nitrates for acute relief.",
    },
    {
      id: "fc-bio-3",
      front: "ECG finding in STEMI?",
      back: "ST elevation ≥1mm in 2 contiguous leads (or ≥2mm in V2–V3). Reciprocal ST depression may be present.",
    },
  ],
  "(2) Cardio/Resp": [
    {
      id: "fc-cr-1",
      front: "First-line drug for stable angina?",
      back: "Beta-blockers or calcium channel blockers. Nitrates for acute relief.",
    },
    {
      id: "fc-cr-2",
      front: "ECG finding in STEMI?",
      back: "ST elevation ≥1mm in 2 contiguous leads (or ≥2mm in V2–V3). Reciprocal ST depression may be present.",
    },
  ],
  "Microbiology Deck": [
    {
      id: "fc-micro-1",
      front: "Treatment for MRSA bacteremia?",
      back: "Vancomycin or daptomycin. Consider source control (e.g., removal of line or drainage).",
    },
    {
      id: "fc-micro-2",
      front: "First-line for C. difficile?",
      back: "Oral vancomycin or fidaxomicin. Metronidazole is an alternative for mild-moderate (no longer first-line per IDSA).",
    },
  ],
}

// Flashcards - hierarchical for expandable list UI (Done, Part2 with child (1) Bio/Epi/Demo)
export const flashcardsData: ItemData[] = [
  { id: "fc-done", title: "Done", completed: 63, total: 20 },
  {
    id: "fc-part2",
    title: "Part2",
    completed: 12,
    total: 20,
    children: [
      { id: "fc-bio", title: "(1) Bio/Epi/Demo", completed: 12, total: 20 },
      { id: "fc-cr", title: "(2) Cardio/Resp", completed: 8, total: 15 },
    ],
  },
  { id: "fc-1", title: "Cardiology Deck", completed: 25, total: 30 },
  { id: "fc-2", title: "Neurology Deck", completed: 18, total: 25 },
  { id: "fc-3", title: "Pharmacology Deck", completed: 12, total: 20 },
  { id: "fc-4", title: "Microbiology Deck", completed: 8, total: 15 },
]

// Library - 480 total
export const libraryData: ItemData[] = [
  { id: "lib-1", title: "First Aid 2026", completed: 180, total: 250 },
  { id: "lib-2", title: "Pathoma", completed: 85, total: 120 },
  { id: "lib-3", title: "Sketchy Medical", completed: 45, total: 70 },
  { id: "lib-4", title: "Boards and Beyond", completed: 28, total: 40 },
]

// Analysis - 300 total  
export const analysisData: ItemData[] = [
  { id: "an-1", title: "Performance Overview", completed: 72, total: 100 },
  { id: "an-2", title: "Subject Breakdown", completed: 65, total: 100 },
  { id: "an-3", title: "Time Analytics", completed: 48, total: 60 },
  { id: "an-4", title: "Weak Areas", completed: 22, total: 40 },
]

// Rapid Review (formerly Last min) - 175 total
export const rapidReviewData: ItemData[] = [
  { id: "rr-1", title: "HY Anatomy", completed: 48, total: 50 },
  { id: "rr-2", title: "HY Physiology", completed: 42, total: 45 },
  { id: "rr-3", title: "HY Pharmacology", completed: 38, total: 40 },
  { id: "rr-4", title: "HY Pathology", completed: 35, total: 40 },
]

// Mock Exam - 200 total
export const mockExamData: ItemData[] = [
  { id: "me-1", title: "Full Length Exam 1", completed: 180, total: 200 },
  { id: "me-2", title: "Full Length Exam 2", completed: 150, total: 200 },
  { id: "me-3", title: "Full Length Exam 3", completed: 0, total: 200 },
  { id: "me-4", title: "Half Length Exam", completed: 85, total: 100 },
]

// Review - 150 total
export const reviewData: ItemData[] = [
  { id: "rv-1", title: "Incorrect Questions", completed: 45, total: 80 },
  { id: "rv-2", title: "Marked for Review", completed: 22, total: 35 },
  { id: "rv-3", title: "Recently Studied", completed: 30, total: 35 },
]
