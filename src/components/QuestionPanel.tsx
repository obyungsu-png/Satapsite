import { useState, useRef, useEffect } from "react";
import { RadioGroup } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Bookmark, Play } from "lucide-react";
import { ExpandIcon } from "./ExpandIcon";
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
  const [fontSize, setFontSize] = useState(18); // Increased from 16 to 18
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
    <div ref={containerRef} className="h-full p-4 md:p-6 bg-white overflow-y-auto relative">
      <div className="max-w-none w-full">

        {/* Top Bar with Gray Background and Dashed Border */}
        <div className="bg-[#e8e8e8] px-3 py-2 rounded border-b-2 border-dashed border-black mb-4 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Question Number */}
              <div className="bg-[#333] text-white px-2 py-1 rounded w-6 h-6 flex items-center justify-center">
                <span className="font-bold" style={{ fontSize: '14px' }}>{questionNumber}</span>
              </div>
              
              {/* Mark for Review */}
              <div className="flex items-center gap-2 cursor-pointer" onClick={onToggleMarkForReview}>
                <Bookmark 
                  className={`h-[14px] w-[14px] ${isMarkedForReview ? 'text-red-600 fill-red-600' : 'text-gray-600 stroke-2'}`} 
                />
                <span className="text-[#333]" style={{ fontSize: '14px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontWeight: '500' }}>Mark for Review</span>
              </div>
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
                      className={`px-[8px] py-[3px] font-bold border rounded relative overflow-hidden h-auto min-h-0 ${
                        abcMode 
                          ? 'bg-[#005eb8] border-[#005eb8] text-white hover:bg-[#004780] hover:text-white' 
                          : 'bg-white border-gray-400 hover:bg-gray-50 text-gray-800'
                      }`}
                      style={{ fontSize: '12px', lineHeight: '1.2' }}
                    >
                      <span className="relative z-10">ABC</span>
                      {/* Diagonal line through ABC - always visible, color changes with state */}
                      <div className={`absolute top-1/2 left-0 w-full h-[1px] transform -rotate-12 ${
                        abcMode ? 'bg-white' : 'bg-black'
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
        <div className="relative pt-3">
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
            <p className="text-[#222] leading-[1.6]" style={{ fontSize: '17px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
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
                    className={`flex-1 cursor-pointer p-3 border rounded-lg transition-all duration-200 relative flex items-center gap-4 ${
                      isSelected 
                        ? "border-blue-500 border-2 bg-blue-50" 
                        : "border-[#888] hover:border-blue-300 hover:bg-gray-50"
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
                    <span className={`relative flex-1 ${isSelected ? "text-blue-600" : "text-[#000]"} ${isEliminated ? "opacity-40" : ""}`} style={{ fontSize: '16px', fontFamily: '"Times New Roman", Times, serif', lineHeight: '1.6' }}>
                      {choice.text}
                      {isEliminated && (
                        <span className="absolute top-1/2 left-[-60px] right-[-60px] flex items-center transform -translate-y-1/2">
                          <span className="w-full h-[2.5px] bg-[#000]"></span>
                        </span>
                      )}
                    </span>
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
              className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2"
            >
              <Play className="h-5 w-5" />
              🎥 동영상 강의
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              이 문제에 대한 전문가 해설 영상을 시청하세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}