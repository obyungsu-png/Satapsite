import { useState } from "react";
import { X, ChevronLeft, ChevronRight, BookOpen, ArrowLeft, Globe, Search, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { useEffect } from "react";

interface ReviewModalProps {
  isOpen: boolean;
  // ...existing code...
}
          { id: 'b', text: 'compelling' },
          { id: 'c', text: 'trivial' },
          { id: 'd', text: 'controversial' },
        ],
        correctAnswer: 'b',
      },
      {
        id: 2,
        passage: `Example passage for ${typeLabel} at ${diffLabel} difficulty level.`,
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
        passage: `Sample passage for similar question 3. This final example of ${typeLabel} at ${diffLabel} level provides additional practice.`,
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

  // Auto close fullscreen when all 3 similar problems are completed
  // Next 버튼에서 복귀하도록 변경 (자동 복귀 제거)

  // Fullscreen Similar Problems View
  if (isFullScreen && activeTab === 'similarProblems') {
    const simQ = similarQuestions[similarProblemIndex];
    const hasAnswered = showSimilarResults[similarProblemIndex];
    const userSimilarAnswer = similarProblemAnswers[similarProblemIndex]?.toUpperCase();
    const isCorrectAnswer = userSimilarAnswer === simQ.correctAnswer.toUpperCase();

    return (
      <div className="fixed inset-0 bg-purple-50 z-50 flex flex-col">
        {/* Fullscreen Header */}
        <div className="border-b border-purple-300 px-6 py-4 flex items-center justify-between bg-purple-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsFullScreen(false);
                setActiveTab(null); // Close the tab when going back
              }}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">뒤로가기</span>
            </button>
            <div className="h-4 w-px bg-gray-300" />
            <h2 className="text-base text-gray-900">
              Sep 2025 SAT Refined Set 1-October 28,2025
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Fullscreen Content - Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Passage */}
          <div className="w-1/2 border-r border-purple-300 overflow-y-auto p-8 bg-purple-50">
            {/* Similar Problem Navigation */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {similarQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSimilarProblemIndex(idx)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    similarProblemIndex === idx
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="text-gray-800 leading-relaxed text-base">
                {simQ.passage}
              </p>
            </div>
          </div>

          {/* Right Panel - Question and Answer */}
          <div className="w-1/2 overflow-y-auto p-8 bg-purple-100">
            {/* Header with Type/Difficulty and Status */}
            <div className="mb-6 space-y-3">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-800">
                  <span className="font-semibold">유형:</span> {questionType || 'Central Ideas and Details'} | 
                  <span className="font-semibold ml-2">난이도:</span> {difficulty || '중간'}
                </p>
                <p className="text-[10px] text-purple-700 mt-1">
                  동일한 유형과 난이도의 문제 3개를 제공합니다.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">문제 {similarProblemIndex + 1} / 3</span>
                {hasAnswered && (
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    isCorrectAnswer
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {isCorrectAnswer ? '정답' : '오답'}
                  </span>
                )}
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  Q
                </div>
                <p className="text-gray-900 text-base leading-relaxed">
                  {simQ.question}
                </p>
              </div>
            </div>

            {/* Answer Choices */}
            <div className="space-y-3 mb-6">
              {simQ.choices.map((choice) => {
                const choiceUpper = choice.id.toUpperCase();
                const isCorrectChoice = simQ.correctAnswer.toUpperCase() === choiceUpper;
                const isUserChoice = userSimilarAnswer === choiceUpper;

                return (
                  <button
                    key={choice.id}
                    onClick={() => {
                      if (!hasAnswered) {
                        setSimilarProblemAnswers(prev => ({
                          ...prev,
                          [similarProblemIndex]: choice.id
                        }));
                      }
                    }}
                    disabled={hasAnswered}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-base text-left ${
                      hasAnswered
                        ? isCorrectChoice
                          ? 'border-green-500 bg-green-50'
                          : isUserChoice
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-white'
                        : isUserChoice
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    } ${hasAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-gray-700 font-medium">
                        {choiceUpper}.
                      </span>
                      <span className="text-sm text-gray-900 flex-1">
                        {choice.text}
                      </span>
                      {hasAnswered && isCorrectChoice && (
                        <span className="text-sm text-green-700 font-medium">
                          ✓ 정답
                        </span>
                      )}
                      {hasAnswered && isUserChoice && !isCorrectChoice && (
                        <span className="text-sm text-red-700 font-medium">
                          ✗ 선택
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Result Message */}
            {hasAnswered && (
              <div className={`p-4 rounded-lg text-base mb-6 ${
                isCorrectAnswer
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {isCorrectAnswer
                  ? '정답입니다! 훌륭합니다.'
                  : `오답입니다. 정답은 ${simQ.correctAnswer.toUpperCase()}입니다.`}
              </div>
            )}

            {/* Check Answer Button */}
            {!hasAnswered && userSimilarAnswer && (
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => {
                    setShowSimilarResults(prev => ({
                      ...prev,
                      [similarProblemIndex]: true
                    }));
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors"
                >
                  다음
                </button>
              </div>
            )}

            {/* Progress Indicator */}
            <div className="mb-6 text-center text-sm text-gray-500">
              {Object.keys(showSimilarResults).filter(k => showSimilarResults[parseInt(k)]).length} / 3 완료
            </div>

                    {/* Next button for returning after all 3 problems */}
                    {Object.keys(showSimilarResults).filter(k => showSimilarResults[parseInt(k)]).length === 3 && (
                      <div className="flex justify-center mb-6">
                        <button
                          onClick={() => {
                            setSimilarProblemIndex(0);
                            setSimilarProblemAnswers({});
                            setShowSimilarResults({});
                            setIsFullScreen(false);
                            setActiveTab(null);
                          }}
                          className="px-8 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    )}
            {/* Tab Navigation */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setFullscreenTab(fullscreenTab === 'translation' ? null : 'translation')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                    fullscreenTab === 'translation'
                      ? 'bg-white text-gray-900 border-2 border-gray-300'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontWeight: fullscreenTab === 'translation' ? '600' : '400' }}
                >
                  <Globe className="h-4 w-4" />
                  해석
                </button>
                <button
                  onClick={() => setFullscreenTab(fullscreenTab === 'analysis' ? null : 'analysis')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                    fullscreenTab === 'analysis'
                      ? 'bg-white text-gray-900 border-2 border-gray-300'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontWeight: fullscreenTab === 'analysis' ? '600' : '400' }}
                >
                  <Search className="h-4 w-4" />
                  분석
                </button>
                <button
                  onClick={() => setFullscreenTab(fullscreenTab === 'vocabulary' ? null : 'vocabulary')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                    fullscreenTab === 'vocabulary'
                      ? 'bg-white text-gray-900 border-2 border-gray-300'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontWeight: fullscreenTab === 'vocabulary' ? '600' : '400' }}
                >
                  <BookOpen className="h-4 w-4" />
                  단어
                </button>
              </div>

              {/* Tab Content */}
              {fullscreenTab && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 min-h-[200px] max-h-[400px] overflow-y-auto">
                  {fullscreenTab === 'translation' ? (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-700 leading-relaxed">
                        <p className="mb-3">
                          이 문제는 문맥에 맞는 적절한 단어를 선택하는 문제입니다.
                        </p>
                        <p className="mb-3">
                          정답은 <strong>{simQ.correctAnswer.toUpperCase()}</strong>입니다. 
                          지문의 흐름과 문맥을 고려할 때, 이 선택지가 가장 적절합니다.
                        </p>
                        <p>
                          다른 선택지들은 문맥상 적절하지 않거나 논리적으로 맞지 않습니다.
                        </p>
                      </div>
                    </div>
                  ) : fullscreenTab === 'analysis' ? (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-700 leading-relaxed">
                        <p className="mb-3">
                          <strong>문제 해설:</strong>
                        </p>
                        <p className="mb-3">
                          이 문제는 {questionType || 'Central Ideas and Details'} 유형으로,
                          {difficulty || '보통'} 난이도입니다.
                        </p>
                        <p className="mb-3">
                          정답은 <strong>{simQ.correctAnswer.toUpperCase()}</strong>입니다.
                        </p>
                        <p>
                          이 문제를 풀기 위해서 전체 문맥을 파악하고, 각 선택지가 
                          문장의 흐름에 어떻게 부합하는지 분석해야 합니다.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-700 leading-relaxed">
                        <p className="mb-3 font-semibold">핵심 어휘:</p>
                        <ul className="space-y-2 list-disc list-inside">
                          <li><strong>compelling</strong> - 설득력 있는, 강렬한</li>
                          <li><strong>acknowledge</strong> - 인정하다, 승인하다</li>
                          <li><strong>validity</strong> - 타당성, 유효성</li>
                          <li><strong>ambiguous</strong> - 애매한, 모호한</li>
                          <li><strong>trivial</strong> - 사소한, 하찮은</li>
                          <li><strong>controversial</strong> - 논란의 여지가 있는</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  onClick={() => setActiveTab(activeTab === 'translation' ? null : 'translation')}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'translation'
                      ? 'bg-white text-gray-900 border-2 border-gray-300'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontWeight: activeTab === 'translation' ? '600' : '400' }}
                >
                  <Globe className="h-4 w-4" />
                  해석
                </button>
                <button
                  onClick={() => setActiveTab(activeTab === 'analysis' ? null : 'analysis')}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'analysis'
                      ? 'bg-white text-gray-900 border-2 border-gray-300'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontWeight: activeTab === 'analysis' ? '600' : '400' }}
                >
                  <Search className="h-4 w-4" />
                  해설
                </button>
                <button
                  onClick={() => setActiveTab(activeTab === 'vocabulary' ? null : 'vocabulary')}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'vocabulary'
                      ? 'bg-white text-gray-900 border-2 border-gray-300'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontWeight: activeTab === 'vocabulary' ? '600' : '400' }}
                >
                  <BookOpen className="h-4 w-4" />
                  단어
                </button>
                <button
                  onClick={() => {
                    if (activeTab === 'similarProblems') {
                      setActiveTab(null);
                    } else {
                      setActiveTab('similarProblems');
                      setIsFullScreen(true);
                    }
                  }}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'similarProblems'
                      ? 'bg-white text-gray-900 border-2 border-gray-300'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontWeight: activeTab === 'similarProblems' ? '600' : '400' }}
                >
                  <FileText className="h-4 w-4" />
                  정답
                </button>
              </div>

              {/* Tab Content */}
              {activeTab && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 min-h-[200px] max-h-[500px] overflow-y-auto">
                  {activeTab === 'translation' ? (
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
                  ) : activeTab === 'analysis' ? (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-700 leading-relaxed">
                        <p className="mb-3">
                          <strong>문제 해설:</strong>
                        </p>
                        <p className="mb-3">
                          이 문제는 {questionType || 'Central Ideas and Details'} 유형으로,
                          {difficulty || '보통'} 난이도입니다.
                        </p>
                        <p className="mb-3">
                          정답은 <strong>{correctAnswerUpper}</strong>입니다.
                        </p>
                        <p>
                          이 문제를 풀기 위해서는 전체 문맥을 파악하고, 각 선택지가 
                          문장의 흐름에 어떻게 부합하는지 분석해야 합니다.
                        </p>
                      </div>
                    </div>
                  ) : activeTab === 'vocabulary' ? (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-700 leading-relaxed">
                        <p className="mb-3 font-semibold">핵심 어휘:</p>
                        <ul className="space-y-2 list-disc list-inside">
                          <li><strong>compelling</strong> - 설득력 있는, 강렬한</li>
                          <li><strong>acknowledge</strong> - 인정하다, 승인하다</li>
                          <li><strong>validity</strong> - 타당성, 유효성</li>
                          <li><strong>ambiguous</strong> - 애매한, 모호한</li>
                          <li><strong>trivial</strong> - 사소한, 하찮은</li>
                          <li><strong>controversial</strong> - 논란의 여지가 있는</li>
                        </ul>
                      </div>
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

                      {/* Similar Problem Navigation */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {similarQuestions.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSimilarProblemIndex(idx)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                              similarProblemIndex === idx
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Current Similar Problem */}
                      {(() => {
                        const simQ = similarQuestions[similarProblemIndex];
                        const hasAnswered = showSimilarResults[similarProblemIndex];
                        const userSimilarAnswer = similarProblemAnswers[similarProblemIndex]?.toUpperCase();
                        const isCorrectAnswer = userSimilarAnswer === simQ.correctAnswer.toUpperCase();

                        return (
                          <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="mb-3 pb-2 border-b border-gray-300 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">문제 {similarProblemIndex + 1} / 3</span>
                              {hasAnswered && (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  isCorrectAnswer
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {isCorrectAnswer ? '정답' : '오답'}
                                </span>
                              )}
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

                            <div className="space-y-2 mb-4">
                              {simQ.choices.map((choice) => {
                                const choiceUpper = choice.id.toUpperCase();
                                const isCorrectChoice = simQ.correctAnswer.toUpperCase() === choiceUpper;
                                const isUserChoice = userSimilarAnswer === choiceUpper;

                                return (
                                  <button
                                    key={choice.id}
                                    onClick={() => {
                                      if (!hasAnswered) {
                                        setSimilarProblemAnswers(prev => ({
                                          ...prev,
                                          [similarProblemIndex]: choice.id
                                        }));
                                      }
                                    }}
                                    disabled={hasAnswered}
                                    className={`w-full p-3 rounded-md border-2 transition-all text-sm text-left ${
                                      hasAnswered
                                        ? isCorrectChoice
                                          ? 'border-green-500 bg-green-50'
                                          : isUserChoice
                                          ? 'border-red-500 bg-red-50'
                                          : 'border-gray-200 bg-white'
                                        : isUserChoice
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                    } ${hasAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className="text-xs text-gray-700 font-medium">
                                        {choiceUpper}.
                                      </span>
                                      <span className="text-xs text-gray-900 flex-1">
                                        {choice.text}
                                      </span>
                                      {hasAnswered && isCorrectChoice && (
                                        <span className="text-xs text-green-700 font-medium">
                                          ✓ 정답
                                        </span>
                                      )}
                                      {hasAnswered && isUserChoice && !isCorrectChoice && (
                                        <span className="text-xs text-red-700 font-medium">
                                          ✗ 선택
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Result Message */}
                            {hasAnswered && (
                              <div className={`p-3 rounded-lg text-sm ${
                                isCorrectAnswer
                                  ? 'bg-green-50 border border-green-200 text-green-800'
                                  : 'bg-red-50 border border-red-200 text-red-800'
                              }`}>
                                {isCorrectAnswer
                                  ? '정답입니다! 훌륭합니다.'
                                  : `오답입니다. 정답은 ${simQ.correctAnswer.toUpperCase()}입니다.`}
                              </div>
                            )}

                            {/* Check Answer Button */}
                            {!hasAnswered && userSimilarAnswer && (
                              <div className="flex justify-center mt-4">
                                <button
                                  onClick={() => {
                                    setShowSimilarResults(prev => ({
                                      ...prev,
                                      [similarProblemIndex]: true
                                    }));
                                  }}
                                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                >
                                  다음
                                </button>
                              </div>
                            )}

                            {/* Progress Indicator */}
                            <div className="mt-4 text-center text-xs text-gray-500">
                              {Object.keys(showSimilarResults).filter(k => showSimilarResults[parseInt(k)]).length} / 3 완료
                            </div>
                          </div>
                        );
                      })()}
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

          <div className="flex items-center gap-4">
            <Button
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className={`flex items-center gap-3 px-8 py-2.5 rounded-full h-11 min-w-[130px] justify-center text-[15px] font-semibold ${!canGoPrevious ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'text-white'}`}
              style={canGoPrevious ? { backgroundColor: '#2B478B' } : undefined}
              onMouseEnter={canGoPrevious ? (e) => e.currentTarget.style.backgroundColor = '#1F3666' : undefined}
              onMouseLeave={canGoPrevious ? (e) => e.currentTarget.style.backgroundColor = '#2B478B' : undefined}
            >
              <ChevronLeft className="h-5 w-5" />
              Back
            </Button>
            <Button
              onClick={onNext}
              disabled={!canGoNext}
              className={`flex items-center gap-3 px-8 py-2.5 rounded-full h-11 min-w-[130px] justify-center text-[15px] font-semibold ${!canGoNext ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'text-white'}`}
              style={canGoNext ? { backgroundColor: '#2B478B' } : undefined}
              onMouseEnter={canGoNext ? (e) => e.currentTarget.style.backgroundColor = '#1F3666' : undefined}
              onMouseLeave={canGoNext ? (e) => e.currentTarget.style.backgroundColor = '#2B478B' : undefined}
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}