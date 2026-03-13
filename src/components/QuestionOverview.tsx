import { Button } from "./ui/button";
import { MapPin, Square, Bookmark } from "lucide-react";

interface QuestionOverviewProps {
  currentQuestion: number;
  totalQuestions: number;
  selectedAnswers: Record<number, string>;
  markedForReview: Record<number, boolean>;
  onQuestionSelect: (questionNumber: number) => void;
  onClose: () => void;
}

export function QuestionOverview({
  currentQuestion,
  totalQuestions,
  selectedAnswers,
  markedForReview,
  onQuestionSelect,
  onClose
}: QuestionOverviewProps) {
  // Generate array of question numbers
  const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1);

  const getQuestionStatus = (questionNumber: number) => {
    const isAnswered = Boolean(selectedAnswers[questionNumber]);
    const isMarked = Boolean(markedForReview[questionNumber]);
    const isCurrent = questionNumber === currentQuestion;

    if (isCurrent) return 'current';
    if (isMarked) return 'review';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };

  const getQuestionStyles = (questionNumber: number) => {
    const status = getQuestionStatus(questionNumber);
    
    switch (status) {
      case 'current':
        return 'border-2 border-dashed border-blue-500 bg-white text-blue-600 font-semibold';
      case 'review':
        return 'border-2 border-dashed border-red-500 bg-red-50 text-red-600 font-semibold';
      case 'answered':
        return 'border-2 border-dashed border-blue-500 bg-blue-50 text-blue-600 font-semibold';
      default:
        return 'border-2 border-dashed border-gray-400 bg-white text-gray-700 hover:border-gray-500';
    }
  };

  return (
    <>
      {/* Transparent backdrop for closing */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Panel */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white z-50 rounded-t-lg border-t border-gray-300 shadow-2xl w-full md:w-[650px] max-w-[95vw] max-h-[60vh] md:max-h-[400px] overflow-y-auto">
        <div className="p-3 md:p-6">
          {/* Header */}
          <div className="mb-3 md:mb-4">
            <h1 className="mb-2 md:mb-4" style={{ fontSize: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: '700', color: '#000' }}>
              Section 1, Module 1: Reading and Writing Questions
            </h1>
            
            {/* Legend */}
            <div className="flex items-center gap-3 md:gap-6 mb-3 md:mb-4 text-xs md:text-sm overflow-x-auto">
              <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
                <MapPin className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
                <span className="text-gray-700">Current</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
                <div className="h-3 w-3 md:h-4 md:w-4 border-2 border-dashed border-gray-400 rounded-sm"></div>
                <span className="text-gray-700">Unanswered</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
                <Bookmark className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                <span className="text-gray-700">For Review</span>
              </div>
            </div>
          </div>

          {/* Questions Grid */}
          <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-9 gap-2 md:gap-3 mb-4 md:mb-6">
            {questions.map((questionNumber) => {
              const status = getQuestionStatus(questionNumber);
              return (
                <div key={questionNumber} className="relative">
                  <Button
                    variant="outline"
                    className={`w-10 h-10 md:w-12 md:h-12 text-xs md:text-sm ${getQuestionStyles(questionNumber)} hover:scale-105 transition-transform`}
                    onClick={() => {
                      onQuestionSelect(questionNumber);
                      onClose();
                    }}
                  >
                    {questionNumber}
                  </Button>
                  
                  {/* Status Icons */}
                  {status === 'current' && (
                    <MapPin className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 h-3 w-3 md:h-4 md:w-4 text-blue-600 bg-white rounded-full p-0.5" />
                  )}
                  {status === 'review' && (
                    <Bookmark className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 h-3 w-3 md:h-4 md:w-4 text-red-600 fill-red-600 bg-white rounded-full p-0.5" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-center pt-3 md:pt-4 border-t border-dashed border-gray-400">
            <Button
              variant="default"
              className="px-4 md:px-6 py-2 text-white rounded-full text-sm md:text-base"
              style={{ backgroundColor: '#4A5F8C' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3A4F7C'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4A5F8C'}
            >
              Go to Review Page
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}