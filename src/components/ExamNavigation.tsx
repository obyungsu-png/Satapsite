import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";

interface ExamNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onShowOverview: () => void;
}

const activeStyle = {
  backgroundColor: '#2B478B',
  border: 'none',
  transition: 'all 0.2s',
};

const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.backgroundColor = '#1F3666';
};

const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.backgroundColor = '#2B478B';
};

export function ExamNavigation({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  onShowOverview
}: ExamNavigationProps) {
  return (
    <div className="flex items-center justify-between px-2 py-2 md:p-4 border-t-2 border-dashed border-black" style={{ backgroundColor: '#E8EEF7' }}>
      
      {/* ===== Mobile Layout: [< Back] [2/27 ^] [Next >] ===== */}
      <div className="flex md:hidden items-center w-full gap-2">
        {/* Back button - left */}
        {canGoPrevious ? (
          <Button
            onClick={onPrevious}
            className="flex-1 flex items-center justify-center gap-1.5 text-white py-2 rounded-full h-10 text-[13px] font-semibold"
            style={activeStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <Button
            disabled
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-300 text-gray-500 py-2 rounded-full h-10 text-[13px] font-semibold cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}

        {/* Question indicator - center */}
        <div
          className="bg-gray-800 text-white px-3 py-2 rounded-full flex items-center gap-1.5 cursor-pointer hover:bg-gray-700 transition-colors shrink-0"
          onClick={onShowOverview}
        >
          <span className="text-[13px] font-medium whitespace-nowrap">
            {currentQuestion} / {totalQuestions}
          </span>
          <ChevronUp className="h-3.5 w-3.5 text-white" />
        </div>

        {/* Next button - right */}
        {canGoNext ? (
          <Button
            onClick={onNext}
            className="flex-1 flex items-center justify-center gap-1.5 text-white py-2 rounded-full h-10 text-[13px] font-semibold"
            style={activeStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            disabled
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-300 text-gray-500 py-2 rounded-full h-10 text-[13px] font-semibold cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* ===== Desktop Layout (unchanged) ===== */}
      {/* Left side - Empty for spacing */}
      <div className="hidden md:flex md:flex-1">
      </div>
      
      {/* Center - Question indicator */}
      <div className="hidden md:flex justify-center">
        <div className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center gap-3 cursor-pointer hover:bg-gray-700 transition-colors" onClick={onShowOverview}>
          <span className="whitespace-nowrap" style={{ fontSize: '14px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: '500' }}>
            Question {currentQuestion} of {totalQuestions}
          </span>
          <ChevronUp className="h-4 w-4 text-white" />
        </div>
      </div>
      
      {/* Right side - Back and Next buttons together */}
      <div className="hidden md:flex md:flex-1 justify-end gap-4 mr-16">
        {canGoPrevious ? (
          <Button 
            onClick={onPrevious}
            className="flex items-center gap-3 text-white px-8 py-2.5 rounded-full h-11 min-w-[130px] justify-center text-[15px] font-semibold"
            style={activeStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </Button>
        ) : (
          <Button 
            disabled
            className="flex items-center gap-3 bg-gray-300 text-gray-500 px-8 py-2.5 rounded-full h-11 min-w-[130px] justify-center text-[15px] font-semibold cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </Button>
        )}
        
        {canGoNext ? (
          <Button 
            onClick={onNext}
            className="flex items-center gap-3 text-white px-8 py-2.5 rounded-full h-11 min-w-[130px] justify-center text-[15px] font-semibold"
            style={activeStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </Button>
        ) : (
          <Button 
            disabled
            className="flex items-center gap-3 bg-gray-300 text-gray-500 px-8 py-2.5 rounded-full h-11 min-w-[130px] justify-center text-[15px] font-semibold cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
