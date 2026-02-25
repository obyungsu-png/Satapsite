import { useState, useRef, useEffect } from "react";
import { RadioGroup } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface Choice {
  id: string;
  text: string;
}

interface MathQuestionPanelProps {
  questionNumber: number;
  question: string;
  choices: Choice[];
  selectedAnswer: string;
  onAnswerChange: (value: string) => void;
  isMarkedForReview?: boolean;
  onToggleMarkForReview?: () => void;
  testInfo?: any;
  onShowVideoLecture?: (questionId: number) => void;
  imageUrl?: string;
  imageAlt?: string;
}

export function MathQuestionPanel({ 
  questionNumber,
  question, 
  choices,
  selectedAnswer, 
  onAnswerChange,
  isMarkedForReview = false,
  onToggleMarkForReview,
  testInfo,
  onShowVideoLecture,
  imageUrl,
  imageAlt,
}: MathQuestionPanelProps) {
  const [abcMode, setAbcMode] = useState(false);
  const [eliminatedChoices, setEliminatedChoices] = useState<Set<string>>(new Set());
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

  return (
    <div ref={containerRef} className="h-full bg-white overflow-y-auto relative">
      <div className="max-w-[740px] mx-auto px-6 py-4">

        {/* Top Bar with Gray Background and Dashed Border */}
        <div className="bg-[#e8e8e8] px-3 py-2 rounded border-b-2 border-dashed border-black mb-5 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              {/* Question Number */}
              <div className="bg-[#333] text-white px-2 py-1 rounded w-6 h-6 flex items-center justify-center">
                <span className="font-bold" style={{ fontSize: '13px' }}>{questionNumber}</span>
              </div>
              
              {/* Mark for Review */}
              <div className="flex items-center gap-2 cursor-pointer" onClick={onToggleMarkForReview}>
                <Bookmark 
                  className={`h-[13px] w-[13px] ${isMarkedForReview ? 'text-red-600 fill-red-600' : 'text-gray-600 stroke-2'}`} 
                />
                <span className="text-[#333]" style={{ fontSize: '13px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontWeight: '500' }}>Mark for Review</span>
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
                      className={`px-[7px] py-[2px] font-bold border rounded relative overflow-hidden h-auto min-h-0 ${
                        abcMode 
                          ? 'bg-[#005eb8] border-[#005eb8] text-white hover:bg-[#004780] hover:text-white' 
                          : 'bg-white border-gray-400 hover:bg-gray-50 text-gray-800'
                      }`}
                      style={{ fontSize: '11px', lineHeight: '1.2' }}
                    >
                      <span className="relative z-10">ABC</span>
                      {/* Diagonal line through ABC */}
                      <div className={`absolute top-1/2 left-0 w-full h-[1px] transform -rotate-12 ${
                        abcMode ? 'bg-white' : 'bg-black'
                      }`}></div>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-white text-gray-900 shadow-lg border border-gray-200">
                  <p className="text-xs">Cross out answer choices<br />you think are wrong.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Question Text */}
        <div className="mb-5">
          <p className="text-[#222] leading-[1.5]" style={{ fontSize: '15px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
            {question}
          </p>
        </div>

        {/* Image/Graph if present */}
        {imageUrl && (
          <div className="flex justify-center mb-5">
            <img 
              src={imageUrl} 
              alt={imageAlt || "Question diagram"} 
              className="max-w-md w-full"
            />
          </div>
        )}
        
        {/* Answer Choices */}
        <div className="space-y-2.5">
          {choices.map((choice) => {
            const isSelected = selectedAnswer === choice.id;
            const isEliminated = eliminatedChoices.has(choice.id);
            
            return (
              <div key={choice.id} className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <button
                    onClick={() => onAnswerChange(choice.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 border rounded-lg transition-all text-left ${
                      isSelected 
                        ? 'border-blue-500 border-2 bg-blue-50' 
                        : 'border-gray-400 bg-white hover:bg-gray-50'
                    } ${isEliminated ? 'opacity-50' : ''}`}
                  >
                    {/* Circle with letter */}
                    <div className={`w-7 h-7 min-w-7 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? 'border-blue-500 bg-white text-blue-500' 
                        : 'border-gray-500 bg-white text-gray-700'
                    }`} style={{ fontSize: '13px', fontWeight: '600' }}>
                      {choice.id.toUpperCase()}
                    </div>
                    
                    {/* Answer text */}
                    <span className={`flex-1 ${
                      isSelected ? 'text-gray-900' : 'text-gray-900'
                    } ${isEliminated ? 'line-through' : ''}`} style={{ fontSize: '15px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', lineHeight: '1.4' }}>
                      {choice.text}
                    </span>
                  </button>
                  
                  {/* Strike-through line when eliminated */}
                  {isEliminated && (
                    <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-800 pointer-events-none z-10"></div>
                  )}
                </div>
                
                {/* ABC Mode Controls */}
                {abcMode && (
                  <div className="flex items-center">
                    {isEliminated ? (
                      <button
                        onClick={() => handleUndoEliminate(choice.id)}
                        className="text-xs text-gray-700 underline hover:text-gray-900 cursor-pointer bg-transparent border-0 px-2"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontWeight: '600' }}
                      >
                        Undo
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEliminateChoice(choice.id)}
                        className="w-6 h-6 p-0 hover:opacity-70 transition-opacity cursor-pointer bg-transparent border border-[#ccc] rounded-full flex items-center justify-center text-[#888] relative"
                        style={{ fontSize: '10px', fontWeight: '600' }}
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
        </div>
      </div>
    </div>
  );
}