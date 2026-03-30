import { useState, useEffect } from "react";
import { Resizable } from "re-resizable";
import { ExamHeader } from "./components/ExamHeader";
import { PassagePanel } from "./components/PassagePanel";
import { QuestionPanel } from "./components/QuestionPanel";
import { MathQuestionPanel } from "./components/MathQuestionPanel";
import { ExamNavigation } from "./components/ExamNavigation";
import { QuestionOverview } from "./components/QuestionOverview";
import { SATIntroScreen } from "./components/SATIntroScreen";
import { PreparingScreen } from "./components/PreparingScreen";
import { PracticeTestInfoScreen } from "./components/PracticeTestInfoScreen";
import { TimeModeSelectionScreen } from "./components/TimeModeSelectionScreen";
import { Dashboard } from "./components/Dashboard";
import { VideoLectureModal } from "./components/VideoLectureModal";
import { DirectionsModal } from "./components/DirectionsModal";
import { ReviewQuestionPanel } from "./components/ReviewQuestionPanel";
import { ReviewModal } from "./components/ReviewModal";
import { ScoreDetailModal } from "./components/ScoreDetailModal";
import { ReferenceModal } from "./components/ReferenceModal";
import { CalculatorPanel } from "./components/CalculatorPanel";
import { Button } from "./components/ui/button";
import { AdBanner } from "./components/AdBanner";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";
import { X, Bookmark, ArrowLeft, Globe, Search as SearchIcon, BookOpen, FileText } from "lucide-react";
import { Download } from "lucide-react";
import { BluebookExpandButton } from "./components/BluebookExpandButton";
import { BluebookExpandIcon } from "./components/BluebookExpandIcon";
import { MobileExamTabs } from "./components/MobileExamTabs";
import { mathQuestions } from "./mathQuestions";
import { projectId, publicAnonKey } from "./utils/supabase/info";
import expandIconsSprite from "figma:asset/9b76972e6fd8aef3281c489a5cd74a7e1c455a46.png";
import dragHandleImg from "figma:asset/af403f2609b757e96b427cbfdd300891837f3bc7.png";
import expandRightIcon from "figma:asset/7824ae1cb1627c494e407eac40af4f6c3f73b05b.png";
import expandLeftIcon from "figma:asset/15377038ef3bc5534b33d4763b177c0dedf4adef.png";

// TOEFL/SAT level vocabulary extraction
const extractVocabularyFromText = (text: string, questionId: number) => {
  const satLevelWords = [
    // Advanced vocabulary patterns
    { word: "agglomeration", definition: "a mass or collection of things; an accumulation", difficulty: "어려움", type: "noun" },
    { word: "economies", definition: "the wealth and resources of a country or region", difficulty: "보통", type: "noun" },
    { word: "concentrate", definition: "focus one's attention or effort on a particular object or activity", difficulty: "보통", type: "verb" },
    { word: "readily", definition: "without hesitation or reluctance; willingly", difficulty: "보통", type: "adverb" },
    { word: "fosters", definition: "encourage or promote the development of", difficulty: "어려움", type: "verb" },
    { word: "technological", definition: "relating to or involving technology", difficulty: "쉬움", type: "adjective" },
    { word: "innovation", definition: "the action or process of innovating; a new method or idea", difficulty: "보통", type: "noun" },
    { word: "autonomous", definition: "having the freedom to act independently", difficulty: "어려움", type: "adjective" },
    { word: "medium", definition: "a means of communication or artistic expression", difficulty: "보통", type: "noun" },
    { word: "distinctly", definition: "in a way that is recognizably different in nature", difficulty: "보통", type: "adverb" },
    { word: "tradition", definition: "the transmission of customs or beliefs from generation to generation", difficulty: "쉬움", type: "noun" },
    { word: "realized", definition: "became fully aware of as a fact; understood clearly", difficulty: "보통", type: "verb" },
    { word: "probe", definition: "a spacecraft designed to explore the solar system", difficulty: "보통", type: "noun" },
    { word: "crater", definition: "a large bowl-shaped cavity in the ground", difficulty: "쉬움", type: "noun" },
    { word: "methane", definition: "a colorless, odorless flammable gas", difficulty: "어려움", type: "noun" },
    { word: "nitrogen", definition: "a colorless, odorless unreactive gas", difficulty: "어려움", type: "noun" },
    { word: "ammonia", definition: "a colorless gas with a characteristic pungent smell", difficulty: "어려움", type: "noun" },
    { word: "eruptions", definition: "instances of erupting or bursting forth", difficulty: "보통", type: "noun" },
    { word: "volcanoes", definition: "mountains with openings to Earth's interior", difficulty: "쉬", type: "noun" },
    { word: "hypothesized", definition: "put forward as a hypothesis; supposed", difficulty: "어려움", type: "verb" },
    { word: "massive", definition: "extremely large or heavy; substantial", difficulty: "쉬움", type: "adjective" },
    { word: "evidence", definition: "the available body of facts indicating whether a belief is true", difficulty: "쉬움", type: "noun" },
    { word: "associated", definition: "connected with something else in one's mind", difficulty: "보통", type: "verb" },
    { word: "appearance", definition: "the way that someone or something looks", difficulty: "쉬움", type: "noun" },
    { word: "impact", definition: "the action of one object coming forcibly into contact with another", difficulty: "보통", type: "noun" }
  ];

  const foundWords = [];
  const lowerText = text.toLowerCase();

  for (const wordData of satLevelWords) {
    const wordPattern = new RegExp(`\\b${wordData.word.toLowerCase()}\\b`, 'i');
    if (wordPattern.test(lowerText)) {
      // Extract context (surrounding words)
      const contextMatch = text.match(new RegExp(`\\b\\w+\\s+\\w*${wordData.word}\\w*\\s+\\w+\\b`, 'i'));
      const context = contextMatch ? contextMatch[0] : wordData.word;
      
      foundWords.push({
        ...wordData,
        questionId,
        context,
        dateAdded: new Date().toISOString(),
        mastered: false,
        reviewCount: 0
      });
    }
  }

  return foundWords;
};

