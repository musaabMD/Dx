import { mutation, query } from "./_generated/server";

const now = () => Date.now();

const defaultExamCategories = ["Medical", "Law", "Finance", "Science", "Academic"] as const;

export const examCategories = query({
  args: {},
  handler: async () => defaultExamCategories,
});

const questions = [
  {
    externalId: "usmle-step-1-001",
    examId: "usmle-step-1",
    subject: "Cardiology",
    topic: "Arrhythmia",
    subtopic: "SVT",
    tags: ["arrhythmia ECG", "cardiology weak", "rapid review"],
    prompt:
      "A stable patient has a regular narrow-complex tachycardia at 180/min. Vagal maneuvers fail. What is the next best treatment?",
    options: [
      { id: "A", label: "Adenosine" },
      { id: "B", label: "Atropine" },
      { id: "C", label: "Defibrillation" },
      { id: "D", label: "IV amiodarone" },
    ],
    correctOptionId: "A",
    explanation:
      "Stable regular narrow-complex tachycardia is treated with vagal maneuvers followed by adenosine.",
    objective: "Recognize first-line therapy for stable SVT.",
    difficulty: "easy" as const,
  },
  {
    externalId: "usmle-step-1-002",
    examId: "usmle-step-1",
    subject: "Endocrine",
    topic: "Adrenal",
    subtopic: "Primary hyperaldosteronism",
    tags: ["adrenal recall 1 month", "hypertension", "electrolytes"],
    prompt:
      "A patient has resistant hypertension, hypokalemia, low plasma renin, and high aldosterone. What is the most likely diagnosis?",
    options: [
      { id: "A", label: "Primary hyperaldosteronism" },
      { id: "B", label: "Renal artery stenosis" },
      { id: "C", label: "Pheochromocytoma" },
      { id: "D", label: "Cushing syndrome" },
    ],
    correctOptionId: "A",
    explanation:
      "Autonomous aldosterone secretion causes hypertension, potassium wasting, suppressed renin, and elevated aldosterone.",
    objective: "Interpret renin and aldosterone patterns.",
    difficulty: "medium" as const,
  },
  {
    externalId: "usmle-step-1-003",
    examId: "usmle-step-1",
    subject: "Renal",
    topic: "Electrolytes",
    subtopic: "Hyperkalemia",
    tags: ["electrolytes", "renal recall 2 weeks", "shock"],
    prompt:
      "A patient with renal failure has peaked T waves and a widened QRS. Which treatment should be given first?",
    options: [
      { id: "A", label: "IV calcium gluconate" },
      { id: "B", label: "Oral sodium polystyrene sulfonate" },
      { id: "C", label: "Loop diuretic" },
      { id: "D", label: "Dextrose alone" },
    ],
    correctOptionId: "A",
    explanation:
      "ECG changes from hyperkalemia require immediate membrane stabilization with IV calcium.",
    objective: "Prioritize emergent hyperkalemia management.",
    difficulty: "easy" as const,
  },
  {
    externalId: "usmle-step-1-004",
    examId: "usmle-step-1",
    subject: "Respiratory",
    topic: "Physiology",
    subtopic: "COPD",
    tags: ["respiratory physiology", "high-yield images"],
    prompt:
      "A smoker with COPD has severe resting hypoxemia. Which intervention most clearly improves survival?",
    options: [
      { id: "A", label: "Long-term oxygen therapy" },
      { id: "B", label: "Short-acting beta agonist only" },
      { id: "C", label: "Theophylline" },
      { id: "D", label: "Intermittent antibiotics" },
    ],
    correctOptionId: "A",
    explanation:
      "Long-term oxygen therapy improves survival in COPD patients with severe chronic resting hypoxemia.",
    objective: "Identify mortality-improving COPD therapy.",
    difficulty: "easy" as const,
  },
  {
    externalId: "usmle-step-1-005",
    examId: "usmle-step-1",
    subject: "Infectious Disease",
    topic: "Sepsis",
    subtopic: "Initial management",
    tags: ["sepsis", "shock", "infectious disease"],
    prompt:
      "A febrile hypotensive patient is suspected of septic shock. After cultures are obtained, what is the next best step?",
    options: [
      { id: "A", label: "Broad-spectrum IV antibiotics and fluids" },
      { id: "B", label: "Wait for culture speciation" },
      { id: "C", label: "Oral antibiotics only" },
      { id: "D", label: "Discharge with follow-up" },
    ],
    correctOptionId: "A",
    explanation:
      "Septic shock requires rapid broad-spectrum antibiotics and aggressive fluid resuscitation.",
    objective: "Treat suspected septic shock without delay.",
    difficulty: "easy" as const,
  },
  {
    externalId: "usmle-step-1-006",
    examId: "usmle-step-1",
    subject: "Biostatistics",
    topic: "Screening",
    subtopic: "Predictive values",
    tags: ["biostatistics"],
    prompt:
      "As disease prevalence increases, which screening test measure increases when sensitivity and specificity stay constant?",
    options: [
      { id: "A", label: "Positive predictive value" },
      { id: "B", label: "Specificity" },
      { id: "C", label: "Sensitivity" },
      { id: "D", label: "False positive rate" },
    ],
    correctOptionId: "A",
    explanation:
      "Positive predictive value rises as prevalence rises; sensitivity and specificity are intrinsic test properties.",
    objective: "Know how prevalence affects predictive values.",
    difficulty: "medium" as const,
  },
  {
    externalId: "usmle-step-1-007",
    examId: "usmle-step-1",
    subject: "Pharmacology",
    topic: "Drug interactions",
    subtopic: "Warfarin",
    tags: ["pharmacology", "wrong twice"],
    prompt:
      "A patient on warfarin starts trimethoprim-sulfamethoxazole and develops a high INR. What mechanism best explains this?",
    options: [
      { id: "A", label: "CYP inhibition" },
      { id: "B", label: "Increased vitamin K production" },
      { id: "C", label: "Reduced warfarin absorption" },
      { id: "D", label: "Increased clotting factor synthesis" },
    ],
    correctOptionId: "A",
    explanation:
      "TMP-SMX inhibits warfarin metabolism, increasing anticoagulant effect and INR.",
    objective: "Recognize clinically important warfarin interactions.",
    difficulty: "medium" as const,
  },
  {
    externalId: "usmle-step-1-008",
    examId: "usmle-step-1",
    subject: "Neurology",
    topic: "Stroke",
    subtopic: "Lacunar infarct",
    tags: ["neurology stroke", "hypertension"],
    prompt:
      "A hypertensive patient has pure motor hemiparesis without cortical signs. Which vessel pathology is most likely?",
    options: [
      { id: "A", label: "Lipohyalinosis of small penetrating arteries" },
      { id: "B", label: "Middle cerebral artery embolus" },
      { id: "C", label: "Berry aneurysm rupture" },
      { id: "D", label: "Dural venous sinus thrombosis" },
    ],
    correctOptionId: "A",
    explanation:
      "Chronic hypertension causes lipohyalinosis of small penetrating vessels, producing lacunar strokes.",
    objective: "Link lacunar stroke syndromes to hypertension.",
    difficulty: "medium" as const,
  },
  {
    externalId: "usmle-step-1-009",
    examId: "usmle-step-1",
    subject: "Ethics",
    topic: "Consent",
    subtopic: "Capacity",
    tags: ["ethics"],
    prompt:
      "An adult patient understands risks and benefits and refuses a recommended treatment. What should the physician do?",
    options: [
      { id: "A", label: "Respect the refusal" },
      { id: "B", label: "Treat against the patient's wishes" },
      { id: "C", label: "Ask family to override" },
      { id: "D", label: "Dismiss the patient" },
    ],
    correctOptionId: "A",
    explanation:
      "A patient with decision-making capacity can refuse treatment, even if the physician disagrees.",
    objective: "Respect autonomy when capacity is intact.",
    difficulty: "easy" as const,
  },
  {
    externalId: "usmle-step-1-010",
    examId: "usmle-step-1",
    subject: "Pediatrics",
    topic: "Vaccines",
    subtopic: "Live vaccines",
    tags: ["pediatrics", "vaccines"],
    prompt:
      "Which vaccine is contraindicated in a child with severe cellular immunodeficiency?",
    options: [
      { id: "A", label: "MMR" },
      { id: "B", label: "Inactivated influenza" },
      { id: "C", label: "DTaP" },
      { id: "D", label: "Hepatitis B" },
    ],
    correctOptionId: "A",
    explanation:
      "Live attenuated vaccines such as MMR are contraindicated in severe cellular immunodeficiency.",
    objective: "Identify live vaccine contraindications.",
    difficulty: "easy" as const,
  },
  {
    externalId: "usmle-step-1-011",
    examId: "usmle-step-1",
    subject: "Surgery",
    topic: "Shock",
    subtopic: "Hemorrhage",
    tags: ["surgery recall 1 month", "shock"],
    prompt:
      "A trauma patient is hypotensive, tachycardic, and has cool clammy skin after major blood loss. Which shock type is present?",
    options: [
      { id: "A", label: "Hypovolemic shock" },
      { id: "B", label: "Neurogenic shock" },
      { id: "C", label: "Anaphylactic shock" },
      { id: "D", label: "Cardiogenic shock" },
    ],
    correctOptionId: "A",
    explanation:
      "Hemorrhage reduces intravascular volume, causing hypovolemic shock with sympathetic compensation.",
    objective: "Classify shock based on mechanism.",
    difficulty: "easy" as const,
  },
  {
    externalId: "usmle-step-1-012",
    examId: "usmle-step-1",
    subject: "Psychiatry",
    topic: "Mood disorders",
    subtopic: "Bipolar disorder",
    tags: ["psychiatry"],
    prompt:
      "A patient has decreased sleep, pressured speech, grandiosity, and risky spending for 8 days. What is the diagnosis?",
    options: [
      { id: "A", label: "Manic episode" },
      { id: "B", label: "Panic disorder" },
      { id: "C", label: "Persistent depressive disorder" },
      { id: "D", label: "Schizoid personality disorder" },
    ],
    correctOptionId: "A",
    explanation:
      "At least 1 week of elevated or irritable mood with increased energy and manic symptoms indicates mania.",
    objective: "Diagnose mania by duration and symptom cluster.",
    difficulty: "easy" as const,
  },
  {
    externalId: "usmle-step-1-013",
    examId: "usmle-step-1",
    subject: "OB/GYN",
    topic: "Hypertension in pregnancy",
    subtopic: "Preeclampsia",
    tags: ["OB/GYN", "hypertension"],
    prompt:
      "A pregnant patient at 34 weeks has hypertension and proteinuria. What is the likely diagnosis?",
    options: [
      { id: "A", label: "Preeclampsia" },
      { id: "B", label: "Ectopic pregnancy" },
      { id: "C", label: "Placenta previa" },
      { id: "D", label: "Endometritis" },
    ],
    correctOptionId: "A",
    explanation:
      "New hypertension after 20 weeks with proteinuria or end-organ findings is preeclampsia.",
    objective: "Recognize preeclampsia diagnostic timing.",
    difficulty: "easy" as const,
  },
  {
    externalId: "usmle-step-1-014",
    examId: "usmle-step-1",
    subject: "Pathology",
    topic: "Acute coronary syndrome",
    subtopic: "MI markers",
    tags: ["acute coronary syndrome", "cardiology weak"],
    prompt:
      "Which biomarker remains elevated longest after myocardial infarction?",
    options: [
      { id: "A", label: "Troponin I" },
      { id: "B", label: "Myoglobin" },
      { id: "C", label: "CK-MB" },
      { id: "D", label: "AST" },
    ],
    correctOptionId: "A",
    explanation:
      "Troponin I remains elevated for about 7 to 10 days after myocardial infarction.",
    objective: "Compare cardiac biomarker timing.",
    difficulty: "medium" as const,
  },
  {
    externalId: "usmle-step-1-015",
    examId: "usmle-step-1",
    subject: "Immunology",
    topic: "Asthma",
    subtopic: "Therapy",
    tags: ["asthma step therapy", "respiratory physiology"],
    prompt:
      "Which medication provides rapid relief during an acute asthma attack?",
    options: [
      { id: "A", label: "Albuterol" },
      { id: "B", label: "Omalizumab" },
      { id: "C", label: "Montelukast" },
      { id: "D", label: "Inhaled fluticasone alone" },
    ],
    correctOptionId: "A",
    explanation:
      "Short-acting beta-2 agonists such as albuterol rapidly bronchodilate during acute symptoms.",
    objective: "Pick rescue therapy for asthma exacerbation.",
    difficulty: "easy" as const,
  },
  {
    externalId: "usmle-step-1-016",
    examId: "usmle-step-1",
    subject: "Microbiology",
    topic: "Pneumonia",
    subtopic: "Atypical organisms",
    tags: ["infectious disease", "rapid review"],
    prompt:
      "A young adult has walking pneumonia with cold agglutinins. Which organism is most likely?",
    options: [
      { id: "A", label: "Mycoplasma pneumoniae" },
      { id: "B", label: "Streptococcus pneumoniae" },
      { id: "C", label: "Klebsiella pneumoniae" },
      { id: "D", label: "Pseudomonas aeruginosa" },
    ],
    correctOptionId: "A",
    explanation:
      "Mycoplasma pneumoniae causes atypical pneumonia and can be associated with cold agglutinins.",
    objective: "Identify classic atypical pneumonia clues.",
    difficulty: "medium" as const,
  },
  {
    externalId: "usmle-step-1-017",
    examId: "usmle-step-1",
    subject: "Biochemistry",
    topic: "Vitamins",
    subtopic: "Niacin",
    tags: ["rapid review"],
    prompt:
      "Dermatitis, diarrhea, and dementia are classically caused by deficiency of which vitamin?",
    options: [
      { id: "A", label: "Niacin" },
      { id: "B", label: "Thiamine" },
      { id: "C", label: "Riboflavin" },
      { id: "D", label: "Vitamin C" },
    ],
    correctOptionId: "A",
    explanation:
      "Niacin deficiency causes pellagra, classically dermatitis, diarrhea, and dementia.",
    objective: "Know high-yield vitamin deficiency syndromes.",
    difficulty: "easy" as const,
  },
  {
    externalId: "usmle-step-1-018",
    examId: "usmle-step-1",
    subject: "Hematology",
    topic: "Anemia",
    subtopic: "Iron deficiency",
    tags: ["wrong twice"],
    prompt:
      "Microcytic anemia with low ferritin and high total iron-binding capacity suggests which diagnosis?",
    options: [
      { id: "A", label: "Iron deficiency anemia" },
      { id: "B", label: "Anemia of chronic disease" },
      { id: "C", label: "Sideroblastic anemia" },
      { id: "D", label: "Beta-thalassemia trait" },
    ],
    correctOptionId: "A",
    explanation:
      "Iron deficiency anemia has low ferritin and increased TIBC due to increased transferrin production.",
    objective: "Differentiate microcytic anemia labs.",
    difficulty: "medium" as const,
  },
  {
    externalId: "usmle-step-1-019",
    examId: "usmle-step-1",
    subject: "Gastroenterology",
    topic: "Liver disease",
    subtopic: "Hepatitis B",
    tags: ["flagged before mock"],
    prompt:
      "Which serologic marker indicates immunity due to hepatitis B vaccination?",
    options: [
      { id: "A", label: "Anti-HBs only" },
      { id: "B", label: "HBsAg" },
      { id: "C", label: "Anti-HBc IgM" },
      { id: "D", label: "HBeAg" },
    ],
    correctOptionId: "A",
    explanation:
      "Vaccination produces anti-HBs without anti-HBc because the vaccine contains surface antigen only.",
    objective: "Interpret hepatitis B serologies.",
    difficulty: "medium" as const,
  },
  {
    externalId: "usmle-step-1-020",
    examId: "usmle-step-1",
    subject: "Renal",
    topic: "Acid-base",
    subtopic: "Respiratory acidosis",
    tags: ["renal recall 2 weeks", "respiratory physiology"],
    prompt:
      "A patient with COPD has elevated PaCO2 and increased bicarbonate. What acid-base disorder is most likely?",
    options: [
      { id: "A", label: "Chronic respiratory acidosis with metabolic compensation" },
      { id: "B", label: "Acute respiratory alkalosis" },
      { id: "C", label: "Metabolic acidosis without compensation" },
      { id: "D", label: "Metabolic alkalosis with respiratory compensation" },
    ],
    correctOptionId: "A",
    explanation:
      "Chronic CO2 retention causes respiratory acidosis; renal bicarbonate retention provides compensation.",
    objective: "Interpret compensated COPD acid-base patterns.",
    difficulty: "medium" as const,
  },
];

