import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ReviewQuestionPanelProps {
  question: any;
  selectedAnswer: string | undefined;
  correctAnswer: string;
  onPrevious: () => void;
  onNext: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  currentIndex: number;
  totalQuestions: number;
}

export function ReviewQuestionPanel({
  question,
  selectedAnswer,
  correctAnswer,
  onPrevious,
  onNext,
  hasNext,
  hasPrevious,
  currentIndex,
  totalQuestions
}: ReviewQuestionPanelProps) {
  const [showExplanation, setShowExplanation] = useState(true);

  // Determine user's answer status
  const userAnswerStatus = !selectedAnswer 
    ? 'omitted' 
    : selectedAnswer.toLowerCase() === correctAnswer.toLowerCase() 
      ? 'correct' 
      : 'incorrect';

  const getStatusMessage = () => {
    if (userAnswerStatus === 'omitted') {
      return `You omitted this question. The correct answer is ${correctAnswer.toUpperCase()}.`;
    } else if (userAnswerStatus === 'correct') {
      return `Correct! The answer is ${correctAnswer.toUpperCase()}.`;
    } else {
      return `You answered ${selectedAnswer?.toUpperCase()}. The correct answer is ${correctAnswer.toUpperCase()}.`;
    }
  };

  const getStatusColor = () => {
    if (userAnswerStatus === 'correct') return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  // Get AI explanation based on question
  const getAIExplanation = () => {
    // Mock explanation data
    return `In this question, Translate Chinese analysis the prompt mentions that 'MOMA claims that video demonstrations are only suitable for impractical games presented in a playable format,' while the text states that 'video games are an inherently interactive medium,' highlighting the interactive nature of video games and criticizing the fact that this interactivity is completely absent in video demonstrations. The function of this part is to emphasize the fundamental difference between video games and traditional presentation forms (such as videos), thereby supporting the author's view that video demonstrations cannot perfectly capture the essence of video games. Therefore, choosing D is the most appropriate answer since this part serves to contrast the shortcomings between interactive and non-interactive presentations, reinforcing the author's criticism of MOMA's method of presentation.`;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Status Banner */}
      <div className={`px-6 py-3 border-b ${getStatusColor()}`}>
        <p className="text-sm">{getStatusMessage()}</p>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
              {currentIndex + 1}
            </div>
            <div className="flex-1">
              <p className="text-gray-800 leading-relaxed">{question.text}</p>
            </div>
          </div>
        </div>

        {/* Answer Choices */}
        <div className="space-y-3 mb-8">
          {question.options.map((option: any) => {
            const optionLetter = option.letter.toLowerCase();
            const isCorrect = optionLetter === correctAnswer.toLowerCase();
            const isUserAnswer = optionLetter === selectedAnswer?.toLowerCase();

            let bgColor = 'bg-white';
            let borderColor = 'border-gray-300';
            let textColor = 'text-gray-800';

            if (isCorrect) {
              bgColor = 'bg-green-50';
              borderColor = 'border-green-500';
              textColor = 'text-green-900';
            } else if (isUserAnswer && !isCorrect) {
              bgColor = 'bg-red-50';
              borderColor = 'border-red-500';
              textColor = 'text-red-900';
            }

            return (
              <div
                key={option.letter}
                className={`p-4 border-2 rounded-lg ${bgColor} ${borderColor} ${textColor}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded border border-current flex items-center justify-center">
                    {isCorrect && <span className="text-green-600">✓</span>}
                    {isUserAnswer && !isCorrect && <span className="text-red-600">✗</span>}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">
                      <strong>{option.letter}.</strong>
                    </div>
                    <p className="text-sm">{option.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Explanation Section */}
        {showExplanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                AI
              </div>
              <h3 className="text-lg text-gray-900">AI Explanation</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {getAIExplanation()}
            </p>
          </div>
        )}

        {/* Toggle Explanation */}
        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={!showExplanation}
              onChange={() => setShowExplanation(!showExplanation)}
              className="rounded"
            />
            Hide correct answer and AI explanation
          </label>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="px-6 py-0 bg-gray-50">
        <div className="flex items-center justify-center mb-2">
          <span className="text-sm text-gray-600">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>
        <div className="border-t-2 border-dashed border-black" />
        <div className="flex items-center justify-center gap-4 py-4" style={{ backgroundColor: '#E8EEF7' }}>
          <Button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={`flex items-center gap-3 px-8 py-2.5 rounded-full h-11 min-w-[130px] justify-center text-[15px] font-semibold ${!hasPrevious ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'text-white'}`}
            style={hasPrevious ? { backgroundColor: '#2B478B' } : undefined}
            onMouseEnter={hasPrevious ? (e) => e.currentTarget.style.backgroundColor = '#1F3666' : undefined}
            onMouseLeave={hasPrevious ? (e) => e.currentTarget.style.backgroundColor = '#2B478B' : undefined}
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </Button>

          <Button
            onClick={onNext}
            disabled={!hasNext}
            className={`flex items-center gap-3 px-8 py-2.5 rounded-full h-11 min-w-[130px] justify-center text-[15px] font-semibold ${!hasNext ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'text-white'}`}
            style={hasNext ? { backgroundColor: '#2B478B' } : undefined}
            onMouseEnter={hasNext ? (e) => e.currentTarget.style.backgroundColor = '#1F3666' : undefined}
            onMouseLeave={hasNext ? (e) => e.currentTarget.style.backgroundColor = '#2B478B' : undefined}
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}