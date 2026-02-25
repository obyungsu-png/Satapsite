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
import { X, Bookmark } from "lucide-react";
import { Download } from "lucide-react";
import { mathQuestions } from "./mathQuestions";

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

// Save practice records to localStorage
const savePracticeRecords = (records: any[]) => {
  try {
    localStorage.setItem('practiceRecords', JSON.stringify(records));
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
      choices: [
        { id: "a", text: "It introduces previous findings that suggested a research method for Cruikshank and his team." },
        { id: "b", text: "It implies that the research team eliminated an alternative explanation for the crater based on available evidence." },
        { id: "c", text: "It emphasizes the importance of the New Horizons space probe to researchers." },
        { id: "d", text: "It identifies a misconception that the researchers had about the crater when they were first studying the data." }
      ]
    }
  ];

  const questions = [];
  for (let i = 1; i <= 27; i++) {
    if (i === 3 || i === 4 || i === 5) {
      questions.push(baseQuestions.find(q => q.id === i)!);
    } else {
      questions.push({
        id: i,
        passage: `Sample passage for question ${i}. This is a placeholder passage that would contain the reading material for this question.`,
        question: `Question ${i}: Which choice completes the text with the most logical and precise word or phrase?`,
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
  const [showDirections, setShowDirections] = useState(false); // Directions modal state
  const [panelWidth, setPanelWidth] = useState(50); // Panel width percentage
  const [expandDirection, setExpandDirection] = useState<'left' | 'right' | null>(null); // Expansion direction
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
  const totalQuestions = questions.length;

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionId = currentQuestion?.id || 1;

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
        setTimeRemaining(32 * 60); // Reset timer for Module 2
        setGameState('exam');
      } else if (currentModule === 2) {
        // All modules completed - go to finished screen
        setGameState('finished');
        
        // Save practice record when test is completed
        if (currentTestInfo) {
          const newRecord = {
            id: Date.now().toString(),
            title: currentTestInfo.title || 'SAT Practice Test',
            type: currentTestInfo.type || '독해문법',
            source: currentTestInfo.source || '기출문제',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            totalQuestions: totalQuestions * 2, // Module 1 + Module 2
            answeredQuestions: Object.keys(selectedAnswers).length,
            correctAnswers: 0, // Will be calculated in score report
            score: 0, // Will be calculated in score report
            difficulty: currentTestInfo.difficulty,
            trainingType: currentTestInfo.trainingType,
            questionCount: currentTestInfo.questionCount,
            answers: selectedAnswers,
            markedForReview: markedForReview
          };
          
          const updatedRecords = [newRecord, ...practiceRecords];
          setPracticeRecords(updatedRecords);
          savePracticeRecords(updatedRecords);
        }
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [gameState, currentModule, currentTestInfo, selectedAnswers, markedForReview, totalQuestions]);

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
      setPanelWidth(70);
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
      setPanelWidth(30);
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

  const handleStartTest = (testInfo?: any) => {
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
    
    // Check if testInfo has uploaded data
    if (testInfo?.uploadedData && Array.isArray(testInfo.uploadedData) && testInfo.uploadedData.length > 0) {
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
    
    if (currentQuestionIndex < questions.length - 1) {
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
      toast.success('진행 상황이 저장되었습니다. 나중에 계속할 수 있습니다.');
      
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
    return <Dashboard onStartTest={handleStartTest} learnedWords={learnedWords} practiceRecords={practiceRecords} />;
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
        <div className="bg-white px-10 py-4 flex items-center justify-between" style={{ borderBottom: '2px dotted #999' }}>
          <div className="flex items-center gap-3">
            <h1 style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>Section 2, Module 1: Math</h1>
            <button className="px-3 py-1 text-xs" style={{ border: '1px solid #999', borderRadius: '4px', background: 'white' }}>
              Directions
            </button>
          </div>
          <div className="flex items-center gap-6">
            <span style={{ fontSize: '15px', fontWeight: '600' }}>{formatTime(timeRemaining)}</span>
            <button className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded text-sm">Hide</button>
            <button className="p-1.5"><span style={{ fontSize: '18px' }}>🖩</span></button>
            <button className="p-1.5"><span style={{ fontSize: '18px' }}>📖</span></button>
            <button className="p-1.5"><span style={{ fontSize: '18px' }}>⋮</span></button>
          </div>
        </div>

        <div className="flex-1 flex items-start justify-center pt-8">
          <div className="bg-white rounded-lg shadow-lg p-12 max-w-5xl w-full mx-6" style={{ marginTop: '10px' }}>
            <h2 className="text-center mb-8" style={{ fontSize: '36px', color: '#555', fontWeight: '500' }}>Check Your Work</h2>
            
            <div className="mb-8 text-center space-y-2">
              <p className="text-base text-gray-700">On test day, you won't be able to move on to the next module until time expires.</p>
              <p className="text-base text-gray-700">For these practice questions, you can click <strong>Next</strong> when you're ready to move on.</p>
            </div>

            <div className="bg-white rounded-lg p-8 mb-8" style={{ border: '1px solid #ddd' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#333' }}>Section 2, Module 1: Math Questions</h3>
                <div className="flex items-center gap-5 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-dashed border-gray-500 rounded-sm bg-white"></span>
                    <span style={{ color: '#666' }}>Unanswered</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-red-600 fill-red-600" />
                    <span style={{ color: '#666' }}>For Review</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                {Array.from({ length: 27 }, (_, i) => {
                  const questionNum = i + 1;
                  const isAnswered = selectedAnswers[questionNum];
                  const isMarked = markedForReview[questionNum];
                  
                  return (
                    <button
                      key={questionNum}
                      onClick={() => {
                        setGameState('exam');
                        handleQuestionSelect(questionNum);
                      }}
                      className={`
                        py-3 rounded border-2 border-dashed transition-colors flex items-center justify-center
                        ${isMarked 
                          ? 'bg-red-500 border-red-500 text-white' 
                          : isAnswered 
                            ? 'border-blue-600 bg-white'
                            : 'border-gray-400 bg-white hover:bg-gray-50'
                        }
                      `}
                      style={{ 
                        fontWeight: '600',
                        fontSize: '15px',
                        color: isMarked ? 'white' : isAnswered ? '#0066CC' : '#666'
                      }}
                    >
                      {questionNum}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                onClick={handleCheckWorkBack}
                className="px-8 py-2.5 text-white rounded-full"
                style={{ backgroundColor: '#0066CC', fontWeight: '600', fontSize: '15px' }}
              >
                Back
              </Button>
              <Button
                onClick={handleCheckWorkNext}
                className="px-8 py-2.5 text-white rounded-full"
                style={{ backgroundColor: '#0066CC', fontWeight: '600', fontSize: '15px' }}
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
            if (currentQuestionIndex < questions.length - 1) {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
            }
          }}
          canGoPrevious={currentQuestionIndex > 0}
          canGoNext={currentQuestionIndex < questions.length - 1}
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
      if (currentQuestionIndex < questions.length - 1) {
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
              hasNext={currentQuestionIndex < questions.length - 1}
              hasPrevious={currentQuestionIndex > 0}
              currentIndex={currentQuestionIndex}
              totalQuestions={questions.length}
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
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="h-screen flex flex-col bg-gray-50">
        <ExamHeader
          sectionTitle={`Section 1, Module ${currentModule}: ${currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학') ? 'Math' : 'Reading and Writing'}`}
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
                  questionNumber={currentQuestionId}
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
                questionNumber={currentQuestionId}
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
                minWidth="20%"
                maxWidth="70%"
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
                  const newWidth = Math.max(20, Math.min(70, panelWidth + (d.width / window.innerWidth) * 100));
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
                    width: "9px",
                    right: "-4.5px",
                    background: "linear-gradient(to right, transparent 4px, #d1d5db 4px, #d1d5db 6px, transparent 6px)",
                    cursor: "col-resize",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }
                }}
                handleComponent={{
                  right: (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-1 h-16 bg-gray-900 rounded-sm shadow-lg" style={{ boxShadow: '0 0 0 2px #374151' }}></div>
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
                  questionNumber={currentQuestionId}
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
                />
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex-1 flex flex-col md:hidden">
              <div className="flex-1">
                <PassagePanel 
                  content={currentQuestion.passage}
                  highlightsMode={highlightsMode}
                  onExpandRight={handleExpandLeft}
                  isExpanded={isExpanded}
                  expandDirection={expandDirection}
                />
              </div>
              
              <div className="flex-1">
                <QuestionPanel
                  questionNumber={currentQuestionId}
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
                />
              </div>
            </div>
          </>
        )}
        
        <ExamNavigation
          currentQuestion={currentQuestionId}
          totalQuestions={totalQuestions}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onShowOverview={handleShowOverview}
        />

        {/* Question Overview Modal */}
        {showOverview && (
          <QuestionOverview
            currentQuestion={currentQuestionId}
            totalQuestions={totalQuestions}
            selectedAnswers={selectedAnswers}
            markedForReview={markedForReview}
            onQuestionSelect={handleQuestionSelect}
            onClose={() => setShowOverview(false)}
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
          />
        )}

        {/* Directions Modal */}
        <DirectionsModal
          isOpen={showDirections}
          onClose={() => setShowDirections(false)}
          isMathTest={(() => {
            const isMath = currentTestInfo?.type === 'Math' || currentTestInfo?.title?.includes('수학');
            console.log('App.tsx - currentTestInfo:', currentTestInfo);
            console.log('App.tsx - isMath:', isMath);
            return isMath;
          })()}
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