export const seedQuestions = mutation({
  args: {},
  handler: async ctx => {
    let inserted = 0;
    let skipped = 0;
    const timestamp = now();

    for (const question of questions) {
      const existing = await ctx.db
        .query("questions")
        .withIndex("by_external_id", q => q.eq("externalId", question.externalId))
        .unique();

      if (existing) {
        skipped += 1;
        continue;
      }

      await ctx.db.insert("questions", {
        ...question,
        active: true,
        source: "seed",
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      inserted += 1;
    }

    return { inserted, skipped, total: questions.length };
  },
});

const notes = [
  {
    title: "SVT treatment sequence",
    kind: "HY note",
    category: "Cardiology",
    text: "Stable narrow-complex tachycardia: vagal maneuvers, adenosine, then synchronized cardioversion if unstable.",
    tags: ["arrhythmia ECG", "rapid review"],
  },
  {
    title: "Primary hyperaldosteronism labs",
    kind: "Bite size HY",
    category: "Endocrine",
    text: "Hypertension plus hypokalemia with low renin and high aldosterone points to autonomous aldosterone secretion.",
    tags: ["adrenal recall 1 month", "hypertension"],
  },
  {
    title: "Hyperkalemia emergency order",
    kind: "HY note",
    category: "Renal",
    text: "ECG changes: calcium first, then shift potassium with insulin/dextrose and remove potassium definitively.",
    tags: ["electrolytes", "renal recall 2 weeks"],
  },
];

const libraryItems = [
  {
    externalId: "library-usmle-step-1-svt",
    type: "Algorithm",
    title: "Narrow-complex tachycardia",
    summary: "A compact pathway for stable and unstable SVT management.",
    tags: ["arrhythmia ECG", "cardiology weak"],
    sections: [
      { heading: "Stable", body: "Try vagal maneuvers, then adenosine for regular narrow-complex tachycardia." },
      { heading: "Unstable", body: "Hypotension, ischemia, altered mental status, or shock requires synchronized cardioversion." },
      { heading: "Pitfall", body: "Do not delay cardioversion in unstable patients." },
    ],
  },
  {
    externalId: "library-usmle-step-1-acid-base",
    type: "Table",
    title: "Acid-base compensation",
    summary: "Expected compensation patterns for respiratory and metabolic disorders.",
    tags: ["renal recall 2 weeks", "respiratory physiology"],
    sections: [
      { heading: "Respiratory acidosis", body: "Chronic CO2 retention increases renal bicarbonate retention." },
      { heading: "Respiratory alkalosis", body: "Low CO2 causes renal bicarbonate wasting when chronic." },
      { heading: "Use", body: "Compare measured compensation to expected compensation to identify mixed disorders." },
    ],
  },
  {
    externalId: "library-usmle-step-1-biostats",
    type: "Reference",
    title: "Predictive values and prevalence",
    summary: "How prevalence changes PPV and NPV without changing sensitivity or specificity.",
    tags: ["biostatistics"],
    sections: [
      { heading: "High prevalence", body: "Positive predictive value increases as prevalence increases." },
      { heading: "Low prevalence", body: "Negative predictive value increases as prevalence decreases." },
      { heading: "Intrinsic tests", body: "Sensitivity and specificity do not change with prevalence." },
    ],
  },
];

export const seedLearningContent = mutation({
  args: {},
  handler: async ctx => {
    const timestamp = now();
    let insertedNotes = 0;
    let insertedLibrary = 0;

    for (const note of notes) {
      const existing = await ctx.db
        .query("notes")
        .withIndex("by_exam", q => q.eq("examId", "usmle-step-1"))
        .filter(q => q.eq(q.field("title"), note.title))
        .first();
      if (existing) continue;
      await ctx.db.insert("notes", {
        ...note,
        examId: "usmle-step-1",
        bookmarked: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      insertedNotes += 1;
    }

    for (const item of libraryItems) {
      const existing = await ctx.db
        .query("libraryItems")
        .withIndex("by_external_id", q => q.eq("externalId", item.externalId))
        .unique();
      if (existing) continue;
      await ctx.db.insert("libraryItems", {
        ...item,
        examId: "usmle-step-1",
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      insertedLibrary += 1;
    }

    return { insertedNotes, insertedLibrary };
  },
});

const defaultPlanLimits = [
  {
    plan: "free" as const,
    questionsPerDay: 15,
    aiAsksPerDay: 0,
    mockExamsPerDay: 0,
    reviewQueueMax: 50,
    canAccessLibrary: false,
    canExportNotes: false,
  },
  {
    plan: "monthly" as const,
    questionsPerDay: 500,
    aiAsksPerDay: 30,
    mockExamsPerDay: 3,
    reviewQueueMax: 1000,
    canAccessLibrary: true,
    canExportNotes: true,
  },
  {
    plan: "quarterly" as const,
    questionsPerDay: 500,
    aiAsksPerDay: 50,
    mockExamsPerDay: 5,
    reviewQueueMax: 2000,
    canAccessLibrary: true,
    canExportNotes: true,
  },
  {
    plan: "yearly" as const,
    questionsPerDay: 9999,
    aiAsksPerDay: 100,
    mockExamsPerDay: 10,
    reviewQueueMax: 9999,
    canAccessLibrary: true,
    canExportNotes: true,
  },
];

export const seedPlanLimits = mutation({
  args: {},
  handler: async ctx => {
    const timestamp = now();
    let inserted = 0;
    for (const limits of defaultPlanLimits) {
      const existing = await ctx.db
        .query("planLimits")
        .withIndex("by_plan", q => q.eq("plan", limits.plan))
        .unique();
      if (existing) continue;
      await ctx.db.insert("planLimits", { ...limits, updatedAt: timestamp });
      inserted += 1;
    }
    return { inserted };
  },
});
