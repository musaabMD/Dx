"use client";

import { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

function toSlug(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const lightTheme = {
  sidebarBg: "#F3F0EE",
  sidebarHover: "#E6E1DC",
  sidebarActive: "#1164A3",
  sidebarText: "#4A4548",
  sidebarTextBright: "#1D1C1D",
  sidebarTextMuted: "#7A6D7A",
  sidebarDivider: "#D0CBC6",
  badge: "#E01E5A",
  green: "#2BAC76",
  plusBg: "rgba(0,0,0,0.07)",
  contentBg: "#ECEAE6",
  contentHeaderBg: "#F9F8F6",
  contentText: "#3D3C3D",
  contentTextBright: "#1D1C1D",
  contentBorder: "#D0CBC6",
  cardBg: "#FFFFFF",
  cardBorder: "#D8D3CE",
  inputBg: "#FFFFFF",
  hoverCard: "#EAE7E3",
};

const whiteTheme = {
  sidebarBg: "#FFFFFF",
  sidebarHover: "#F0F2F5",
  sidebarActive: "#1164A3",
  sidebarText: "#5A5A5A",
  sidebarTextBright: "#111111",
  sidebarTextMuted: "#888888",
  sidebarDivider: "#EAEAEA",
  badge: "#E01E5A",
  green: "#2BAC76",
  plusBg: "rgba(0,0,0,0.05)",
  contentBg: "#F5F7FA",
  contentHeaderBg: "#FFFFFF",
  contentText: "#3D3C3D",
  contentTextBright: "#111111",
  contentBorder: "#E5E7EB",
  cardBg: "#FFFFFF",
  cardBorder: "#E0E2E8",
  inputBg: "#FFFFFF",
  hoverCard: "#EEF0F3",
  channelHash: "#888888",
};

const darkTheme = {
  sidebarBg: "#1A1D21",
  sidebarHover: "#27242C",
  sidebarActive: "#1164A3",
  sidebarText: "#CFC3CF",
  sidebarTextBright: "#FFFFFF",
  sidebarTextMuted: "#9B8E9B",
  sidebarDivider: "#2C2C2E",
  badge: "#E01E5A",
  green: "#2BAC76",
  plusBg: "rgba(255,255,255,0.08)",
  contentBg: "#1E1E1E",
  contentHeaderBg: "#1A1D21",
  contentText: "#D1D5DB",
  contentTextBright: "#FFFFFF",
  contentBorder: "#2C2C2E",
  cardBg: "rgba(255,255,255,0.03)",
  cardBorder: "rgba(255,255,255,0.06)",
  inputBg: "#2C2C2E",
  hoverCard: "rgba(255,255,255,0.06)",
};

const slackColors = {
  sidebarBg: "#1A1D21",
  sidebarHover: "#27242C",
  sidebarActive: "#1164A3",
  sidebarText: "#CFC3CF",
  sidebarTextBright: "#FFFFFF",
  sidebarTextMuted: "#9B8E9B",
  sidebarDivider: "#2C2C2E",
  badge: "#E01E5A",
  green: "#2BAC76",
  yellow: "#ECB22E",
  channelHash: "#9B8E9B",
  plusBg: "rgba(255,255,255,0.08)",
};

const subjectTags = [
  { id: "anatomy", label: "Anatomy", color: "#E06C75" },
  { id: "physiology", label: "Physiology", color: "#61AFEF" },
  { id: "pathology", label: "Pathology", color: "#C678DD" },
  { id: "pharmacology", label: "Pharmacology", color: "#E5C07B" },
  { id: "biochemistry", label: "Biochemistry", color: "#2BAC76" },
  { id: "microbiology", label: "Microbiology", color: "#D19A66" },
  { id: "surgery", label: "Surgery", color: "#56B6C2" },
  { id: "medicine", label: "Medicine", color: "#EF596F" },
  { id: "pediatrics", label: "Pediatrics", color: "#98C379" },
  { id: "obgyn", label: "OB/GYN", color: "#BE5046" },
];

const reviewFilters = [
  { id: "review-all", label: "All", icon: "📋" },
  { id: "review-correct", label: "Correct", icon: "✅" },
  { id: "review-incorrect", label: "Incorrect", icon: "❌" },
  { id: "review-bookmark", label: "Bookmarked", icon: "🔖" },
];

const mcqBank = {
  anatomy: [
    { id: 1, q: "Which nerve innervates the diaphragm?", a: "A) Vagus", b: "B) Phrenic", c: "C) Intercostal", d: "D) Long thoracic", correct: "B", status: "correct" },
    { id: 2, q: "The femoral triangle is bounded laterally by which muscle?", a: "A) Adductor longus", b: "B) Pectineus", c: "C) Sartorius", d: "D) Gracilis", correct: "C", status: "incorrect" },
    { id: 3, q: "Which foramen transmits the maxillary nerve (V2)?", a: "A) Foramen ovale", b: "B) Foramen rotundum", c: "C) Foramen spinosum", d: "D) Superior orbital fissure", correct: "B", status: "correct" },
    { id: 4, q: "The blood supply to the head of the femur in adults is mainly from?", a: "A) Obturator artery", b: "B) Medial circumflex femoral", c: "C) Lateral circumflex femoral", d: "D) Profunda femoris", correct: "B", status: "bookmark" },
    { id: 5, q: "Which structure passes through the carpal tunnel?", a: "A) Ulnar nerve", b: "B) Median nerve", c: "C) Radial artery", d: "D) Flexor carpi radialis", correct: "B", status: "correct" },
    { id: 6, q: "The thoracic duct drains into the junction of which veins?", a: "A) R. subclavian & R. IJV", b: "B) L. subclavian & L. IJV", c: "C) Superior vena cava", d: "D) Azygos vein", correct: "B", status: "correct" },
  ],
  physiology: [
    { id: 1, q: "What is the normal resting membrane potential of a ventricular myocyte?", a: "A) -60 mV", b: "B) -70 mV", c: "C) -90 mV", d: "D) -40 mV", correct: "C", status: "correct" },
    { id: 2, q: "Which phase of the cardiac cycle has the highest ventricular pressure?", a: "A) Isovolumetric contraction", b: "B) Rapid ejection", c: "C) Isovolumetric relaxation", d: "D) Rapid filling", correct: "B", status: "incorrect" },
    { id: 3, q: "Surfactant is produced by which type of pneumocyte?", a: "A) Type I", b: "B) Type II", c: "C) Clara cells", d: "D) Goblet cells", correct: "B", status: "correct" },
    { id: 4, q: "ADH acts primarily on which part of the nephron?", a: "A) PCT", b: "B) Loop of Henle", c: "C) DCT", d: "D) Collecting duct", correct: "D", status: "bookmark" },
    { id: 5, q: "The oxygen-hemoglobin dissociation curve shifts right with?", a: "A) Decreased CO2", b: "B) Increased pH", c: "C) Increased temperature", d: "D) Decreased 2,3-DPG", correct: "C", status: "correct" },
  ],
  pathology: [
    { id: 1, q: "Reed-Sternberg cells are pathognomonic for?", a: "A) Non-Hodgkin lymphoma", b: "B) Hodgkin lymphoma", c: "C) CLL", d: "D) Multiple myeloma", correct: "B", status: "correct" },
    { id: 2, q: "Caseous necrosis is most characteristic of?", a: "A) Sarcoidosis", b: "B) Tuberculosis", c: "C) Wegener's", d: "D) Crohn's disease", correct: "B", status: "correct" },
    { id: 3, q: "Auer rods are seen in which type of leukemia?", a: "A) ALL", b: "B) AML", c: "C) CML", d: "D) CLL", correct: "B", status: "incorrect" },
    { id: 4, q: "Which tumor marker is elevated in hepatocellular carcinoma?", a: "A) CEA", b: "B) CA-125", c: "C) AFP", d: "D) PSA", correct: "C", status: "correct" },
  ],
  pharmacology: [
    { id: 1, q: "Which drug is a non-selective beta blocker?", a: "A) Metoprolol", b: "B) Atenolol", c: "C) Propranolol", d: "D) Bisoprolol", correct: "C", status: "correct" },
    { id: 2, q: "The antidote for heparin overdose is?", a: "A) Vitamin K", b: "B) Protamine sulfate", c: "C) FFP", d: "D) Tranexamic acid", correct: "B", status: "correct" },
    { id: 3, q: "Which antibiotic causes grey baby syndrome?", a: "A) Gentamicin", b: "B) Tetracycline", c: "C) Chloramphenicol", d: "D) Erythromycin", correct: "C", status: "incorrect" },
    { id: 4, q: "Zero-order kinetics is seen with which drug?", a: "A) Aspirin", b: "B) Ethanol", c: "C) Penicillin", d: "D) Digoxin", correct: "B", status: "bookmark" },
  ],
  biochemistry: [
    { id: 1, q: "The rate-limiting enzyme of glycolysis is?", a: "A) Hexokinase", b: "B) PFK-1", c: "C) Pyruvate kinase", d: "D) Aldolase", correct: "B", status: "correct" },
    { id: 2, q: "Which vitamin is a cofactor for carboxylase enzymes?", a: "A) Thiamine", b: "B) Biotin", c: "C) Riboflavin", d: "D) Niacin", correct: "B", status: "correct" },
    { id: 3, q: "Maple syrup urine disease is caused by deficiency of?", a: "A) Phenylalanine hydroxylase", b: "B) Branched-chain α-keto acid dehydrogenase", c: "C) Homogentisic acid oxidase", d: "D) Cystathionine synthase", correct: "B", status: "incorrect" },
  ],
  microbiology: [
    { id: 1, q: "Which organism causes pseudomembranous colitis?", a: "A) C. perfringens", b: "B) C. difficile", c: "C) S. aureus", d: "D) E. coli", correct: "B", status: "correct" },
    { id: 2, q: "Quellung reaction is used to identify?", a: "A) Capsule", b: "B) Flagella", c: "C) Spores", d: "D) Pili", correct: "A", status: "correct" },
    { id: 3, q: "The Ghon complex is seen in which infection?", a: "A) Histoplasmosis", b: "B) Primary TB", c: "C) Sarcoidosis", d: "D) Aspergillosis", correct: "B", status: "bookmark" },
  ],
  surgery: [
    { id: 1, q: "Charcot's triad is associated with?", a: "A) Cholecystitis", b: "B) Ascending cholangitis", c: "C) Pancreatitis", d: "D) Appendicitis", correct: "B", status: "correct" },
    { id: 2, q: "Most common site of gastric ulcer?", a: "A) Greater curvature", b: "B) Lesser curvature", c: "C) Pylorus", d: "D) Fundus", correct: "B", status: "correct" },
    { id: 3, q: "Sister Mary Joseph nodule indicates metastasis from?", a: "A) Breast", b: "B) Stomach/Ovary", c: "C) Lung", d: "D) Colon", correct: "B", status: "incorrect" },
  ],
  medicine: [
    { id: 1, q: "Trousseau sign is associated with?", a: "A) Hypocalcemia", b: "B) Hyperkalemia", c: "C) Hyponatremia", d: "D) Hypercalcemia", correct: "A", status: "correct" },
    { id: 2, q: "Target cells are seen in all EXCEPT?", a: "A) Thalassemia", b: "B) Iron deficiency", c: "C) Liver disease", d: "D) G6PD deficiency", correct: "D", status: "incorrect" },
    { id: 3, q: "JVP with cannon 'a' waves is seen in?", a: "A) Complete heart block", b: "B) AF", c: "C) Mitral stenosis", d: "D) Tricuspid regurgitation", correct: "A", status: "correct" },
  ],
  pediatrics: [
    { id: 1, q: "Moro reflex disappears by which age?", a: "A) 2 months", b: "B) 4 months", c: "C) 6 months", d: "D) 9 months", correct: "B", status: "correct" },
    { id: 2, q: "Social smile appears at?", a: "A) Birth", b: "B) 6 weeks", c: "C) 3 months", d: "D) 6 months", correct: "B", status: "correct" },
    { id: 3, q: "Most common congenital heart defect?", a: "A) ASD", b: "B) VSD", c: "C) PDA", d: "D) TOF", correct: "B", status: "bookmark" },
  ],
  obgyn: [
    { id: 1, q: "Bishop score is used to assess?", a: "A) Fetal maturity", b: "B) Cervical readiness", c: "C) Placental grade", d: "D) Amniotic fluid", correct: "B", status: "correct" },
    { id: 2, q: "Most common cause of postpartum hemorrhage?", a: "A) Retained placenta", b: "B) Uterine atony", c: "C) Trauma", d: "D) Coagulopathy", correct: "B", status: "correct" },
    { id: 3, q: "Hydatidiform mole shows which hCG pattern?", a: "A) Normal rise", b: "B) Very high levels", c: "C) Low levels", d: "D) Undetectable", correct: "B", status: "incorrect" },
  ],
};

const allMcqs = Object.values(mcqBank).flat();

const mcqExplanations = {
  "Which nerve innervates the diaphragm?": "The phrenic nerve (C3, C4, C5) is the sole motor supply to the diaphragm — mnemonic: 'C3, 4, 5 keeps the diaphragm alive.' The vagus nerve supplies thoracic and abdominal viscera, not the diaphragm.",
  "The femoral triangle is bounded laterally by which muscle?": "The femoral triangle has 3 borders: inguinal ligament (superior), sartorius (lateral), and adductor longus (medial). Its contents are the femoral nerve, artery, and vein (lateral to medial: NAV).",
  "Which foramen transmits the maxillary nerve (V2)?": "The three divisions of CN V exit through different foramina: V1 (ophthalmic) → superior orbital fissure, V2 (maxillary) → foramen rotundum, V3 (mandibular) → foramen ovale.",
  "The blood supply to the head of the femur in adults is mainly from?": "The medial circumflex femoral artery (branch of profunda femoris) is the dominant supply to the femoral head in adults. Disruption by femoral neck fracture causes avascular necrosis.",
  "Which structure passes through the carpal tunnel?": "The carpal tunnel contains the median nerve and 9 flexor tendons (4 FDS, 4 FDP, 1 FPL). The ulnar nerve travels through Guyon's canal, not the carpal tunnel.",
  "The thoracic duct drains into the junction of which veins?": "The thoracic duct (drains left side, lower body) empties at the left subclavian–internal jugular angle. The right lymphatic duct drains the right upper body into the right subclavian–IJV angle.",
  "What is the normal resting membrane potential of a ventricular myocyte?": "Ventricular myocytes have an RMP of -90 mV, maintained by high K+ conductance (IK1 channels). The SA node has a less negative RMP (~-60 mV) due to spontaneous depolarization.",
  "Which phase of the cardiac cycle has the highest ventricular pressure?": "Ventricular pressure peaks during rapid ejection (systole), reaching ~120 mmHg in the left ventricle. Pressure then falls during isovolumetric relaxation as the aortic valve closes.",
  "Surfactant is produced by which type of pneumocyte?": "Type II pneumocytes produce surfactant (DPPC), which reduces alveolar surface tension and prevents collapse. Type I pneumocytes are thin and form 95% of the alveolar surface for gas exchange.",
  "ADH acts primarily on which part of the nephron?": "ADH (vasopressin) binds V2 receptors on the collecting duct, triggering aquaporin-2 insertion and water reabsorption. This concentrates urine and reduces osmolality.",
  "The oxygen-hemoglobin dissociation curve shifts right with?": "The Bohr effect: increased temperature, CO2, 2,3-DPG, or decreased pH (acidosis) shift the curve RIGHT → decreased O2 affinity → more O2 released to tissues. Useful during exercise.",
  "Reed-Sternberg cells are pathognomonic for?": "Reed-Sternberg cells (large binucleate cells with prominent 'owl eye' nucleoli) are the hallmark of Hodgkin lymphoma. They are CD15+ and CD30+. Non-Hodgkin lymphoma does not show RS cells.",
  "Caseous necrosis is most characteristic of?": "Caseous ('cheese-like') necrosis is the hallmark of tuberculosis granulomas. It reflects a combination of coagulative and liquefactive necrosis, distinct from the dry coagulative necrosis of infarcts.",
  "Auer rods are seen in which type of leukemia?": "Auer rods are crystallized azurophilic granules seen in myeloid blasts → pathognomonic for AML. Their presence, especially in APL (M3 AML), is associated with DIC risk.",
  "Which tumor marker is elevated in hepatocellular carcinoma?": "AFP (alpha-fetoprotein) is elevated in HCC and also in non-seminomatous germ cell tumors. CEA is for colorectal, CA-125 for ovarian, and PSA for prostate cancers.",
  "Which drug is a non-selective beta blocker?": "Propranolol blocks both β1 (cardiac) and β2 (bronchial, vascular) receptors. Cardioselective β1 blockers (metoprolol, atenolol, bisoprolol) are preferred in asthma/COPD.",
  "The antidote for heparin overdose is?": "Protamine sulfate binds heparin (strongly positively charged binding negatively charged heparin) to form an inactive complex. Vitamin K reverses warfarin. FFP provides clotting factors acutely.",
  "Which antibiotic causes grey baby syndrome?": "Chloramphenicol causes grey baby syndrome in neonates: grey skin, abdominal distension, cardiovascular collapse. Neonates lack the glucuronosyltransferase to conjugate it, causing toxic accumulation.",
  "Zero-order kinetics is seen with which drug?": "Ethanol undergoes zero-order kinetics — eliminated at a constant rate regardless of concentration, because alcohol dehydrogenase becomes saturated. Aspirin and phenytoin also show this at high doses.",
  "The rate-limiting enzyme of glycolysis is?": "PFK-1 (phosphofructokinase-1) is the committed, rate-limiting step of glycolysis. It is inhibited by ATP and citrate, and activated by AMP and fructose-2,6-bisphosphate.",
  "Which vitamin is a cofactor for carboxylase enzymes?": "Biotin (B7) is the cofactor for carboxylases: pyruvate carboxylase, ACC, propionyl-CoA carboxylase, and β-methylcrotonyl-CoA carboxylase. Thiamine (B1) is for dehydrogenases.",
  "Maple syrup urine disease is caused by deficiency of?": "MSUD results from deficiency of branched-chain α-keto acid dehydrogenase, blocking catabolism of leucine, isoleucine, and valine. Urine smells like maple syrup. It causes encephalopathy.",
  "Which organism causes pseudomembranous colitis?": "C. difficile produces toxins A (enterotoxin) and B (cytotoxin) causing pseudomembranous colitis, usually after antibiotic disruption of normal gut flora. Treatment: oral vancomycin or fidaxomicin.",
  "Quellung reaction is used to identify?": "The Quellung (capsule swelling) reaction uses type-specific antibodies that bind the bacterial capsule, making it appear swollen and refractile under the microscope. Used for encapsulated bacteria like S. pneumoniae.",
  "The Ghon complex is seen in which infection?": "The Ghon complex (Ghon focus + hilar lymph node) is the hallmark of primary tuberculosis. The Ghon focus is a subpleural calcified granuloma, usually in the lower lobe or mid-zone.",
  "Charcot's triad is associated with?": "Charcot's triad (fever + RUQ pain + jaundice) indicates ascending cholangitis from biliary obstruction. Reynolds pentad adds altered sensorium and septic shock, indicating severe cholangitis.",
  "Most common site of gastric ulcer?": "Gastric ulcers most commonly occur on the lesser curvature of the stomach, particularly at the incisura angularis. Duodenal ulcers are more common anteriorly in the first part of the duodenum.",
  "Sister Mary Joseph nodule indicates metastasis from?": "The Sister Mary Joseph nodule (umbilical metastasis) is most commonly from gastric or ovarian carcinoma. It indicates peritoneal spread, usually signifying advanced, unresectable disease.",
  "Trousseau sign is associated with?": "Trousseau sign: inflation of a BP cuff above systolic pressure for 3 minutes causes carpal spasm (carpopedal spasm) due to hypocalcemia-induced neuromuscular excitability. Also seen in hypomagnesemia.",
  "Target cells are seen in all EXCEPT?": "Target cells (codocytes) are seen in thalassemia, liver disease, iron deficiency anemia, and asplenia — but NOT in G6PD deficiency, which causes bite cells and Heinz bodies instead.",
  "JVP with cannon 'a' waves is seen in?": "Cannon 'a' waves occur when the atrium contracts against a closed tricuspid valve (i.e., AV dissociation). In complete heart block, atria and ventricles contract independently, causing intermittent cannon waves.",
  "Moro reflex disappears by which age?": "The Moro (startle) reflex appears at birth and disappears by 4-6 months. Persistence beyond 6 months suggests neurological abnormality. It involves symmetric abduction then adduction of arms.",
  "Social smile appears at?": "Social smile (in response to a face or voice) appears at ~6 weeks of age. Reflexive smiling at birth is not social. Absence of social smile by 3 months warrants developmental evaluation.",
  "Most common congenital heart defect?": "VSD (ventricular septal defect) is the most common congenital heart defect (~30-40%). ASD is the most common in adults presenting for the first time. TOF is the most common cyanotic CHD.",
  "Bishop score is used to assess?": "The Bishop score assesses cervical ripeness before labor induction. It evaluates dilation, effacement, station, consistency, and position. A score ≥8 predicts successful induction.",
  "Most common cause of postpartum hemorrhage?": "Uterine atony accounts for ~80% of PPH cases. Management: uterine massage, oxytocin, misoprostol, ergometrine. If unresponsive: B-Lynch suture, uterine artery ligation, or hysterectomy.",
  "Hydatidiform mole shows which hCG pattern?": "Hydatidiform mole produces markedly elevated β-hCG due to hyperplastic trophoblastic tissue. Complete moles have 46XX (both paternal) with no fetal parts; partial moles are triploid.",
};

const notesData = [
  { id: 1, concept: "PFK-1", fact: "Rate-limiting step of glycolysis (not hexokinase)", subject: "biochemistry", pinned: true },
  { id: 2, concept: "Phrenic nerve", fact: "C3,4,5 keeps the diaphragm alive", subject: "anatomy", pinned: true },
  { id: 3, concept: "Reed-Sternberg cells", fact: "Hodgkin lymphoma — CD15+, CD30+, owl-eye nucleoli", subject: "pathology" },
  { id: 4, concept: "Bishop score ≥8", fact: "Favorable cervix → successful labor induction", subject: "obgyn" },
  { id: 5, concept: "Propranolol", fact: "Non-selective β-blocker (β1 + β2 blocked)", subject: "pharmacology" },
  { id: 6, concept: "Type II pneumocytes", fact: "Produce surfactant (DPPC) — appears ~24 weeks", subject: "physiology" },
  { id: 7, concept: "Charcot's triad", fact: "Fever + jaundice + RUQ pain → ascending cholangitis", subject: "surgery" },
  { id: 8, concept: "Trousseau sign", fact: "Carpal spasm with BP cuff → hypocalcemia", subject: "medicine" },
  { id: 9, concept: "VSD", fact: "Most common congenital heart defect (~30-40%)", subject: "pediatrics" },
  { id: 10, concept: "AFP elevated", fact: "Hepatocellular carcinoma + non-seminomatous GCT", subject: "pathology" },
  { id: 11, concept: "ADH (vasopressin)", fact: "Acts on collecting duct via V2 receptors → AQP2 insertion", subject: "physiology" },
  { id: 12, concept: "Caseous necrosis", fact: "Hallmark of tuberculosis granulomas", subject: "pathology" },
];

const communityMessages = [
  { id: 1, user: "Dr. Sarah M.", avatar: "S", color: "#E06C75", text: "Has anyone else noticed that the new pathology deck has some outdated TNM staging? Should we flag it?", time: "10:42 AM" },
  { id: 2, user: "Ahmed K.", avatar: "A", color: "#61AFEF", text: "Just scored 88% on the pharmacology mock! The key was focusing on mechanism of action rather than just drug names.", time: "10:38 AM" },
  { id: 3, user: "Lisa Chen", avatar: "L", color: "#2BAC76", text: "Great tip @Ahmed! I've been doing the same. Also pairing it with Sketchy Pharm really helped.", time: "10:35 AM" },
  { id: 4, user: "Omar H.", avatar: "O", color: "#E5C07B", text: "Anyone up for a group study session tonight? Covering cardiology and pulmonology.", time: "10:20 AM" },
  { id: 5, user: "Priya R.", avatar: "P", color: "#C678DD", text: "Can someone explain why the answer for Q34 in the anatomy section is B and not C? The femoral triangle question.", time: "9:55 AM" },
  { id: 6, user: "Dr. Sarah M.", avatar: "S", color: "#E06C75", text: "The lateral boundary is sartorius, not adductor longus. Adductor longus is the medial boundary. Common mix-up!", time: "9:50 AM" },
];

const experiencePosts = [
  { id: 1, date: "Today", duration: "2h 15m", sources: "Anatomy, Physiology", score: "82%", note: "Focused on brachial plexus and cardiac physiology. Need to revisit nerve root distributions." },
  { id: 2, date: "Yesterday", duration: "3h 40m", sources: "Pharmacology, Pathology", score: "76%", note: "Drug interactions section was tough. Revised hematological malignancies." },
  { id: 3, date: "Feb 25", duration: "1h 50m", sources: "Surgery, Medicine", score: "91%", note: "Nailed the surgical emergencies section. Charcot's triad finally clicked." },
  { id: 4, date: "Feb 24", duration: "4h 10m", sources: "Biochemistry, Microbiology", score: "68%", note: "Metabolic pathways are still weak. Spent extra time on enzyme deficiencies." },
  { id: 5, date: "Feb 23", duration: "2h 30m", sources: "Pediatrics, OB/GYN", score: "79%", note: "Developmental milestones review. Bishop score and APGARs." },
];

const I = {
  subjects: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 3h5l2 2h7v10H2V3z" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>,
  review: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L11.1 6.3L16 7L12.5 10.4L13.3 15.2L9 13L4.7 15.2L5.5 10.4L2 7L6.9 6.3L9 2z" stroke={c} strokeWidth="1.3" strokeLinejoin="round" fill="none" /></svg>,
  notes: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M10 2H4a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V7L10 2z" stroke={c} strokeWidth="1.3" strokeLinejoin="round" fill="none" /><path d="M10 2v5h5" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 9h6M6 12h4" stroke={c} strokeWidth="1.3" strokeLinecap="round" /></svg>,
  mock: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" stroke={c} strokeWidth="1.3" fill="none" /><path d="M6 6h6M6 9h6M6 12h3" stroke={c} strokeWidth="1.3" strokeLinecap="round" /></svg>,
  analysis: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 15V9M7 15V5M11 15V8M15 15V3" stroke={c} strokeWidth="1.8" strokeLinecap="round" /></svg>,
  community: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="6" r="2.5" stroke={c} strokeWidth="1.3" fill="none" /><path d="M2 15c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={c} strokeWidth="1.3" strokeLinecap="round" fill="none" /><circle cx="13" cy="7" r="2" stroke={c} strokeWidth="1.2" fill="none" /><path d="M14 11c1.7.5 3 2 3 4" stroke={c} strokeWidth="1.2" strokeLinecap="round" fill="none" /></svg>,
  experience: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l1.5 3.5L14 6l-2.5 2.5.5 4L9 11l-3 1.5.5-4L4 6l3.5-.5L9 2z" stroke={c} strokeWidth="1.3" strokeLinejoin="round" fill="none" /><path d="M4 14l1-2M14 14l-1-2" stroke={c} strokeWidth="1.2" strokeLinecap="round" /></svg>,
  settings: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="2.5" stroke={c} strokeWidth="1.3" fill="none" /><path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4" stroke={c} strokeWidth="1.2" strokeLinecap="round" /></svg>,
  upgrade: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l2 4h4l-3.2 2.8L13 14 9 11.2 5 14l1.2-5.2L3 6h4L9 2z" stroke={c} strokeWidth="1.3" strokeLinejoin="round" fill={c} fillOpacity="0.15" /></svg>,
  sun: (c) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke={c} strokeWidth="1.3" /><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke={c} strokeWidth="1.2" strokeLinecap="round" /></svg>,
  moon: (c) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 8.5a5.5 5.5 0 01-6-6 5.5 5.5 0 106 6z" stroke={c} strokeWidth="1.3" fill="none" /></svg>,
  send: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9l14-7-7 14V9L2 9z" stroke={c} strokeWidth="1.3" strokeLinejoin="round" fill="none" /></svg>,
  chev: (c, e) => <svg width="10" height="10" viewBox="0 0 10 10" style={{ transform: e ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 120ms ease", flexShrink: 0 }}><path d="M3 1.5L7 5L3 8.5" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  pin: (c) => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 1L11 5 6.5 9.5 2.5 5.5 7 1z" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.2" /><path d="M2.5 5.5L1 11l5.5-1.5" stroke={c} strokeWidth="1" /></svg>,
  search: (c) => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.5" stroke={c} strokeWidth="1.3" /><path d="M11 11l3.5 3.5" stroke={c} strokeWidth="1.3" strokeLinecap="round" /></svg>,
  clock: (c) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.2" /><path d="M8 4.5V8l2.5 1.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" /></svg>,
  folder: (c) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 3h4l2 2h6v9H2V3z" stroke={c} strokeWidth="1.2" fill="none" /></svg>,
  members: (c) => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke={c} strokeWidth="1.2" fill="none" /><path d="M1 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={c} strokeWidth="1.2" strokeLinecap="round" fill="none" /><circle cx="12" cy="6" r="2" stroke={c} strokeWidth="1.1" fill="none" /><path d="M13 10c1.5.4 2.5 1.8 2.5 3.5" stroke={c} strokeWidth="1.1" strokeLinecap="round" fill="none" /></svg>,
  hamburger: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 4.5h12M3 9h12M3 13.5h12" stroke={c} strokeWidth="1.5" strokeLinecap="round" /></svg>,
  thumbUp: (c) => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8h2v6H2V8zM7 3l-1 5h7.5c.5 0 .8.5.6.9L12 14H6V8L7 3z" stroke={c} strokeWidth="1.2" strokeLinejoin="round" fill="none"/></svg>,
  thumbDown: (c) => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M14 8h-2V2h2v6zM9 13l1-5H2.5c-.5 0-.8-.5-.6-.9L4 2h6v6L9 13z" stroke={c} strokeWidth="1.2" strokeLinejoin="round" fill="none"/></svg>,
  image: (c) => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke={c} strokeWidth="1.2" fill="none"/><circle cx="5.5" cy="6" r="1.2" fill={c}/><path d="M1.5 11l3.5-3.5 2.5 2.5 2-2 3 3" stroke={c} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: (c) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#2BAC76" fillOpacity="0.15"/><path d="M4.5 8l2.5 2.5L11.5 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

const Badge = ({ count }) => (
  <span style={{ backgroundColor: slackColors.badge, color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 12, minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", flexShrink: 0 }}>{count}</span>
);

const SH = ({ label, icon, expanded, onToggle, t }) => (
  <div onClick={onToggle} style={{ display: "flex", alignItems: "center", padding: "6px 16px 6px 12px", cursor: "pointer", userSelect: "none", gap: 6 }}>
    {I.chev(t.sidebarTextMuted, expanded)}
    {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon(t.sidebarTextMuted)}</span>}
    <span style={{ fontSize: 11, fontWeight: 700, color: t.sidebarTextMuted, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
  </div>
);

const ChannelItem = ({ name, isActive, badge, isPrivate, onClick, t }) => {
  const theme = t || slackColors;
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: isActive ? "4px 8px 4px 20px" : "4px 16px 4px 28px",
        cursor: "pointer",
        backgroundColor: isActive ? theme.sidebarActive : "transparent",
        borderRadius: isActive ? 6 : 0,
        margin: isActive ? "0 8px" : 0,
        gap: 8,
        minHeight: 28,
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = theme.sidebarHover; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      <span style={{ fontSize: 15, color: isActive ? "#fff" : theme.channelHash || theme.sidebarTextMuted, fontWeight: 400, width: 16, textAlign: "center", flexShrink: 0 }}>
        {isPrivate ? (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M12 7H4a1 1 0 00-1 1v4a1 1 0 001 1h8a1 1 0 001-1V8a1 1 0 00-1-1z" stroke={isActive ? "#fff" : (theme.channelHash || theme.sidebarTextMuted)} strokeWidth="1.3" fill="none" />
            <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke={isActive ? "#fff" : (theme.channelHash || theme.sidebarTextMuted)} strokeWidth="1.3" fill="none" strokeLinecap="round" />
          </svg>
        ) : (
          <span style={{ color: isActive ? "#fff" : (theme.channelHash || theme.sidebarTextMuted), fontSize: 16, fontWeight: 300 }}>#</span>
        )}
      </span>
      <span style={{
        fontSize: 15,
        color: badge ? (isActive ? "#fff" : theme.sidebarTextBright) : isActive ? "#fff" : theme.sidebarText,
        fontWeight: badge ? 700 : 400,
        lineHeight: "22px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        flex: 1,
      }}>
        {name}
      </span>
      {badge && <Badge count={badge} />}
    </div>
  );
};

const SI = ({ label, icon, emoji, isActive, badge, indent = 0, onClick, t, customColor }) => (
  <div onClick={onClick} style={{
    display: "flex", alignItems: "center",
    padding: isActive ? "5px 8px 5px 12px" : `5px 16px 5px ${16 + indent}px`,
    cursor: "pointer", backgroundColor: isActive ? t.sidebarActive : "transparent",
    borderRadius: isActive ? 6 : 0, margin: isActive ? "1px 8px" : "1px 0", gap: 8, minHeight: 28,
  }}
    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = t.sidebarHover; }}
    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
  >
    {icon && <span style={{ display: "flex", alignItems: "center", width: 18, flexShrink: 0 }}>{icon(isActive ? "#fff" : (customColor || t.sidebarText))}</span>}
    {emoji && <span style={{ fontSize: 14, width: 18, textAlign: "center", flexShrink: 0 }}>{emoji}</span>}
    <span style={{ fontSize: 15, color: badge ? (isActive ? "#fff" : t.sidebarTextBright) : isActive ? "#fff" : (customColor || t.sidebarText), fontWeight: badge ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{label}</span>
    {badge && <Badge count={badge} t={t} />}
  </div>
);

function getChannelInfo(active) {
  const subj = subjectTags.find(s => s.id === active);
  if (subj) return { name: subj.label, isPrivate: false, dot: subj.color, desc: `${mcqBank[active]?.length || 0} questions` };
  const rev = reviewFilters.find(r => r.id === active);
  if (rev) return { name: `${rev.icon} ${rev.label}`, isPrivate: false, desc: "Review session" };
  const map = {
    home: { name: "Home", isPrivate: false, desc: "Your exam overview" },
    notes: { name: "Notes", isPrivate: true, desc: "Your personal study notes" },
    "mock-exam": { name: "Mock Exam", isPrivate: true, desc: "Timed practice exams" },
    analysis: { name: "Analysis", isPrivate: true, desc: "Your performance breakdown" },
    community: { name: "Community", isPrivate: false, desc: "4 members active now" },
    experience: { name: "Experience", isPrivate: false, desc: "Study session logs" },
  };
  return map[active] || { name: active, isPrivate: false };
}

function ContentHeader({ active, t, isMobile, onHamburger }) {
  const info = getChannelInfo(active);
  return (
    <div style={{
      height: 56,
      borderBottom: `1px solid ${t.contentBorder}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: isMobile ? "0 16px" : "0 24px",
      backgroundColor: t.contentHeaderBg,
      flexShrink: 0,
      gap: 8,
      boxShadow: t === darkTheme ? "inset 0 -1px 0 rgba(148,163,184,0.08)" : "inset 0 -1px 0 rgba(148,163,184,0.18)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0, flex: 1 }}>
        {isMobile && (
          <button
            onClick={onHamburger}
            style={{ width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: t.plusBg, color: t.sidebarText, flexShrink: 0 }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = t.sidebarHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = t.plusBg}
          >
            {I.hamburger(t.sidebarText)}
          </button>
        )}
        <span style={{ fontSize: 17, color: t.sidebarTextMuted, fontWeight: 300, flexShrink: 0 }}>
          {info.isPrivate ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M12 7H4a1 1 0 00-1 1v4a1 1 0 001 1h8a1 1 0 001-1V8a1 1 0 00-1-1z" stroke={t.sidebarTextMuted} strokeWidth="1.3" fill="none" />
              <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke={t.sidebarTextMuted} strokeWidth="1.3" fill="none" strokeLinecap="round" />
            </svg>
          ) : "#"}
        </span>
        <span style={{ fontSize: 16, fontWeight: 800, color: t.contentTextBright, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {info.name}
        </span>
        {info.dot && <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: info.dot, flexShrink: 0 }} />}
        {info.desc && (
          <>
            <span style={{ width: 1, height: 16, backgroundColor: t.contentBorder, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: t.sidebarTextMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{info.desc}</span>
          </>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        <SignedIn>
          <div style={{ width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
        <Link
          href="/"
          style={{
            height: 30,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            textDecoration: "none",
            padding: "0 10px",
            color: t.sidebarText,
            fontSize: 12,
            fontWeight: 700,
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = t.sidebarHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          Home
        </Link>
      </div>
    </div>
  );
}

function QuestionCard({ mcq, t, questionNumber, onSelect }) {
  const [selected, setSelected] = useState(null);
  const [pinned, setPinned] = useState(mcq.status === "bookmark");
  const [feedbackState, setFeedbackState] = useState(null); // null | "up" | "reported"
  const [showFeedbackOpts, setShowFeedbackOpts] = useState(false);

  const answered = selected !== null;
  const isCorrect = answered && selected === mcq.correct;

  const handleAnswer = (letter) => {
    if (answered) return;
    setSelected(letter);
    if (onSelect) onSelect(mcq);
  };

  const options = [
    { letter: "A", text: mcq.a.replace(/^A\)\s*/, "") },
    { letter: "B", text: mcq.b.replace(/^B\)\s*/, "") },
    { letter: "C", text: mcq.c.replace(/^C\)\s*/, "") },
    { letter: "D", text: mcq.d.replace(/^D\)\s*/, "") },
  ];

  return (
    <div
      style={{
        borderRadius: 16,
        border: `1.5px solid ${answered ? (isCorrect ? "rgba(43,172,118,0.45)" : "rgba(224,30,90,0.35)") : t.cardBorder}`,
        backgroundColor: t.cardBg,
        marginBottom: 14,
        padding: "20px 22px",
        transition: "border-color 0.25s ease",
        boxShadow: t === darkTheme ? "0 1px 0 rgba(15,23,42,0.9)" : "0 8px 22px rgba(15,23,42,0.06)",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: t.sidebarTextMuted, letterSpacing: "0.05em" }}>
            Q{questionNumber}
          </span>
          {answered && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 9px",
                borderRadius: 10,
                backgroundColor: isCorrect ? "rgba(43,172,118,0.14)" : "rgba(224,30,90,0.11)",
                color: isCorrect ? "#2BAC76" : "#E01E5A",
              }}
            >
              {isCorrect ? "Correct" : "Incorrect"}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {/* Pin — bookmark */}
          <button
            onClick={() => setPinned(!pinned)}
            title={pinned ? "Unpin question" : "Pin question"}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pinned ? "rgba(17,100,163,0.15)" : t.plusBg,
              color: pinned ? t.sidebarActive : t.sidebarText,
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = pinned ? "rgba(17,100,163,0.22)" : t.sidebarHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = pinned ? "rgba(17,100,163,0.15)" : t.plusBg;
            }}
          >
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <path
                d="M4.5 2.5h7a1 1 0 011 1V14l-4.5-2.6L3.5 14V3.5a1 1 0 011-1z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
                fill={pinned ? "currentColor" : "none"}
                fillOpacity={pinned ? "0.22" : "0"}
              />
            </svg>
          </button>
          {/* AI Chat — Gemini 4-pointed star */}
          <button
            onClick={() => onSelect && onSelect(mcq)}
            title="Ask AI about this question"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(17,100,163,0.1)",
              color: t.sidebarActive,
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(17,100,163,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(17,100,163,0.1)";
            }}
          >
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <path d="M8 1C8 4.5 11.5 8 15 8C11.5 8 8 11.5 8 15C8 11.5 4.5 8 1 8C4.5 8 8 4.5 8 1Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Question text */}
      <p style={{ fontSize: 17, fontWeight: 700, color: t.contentTextBright, lineHeight: 1.75, margin: "0 0 18px 0" }}>
        {mcq.q}
      </p>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {options.map(({ letter, text }) => {
          const isSelected = selected === letter;
          const isAnswer = letter === mcq.correct;
          let bg = "transparent";
          let borderColor = t.cardBorder;
          let textColor = t.contentText;
          let letterBg = t.plusBg;
          let letterColor = t.sidebarTextMuted;

          if (answered) {
            if (isAnswer) {
              bg = t === darkTheme ? "rgba(43,172,118,0.14)" : "rgba(43,172,118,0.09)";
              borderColor = "#2BAC76";
              textColor = t.contentTextBright;
              letterBg = "#2BAC76";
              letterColor = "#fff";
            } else if (isSelected) {
              bg = t === darkTheme ? "rgba(224,30,90,0.1)" : "rgba(224,30,90,0.07)";
              borderColor = "#E01E5A";
              textColor = t.sidebarTextMuted;
              letterBg = "#E01E5A";
              letterColor = "#fff";
            } else {
              textColor = t.sidebarTextMuted;
            }
          }

          return (
            <div
              key={letter}
              onClick={() => handleAnswer(letter)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 14px",
                borderRadius: 11,
                border: `1.5px solid ${borderColor}`,
                backgroundColor: bg,
                cursor: answered ? "default" : "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!answered) {
                  e.currentTarget.style.backgroundColor = t.hoverCard;
                  e.currentTarget.style.borderColor = t.sidebarActive;
                }
              }}
              onMouseLeave={(e) => {
                if (!answered) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = t.cardBorder;
                }
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: letterBg,
                  color: letterColor,
                  transition: "all 0.2s",
                }}
              >
                {letter}
              </span>
              <span style={{ flex: 1, fontSize: 15, color: textColor, lineHeight: 1.6 }}>{text}</span>
              {answered && isAnswer && (
                <svg width="17" height="17" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="8" cy="8" r="7.5" fill="#2BAC76" fillOpacity="0.18" />
                  <path d="M4.5 8l2.5 2.5L11.5 5" stroke="#2BAC76" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {answered && isSelected && !isAnswer && (
                <svg width="17" height="17" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="8" cy="8" r="7.5" fill="#E01E5A" fillOpacity="0.15" />
                  <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#E01E5A" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Feedback row — shown after answering */}
      {answered && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
          {feedbackState ? (
            <span style={{ fontSize: 12, color: "#2BAC76", display: "flex", alignItems: "center", gap: 5 }}>
              {I.check("#2BAC76")}
              {feedbackState === "up" ? "Thanks for the feedback!" : "Thanks! We'll look into this."}
            </span>
          ) : (
            <>
              <span style={{ fontSize: 12, color: t.sidebarTextMuted, marginRight: 2 }}>Helpful?</span>
              <button
                onClick={() => setFeedbackState("up")}
                title="Helpful"
                style={{ padding: "3px 10px", borderRadius: 7, border: `1px solid ${t.cardBorder}`, backgroundColor: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: t.contentText, fontSize: 12 }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(43,172,118,0.1)"; e.currentTarget.style.borderColor = "#2BAC76"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = t.cardBorder; }}
              >
                {I.thumbUp(t.contentText)} Up
              </button>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowFeedbackOpts(!showFeedbackOpts)}
                  title="Report an issue"
                  style={{ padding: "3px 10px", borderRadius: 7, border: `1px solid ${t.cardBorder}`, backgroundColor: showFeedbackOpts ? "rgba(224,30,90,0.08)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: t.contentText, fontSize: 12 }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(224,30,90,0.08)"; e.currentTarget.style.borderColor = "#E01E5A"; }}
                  onMouseLeave={(e) => { if (!showFeedbackOpts) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = t.cardBorder; } }}
                >
                  {I.thumbDown(t.contentText)} Down
                </button>
                {showFeedbackOpts && (
                  <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: 0, zIndex: 100, backgroundColor: t.contentHeaderBg, border: `1px solid ${t.contentBorder}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.14)", minWidth: 200, padding: "4px 0", overflow: "hidden" }}>
                    {["Typo or spelling error", "Incorrect answer", "Unclear question", "Other issue"].map((opt, i) => (
                      <div
                        key={i}
                        onClick={() => { setFeedbackState("reported"); setShowFeedbackOpts(false); }}
                        style={{ padding: "9px 14px", fontSize: 13, color: t.contentText, cursor: "pointer" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = t.hoverCard}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
function MCQList({ questions, t, showFilter, activeFilter, onFilterChange, onSelect }) {
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);
  const filtered = showFilter ? questions.filter(q => {
    if (activeFilter === "review-all") return true;
    if (activeFilter === "review-correct") return q.status === "correct";
    if (activeFilter === "review-incorrect") return q.status === "incorrect";
    if (activeFilter === "review-bookmark") return q.status === "bookmark";
    return true;
  }) : questions;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  useEffect(() => { setPage(1); }, [activeFilter, questions]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Scrollable questions area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 8px" }}>
        {showFilter && (
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {reviewFilters.map(r => (
              <div key={r.id} onClick={() => onFilterChange(r.id)} style={{
                padding: "5px 14px", borderRadius: 16, fontSize: 13, fontWeight: 600, cursor: "pointer",
                backgroundColor: activeFilter === r.id ? t.sidebarActive : t.plusBg,
                color: activeFilter === r.id ? "#fff" : t.sidebarText,
                border: `1px solid ${activeFilter === r.id ? t.sidebarActive : t.cardBorder}`,
              }}>
                {r.icon} {r.label}
              </div>
            ))}
          </div>
        )}
        {filtered.length === 0 && <p style={{ color: t.sidebarTextMuted, fontSize: 14 }}>No questions match this filter.</p>}
        {pageItems.map((mcq, i) => (
          <QuestionCard key={`${mcq.q}-${start + i}`} mcq={mcq} t={t} questionNumber={start + i + 1} onSelect={onSelect} />
        ))}
      </div>

      {/* Sticky pagination — always at bottom, never scrolls */}
      <div style={{
        flexShrink: 0,
        padding: "10px 28px 14px",
        borderTop: `1px solid ${t.contentBorder}`,
        backgroundColor: t.contentBg,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          backgroundColor: t.inputBg,
          border: `1px solid ${t.cardBorder}`,
          borderRadius: 10,
          padding: "8px 12px",
        }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            style={{
              border: "none", borderRadius: 7, padding: "7px 16px",
              cursor: safePage === 1 ? "default" : "pointer",
              backgroundColor: safePage === 1 ? "transparent" : t.plusBg,
              color: safePage === 1 ? t.sidebarTextMuted : t.sidebarText,
              fontSize: 13, fontWeight: 700,
            }}
          >
            ← Back
          </button>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: t.sidebarTextMuted }}>
              {filtered.length === 0 ? "0" : `${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)}`}
            </span>
            <span style={{ fontSize: 13, color: t.sidebarTextMuted }}> of </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.contentTextBright }}>{filtered.length}</span>
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            style={{
              border: "none", borderRadius: 7, padding: "7px 16px",
              cursor: safePage === totalPages ? "default" : "pointer",
              backgroundColor: safePage === totalPages ? "transparent" : t.sidebarActive,
              color: safePage === totalPages ? t.sidebarTextMuted : "#fff",
              fontSize: 13, fontWeight: 700,
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

function RightPanel({ t, selectedQuestion, explanation, chatMessages, chatInput, chatLoading, onChatInputChange, onSendChat, chatEndRef, isOpen, onToggle }) {
  const [tab, setTab] = useState("explanation");

  /* ── Collapsed state — slim strip ── */
  if (!isOpen) {
    return (
      <div style={{
        width: 44, flexShrink: 0,
        borderLeft: `1px solid ${t.contentBorder}`,
        backgroundColor: t.contentHeaderBg,
        display: "flex", flexDirection: "column",
        alignItems: "center", paddingTop: 12, gap: 10,
      }}>
        <button
          onClick={onToggle}
          title="Open Study Panel"
          style={{
            width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: t.plusBg, color: t.sidebarText,
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = t.sidebarHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = t.plusBg}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L6 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ writingMode: "vertical-rl", fontSize: 10, fontWeight: 700, color: t.sidebarTextMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4, userSelect: "none" }}>
          Study Panel
        </div>
      </div>
    );
  }

  /* ── Open state ── */
  return (
    <div style={{
      width: 380,
      flexShrink: 0,
      borderLeft: `1px solid ${t.contentBorder}`,
      backgroundColor: t.contentHeaderBg,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      height: "100%",
    }}>
      {/* ── Header ── */}
      <div style={{ padding: "0 14px 0 16px", borderBottom: `1px solid ${t.contentBorder}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", height: 52, gap: 6 }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <path d="M8 1C8 4.5 11.5 8 15 8C11.5 8 8 11.5 8 15C8 11.5 4.5 8 1 8C4.5 8 8 4.5 8 1Z" fill={t.sidebarActive} />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 700, color: t.contentTextBright, marginRight: "auto", marginLeft: 2 }}>Study Panel</span>
          {["explanation", "chat"].map(tb => (
            <button key={tb} onClick={() => setTab(tb)} style={{
              padding: "6px 13px", borderRadius: 7, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              backgroundColor: tab === tb ? (t === darkTheme ? "rgba(17,100,163,0.22)" : "rgba(17,100,163,0.11)") : "transparent",
              color: tab === tb ? t.sidebarActive : t.sidebarTextMuted,
              transition: "all 0.15s",
            }}>
              {tb === "explanation" ? "Explain" : "Ask AI"}
            </button>
          ))}
          {/* Collapse button */}
          <button
            onClick={onToggle}
            title="Collapse panel"
            style={{
              width: 28, height: 28, borderRadius: 7, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: "transparent", color: t.sidebarTextMuted, marginLeft: 2,
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = t.plusBg}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L10 8L6 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Empty state ── */}
      {!selectedQuestion ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", gap: 18 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: t.plusBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
              <path d="M8 1C8 4.5 11.5 8 15 8C11.5 8 8 11.5 8 15C8 11.5 4.5 8 1 8C4.5 8 8 4.5 8 1Z" fill={t.sidebarActive} fillOpacity="0.5" />
            </svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: t.contentTextBright, margin: "0 0 8px" }}>Select a question</p>
            <p style={{ fontSize: 13.5, color: t.sidebarTextMuted, lineHeight: 1.65, margin: 0 }}>
              Answer any question or tap the ✦ AI button to load its explanation and chat here.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ── Question context strip ── */}
          <div style={{ padding: "12px 18px", borderBottom: `1px solid ${t.contentBorder}`, flexShrink: 0, backgroundColor: t === darkTheme ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: t.contentTextBright, lineHeight: 1.55, margin: "0 0 10px" }}>
              {selectedQuestion.q}
            </p>
            <span style={{ fontSize: 13, fontWeight: 800, padding: "3px 10px", borderRadius: 6, backgroundColor: "rgba(43,172,118,0.13)", color: "#2BAC76" }}>
              Answer: {selectedQuestion.correct}
            </span>
          </div>

          {/* ── Explanation tab ── */}
          {tab === "explanation" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px" }}>
              <p style={{ fontSize: 15.5, color: t.contentTextBright, lineHeight: 1.85, margin: 0 }}>
                {explanation || "No explanation available for this question yet."}
              </p>
            </div>
          )}

          {/* ── Chat tab ── */}
          {tab === "chat" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
                {chatMessages.length === 0 && (
                  <div style={{ padding: "16px", borderRadius: 12, backgroundColor: t.plusBg, marginBottom: 12 }}>
                    <p style={{ fontSize: 15, color: t.contentTextBright, lineHeight: 1.65, margin: 0 }}>
                      Ask anything — why is this the right answer, what&apos;s the mechanism, how to remember it?
                    </p>
                  </div>
                )}
                {chatMessages.map((m, i) => (
                  <div key={i} style={{ marginBottom: 12, display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "88%",
                      padding: "10px 14px",
                      borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      backgroundColor: m.role === "user" ? t.sidebarActive : t.plusBg,
                      color: m.role === "user" ? "#fff" : t.contentTextBright,
                      fontSize: 15,
                      lineHeight: 1.6,
                    }}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: "flex", gap: 5, padding: "10px 14px", width: "fit-content", borderRadius: "14px 14px 14px 4px", backgroundColor: t.plusBg }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: t.sidebarTextMuted, opacity: 0.6 }} />
                    ))}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* input */}
              <div style={{ padding: "10px 14px 16px", borderTop: `1px solid ${t.contentBorder}`, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: t.inputBg, border: `1px solid ${t.cardBorder}`, borderRadius: 11, padding: "6px 6px 6px 14px" }}>
                  <input
                    value={chatInput}
                    onChange={(e) => onChatInputChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSendChat(); } }}
                    placeholder="Ask anything about this question…"
                    style={{ flex: 1, fontSize: 14, border: "none", backgroundColor: "transparent", color: t.contentTextBright, outline: "none", fontFamily: "inherit", padding: "3px 0" }}
                  />
                  <button onClick={onSendChat} disabled={chatLoading || !chatInput.trim()} style={{
                    width: 32, height: 32, borderRadius: 9, border: "none",
                    cursor: chatInput.trim() && !chatLoading ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: chatInput.trim() && !chatLoading ? t.sidebarActive : t.plusBg,
                    flexShrink: 0,
                  }}>
                    {I.send(chatInput.trim() && !chatLoading ? "#fff" : t.sidebarTextMuted)}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Chat({ t, selectedQuestion }) {
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState(communityMessages);
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = () => {
    if (!msg.trim()) return;
    setMsgs(p => [...p, { id: Date.now(), user: "You", avatar: "Y", color: t.sidebarActive, text: msg.trim(), time: "Just now" }]);
    setMsg("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Question context banner — shown when a question is selected */}
      {selectedQuestion && (
        <div style={{ padding: "10px 24px", borderBottom: `1px solid ${t.contentBorder}`, backgroundColor: t === darkTheme ? "rgba(17,100,163,0.12)" : "rgba(17,100,163,0.06)", flexShrink: 0, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
            <path d="M8 1C8 4.5 11.5 8 15 8C11.5 8 8 11.5 8 15C8 11.5 4.5 8 1 8C4.5 8 8 4.5 8 1Z" fill={t.sidebarActive} />
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.sidebarActive, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 3 }}>Discussing</div>
            <div style={{ fontSize: 13, color: t.contentTextBright, lineHeight: 1.45, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {selectedQuestion.q}
            </div>
          </div>
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        <div style={{ width: "100%" }}>
          {msgs.map(m => (
            <div key={m.id} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 6, backgroundColor: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{m.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.contentTextBright }}>{m.user}</span>
                  <span style={{ fontSize: 11, color: t.sidebarTextMuted }}>{m.time}</span>
                </div>
                <div style={{ fontSize: 14, color: t.contentText, lineHeight: 1.55, marginTop: 2 }}>{m.text}</div>
              </div>
            </div>
          ))}
          <div ref={ref} />
        </div>
      </div>
      <div style={{ padding: "12px 24px 16px", borderTop: `1px solid ${t.contentBorder}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, backgroundColor: t.inputBg, border: `1px solid ${t.cardBorder}`, borderRadius: 10, padding: "8px 12px" }}>
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            {[
              <svg key="b" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 3h5a3 3 0 010 6H4V3z" stroke={t.sidebarTextMuted} strokeWidth="1.3" /><path d="M4 9h6a3 3 0 010 6H4V9z" stroke={t.sidebarTextMuted} strokeWidth="1.3" /></svg>,
              <svg key="a" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 7.5l-5.5 5.5a3.5 3.5 0 01-5-5L9 2.5a2 2 0 013 3L6.5 11a.5.5 0 01-1-1L11 5" stroke={t.sidebarTextMuted} strokeWidth="1.2" strokeLinecap="round" /></svg>,
              <svg key="e" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={t.sidebarTextMuted} strokeWidth="1.2" /><circle cx="6" cy="7" r="0.8" fill={t.sidebarTextMuted} /><circle cx="10" cy="7" r="0.8" fill={t.sidebarTextMuted} /><path d="M5.5 10a3 3 0 005 0" stroke={t.sidebarTextMuted} strokeWidth="1.1" strokeLinecap="round" /></svg>,
              <svg key="m" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12V4l5 4 5-4v8" stroke={t.sidebarTextMuted} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 4l5 4 5-4" stroke={t.sidebarTextMuted} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            ].map((ic, i) => <span key={i} style={{ cursor: "pointer", padding: 4, borderRadius: 4, display: "flex" }}>{ic}</span>)}
          </div>
          <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Message #community" style={{ flex: 1, border: "none", outline: "none", backgroundColor: "transparent", fontSize: 14, color: t.contentTextBright, padding: "4px 0", fontFamily: "inherit" }} />
          <div onClick={send} style={{
            width: 30, height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            backgroundColor: msg.trim() ? t.sidebarActive : t.plusBg,
          }}>
            {I.send(msg.trim() ? "#fff" : t.sidebarTextMuted)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DrNoteApp({ params }) {
  const { user } = useUser();
  const [themeMode, setThemeMode] = useState("light"); // "light" | "white" | "dark"
  const [active, setActive] = useState("home");
  const [sExp, setSExp] = useState(true);
  const [rExp, setRExp] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [rightOpen, setRightOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [noteSearch, setNoteSearch] = useState("");
  const chatEndRef = useRef(null);
  const t = themeMode === "dark" ? darkTheme : themeMode === "white" ? whiteTheme : lightTheme;
  const subj = subjectTags.find(s => s.id === active);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      } else {
        setRightOpen(false); // hide right panel by default on mobile
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const resolvedParams = params && typeof params.then === "function" ? use(params) : params;
  const slug = resolvedParams?.slug ? decodeURIComponent(resolvedParams.slug) : "";
  const exams = useQuery(api.exams.list) ?? [];
  const currentExam = exams.find(e => (e.slug || toSlug(e.name)) === slug);

  useEffect(() => {
    document.documentElement.style.setProperty("--page-bg", t.contentBg);
    document.body.style.background = t.contentBg;
  }, [t.contentBg]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    const validIds = [
      ...subjectTags.map(s => s.id),
      ...reviewFilters.map(r => r.id),
      "notes", "mock-exam", "analysis", "community", "experience", "home",
    ];
    if (hash && validIds.includes(hash)) setActive(hash);
  }, []);

  const handleSetActive = (id) => {
    setActive(id);
    setSidebarOpen(false); // close on mobile after selection
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname + "#" + id);
    }
  };

  const handleSelectQuestion = (mcq) => {
    setSelectedQuestion(mcq);
    setChatMessages([]);
    setChatInput("");
  };

  const sendChat = () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput.trim() };
    setChatMessages((p) => [...p, userMsg]);
    setChatInput("");
    setChatLoading(true);
    setTimeout(() => {
      setChatMessages((p) => [
        ...p,
        { role: "ai", content: "I can help explain the concept and why the correct option fits best. Ask about any option." },
      ]);
      setChatLoading(false);
    }, 700);
  };

  const selectedExplanation = selectedQuestion ? mcqExplanations[selectedQuestion.q] : "";

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      display: "flex",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      backgroundColor: t.contentBg,
    }}>
      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: 260,
        minWidth: 260,
        backgroundColor: t.sidebarBg,
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${t.sidebarDivider}`,
        height: "100%",
        overflow: "hidden",
        ...(isMobile ? {
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 50,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 240ms cubic-bezier(0.4,0,0.2,1)",
          boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.2)" : "none",
        } : {}),
      }}>
        {/* Sidebar header */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.sidebarDivider}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", flex: 1, minWidth: 0 }}>
              <img
                src="https://q648y7e0kt.ufs.sh/f/7bppoSdGjTuBTzuTUA7qD8isog5Jkr6pPfyeGQdAhlwzxN0V"
                alt="DrNote"
                style={{ width: 26, height: 26, objectFit: "contain", flexShrink: 0 }}
              />
              <span style={{ fontSize: 18, fontWeight: 900, color: t.sidebarTextBright, letterSpacing: "-0.02em", flexShrink: 0 }}>DrNote</span>
              {currentExam && (
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.07em",
                  color: "#fff",
                  backgroundColor: currentExam.bg || t.sidebarActive,
                  padding: "2px 6px", borderRadius: 4,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}>
                  {(currentExam.abbr || currentExam.name.split(" ").map(w => w[0]).join("")).toUpperCase().slice(0, 6)}
                </span>
              )}
            </div>
            <div
              onClick={() => setThemeMode(m => m === "dark" ? "light" : m === "light" ? "white" : "dark")}
              title={themeMode === "dark" ? "Switch to light" : themeMode === "light" ? "Switch to white" : "Switch to dark"}
              style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: t.plusBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = t.sidebarHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = t.plusBg}
            >
              {themeMode === "dark" ? I.sun(t.sidebarText) : themeMode === "white" ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="5.5" stroke={t.sidebarText} strokeWidth="1.3" fill={t.sidebarText} fillOpacity="0.2"/>
                  <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke={t.sidebarText} strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              ) : I.moon(t.sidebarText)}
            </div>
          </div>
        </div>

        {/* Sidebar nav */}
        <div style={{ flex: 1, overflowY: "auto", paddingTop: 8, paddingBottom: 4 }}>
          <SI label="Home" emoji="🏠" isActive={active === "home"} onClick={() => handleSetActive("home")} t={t} />
          <div style={{ height: 1, backgroundColor: t.sidebarDivider, margin: "4px 16px 8px" }} />
          <SH label="Subjects" icon={I.subjects} expanded={sExp} onToggle={() => setSExp(!sExp)} t={t} />
          {sExp && subjectTags.map(s => (
            <ChannelItem
              key={s.id}
              name={s.label}
              isActive={active === s.id}
              onClick={() => handleSetActive(s.id)}
              t={t}
            />
          ))}
          <div style={{ height: 1, backgroundColor: t.sidebarDivider, margin: "8px 16px" }} />
          <SH label="Review" icon={I.review} expanded={rExp} onToggle={() => setRExp(!rExp)} t={t} />
          {rExp && reviewFilters.map(r => (
            <ChannelItem
              key={r.id}
              name={`${r.icon} ${r.label}`}
              isActive={active === r.id}
              onClick={() => handleSetActive(r.id)}
              t={t}
            />
          ))}
          <div style={{ height: 1, backgroundColor: t.sidebarDivider, margin: "8px 16px" }} />
          <ChannelItem name="Notes" isActive={active === "notes"} onClick={() => handleSetActive("notes")} isPrivate t={t} />
          <ChannelItem name="Mock Exam" isActive={active === "mock-exam"} onClick={() => handleSetActive("mock-exam")} isPrivate t={t} />
          <ChannelItem name="Analysis" isActive={active === "analysis"} onClick={() => handleSetActive("analysis")} isPrivate t={t} />
          <div style={{ height: 1, backgroundColor: t.sidebarDivider, margin: "8px 16px" }} />
          <ChannelItem name="Community" isActive={active === "community"} onClick={() => handleSetActive("community")} badge={4} t={t} />
          <ChannelItem name="Experience" isActive={active === "experience"} onClick={() => handleSetActive("experience")} t={t} />
        </div>

        {/* Sidebar footer */}
        <div style={{ borderTop: `1px solid ${t.sidebarDivider}`, padding: "6px 0 8px", flexShrink: 0 }}>
          <SI label="Upgrade to Pro" icon={I.upgrade} onClick={() => {}} t={t} customColor={t.green} />
          <SI label="Settings" icon={I.settings} onClick={() => {}} t={t} />
        </div>
      </div>

      {/* Main content column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Content header — always fixed, never scrolls */}
        <ContentHeader active={active} t={t} isMobile={isMobile} onHamburger={() => setSidebarOpen(true)} />

        {/* Content area */}
        {active === "community" ? (
          <Chat t={t} selectedQuestion={selectedQuestion} />
        ) : (
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* ── Left: questions / content ── */}
            {(subj || active.startsWith("review-")) ? (
              <div style={{ flex: 1, display: "flex", minWidth: 0, overflow: "hidden", backgroundColor: t.contentBg }}>
                {subj && <MCQList questions={mcqBank[active] || []} t={t} onSelect={handleSelectQuestion} />}
                {active.startsWith("review-") && <MCQList questions={allMcqs} t={t} showFilter activeFilter={active} onFilterChange={handleSetActive} onSelect={handleSelectQuestion} />}
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 16px 36px" : "20px 28px 36px", minWidth: 0, backgroundColor: t.contentBg }}>
                {active === "home" && (() => {
                  const subjectProgress = [82, 74, 68, 71, 89, 63, 77, 85, 72, 66];
                  const firstName = user?.firstName || user?.username || "there";
                  return (
                    <div style={{ maxWidth: 680 }}>
                      {/* Greeting */}
                      <div style={{ marginBottom: 28 }}>
                        <div style={{ fontSize: 26, fontWeight: 800, color: t.contentTextBright, letterSpacing: "-0.02em", marginBottom: 6 }}>
                          Hi, {firstName} 👋
                        </div>
                        <div style={{ fontSize: 15, color: t.contentText, lineHeight: 1.6 }}>
                          Welcome back to your exam prep. Here&apos;s an overview of your progress.
                        </div>
                      </div>

                      {/* About exam */}
                      <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "20px 22px", marginBottom: 28 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: t.sidebarTextMuted, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>About this Exam</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                          {currentExam?.bg && (
                            <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: currentExam.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                              {(currentExam.abbr || currentExam.name.split(" ").map(w => w[0]).join("")).toUpperCase().slice(0, 4)}
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: 17, fontWeight: 800, color: t.contentTextBright, letterSpacing: "-0.01em" }}>
                              {currentExam?.name || "Saudi Medical Licensing Exam"}
                            </div>
                            <div style={{ fontSize: 12, color: t.sidebarTextMuted, marginTop: 2 }}>
                              {subjectTags.length} subjects &nbsp;·&nbsp; {Object.values(mcqBank).reduce((a, b) => a + b.length, 0)} questions
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: t.contentText, lineHeight: 1.65 }}>
                          A comprehensive licensing assessment covering core medical sciences and clinical subjects. Work through each subject below to build your readiness.
                        </div>
                      </div>

                      {/* Subject checklist */}
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.sidebarTextMuted, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>Subjects</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {subjectTags.map((s, i) => {
                          const pct = subjectProgress[i];
                          const total = mcqBank[s.id]?.length || 0;
                          const barColor = pct >= 80 ? "#2BAC76" : pct >= 70 ? "#E5C07B" : "#E06C75";
                          return (
                            <div
                              key={s.id}
                              onClick={() => handleSetActive(s.id)}
                              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, cursor: "pointer", transition: "border-color 0.15s" }}
                              onMouseEnter={(e) => e.currentTarget.style.borderColor = t.sidebarActive}
                              onMouseLeave={(e) => e.currentTarget.style.borderColor = t.cardBorder}
                            >
                              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: s.color, flexShrink: 0 }} />
                              <span style={{ fontSize: 14, fontWeight: 600, color: t.contentTextBright, width: 112, flexShrink: 0 }}>{s.label}</span>
                              <div style={{ flex: 1, height: 5, backgroundColor: t.plusBg, borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ width: `${pct}%`, height: "100%", backgroundColor: barColor, borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: barColor, width: 36, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
                              <span style={{ fontSize: 11, color: t.sidebarTextMuted, width: 38, textAlign: "right", flexShrink: 0 }}>{total} Qs</span>
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                                <path d="M5 3l4 4-4 4" stroke={t.sidebarTextMuted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                {active === "notes" && (() => {
                  const q = noteSearch.toLowerCase().trim();
                  const filtered = q
                    ? notesData.filter(n => n.concept.toLowerCase().includes(q) || n.fact.toLowerCase().includes(q) || n.subject.toLowerCase().includes(q))
                    : notesData;
                  const pinned = filtered.filter(n => n.pinned);
                  const rest = filtered.filter(n => !n.pinned);
                  const NoteRow = ({ n, big }) => (
                    <div
                      style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: big ? "12px 14px" : "10px 14px", borderRadius: 10, marginBottom: 5, border: `1px solid ${t.cardBorder}`, backgroundColor: t.cardBg, cursor: "pointer" }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = t.sidebarActive}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = t.cardBorder}
                    >
                      {/* Single accent bar — one color for all */}
                      <div style={{ width: 3, borderRadius: 2, backgroundColor: t.sidebarActive, flexShrink: 0, alignSelf: "stretch", minHeight: 24 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: t.contentTextBright }}>{n.concept}</span>
                          {n.pinned && (
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L14 7.5L11 10.5H5L2 7.5L8 1.5Z" stroke={t.sidebarActive} strokeWidth="1.3" strokeLinejoin="round" fill={t.sidebarActive} fillOpacity="0.3"/><path d="M8 10.5V15" stroke={t.sidebarActive} strokeWidth="1.5" strokeLinecap="round"/></svg>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: t.contentText, marginTop: 2, lineHeight: 1.5 }}>{n.fact}</div>
                        {n.image && (
                          <div style={{ marginTop: 8, borderRadius: 8, overflow: "hidden", border: `1px solid ${t.cardBorder}` }}>
                            <img src={n.image} alt={n.concept} style={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block" }} />
                          </div>
                        )}
                      </div>
                      {/* Image attach icon */}
                      <div title="Attach image" style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: t.plusBg, cursor: "pointer", flexShrink: 0 }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = t.sidebarHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = t.plusBg}>
                        {I.image(t.sidebarTextMuted)}
                      </div>
                    </div>
                  );
                  return (
                    <div style={{ maxWidth: 700 }}>
                      {/* Add note */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: `1.5px dashed ${t.cardBorder}`, cursor: "pointer", marginBottom: 14, backgroundColor: t.cardBg }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = t.sidebarActive}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = t.cardBorder}>
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke={t.sidebarActive} strokeWidth="1.6" strokeLinecap="round" /></svg>
                        <span style={{ fontSize: 13, color: t.sidebarActive, fontWeight: 600 }}>Add note…</span>
                      </div>

                      {/* Search */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: t.inputBg, border: `1px solid ${t.cardBorder}`, borderRadius: 10, padding: "8px 12px", marginBottom: 18 }}>
                        {I.search(t.sidebarTextMuted)}
                        <input
                          value={noteSearch}
                          onChange={(e) => setNoteSearch(e.target.value)}
                          placeholder="Search notes…"
                          style={{ flex: 1, border: "none", outline: "none", backgroundColor: "transparent", fontSize: 14, color: t.contentTextBright, fontFamily: "inherit" }}
                        />
                        {noteSearch && (
                          <button onClick={() => setNoteSearch("")} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex", color: t.sidebarTextMuted }}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          </button>
                        )}
                      </div>

                      {filtered.length === 0 && (
                        <p style={{ fontSize: 14, color: t.sidebarTextMuted, textAlign: "center", paddingTop: 24 }}>No notes match &quot;{noteSearch}&quot;</p>
                      )}

                      {pinned.length > 0 && (
                        <>
                          <div style={{ fontSize: 10, fontWeight: 700, color: t.sidebarTextMuted, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Pinned</div>
                          {pinned.map(n => <NoteRow key={n.id} n={n} big />)}
                          {rest.length > 0 && <div style={{ height: 1, backgroundColor: t.cardBorder, margin: "14px 0" }} />}
                        </>
                      )}
                      {rest.length > 0 && (
                        <>
                          <div style={{ fontSize: 10, fontWeight: 700, color: t.sidebarTextMuted, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Notes</div>
                          {rest.map(n => <NoteRow key={n.id} n={n} />)}
                        </>
                      )}
                    </div>
                  );
                })()}
                {active === "mock-exam" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[{ t: "Quick Quiz", d: "20 questions • 30 min", i: "⚡" }, { t: "Full Mock", d: "100 questions • 3 hrs", i: "📝" }, { t: "Subject Specific", d: "Choose your topic", i: "🎯" }, { t: "Weak Areas", d: "Based on your mistakes", i: "🔬" }].map((e, i) => (
                      <div key={i} style={{ padding: "22px", borderRadius: 10, cursor: "pointer", backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}` }}
                        onMouseEnter={(ev) => ev.currentTarget.style.borderColor = t.sidebarActive}
                        onMouseLeave={(ev) => ev.currentTarget.style.borderColor = t.cardBorder}>
                        <div style={{ fontSize: 26, marginBottom: 8 }}>{e.i}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: t.contentTextBright }}>{e.t}</div>
                        <div style={{ fontSize: 13, color: t.sidebarTextMuted, marginTop: 4 }}>{e.d}</div>
                      </div>
                    ))}
                  </div>
                )}
                {active === "analysis" && (() => {
                  const stats = [
                    { label: "Questions Done", value: "1,247", sub: "+38 today", accent: t.sidebarActive, icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="16" height="16" rx="3" stroke={t.sidebarActive} strokeWidth="1.4" fill="none"/><path d="M6 7h8M6 10h8M6 13h5" stroke={t.sidebarActive} strokeWidth="1.3" strokeLinecap="round"/></svg> },
                    { label: "Accuracy", value: "76%", sub: "↑ 3% vs last week", accent: "#2BAC76", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="#2BAC76" strokeWidth="1.4" fill="none"/><path d="M6.5 10.5l2.5 2.5L13.5 7" stroke="#2BAC76" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                    { label: "Study Hours", value: "142h", sub: "4.7h avg / day", accent: "#E5C07B", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="#E5C07B" strokeWidth="1.4" fill="none"/><path d="M10 5.5V10l3 2" stroke="#E5C07B" strokeWidth="1.4" strokeLinecap="round"/></svg> },
                    { label: "Day Streak", value: "14d", sub: "Personal best!", accent: "#E01E5A", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l2 5h5l-4 3 1.5 5L10 12l-4.5 3L7 10 3 7h5L10 2z" stroke="#E01E5A" strokeWidth="1.3" strokeLinejoin="round" fill="#E01E5A" fillOpacity="0.12"/></svg> },
                  ];
                  const pcts = [82, 74, 68, 71, 89, 63, 77, 85, 72, 66];
                  const qCounts = [98, 82, 75, 68, 54, 59, 63, 91, 48, 44];
                  return (
                    <div style={{ maxWidth: 760 }}>
                      {/* Stat cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
                        {stats.map((s, i) => (
                          <div key={i} style={{ backgroundColor: t.cardBg, borderRadius: 14, padding: "18px 20px", border: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "flex-start", gap: 14 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${s.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {s.icon}
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: t.sidebarTextMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{s.label}</div>
                              <div style={{ fontSize: 28, fontWeight: 800, color: t.contentTextBright, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                              <div style={{ fontSize: 12, color: s.accent, fontWeight: 600 }}>{s.sub}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Subject breakdown */}
                      <div style={{ backgroundColor: t.cardBg, borderRadius: 14, border: `1px solid ${t.cardBorder}`, overflow: "hidden" }}>
                        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: t.contentTextBright, letterSpacing: "-0.01em" }}>Performance by Subject</span>
                          <span style={{ fontSize: 11, color: t.sidebarTextMuted, fontWeight: 600 }}>Accuracy</span>
                        </div>
                        <div style={{ padding: "8px 0" }}>
                          {subjectTags.map((s, i) => {
                            const pct = pcts[i];
                            const good = pct >= 80;
                            const ok = pct >= 70;
                            const barColor = good ? "#2BAC76" : ok ? "#E5C07B" : "#E06C75";
                            return (
                              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 20px" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: barColor, flexShrink: 0 }} />
                                <span style={{ width: 100, fontSize: 13, color: t.contentText, fontWeight: 500, flexShrink: 0 }}>{s.label}</span>
                                <div style={{ flex: 1, height: 6, backgroundColor: t.plusBg, borderRadius: 3, overflow: "hidden" }}>
                                  <div style={{ width: `${pct}%`, height: "100%", backgroundColor: barColor, borderRadius: 3, transition: "width 0.6s ease" }} />
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: t.contentTextBright, width: 38, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
                                <span style={{ fontSize: 11, color: t.sidebarTextMuted, width: 56, textAlign: "right", flexShrink: 0 }}>{qCounts[i]} Qs</span>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ padding: "12px 20px", borderTop: `1px solid ${t.cardBorder}`, display: "flex", gap: 16 }}>
                          {[{ c: "#2BAC76", l: "Strong ≥80%" }, { c: "#E5C07B", l: "Average 70–79%" }, { c: "#E06C75", l: "Needs work <70%" }].map((leg, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: leg.c }} />
                              <span style={{ fontSize: 11, color: t.sidebarTextMuted }}>{leg.l}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
                {active === "experience" && (
                  <div>
                    {experiencePosts.map(p => (
                      <div key={p.id} style={{ padding: "16px 18px", borderRadius: 10, marginBottom: 10, backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: t.sidebarActive, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>Y</div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: t.contentTextBright }}>You</span>
                            <span style={{ fontSize: 12, color: t.sidebarTextMuted }}>{p.date}</span>
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: parseInt(p.score) >= 80 ? t.green : parseInt(p.score) >= 70 ? "#E5C07B" : "#E06C75" }}>{p.score}</div>
                        </div>
                        <div style={{ fontSize: 14, color: t.contentText, lineHeight: 1.5, marginBottom: 10 }}>{p.note}</div>
                        <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {I.clock(t.sidebarTextMuted)}
                            <span style={{ color: t.sidebarTextMuted, fontWeight: 600 }}>{p.duration}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {I.folder(t.sidebarTextMuted)}
                            <span style={{ color: t.sidebarTextMuted, fontWeight: 600 }}>{p.sources}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <RightPanel
              t={t}
              selectedQuestion={selectedQuestion}
              explanation={selectedExplanation}
              chatMessages={chatMessages}
              chatInput={chatInput}
              chatLoading={chatLoading}
              onChatInputChange={setChatInput}
              onSendChat={sendChat}
              chatEndRef={chatEndRef}
              isOpen={rightOpen}
              onToggle={() => setRightOpen(!rightOpen)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
