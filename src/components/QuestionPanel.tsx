import { useState, useRef, useEffect } from "react";
import { RadioGroup } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Bookmark, Play, Zap, Target, BookOpen, Globe, Search, FileText } from "lucide-react";
import { motion } from "motion/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface Choice {
  id: string;
  text: string;
}

interface QuestionPanelProps {
  questionNumber: number;
  question: string;
  choices: Choice[];
  selectedAnswer: string;
  onAnswerChange: (value: string) => void;
  isMarkedForReview?: boolean;
  onToggleMarkForReview?: () => void;
  onExpandLeft?: () => void;
  isExpanded?: boolean;
  expandDirection?: 'left' | 'right' | null;
  testInfo?: any;
  onShowVideoLecture?: (questionId: number) => void;
  imageUrl?: string;
  isPracticeReview?: boolean;
  correctAnswer?: string;
  explanation?: string;
  passage?: string;
  onShowSimilarProblems?: () => void;
}

export function QuestionPanel({ 
  questionNumber,
  question, 
  choices, 
  selectedAnswer, 
  onAnswerChange,
  isMarkedForReview = false,
  onToggleMarkForReview,
  onExpandLeft,
  isExpanded = false,
  expandDirection = null,
  testInfo,
  onShowVideoLecture,
  imageUrl,
  isPracticeReview = false,
  correctAnswer,
  explanation,
  passage,
  onShowSimilarProblems
}: QuestionPanelProps) {
  const [abcMode, setAbcMode] = useState(false); // ABC mode inactive by default
  const [eliminatedChoices, setEliminatedChoices] = useState<Set<string>>(new Set()); // B is eliminated by default
  const [fontSize, setFontSize] = useState(18); // Visually match Mark for Review size
  const [activeReviewTab, setActiveReviewTab] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEliminateChoice = (choiceId: string) => {
    setEliminatedChoices(prev => {
      const newSet = new Set(prev);
      newSet.add(choiceId);
      return newSet;
    });
  };

  const handleUndoEliminate = (choiceId: string) => {
    setEliminatedChoices(prev => {
      const newSet = new Set(prev);
      newSet.delete(choiceId);
      return newSet;
    });
  };

  // Mouse wheel zoom handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        setFontSize(prev => Math.max(12, Math.min(32, prev + delta)));
      }
    };

    const element = containerRef.current;
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (element) {
        element.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="h-full px-4 md:px-6 pt-6 md:pt-16 pb-8 bg-white overflow-y-auto relative">
      <div className="max-w-none w-full pl-3 md:pl-5">

        {/* Top Bar with Gray Background and Dashed Border */}
        <div className="bg-[#f0f0f0] pl-0 pr-3 py-0 rounded-none border-b-2 border-dashed border-black mb-3 relative flex items-stretch h-[42px] overflow-hidden">
          {/* Question Number - Full Height */}
          <div className="bg-black text-white w-[42px] flex items-center justify-center shrink-0">
            <span className="font-bold" style={{ fontSize: '18px', fontFamily: '"Times New Roman", Times, serif' }}>{questionNumber}</span>
          </div>

          <div className="flex items-center justify-between flex-1 pl-4">
            {/* Mark for Review */}
            <div className="flex items-center gap-2 cursor-pointer group" onClick={onToggleMarkForReview}>
              <Bookmark 
                className={`h-[16px] w-[16px] transition-colors ${isMarkedForReview ? 'text-red-600 fill-red-600' : 'text-[#555] group-hover:text-black'}`} 
                strokeWidth={2}
              />
              <span className={`text-[15px] font-medium transition-colors ${isMarkedForReview ? 'text-red-600' : 'text-[#333] group-hover:text-black'}`} style={{ fontFamily: 'sans-serif' }}>
                Mark for Review
              </span>
            </div>
            
            {/* ABC Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAbcMode(!abcMode)}
                      className={`px-[8px] h-[24px] font-bold border rounded-[4px] relative overflow-hidden transition-all ${
                        abcMode 
                          ? 'bg-[#005eb8] border-[#005eb8] text-white hover:bg-[#004780] hover:text-white' 
                          : 'bg-transparent border-[#999] text-[#333] hover:bg-black/5 hover:border-black'
                      }`}
                      style={{ fontSize: '13px' }}
                    >
                      <span className="relative z-10 tracking-tight">ABC</span>
                      {/* Diagonal line through ABC */}
                      <div className={`absolute top-1/2 left-0 w-full h-[1.5px] transform -rotate-[15deg] origin-center ${
                        abcMode ? 'bg-white' : 'bg-[#333]'
                      }`}></div>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-white text-gray-900 shadow-lg border border-gray-200">
                  <p className="text-sm">Cross out answer choices<br />you think are wrong.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Question Section */}
        <div className="relative">
          {/* Image Display (if exists) */}
          {imageUrl && (
            <div className="mb-4">
              <img 
                src={imageUrl} 
                alt="Question diagram" 
                className="max-w-full h-auto rounded-md border border-gray-300"
                style={{ maxHeight: '400px' }}
              />
            </div>
          )}
          
          <div className="mb-5">
            <p className="text-[#222] leading-[1.6]" style={{ fontSize: `${fontSize}px`, fontFamily: '"Times New Roman", Times, serif', fontWeight: 400 }}>
              {question}
            </p>
          </div>
        </div>
        
        <div className="pb-6">
          <RadioGroup value={selectedAnswer} onValueChange={onAnswerChange}>
            {choices.map((choice) => {
              const isSelected = selectedAnswer === choice.id;
              const isEliminated = eliminatedChoices.has(choice.id);
              return (
                <div key={choice.id} className="flex items-center space-x-3 mb-2">
                  <Label 
                    htmlFor={choice.id} 
                    className={`flex-1 cursor-pointer p-3 border transition-all duration-150 relative flex items-center gap-4 rounded-lg ${
                      isSelected 
                        ? "border-blue-500 border-2 bg-blue-50" 
                        : "border-[#888] hover:border-[#333] hover:border-t-[#000] hover:border-t-[2.5px] hover:bg-[#f0f0f0]"
                    } ${isEliminated ? "bg-gray-50 hover:bg-gray-100" : "bg-white"}`}
                    onClick={() => onAnswerChange(choice.id)}
                  >
                    <div className={`w-7 h-7 min-w-7 min-h-7 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${
                      isSelected 
                        ? "border-blue-500 bg-blue-500 text-white" 
                        : "border-[#666] text-[#666] hover:border-blue-400"
                    }`} style={{ fontSize: '14px', fontWeight: '700' }}>
                      {choice.id.toUpperCase()}
                    </div>
                    <span className={`relative flex-1 ${isSelected ? "text-blue-600" : "text-[#000]"} ${isEliminated ? "opacity-40" : ""}`} style={{ fontSize: `${fontSize}px`, fontFamily: '"Times New Roman", Times, serif', fontWeight: 400, lineHeight: '1.6' }}>
                      {choice.text}
                    </span>
                    {/* Strike-through line across entire box */}
                    {isEliminated && (
                      <span className="absolute top-1/2 -left-2 -right-2 flex items-center pointer-events-none -translate-y-1/2">
                        <span className="w-full h-[1.5px] bg-[#000]"></span>
                      </span>
                    )}
                  </Label>
                  
                  {/* ABC Mode Controls */}
                  {abcMode && (
                    <div className="flex items-center gap-2">
                      {isEliminated ? (
                        <button
                          onClick={() => handleUndoEliminate(choice.id)}
                          className="text-sm text-gray-700 underline hover:text-gray-900 cursor-pointer bg-transparent border-0"
                          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontWeight: '600', fontSize: '13px' }}
                        >
                          Undo
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEliminateChoice(choice.id)}
                          className="w-6 h-6 p-0 hover:opacity-70 transition-opacity cursor-pointer bg-transparent border border-[#ccc] rounded-full flex items-center justify-center text-[#888] relative"
                          style={{ fontSize: '11px', fontWeight: '600' }}
                        >
                          <span className="relative">{choice.id.toUpperCase()}</span>
                          <span className="absolute top-1/2 left-0 w-full h-[1px] bg-[#888] transform -translate-y-1/2"></span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </RadioGroup>
        </div>
        
        {/* Review Tabs (for 시작하기(복습용) mode) */}
        {isPracticeReview && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { id: 'translation', label: '해석', icon: <Globe className="w-4 h-4" /> },
                { id: 'explanation', label: '해설', icon: <Search className="w-4 h-4" /> },
                { id: 'vocabulary', label: '단어', icon: <BookOpen className="w-4 h-4" /> },
                { id: 'similar', label: '유형문제', icon: <FileText className="w-4 h-4" /> }
              ].map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'similar') {
                      onShowSimilarProblems?.();
                    } else {
                      setActiveReviewTab(activeReviewTab === tab.id ? null : tab.id);
                    }
                  }}
                  variant={activeReviewTab === tab.id ? 'default' : 'outline'}
                  size="sm"
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                    activeReviewTab === tab.id
                      ? 'bg-white text-gray-900 border-2 border-gray-300'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontWeight: activeReviewTab === tab.id ? '600' : '400' }}
                >
                  {tab.icon}
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Tab Content */}
            {activeReviewTab && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8"
              >
                {activeReviewTab === 'translation' && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-[#3D5AA1]">지문 해석</h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {passage || "해석 정보가 없습니다."}
                    </p>
                  </div>
                )}
                {activeReviewTab === 'explanation' && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-[#3D5AA1]">문제 해설</h4>
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-3">
                      <p className="text-sm font-bold text-blue-800">정답: {correctAnswer?.toUpperCase()}</p>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {explanation || "해설 정보가 없습니다."}
                    </p>
                  </div>
                )}
                {activeReviewTab === 'vocabulary' && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-[#3D5AA1]">핵심 단어</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <p className="text-sm text-gray-500">지문에서 추출된 학습 단어들입니다.</p>
                      {/* We could potentially extract words here if needed */}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Video Lecture Button - Only show for past exam questions */}
        {testInfo?.source === "기출문제" && !isPracticeReview && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button
              onClick={() => onShowVideoLecture?.(questionNumber)}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md"
            >
              <Zap className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-base">유형 뽀개기</span>
            </Button>
            <p className="text-xs text-gray-600 text-center mt-2 font-medium">
              AI와 함께 이 유형을 완벽하게 마스터해보세요! 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
}