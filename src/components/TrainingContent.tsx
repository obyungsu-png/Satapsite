import { Target, BookOpen, BarChart3, Lock } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { AdBannerDisplay, Advertisement } from './AdManagement';

interface TrainingContentProps {
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  trainingSource: string;
  setTrainingSource: (source: string) => void;
  trainingAttemptFilter: string;
  setTrainingAttemptFilter: (filter: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  selectedQuestionCount: string;
  setSelectedQuestionCount: (count: string) => void;
  answerDisplayMode: string;
  setAnswerDisplayMode: (mode: string) => void;
  onStartTest: (testInfo: any) => void;
  onNavigateToPricing?: () => void;
  isUnlocked?: boolean;
  advertisements?: Advertisement[];
  uploadedFiles?: Array<{
    id: string;
    name: string;
    type: string;
    location: string;
    subcategory: string;
    questionType?: string;
    difficulty?: string;
    uploadDate: string;
    status: 'completed' | 'processing' | 'failed';
    questionCount?: number;
    data?: any;
  }>;
}

export function TrainingContent({
  selectedSubject,
  setSelectedSubject,
  trainingSource,
  setTrainingSource,
  trainingAttemptFilter,
  setTrainingAttemptFilter,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedQuestionCount,
  setSelectedQuestionCount,
  answerDisplayMode,
  setAnswerDisplayMode,
  onStartTest,
  onNavigateToPricing,
  isUnlocked,
  advertisements = [],
  uploadedFiles = []
}: TrainingContentProps) {
  
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  
  // Question types by subject
  const questionTypesBySubject: { [key: string]: any[] } = {
    '독해': [
      { id: 'central-ideas', name: 'Central Ideas and Details', icon: Target },
      { id: 'evidence-textual', name: 'Command of Evidence (Textual)', icon: BookOpen },
      { id: 'evidence-quantitative', name: 'Command of Evidence (Quantitative)', icon: BarChart3 },
      { id: 'inferences', name: 'Inferences', icon: BookOpen },
      { id: 'words-context', name: 'Words in Context', icon: BookOpen },
      { id: 'text-structure', name: 'Text Structure and Purpose', icon: Target },
      { id: 'cross-text', name: 'Cross-Text Connections', icon: BookOpen }
    ],
    '문법': [
      { id: 'punctuation', name: 'Punctuation Marks', icon: BookOpen },
      { id: 'sentence-connection', name: 'Sentence Connection', icon: BookOpen },
      { id: 'verb-practice', name: 'Verb Practice', icon: BookOpen },
      { id: 'nouns-pronouns', name: 'Nouns, Pronouns', icon: Target },
      { id: 'adjectives', name: 'Adjectives', icon: BookOpen },
      { id: 'attributive-adverbial', name: 'Attributive, Adverbial', icon: BookOpen },
      { id: 'appositive', name: 'Appositive', icon: BarChart3 },
      { id: 'transition', name: 'Transition', icon: BookOpen },
      { id: 'rhetorical-synthesis', name: 'Rhetorical Synthesis', icon: BookOpen }
    ],
    '수학': [
      { id: 'basic-operations', name: 'Basic Operations', icon: BookOpen },
      { id: 'linear-functions', name: 'Linear Functions', icon: BookOpen },
      { id: 'quadratic-functions', name: 'Quadratic Functions', icon: Target },
      { id: 'exponential-functions', name: 'Exponential Functions', icon: BookOpen },
      { id: 'word-problems', name: 'Word Problems', icon: BookOpen },
      { id: 'geometry', name: 'Geometry', icon: Target },
      { id: 'circles', name: 'Circles', icon: BookOpen },
      { id: 'trigonometric-functions', name: 'Trigonometric Functions', icon: BookOpen },
      { id: 'statistics', name: 'Statistics', icon: BarChart3 },
      { id: 'data-analysis', name: 'Data Analysis', icon: BarChart3 },
      { id: 'basic-functions', name: 'Basic Functions', icon: BookOpen }
    ]
  };

  // Filter uploaded files for training based on selected subject
  const getUploadedTrainingFiles = () => {
    const subjectMap: {[key: string]: string} = {
      '독해': 'reading',
      '문법': 'grammar',
      '수학': 'math'
    };
    
    return uploadedFiles.filter(file => 
      file && file.location && file.subcategory && file.status &&
      file.location === '전문 훈련' && 
      file.subcategory === subjectMap[selectedSubject] &&
      file.status === 'completed'
    );
  };

  // Combine default question types with uploaded files
  const uploadedTrainingQuestions = getUploadedTrainingFiles();
  const baseQuestionTypes = questionTypesBySubject[selectedSubject] || questionTypesBySubject['독해'];
  
  // Create question type objects from uploaded files
  const uploadedQuestionTypes = uploadedTrainingQuestions.map(file => ({
    id: `uploaded-${file.id}`,
    name: file.name,
    icon: Target,
    isUploaded: true,
    uploadedData: file.data,
    difficulty: file.difficulty,
    questionType: file.questionType
  }));
  
  const questionTypes = [...baseQuestionTypes, ...uploadedQuestionTypes];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#1e3a8a' }}>
        {/* Decorative circles */}
        <div className="absolute top-6 left-12 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: '#60a5fa' }}></div>
        <div className="absolute bottom-6 right-12 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: '#60a5fa' }}></div>
        
        <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">SAT Training</h1>
          <p className="text-sm md:text-base text-blue-100 text-center">Your Path to Success</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Advertisement Banner - At Top */}
        <div className="mb-6">
          <AdBannerDisplay advertisements={advertisements} location="training" />
        </div>

