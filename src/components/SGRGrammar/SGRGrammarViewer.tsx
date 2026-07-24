import { useState, useEffect, useMemo } from "react";
import { BookOpen, CheckCircle2, Circle, ChevronRight, Pen } from "lucide-react";
import HandwritingOverlay from "../HandwritingOverlay";

// ─── SGR Grammar Viewer ─────────────────────────────────
// 문법 개념 설명 → 관련 digital SAT 문제 풀이 형식.
// 진행도는 localStorage에 저장. CMS(sgr-grammar-data)와 연동 가능.

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
  category: string;
  summary: string;
  // 마크다운 스타일 설명 (줄 단위)
  explanation: string[];
  examples: { wrong: string; correct: string; note: string }[];
  questions: GrammarQuestion[];
}

const DEFAULT_LESSONS: GrammarLesson[] = [
  {
    id: "subject-verb-agreement",
    title: "Subject–Verb Agreement",
    category: "문법 핵심",
    summary: "주어와 동사의 수 일치 — SAT Writing에서 가장 자주 나오는 문법 사항.",
    explanation: [
      "주어(subject)와 동사(verb)는 수(number)와 인칭(person)에서 일치해야 한다.",
      "단수 주어 → 단수 동사, 복수 주어 → 복수 동사.",
      "주어와 동사 사이에 수식어구가 끼어 있으면 실수하기 쉽다.",
      "The number of ~ → 단수 취급 / A number of ~ → 복수 취급.",
    ],
    examples: [
      {
        wrong: "The list of items are on the desk.",
        correct: "The list of items is on the desk.",
        note: "진짜 주어는 'The list'(단수). 'of items'는 수식어구.",
      },
      {
        wrong: "A number of students was absent.",
        correct: "A number of students were absent.",
        note: "'A number of ~'는 '여러 ~' 의미로 복수 취급.",
      },
    ],
    questions: [
      {
        id: "sva-q1",
        prompt: "The collection of paintings ______ on display at the museum since last month.",
        choices: ["have been", "has been", "were", "are"],
        answer: 1,
        explanation: "주어는 'The collection'(단수)이므로 단수 동사 'has been'이 와야 한다.",
      },
      {
        id: "sva-q2",
        prompt: "A number of researchers ______ the new hypothesis compelling.",
        choices: ["finds", "has found", "find", "was finding"],
        answer: 2,
        explanation: "'A number of researchers'는 복수 취급하므로 복수 동사 'find'가 정답.",
      },
    ],
  },
  {
    id: "parallel-structure",
    title: "Parallel Structure",
    category: "문법 핵심",
    summary: "병렬 구조 — 같은 기능을 하는 요소들은 같은 형태로 쓴다.",
    explanation: [
      "병렬 구조란 문장 내에서 같은 역할을 하는 단어/구들이 같은 형태여야 한다는 규칙.",
      "and, or, not only~but also 등으로 연결된 요소들은 문법적 형태를 맞춘다.",
      "동사 + 동사, 명사 + 명사, to부정사 + to부정사 형태로 일치시킨다.",
    ],
    examples: [
      {
        wrong: "She likes hiking, swimming, and to run.",
        correct: "She likes hiking, swimming, and running.",
        note: "동명사(hiking, swimming)와 통일 → running.",
      },
    ],
    questions: [
      {
        id: "ps-q1",
        prompt: "The professor encouraged students to read carefully, to take notes, and ______ the main arguments.",
        choices: ["summarizing", "to summarize", "summarize", "summarized"],
        answer: 1,
        explanation: "to read, to take notes와 병렬 → to summarize.",
      },
    ],
  },
  {
    id: "punctuation",
    title: "Punctuation (콤마, 세미콜론)",
    category: "문장 부호",
    summary: "콤마와 세미콜론의 올바른 사용 — SAT에서 빈출.",
    explanation: [
      "세미콜론(;)은 두 독립절(완전한 문장)을 연결할 때 쓴다.",
      "콤마(,)만으로 두 독립절을 연결하면 comma splice 오류.",
      "독립절 ; 독립절 (O) / 독립절 , 독립절 (X) → 콤마 splice",
      "FANBOYS(for, and, nor, but, or, yet, so) 앞에 콤마 사용 가능.",
    ],
    examples: [
      {
        wrong: "The experiment failed, the team tried again.",
        correct: "The experiment failed; the team tried again.",
        note: "두 독립절이므로 세미콜론 사용. 콤마는 splice 오류.",
      },
    ],
    questions: [
      {
        id: "punct-q1",
        prompt: "The data was inconclusive ______ researchers decided to repeat the trial.",
        choices: [", and the", "; the", ", the", "; and the"],
        answer: 1,
        explanation: "두 독립절이므로 '; the'가 맞다. ', and the'도 가능하지만 선택지에 없으므로 '; the' 선택.",
      },
    ],
  },
];

const STORAGE_KEY = "sgrGrammar_progress";
const LESSON_KEY = "sgrGrammar_lessons";

