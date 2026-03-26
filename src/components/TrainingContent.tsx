import { Target, BookOpen, BarChart3, Lock } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion'; // motion/react 대신 framer-motion 사용이 안정적입니다
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
  uploadedFiles?: Array<any>;
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
  uploadedFiles =[]
}: TrainingContentProps) {
  
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  
  // 과목별 문제 유형
  const questionTypesBySubject: { [key: string]: any[] } = {
    '독해':[
      { id: 'central-ideas', name: 'Central Ideas and Details', icon: Target },
      { id: 'evidence-textual', name: 'Command of Evidence (Textual)', icon: BookOpen },
      { id: 'evidence-quantitative', name: 'Command of Evidence (Quantitative)', icon: BarChart3 },
      { id: 'inferences', name: 'Inferences', icon: BookOpen },
      { id: 'words-context', name: 'Words in Context', icon: BookOpen },
      { id: 'text-structure', name: 'Text Structure and Purpose', icon: Target },
      { id: 'cross-text', name: 'Cross-Text Connections', icon: BookOpen }
    ],
    '문법':[
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
    '수학':[
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

  const getUploadedTrainingFiles = () => {
    const subjectMap: {[key: string]: string} = {
      '독해': 'reading',
      '문법': 'grammar',
      '수학': 'math'
    };
    return uploadedFiles.filter(file => 
      file && file.location === '전문 훈련' && 
      file.subcategory === subjectMap[selectedSubject] &&
      file.status === 'completed'
    );
  };

  const uploadedTrainingQuestions = getUploadedTrainingFiles();
  const baseQuestionTypes = questionTypesBySubject[selectedSubject] || questionTypesBySubject['독해'];
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
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* 상단 제목 영역 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">전문 훈련</h1>
          <p className="text-gray-500">체계적인 전문 훈련을 통해 실력을 한 단계 향상시키세요.</p>
        </div>

        {/* 1. 메인 탭 (독해, 문법, 수학) - 트렌디한 둥근 캡슐 디자인 */}
        <div className="flex flex-wrap gap-2 mb-10 bg-white p-2 rounded-2xl shadow-sm inline-flex border border-gray-100">
          {['독해', '문법', '수학'].map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                selectedSubject === subject
                  ? 'bg-[#425486] text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>

        {/* 2. 문제 유형 카드 섹션 - 마우스 올리면 부드럽게 반응하는 모던 디자인 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4 mb-10">
          {questionTypes.map((type, index) => {
            const IconComponent = type.icon;
            const isSelected = selectedCard === type.id;
            const isLocked = !isUnlocked && index >= 3;
            
            return (
              <div
                key={type.id}
                onClick={() => !isLocked && setSelectedCard(type.id)}
                className={`relative rounded-3xl p-5 flex flex-col items-center justify-center text-center transition-all duration-300 transform ${
                  isLocked ? 'bg-gray-50 border border-gray-100 opacity-70 cursor-not-allowed' :
                  isSelected 
                    ? 'bg-white border-2 border-[#425486] shadow-md -translate-y-1' 
                    : 'bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
                  isLocked ? 'bg-gray-200 text-gray-400' :
                  isSelected ? 'bg-[#425486] text-white' : 'bg-[#EEF2F6] text-[#425486]'
                }`}>
                  {isLocked ? <Lock className="w-5 h-5" /> : <IconComponent className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-bold leading-tight ${
                  isLocked ? 'text-gray-400' : isSelected ? 'text-[#425486]' : 'text-[#2C3E50]'
                }`}>
                  {type.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* 필터 영역 모음 박스 (문제 출처, 유형, 난이도 등) */}
        <div className="bg-white rounded-3xl p-8 mb-10 shadow-sm border border-gray-100 space-y-8">
          
          {/* 3. 문제 출처 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#425486] rounded-full"></div>
              <span className="text-sm font-bold text-gray-700">문제 출처</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {['전체', '기출문제', '공식문제', 'Question Bank 전용'].map((item) => (
                <button
                  key={item}
                  onClick={() => setTrainingSource(item)}
                  className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                    trainingSource === item
                      ? 'bg-[#425486] text-white border-[#425486] shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#425486] hover:text-[#425486]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 4. 연습 유형 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#425486] rounded-full"></div>
              <span className="text-sm font-bold text-gray-700">연습 유형</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {['전체', '미연습 문제', '한 번 틀린 문제', '두 번 이상 틀린 문제', '최 일주일 오답'].map((item) => (
                <button
                  key={item}
                  onClick={() => setTrainingAttemptFilter(item)}
                  className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                    trainingAttemptFilter === item
                      ? 'bg-[#425486] text-white border-[#425486] shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#425486] hover:text-[#425486]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 5. 난이도 & 6. 문제 수 (한 줄에 배치) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#425486] rounded-full"></div>
                <span className="text-sm font-bold text-gray-700">난이도</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {['랜덤', 'Hard', 'Medium', 'Easy'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setSelectedDifficulty(item)}
                    className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                      selectedDifficulty === item
                        ? 'bg-[#425486] text-white border-[#425486] shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#425486] hover:text-[#425486]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#425486] rounded-full"></div>
                <span className="text-sm font-bold text-gray-700">문제 수</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {['5문제', '10문제', '20문제'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setSelectedQuestionCount(item)}
                    className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                      selectedQuestionCount === item
                        ? 'bg-[#425486] text-white border-[#425486] shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#425486] hover:text-[#425486]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 7. 정답 표시 방식 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#425486] rounded-full"></div>
              <span className="text-sm font-bold text-gray-700">정답 표시 방식</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setAnswerDisplayMode('즉시')}
                className={`px-6 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                  answerDisplayMode === '즉시'
                    ? 'bg-[#425486] text-white border-[#425486] shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#425486] hover:text-[#425486]'
                }`}
              >
                매 문제 정답 확인 후 해설
              </button>
              <button
                onClick={() => setAnswerDisplayMode('나중에')}
                className={`px-6 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                  answerDisplayMode === '나중에'
                    ? 'bg-[#425486] text-white border-[#425486] shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#425486] hover:text-[#425486]'
                }`}
              >
                전체 완료 후 정답 및 해설
              </button>
            </div>
          </div>
        </div>

        {/* 8. 시작 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              if (!selectedCard) {
                alert('먼저 문제 유형 카드를 선택해주세요.');
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
                  ...(selectedType.isUploaded && { 
                    uploadedData: selectedType.uploadedData,
                    isUploaded: true 
                  })
                });
              }
            }}
            className="bg-[#425486] text-white px-12 py-4 rounded-xl font-bold text-lg hover:bg-[#2C3E50] transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
          >
            연습 시작하기 <Target className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
