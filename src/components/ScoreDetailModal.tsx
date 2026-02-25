import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface ScoreDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: any[];
  selectedAnswers: Record<number, string>;
  onReviewQuestion: (questionId: number) => void;
}

export function ScoreDetailModal({
  isOpen,
  onClose,
  questions,
  selectedAnswers,
  onReviewQuestion,
}: ScoreDetailModalProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showScore, setShowScore] = useState(false);

  if (!isOpen) return null;

  const correctAnswers = questions.reduce((count, question) => {
    const userAnswer = selectedAnswers[question.id];
    const correctAnswer = question.id === 3 ? 'c' : question.id === 4 ? 'b' : question.id === 5 ? 'b' : 'a';
    return userAnswer === correctAnswer ? count + 1 : count;
  }, 0);

  const totalQuestions = 27 * 2;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const mathScore = 200;

  // Analysis by question type
  const analysisData = {
    reading: {
      "Information and Ideas": { total: 14, correct: 10, percentage: 71 },
      "Craft and Structure": { total: 15, correct: 8, percentage: 53 },
      "Expression of Ideas": { total: 12, correct: 9, percentage: 75 },
      "Standard English Conventions": { total: 15, correct: 7, percentage: 47 },
    },
    math: {
      "Algebra": { total: 15, correct: 12, percentage: 80 },
      "Advanced Math": { total: 15, correct: 10, percentage: 67 },
      "Problem Solving & Data Analysis": { total: 9, correct: 6, percentage: 67 },
      "Geometry & Trigonometry": { total: 7, correct: 5, percentage: 71 },
    }
  };

  const getRecommendation = (category: string, percentage: number) => {
    if (percentage >= 80) {
      return `${category} 영역은 우수합니다! 이 수준을 유지하세요.`;
    } else if (percentage >= 60) {
      return `${category} 영역은 양호하지만, 추가 연습을 통해 개선할 여지가 있습니다. Training 탭에서 이 유형의 문제를 더 풀어보세요.`;
    } else {
      return `${category} 영역은 집중 학습이 필요합니다. 기본 개념을 다시 확인하고, Training 탭의 관련 문제들을 반복 연습하세요. 강의 및 특강 탭에서 관련 강의를 시청하는 것도 도움이 됩니다.`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <h2 className="text-xl text-gray-900">SAT Scores</h2>
            <Button
              onClick={() => {
                setShowScore(!showScore);
                if (showAnalysis) setShowAnalysis(false);
              }}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Score
            </Button>
            <Button
              onClick={() => {
                setShowAnalysis(!showAnalysis);
                if (showScore) setShowScore(false);
              }}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              분석
            </Button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Blue Info Banner - Only show when Score tab is active */}
        {showScore && (
          <div className="px-6 pt-4 bg-gray-50">
            <div className="text-white rounded-lg p-4 text-sm" style={{ backgroundColor: '#1e3a8a' }}>
              정확한 점수 데이터를 공개하기 어려우므로, 이 점수는 Bluebook의 여러 평가 결과를 참고한 것입니다. 각 섹션의 점수는 상하 10-20점 정도 변동될 수 있으니 참고용으로 활용하세요.
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {showAnalysis ? (
            <div className="p-8">
              {/* Analysis View */}
              <h3 className="text-2xl mb-6 text-gray-900">성적 분석 및 개선 방안</h3>

              {/* Reading and Writing Analysis */}
              <div className="mb-8">
                <h4 className="text-xl mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">Reading and Writing 영역</h4>
                <div className="space-y-6">
                  {Object.entries(analysisData.reading).map(([category, data]) => (
                    <div key={category} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h5 className="text-lg text-gray-900 mb-1">{category}</h5>
                          <p className="text-sm text-gray-600">
                            {data.correct}/{data.total} 정답 ({data.percentage}%)
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm ${
                          data.percentage >= 80 ? 'bg-green-100 text-green-800' :
                          data.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {data.percentage >= 80 ? '우수' :
                           data.percentage >= 60 ? '양호' :
                           '개선 필요'}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div
                          className={`h-3 rounded-full ${
                            data.percentage >= 80 ? 'bg-green-600' :
                            data.percentage >= 60 ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>

                      {/* Recommendation */}
                      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                        <p className="text-sm text-gray-800 mb-2">
                          <strong>개선 방안:</strong>
                        </p>
                        <p className="text-sm text-gray-700">
                          {getRecommendation(category, data.percentage)}
                        </p>
                      </div>

                      {/* Action Items */}
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-900">추천 학습 방법:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          <li>Training 탭에서 "{category}" 유형 문제 최소 20문제 풀기</li>
                          <li>틀린 문제는 Review 기능을 통해 AI 해설 확인하기</li>
                          <li>단어관리 탭에서 이 유형에서 추출된 어휘 복습하기</li>
                          {data.percentage < 60 && (
                            <li className="text-red-700">강의 및 특강 탭에서 관련 개념 강의 시청하기</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Math Analysis */}
              <div className="mb-8">
                <h4 className="text-xl mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">Math 영역</h4>
                <div className="space-y-6">
                  {Object.entries(analysisData.math).map(([category, data]) => (
                    <div key={category} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h5 className="text-lg text-gray-900 mb-1">{category}</h5>
                          <p className="text-sm text-gray-600">
                            {data.correct}/{data.total} 정답 ({data.percentage}%)
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm ${
                          data.percentage >= 80 ? 'bg-green-100 text-green-800' :
                          data.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {data.percentage >= 80 ? '우수' :
                           data.percentage >= 60 ? '양호' :
                           '개선 필요'}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div
                          className={`h-3 rounded-full ${
                            data.percentage >= 80 ? 'bg-green-600' :
                            data.percentage >= 60 ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>

                      {/* Recommendation */}
                      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                        <p className="text-sm text-gray-800 mb-2">
                          <strong>개선 방안:</strong>
                        </p>
                        <p className="text-sm text-gray-700">
                          {getRecommendation(category, data.percentage)}
                        </p>
                      </div>

                      {/* Action Items */}
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-900">추천 학습 방법:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          <li>Training 탭에서 "{category}" 유형 문제 최소 15문제 풀기</li>
                          <li>틀린 문제의 풀이 과정을 단계별로 복습하기</li>
                          <li>비슷한 유형의 문제를 반복 연습하기</li>
                          {data.percentage < 60 && (
                            <li className="text-red-700">기본 개념을 다시 학습하고 공식을 암기하기</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Recommendations */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-lg mb-3 text-gray-900">종합 학습 전략</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>✅ <strong>매일 30-60분씩</strong> 꾸준히 학습하는 것이 중요합니다.</p>
                  <p>✅ <strong>약한 영역부터 집중 공략</strong>하되, 강한 영역도 소홀히 하지 마세요.</p>
                  <p>✅ <strong>실전 모의고사</strong>를 정기적으로 풀어 시간 관리 능력을 키우세요.</p>
                  <p>✅ <strong>오답 노트</strong>를 작성하여 같은 실수를 반복하지 않도록 하세요.</p>
                  <p>✅ <strong>단어 관리</strong> 기능을 활용하여 어휘력을 지속적으로 향상시키세요.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 pt-6">
              {/* Score Overview - Only show when showScore is true */}
              {showScore && (
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {/* Total Score */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-sm text-gray-600 mb-2">TOTAL SCORE</h3>
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-5xl text-gray-900">1120</span>
                      <div className="flex flex-col text-xs text-gray-500">
                        <span>400-</span>
                        <span>1600</span>
                      </div>
                      <div className="bg-gray-100 px-3 py-1 rounded-full">
                        <span className="text-sm">75th*</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Score Range: 1080-1160</p>
                    <p className="text-xs text-gray-500">Average Score (all testers): 1100</p>
                  </div>

                  {/* Section Scores */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-sm text-gray-600 mb-4">SECTION SCORES</h3>
                    
                    <div className="mb-4">
                      <div className="flex items-baseline gap-3 mb-1">
                        <span className="text-2xl text-gray-900">620</span>
                        <div className="flex flex-col text-xs text-gray-500">
                          <span>200-</span>
                          <span>800</span>
                        </div>
                        <div className="bg-gray-100 px-2 py-0.5 rounded-full">
                          <span className="text-xs">60th*</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Reading and Writing</p>
                      <p className="text-xs text-gray-500">Your Score Range: 590-650</p>
                      <p className="text-xs text-gray-500">Average Score (all testers): 600</p>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-3 mb-1">
                        <span className="text-2xl text-gray-900">500</span>
                        <div className="flex flex-col text-xs text-gray-500">
                          <span>200-</span>
                          <span>800</span>
                        </div>
                        <div className="bg-gray-100 px-2 py-0.5 rounded-full">
                          <span className="text-xs">70th*</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Math</p>
                      <p className="text-xs text-gray-500">Your Score Range: 470-530</p>
                      <p className="text-xs text-gray-500">Average Score (all testers): 530</p>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-xs text-gray-600">
                    <p className="mb-2">* Percentiles represent the percent of 11th grade test takers from the past 3 years who scored the same as or below you.</p>
                    <p>Score range: This is the range of scores you could possibly get if you took the SAT multiple times on different days.</p>
                  </div>
                </div>
              )}

              {/* Knowledge and Skills - Only show when showScore is true */}
              {showScore && (
                <div className="mb-8">
                  <h3 className="text-xl mb-2 text-gray-900">Knowledge and Skills</h3>
                  <p className="text-sm text-gray-600 mb-6">View your performance across the 8 content domains measured on the SAT.</p>

                  <div className="grid grid-cols-2 gap-8">
                    {/* Reading and Writing */}
                    <div>
                      <h4 className="text-lg mb-4 text-gray-800">Reading and Writing</h4>
                      <div className="space-y-4">
                        {Object.entries(analysisData.reading).map(([category, data]) => (
                          <div key={category}>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <p className="text-sm text-gray-900">{category}</p>
                                <p className="text-xs text-gray-500">({Math.round((data.total / 56) * 100)}% of test section, {data.total} questions)</p>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: data.total }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-6 flex-1 ${
                                    i < data.correct ? 'bg-gray-800' : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Math */}
                    <div>
                      <h4 className="text-lg mb-4 text-gray-800">Math</h4>
                      <div className="space-y-4">
                        {Object.entries(analysisData.math).map(([category, data]) => (
                          <div key={category}>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <p className="text-sm text-gray-900">{category}</p>
                                <p className="text-xs text-gray-500">({Math.round((data.total / 46) * 100)}% of test section, {data.total} questions)</p>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: data.total }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-6 flex-1 ${
                                    i < data.correct ? 'bg-gray-800' : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions Table - Show when neither Score nor Analysis is active */}
              {!showScore && !showAnalysis && (
                <div className="mb-6">
                  <h3 className="text-lg mb-4 text-gray-900">Questions Overview</h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                      <div className="text-3xl mb-2 text-gray-800">{totalQuestions}</div>
                      <div className="text-sm text-gray-600">Total Questions</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                      <div className="text-3xl mb-2 text-gray-800">{correctAnswers}</div>
                      <div className="text-sm text-gray-600">Correct Answers</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                      <div className="text-3xl mb-2 text-gray-800">{incorrectAnswers}</div>
                      <div className="text-sm text-gray-600">Incorrect Answers</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-700 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm">Question</th>
                          <th className="px-4 py-3 text-left text-sm">Section</th>
                          <th className="px-4 py-3 text-left text-sm">Correct Answer</th>
                          <th className="px-4 py-3 text-left text-sm">Your Answer</th>
                          <th className="px-4 py-3 text-center text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {questions.map((question) => {
                          const correctAnswer = question.id === 3 ? 'C' : question.id === 4 ? 'B' : question.id === 5 ? 'B' : 'A';
                          const userAnswer = selectedAnswers[question.id] ? selectedAnswers[question.id].toUpperCase() : '';
                          
                          return (
                            <tr key={question.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{question.id}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">Reading and Writing</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{correctAnswer}</td>
                              <td className="px-4 py-3 text-sm">
                                {userAnswer ? (
                                  <span className={userAnswer === correctAnswer ? 'text-green-600' : 'text-red-600'}>
                                    {userAnswer}
                                  </span>
                                ) : (
                                  <span className="text-red-600">Omitted</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Button
                                  onClick={() => {
                                    onReviewQuestion(question.id);
                                    onClose();
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                  Review
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-white flex justify-end">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}