function loadProgress(): Record<string, Record<string, number>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(data: Record<string, Record<string, number>>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function loadLessons(): GrammarLesson[] {
  try {
    const raw = localStorage.getItem(LESSON_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_LESSONS;
}

export default function SGRGrammarViewer() {
  const [lessons, setLessons] = useState<GrammarLesson[]>(loadLessons);
  const [selectedId, setSelectedId] = useState(lessons[0]?.id || "");
  const [progress, setProgress] = useState<Record<string, Record<string, number>>>(loadProgress);
  const [penActive, setPenActive] = useState(false);

  // CMS 연동: 외부에서 sgrGrammar_lessons 갱신 시 반영
  useEffect(() => {
    const handler = () => setLessons(loadLessons());
    window.addEventListener("sgr-grammar-data-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("sgr-grammar-data-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const selected = useMemo(
    () => lessons.find(l => l.id === selectedId) || lessons[0],
    [lessons, selectedId]
  );

  if (!selected) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <BookOpen className="w-10 h-10 mr-3" /> 문법 레슨이 없습니다.
      </div>
    );
  }

  const handleAnswer = (qId: string, choiceIdx: number) => {
    setProgress(prev => ({
      ...prev,
      [selected.id]: { ...(prev[selected.id] || {}), [qId]: choiceIdx },
    }));
  };

  const lessonProgress = progress[selected.id] || {};
  const answeredCount = Object.keys(lessonProgress).length;
  const totalQ = selected.questions.length;
  const correctCount = selected.questions.filter(
    q => lessonProgress[q.id] === q.answer
  ).length;
  const completionPct = totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 relative">
      {/* 레슨 사이드바 (상단 가로 스크롤) */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm mb-6 overflow-x-auto">
        {lessons.map(lesson => {
          const lp = progress[lesson.id] || {};
          const ans = Object.keys(lp).length;
          const tot = lesson.questions.length;
          const done = tot > 0 && ans === tot;
          return (
            <button
              key={lesson.id}
              onClick={() => setSelectedId(lesson.id)}
              className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 whitespace-nowrap ${
                selectedId === lesson.id
                  ? "bg-[#3D5AA1] text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {done ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Circle className="w-3.5 h-3.5 opacity-40" />
              )}
              {lesson.title}
            </button>
          );
        })}
      </div>

      {/* 레슨 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 mb-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="inline-block text-[10px] font-bold text-[#3D5AA1] bg-[#3D5AA1]/10 px-2 py-0.5 rounded-full mb-2">
              {selected.category}
            </span>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">{selected.title}</h2>
          </div>
          <button
            onClick={() => setPenActive(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              penActive ? "bg-[#3D5AA1] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <Pen className="w-3.5 h-3.5" /> 필기
          </button>
        </div>
        <p className="text-sm text-gray-500">{selected.summary}</p>
        {totalQ > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3D5AA1] rounded-full transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-500">
              {answeredCount}/{totalQ} · 정답 {correctCount}
            </span>
          </div>
        )}
      </div>

      {/* 문법 설명 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 mb-5 relative">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#3D5AA1]" /> 문법 설명
        </h3>
        <ul className="space-y-2 mb-4">
          {selected.explanation.map((line, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
              <ChevronRight className="w-4 h-4 text-[#3D5AA1] mt-0.5 shrink-0" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        {selected.examples.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">예시</p>
            {selected.examples.map((ex, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-sm text-red-500 line-through mb-1">✗ {ex.wrong}</p>
                <p className="text-sm text-emerald-600 font-medium mb-1">✓ {ex.correct}</p>
                <p className="text-xs text-gray-400">{ex.note}</p>
              </div>
            ))}
          </div>
        )}
        <HandwritingOverlay
          active={penActive}
          storageKey={`sgrGrammar_${selected.id}_explanation`}
        />
      </div>

      {/* SAT 문제 풀이 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 relative">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#3D5AA1]" /> 관련 SAT 문제
        </h3>
        <div className="space-y-5">
          {selected.questions.map((q, qi) => {
            const userAns = lessonProgress[q.id];
            const answered = userAns !== undefined;
            const isCorrect = userAns === q.answer;
            return (
              <div key={q.id} className="border-b border-gray-100 pb-4 last:border-0">
                <p className="text-sm font-medium text-gray-800 mb-3">
                  <span className="text-[#3D5AA1] font-bold mr-1">Q{qi + 1}.</span>
                  {q.prompt}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.choices.map((choice, ci) => {
                    const selectedChoice = userAns === ci;
                    const isAnswerChoice = q.answer === ci;
                    let cls = "border-gray-200 bg-white hover:border-[#3D5AA1] hover:bg-blue-50/40";
                    if (answered) {
                      if (isAnswerChoice) cls = "border-emerald-400 bg-emerald-50";
                      else if (selectedChoice) cls = "border-red-400 bg-red-50";
                      else cls = "border-gray-200 bg-white opacity-60";
                    }
                    return (
                      <button
                        key={ci}
                        onClick={() => !answered && handleAnswer(q.id, ci)}
                        disabled={answered}
                        className={`text-left px-3 py-2 rounded-xl border-2 text-sm transition-all ${cls}`}
                      >
                        <span className="font-bold mr-2 text-gray-400">
                          {String.fromCharCode(65 + ci)}
                        </span>
                        {choice}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <div className={`mt-2 rounded-xl p-3 text-xs ${
                    isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                  }`}>
                    <strong>{isCorrect ? "정답! 👏" : "오답"}</strong> — {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <HandwritingOverlay
          active={penActive}
          storageKey={`sgrGrammar_${selected.id}_questions`}
        />
      </div>
    </div>
  );
}
