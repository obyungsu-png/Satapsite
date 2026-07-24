import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, ChevronRight, ChevronLeft, Pen,
  Moon, Sun, Eye, EyeOff, Highlighter, Download,
  Sparkles, HelpCircle, Check,
} from "lucide-react";
import { ReadingReviewPassage } from "../SGRClass/ReadingReviewPassage";
import { ReadingReviewActions } from "../SGRClass/ReadingReviewToolbar";
import { ToeflAiWidget } from "../ToeflAiWidget";
import { WordPopup } from "../SGRClass/WordPopup";
import { AiActionPopup } from "../SGRClass/AiActionPopup";
import HandwritingOverlay from "../HandwritingOverlay";
import { downloadSGRGrammarPdf } from "./pdfUtils";

// ─── SGR Grammar Viewer ─────────────────────────────────
// 문법 개념 설명 → 관련 digital SAT 문제 풀이 형식.
// Training 섹션의 4대 문법 영역(Boundaries / Form, Structure & Sense /
// Transitions / Rhetorical Synthesis)을 카테고리로 참조.
// 진행도는 localStorage에 저장. CMS(sgr-grammar-data)와 연동 가능.
// SGR Voca/Class와 동일한 툴바(다크모드·정답·도구·필기·PDF) 제공.

export interface GrammarQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answer: number; // index
  explanation: string;
}

export interface GrammarLesson {
  id: string;
  title: string;
  category: string;          // 표시용 카테고리 (예: "Boundaries")
  trainingCategory: string;  // Training 섹션 연동 키 (boundaries / form-structure / transitions / rhetorical-synthesis)
  summary: string;
  explanation: string[];
  examples: { wrong: string; correct: string; note: string }[];
  questions: GrammarQuestion[];
}