// Load learned words from localStorage
const loadLearnedWords = () => {
  try {
    const saved = localStorage.getItem('learnedWords');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save learned words to localStorage
const saveLearnedWords = (words: any[]) => {
  try {
    localStorage.setItem('learnedWords', JSON.stringify(words));
  } catch {
    // Handle storage errors silently
  }
};

// Load practice records from localStorage
const loadPracticeRecords = () => {
  try {
    const saved = localStorage.getItem('practiceRecords');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save practice records to localStorage and Supabase
const savePracticeRecords = async (records: any[], currentUser?: any) => {
  try {
    localStorage.setItem('practiceRecords', JSON.stringify(records));
    
    // Save to Supabase if user is logged in
    if (currentUser && currentUser.id) {
      // Save the latest record to Supabase
      const latestRecord = records[0];
      if (latestRecord) {
        try {
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/practice-records`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...latestRecord,
              studentId: currentUser.id,
            }),
          });
          
          if (response.ok) {
            console.log('✅ Practice record saved to Supabase');
          }
        } catch (error) {
          console.log('⚠️ Failed to save practice record to Supabase:', error);
        }
      }
    }
  } catch {
    // Handle storage errors silently
  }
};

// Generate questions array with all 27 questions
const generateQuestions = () => {
  const baseQuestions = [
    {
      id: 3,
      passage: `The term "agglomeration economies" refers to the economic benefits enjoyed by firms in the same industry that _______ in a region. For example, in the computer manufacturing industry in the United Kingdom, firms that locate near one another can more readily take advantage of increased potential for information sharing among firms that fosters greater technological innovation.`,
      question: "Which choice completes the text with the most logical and precise word or phrase?",
      correctAnswer: "c",
      choices: [
        { id: "a", text: "recur" },
        { id: "b", text: "dissipate" },
        { id: "c", text: "concentrate" },
        { id: "d", text: "terminate" }
      ]
    },
    {
      id: 4,
      passage: `In the decades after Mexico won its independence from Spain, literature became a medium through which the new nation _______ its autonomous identity, with authors like Manuel Payno and Justo Sierra Méndez helping to shape what would become a distinctly Mexican literary tradition.`,
      question: "Which choice completes the text with the most logical and precise word or phrase?",
      correctAnswer: "b",
      choices: [
        { id: "a", text: "overcame" },
        { id: "b", text: "realized" },
        { id: "c", text: "decried" },
        { id: "d", text: "evaded" }
      ]
    },
    {
      id: 5,
      passage: `Researchers examining data from the New Horizons space probe, which passed Pluto in 2015, were surprised to find 23-mile-long crater on the planet. Although Pluto is mostly covered in frozen methane and nitrogen, the surface near the crater seemed to show the presence of water ice and ammonia—both of which are associated with eruptions from ice volcanoes. Additionally, the shape and appearance of the crater did not suggest that it was formed by impact. Based on this evidence, scientist Dale Cruikshank and his team hypothesized that the crater was likely once a massive ice volcano.`,
      question: "Which choice best describes the function of the underlined sentence in the text as a whole?",
      correctAnswer: "b",
      choices: [
        { id: "a", text: "It introduces previous findings that suggested a research method for Cruikshank and his team." },
        { id: "b", text: "It implies that the research team eliminated an alternative explanation for the crater based on available evidence." },
        { id: "c", text: "It emphasizes the importance of the New Horizons space probe to researchers." },
        { id: "d", text: "It identifies a misconception that the researchers had about the crater when they were first studying the data." }
      ]
    }
  ];

  const questions = [];
  for (let i = 1; i <= 54; i++) {
    if (i === 3 || i === 4 || i === 5) {
      questions.push(baseQuestions.find(q => q.id === i)!);
    } else {
      questions.push({
        id: i,
        passage: `Sample passage for question ${i}. This is a placeholder passage that would contain the reading material for this question for Module ${i > 27 ? 2 : 1}.`,
        question: `Question ${i}: Which choice completes the text with the most logical and precise word or phrase?`,
        correctAnswer: "a", // default for placeholders
        choices: [
          { id: "a", text: "Option A" },
          { id: "b", text: "Option B" },
          { id: "c", text: "Option C" },
          { id: "d", text: "Option D" }
        ]
      });
    }
  }
  return questions;
};

const defaultQuestions = generateQuestions();

export default function App() {
  // Set document title and favicon
  useEffect(() => {
    document.title = "AllMyExam - SAT";
    // Create favicon: teal rounded square with white lightning bolt (matching reference image)
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Rounded rectangle background with subtle gradient
      const r = 14;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(size - r, 0);
      ctx.quadraticCurveTo(size, 0, size, r);
      ctx.lineTo(size, size - r);
      ctx.quadraticCurveTo(size, size, size - r, size);
      ctx.lineTo(r, size);
      ctx.quadraticCurveTo(0, size, 0, size - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#00cfe8');
      grad.addColorStop(1, '#00a5b8');
      ctx.fillStyle = grad;
      ctx.fill();
      // White lightning bolt - centered, bold, matching reference
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(37, 6);
      ctx.lineTo(18, 34);
      ctx.lineTo(29, 34);
      ctx.lineTo(26, 58);
      ctx.lineTo(46, 30);
      ctx.lineTo(35, 30);
      ctx.closePath();
      ctx.fill();
      // Apply as favicon
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.type = 'image/png';
      link.href = canvas.toDataURL('image/png');
    }
  }, []);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({}); // No answers selected initially
  const [isHidden, setIsHidden] = useState(false);
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({}); // No questions marked by default
  const [highlightsMode, setHighlightsMode] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Start at question 1 (index 0)
  const [isExpanded, setIsExpanded] = useState(false); // Panel expansion state
  const [showOverview, setShowOverview] = useState(false); // Question overview panel state
  const [timeRemaining, setTimeRemaining] = useState(32 * 60); // 32 minutes in seconds (1920 seconds)
  const [currentSection, setCurrentSection] = useState(1); // Current section (1 or 2)
  const [currentModule, setCurrentModule] = useState(1); // Current module (1 or 2)
  const [gameState, setGameState] = useState<'dashboard' | 'preparing' | 'practice-info' | 'time-mode' | 'intro' | 'exam' | 'check-work' | 'module-over' | 'finished' | 'score-report' | 'review'>('dashboard'); // Game state
  const [reviewMode, setReviewMode] = useState(false); // Review mode state
  const [isPracticeReview, setIsPracticeReview] = useState(false); // New state for "시작하기(복습용)"
  const [showSimilarOverlay, setShowSimilarOverlay] = useState(false);
  const [similarQuestions, setSimilarQuestions] = useState<any[]>([]);
  const [similarProblemIndex, setSimilarProblemIndex] = useState(0);
  const [similarProblemAnswers, setSimilarProblemAnswers] = useState<Record<number, string>>({});
  const [showSimilarResults, setShowSimilarResults] = useState<Record<number, boolean>>({});
  const [similarFullscreenTab, setSimilarFullscreenTab] = useState<string | null>(null);
  const [showDirections, setShowDirections] = useState(false); // Directions modal state
  const [panelWidth, setPanelWidth] = useState(50); // Panel width percentage
  const [expandDirection, setExpandDirection] = useState<'left' | 'right' | null>(null); // Expansion direction
  const [historyRecordToReview, setHistoryRecordToReview] = useState<any | null>(null);
  const [learnedWords, setLearnedWords] = useState<any[]>(loadLearnedWords()); // User's learned vocabulary
  const [processedQuestions, setProcessedQuestions] = useState<Set<number>>(new Set()); // Track which questions had words extracted
  const [practiceRecords, setPracticeRecords] = useState<any[]>(loadPracticeRecords()); // User's practice records
  const [currentTestInfo, setCurrentTestInfo] = useState<any>(null); // Current test metadata
  const [showVideoModal, setShowVideoModal] = useState(false); // Video modal state
  const [selectedVideoQuestion, setSelectedVideoQuestion] = useState<number | null>(null); // Current video question
  const [showReviewModal, setShowReviewModal] = useState(false); // Review modal state
  const [showScoreDetail, setShowScoreDetail] = useState(false); // Score detail modal state
  const [showAnalysis, setShowAnalysis] = useState(false); // Analysis view state
  const [isTimed, setIsTimed] = useState(true); // Time mode state (Timed or Untimed)
  const [questions, setQuestions] = useState<any[]>(defaultQuestions); // Questions data - can be default or uploaded
  const [showCalculator, setShowCalculator] = useState(false); // Calculator state
  const [showReference, setShowReference] = useState(false); // Reference modal state
  const [calculatorExpanded, setCalculatorExpanded] = useState(false); // Calculator expanded state
  const [currentUser, setCurrentUser] = useState<any>(() => {
    // Load current user from localStorage
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }); // Current logged in user
  const totalQuestions = questions.length;

  // Split questions into modules based on test type
  const questionsPerModule = currentTestInfo?.type === 'Math' ? 22 : 27;
  const module1Questions = questions.slice(0, questionsPerModule);
  const module2Questions = questions.slice(questionsPerModule, questionsPerModule * 2);
  
  // Get current module's questions
  const currentModuleQuestions = currentModule === 1 ? module1Questions : module2Questions;
  const currentModuleTotalQuestions = currentModuleQuestions.length;

  const currentQuestion = currentModuleQuestions[currentQuestionIndex];
  const currentQuestionId = currentQuestion?.id || 1;

  // Save currentUser to localStorage when it changes
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('currentUser');
      }
    } catch (error) {
      console.error('Error saving currentUser to localStorage:', error);
    }
  }, [currentUser]);

  // Timer effect - only start when exam begins and if timed mode is enabled
  useEffect(() => {
    if (gameState !== 'exam' || !isTimed) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          // Time's up, complete the exam
          handleExamComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, isTimed]);

  // Auto transition from module-over after 3 seconds
  useEffect(() => {
    if (gameState !== 'module-over') return;
    
    const timer = setTimeout(() => {
      if (currentModule === 1) {
        // Move to Module 2
        setCurrentModule(2);
        setCurrentQuestionIndex(0);
        setTimeRemaining(currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학') ? 35 * 60 : 32 * 60); // Reset timer for Module 2
        setGameState('exam');
      } else if (currentModule === 2) {
        // All modules completed - go to finished screen
        setGameState('finished');
        
        // Save practice record when test is completed (but NOT in review mode)
        if (currentTestInfo && !isPracticeReview) {
          // Calculate correct answers for the record
          const correctCount = questions.reduce((count, question) => {
            const userAnswer = selectedAnswers[question.id]?.toLowerCase();
            const correctAnswer = (question.correctAnswer || 'a').toLowerCase();
            return userAnswer === correctAnswer ? count + 1 : count;
          }, 0);
          
          const accuracy = Math.round((correctCount / totalQuestions) * 100);
          const score = 200 + (correctCount * 10); // Simple mock score calculation

          const newRecord = {
            id: Date.now().toString(),
            title: currentTestInfo.title || 'SAT Practice Test',
            type: currentTestInfo.type || '독해문법',
            source: currentTestInfo.source || '기출문제',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            totalQuestions: totalQuestions,
            answeredQuestions: Object.keys(selectedAnswers).length,
            correctAnswers: correctCount,
            accuracy: accuracy,
            score: score,
            difficulty: currentTestInfo.difficulty,
            trainingType: currentTestInfo.trainingType,
            questionCount: currentTestInfo.questionCount,
            answers: selectedAnswers,
            markedForReview: markedForReview,
            questions: questions, // Store questions to review later
            studentId: currentUser?.id || null,
            studentEmail: currentUser?.email || null,
            studentName: currentUser?.name || currentUser?.username || null
          };
          
          const updatedRecords = [newRecord, ...practiceRecords];
          setPracticeRecords(updatedRecords);
          savePracticeRecords(updatedRecords, currentUser);
        }
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [gameState, currentModule, currentTestInfo, selectedAnswers, markedForReview, totalQuestions, isPracticeReview]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')} : ${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleToggleHide = () => {
    setIsHidden(!isHidden);
  };

  const handleToggleHighlights = () => {
    setHighlightsMode(!highlightsMode);
  };

  const handleToggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const handleExpandLeft = () => {
    if (isExpanded && expandDirection === 'left') {
      // Collapse back to center
      setIsExpanded(false);
      setExpandDirection(null);
      setPanelWidth(50);
    } else {
      // Expand left (passage panel gets bigger)
      setIsExpanded(true);
      setExpandDirection('left');
      setPanelWidth(60);
    }
  };

  const handleExpandRight = () => {
    if (isExpanded && expandDirection === 'right') {
      // Collapse back to center
      setIsExpanded(false);
      setExpandDirection(null);
      setPanelWidth(50);
    } else {
      // Expand right (question panel gets bigger)
      setIsExpanded(true);
      setExpandDirection('right');
      setPanelWidth(40);
    }
  };

  const handleIntroNext = () => {
    setGameState('exam');
  };

  const handlePreparingComplete = () => {
    setGameState('time-mode'); // Preparing 후 바로 Time Mode 선택으로
  };

  const handlePracticeInfoNext = () => {
    setGameState('exam'); // Practice Info 후 바로 시험 시작
  };

  const handleTimeModeBack = () => {
    setGameState('preparing'); // Time Mode에서 뒤로가기 시 Preparing으로
  };

  const handleTimeModeNext = (selectedIsTimed: boolean) => {
    setIsTimed(selectedIsTimed);
    setGameState('practice-info'); // Time Mode 선택 후 Practice Info로
  };

  const handleStartReview = (testInfo?: any) => {
    // Reset test state but for review only
    setCurrentTestInfo(testInfo);
    setCurrentModule(1);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setMarkedForReview({});
    setTimeRemaining(testInfo?.type === 'Math' || testInfo?.title?.includes('수학') ? 35 * 60 : 32 * 60);
    setIsPracticeReview(true); // Flag for "시작하기(복습용)"
    setIsTimed(false); // Review mode is usually untimed

    // Check if testInfo has uploaded data
    if (testInfo?.questions && Array.isArray(testInfo.questions) && testInfo.questions.length > 0) {
      setQuestions(testInfo.questions);
    } else if (testInfo?.uploadedData && Array.isArray(testInfo.uploadedData) && testInfo.uploadedData.length > 0) {
      setQuestions(testInfo.uploadedData);
    } else if (testInfo?.type === 'Math' || testInfo?.title?.includes('수학')) {
      setQuestions(mathQuestions);
    } else {
      setQuestions(defaultQuestions);
    }

    setGameState('exam'); // Skip Preparing/Time-Mode screens
    toast.success('복습 모드를 시작합니다.');
  };

  const handleStartTest = (testInfo?: any) => {
    setIsPracticeReview(false); // Normal test saves to history
    // Check if there's a saved exam state
    const savedState = localStorage.getItem('savedExamState');
    if (savedState && testInfo?.resumeSaved) {
      try {
        const parsed = JSON.parse(savedState);
        // Restore saved state
        setCurrentTestInfo(parsed.testInfo);
        setCurrentQuestionIndex(parsed.currentQuestionIndex);
        setSelectedAnswers(parsed.selectedAnswers);
        setMarkedForReview(parsed.markedForReview);
        setTimeRemaining(parsed.timeRemaining);
        setCurrentSection(parsed.currentSection);
        setCurrentModule(parsed.currentModule);
        setIsHidden(parsed.isHidden);
        setHighlightsMode(parsed.highlightsMode);
        
        // Go directly to exam
        setGameState('exam');
        toast.success('이전 시험을 계속합니다.');
        return;
      } catch (error) {
        toast.error('저장된 시험을 불러오는 데 실패했습니다.');
      }
    }
    
    setCurrentTestInfo(testInfo);
    setCurrentModule(1);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setMarkedForReview({});
    setTimeRemaining(testInfo?.type === 'Math' || testInfo?.title?.includes('수학') ? 35 * 60 : 32 * 60);
    
    // Check if testInfo has uploaded data
    if (testInfo?.questions && Array.isArray(testInfo.questions) && testInfo.questions.length > 0) {
      // Use questions from history record
      console.log('✅ 히스토리 문제 데이터 사용:', testInfo.questions.length, '문항');
      setQuestions(testInfo.questions);
      toast.success('이전 시험 문제를 불러왔습니다.');
    } else if (testInfo?.uploadedData && Array.isArray(testInfo.uploadedData) && testInfo.uploadedData.length > 0) {
      // Use uploaded questions
      console.log('✅ 업로드된 문제 데이터 사용:', testInfo.uploadedData.length, '문항');
      setQuestions(testInfo.uploadedData);
      toast.success(`${testInfo.uploadedData.length}문항이 로드되었습니다.`);
    } else if (testInfo?.type === 'Math' || testInfo?.title?.includes('수학')) {
      // Use math questions for math tests
      console.log('📐 수학 문제 데이터 사용:', mathQuestions.length, '문항');
      setQuestions(mathQuestions);
      toast.success(`수학 ${mathQuestions.length}문항이 로드되었습니다.`);
    } else {
      // Use default reading questions
      console.log('📋 기본 독해문법 문제 데이터 사용');
      setQuestions(defaultQuestions);
    }
    
    setGameState('preparing'); // Start with preparing screen
  };

  // Save test results when exam is completed
  const handleExamComplete = () => {
    // Show "Check Your Work" screen when time runs out
    setGameState('check-work');
  };

  // Auto-extract vocabulary when user interacts with a question
  const extractWordsFromCurrentQuestion = () => {
    if (!currentQuestion || processedQuestions.has(currentQuestionId)) {
      return; // Skip if already processed
    }

    const questionText = `${currentQuestion.passage} ${currentQuestion.question}`;
    const newWords = extractVocabularyFromText(questionText, currentQuestionId);
    
    if (newWords.length > 0) {
      const existingWords = learnedWords;
      const wordsToAdd = newWords.filter(newWord => 
        !existingWords.some(existing => 
          existing.word.toLowerCase() === newWord.word.toLowerCase() && 
          existing.questionId === newWord.questionId
        )
      );

      if (wordsToAdd.length > 0) {
        // Add source information from currentTestInfo
        const wordsWithSource = wordsToAdd.map(word => ({
          ...word,
          source: currentTestInfo?.source || '기출문제',
          testTitle: currentTestInfo?.title || 'SAT Practice',
          trainingType: currentTestInfo?.trainingType
        }));
        
        const updatedWords = [...existingWords, ...wordsWithSource];
        setLearnedWords(updatedWords);
        saveLearnedWords(updatedWords);
        
        // Mark this question as processed
        setProcessedQuestions(prev => new Set([...prev, currentQuestionId]));
        
        // Notifications disabled during exam to avoid interruptions
        /*if (wordsToAdd.length === 1) {
          toast.success(`새로운 단어 \"${wordsToAdd[0].word}\"가 단어장에 추가되었습니다! 📚`);
        } else {
          toast.success(`${wordsToAdd.length}개의 새로운 단어가 단어장에 추가되었습니다! 📚`);
        }*/
      }
    }
  };



  const handleAnswerChange = (value: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionId]: value
    }));
    
    // Auto-extract words when user selects an answer
    extractWordsFromCurrentQuestion();
  };

  const handleToggleMarkForReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestionId]: !prev[currentQuestionId]
    }));
  };

  const handleShowOverview = () => {
    setShowOverview(true);
  };

  const handleQuestionSelect = (questionNumber: number) => {
    // Extract words from current question before switching
    extractWordsFromCurrentQuestion();
    
    // Since our questions array is 0-indexed but question numbers start at 1
    const questionIndex = questionNumber - 1;
    if (questionIndex >= 0 && questionIndex < questions.length) {
      setCurrentQuestionIndex(questionIndex);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    // Extract words before moving to next question
    extractWordsFromCurrentQuestion();
    
    if (currentQuestionIndex < currentModuleTotalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Last question of the module - show Check Your Work screen first
      setGameState('check-work');
    }
  };

  const handleShowVideoLecture = (questionId: number) => {
    setSelectedVideoQuestion(questionId);
    setShowVideoModal(true);
  };

  const handleSaveAndExit = () => {
    // Save current exam state to localStorage
    const savedExamState = {
      testInfo: currentTestInfo,
      currentQuestionIndex,
      selectedAnswers,
      markedForReview,
      timeRemaining,
      currentSection,
      currentModule,
      isHidden,
      highlightsMode,
      savedAt: new Date().toISOString()
    };
    
    try {
      localStorage.setItem('savedExamState', JSON.stringify(savedExamState));
      toast.success('진��� 상황이 저장되었습니다. 나중에 계속할 수 있습니다.');
      
      // Return to dashboard
      setGameState('dashboard');
    } catch (error) {
      toast.error('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const canGoPrevious = currentQuestionIndex > 0;
  const canGoNext = true; // Always allow next button

  // Show dashboard
  if (gameState === 'dashboard') {
    return (
      <>
        <Dashboard 
          onStartTest={handleStartTest} 
          onStartReview={handleStartReview}
          learnedWords={learnedWords} 
          practiceRecords={practiceRecords}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          onViewHistoryDetail={(record) => setHistoryRecordToReview(record)}
        />
        {historyRecordToReview && (
          <ScoreDetailModal
            isOpen={true}
            onClose={() => setHistoryRecordToReview(null)}
            questions={historyRecordToReview.questions || []}
            selectedAnswers={historyRecordToReview.answers || {}}
            onReviewQuestion={(questionId) => {
              // Optionally handle question review from history
              console.log('Reviewing question:', questionId);
            }}
          />
        )}
      </>
    );
  }

  // Show preparing screen
  if (gameState === 'preparing') {
    return <PreparingScreen onComplete={handlePreparingComplete} />;
  }

  // Show practice info screen
  if (gameState === 'practice-info') {
    return <PracticeTestInfoScreen 
      onNext={handlePracticeInfoNext} 
      testType={currentTestInfo?.title?.includes('ACT') ? 'ACT' : 'SAT'}
    />;
  }

  // Show time mode selection screen
  if (gameState === 'time-mode') {
    return <TimeModeSelectionScreen 
      onBack={handleTimeModeBack}
      onNext={handleTimeModeNext}
    />;
  }

  // Show intro screen
  if (gameState === 'intro') {
    return <SATIntroScreen onNext={handleIntroNext} />;
  }

  // Show Check Your Work screen
  if (gameState === 'check-work') {
    const handleCheckWorkNext = () => {
      // Show "This Module Is Over" screen
      setGameState('module-over');
    };

    const handleCheckWorkBack = () => {
      setGameState('exam');
    };

    return (
      <div className="h-screen flex flex-col" style={{ backgroundColor: '#F5F5F7' }}>
        {/* Header - responsive */}
        <div className="bg-white px-3 md:px-10 py-2 md:py-4 flex items-center justify-between" style={{ borderBottom: '2px dotted #999' }}>
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <h1 className="truncate" style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
              <span className="md:hidden">Section {currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학') ? '2' : '1'}, Module {currentModule}</span>
              <span className="hidden md:inline">Section {currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학') ? '2' : '1'}, Module {currentModule}: {currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학') ? 'Math' : 'Reading and Writing'}</span>
            </h1>
            <button className="px-2 md:px-3 py-1 text-xs shrink-0" style={{ border: '1px solid #999', borderRadius: '4px', background: 'white' }}>
              Directions
            </button>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{formatTime(timeRemaining)}</span>
            <button className="px-2 md:px-4 py-1 md:py-1.5 bg-gray-200 text-gray-700 rounded text-xs md:text-sm">Hide</button>
            <button className="p-1 hidden md:block"><span style={{ fontSize: '18px' }}>🖩</span></button>
            <button className="p-1 hidden md:block"><span style={{ fontSize: '18px' }}></span></button>
            <button className="p-1"><span style={{ fontSize: '18px' }}>⋮</span></button>
          </div>
        </div>

        {/* Content - responsive */}
        <div className="flex-1 flex items-start justify-center pt-4 md:pt-8 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-5 md:p-12 max-w-5xl w-full mx-3 md:mx-6 mb-4" style={{ marginTop: '4px' }}>
            <h2 className="text-center mb-4 md:mb-8" style={{ fontSize: 'clamp(24px, 5vw, 36px)', color: '#555', fontWeight: '500' }}>Check Your Work</h2>
            
            <div className="mb-5 md:mb-8 text-center space-y-2">
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">On test day, you won't be able to move on to the next module until time expires.</p>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">For these practice questions, you can click <strong>Next</strong> when you're ready to move on.</p>
            </div>

            <div className="bg-white rounded-lg p-4 md:p-8 mb-6 md:mb-8" style={{ border: '1px solid #ddd' }}>
              {/* Section title and legend */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 md:mb-6">
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>
                  <span className="md:hidden">Section {currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학') ? '2' : '1'}, Module {currentModule}:<br/>{currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학') ? 'Math' : 'Reading and Writing'} Questions</span>
                  <span className="hidden md:inline">Section {currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학') ? '2' : '1'}, Module {currentModule}: {currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학') ? 'Math' : 'Reading and Writing'} Questions</span>
                </h3>
                <div className="flex items-center gap-4 md:gap-5 text-xs md:text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-dashed border-gray-500 rounded-sm bg-white"></span>
                    <span style={{ color: '#666' }}>Unanswered</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-600 fill-red-600" />
                    <span style={{ color: '#666' }}>For Review</span>
                  </span>
                </div>
              </div>

              {/* Question grid - responsive columns */}
              <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-2 md:gap-3">
                {currentModuleQuestions.map((q, i) => {
                  const questionNum = i + 1;
                  const isAnswered = selectedAnswers[q.id];
                  const isMarked = markedForReview[q.id];
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setGameState('exam');
                        handleQuestionSelect(questionNum);
                      }}
                      className={`
                        py-2.5 md:py-3 rounded border-2 border-dashed transition-colors flex items-center justify-center
                        ${isMarked 
                          ? 'bg-red-500 border-red-500 text-white' 
                          : isAnswered 
                            ? 'border-blue-600 bg-white'
                            : 'border-gray-400 bg-white hover:bg-gray-50'
                        }
                      `}
                      style={{ 
                        fontWeight: '600',
                        fontSize: '14px',
                        color: isMarked ? 'white' : isAnswered ? '#0066CC' : '#666'
                      }}
                    >
                      {questionNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Buttons - centered on mobile */}
            <div className="flex justify-center md:justify-end gap-3 md:gap-4">
              <Button
                onClick={handleCheckWorkBack}
                className="px-6 md:px-8 py-2.5 text-white rounded-full text-sm md:text-base"
                style={{ backgroundColor: '#0066CC', fontWeight: '600' }}
              >
                Back
              </Button>
              <Button
                onClick={handleCheckWorkNext}
                className="px-6 md:px-8 py-2.5 text-white rounded-full text-sm md:text-base"
                style={{ backgroundColor: '#0066CC', fontWeight: '600' }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Module Over screen
  if (gameState === 'module-over') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <h1 
            className="mb-8" 
            style={{ 
              fontSize: '32px',
              color: '#0066CC',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: '600'
            }}
          >
            This Module Is Over
          </h1>
          
          <div className="space-y-3 mb-8">
            <p 
              className="text-gray-700"
              style={{ 
                fontSize: '16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
            >
              All your work has been saved.
            </p>
            <p 
              className="text-gray-700"
              style={{ 
                fontSize: '16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
            >
              You'll move on automatically in just a moment.
            </p>
            <p 
              className="text-gray-700"
              style={{ 
                fontSize: '16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
            >
              Do not refresh this page or exit.
            </p>
          </div>

          {/* Loading spinner */}
          <div className="flex justify-center">
            <svg 
              className="animate-spin" 
              width="40" 
              height="40" 
              viewBox="0 0 40 40"
            >
              <circle 
                cx="20" 
                cy="20" 
                r="16" 
                fill="none" 
                stroke="#E0E0E0" 
                strokeWidth="4"
              />
              <circle 
                cx="20" 
                cy="20" 
                r="16" 
                fill="none" 
                stroke="#666666" 
                strokeWidth="4"
                strokeDasharray="80"
                strokeDashoffset="20"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Show Finished screen
  if (gameState === 'finished') {
    return (
      <div className="h-screen flex items-center justify-center bg-white relative overflow-hidden">
        {/* Confetti dots */}
        {Array.from({ length: 30 }).map((_, i) => {
          const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          const randomX = Math.random() * 100;
          const randomY = Math.random() * 100;
          const randomSize = Math.random() * 6 + 2;
          
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                backgroundColor: randomColor,
                width: `${randomSize}px`,
                height: `${randomSize}px`,
                left: `${randomX}%`,
                top: `${randomY}%`,
                opacity: 0.6
              }}
            />
          );
        })}

        <div className="text-center max-w-3xl px-6 relative z-10">
          <h1 className="text-4xl mb-10 text-gray-800" style={{ fontWeight: '600' }}>You're All Finished!</h1>
          
          <div className="bg-white rounded-3xl shadow-2xl p-16 mb-10 relative">
            {/* Laptop icon with smiley face */}
            <div className="mb-8 relative inline-block">
              <svg width="200" height="160" viewBox="0 0 150 120" className="mx-auto">
                {/* Confetti around laptop */}
                <circle cx="30" cy="30" r="3" fill="#4ECDC4" />
                <circle cx="120" cy="25" r="2" fill="#FFA07A" />
                <circle cx="25" cy="70" r="2" fill="#BB8FCE" />
                <circle cx="125" cy="65" r="3" fill="#F7DC6F" />
                <path d="M 35 35 L 40 40 L 35 45" stroke="#45B7D1" strokeWidth="2" fill="none" />
                <path d="M 115 35 L 110 40 L 115 45" stroke="#FF6B6B" strokeWidth="2" fill="none" />
                <circle cx="45" cy="25" r="2" fill="#98D8C8" />
                <circle cx="105" cy="75" r="2" fill="#85C1E2" />
                
                {/* Laptop screen */}
                <rect x="35" y="30" width="80" height="50" rx="3" fill="none" stroke="#2C3E50" strokeWidth="3" />
                <rect x="40" y="35" width="70" height="40" rx="2" fill="#E8F4F8" />
                
                {/* Smiley face */}
                <circle cx="75" cy="52" r="15" fill="none" stroke="#4ECDC4" strokeWidth="2" />
                <circle cx="70" cy="48" r="2" fill="#4ECDC4" />
                <circle cx="80" cy="48" r="2" fill="#4ECDC4" />
                <path d="M 68 56 Q 75 60 82 56" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" />
                
                {/* Laptop base */}
                <path d="M 20 80 L 35 80 L 40 85 L 110 85 L 115 80 L 130 80 L 135 95 L 15 95 Z" fill="none" stroke="#2C3E50" strokeWidth="3" />
                <rect x="40" y="85" width="70" height="3" fill="#2C3E50" />
              </svg>
            </div>
            
            <p className="text-gray-700 text-base leading-relaxed" style={{ fontSize: '17px' }}>
              Congratulations on completing a full-length<br />
              SAT practice test! Your scores will be available<br />
              shortly on <span className="font-semibold">My SAT</span>.
            </p>
          </div>
          
          <Button
            onClick={() => setGameState('score-report')}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-16 py-4 rounded-full shadow-lg text-base"
            style={{ fontWeight: '700' }}
          >
            View Your Score
          </Button>
        </div>
      </div>
    );
  }

  // Show Score Report screen
  if (gameState === 'score-report') {
    const correctAnswers = questions.reduce((count, question) => {
      const userAnswer = selectedAnswers[question.id];
      const correctAnswer = question.id === 3 ? 'c' : question.id === 4 ? 'b' : question.id === 5 ? 'b' : 'a';
      return userAnswer === correctAnswer ? count + 1 : count;
    }, 0);
    
    const mathScore = 200; // Default score for demo
    const totalQuestions = 27 * 2; // Module 1 + Module 2
    const incorrectAnswers = totalQuestions - correctAnswers;

    return (
      <>
        {/* Score Detail - Show directly without modal */}
        <ScoreDetailModal
          isOpen={true}
          onClose={() => {
            setGameState('dashboard');
            setCurrentModule(1);
            setCurrentQuestionIndex(0);
            setSelectedAnswers({});
            setMarkedForReview({});
            setTimeRemaining(32 * 60);
          }}
          questions={questions}
          selectedAnswers={selectedAnswers}
          onReviewQuestion={(questionId) => {
            handleQuestionSelect(questionId);
            setShowReviewModal(true);
          }}
        />

        {/* Review Modal */}
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          question={currentQuestion}
          selectedAnswer={selectedAnswers[currentQuestion.id]}
          correctAnswer={
            currentQuestion.id === 3
              ? "c"
              : currentQuestion.id === 4
              ? "b"
              : currentQuestion.id === 5
              ? "b"
              : "a"
          }
          onPrevious={() => {
            if (currentQuestionIndex > 0) {
              setCurrentQuestionIndex(currentQuestionIndex - 1);
            }
          }}
          onNext={() => {
            if (currentQuestionIndex < currentModuleTotalQuestions - 1) {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
            }
          }}
          canGoPrevious={currentQuestionIndex > 0}
          canGoNext={currentQuestionIndex < currentModuleTotalQuestions - 1}
          questionType="Central Ideas and Details"
          difficulty="보통"
        />
      </>
    );
  }

  // Show Review Mode
  if (gameState === 'review') {
    const getCorrectAnswer = (questionId: number) => {
      // Mock correct answers - in real app, this would come from a database
      if (questionId === 3) return 'c';
      if (questionId === 4) return 'b';
      if (questionId === 5) return 'b';
      return 'd'; // Default for demo
    };

    const correctAnswer = getCorrectAnswer(currentQuestion.id);
    const handleReviewPrevious = () => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    };

    const handleReviewNext = () => {
      if (currentQuestionIndex < currentModuleTotalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    };

    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                setGameState('score-report');
                setReviewMode(false);
              }}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Back to Score Report
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-base">SAT Reading Sentence Rhetorical Purpose Practice Pack | 2025version</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Passage */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto bg-white p-8">
            <h2 className="text-lg mb-4 text-gray-800">Reading and Writing: Question {currentQuestion.id}</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {currentQuestion.passage}
              </p>
            </div>
          </div>

          {/* Right Panel - Question with Review */}
          <div className="w-1/2 overflow-hidden">
            <ReviewQuestionPanel
              question={currentQuestion}
              selectedAnswer={selectedAnswers[currentQuestion.id]}
              correctAnswer={correctAnswer}
              onPrevious={handleReviewPrevious}
              onNext={handleReviewNext}
              hasNext={currentQuestionIndex < currentModuleTotalQuestions - 1}
              hasPrevious={currentQuestionIndex > 0}
              currentIndex={currentQuestionIndex}
              totalQuestions={currentModuleTotalQuestions}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show section 2 when time is up
  if (currentSection === 2) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Section 1 Complete</h2>
          <p className="text-gray-600 mb-4">Time has expired for Section 1.</p>
          <p className="text-gray-600">Section 2 will begin shortly...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <div className="h-screen flex flex-col bg-gray-50">
        <ExamHeader
          sectionTitle={`Section ${currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학') ? '2' : '1'}, Module ${currentModule}: ${currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학') ? 'Math' : 'Reading and Writing'}`}
          timeRemaining={formatTime(timeRemaining)}
          isHidden={isHidden}
          onToggleHide={handleToggleHide}
          onToggleHighlights={handleToggleHighlights}
          onSaveAndExit={handleSaveAndExit}
          isMathTest={currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학')}
          onOpenCalculator={() => setShowCalculator(!showCalculator)}
          onOpenReference={() => setShowReference(true)}
        />
        
        {/* Check if this is a Math test */}
        {currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학') ? (
          /* Math Layout - Full width, no passage panel */
          <>
            {/* Desktop Layout with Calculator */}
            <div className="flex-1 hidden md:flex overflow-hidden bg-white">
              {/* Calculator Panel - Positioned at top, expandable width */}
              {showCalculator && (
                <div 
                  className={`${calculatorExpanded ? 'w-[750px]' : 'w-[550px]'} h-full border-r border-gray-300 shadow-lg transition-all duration-300`}
                >
                  <CalculatorPanel 
                    onClose={() => setShowCalculator(false)}
                    onExpand={() => setCalculatorExpanded(!calculatorExpanded)}
                    isExpanded={calculatorExpanded}
                  />
                </div>
              )}
              
              {/* Question Panel */}
              <div className="flex-1 flex justify-center items-start overflow-hidden">
                <MathQuestionPanel
                  questionNumber={currentQuestionIndex + 1}
                  question={currentQuestion.question}
                  choices={currentQuestion.choices}
                  selectedAnswer={selectedAnswers[currentQuestionId] || ""}
                  onAnswerChange={handleAnswerChange}
                  isMarkedForReview={markedForReview[currentQuestionId] || false}
                  onToggleMarkForReview={handleToggleMarkForReview}
                  testInfo={currentTestInfo}
                  onShowVideoLecture={handleShowVideoLecture}
                  imageUrl={currentQuestion.imageUrl}
                  imageAlt={currentQuestion.imageAlt}
                />
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex-1 flex flex-col md:hidden bg-white">
              <MathQuestionPanel
                questionNumber={currentQuestionIndex + 1}
                question={currentQuestion.question}
                choices={currentQuestion.choices}
                selectedAnswer={selectedAnswers[currentQuestionId] || ""}
                onAnswerChange={handleAnswerChange}
                isMarkedForReview={markedForReview[currentQuestionId] || false}
                onToggleMarkForReview={handleToggleMarkForReview}
                testInfo={currentTestInfo}
                onShowVideoLecture={handleShowVideoLecture}
                imageUrl={currentQuestion.imageUrl}
                imageAlt={currentQuestion.imageAlt}
              />
            </div>
          </>
        ) : (
          /* Reading & Writing Layout - Split view with passage and question */
          <>
            {/* Desktop Layout */}
            <div className="flex-1 hidden md:flex">
              <Resizable
                size={{
                  width: `${panelWidth}%`,
                  height: "100%"
                }}
                minWidth="10%"
                maxWidth="90%"
                enable={{
                  top: false,
                  right: true,
                  bottom: false,
                  left: false,
                  topRight: false,
                  bottomRight: false,
                  bottomLeft: false,
                  topLeft: false
                }}
                onResizeStop={(e, direction, ref, d) => {
                  const newWidth = Math.max(10, Math.min(90, panelWidth + (d.width / window.innerWidth) * 100));
                  setPanelWidth(newWidth);
                  // Reset expansion state when manually resized
                  if (Math.abs(newWidth - 50) < 5) {
                    setIsExpanded(false);
                    setExpandDirection(null);
                    setPanelWidth(50);
                  }
                }}
                handleStyles={{
                  right: {
                    width: "60px",
                    right: "-30px",
                    background: "transparent",
                    cursor: "col-resize",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    zIndex: 10
                  }
                }}
                handleComponent={{
                  right: (
                    <div className="w-full h-full flex flex-col items-center relative">
                      {/* Vertical divider line */}
                      <div className="absolute inset-0 flex justify-center">
                        <div className="w-[2px] h-full bg-gray-300"></div>
                      </div>
                      {/* Top: Two circular expand buttons - SAT Bluebook coded style */}
                      <div className="relative mt-2 flex items-center z-10" style={{ gap: '4px' }}>
                        {/* Left expand button (Passage) - Always visible */}
                        <BluebookExpandButton
                          type={isExpanded && expandDirection === 'left' ? 'collapse' : 'expand'}
                          onClick={(e) => { e.stopPropagation(); handleExpandLeft(); }}
                          isExpanded={isExpanded && expandDirection === 'left'}
                          className="scale-[0.85]"
                          flipX={false}
                          flipY={false}
                        />
                        
                        {/* Right expand button (Questions) - Always visible */}
                        <BluebookExpandButton
                          type={isExpanded && expandDirection === 'right' ? 'collapse' : 'expand'}
                          onClick={(e) => { e.stopPropagation(); handleExpandRight(); }}
                          isExpanded={isExpanded && expandDirection === 'right'}
                          className="scale-[0.85]"
                          flipX={true}
                          flipY={false}
                        />
                      </div>
                      {/* Below: Black drag handle with diamond arrows - SAT Bluebook style */}
                      <div className="relative mt-28 w-[14px] h-[24px] bg-black rounded-[3px] flex flex-col items-center justify-center cursor-col-resize z-10 shadow-sm border border-gray-600/50">
                        <svg width="14" height="14" viewBox="0 0 18 18" fill="none" className="shrink-0">
                          <path d="M7 3 L2 9 L7 15" fill="white" />
                          <path d="M11 3 L16 9 L11 15" fill="white" />
                        </svg>
                      </div>
                    </div>
                  )
                }}
                className=""
              >
                <PassagePanel 
                  content={currentQuestion.passage}
                  highlightsMode={highlightsMode}
                  onExpandRight={handleExpandLeft}
                  isExpanded={isExpanded}
                  expandDirection={expandDirection}
                />
              </Resizable>
              
              <div className="flex-1">
                <QuestionPanel
                  questionNumber={currentQuestionIndex + 1}
                  question={currentQuestion.question}
                  choices={currentQuestion.choices}
                  selectedAnswer={selectedAnswers[currentQuestionId] || ""}
                  onAnswerChange={handleAnswerChange}
                  isMarkedForReview={markedForReview[currentQuestionId] || false}
                  onToggleMarkForReview={handleToggleMarkForReview}
                  onExpandLeft={handleExpandRight}
                  isExpanded={isExpanded}
                  expandDirection={expandDirection}
                  testInfo={currentTestInfo}
                  onShowVideoLecture={handleShowVideoLecture}
                  imageUrl={currentQuestion.imageUrl}
                  isPracticeReview={isPracticeReview}
                  correctAnswer={currentQuestion.correctAnswer}
                  explanation={currentQuestion.explanation}
                  passage={currentQuestion.passage}
                  onShowSimilarProblems={() => {
                    const typeLabel = currentQuestion.category || currentQuestion.trainingType || 'Central Ideas and Details';
                    const diffLabel = currentQuestion.difficulty || '중간';
                    const generated = [
                      {
                        id: 1,
                        passage: `Practice passage 1 for ${typeLabel} at ${diffLabel} difficulty. The author introduces a central claim, contrasts it with a weaker alternative, and supports the stronger interpretation with evidence.`,
                        question: 'Which choice best states the main idea of the passage?',
                        choices: [
                          { id: 'a', text: 'The author rejects the need for evidence in analysis.' },
                          { id: 'b', text: 'The author supports a stronger interpretation with evidence.' },
                          { id: 'c', text: 'The passage argues that all interpretations are equally valid.' },
                          { id: 'd', text: 'The passage focuses mainly on a historical timeline.' },
                        ],
                        correctAnswer: 'b',
                      },
                      {
                        id: 2,
                        passage: `Practice passage 2 for ${typeLabel} at ${diffLabel} difficulty. A researcher compares two explanations and concludes that the second explanation better matches the data.`,
                        question: 'Based on the passage, which statement is most accurate?',
                        choices: [
                          { id: 'a', text: 'The first explanation is fully confirmed by the data.' },
                          { id: 'b', text: 'Neither explanation relates to the evidence presented.' },
                          { id: 'c', text: 'The second explanation is better supported by the evidence.' },
                          { id: 'd', text: 'The passage recommends ignoring the available data.' },
                        ],
                        correctAnswer: 'c',
                      },
                      {
                        id: 3,
                        passage: `Practice passage 3 for ${typeLabel} at ${diffLabel} difficulty. The final sentence requires a transition that strengthens the logical progression.`,
                        question: 'Which of the following best completes the text with the most logical and precise word or phrase?',
                        choices: [
                          { id: 'a', text: 'nevertheless' },
                          { id: 'b', text: 'furthermore' },
                          { id: 'c', text: 'however' },
                          { id: 'd', text: 'instead' },
                        ],
                        correctAnswer: 'b',
                      },
                    ];
                    setSimilarQuestions(generated);
                    setSimilarProblemIndex(0);
                    setSimilarProblemAnswers({});
                    setShowSimilarResults({});
                    setSimilarFullscreenTab(null);
                    setShowSimilarOverlay(true);
                  }}
                />
              </div>
            </div>

            {/* Mobile Layout - Tabbed Passage/Questions like Bluebook app */}
            <div className="flex-1 flex flex-col md:hidden overflow-hidden">
              <MobileExamTabs
                passage={currentQuestion.passage}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
                question={currentQuestion.question}
                choices={currentQuestion.choices}
                selectedAnswer={selectedAnswers[currentQuestionId] || ""}
                onAnswerChange={handleAnswerChange}
                isMarkedForReview={markedForReview[currentQuestionId] || false}
                onToggleMarkForReview={handleToggleMarkForReview}
                testInfo={currentTestInfo}
                onShowVideoLecture={handleShowVideoLecture}
                imageUrl={currentQuestion.imageUrl}
                sectionLabel={currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학') ? 'Math' : 'Reading'}
                highlightsMode={highlightsMode}
                isPracticeReview={isPracticeReview}
                correctAnswer={currentQuestion.correctAnswer}
                explanation={currentQuestion.explanation}
                onShowSimilarProblems={() => {
                    const typeLabel = currentQuestion.category || currentQuestion.trainingType || 'Central Ideas and Details';
                    const diffLabel = currentQuestion.difficulty || '중간';
                    const generated = [
                      {
                        id: 1,
                        passage: `Practice passage 1 for ${typeLabel} at ${diffLabel} difficulty. The author introduces a central claim and supports the stronger interpretation with evidence.`,
                        question: 'Which choice best states the main idea of the passage?',
                        choices: [
                          { id: 'a', text: 'The author rejects the need for evidence in analysis.' },
                          { id: 'b', text: 'The author supports a stronger interpretation with evidence.' },
                          { id: 'c', text: 'The passage argues that all interpretations are equally valid.' },
                          { id: 'd', text: 'The passage focuses mainly on a historical timeline.' },
                        ],
                        correctAnswer: 'b',
                      },
                      {
                        id: 2,
                        passage: `Practice passage 2 for ${typeLabel} at ${diffLabel} difficulty. A researcher compares two explanations and concludes that the second better matches the data.`,
                        question: 'Based on the passage, which statement is most accurate?',
                        choices: [
                          { id: 'a', text: 'The first explanation is fully confirmed by the data.' },
                          { id: 'b', text: 'Neither explanation relates to the evidence presented.' },
                          { id: 'c', text: 'The second explanation is better supported by the evidence.' },
                          { id: 'd', text: 'The passage recommends ignoring the available data.' },
                        ],
                        correctAnswer: 'c',
                      },
                      {
                        id: 3,
                        passage: `Practice passage 3 for ${typeLabel} at ${diffLabel} difficulty. The final sentence requires a transition that strengthens the logical progression.`,
                        question: 'Which of the following best completes the text with the most logical and precise word or phrase?',
                        choices: [
                          { id: 'a', text: 'nevertheless' },
                          { id: 'b', text: 'furthermore' },
                          { id: 'c', text: 'however' },
                          { id: 'd', text: 'instead' },
                        ],
                        correctAnswer: 'b',
                      },
                    ];
                    setSimilarQuestions(generated);
                    setSimilarProblemIndex(0);
                    setSimilarProblemAnswers({});
                    setShowSimilarResults({});
                    setSimilarFullscreenTab(null);
                    setShowSimilarOverlay(true);
                }}
              />
            </div>
          </>
        )}
        
        <ExamNavigation
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={currentModuleTotalQuestions}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onShowOverview={handleShowOverview}
        />

        {/* Question Overview Modal */}
        {showOverview && (
          <QuestionOverview
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={currentModuleTotalQuestions}
            moduleQuestions={currentModuleQuestions}
            selectedAnswers={selectedAnswers}
            markedForReview={markedForReview}
            onQuestionSelect={handleQuestionSelect}
            onClose={() => setShowOverview(false)}
            currentModule={currentModule}
            testType={currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학') ? 'Math' : 'Reading and Writing'}
          />
        )}

        {/* Video Lecture Modal */}
        {showVideoModal && selectedVideoQuestion && (
          <VideoLectureModal
            isOpen={showVideoModal}
            onClose={() => {
              setShowVideoModal(false);
              setSelectedVideoQuestion(null);
            }}
            questionId={selectedVideoQuestion}
            testInfo={currentTestInfo}
            currentQuestion={currentQuestion}
          />
        )}

        {/* Similar Problems Overlay */}
        {showSimilarOverlay && similarQuestions.length > 0 && (() => {
          const simQ = similarQuestions[similarProblemIndex];
          const hasAnswered = showSimilarResults[similarProblemIndex];
          const userSimilarAnswer = similarProblemAnswers[similarProblemIndex]?.toUpperCase();
          const isCorrectAnswer = userSimilarAnswer === simQ.correctAnswer.toUpperCase();
          const completedCount = Object.keys(showSimilarResults).filter(k => showSimilarResults[parseInt(k)]).length;

          return (
            <div className="fixed inset-0 bg-purple-50 z-[60] flex flex-col">
              {/* Header */}
              <div className="border-b border-purple-300 px-6 py-4 flex items-center justify-between bg-purple-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowSimilarOverlay(false)}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-sm font-medium">뒤로가기</span>
                  </button>
                  <div className="h-4 w-px bg-gray-300" />
                  <h2 className="text-base text-gray-900">유형문제 연습 - 문제 {currentQuestionIndex + 1}번 기준</h2>
                </div>
                <button
                  onClick={() => setShowSimilarOverlay(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content - Split View */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Passage */}
                <div className="w-1/2 border-r border-purple-300 overflow-y-auto p-8 bg-purple-50">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    {similarQuestions.map((_: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSimilarProblemIndex(idx)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          similarProblemIndex === idx
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-200 text-purple-700 hover:bg-purple-300'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-800 leading-relaxed text-base">{simQ.passage}</p>
                  </div>
                </div>

                {/* Right Panel - Question */}
                <div className="w-1/2 overflow-y-auto p-8 bg-purple-100">
                  <div className="mb-6 space-y-3">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-xs text-purple-800">
                        <span className="font-semibold">유형:</span> {currentQuestion?.category || 'Central Ideas and Details'} |
                        <span className="font-semibold ml-2">난이도:</span> {currentQuestion?.difficulty || '중간'}
                      </p>
                      <p className="text-[10px] text-purple-700 mt-1">동일한 유형과 난이도의 문제 3개를 제공합니다.</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">문제 {similarProblemIndex + 1} / 3</span>
                      {hasAnswered && (
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${isCorrectAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {isCorrectAnswer ? '정답' : '오답'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">Q</div>
                      <p className="text-gray-900 text-base leading-relaxed">{simQ.question}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {simQ.choices.map((choice: any) => {
                      const choiceUpper = choice.id.toUpperCase();
                      const isCorrectChoice = simQ.correctAnswer.toUpperCase() === choiceUpper;
                      const isUserChoice = userSimilarAnswer === choiceUpper;
                      return (
                        <button
                          key={choice.id}
                          onClick={() => {
                            if (!hasAnswered) {
                              setSimilarProblemAnswers(prev => ({ ...prev, [similarProblemIndex]: choice.id }));
                            }
                          }}
                          disabled={hasAnswered}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-base text-left ${
                            hasAnswered
                              ? isCorrectChoice ? 'border-green-500 bg-green-50' : isUserChoice ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                              : isUserChoice ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30'
                          } ${hasAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-sm text-gray-700 font-medium">{choiceUpper}.</span>
                            <span className="text-sm text-gray-900 flex-1">{choice.text}</span>
                            {hasAnswered && isCorrectChoice && <span className="text-sm text-green-700 font-medium">✓ 정답</span>}
                            {hasAnswered && isUserChoice && !isCorrectChoice && <span className="text-sm text-red-700 font-medium">✗ 선택</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {hasAnswered && (
                    <div className={`p-4 rounded-lg text-base mb-6 ${isCorrectAnswer ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                      {isCorrectAnswer ? '정답입니다! 훌륭합니다.' : `오답입니다. 정답은 ${simQ.correctAnswer.toUpperCase()}입니다.`}
                    </div>
                  )}

                  {!hasAnswered && userSimilarAnswer && (
                    <div className="flex justify-center mb-6">
                      <button
                        onClick={() => setShowSimilarResults(prev => ({ ...prev, [similarProblemIndex]: true }))}
                        className="px-8 py-3 bg-purple-600 text-white rounded-lg text-base font-medium hover:bg-purple-700 transition-colors"
                      >
                        다음
                      </button>
                    </div>
                  )}

                  <div className="mb-6 text-center text-sm text-purple-600">
                    {completedCount} / 3 완료
                  </div>

                  {completedCount === 3 && (
                    <div className="flex justify-center mb-6">
                      <button
                        onClick={() => {
                          setSimilarProblemIndex(0);
                          setSimilarProblemAnswers({});
                          setShowSimilarResults({});
                          setShowSimilarOverlay(false);
                        }}
                        className="px-8 py-3 bg-purple-600 text-white rounded-lg text-base font-medium hover:bg-purple-700 transition-colors"
                      >
                        실전문제로 돌아가기
                      </button>
                    </div>
                  )}

                  {/* 탭 네비게이션 */}
                  <div className="border-t border-purple-200 pt-6">
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setSimilarFullscreenTab(similarFullscreenTab === 'translation' ? null : 'translation')}
                        className={`flex-1 px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                          similarFullscreenTab === 'translation' ? 'bg-white text-gray-900 border-2 border-gray-300' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ fontWeight: similarFullscreenTab === 'translation' ? '600' : '400' }}
                      >
                        <Globe className="h-4 w-4" />
                        해석
                      </button>
                      <button
                        onClick={() => setSimilarFullscreenTab(similarFullscreenTab === 'analysis' ? null : 'analysis')}
                        className={`flex-1 px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                          similarFullscreenTab === 'analysis' ? 'bg-white text-gray-900 border-2 border-gray-300' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ fontWeight: similarFullscreenTab === 'analysis' ? '600' : '400' }}
                      >
                        <SearchIcon className="h-4 w-4" />
                        해설
                      </button>
                      <button
                        onClick={() => setSimilarFullscreenTab(similarFullscreenTab === 'vocabulary' ? null : 'vocabulary')}
                        className={`flex-1 px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                          similarFullscreenTab === 'vocabulary' ? 'bg-white text-gray-900 border-2 border-gray-300' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ fontWeight: similarFullscreenTab === 'vocabulary' ? '600' : '400' }}
                      >
                        <BookOpen className="h-4 w-4" />
                        단어
                      </button>
                    </div>
                    {similarFullscreenTab && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5 min-h-[150px] max-h-[300px] overflow-y-auto">
                        {similarFullscreenTab === 'translation' ? (
                          <div className="text-sm text-gray-700 leading-relaxed">
                            <p className="mb-3">이 문제는 문맥에 맞는 적절한 단어를 선택하는 문제입니다.</p>
                            <p>정답은 <strong>{simQ.correctAnswer.toUpperCase()}</strong>입니다.</p>
                          </div>
                        ) : similarFullscreenTab === 'analysis' ? (
                          <div className="text-sm text-gray-700 leading-relaxed">
                            <p className="mb-3"><strong>문제 해설:</strong></p>
                            <p>정답은 <strong>{simQ.correctAnswer.toUpperCase()}</strong>입니다. 전체 문맥을 파악하고 분석해야 합니다.</p>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-700 leading-relaxed">
                            <p className="mb-3 font-semibold">핵심 어휘:</p>
                            <ul className="space-y-2 list-disc list-inside">
                              <li><strong>compelling</strong> - 설득력 있는</li>
                              <li><strong>acknowledge</strong> - 인정하다</li>
                              <li><strong>validity</strong> - 타당성</li>
                              <li><strong>ambiguous</strong> - 모호한</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Directions Modal */}
        <DirectionsModal
          isOpen={showDirections}
          onClose={() => setShowDirections(false)}
          isMathTest={currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학')}
        />

        {/* Reference Modal */}
        <ReferenceModal
          isOpen={showReference}
          onClose={() => setShowReference(false)}
        />
      </div>
      
      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </>
  );
}