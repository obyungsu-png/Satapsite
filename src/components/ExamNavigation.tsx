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
    <div className="flex items-center justify-between p-2 md:p-4 bg-[#E8EEF7] border-t-2 border-dashed border-black">
      {/* Left side - Empty for spacing */}
      <div className="flex md:flex-1">
      </div>
      
      {/* Center - Question indicator */}
      <div className="flex justify-center">
        <div className="bg-gray-800 text-white px-2 md:px-4 py-1.5 md:py-2 rounded-md flex items-center gap-1 md:gap-3 cursor-pointer hover:bg-gray-700 transition-colors" onClick={onShowOverview}>
          <span className="whitespace-nowrap" style={{ fontSize: '14px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: '500' }}>
            <span className="hidden sm:inline">Question </span>
            {currentQuestion} <span className="hidden sm:inline">of</span><span className="sm:hidden">/</span> {totalQuestions}
          </span>
          <ChevronUp className="h-3 w-3 md:h-4 md:w-4 text-white" />
        </div>
      </div>
      
      {/* Right side - Back and Next buttons together */}
      <div className="flex md:flex-1 justify-center md:justify-end gap-3 md:gap-4 md:mr-16">
        {canGoPrevious ? (
          <Button 
            onClick={onPrevious}
            className="flex items-center gap-2 md:gap-3 text-white px-6 md:px-8 py-1.5 md:py-2 rounded-full h-8 md:h-9"
            style={{ backgroundColor: '#2B478B' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F3666'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2B478B'}
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        ) : (
          <Button 
            disabled
            className="flex items-center gap-2 md:gap-3 bg-gray-300 text-gray-500 px-6 md:px-8 py-1.5 md:py-2 rounded-full h-8 md:h-9 cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        )}
        
        {canGoNext ? (
          <Button 
            onClick={onNext}
            className="flex items-center gap-2 md:gap-3 text-white px-6 md:px-8 py-1.5 md:py-2 rounded-full h-8 md:h-9"
            style={{ backgroundColor: '#2B478B' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F3666'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2B478B'}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        ) : (
          <Button 
            disabled
            className="flex items-center gap-2 md:gap-3 bg-gray-300 text-gray-500 px-6 md:px-8 py-1.5 md:py-2 rounded-full h-8 md:h-9 cursor-not-allowed"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}