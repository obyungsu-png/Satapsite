import { Button } from "./ui/button";
import { ChevronLeft, X, MessageCircle, Send, RotateCcw, Eye, FileText, Play, RefreshCw, ChevronDown, ChevronRight, CheckCircle, BookOpen, Brain, Lightbulb, Sparkles, Monitor, Database, GraduationCap } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import historyEmptyImage from "figma:asset/5fda86ab59ab70ac4b90ec46b644ce1cd9e29092.png";
import { AdBannerDisplay, Advertisement } from './AdManagement';
import { ScoreDetailModal } from './ScoreDetailModal';
import { ReviewModal } from './ReviewModal';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  difficulty: string;
  questionType?: string;
  passage?: string;
}

interface PracticeRecordItem {
  id: number;
  testTitle: string;
  date: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  duration: string;
  questions?: Question[];
  source?: '기출문제' | '공식문제' | '전문훈련';
  timestamp?: string;
  readingScore?: string;
  writingScore?: string;
  mathScore?: string;
  status?: 'completed' | 'incomplete';
}

interface StudentQuestion {
  id: string;
  questionId: number;
  recordId: number;
  studentQuestion: string;
  timestamp: string;
  status: 'pending' | 'answered';
  adminAnswer?: string;
  adminAnswerTime?: string;
}

interface PracticeRecordProps {
  practiceRecordCategory: string;
  setPracticeRecordCategory: (category: string) => void;
  practiceRecordSubject: string;
  setPracticeRecordSubject: (subject: string) => void;
  practiceRecordDifficulty: string;
  setPracticeRecordDifficulty: (difficulty: string) => void;
  selectedQuestion: (Question & { recordId: number }) | null;
  setSelectedQuestion: (question: (Question & { recordId: number }) | null) => void;
  showAIHelp: boolean;
  setShowAIHelp: (show: boolean) => void;
  practiceRecords: any[];
  onStartTest: (testInfo?: any) => void;
  advertisements?: Advertisement[];
  reportContent?: React.ReactNode;
  uploadedFiles?: any[];
  currentUser?: any;
  selectedStudentFilter?: string | null;
  setSelectedStudentFilter?: (studentId: string | null) => void;
}

// Sidebar category item
const categories = [
  { key: '기출문제', label: '기출문제' },
  { key: '공식문제', label: '공식문제' },
  { key: 'Training', label: 'Training' },
  { key: '틀린문제', label: 'Wrong Answers' },
  { key: 'Report', label: 'Report' },
];

