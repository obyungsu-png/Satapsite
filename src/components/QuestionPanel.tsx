import { useState, useRef, useEffect } from "react";
import { RadioGroup } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Bookmark, Play, Zap } from "lucide-react";
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
  imageUrl
}: QuestionPanelProps) {
  const [abcMode, setAbcMode] = useState(false); // ABC mode inactive by default
  const [eliminatedChoices, setEliminatedChoices] = useState<Set<string>>(new Set()); // B is eliminated by default
  const [fontSize, setFontSize] = useState(18); // Visually match Mark for Review size
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

        {/* Video Lecture Button - Only show for past exam questions */}
        {testInfo?.source === "기출문제" && (
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