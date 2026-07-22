import { useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, ArrowLeft, Bookmark, Download } from "lucide-react";
import { SAT_AI_Widget } from "./SAT_AI_Widget";
import { Button } from "./ui/button";
import { toast } from "sonner";

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
  const [reviewingQuestion, setReviewingQuestion] = useState<any | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;
  if (!questions || !Array.isArray(questions)) return null;

  const correctAnswers = questions.reduce((count, question) => {
    const userAnswer = selectedAnswers[question.id]?.toLowerCase();
    const correctAnswer = question.correctAnswer?.toLowerCase();
    return userAnswer === correctAnswer ? count + 1 : count;
  }, 0);

  const totalQuestions = questions?.length || 0;
  const incorrectAnswers = totalQuestions - correctAnswers;

  // PDF 다운로드: 문제/정답/내 답/해설을 담은 복습 자료 생성
  const handleDownloadPDF = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    toast.info('PDF를 생성하고 있습니다. 잠시만 기다려주세요...');
    try {
      // 화면 밖 PDF 콘텐츠가 렌더링될 시간 확보
      await new Promise((r) => setTimeout(r, 300));
      const container = pdfContentRef.current;
      if (!container) throw new Error('PDF 콘텐츠를 찾을 수 없습니다.');

      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const contentWidth = pageWidth - margin * 2;
      let cursorY = margin;

      const blocks = Array.from(container.querySelectorAll('[data-pdf-block]')) as HTMLElement[];

      for (const block of blocks) {
        const canvas = await html2canvas(block, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });
        const blockHeightMm = (canvas.height * contentWidth) / canvas.width;

        if (blockHeightMm <= pageHeight - margin * 2) {
          // 한 페이지에 들어가는 블록: 필요 시 페이지 넘김 후 배치
          if (cursorY + blockHeightMm > pageHeight - margin) {
            pdf.addPage();
            cursorY = margin;
          }
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, cursorY, contentWidth, blockHeightMm);
          cursorY += blockHeightMm + 4;
        } else {
          // 페이지보다 큰 블록: 페이지 크기로 잘라서 순서대로 배치
          const sliceHeightPx = Math.floor(((pageHeight - margin * 2) / contentWidth) * canvas.width);
          let offset = 0;
          while (offset < canvas.height) {
            const h = Math.min(sliceHeightPx, canvas.height - offset);
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = h;
            const ctx = sliceCanvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
              ctx.drawImage(canvas, 0, offset, canvas.width, h, 0, 0, canvas.width, h);
            }
            const sliceHeightMm = (h * contentWidth) / canvas.width;
            if (cursorY + sliceHeightMm > pageHeight - margin && cursorY > margin) {
              pdf.addPage();
              cursorY = margin;
            }
            pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, cursorY, contentWidth, sliceHeightMm);
            cursorY += sliceHeightMm;
            offset += h;
            if (offset < canvas.height) {
              pdf.addPage();
              cursorY = margin;
            }
          }
          cursorY += 4;
        }
      }

      pdf.save(`SAT_복습자료_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF가 다운로드되었습니다!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('PDF 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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

  const handleReviewClick = (question: any) => {
    setReviewingQuestion(question);
  };

  const handlePrevQuestion = () => {
    if (!reviewingQuestion) return;
    const currentIndex = questions.findIndex(q => q.id === reviewingQuestion.id);
    if (currentIndex > 0) {
      setReviewingQuestion(questions[currentIndex - 1]);
    }
  };

  const handleNextQuestion = () => {
    if (!reviewingQuestion) return;
    const currentIndex = questions.findIndex(q => q.id === reviewingQuestion.id);
    if (currentIndex < questions.length - 1) {
      setReviewingQuestion(questions[currentIndex + 1]);
    }
  };

  if (reviewingQuestion) {
    const userAnswer = selectedAnswers[reviewingQuestion.id] ? selectedAnswers[reviewingQuestion.id].toUpperCase() : null;
    const correctAnswer = reviewingQuestion.correctAnswer?.toUpperCase() || 'A';
    const isCorrect = userAnswer === correctAnswer;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full h-full overflow-hidden bg-white flex flex-col">
          {/* Review Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setReviewingQuestion(null)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium font-sans">돌아가기</span>
              </button>
              <div className="h-4 w-px bg-gray-300" />
              <div>
                <h2 className="text-base text-gray-900 font-medium">
                  Reading and Writing: Question {reviewingQuestion.id}
                </h2>
              </div>
            </div>
            
            {/* Question Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevQuestion}
                disabled={questions.findIndex(q => q.id === reviewingQuestion.id) === 0}
                className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-600"
                title="이전 문제"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <span className="text-sm font-medium text-gray-500 tabular-nums">
                {questions.findIndex(q => q.id === reviewingQuestion.id) + 1} / {questions.length}
              </span>
              <button
                onClick={handleNextQuestion}
                disabled={questions.findIndex(q => q.id === reviewingQuestion.id) === questions.length - 1}
                className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-600"
                title="다음 문제"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Review Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Passage */}
            <div className="w-[60%] border-r border-gray-200 overflow-y-auto px-8 pt-12 pb-8 bg-white">
              <div className="max-w-2xl">
                <p className="text-gray-900 leading-[1.8] whitespace-pre-line select-text" style={{ fontSize: '20px', fontFamily: '"Times New Roman", Times, serif', fontWeight: 400 }}>
                  {reviewingQuestion.passage}
                </p>
              </div>
            </div>

            {/* Right: Question and Explanation */}
            <div className="w-[40%] overflow-y-auto px-8 pt-12 pb-8 bg-white">
              <div className="max-w-2xl">
                {/* Top Bar with Gray Background and Dashed Border (real test style) */}
                <div className="bg-[#f0f0f0] pl-0 pr-3 py-0 rounded-none border-b-2 border-dashed border-black mb-4 relative flex items-stretch h-[42px] overflow-hidden">
                  <div className="bg-black text-white w-[42px] flex items-center justify-center shrink-0">
                    <span className="font-bold" style={{ fontSize: '18px', fontFamily: '"Times New Roman", Times, serif' }}>{reviewingQuestion.id}</span>
                  </div>
                  <div className="flex items-center justify-between flex-1 pl-4">
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-[16px] w-[16px] text-[#555]" strokeWidth={2} />
                      <span className="text-[15px] font-medium text-[#333]" style={{ fontFamily: 'sans-serif' }}>
                        Mark for Review
                      </span>
                    </div>
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-5">
                  <p className="text-[#222] leading-[1.6]" style={{ fontSize: '20px', fontFamily: '"Times New Roman", Times, serif', fontWeight: 400 }}>
                    {reviewingQuestion.question}
                  </p>
                </div>

                {/* Choices (real test style with correct/incorrect highlighting) */}
                <div className="pb-6 space-y-2">
                  {reviewingQuestion.choices?.map((choice: any) => {
                    const choiceUpper = choice.id.toUpperCase();
                    const isUserChoice = userAnswer === choiceUpper;
                    const isCorrectChoice = correctAnswer === choiceUpper;

                    return (
                      <div
                        key={choice.id}
                        className={`p-3 border transition-all duration-150 relative flex items-center gap-4 rounded-lg ${
                          isCorrectChoice
                            ? "border-green-500 border-2 bg-green-50"
                            : isUserChoice
                            ? "border-red-500 border-2 bg-red-50"
                            : "border-[#888] bg-white"
                        }`}
                      >
                        <div className={`w-7 h-7 min-w-7 min-h-7 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                          isCorrectChoice
                            ? "border-green-600 bg-green-600 text-white"
                            : isUserChoice
                            ? "border-red-500 bg-red-500 text-white"
                            : "border-[#666] text-[#666]"
                        }`} style={{ fontSize: '14px', fontWeight: '700' }}>
                          {choiceUpper}
                        </div>
                        <span className={`flex-1 ${isCorrectChoice ? "text-green-700" : isUserChoice ? "text-red-600" : "text-[#000]"}`} style={{ fontSize: '18px', fontFamily: '"Times New Roman", Times, serif', fontWeight: 400, lineHeight: '1.6' }}>
                          {choice.text}
                        </span>
                        {isCorrectChoice && (
                          <span className="text-sm text-green-700 font-bold shrink-0">✓ Correct</span>
                        )}
                        {isUserChoice && !isCorrectChoice && (
                          <span className="text-sm text-red-700 font-bold shrink-0">✗ Your Answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Quick Result Summary */}
                <div className={`p-4 rounded-lg mb-8 ${isCorrect ? 'bg-green-100 border border-green-200 text-green-800' : 'bg-red-100 border border-red-200 text-red-800'}`}>
                  <p className="text-base font-bold">
                    {isCorrect ? '정답입니다!' : `오답입니다. 정답은 (${correctAnswer})입니다.`}
                  </p>
                </div>

                {/* SAT AI Tutor */}
                <SAT_AI_Widget
                  context={{
                    question: reviewingQuestion.question,
                    passage: reviewingQuestion.passage || '',
                    choices: reviewingQuestion.choices?.map((c: any) => c.text || c) || [],
                    correctAnswer: reviewingQuestion.correctAnswer,
                    userAnswer: selectedAnswers[reviewingQuestion.id],
                    isCorrect,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full h-full overflow-hidden bg-gray-50 flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-gray-200 px-3 md:px-6 py-3 md:py-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            {(showScore || showAnalysis) && (
              <button
                onClick={() => {
                  setShowScore(false);
                  setShowAnalysis(false);
                }}
                className="flex items-center gap-1.5 md:gap-2 text-[#00bcd4] hover:text-cyan-600 transition-colors mr-1 md:mr-2 shrink-0"
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-xs md:text-sm font-medium font-sans">돌아가기</span>
              </button>
            )}
            <h2 className="text-sm md:text-xl text-gray-900 whitespace-nowrap">SAT Scores</h2>
            <Button
              onClick={() => {
                setShowScore(!showScore);
                if (showAnalysis) setShowAnalysis(false);
              }}
              variant="outline"
              size="sm"
              className={`border-[#00bcd4] text-[#00bcd4] hover:bg-cyan-50 text-xs md:text-sm px-2 md:px-4 ${showScore ? 'bg-cyan-50 font-bold' : ''}`}
              style={{ borderColor: '#00bcd4', color: showScore ? 'white' : '#00bcd4', backgroundColor: showScore ? '#00bcd4' : 'transparent' }}
            >
              Score
            </Button>
            <Button
              onClick={() => {
                setShowAnalysis(!showAnalysis);
                if (showScore) setShowScore(false);
              }}
              variant="outline"
              size="sm"
              className={`border-[#00bcd4] text-[#00bcd4] hover:bg-cyan-50 text-xs md:text-sm px-2 md:px-4 ${showAnalysis ? 'bg-cyan-50 font-bold' : ''}`}
              style={{ borderColor: '#00bcd4', color: showAnalysis ? 'white' : '#00bcd4', backgroundColor: showAnalysis ? '#00bcd4' : 'transparent' }}
            >
              분석
            </Button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors shrink-0 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>


        {/* Blue Info Banner - Only show when Score tab is active */}
        {showScore && (
          <div className="px-3 md:px-6 pt-3 md:pt-4 bg-gray-50">
            <div className="text-white rounded-lg p-3 md:p-4 text-xs md:text-sm leading-relaxed" style={{ backgroundColor: '#1e3a8a' }}>
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
            <div className="p-4 md:p-8 pt-4 md:pt-6">
              {/* Score Overview - Only show when showScore is true */}
              {showScore && (
                <>
                  {/* Mobile: stacked cards */}
                  <div className="md:hidden space-y-3 mb-6">
                    {/* Total Score Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Score</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-light text-gray-900">1120</span>
                        <span className="text-xs text-gray-400">/ 1600</span>
                        <div className="bg-gray-100 px-2 py-0.5 rounded-full ml-auto">
                          <span className="text-xs text-gray-600">75th*</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Range: 1080-1160 · Avg: 1100</p>
                    </div>

                    {/* Section Scores - 2 columns */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Reading & Writing</h3>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-light text-gray-900">620</span>
                          <span className="text-xs text-gray-400">/ 800</span>
                        </div>
                        <div className="bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                          <span className="text-xs text-gray-600">60th*</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Range: 590-650</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Math</h3>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-light text-gray-900">500</span>
                          <span className="text-xs text-gray-400">/ 800</span>
                        </div>
                        <div className="bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                          <span className="text-xs text-gray-600">70th*</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Range: 470-530</p>
                      </div>
                    </div>

                    {/* Note - compact */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-500 leading-relaxed">
                      <p>* Percentiles represent the percent of 11th grade test takers from the past 3 years who scored the same as or below you. Score range is the range you could get if you took the SAT multiple times.</p>
                    </div>
                  </div>

                  {/* Desktop: 3-col grid */}
                  <div className="hidden md:grid grid-cols-3 gap-6 mb-8">
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
                </>
              )}

              {/* Knowledge and Skills - Only show when showScore is true */}
              {showScore && (
                <div className="mb-8">
                  <h3 className="text-lg md:text-xl mb-2 text-gray-900">Knowledge and Skills</h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6">View your performance across the 8 content domains measured on the SAT.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Reading and Writing */}
                    <div>
                      <h4 className="text-base md:text-lg mb-3 md:mb-4 text-gray-800">Reading and Writing</h4>
                      <div className="space-y-3 md:space-y-4">
                        {Object.entries(analysisData.reading).map(([category, data]) => (
                          <div key={category}>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <p className="text-xs md:text-sm text-gray-900">{category}</p>
                                <p className="text-xs text-gray-500">({Math.round((data.total / 56) * 100)}% of section, {data.total} Qs)</p>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: data.total }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-5 md:h-6 flex-1 ${
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
                      <h4 className="text-base md:text-lg mb-3 md:mb-4 text-gray-800">Math</h4>
                      <div className="space-y-3 md:space-y-4">
                        {Object.entries(analysisData.math).map(([category, data]) => (
                          <div key={category}>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <p className="text-xs md:text-sm text-gray-900">{category}</p>
                                <p className="text-xs text-gray-500">({Math.round((data.total / 46) * 100)}% of section, {data.total} Qs)</p>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: data.total }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-5 md:h-6 flex-1 ${
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
                  <h3 className="text-base md:text-lg mb-3 md:mb-4 text-gray-900">Questions Overview</h3>
                  
                  <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
                    <div className="bg-blue-50 rounded-lg p-3 md:p-6 text-center">
                      <div className="text-2xl md:text-3xl mb-1 md:mb-2 text-gray-800">{totalQuestions}</div>
                      <div className="text-xs md:text-sm text-gray-600">Total Questions</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 md:p-6 text-center">
                      <div className="text-2xl md:text-3xl mb-1 md:mb-2 text-gray-800">{correctAnswers}</div>
                      <div className="text-xs md:text-sm text-gray-600">Correct Answers</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 md:p-6 text-center">
                      <div className="text-2xl md:text-3xl mb-1 md:mb-2 text-gray-800">{incorrectAnswers}</div>
                      <div className="text-xs md:text-sm text-gray-600">Incorrect Answers</div>
                    </div>
                  </div>

                  {/* Mobile: card-style list */}
                  <div className="md:hidden space-y-2">
                    <div className="bg-gray-700 text-white rounded-lg px-4 py-2.5 grid grid-cols-4 text-xs font-semibold">
                      <span>Question</span>
                      <span>Section</span>
                      <span className="text-center">Correct</span>
                      <span className="text-center">Yours</span>
                    </div>
                        {questions?.map((question) => {
                          const correctAnswer = question.correctAnswer?.toUpperCase() || 'A';
                          const userAnswer = selectedAnswers[question.id] ? selectedAnswers[question.id].toUpperCase() : '';
                          
                          return (
                            <button
                              key={question.id}
                              onClick={() => handleReviewClick(question)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 grid grid-cols-4 items-center text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
                            >
                              <span className="text-gray-900 font-medium">{question.id}</span>
                              <span className="text-gray-500 text-xs">R&W</span>
                              <span className="text-center text-gray-900">{correctAnswer}</span>
                              <span className="text-center">
                                {userAnswer ? (
                                  <span className={`font-semibold ${userAnswer === correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                                    {userAnswer}
                                  </span>
                                ) : (
                                  <span className="text-red-500 font-medium text-xs">Omitted</span>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Desktop: full table */}
                      <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
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
                            {questions?.map((question) => {
                              const correctAnswer = question.correctAnswer?.toUpperCase() || 'A';
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
                                      onClick={() => handleReviewClick(question)}
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