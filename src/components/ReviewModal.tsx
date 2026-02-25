import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: {
    id: number;
    passage: string;
    question: string;
    choices: { id: string; text: string }[];
  };
  selectedAnswer?: string;
  correctAnswer: string;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  questionType?: string;
  difficulty?: string;
}

export function ReviewModal({
  isOpen,
  onClose,
  question,
  selectedAnswer,
  correctAnswer,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  questionType,
  difficulty,
}: ReviewModalProps) {
  const [showExplanation, setShowExplanation] = useState(true);
  const [activeTab, setActiveTab] = useState<'ai' | 'question' | 'similar' | null>(null);

  if (!isOpen) return null;

  const userAnswer = selectedAnswer ? selectedAnswer.toUpperCase() : null;
  const correctAnswerUpper = correctAnswer.toUpperCase();
  const isCorrect = userAnswer === correctAnswerUpper;
  const isOmitted = !userAnswer;

  // Mock similar questions based on questionType and difficulty
  const getSimilarQuestions = () => {
    const typeLabel = questionType || 'Central Ideas and Details';
    const diffLabel = difficulty || '보통';
    
    return [
      {
        id: 1,
        passage: `Sample passage for similar question 1. This passage is related to ${typeLabel} with difficulty level ${diffLabel}. The content discusses various aspects that students need to analyze carefully.`,
        question: 'Which choice best describes the main idea presented in the passage?',
        choices: [
          { id: 'a', text: 'Option A - First possible answer' },
          { id: 'b', text: 'Option B - Second possible answer' },
          { id: 'c', text: 'Option C - Third possible answer' },
          { id: 'd', text: 'Option D - Fourth possible answer' },
        ],
        correctAnswer: 'a',
      },
      {
        id: 2,
        passage: `Sample passage for similar question 2. This is another ${typeLabel} question at ${diffLabel} difficulty. Students should focus on understanding the context and relationships between different elements.`,
        question: 'Based on the passage, which statement is most accurate?',
        choices: [
          { id: 'a', text: 'The first interpretation' },
          { id: 'b', text: 'The second interpretation' },
          { id: 'c', text: 'The third interpretation' },
          { id: 'd', text: 'The fourth interpretation' },
        ],
        correctAnswer: 'c',
      },
      {
        id: 3,
        passage: `Sample passage for similar question 3. This final example of ${typeLabel} at ${diffLabel} level provides additional practice for students to master this question type.`,
        question: 'Which of the following best completes the text with the most logical and precise word or phrase?',
        choices: [
          { id: 'a', text: 'nevertheless' },
          { id: 'b', text: 'furthermore' },
          { id: 'c', text: 'however' },
          { id: 'd', text: 'therefore' },
        ],
        correctAnswer: 'b',
      },
    ];
  };

  const similarQuestions = getSimilarQuestions();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-base text-gray-900">
              Sep 2025 SAT Refined Set 1-October 28,2025
            </h2>
            <p className="text-sm text-gray-600">
              Reading and Writing: Question {question.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Passage */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-8 bg-white">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line text-[15px]">
                {question.passage}
              </p>
            </div>
          </div>

          {/* Right Panel - Question and Answer */}
          <div className="w-1/2 overflow-y-auto p-8 bg-gray-50">
            {/* Feedback Banner */}
            {showExplanation && (
              <div
                className={`rounded-lg p-4 mb-6 ${
                  isOmitted
                    ? "bg-pink-50 border border-pink-200"
                    : isCorrect
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`text-sm ${
                    isOmitted
                      ? "text-pink-700"
                      : isCorrect
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {isOmitted
                    ? `You omitted this question. The correct answer is ${correctAnswerUpper}.`
                    : isCorrect
                    ? `Correct! You selected ${correctAnswerUpper}.`
                    : `Incorrect. You selected ${userAnswer}, but the correct answer is ${correctAnswerUpper}.`}
                </p>
              </div>
            )}

            {/* Question */}
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                  {question.id}
                </div>
                <p className="text-gray-900 text-[15px] leading-relaxed">
                  {question.question}
                </p>
              </div>
            </div>

            {/* Answer Choices */}
            <div className="space-y-3 mb-8">
              {question.choices.map((choice) => {
                const choiceUpper = choice.id.toUpperCase();
                const isUserChoice = userAnswer === choiceUpper;
                const isCorrectChoice = correctAnswerUpper === choiceUpper;

                return (
                  <div
                    key={choice.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCorrectChoice
                        ? "border-green-500 bg-green-50"
                        : isUserChoice
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-gray-700 font-medium">
                        {choiceUpper}.
                      </span>
                      <span className="text-sm text-gray-900 flex-1">
                        {choice.text}
                      </span>
                      {isCorrectChoice && (
                        <span className="text-xs text-green-700 font-medium">
                          ✓ Correct
                        </span>
                      )}
                      {isUserChoice && !isCorrectChoice && (
                        <span className="text-xs text-red-700 font-medium">
                          ✗ Your Answer
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tab Navigation */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab(activeTab === 'ai' ? null : 'ai')}
                  className={`px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    activeTab === 'ai'
                      ? 'bg-white text-gray-900 border-2 border-gray-300'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontWeight: activeTab === 'ai' ? '600' : '400' }}
                >
                  <span>🧠</span>
                  AI 도움
                </button>
                <button
                  onClick={() => setActiveTab(activeTab === 'question' ? null : 'question')}
                  className={`px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    activeTab === 'question'
                      ? 'bg-white text-gray-900 border-2 border-gray-300'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontWeight: activeTab === 'question' ? '600' : '400' }}
                >
                  <span>💬</span>
                  질문하기
                </button>
                <button
                  onClick={() => setActiveTab(activeTab === 'similar' ? null : 'similar')}
                  className={`px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    activeTab === 'similar'
                      ? 'bg-white text-gray-900 border-2 border-gray-300'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontWeight: activeTab === 'similar' ? '600' : '400' }}
                >
                  <span>🔍</span>
                  유사 문제
                </button>
              </div>

              {/* Tab Content */}
              {activeTab && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 min-h-[200px] max-h-[500px] overflow-y-auto">
                  {activeTab === 'ai' ? (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-700 leading-relaxed">
                        <p className="mb-3">
                          이 문제는 문맥에 맞는 적절한 단어를 선택하는 문제입니다.
                        </p>
                        <p className="mb-3">
                          정답은 <strong>{correctAnswerUpper}</strong>입니다. 
                          지문의 흐름과 문맥을 고려할 때, 이 선택지가 가장 적절합니다.
                        </p>
                        <p>
                          다른 선택지들은 문맥상 적절하지 않거나 논리적으로 맞지 않습니다.
                        </p>
                      </div>
                    </div>
                  ) : activeTab === 'question' ? (
                    <div className="space-y-3">
                      <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[130px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="이 문제에 대해 궁금한 점을 질문해주세요..."
                      />
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        질문 제출
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-sm text-purple-800">
                          <span className="font-medium">유형:</span> {questionType || 'Central Ideas and Details'} | 
                          <span className="font-medium ml-2">난이도:</span> {difficulty || '보통'}
                        </p>
                        <p className="text-xs text-purple-700 mt-1">
                          동일한 유형과 난이도의 문제 3개를 제공합니다.
                        </p>
                      </div>
                      {similarQuestions.map((simQ, index) => (
                        <div key={simQ.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="mb-3 pb-2 border-b border-gray-300">
                            <span className="text-xs font-medium text-gray-600">유사 문제 {index + 1}</span>
                          </div>
                          <div className="mb-3">
                            <p className="text-gray-800 leading-relaxed text-sm mb-3">
                              {simQ.passage}
                            </p>
                          </div>
                          <div className="mb-3">
                            <div className="flex items-start gap-2">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                                Q
                              </div>
                              <p className="text-gray-900 text-sm leading-relaxed">
                                {simQ.question}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {simQ.choices.map((choice) => {
                              const choiceUpper = choice.id.toUpperCase();
                              const isCorrectChoice = simQ.correctAnswer.toUpperCase() === choiceUpper;

                              return (
                                <div
                                  key={choice.id}
                                  className={`p-3 rounded-md border transition-all text-sm ${
                                    isCorrectChoice
                                      ? "border-green-400 bg-green-50"
                                      : "border-gray-200 bg-white"
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="text-xs text-gray-700 font-medium">
                                      {choiceUpper}.
                                    </span>
                                    <span className="text-xs text-gray-900 flex-1">
                                      {choice.text}
                                    </span>
                                    {isCorrectChoice && (
                                      <span className="text-xs text-green-700 font-medium">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <Switch
              checked={showExplanation}
              onCheckedChange={setShowExplanation}
            />
            <label className="text-sm text-gray-600 cursor-pointer">
              Hide correct answer and AI explanation
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onPrevious}
              disabled={!canGoPrevious}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={onNext}
              disabled={!canGoNext}
              size="sm"
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}