// ─── Training 문법 4대 영역 레슨 ──────────────────────
const DEFAULT_LESSONS: GrammarLesson[] = [
  // ── Boundaries ──
  {
    id: "boundaries-commas-semicolons",
    title: "Commas & Semicolons (경계)",
    category: "Boundaries",
    trainingCategory: "boundaries",
    summary: "콤마와 세미콜론으로 문장 경계를 올바르게 표시하는 법 — SAT에서 가장 빈출.",
    explanation: [
      "세미콜론(;)은 두 독립절(완전한 문장)을 연결할 때 쓴다.",
      "콤마(,)만으로 두 독립절을 연결하면 comma splice 오류.",
      "FANBOYS(for, and, nor, but, or, yet, so) 앞에 콤마 + 접속사로 연결 가능.",
      "콜론(:)은 앞에 완전한 문장이 있을 때 뒤에 설명·목록을 붙일 때 쓴다.",
    ],
    examples: [
      { wrong: "The experiment failed, the team tried again.", correct: "The experiment failed; the team tried again.", note: "두 독립절이므로 세미콜론 사용." },
      { wrong: "She enjoys hiking, and to swim.", correct: "She enjoys hiking and swimming.", note: "병렬 구조 + 접속사 앞 콤마 불필요." },
    ],
    questions: [
      { id: "bcs-q1", prompt: "The data was inconclusive ______ researchers decided to repeat the trial.", choices: [", and the", "; the", ", the", "; and the"], answer: 1, explanation: "두 독립절이므로 '; the'가 맞다." },
      { id: "bcs-q2", prompt: "The recipe requires three ingredients: flour, sugar, and ______", choices: ["butter", "butter;", "butter,", "butter:"], answer: 0, explanation: "콜론 뒤 목록의 마지막 항목은 콤마/세미콜론 없이 그대로." },
      { id: "bcs-q3", prompt: "Although the weather was harsh ______ the expedition continued.", choices: [",", ";", ":", ""], answer: 0, explanation: "종속절 + 주절 사이에는 콤마." },
    ],
  },
  {
    id: "boundaries-dashes-colons",
    title: "Dashes & Colons",
    category: "Boundaries",
    trainingCategory: "boundaries",
    summary: "대시와 콜론으로 부가 정보를 표시하는 방법.",
    explanation: [
      "대시(—)는 부가 설명이나 강조를 위해 쌍으로 사용하거나 단독으로 사용.",
      "콜론(:)은 앞에 완전한 문장이 있어야 하고, 뒤에 설명·인용·목록이 온다.",
      "대시는 콤마보다 강한 분리 효과가 있다.",
    ],
    examples: [
      { wrong: "The result — which surprised everyone, was published immediately.", correct: "The result—which surprised everyone—was published immediately.", note: "쌍대시는 짝을 맞춰야 함." },
    ],
    questions: [
      { id: "dc-q1", prompt: "The study revealed an unexpected finding: the compound ______", choices: ["was stable at room temperature.", "was stable at room temperature;", "was stable at room temperature,", "was stable at room temperature—"], answer: 0, explanation: "콜론 뒤에는 완전한 문장이 올 수 있으며 추가 구두점 불필요." },
    ],
  },
  // ── Form, Structure, and Sense ──
  {
    id: "form-subject-verb-agreement",
    title: "Subject–Verb Agreement",
    category: "Form, Structure & Sense",
    trainingCategory: "form-structure",
    summary: "주어와 동사의 수 일치 — SAT Writing에서 가장 자주 나오는 문법 사항.",
    explanation: [
      "주어(subject)와 동사(verb)는 수(number)와 인칭(person)에서 일치해야 한다.",
      "주어와 동사 사이에 수식어구가 끼어 있으면 실수하기 쉽다.",
      "The number of ~ → 단수 취급 / A number of ~ → 복수 취급.",
      "Each, every, one of + 복수명사 → 단수 동사.",
    ],
    examples: [
      { wrong: "The list of items are on the desk.", correct: "The list of items is on the desk.", note: "진짜 주어는 'The list'(단수)." },
      { wrong: "A number of students was absent.", correct: "A number of students were absent.", note: "'A number of ~'는 복수 취급." },
    ],
    questions: [
      { id: "sva-q1", prompt: "The collection of paintings ______ on display at the museum since last month.", choices: ["have been", "has been", "were", "are"], answer: 1, explanation: "주어는 'The collection'(단수)이므로 'has been'." },
      { id: "sva-q2", prompt: "A number of researchers ______ the new hypothesis compelling.", choices: ["finds", "has found", "find", "was finding"], answer: 2, explanation: "'A number of researchers'는 복수 취급 → 'find'." },
      { id: "sva-q3", prompt: "Each of the participants ______ a certificate upon completion.", choices: ["receive", "receives", "have received", "were receiving"], answer: 1, explanation: "'Each of + 복수명사'는 단수 취급 → 'receives'." },
    ],
  },
  {
    id: "form-parallel-structure",
    title: "Parallel Structure",
    category: "Form, Structure & Sense",
    trainingCategory: "form-structure",
    summary: "병렬 구조 — 같은 기능을 하는 요소들은 같은 형태로 쓴다.",
    explanation: [
      "and, or, not only~but also 등으로 연결된 요소들은 문법적 형태를 맞춘다.",
      "동사 + 동사, 명사 + 명사, to부정사 + to부정사 형태로 일치.",
      "비교급에서도 병렬 구조가 요구된다.",
    ],
    examples: [
      { wrong: "She likes hiking, swimming, and to run.", correct: "She likes hiking, swimming, and running.", note: "동명사 통일 → running." },
    ],
    questions: [
      { id: "ps-q1", prompt: "The professor encouraged students to read carefully, to take notes, and ______ the main arguments.", choices: ["summarizing", "to summarize", "summarize", "summarized"], answer: 1, explanation: "to read, to take notes와 병렬 → to summarize." },
      { id: "ps-q2", prompt: "The new policy is both efficient ______ fair to all employees.", choices: ["and", "as well", "also", "plus"], answer: 0, explanation: "'both A and B' 병렬 구조 → 'and'." },
    ],
  },
  {
    id: "form-verb-tense",
    title: "Verb Tense & Form",
    category: "Form, Structure & Sense",
    trainingCategory: "form-structure",
    summary: "동사 시제와 형태 — 문맥에 맞는 시제 선택.",
    explanation: [
      "과거 사실은 과거시제, 현재 사실은 현재시제를 사용.",
      "완료시제(have + p.p.)는 과거에서 현재까지의 연결성을 나타냄.",
      "시제 일관성: 같은 문단에서는 시제를 불필요하게 바꾸지 않는다.",
    ],
    examples: [
      { wrong: "When I arrived, he eats dinner.", correct: "When I arrived, he was eating dinner.", note: "과거 시점이므로 과거진행시제 사용." },
    ],
    questions: [
      { id: "vt-q1", prompt: "By the time the rescue team arrived, the hikers ______ stranded for six hours.", choices: ["have been", "had been", "were being", "are"], answer: 1, explanation: "과거 완료 시제(had been)로 이전 상태 표현." },
      { id: "vt-q2", prompt: "The novel, which ______ in 1925, remains a classic today.", choices: ["was published", "is published", "has published", "publishes"], answer: 0, explanation: "1925년에 출판된 과거 사실 → was published." },
    ],
  },
  {
    id: "form-modifier-placement",
    title: "Modifier Placement",
    category: "Form, Structure & Sense",
    trainingCategory: "form-structure",
    summary: "수식어 위치 — 잘못된 위치는 의미를 모호하게 만든다.",
    explanation: [
      "Dangling modifier: 주어 없이 문장 시작에 온 분사구.",
      "Misplaced modifier: 수식 대상에서 너무 멀리 떨어진 수식어.",
      "수식어는 수식할 단어 바로 옆에 두어야 한다.",
    ],
    examples: [
      { wrong: "Walking down the street, the trees were beautiful.", correct: "Walking down the street, I saw beautiful trees.", note: "Walking의 주어가 필요 → I." },
    ],
    questions: [
      { id: "mp-q1", prompt: "Having finished the assignment, ______", choices: ["the TV was turned on", "Alex turned on the TV", "the TV turned on by Alex", "there was a TV turned on"], answer: 1, explanation: "Having finished의 주어 → Alex." },
    ],
  },
  // ── Transitions ──
  {
    id: "transitions-logical-connectors",
    title: "Transitions & Logical Connectors",
    category: "Transitions",
    trainingCategory: "transitions",
    summary: "전환어로 문장 간 논리 관계(대조·추가·인과)를 표시.",
    explanation: [
      "대조: however, nevertheless, nonetheless, in contrast, on the other hand.",
      "추가: moreover, furthermore, in addition, additionally.",
      "인과: therefore, consequently, thus, as a result, hence.",
      "예시: for example, for instance, specifically.",
      "전환어 앞에는 세미콜론/마침표, 뒤에는 콤마를 쓴다.",
    ],
    examples: [
      { wrong: "The team was tired, therefore, they continued.", correct: "The team was tired; therefore, they continued.", note: "therefore 앞에 세미콜론." },
    ],
    questions: [
      { id: "tr-q1", prompt: "The initial results were promising. ______, the sample size was too small to draw firm conclusions.", choices: ["Therefore", "However", "Moreover", "Similarly"], answer: 1, explanation: "유망하지만 표본이 작다는 대조 → However." },
      { id: "tr-q2", prompt: "The habitat was shrinking; ______, the population of the species declined rapidly.", choices: ["however", "in contrast", "consequently", "for example"], answer: 2, explanation: "인과 관계 → consequently." },
      { id: "tr-q3", prompt: "The study focused on urban areas; ______, rural communities were excluded from the analysis.", choices: ["additionally", "consequently", "in other words", "however"], answer: 0, explanation: "추가 정보 → additionally." },
    ],
  },
  // ── Rhetorical Synthesis ──
  {
    id: "rhetorical-combining-sentences",
    title: "Rhetorical Synthesis — Combining & Revising",
    category: "Rhetorical Synthesis",
    trainingCategory: "rhetorical-synthesis",
    summary: "문장 결합, 불필요한 표현 제거, 목적에 맞는 개정.",
    explanation: [
      "두 문장을 결합할 때 관계대명사·분사구·동격명사를 활용.",
      "불필요한 반복은 삭제하고 간결하게.",
      "'Which choice best accomplishes the goal?' — 목적(강조·요약·비교)에 맞는 선택지를 고른다.",
    ],
    examples: [
      { wrong: "The scientist won the award. She discovered a new element.", correct: "The scientist who discovered a new element won the award.", note: "관계대명사로 결합." },
    ],
    questions: [
      { id: "rs-q1", prompt: "The student wants to emphasize the rarity of the phenomenon. Which choice best accomplishes this?", choices: ["The phenomenon occurs sometimes.", "The phenomenon is exceedingly rare.", "The phenomenon has been observed.", "The phenomenon is interesting."], answer: 1, explanation: "' exceedingly rare'가 희귀성을 강조." },
      { id: "rs-q2", prompt: "Which choice most effectively combines the sentences? 'The artist was self-taught. She created masterpieces.'", choices: ["The artist was self-taught and she created masterpieces.", "The self-taught artist created masterpieces.", "The artist was self-taught, creating masterpieces.", "Being self-taught, masterpieces were created by the artist."], answer: 1, explanation: "'The self-taught artist'로 간결하게 결합." },
    ],
  },
  // ── Pronoun Agreement (Form/Structure) ──
  {
    id: "form-pronoun-agreement",
    title: "Pronoun Agreement",
    category: "Form, Structure & Sense",
    trainingCategory: "form-structure",
    summary: "대명사와 선행사의 수·인칭 일치.",
    explanation: [
      "단수 선행사 → 단수 대명사, 복수 선행사 → 복수 대명사.",
      "each, every, one, anybody, someone → 단수 대명사(he/she/it/they[singular]).",
      "대명사는 가장 가까운 선행사를 가리키는 것이 원칙(근접 원칙).",
    ],
    examples: [
      { wrong: "Every student must bring their own laptop.", correct: "Every student must bring his or her own laptop.", note: "엄격한 문법에서는 단수 취급. (실제로는 'their'도 허용 추세)" },
    ],
    questions: [
      { id: "pa-q1", prompt: "The committee reached ______ decision after a long debate.", choices: ["their", "its", "it's", "they're"], answer: 1, explanation: "committee를 단수 집합명사로 취급 → 'its'." },
      { id: "pa-q2", prompt: "Neither the teacher nor the students were aware of ______ schedule.", choices: ["her", "their", "its", "his"], answer: 1, explanation: "근접 원칙 → students(복수) → 'their'." },
    ],
  },
];