export function PracticeRecord({
  practiceRecordCategory,
  setPracticeRecordCategory,
  practiceRecordSubject,
  setPracticeRecordSubject,
  practiceRecordDifficulty,
  setPracticeRecordDifficulty,
  selectedQuestion,
  setSelectedQuestion,
  showAIHelp,
  setShowAIHelp,
  practiceRecords,
  onStartTest,
  advertisements,
  reportContent,
  uploadedFiles = [],
  currentUser,
  selectedStudentFilter,
  setSelectedStudentFilter
}: PracticeRecordProps) {
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [studentQuestionText, setStudentQuestionText] = useState('');
  const [studentQuestions, setStudentQuestions] = useState<StudentQuestion[]>([]);
  const [timePeriod, setTimePeriod] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [restartModalRecord, setRestartModalRecord] = useState<PracticeRecordItem | null>(null);
  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteModalRecord, setIncompleteModalRecord] = useState<PracticeRecordItem | null>(null);
  const [supabaseRecords, setSupabaseRecords] = useState<PracticeRecordItem[]>([]);
  const [showScoreDetailModal, setShowScoreDetailModal] = useState(false);
  const [scoreDetailRecord, setScoreDetailRecord] = useState<PracticeRecordItem | null>(null);

  // Accordion states for review sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ answer: true });
  const [similarAnswers, setSimilarAnswers] = useState<Record<number, string>>({});
  const [similarResults, setSimilarResults] = useState<Record<number, 'correct' | 'incorrect' | null>>({});

  useEffect(() => {
    const stored = localStorage.getItem('studentQuestions');
    if (stored) {
      try {
        setStudentQuestions(JSON.parse(stored));
      } catch {
        setStudentQuestions([]);
      }
    }
  }, []);

  // Load practice records from Supabase for current user
  useEffect(() => {
    const loadSupabaseRecords = async () => {
      if (!currentUser || !currentUser.id) {
        setSupabaseRecords([]);
        return;
      }

      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/practice-records/${currentUser.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Loaded practice records from Supabase:', data.records);
          setSupabaseRecords(data.records || []);
        }
      } catch (error) {
        console.error('Error loading practice records from Supabase:', error);
      }
    };

    loadSupabaseRecords();
  }, [currentUser]);

  // Sample data
  const sampleGichul: PracticeRecordItem[] = [
    {
      id: 101, testTitle: "SAT Practice Test 4 - Full Test", date: "2026-03-10", score: 82, totalQuestions: 54, correctAnswers: 44, duration: "64분",
      source: '기출문제', timestamp: "2026.03.10 14:30", readingScore: "27 / 30", writingScore: "22 / 24", mathScore: "—", status: 'completed',
      questions: [
        { id: 1, text: "The author's primary purpose in the passage is to...", options: ["A) analyze", "B) criticize", "C) describe", "D) advocate"], correctAnswer: "C", userAnswer: "C", isCorrect: true, difficulty: "중간" },
        { id: 2, text: "Which choice best supports the claim made in the previous sentence?", options: ["A) Lines 5-8", "B) Lines 12-15", "C) Lines 20-23", "D) Lines 30-33"], correctAnswer: "B", userAnswer: "A", isCorrect: false, difficulty: "어려움" },
        { id: 3, text: "As used in line 14, 'compelling' most nearly means...", options: ["A) forceful", "B) interesting", "C) convincing", "D) urgent"], correctAnswer: "C", userAnswer: "C", isCorrect: true, difficulty: "쉬움" },
      ]
    },
    {
      id: 102, testTitle: "SAT Practice Test 4 - Reading Section", date: "2026-03-10", score: 88, totalQuestions: 27, correctAnswers: 24, duration: "30분",
      source: '기출문제', timestamp: "2026.03.10 10:15", readingScore: "24 / 27", writingScore: "—", mathScore: "—", status: 'completed',
      questions: [
        { id: 1, text: "Which choice completes the text with the most logical transition?", options: ["A) However", "B) Therefore", "C) Meanwhile", "D) For instance"], correctAnswer: "B", userAnswer: "B", isCorrect: true, difficulty: "쉬움" },
        { id: 2, text: "Which choice completes the text so that it conforms to the conventions of Standard English?", options: ["A) has been", "B) have been", "C) was", "D) were"], correctAnswer: "A", userAnswer: "B", isCorrect: false, difficulty: "중간" },
      ]
    },
    {
      id: 103, testTitle: "SAT Practice Test 3 - Math Section", date: "2026-03-08", score: 75, totalQuestions: 22, correctAnswers: 16, duration: "35분",
      source: '기출문제', timestamp: "2026.03.08 16:45", readingScore: "—", writingScore: "—", mathScore: "16 / 22", status: 'incomplete',
      questions: [
        { id: 1, text: "If 3x + 7 = 22, what is the value of x?", options: ["A) 3", "B) 5", "C) 7", "D) 9"], correctAnswer: "B", userAnswer: "B", isCorrect: true, difficulty: "쉬움" },
      ]
    },
  ];

  const sampleGongsik: PracticeRecordItem[] = [
    {
      id: 201, testTitle: "College Board Practice 1 - Full Test", date: "2026-03-09", score: 76, totalQuestions: 54, correctAnswers: 41, duration: "62분",
      source: '공식문제', timestamp: "2026.03.09 09:00", readingScore: "20 / 27", writingScore: "—", mathScore: "21 / 27", status: 'completed',
      questions: [
        { id: 1, text: "Based on the passage, the researchers hypothesized that...", options: ["A) temperature affects growth", "B) light affects growth", "C) water affects growth", "D) soil affects growth"], correctAnswer: "A", userAnswer: "B", isCorrect: false, difficulty: "어려움" },
        { id: 2, text: "Which finding would most directly support the researchers' conclusion?", options: ["A) Increased temperature correlated with faster growth", "B) Plants grew equally in all conditions", "C) Soil composition had no effect", "D) Light was the primary factor"], correctAnswer: "A", userAnswer: "A", isCorrect: true, difficulty: "중간" },
      ]
    },
    {
      id: 202, testTitle: "College Board Practice 2 - Writing Section", date: "2026-03-07", score: 90, totalQuestions: 27, correctAnswers: 24, duration: "25분",
      source: '공식문제', timestamp: "2026.03.07 14:20", readingScore: "—", writingScore: "24 / 27", mathScore: "—", status: 'completed',
      questions: [
        { id: 1, text: "If f(x) = 3x² - 2x + 1, what is f(2)?", options: ["A) 7", "B) 9", "C) 11", "D) 13"], correctAnswer: "B", userAnswer: "B", isCorrect: true, difficulty: "쉬움" },
      ]
    },
  ];

  const sampleTraining: PracticeRecordItem[] = [
    {
      id: 301, testTitle: "어휘 집중 훈련 - 고난도", date: "2026-03-10", score: 70, totalQuestions: 15, correctAnswers: 10, duration: "18분",
      source: '전문훈련', timestamp: "2026.03.10 11:00", readingScore: "10 / 15", writingScore: "—", mathScore: "—", status: 'completed',
      questions: [
        { id: 1, text: "The word 'ubiquitous' most nearly means...", options: ["A) rare", "B) expensive", "C) everywhere", "D) ancient"], correctAnswer: "C", userAnswer: "A", isCorrect: false, difficulty: "어려움" },
        { id: 2, text: "The word 'ephemeral' most nearly means...", options: ["A) lasting", "B) short-lived", "C) beautiful", "D) important"], correctAnswer: "B", userAnswer: "B", isCorrect: true, difficulty: "어려움" },
      ]
    },
    {
      id: 302, testTitle: "수학 함수 훈련", date: "2026-03-08", score: 85, totalQuestions: 10, correctAnswers: 8, duration: "20분",
      source: '전문훈련', timestamp: "2026.03.08 09:30", readingScore: "—", writingScore: "—", mathScore: "8 / 10", status: 'completed',
      questions: [
        { id: 1, text: "What is the vertex of y = (x-3)² + 2?", options: ["A) (3, 2)", "B) (-3, 2)", "C) (3, -2)", "D) (-3, -2)"], correctAnswer: "A", userAnswer: "A", isCorrect: true, difficulty: "중간" },
        { id: 2, text: "Solve: 2x² - 8 = 0", options: ["A) x = ±1", "B) x = ±2", "C) x = ±3", "D) x = ±4"], correctAnswer: "B", userAnswer: "C", isCorrect: false, difficulty: "쉬움" },
      ]
    },
  ];

  const allSampleRecords = [...sampleGichul, ...sampleGongsik, ...sampleTraining];

  // Build practiceRecordData from actual records and Supabase records
  const localRecords = practiceRecords.length > 0 ? practiceRecords.map((record: any) => ({
    id: parseInt(record.id) || Date.now(),
    testTitle: record.title || 'SAT Practice Test',
    date: record.date || new Date().toISOString().split('T')[0],
    score: record.score || 0,
    totalQuestions: record.totalQuestions || 0,
    correctAnswers: record.correctAnswers || 0,
    duration: record.time || '0분',
    questions: (record.questions || []).map((q: any) => ({
      ...q,
      userAnswer: (record.answers && (record.answers[q.id] || record.answers[String(q.id)])) || null,
      isCorrect: (record.answers && (record.answers[q.id] || record.answers[String(q.id)])) === (q.correctAnswer || 'a').toLowerCase()
    })),
    source: record.source || '기출문제',
    timestamp: record.timestamp || record.date,
    readingScore: record.readingScore || '—',
    writingScore: record.writingScore || '—',
    mathScore: record.mathScore || '—',
    status: record.status || 'completed',
  })) : [];
  
  // Combine local and Supabase records
  const practiceRecordData: PracticeRecordItem[] = [...localRecords, ...supabaseRecords];

  const allAvailableRecords = [...practiceRecordData, ...allSampleRecords];

  // Filter records
  const getFilteredRecords = (): PracticeRecordItem[] => {
    let filtered: PracticeRecordItem[] = practiceRecordData;

    if (practiceRecordCategory === '기출문제') {
      // Show records where source is '기출문제', or 'Homepage', or unspecified, but exclude other explicit categories
      filtered = practiceRecordData.filter(r => r.source === '기출문제' || r.source === 'Homepage' || !r.source || !['공식문제', '전문훈련'].includes(r.source));
      if (filtered.length === 0) filtered = sampleGichul;
    } else if (practiceRecordCategory === '공식문제') {
      filtered = practiceRecordData.filter(r => r.source === '공식문제');
      if (filtered.length === 0) filtered = sampleGongsik;
    } else if (practiceRecordCategory === 'Training') {
      filtered = practiceRecordData.filter(r => r.source === '전문훈련' || r.source === '유사문제' || r.source === 'Training');
      if (filtered.length === 0) filtered = sampleTraining;
    } else if (practiceRecordCategory === '틀린문제') {
      filtered = practiceRecordData.filter(r => r.questions?.some(q => !q.isCorrect));
      if (filtered.length === 0) filtered = allSampleRecords.filter(r => r.questions?.some(q => !q.isCorrect));
    }

    // Time period filter
    if (timePeriod !== 'All') {
      const now = new Date();
      let cutoff = new Date();
      if (timePeriod === 'Today') cutoff.setHours(0, 0, 0, 0);
      else if (timePeriod === '7 Days') cutoff.setDate(now.getDate() - 7);
      else if (timePeriod === '1 Month') cutoff.setMonth(now.getMonth() - 1);
      else if (timePeriod === '2 Months') cutoff.setMonth(now.getMonth() - 2);
      filtered = filtered.filter(r => new Date(r.date) >= cutoff);
    }

    // Status filter
    if (statusFilter === 'Completed') {
      filtered = filtered.filter(r => r.status === 'completed');
    } else if (statusFilter === 'Incomplete') {
      filtered = filtered.filter(r => r.status === 'incomplete');
    }

    // Student filter (for CMS viewing specific student's records)
    if (selectedStudentFilter) {
      filtered = filtered.filter(r => r.studentId === selectedStudentFilter);
    }

    return filtered;
  };

  const filteredRecords = useMemo(() => getFilteredRecords(), [
    practiceRecordCategory,
    practiceRecordSubject,
    practiceRecordDifficulty,
    timePeriod,
    statusFilter,
    selectedStudentFilter,
    practiceRecords,
    supabaseRecords,
  ]);

  // Group records by date
  const groupedRecords = useMemo(() => {
    const groups: { [date: string]: PracticeRecordItem[] } = {};
    const sorted = [...filteredRecords].sort((a, b) => b.date.localeCompare(a.date));
    sorted.forEach(record => {
      if (!groups[record.date]) groups[record.date] = [];
      groups[record.date].push(record);
    });
    return groups;
  }, [filteredRecords]);

  // Detail view for selected question
  const selectedRecord = allAvailableRecords.find(record => record.id === selectedQuestion?.recordId);

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getExplanation = (q: Question): string => {
    if (q.text.includes("primary purpose")) return "이 문제는 저자의 핵심 의도를 파악하는 유형입니다. 지문 전체의 흐름과 톤을 분석하여, 저자가 정보를 '분석'하는지, '비판'하는지, '서술'하는지, '옹호'하는지를 구별해야 합니다. 정답 '" + q.correctAnswer + "'은(는) 지문의 객관적이고 서술적인 어조와 가장 일치합니다.";
    if (q.text.includes("supports the claim")) return "근거 찾기 문제입니다. 주어진 주장을 직접적으로 뒷받침하는 증거가 포함된 줄 번호를 찾아야 합니다. 각 선택지의 줄 번호를 참조하여 해당 내용이 주장과 논리적으로 연결되는지 확인하세요. 정답 '" + q.correctAnswer + "'의 해당 줄에는 주장을 직접 뒷받침하는 데이터/사례가 포함되어 있습니다.";
    if (q.text.includes("most nearly means")) return "문맥 속 어휘 의미 파악 문제입니다. 해당 단어의 사전적 의미가 아닌, 지문의 문맥에서 어떤 뉘앙스로 사용되었는지 판단해야 합니��. 앞뒤 문장의 흐름을 통해 '" + q.correctAnswer + "'이(가) 가장 적절한 의미임을 알 수 있습니다.";
    if (q.text.includes("transition")) return "논리적 전환어 문제입니다. 앞 문장과 뒷 문장의 관계(인과, 대조, 예시, 추가 등)를 파악하여 가장 적절한 접속사를 선택합니다. 정답 '" + q.correctAnswer + "'은(는) 두 문장 간의 인과 관계를 정확히 연결합니다.";
    if (q.text.includes("Standard English")) return "표준 영어 문법 문제입니다. 주어-동사 수일치, 시제 일관성, 대명사 일치 등을 확인하세요. 이 문제에서는 주어의 수에 맞는 동사 형태 '" + q.correctAnswer + "'을(를) 선택해야 합니다.";
    if (q.text.includes("value of x") || q.text.includes("Solve")) return "대수 방정식 풀이 문제입니다. 양변에 동일한 연산을 적용하여 미지수를 분리하세요. 단계별로 풀면 정답 " + q.correctAnswer + "을(를) 구할 수 있습니다.";
    if (q.text.includes("vertex")) return "이차함수의 꼭짓점 문제입니다. y = a(x-h)² + k 형태에서 꼭짓점은 (h, k)입니다. 주어진 식에서 h와 k 값을 직접 읽어내면 정답 " + q.correctAnswer + "을(를) 구할 수 있습니다.";
    if (q.text.includes("hypothesized")) return "연구 가설 파악 문제입니다. 지문에서 연구자들이 실험 전에 예측한 내용을 찾으세요. 'hypothesized', 'predicted', 'expected' 등의 키워드 주변을 주의 깊게 읽으면 정답 '" + q.correctAnswer + "'을(를) 확인할 수 있습니다.";
    if (q.text.includes("ubiquitous") || q.text.includes("ephemeral")) return "고급 어휘 문제입니다. 라틴어/그리스어 어원을 알면 도움이 됩니다. 문맥의 단서를 활용하여 단어의 의미를 추론하세요. 정답은 '" + q.correctAnswer + "'입니다.";
    return "이 문제는 주어진 보기 중 가장 적절한 답을 선택하는 유형입니다. 각 선택지를 문맥과 비교하여 논리적으로 가장 타당한 답 '" + q.correctAnswer + "'을(를) 선택해야 합니다.";
  };

  const getAIAnalysis = (q: Question) => ({
    strategy: q.isCorrect
      ? "정답을 맞춘 좋은 풀이입니다! 이 유형에서는 선택지를 먼저 읽고 지문에서 근거를 찾는 전략이 효과적입니다. 시간 절약을 위해 키워드 스캐닝을 병행하세요."
      : `오답 '${q.userAnswer}'을(를) 선택한 이유를 분석해보면, 이 선택지는 일부 맞는 내용을 포함하고 있어 혼동하기 쉽습니다. 정답 '${q.correctAnswer}'과(와) 비교할 때, 핵심적인 차이점에 주목하세요.`,
    pattern: q.isCorrect
      ? "유사 유형 정답률이 높습니다. 이 카테고리의 문제들을 꾸준히 연습하면 더 빠른 시간 안에 풀 수 있습니다."
      : "이 유형의 문제에서 오답을 선택하는 패턴이 보입니다. 주로 '부분적으로 맞는 보기'에 속는 경향이 있으니, 선택지를 모두 읽은 후 가장 완전한 답을 고르세요.",
    tip: q.isCorrect
      ? "이 유형은 실전에서 1분 이내로 풀 수 있도록 연습하면 좋습니다."
      : "비슷한 유형 3문제를 추가로 풀어보면 이 패턴을 극복하는 데 도움이 됩니다."
  });

  // ===== DB-based similar question finder =====
  const questionPool = useMemo(() => {
    const pool: Array<{
      id: string; fileId: string; fileName: string; question: string; passage: string;
      choices: string[]; correctAnswer: string; explanation: string; type: string;
      category: string; subcategory: string; questionType: string; difficulty: string; imageUrl?: string;
    }> = [];
    uploadedFiles.forEach(file => {
      const questions = Array.isArray(file.data) ? file.data : (file.data ? [file.data] : []);
      questions.forEach((q: any, idx: number) => {
        if (q.question && q.choices && q.choices.length >= 4) {
          pool.push({
            id: `${file.id}_${idx}`, fileId: file.id, fileName: file.name || '',
            question: q.question || '', passage: q.passage || '',
            choices: q.choices || [], correctAnswer: (q.correctAnswer || 'a').toUpperCase(),
            explanation: q.explanation || '', type: file.type || '',
            category: file.location || '', subcategory: file.subcategory || '',
            questionType: file.questionType || q.category || '', difficulty: file.difficulty || q.difficulty || '',
            imageUrl: q.imageUrl,
          });
        }
      });
    });
    return pool;
  }, [uploadedFiles]);

  const classifyQuestion = (text: string): string[] => {
    const tags: string[] = [];
    const lower = text.toLowerCase();
    if (lower.includes('primary purpose') || lower.includes('main idea') || lower.includes('central claim') || lower.includes('primarily serves')) tags.push('main-idea');
    if (lower.includes('evidence') || lower.includes('supports the claim') || lower.includes('best supports')) tags.push('evidence');
    if (lower.includes('most nearly means') || lower.includes('as used in') || lower.includes('in context')) tags.push('vocabulary');
    if (lower.includes('transition') || lower.includes('logical') || lower.includes('connector')) tags.push('transition');
    if (lower.includes('standard english') || lower.includes('conventions') || lower.includes('grammar')) tags.push('grammar');
    if (lower.includes('structure') || lower.includes('function') || lower.includes('paragraph')) tags.push('structure');
    if (lower.includes('inference') || lower.includes('imply') || lower.includes('suggest')) tags.push('inference');
    if (lower.includes('solve') || lower.includes('value of') || lower.includes('equation')) tags.push('algebra');
    if (lower.includes('vertex') || lower.includes('parabola') || lower.includes('quadratic')) tags.push('quadratic');
    if (lower.includes('f(x)') || lower.includes('g(x)') || lower.includes('function')) tags.push('function');
    if (lower.includes('graph') || lower.includes('coordinate') || lower.includes('slope')) tags.push('graph');
    if (lower.includes('percent') || lower.includes('ratio') || lower.includes('proportion')) tags.push('ratio');
    if (lower.includes('triangle') || lower.includes('circle') || lower.includes('area') || lower.includes('geometry')) tags.push('geometry');
    if (tags.length === 0) tags.push('general');
    return tags;
  };

  const getSimilarQuestions = (q: Question): { fromDB: boolean; questions: any[] } => {
    const currentTags = classifyQuestion(q.text);
    const currentText = q.text.toLowerCase();
    const commonWords = ['which', 'choice', 'the', 'of', 'in', 'is', 'a', 'an', 'to', 'and', 'that', 'this', 'for'];

    const scored = questionPool.map(poolQ => {
      let score = 0;
      const poolTags = classifyQuestion(poolQ.question);
      score += currentTags.filter(t => poolTags.includes(t)).length * 10;
      if (poolQ.questionType && currentTags.some(t => poolQ.questionType.toLowerCase().includes(t))) score += 5;
      if (poolQ.difficulty && poolQ.difficulty === q.difficulty) score += 3;
      const poolLower = poolQ.question.toLowerCase();
      const currentWords = currentText.split(/\s+/).filter(w => w.length > 3 && !commonWords.includes(w));
      score += currentWords.filter(w => poolLower.includes(w)).length * 2;
      if (poolQ.question === q.text) score = -100;
      return { ...poolQ, score };
    });

    const top = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);

    if (top.length > 0) {
      return {
        fromDB: true,
        questions: top.map((sq, idx) => ({
          id: idx + 1, dbId: sq.id, text: sq.question, passage: sq.passage,
          options: sq.choices.map((c: string, i: number) => `${String.fromCharCode(65 + i)}) ${c}`),
          correctAnswer: sq.correctAnswer, explanation: sq.explanation,
          fileName: sq.fileName, difficulty: sq.difficulty, imageUrl: sq.imageUrl,
        }))
      };
    }

    // Fallback hardcoded
    if (q.text.includes("primary purpose") || q.text.includes("supports the claim")) {
      return { fromDB: false, questions: [
        { id: 1, text: "The main function of the third paragraph is to...", options: ["A) provide background information", "B) present a counterargument", "C) illustrate a key concept", "D) summarize previous research"], correctAnswer: "A" },
        { id: 2, text: "Which choice provides the best evidence for the answer to the previous question?", options: ["A) Lines 8-11", "B) Lines 15-18", "C) Lines 22-25", "D) Lines 31-34"], correctAnswer: "B" },
        { id: 3, text: "The passage primarily serves to...", options: ["A) compare two theories", "B) propose a new methodology", "C) evaluate recent findings", "D) describe a historical process"], correctAnswer: "C" },
      ]};
    }
    if (q.text.includes("most nearly means") || q.text.includes("ubiquitous") || q.text.includes("ephemeral")) {
      return { fromDB: false, questions: [
        { id: 1, text: "As used in line 23, 'profound' most nearly means...", options: ["A) deep", "B) extreme", "C) significant", "D) thoughtful"], correctAnswer: "C" },
        { id: 2, text: "In context, the word 'volatile' most closely means...", options: ["A) dangerous", "B) unstable", "C) explosive", "D) emotional"], correctAnswer: "B" },
        { id: 3, text: "The word 'unprecedented' as used in the passage means...", options: ["A) unexpected", "B) unmatched", "C) never before seen", "D) remarkable"], correctAnswer: "C" },
      ]};
    }
    if (q.text.includes("value of x") || q.text.includes("Solve") || q.text.includes("vertex") || q.text.includes("f(x)")) {
      return { fromDB: false, questions: [
        { id: 1, text: "If 2x - 5 = 13, what is x?", options: ["A) 4", "B) 7", "C) 9", "D) 11"], correctAnswer: "C" },
        { id: 2, text: "What is the y-intercept of y = 3x² - 6x + 4?", options: ["A) 2", "B) 3", "C) 4", "D) 6"], correctAnswer: "C" },
        { id: 3, text: "If g(x) = x² + 3x - 4, find g(-2).", options: ["A) -6", "B) -2", "C) 2", "D) 6"], correctAnswer: "A" },
      ]};
    }
    return { fromDB: false, questions: [
      { id: 1, text: "Which choice best describes the overall structure of the passage?", options: ["A) A claim followed by evidence", "B) A question followed by analysis", "C) A narrative with a conclusion", "D) A comparison of viewpoints"], correctAnswer: "A" },
      { id: 2, text: "The author mentions the study primarily to...", options: ["A) challenge a theory", "B) support an argument", "C) introduce a topic", "D) refute criticism"], correctAnswer: "B" },
      { id: 3, text: "Based on the data in the table, which conclusion is best supported?", options: ["A) Group A improved the most", "B) Group B showed no change", "C) Both groups had similar results", "D) The data is inconclusive"], correctAnswer: "A" },
    ]};
  };

  // Convert similar questions to Bluebook exam format for onStartTest
  const launchBluebookPractice = (similarQs: any[]) => {
    const examQuestions = similarQs.map((sq: any, idx: number) => ({
      id: idx + 1,
      passage: sq.passage || '이 문제는 유사 문제 연습입니다.\n\n관련 지문이 있는 경우 여기에 표시됩니다.',
      question: sq.text,
      choices: sq.options.map((opt: string, i: number) => ({
        id: String.fromCharCode(97 + i),
        text: opt.replace(/^[A-D]\)\s*/, ''),
      })),
      correctAnswer: sq.correctAnswer?.toLowerCase(),
      explanation: sq.explanation || '',
      imageUrl: sq.imageUrl,
    }));
    onStartTest({
      title: '유사 문제 연습',
      source: '유사문제',
      uploadedData: examQuestions,
      isSimilarPractice: true,
    });
  };

  if (selectedQuestion && selectedRecord) {
    const currentQuestionIndex = selectedRecord.questions?.findIndex(q => q.id === selectedQuestion.id) || 0;
    const currentQuestionData = selectedRecord.questions?.[currentQuestionIndex];
    if (!currentQuestionData) return null;

    return (
      <ReviewModal
        isOpen={true}
        onClose={() => {
          setSelectedQuestion(null);
          setOpenSections({ answer: true });
          setSimilarAnswers({});
          setSimilarResults({});
        }}
        question={{
          id: currentQuestionData.id,
          passage: currentQuestionData.passage || currentQuestionData.text,
          question: currentQuestionData.text,
          choices: currentQuestionData.options.map((opt, idx) => ({
            id: String.fromCharCode(97 + idx),
            text: opt.replace(/^[A-D]\)\s*/, ''),
          })),
        }}
        selectedAnswer={currentQuestionData.userAnswer}
        correctAnswer={currentQuestionData.correctAnswer}
        onPrevious={() => {
          const currentIdx = selectedRecord.questions?.findIndex(q => q.id === selectedQuestion.id) || 0;
          if (currentIdx > 0 && selectedRecord.questions) {
            setSelectedQuestion({ ...selectedRecord.questions[currentIdx - 1], recordId: selectedRecord.id });
          }
        }}
        onNext={() => {
          const currentIdx = selectedRecord.questions?.findIndex(q => q.id === selectedQuestion.id) || 0;
          if (currentIdx < (selectedRecord.questions?.length || 0) - 1 && selectedRecord.questions) {
            setSelectedQuestion({ ...selectedRecord.questions[currentIdx + 1], recordId: selectedRecord.id });
          }
        }}
        canGoPrevious={(selectedRecord.questions?.findIndex(q => q.id === selectedQuestion.id) || 0) > 0}
        canGoNext={(selectedRecord.questions?.findIndex(q => q.id === selectedQuestion.id) || 0) < (selectedRecord.questions?.length || 0) - 1}
        questionType={currentQuestionData.questionType || 'Central Ideas and Details'}
        difficulty={currentQuestionData.difficulty || '중간'}
      />
    );
  }

  const timePeriods = ['All', 'Today', '7 Days', '1 Month', '2 Months'];
  const statusFilters = ['All', 'Completed', 'Incomplete'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
        <h1 className="text-lg font-bold text-gray-900">Practice Records</h1>
      </div>

      {/* Mobile: Horizontal category tabs */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="px-3 pt-3 pb-1">
          <button
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-white mb-2"
            style={{ backgroundColor: '#0d6e6e' }}
          >
            <FileText size={14} />
            Exam Records
          </button>
        </div>
        <div className="flex overflow-x-auto px-3 pb-2 gap-1.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setPracticeRecordCategory(cat.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                practiceRecordCategory === cat.key
                  ? 'text-white border-teal-600'
                  : 'text-gray-600 border-gray-300 bg-white hover:bg-gray-50'
              }`}
              style={practiceRecordCategory === cat.key ? { backgroundColor: '#0d6e6e', borderColor: '#0d6e6e' } : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Desktop only */}
        <div className="hidden md:block w-48 min-h-[calc(100vh-120px)] bg-white border-r border-gray-200 flex-shrink-0">
          <div className="p-3">
            <button
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-semibold text-white mb-4"
              style={{ backgroundColor: '#0d6e6e' }}
            >
              <FileText size={16} />
              Exam Records
            </button>

            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-3 mb-2">Categories</p>
            <div className="space-y-0.5">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setPracticeRecordCategory(cat.key)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    practiceRecordCategory === cat.key
                      ? 'text-teal-700 font-bold bg-teal-50'
                      : 'text-gray-600 hover:bg-gray-50 font-medium'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Report View */}
          {practiceRecordCategory === 'Report' && reportContent ? (
            <div>{reportContent}</div>
          ) : (
            <div className="p-4 md:p-6">
              {/* Advertisement Banner */}
              {advertisements && <AdBannerDisplay advertisements={advertisements} location="history" />}

              {/* Filters */}
              <div className="mb-4 md:mb-6 space-y-2 md:space-y-3">
                {/* Student Filter Notice */}
                {selectedStudentFilter && setSelectedStudentFilter && (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span className="text-xs md:text-sm text-blue-700 font-medium">
                        특정 학생의 기록만 표시 중
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedStudentFilter(null)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      필터 해제
                    </button>
                  </div>
                )}
                
                {/* Time Period */}
                <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <span className="text-xs md:text-sm text-gray-500 font-medium mr-0.5 md:mr-1 flex-shrink-0">Time Period</span>
                  {timePeriods.map(tp => (
                    <button
                      key={tp}
                      onClick={() => setTimePeriod(tp)}
                      className={`flex-shrink-0 px-2.5 md:px-3 py-1 text-[11px] md:text-xs rounded-full border transition-colors ${
                        timePeriod === tp
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {tp}
                    </button>
                  ))}
                </div>
                {/* Status */}
                <div className="flex items-center gap-1.5 md:gap-2">
                  <span className="text-xs md:text-sm text-gray-500 font-medium mr-0.5 md:mr-1 flex-shrink-0">Status</span>
                  {statusFilters.map(sf => (
                    <button
                      key={sf}
                      onClick={() => setStatusFilter(sf)}
                      className={`flex-shrink-0 px-2.5 md:px-3 py-1 text-[11px] md:text-xs rounded-full border transition-colors ${
                        statusFilter === sf
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {sf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grouped Records */}
              {Object.keys(groupedRecords).length > 0 ? (
                <div className="space-y-5 md:space-y-6">
                  {Object.entries(groupedRecords).map(([date, records]) => (
                    <div key={date}>
                      {/* Date Header */}
                      <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        <span className="text-sm font-semibold text-gray-700">{date}</span>
                      </div>

                      {/* Record Cards */}
                      <div className="space-y-2.5 md:space-y-3">
                        {records.map((record, index) => (
                          <motion.div
                            key={record.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="px-3.5 py-3 md:px-5 md:py-4">
                              {/* Mobile Layout */}
                              <div className="md:hidden">
                                <div className="flex items-start justify-between mb-2.5">
                                  <h3 className="text-[13px] font-semibold text-gray-900 flex-1 min-w-0 mr-3 leading-snug" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{record.testTitle}</h3>
                                  <span className="text-[10px] text-gray-400 flex-shrink-0 whitespace-nowrap mt-0.5">{record.timestamp || record.date}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mb-3 bg-gray-50 rounded-lg px-3 py-2">
                                  <div className="text-center">
                                    <p className="text-[10px] text-gray-400 mb-0.5">Reading</p>
                                    <p className={`text-xs font-bold ${record.readingScore === '—' ? 'text-gray-300' : 'text-teal-600'}`}>
                                      {record.readingScore || '—'}
                                    </p>
                                  </div>
                                  <div className="text-center border-x border-gray-200">
                                    <p className="text-[10px] text-gray-400 mb-0.5">Writing</p>
                                    <p className={`text-xs font-bold ${record.writingScore === '—' ? 'text-gray-300' : 'text-teal-600'}`}>
                                      {record.writingScore || '—'}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[10px] text-gray-400 mb-0.5">Math</p>
                                    <p className={`text-xs font-bold ${record.mathScore === '—' ? 'text-gray-300' : 'text-teal-600'}`}>
                                      {record.mathScore || '—'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      if (record.questions && record.questions.length > 0) {
                                        setRestartModalRecord(record);
                                        setShowStartOverConfirm(false);
                                      }
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md text-white transition-colors"
                                    style={{ backgroundColor: '#0d6e6e' }}
                                  >
                                    <RotateCcw size={12} /> Restart
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (record.status === 'incomplete') {
                                        setIncompleteModalRecord(record);
                                        setShowIncompleteModal(true);
                                      } else if (record.questions && record.questions.length > 0) {
                                        // Show ScoreDetailModal first
                                        setScoreDetailRecord(record);
                                        setShowScoreDetailModal(true);
                                      }
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                  >
                                    <Eye size={12} /> View Results
                                  </button>
                                </div>
                              </div>

                              {/* Desktop Layout */}
                              <div className="hidden md:flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-semibold text-gray-900 mb-3">{record.testTitle}</h3>
                                  <div className="grid grid-cols-3 gap-6">
                                    <div>
                                      <p className="text-xs text-gray-400 mb-0.5">Reading</p>
                                      <p className={`text-sm font-semibold ${record.readingScore === '—' ? 'text-gray-300' : 'text-teal-600'}`}>
                                        {record.readingScore || '—'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400 mb-0.5">Writing</p>
                                      <p className={`text-sm font-semibold ${record.writingScore === '—' ? 'text-gray-300' : 'text-teal-600'}`}>
                                        {record.writingScore || '—'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400 mb-0.5">Math</p>
                                      <p className={`text-sm font-semibold ${record.mathScore === '—' ? 'text-gray-300' : 'text-teal-600'}`}>
                                        {record.mathScore || '—'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-3 ml-4 flex-shrink-0">
                                  <span className="text-xs text-gray-400">{record.timestamp || record.date}</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        if (record.questions && record.questions.length > 0) {
                                          setRestartModalRecord(record);
                                          setShowStartOverConfirm(false);
                                        }
                                      }}
                                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md text-white transition-colors"
                                      style={{ backgroundColor: '#0d6e6e' }}
                                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0a5a5a')}
                                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0d6e6e')}
                                    >
                                      <RotateCcw size={12} /> Restart
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (record.status === 'incomplete') {
                                          setIncompleteModalRecord(record);
                                          setShowIncompleteModal(true);
                                        } else if (record.questions && record.questions.length > 0) {
                                          // Show ScoreDetailModal first
                                          setScoreDetailRecord(record);
                                          setShowScoreDetailModal(true);
                                        }
                                      }}
                                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                      <Eye size={12} /> View Results
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12 text-center mt-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4">
                    <img src={historyEmptyImage} alt="No records" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-sm md:text-base font-medium text-gray-500 mb-2">
                    {practiceRecordCategory === '틀린문제'
                      ? '복습할 틀린 문제가 없습니다'
                      : `${practiceRecordCategory} 기록이 없습니다`
                    }
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    {practiceRecordCategory === '틀린문제'
                      ? '모든 문제를 정확히 풀었습니다! 완벽한 성과입니다.'
                      : '테스트를 완료하면 여기에서 결과를 확인할 수 있습니다.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Restart Modal */}
      {restartModalRecord && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setRestartModalRecord(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-1">다시 풀기</h2>
                  <p className="text-sm text-gray-500 leading-snug">{restartModalRecord.testTitle}</p>
                </div>
                <button onClick={() => setRestartModalRecord(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="px-6 pb-2 space-y-3">
              {/* Continue option */}
              <button
                onClick={() => {
                  if (restartModalRecord.status !== 'completed') {
                    onStartTest({
                      title: restartModalRecord.testTitle,
                      source: restartModalRecord.source,
                      retry: true,
                      continueFrom: restartModalRecord.correctAnswers,
                    });
                    setRestartModalRecord(null);
                  }
                }}
                disabled={restartModalRecord.status === 'completed'}
                className={`w-full text-left rounded-lg border-2 p-4 transition-all group ${
                  restartModalRecord.status === 'completed'
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    restartModalRecord.status === 'completed' ? 'bg-gray-200' : 'bg-teal-100 group-hover:bg-teal-200'
                  } transition-colors`}>
                    <Play size={18} className={restartModalRecord.status === 'completed' ? 'text-gray-400' : 'text-teal-700'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold mb-0.5 ${restartModalRecord.status === 'completed' ? 'text-gray-400' : 'text-gray-900'}`}>
                      이어서 풀기
                    </p>
                    <p className={`text-xs leading-relaxed ${restartModalRecord.status === 'completed' ? 'text-gray-300' : 'text-gray-500'}`}>
                      마지막으로 푼 문제부터 이어서 진행합니다
                    </p>
                    {restartModalRecord.status === 'incomplete' && (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.round((restartModalRecord.correctAnswers / restartModalRecord.totalQuestions) * 100)}%`,
                              backgroundColor: '#0d6e6e'
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-teal-700 whitespace-nowrap">
                          {restartModalRecord.correctAnswers} / {restartModalRecord.totalQuestions}
                        </span>
                      </div>
                    )}
                    {restartModalRecord.status === 'completed' && (
                      <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                        <span className="w-3.5 h-3.5 rounded-full bg-green-400 text-white flex items-center justify-center text-[9px]">&#10003;</span>
                        이미 완료된 시험입니다
                      </p>
                    )}
                  </div>
                </div>
              </button>

              {/* Start over option */}
              {!showStartOverConfirm ? (
                <button
                  onClick={() => setShowStartOverConfirm(true)}
                  className="w-full text-left rounded-lg border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 p-4 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center flex-shrink-0 transition-colors">
                      <RefreshCw size={18} className="text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">처음부터 풀기</p>
                      <p className="text-xs text-gray-500 leading-relaxed">모든 답안을 초기화하고 처음부터 시작합니다</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                        <span>{restartModalRecord.totalQuestions}문제</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>약 {restartModalRecord.duration} 소요</span>
                      </div>
                    </div>
                  </div>
                </button>
              ) : (
                <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <RefreshCw size={16} className="text-orange-600" />
                    <p className="text-sm font-semibold text-orange-800">기존 답안이 초기화됩니다</p>
                  </div>
                  <p className="text-xs text-orange-700 mb-4 leading-relaxed">
                    이전에 풀었던 답안이 모두 사라집니다. 계속하시겠습니까?
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setShowStartOverConfirm(false)}
                      className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 rounded-md hover:bg-orange-100 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => {
                        onStartTest({
                          title: restartModalRecord.testTitle,
                          source: restartModalRecord.source,
                          retry: true,
                          startOver: true,
                        });
                        setRestartModalRecord(null);
                        setShowStartOverConfirm(false);
                      }}
                      className="px-4 py-1.5 text-xs font-medium text-white rounded-md transition-colors"
                      style={{ backgroundColor: '#e65100' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#bf360c')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#e65100')}
                    >
                      초기화하고 시작
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 mt-1">
              <button
                onClick={() => setRestartModalRecord(null)}
                className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                취소
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Incomplete Test Modal */}
      {showIncompleteModal && incompleteModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowIncompleteModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-gray-900">알림</h3>
                <button
                  onClick={() => setShowIncompleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-base text-gray-700 leading-relaxed">
                아직 완료되지 않은 시험입니다. 계속 시험을 진행하시겠습니까?
              </p>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  setShowIncompleteModal(false);
                  if (incompleteModalRecord.questions && incompleteModalRecord.questions.length > 0) {
                    // Show ScoreDetailModal for incomplete records too
                    setScoreDetailRecord(incompleteModalRecord);
                    setShowScoreDetailModal(true);
                  }
                }}
                className="flex-1 py-3 px-4 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                결과 보기
              </button>
              <button
                onClick={() => {
                  setShowIncompleteModal(false);
                  onStartTest({
                    title: incompleteModalRecord.testTitle,
                    source: incompleteModalRecord.source,
                  });
                }}
                className="flex-1 py-3 px-4 text-sm font-medium rounded-xl text-white transition-colors"
                style={{ backgroundColor: '#00bcd4' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0097a7')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#00bcd4')}
              >
                계속 진행
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Score Detail Modal */}
      {showScoreDetailModal && scoreDetailRecord && (
        <ScoreDetailModal
          isOpen={showScoreDetailModal}
          onClose={() => {
            setShowScoreDetailModal(false);
            setScoreDetailRecord(null);
          }}
          questions={scoreDetailRecord.questions || []}
          selectedAnswers={
            // Convert questions to selectedAnswers format
            (scoreDetailRecord.questions || []).reduce((acc, q) => {
              acc[q.id] = q.userAnswer?.toLowerCase() || '';
              return acc;
            }, {} as Record<number, string>)
          }
          onReviewQuestion={(questionId: number) => {
            // Close modal and open individual question review
            setShowScoreDetailModal(false);
            const question = scoreDetailRecord.questions?.find(q => q.id === questionId);
            if (question) {
              setSelectedQuestion({ ...question, recordId: scoreDetailRecord.id });
            }
            setScoreDetailRecord(null);
          }}
        />
      )}
    </div>
  );
}