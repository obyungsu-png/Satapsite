import { Button } from "./ui/button";
import { ChevronLeft, X, MessageCircle, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import historyEmptyImage from "figma:asset/5fda86ab59ab70ac4b90ec46b644ce1cd9e29092.png";
import { AdBannerDisplay, Advertisement } from './AdManagement';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  difficulty: string;
}

interface PracticeRecord {
  id: number;
  testTitle: string;
  date: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  duration: string;
  questions?: Question[];
  source?: '기출문제' | '공식문제' | '전문훈련';
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
}

// PracticeRecordCard Component with animation
function PracticeRecordCard({ 
  record, 
  index, 
  category,
  onViewQuestions 
}: { 
  record: PracticeRecord; 
  index: number; 
  category: string;
  onViewQuestions: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const incorrectCount = record.questions?.filter(q => !q.isCorrect).length || 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-lg transition-all duration-300"
      style={{
        backgroundColor: isHovered ? '#E8F5E9' : 'white',
        boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
      }}
      whileHover={{ scale: 1.01, y: -2 }}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-xs text-gray-500">{record.date}</span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-blue-600">{record.score}</span>
              <span className="text-xs text-gray-600">점</span>
            </div>
            <span className="text-xs text-gray-500">정답: {record.correctAnswers}/{record.totalQuestions}</span>
          </div>
        </div>

        <Button
          onClick={onViewQuestions}
          className="w-full py-2 rounded transition-colors text-sm"
          style={{ 
            backgroundColor: '#3D5AA1',
            color: '#FFFFFF'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2F4A85';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3D5AA1';
          }}
          size="sm"
          disabled={!record.questions || record.questions.length === 0}
        >
          {category === '틀린문제' ? '문제 다시보기 (AI 도움 포함)' : '문제 다시보기 (AI 도움 포함)'}
        </Button>
      </div>
    </motion.div>
  );
}

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
  advertisements
}: PracticeRecordProps) {
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [studentQuestionText, setStudentQuestionText] = useState('');
  const [studentQuestions, setStudentQuestions] = useState<StudentQuestion[]>([]);

  // Load student questions from localStorage
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
  // Use actual practice records or fallback to sample data
  const practiceRecordData: PracticeRecord[] = practiceRecords.length > 0 ? practiceRecords.map(record => ({
    id: parseInt(record.id) || Date.now(),
    testTitle: record.title || 'SAT Practice Test',
    date: record.date || new Date().toISOString().split('T')[0],
    score: record.score || 0,
    totalQuestions: record.totalQuestions || 0,
    correctAnswers: record.correctAnswers || 0,
    duration: record.time || '0분',
    questions: record.questions || [],
    source: record.source
  })) : [
    {
      id: 1,
      testTitle: "2025년 6월 제1회 독해문법",
      date: "2025-01-15",
      score: 85,
      totalQuestions: 27,
      correctAnswers: 23,
      duration: "32분",
      source: '기출문제',
      questions: [
        {
          id: 1,
          text: "The concept of sustainability has become increasingly important in modern business practices...",
          options: ["A) environmental", "B) economical", "C) technological", "D) social"],
          correctAnswer: "A",
          userAnswer: "A",
          isCorrect: true,
          difficulty: "중간"
        },
        {
          id: 2,
          text: "Climate change represents one of the most pressing challenges facing humanity today...",
          options: ["A) represents", "B) challenging", "C) humanity", "D) today"],
          correctAnswer: "B",
          userAnswer: "A",
          isCorrect: false,
          difficulty: "어려움"
        },
        {
          id: 3,
          text: "The development of renewable energy sources has accelerated significantly in recent years...",
          options: ["A) development", "B) renewable", "C) accelerated", "D) significantly"],
          correctAnswer: "C",
          userAnswer: "C",
          isCorrect: true,
          difficulty: "쉬움"
        },
        {
          id: 4,
          text: "Economic inequality has been a persistent issue in many developed countries...",
          options: ["A) persistent", "B) issue", "C) developed", "D) countries"],
          correctAnswer: "A",
          userAnswer: "B",
          isCorrect: false,
          difficulty: "중간"
        },
        {
          id: 5,
          text: "Technological innovation continues to reshape the landscape of modern education...",
          options: ["A) innovation", "B) continues", "C) reshape", "D) landscape"],
          correctAnswer: "D",
          userAnswer: "D",
          isCorrect: true,
          difficulty: "중간"
        }
      ]
    },
    {
      id: 2,
      testTitle: "2025년 6월 제2회 수학",
      date: "2025-01-10",
      score: 78,
      totalQuestions: 22,
      correctAnswers: 17,
      duration: "28분",
      source: '공식문제',
      questions: [
        {
          id: 1,
          text: "If 2x + 3 = 11, what is the value of x?",
          options: ["A) 2", "B) 3", "C) 4", "D) 5"],
          correctAnswer: "C",
          userAnswer: "B",
          isCorrect: false,
          difficulty: "쉬움"
        }
      ]
    }
  ];

  // Find selected record for detailed view
  const selectedRecord = practiceRecordData.find(record => record.id === selectedQuestion?.recordId);
  
  if (selectedQuestion && selectedRecord) {
    const currentQuestionIndex = selectedRecord.questions?.findIndex(q => q.id === selectedQuestion.id) || 0;
    const currentQuestionData = selectedRecord.questions?.[currentQuestionIndex];
    
    if (!currentQuestionData) return null;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => setSelectedQuestion(null)}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              연습기록으로 돌아가기
            </Button>
            <div>
              <h1 className="text-xl font-medium text-gray-800">{selectedRecord.testTitle}</h1>
              <p className="text-sm text-gray-600">문제 {currentQuestionIndex + 1} / {selectedRecord.questions?.length || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">문제 {currentQuestionIndex + 1}</span>
                  {currentQuestionData.isCorrect ? (
                    <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">✗</span>
                  )}
                  <span className={`text-sm px-2 py-1 rounded ${currentQuestionData.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {currentQuestionData.isCorrect ? '정답' : '오답'}
                  </span>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-800 leading-relaxed mb-4">
                    {currentQuestionData.text}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-2 mb-6">
                  {currentQuestionData.options.map((option, index) => {
                    const isCorrectOption = option.startsWith(currentQuestionData.correctAnswer);
                    const isUserAnswer = option.startsWith(currentQuestionData.userAnswer);
                    
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          isCorrectOption 
                            ? 'bg-green-50 border-green-200 text-green-800' 
                            : isUserAnswer && !currentQuestionData.isCorrect
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCorrectOption && <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</span>}
                          {isUserAnswer && !currentQuestionData.isCorrect && <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">✗</span>}
                          <span>{option}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Help and Question Form for 기출문제, 공식문제, and 틀린문제 */}
                {(practiceRecordCategory === '기출문제' || practiceRecordCategory === '공식문제' || practiceRecordCategory === '틀린문제') && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Button
                        onClick={() => setShowAIHelp(!showAIHelp)}
                        className="flex items-center gap-2"
                        variant="outline"
                      >
                        🧠 AI 도움
                        {showAIHelp ? <X className="h-3 w-3" /> : null}
                      </Button>
                      <Button
                        onClick={() => setShowQuestionForm(!showQuestionForm)}
                        className="flex items-center gap-2"
                        variant="outline"
                      >
                        <MessageCircle className="h-4 w-4" />
                        질문하기
                        {showQuestionForm ? <X className="h-3 w-3" /> : null}
                      </Button>
                    </div>
                    
                    {showAIHelp && (
                      <div className={`rounded-lg p-4 border ${
                        practiceRecordCategory === '틀린문제' 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <h4 className={`font-medium mb-2 ${
                          practiceRecordCategory === '틀린문제' 
                            ? 'text-red-800' 
                            : 'text-blue-800'
                        }`}>
                          💡 AI 도움 {practiceRecordCategory === '틀린문제' ? '- 틀린문제 집중 분석' : ''}
                        </h4>
                        <div className={`space-y-2 text-sm ${
                          practiceRecordCategory === '틀린문제' 
                            ? 'text-red-700' 
                            : 'text-blue-700'
                        }`}>
                          <p><strong>해설:</strong> 이 문제는 문맥상 적절한 단어를 찾는 어휘 문제입니다.</p>
                          <p><strong>풀이 방법:</strong> 앞뒤 문맥을 통해 빈칸에 들어갈 가장 적절한 단어를 선택해야 합니다.</p>
                          {!currentQuestionData.isCorrect && (
                            <>
                              <p><strong>오답 이유:</strong> 선택한 답안 '{currentQuestionData.userAnswer}'은(는) 문맥에 맞지 않습니다. 정답 '{currentQuestionData.correctAnswer}' 옵션이 문맥상 더 적절합니다.</p>
                              {practiceRecordCategory === '틀린문제' && (
                                <div className="bg-red-100 rounded p-3 mt-3">
                                  <p><strong>🎯 복습 포인트:</strong></p>
                                  <ul className="list-disc list-inside space-y-1 mt-1">
                                    <li>비슷한 의미의 단어들 간의 미묘한 차이점을 파악하세요</li>
                                    <li>문맥의 전체적인 논조와 방향성을 고려하세요</li>
                                    <li>같은 유형의 문제를 더 풀어보며 패턴을 익히세요</li>
                                  </ul>
                                </div>
                              )}
                            </>
                          )}
                          <p><strong>학습 포인트:</strong> 이와 같은 유형의 문제를 더 연습하시려면 {
                            practiceRecordCategory === '틀린문제' 
                              ? '스마트 연습에서 어휘 문제 섹션을 집중적으로 학습해보세요' 
                              : '어휘 문제 섹션을 확인해보세요'
                          }.</p>
                        </div>
                      </div>
                    )}

                    {/* Student Question Form */}
                    {showQuestionForm && (
                      <div className={`rounded-lg p-4 border mt-4 ${
                        practiceRecordCategory === '틀린문제' 
                          ? 'bg-orange-50 border-orange-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <h4 className={`font-medium mb-3 ${
                          practiceRecordCategory === '틀린문제' 
                            ? 'text-orange-800' 
                            : 'text-gray-800'
                        }`}>
                          <MessageCircle className="h-4 w-4 inline mr-2" />
                          질문하기 - 문제 {currentQuestionIndex + 1}번
                        </h4>
                        
                        {/* Previous Questions for this problem */}
                        {studentQuestions.filter(q => 
                          q.questionId === selectedQuestion.id && q.recordId === selectedQuestion.recordId
                        ).length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-600 mb-2">이전 질문들:</h5>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {studentQuestions
                                .filter(q => q.questionId === selectedQuestion.id && q.recordId === selectedQuestion.recordId)
                                .map((q) => (
                                <div key={q.id} className="bg-white rounded p-2 text-sm border">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-gray-600">{new Date(q.timestamp).toLocaleString('ko-KR')}</span>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      q.status === 'answered' 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {q.status === 'answered' ? '답변완료' : '답변대기'}
                                    </span>
                                  </div>
                                  <p className="text-gray-800 mb-2">Q: {q.studentQuestion}</p>
                                  {q.adminAnswer && (
                                    <div className="border-t pt-2">
                                      <p className="text-blue-700 text-sm">A: {q.adminAnswer}</p>
                                      <span className="text-xs text-gray-500">
                                        답변시간: {q.adminAnswerTime ? new Date(q.adminAnswerTime).toLocaleString('ko-KR') : ''}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* New Question Form */}
                        <div className="space-y-3">
                          <textarea
                            value={studentQuestionText}
                            onChange={(e) => setStudentQuestionText(e.target.value)}
                            placeholder="이 문제에 대해 궁금한 점을 질문해주세요..."
                            className="w-full p-3 border border-gray-300 rounded-md resize-none text-sm"
                            rows={3}
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              💡 관리자가 답변을 확인하고 답변드립니다.
                            </p>
                            <Button
                              onClick={() => {
                                if (studentQuestionText.trim() && selectedQuestion) {
                                  const newQuestion: StudentQuestion = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    questionId: selectedQuestion.id,
                                    recordId: selectedQuestion.recordId,
                                    studentQuestion: studentQuestionText.trim(),
                                    timestamp: new Date().toISOString(),
                                    status: 'pending'
                                  };
                                  setStudentQuestions(prev => [...prev, newQuestion]);
                                  setStudentQuestionText('');
                                  
                                  // Store in localStorage for persistence
                                  const stored = localStorage.getItem('studentQuestions') || '[]';
                                  const existingQuestions = JSON.parse(stored);
                                  localStorage.setItem('studentQuestions', JSON.stringify([...existingQuestions, newQuestion]));
                                }
                              }}
                              disabled={!studentQuestionText.trim()}
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                              size="sm"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              질문 전송
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Question Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">문제 목록</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedRecord.questions?.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => setSelectedQuestion({ ...question, recordId: selectedRecord.id })}
                      className={`w-full text-left p-2 rounded text-sm flex items-center justify-between ${
                        selectedQuestion.id === question.id
                          ? 'bg-blue-50 border border-blue-200 text-blue-800'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <span>문제 {index + 1}</span>
                      <div className="flex items-center gap-1">
                        {question.isCorrect ? (
                          <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        ) : (
                          <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        )}
                      </div>
                    </button>
                  )) || []}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter questions based on category
  const getFilteredRecords = () => {
    // Use actual practiceRecords passed from props instead of hardcoded data
    let filtered = practiceRecords || [];
    
    if (practiceRecordCategory === '기출문제') {
      filtered = practiceRecords.filter(record => 
        record.source === '기출문제'
      );
    } else if (practiceRecordCategory === '공식문제') {
      filtered = practiceRecords.filter(record => 
        record.source === '공식문제'
      );
    } else if (practiceRecordCategory === 'Training') {
      filtered = practiceRecords.filter(record => 
        record.source === '전문훈련'
      );
    } else if (practiceRecordCategory === '틀린문제') {
      // Show only records that have incorrect questions for wrong answer practice
      filtered = practiceRecords.filter(record => 
        record.questions && record.questions.some(q => !q.isCorrect)
      );
    }
    
    return filtered;
  };

  const filteredRecords = getFilteredRecords();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#1e3a8a' }}>
        {/* Decorative circles */}
        <div className="absolute top-6 left-12 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: '#60a5fa' }}></div>
        <div className="absolute bottom-6 right-12 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: '#60a5fa' }}></div>
        
        <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">SAT Practice History</h1>
          <p className="text-sm md:text-base text-blue-100 text-center">Your Path to Success</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Advertisement Banner */}
        {advertisements && <AdBannerDisplay advertisements={advertisements} location="history" />}

        {/* Category Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setPracticeRecordCategory('기출문제')}
              className={`px-6 py-3 text-sm font-medium ${
                practiceRecordCategory === '기출문제'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              기출문제
            </button>
            <button
              onClick={() => setPracticeRecordCategory('공식문제')}
              className={`px-6 py-3 text-sm font-medium ${
                practiceRecordCategory === '공식문제'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              공식문제
            </button>
            <button
              onClick={() => setPracticeRecordCategory('Training')}
              className={`px-6 py-3 text-sm font-medium ${
                practiceRecordCategory === 'Training'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Training
            </button>
            <button
              onClick={() => setPracticeRecordCategory('틀린문제')}
              className={`px-6 py-3 text-sm font-medium ${
                practiceRecordCategory === '틀린문제'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              틀린문제
            </button>
          </div>
        </div>

        {/* Records Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {filteredRecords.map((record, index) => (
            <PracticeRecordCard
              key={record.id}
              record={record}
              index={index}
              category={practiceRecordCategory}
              onViewQuestions={() => {
                if (record.questions && record.questions.length > 0) {
                  if (practiceRecordCategory === '틀린문제') {
                    // Find first incorrect question
                    const firstIncorrect = record.questions.find(q => !q.isCorrect);
                    if (firstIncorrect) {
                      setSelectedQuestion({ ...firstIncorrect, recordId: record.id });
                    }
                  } else {
                    setSelectedQuestion({ ...record.questions[0], recordId: record.id });
                  }
                }
              }}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredRecords.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4">
              <img src={historyEmptyImage} alt="No records" className="w-full h-full object-contain" />
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              {practiceRecordCategory === '틀린문제'
                ? '복습할 틀린 문제가 없습니다'
                : `${practiceRecordCategory} 기록이 없습니다`
              }
            </h3>
            <p className="text-sm text-gray-400">
              {practiceRecordCategory === '틀린문제'
                ? '모든 문제를 정확히 풀었습니다! 완벽한 성과입니다.'
                : '테스트를 완료하면 여기에서 결과를 확인할 수 있습니다.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}