const STORAGE_KEY = "sgrGrammar_progress";
const LESSON_KEY = "sgrGrammar_lessons";
const DARK_KEY = "sgrGrammar_dark";

type PageKey = "concept" | "questions";

const PAGES: Array<{ key: PageKey; label: string; icon: any }> = [
  { key: "concept", label: "Concept", icon: Sparkles },
  { key: "questions", label: "Questions", icon: HelpCircle },
];

function loadProgress(): Record<string, Record<string, number>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveProgress(data: Record<string, Record<string, number>>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function loadLessons(): GrammarLesson[] {
  try {
    const raw = localStorage.getItem(LESSON_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT_LESSONS;
}

export default function SGRGrammarViewer() {
  const [lessons, setLessons] = useState<GrammarLesson[]>(loadLessons);
  const [selectedId, setSelectedId] = useState(lessons[0]?.id || "");
  const [progress, setProgress] = useState<Record<string, Record<string, number>>>(loadProgress);
  const [penActive, setPenActive] = useState(false);
  const [pageKey, setPageKey] = useState<PageKey>("concept");
  const [showAnswer, setShowAnswer] = useState(false);
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DARK_KEY) === "1";
  });
  const [toolsOpen, setToolsOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "ko">("en");
  const [clearTrigger, setClearTrigger] = useState(0);
  const [popupData, setPopupData] = useState<{ word: string; context: string; x: number; y: number } | null>(null);
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [aiTutorPrompt, setAiTutorPrompt] = useState<string | undefined>(undefined);
  const [aiActionPopup, setAiActionPopup] = useState<{
    action: "explain" | "translate" | "analyze" | "rewrite";
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // CMS 연동
  useEffect(() => {
    const handler = () => setLessons(loadLessons());
    window.addEventListener("sgr-grammar-data-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("sgr-grammar-data-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  useEffect(() => { saveProgress(progress); }, [progress]);
  useEffect(() => { localStorage.setItem(DARK_KEY, dark ? "1" : "0"); }, [dark]);

  const selected = useMemo(
    () => lessons.find(l => l.id === selectedId) || lessons[0],
    [lessons, selectedId]
  );

  const handleClearAll = useCallback(() => setClearTrigger(c => c + 1), []);
  const handleAnswer = (qId: string, choiceIdx: number) => {
    setProgress(prev => ({ ...prev, [selected.id]: { ...(prev[selected.id] || {}), [qId]: choiceIdx } }));
  };

  const handleDictionary = useCallback((data: { word: string; context: string; x: number; y: number }) => {
    setPopupData(data);
  }, []);

  const handleAiTutor = useCallback((action: "explain" | "translate" | "analyze" | "rewrite", text: string) => {
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const rect = range?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 - 160 : window.innerWidth / 2 - 160;
    const y = rect ? rect.bottom + 10 : window.innerHeight / 2;
    setAiActionPopup({ action, text, x, y });
  }, []);

  if (!selected) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <BookOpen className="w-10 h-10 mr-3" /> 문법 레슨이 없습니다.
      </div>
    );
  }

  const lessonProgress = progress[selected.id] || {};
  const answeredCount = Object.keys(lessonProgress).length;
  const totalQ = selected.questions.length;
  const correctCount = selected.questions.filter(q => lessonProgress[q.id] === q.answer).length;
  const completionPct = totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0;

  const currentIdx = PAGES.findIndex(p => p.key === pageKey);
  const goPrev = () => setPageKey(PAGES[Math.max(0, currentIdx - 1)].key);
  const goNext = () => setPageKey(PAGES[Math.min(PAGES.length - 1, currentIdx + 1)].key);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/40 dark:from-gray-950 dark:to-gray-900 transition-colors">
        {/* Toolbar — SGR Voca/Class와 동일 패턴 */}
        <div className="sticky top-0 z-30 backdrop-blur bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3">
          <div className="max-w-[1600px] mx-auto flex flex-wrap items-center gap-3">
            {lessons.length > 1 && (
              <select
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setPageKey("concept"); }}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              >
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            )}

            {/* Page tabs */}
            <div className="flex items-center gap-1 flex-1 overflow-x-auto">
              {PAGES.map(p => {
                const Icon = p.icon;
                const active = pageKey === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => setPageKey(p.key)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      active
                        ? "bg-amber-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{p.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {/* 정답 토글 */}
              <button
                onClick={() => setShowAnswer(v => !v)}
                title="정답 토글"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  showAnswer
                    ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                {showAnswer ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="hidden sm:inline">정답</span>
              </button>

              {/* 다크모드 */}
              <button
                onClick={() => setDark(v => !v)}
                title="다크모드 토글"
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Tools */}
              <button
                onClick={() => setToolsOpen(v => !v)}
                title="Tools: drag to highlight/underline/dictionary"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  toolsOpen
                    ? "bg-amber-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Highlighter className="w-4 h-4" />
                <span className="hidden sm:inline">Tools</span>
              </button>
              {toolsOpen && (
                <ReadingReviewActions
                  onClearAll={handleClearAll}
                  language={language}
                  onLanguageChange={setLanguage}
                />
              )}

              {/* 필기 */}
              <button
                onClick={() => setPenActive(v => !v)}
                title="필기: 자유롭게 그리기"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  penActive
                    ? "bg-amber-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Pen className="w-4 h-4" />
                <span className="hidden sm:inline">필기</span>
              </button>

              {/* PDF */}
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-40">
                  <button
                    onClick={() => downloadSGRGrammarPdf(selected, "question")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 dark:hover:bg-amber-950/30 text-gray-800 dark:text-gray-200"
                  >
                    📄 문제편
                  </button>
                  <button
                    onClick={() => downloadSGRGrammarPdf(selected, "answer")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 dark:hover:bg-amber-950/30 text-gray-800 dark:text-gray-200 border-t border-gray-100 dark:border-gray-700"
                  >
                    ✅ 문제 + 해답편
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="relative">
          <ReadingReviewPassage
            toolsOpen={toolsOpen}
            onDictionary={handleDictionary}
            onAiTutor={handleAiTutor}
            clearTrigger={clearTrigger}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pageKey + selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {pageKey === "concept" && (
                  <div className="max-w-[1100px] mx-auto p-6 lg:p-10">
                    {/* Hero */}
                    <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-amber-700 to-amber-500 dark:from-gray-950 dark:to-amber-950">
                      <div className="relative flex items-center gap-5 p-6 lg:p-10">
                        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-black flex items-center justify-center shadow-xl border-4 border-amber-300 shrink-0">
                          <div className="text-center text-white">
                            <div className="text-[9px] font-bold tracking-widest">GRAMMAR</div>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <span className="inline-block text-xs font-bold text-amber-100 bg-amber-900/40 px-2 py-0.5 rounded-full mb-2">
                            {selected.category}
                          </span>
                          <h1 className="text-2xl lg:text-4xl font-black text-white drop-shadow-lg leading-tight">
                            {selected.title}
                          </h1>
                          <p className="text-sm text-amber-100 mt-1">{selected.summary}</p>
                        </div>
                      </div>
                    </div>

                    {/* Explanation card */}
                    <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xl font-black shadow-md">
                          <BookOpen className="w-5 h-5" />
                        </span>
                        <p className="text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-100">문법 설명</p>
                      </div>
                      <ul className="space-y-2">
                        {selected.explanation.map((line, i) => (
                          <li key={i} className="flex gap-2 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                            <ChevronRight className="w-4 h-4 text-amber-600 mt-1 shrink-0" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Example cards */}
                    {selected.examples.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="w-3 h-3 rounded-full bg-amber-500" />
                          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">예시</h2>
                        </div>
                        {selected.examples.map((ex, i) => (
                          <div key={i} className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <p className="text-base text-red-500 line-through mb-1">✗ {ex.wrong}</p>
                            <p className="text-base text-emerald-600 font-medium mb-1">✓ {ex.correct}</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">{ex.note}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {pageKey === "questions" && (
                  <div className="max-w-[1100px] mx-auto p-6 lg:p-10">
                    {/* Hero with progress */}
                    <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-r from-amber-700 to-amber-500 dark:from-gray-950 dark:to-amber-950 px-8 py-6">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <h1 className="text-3xl lg:text-4xl font-black text-white drop-shadow-lg tracking-tight">SAT 문제</h1>
                        {totalQ > 0 && (
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${completionPct}%` }} />
                            </div>
                            <span className="text-xs font-bold text-white">{answeredCount}/{totalQ} · 정답 {correctCount}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Question cards */}
                    <div className="space-y-4">
                      {selected.questions.map((q, qi) => {
                        const userAns = lessonProgress[q.id];
                        const answered = userAns !== undefined;
                        const isCorrect = userAns === q.answer;
                        const revealAnswer = showAnswer || answered;
                        return (
                          <div key={q.id} className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex gap-3 mb-3">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-sm shrink-0">
                                {qi + 1}
                              </span>
                              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 pt-0.5">{q.prompt}</p>
                            </div>
                            <div className="ml-11 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.choices.map((choice, ci) => {
                                const selectedChoice = userAns === ci;
                                const isAnswerChoice = q.answer === ci;
                                let cls = "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:border-amber-300";
                                if (revealAnswer) {
                                  if (isAnswerChoice) cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold";
                                  else if (selectedChoice) cls = "border-red-400 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300";
                                  else cls = "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 opacity-60";
                                }
                                return (
                                  <button
                                    key={ci}
                                    onClick={() => !answered && handleAnswer(q.id, ci)}
                                    disabled={answered || showAnswer}
                                    className={`text-left p-3 rounded-lg border-2 text-sm transition-all ${cls}`}
                                  >
                                    <span className="font-bold mr-2">{String.fromCharCode(97 + ci)}.</span>
                                    {choice}
                                    {revealAnswer && isAnswerChoice && <Check className="inline ml-2 w-4 h-4 text-emerald-600" />}
                                  </button>
                                );
                              })}
                            </div>
                            {revealAnswer && (
                              <div className={`ml-11 mt-3 rounded-lg p-3 text-xs ${
                                isCorrect || (showAnswer && !answered) ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                              }`}>
                                <strong>{showAnswer && !answered ? "정답" : isCorrect ? "정답! 👏" : "오답"}</strong> — {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </ReadingReviewPassage>
          {/* 필기 오버레이 (펜 모드일 때만 활성) */}
          <HandwritingOverlay
            active={penActive}
            storageKey={`sgrGrammar_${selected.id}_${pageKey}`}
          />
        </div>

        {/* 단어 뜻 팝업 */}
        {popupData && (
          <WordPopup
            word={popupData.word}
            context={popupData.context}
            language={language}
            x={popupData.x}
            y={popupData.y}
            onClose={() => setPopupData(null)}
            onLanguageChange={setLanguage}
          />
        )}

        {/* AI 액션 말풍선 */}
        {aiActionPopup && (
          <AiActionPopup
            action={aiActionPopup.action}
            selectedText={aiActionPopup.text}
            x={aiActionPopup.x}
            y={aiActionPopup.y}
            onClose={() => setAiActionPopup(null)}
          />
        )}

        {/* Bottom nav */}
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 py-6 border-t border-gray-200 dark:border-gray-700 mt-8">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold ${
              currentIdx === 0
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> 이전
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {currentIdx + 1} / {PAGES.length} · {PAGES[currentIdx].label}
          </span>
          <button
            onClick={goNext}
            disabled={currentIdx === PAGES.length - 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold ${
              currentIdx === PAGES.length - 1
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-700 text-white shadow-md"
            }`}
          >
            다음 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI 튜터 FAB */}
      <ToeflAiWidget
        position="right"
        zIndex={80}
        open={aiTutorOpen}
        onOpenChange={setAiTutorOpen}
        initialPrompt={aiTutorPrompt}
        contextLabel={`SGR Grammar · ${selected?.title || ""}`}
        questionData={selected}
        suggestedQuestions={[
          '이 문법 규칙을 더 자세히 설명해줘',
          '관련 예문을 더 만들어줘',
          '이 문제의 정답과 해설을 알려줘',
          '비슷한 문법 문제를 더 내줘',
        ]}
      />
    </div>
  );
}