        {/* 1. 과목 선택 탭 (Subject Selection Tabs) */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setSelectedSubject('독해')}
              className={`px-6 py-3 text-sm transition-colors rounded-t-lg ${
                selectedSubject === '독해'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={selectedSubject === '독해' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              독해
            </button>
            <button
              onClick={() => setSelectedSubject('문법')}
              className={`px-6 py-3 text-sm transition-colors rounded-t-lg ${
                selectedSubject === '문법'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={selectedSubject === '문법' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              문법
            </button>
            <button
              onClick={() => setSelectedSubject('수학')}
              className={`px-6 py-3 text-sm transition-colors rounded-t-lg ${
                selectedSubject === '수학'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={selectedSubject === '수학' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              수학
            </button>
          </div>
        </div>

        {/* 2. 카드 섹션 (Question Types Grid) */}
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
            {questionTypes.map((type, index) => {
              const IconComponent = type.icon;
              const isHovered = hoveredCard === type.id;
              const isSelected = selectedCard === type.id;
              const isLocked = !isUnlocked && index >= 3; // Lock from 4th card onwards if not unlocked
              
              return (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: isSelected ? -5 : 0
                  }}
                  transition={{ 
                    duration: 0.3,
                    y: {
                      duration: 0.6,
                      repeat: isSelected && !isLocked ? Infinity : 0,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }
                  }}
                  onClick={() => !isLocked && setSelectedCard(type.id)}
                  onMouseEnter={() => setHoveredCard(type.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`rounded-xl transition-all duration-300 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'} relative`}
                  style={{
                    backgroundColor: isLocked ? '#f5f5f5' : isSelected ? '#E8EAF6' : isHovered ? '#E8EAF6' : '#F5F5F5',
                    boxShadow: isSelected && !isLocked
                      ? '0 8px 24px rgba(61, 90, 161, 0.25)' 
                      : isHovered && !isLocked
                        ? '0 4px 16px rgba(0,0,0,0.12)' 
                        : '0 2px 8px rgba(0,0,0,0.08)',
                    border: isSelected && !isLocked ? '1px solid rgba(61, 90, 161, 0.3)' : '1px solid transparent',
                    opacity: isLocked ? 0.6 : 1
                  }}
                  whileHover={{ scale: isLocked ? 1 : 1.05, y: isLocked ? 0 : isSelected ? -8 : -3 }}
                  whileTap={{ scale: isLocked ? 1 : 0.98 }}
                >
                  <div className="p-4 flex flex-col items-center justify-center">
                    <motion.div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                      style={{ backgroundColor: isLocked ? '#d1d5db' : isSelected ? 'white' : '#E8EAF6' }}
                      animate={{
                        scale: isSelected && !isLocked ? [1, 1.1, 1] : 1
                      }}
                      transition={{
                        duration: 2,
                        repeat: isSelected && !isLocked ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                    >
                      {isLocked ? (
                        <Lock 
                          className="w-6 h-6" 
                          style={{ color: '#6b7280' }} 
                        />
                      ) : (
                        <IconComponent 
                          className="w-6 h-6" 
                          style={{ color: '#3D5AA1' }} 
                        />
                      )}
                    </motion.div>
                    <span 
                      className="text-xs text-center transition-colors duration-300"
                      style={{ 
                        color: isLocked ? '#6b7280' : isSelected ? '#3D5AA1' : isHovered ? '#3D5AA1' : '#000',
                        fontWeight: isSelected && !isLocked ? 800 : 700
                      }}
                    >
                      {type.name}
                    </span>
                    
                    {/* Unlock Button Overlay */}
                    {isLocked && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateToPricing) {
                            onNavigateToPricing();
                          }
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm" style={{ backgroundColor: '#D4EDFF', color: '#3D5AA1', fontWeight: 700 }}>
                          <Lock size={16} />
                          Unlock Now
                        </div>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 3. 문제 출처 (Question Source) */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-800 mb-3">문제 출처:</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setTrainingSource('전체')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                trainingSource === '전체'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={trainingSource === '전체' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              전체
            </button>
            <button
              onClick={() => setTrainingSource('기출문제')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                trainingSource === '기출문제'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={trainingSource === '기출문제' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              기출문제
            </button>
            <button
              onClick={() => setTrainingSource('공식문제')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                trainingSource === '공식문제'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={trainingSource === '공식문제' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              공식문제
            </button>
            <button
              onClick={() => setTrainingSource('Question Bank 전용')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                trainingSource === 'Question Bank 전용'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={trainingSource === 'Question Bank 전용' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              Question Bank 전용
            </button>
          </div>
        </div>

        {/* 4. 연습 유형 (Question Practice Type) */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-800 mb-3">연습 유형:</h3>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setTrainingAttemptFilter('전체')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                trainingAttemptFilter === '전체'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={trainingAttemptFilter === '전체' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              전체
            </button>
            <button
              onClick={() => setTrainingAttemptFilter('미연습')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                trainingAttemptFilter === '미연습'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={trainingAttemptFilter === '미연습' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              미연습 문제
            </button>
            <button
              onClick={() => setTrainingAttemptFilter('한 번 틀린 문제')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                trainingAttemptFilter === '한 번 틀린 문제'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={trainingAttemptFilter === '한 번 틀린 문제' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              한 번 틀린 문제
            </button>
            <button
              onClick={() => setTrainingAttemptFilter('두 번 이상 틀린 문제')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                trainingAttemptFilter === '두 번 이상 틀린 문제'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={trainingAttemptFilter === '두 번 이상 틀린 문제' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              두 번 이상 틀린 문제
            </button>
            <button
              onClick={() => setTrainingAttemptFilter('최근 일주일')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                trainingAttemptFilter === '최근 일주일'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={trainingAttemptFilter === '최근 일주일' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              최 일주일 오답
            </button>
          </div>
        </div>

        {/* 5. 난이도 (Difficulty Level) */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-800 mb-3">난이도:</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedDifficulty('랜덤')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                selectedDifficulty === '랜덤'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={selectedDifficulty === '랜덤' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              랜덤
            </button>
            <button
              onClick={() => setSelectedDifficulty('Hard')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                selectedDifficulty === 'Hard'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={selectedDifficulty === 'Hard' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              Hard
            </button>
            <button
              onClick={() => setSelectedDifficulty('Medium')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                selectedDifficulty === 'Medium'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={selectedDifficulty === 'Medium' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              Medium
            </button>
            <button
              onClick={() => setSelectedDifficulty('Easy')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                selectedDifficulty === 'Easy'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={selectedDifficulty === 'Easy' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              Easy
            </button>
          </div>
        </div>

        {/* 6. 문제 수 (Number of Questions) */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-800 mb-3">문제 수:</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedQuestionCount('5문제')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                selectedQuestionCount === '5문제'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={selectedQuestionCount === '5문제' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              5문제
            </button>
            <button
              onClick={() => setSelectedQuestionCount('10문제')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                selectedQuestionCount === '10문제'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={selectedQuestionCount === '10문제' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              10문제
            </button>
            <button
              onClick={() => setSelectedQuestionCount('20문제')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                selectedQuestionCount === '20문제'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={selectedQuestionCount === '20문제' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              20문제
            </button>
          </div>
        </div>

        {/* 7. 정답 표시 방식 (Answer Display Mode) */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-800 mb-3">정답 표시 방식:</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setAnswerDisplayMode('즉시')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                answerDisplayMode === '즉시'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={answerDisplayMode === '즉시' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              매 문제 정답 확인 후 해설
            </button>
            <button
              onClick={() => setAnswerDisplayMode('나중에')}
              className={`px-6 py-2 text-sm transition-colors rounded-lg ${
                answerDisplayMode === '나중에'
                  ? 'text-white font-medium'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              style={answerDisplayMode === '나중에' ? { backgroundColor: '#3D5AA1' } : {}}
            >
              전체 완료 후 정답 및 해설
            </button>
          </div>
        </div>

        {/* 8. 시작 버튼 (Start Practice Button) */}
        <div className="mb-8 text-center">
          <motion.button
            onClick={() => {
              if (!selectedCard) {
                alert('먼저 문제 유형을 선택해주세요.');
                return;
              }
              
              const selectedType = questionTypes.find(t => t.id === selectedCard);
              
              if (selectedType) {
                onStartTest({
                  title: `${selectedSubject} 전문훈련`,
                  type: selectedSubject,
                  source: trainingSource,
                  difficulty: selectedDifficulty,
                  questionCount: selectedQuestionCount,
                  trainingType: selectedType.id,
                  attemptFilter: trainingAttemptFilter,
                  answerMode: answerDisplayMode,
                  date: new Date().toISOString().split('T')[0],
                  // Add uploaded data if it's an uploaded question
                  ...(selectedType.isUploaded && { 
                    uploadedData: selectedType.uploadedData,
                    isUploaded: true 
                  })
                });
              }
            }}
            className="px-12 py-3 text-white font-medium rounded-lg transition-all duration-300"
            style={{ backgroundColor: '#3D5AA1' }}
            whileHover={{ scale: 1.05, boxShadow: '0 4px 16px rgba(61, 90, 161, 0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            연습 시작하기
          </motion.button>
        </div>
      </div>
    </div>
  );
}