import { useState } from "react";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import { PassagePanel } from "./PassagePanel";
import { QuestionPanel } from "./QuestionPanel";

interface Choice {
  id: string;
  text: string;
}

interface MobileExamTabsProps {
  passage: string;
  questionNumber: number;
  totalQuestions: number;
  question: string;
  choices: Choice[];
  selectedAnswer: string;
  onAnswerChange: (value: string) => void;
  isMarkedForReview?: boolean;
  onToggleMarkForReview?: () => void;
  testInfo?: any;
  onShowVideoLecture?: (questionId: number) => void;
  imageUrl?: string;
  sectionLabel?: string;
  highlightsMode?: boolean;
  isPracticeReview?: boolean;
  correctAnswer?: string;
  explanation?: string;
  onShowSimilarProblems?: () => void;
}

export function MobileExamTabs({
  passage,
  questionNumber,
  totalQuestions,
  question,
  choices,
  selectedAnswer,
  onAnswerChange,
  isMarkedForReview = false,
  onToggleMarkForReview,
  testInfo,
  onShowVideoLecture,
  imageUrl,
  sectionLabel = "Reading",
  highlightsMode = false,
  isPracticeReview = false,
  correctAnswer,
  explanation,
  onShowSimilarProblems
}: MobileExamTabsProps) {
  const [activeTab, setActiveTab] = useState<"passage" | "questions">("passage");
  const [passageExpanded, setPassageExpanded] = useState(false);

  // Get a short preview of the passage for the collapsed summary on Questions tab
  const getPassagePreview = () => {
    if (!passage) return "";
    const plainText = passage.replace(/\n+/g, " ").trim();
    return plainText.length > 100
      ? plainText.substring(0, 100) + "..."
      : plainText;
  };

  const passagePreview = getPassagePreview();

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center border-b border-gray-200 bg-white">
        {/* Back chevron */}
        <button
          className="px-2.5 py-2.5 text-gray-500"
          onClick={() => setActiveTab("passage")}
          aria-label="Back to passage"
        >
          <ChevronLeft size={18} className={activeTab === "passage" ? "text-gray-400" : "text-gray-600"} />
        </button>

        {/* Passage tab */}
        <button
          onClick={() => setActiveTab("passage")}
          className={`flex-1 text-center py-2.5 font-semibold transition-colors relative ${
            activeTab === "passage" ? "text-[#0d6e6e]" : "text-gray-500"
          }`}
          style={{ fontSize: '17px', fontFamily: '"Times New Roman", Times, serif' }}
        >
          Passage
          {activeTab === "passage" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0d6e6e] rounded-t" />
          )}
        </button>

        {/* Questions tab */}
        <button
          onClick={() => setActiveTab("questions")}
          className={`flex-1 text-center py-2.5 font-semibold transition-colors relative ${
            activeTab === "questions" ? "text-[#0d6e6e]" : "text-gray-500"
          }`}
          style={{ fontSize: '17px', fontFamily: '"Times New Roman", Times, serif' }}
        >
          Questions
          {activeTab === "questions" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0d6e6e] rounded-t" />
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "passage" ? (
          /* Passage view - full passage */
          <div className="h-full">
            <PassagePanel
              content={passage}
              highlightsMode={highlightsMode}
              isExpanded={false}
              expandDirection={null}
            />
          </div>
        ) : (
          /* Questions view - collapsed passage summary + question */
          <div className="flex flex-col h-full">
            {/* Collapsed passage summary - compact Expand/Collapse toggle */}
            {passage && passage.trim().length > 0 && (
              <div className="mx-4 mt-1">
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  {passageExpanded && (
                    <div className="px-4 py-3">
                      <p
                        className="text-gray-800 leading-[1.6]"
                        style={{
                          fontSize: '18px',
                          fontFamily: '"Times New Roman", Times, serif',
                          fontWeight: 400,
                        }}
                      >
                        {passage}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => setPassageExpanded(!passageExpanded)}
                    className="w-full flex items-center justify-end gap-1 px-2 py-1 text-[#0d6e6e] font-semibold hover:bg-gray-100 transition-colors"
                    style={{ fontSize: '11px' }}
                  >
                    {passageExpanded ? "Collapse" : "Expand"}
                    {passageExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                </div>
              </div>
            )}

            {/* Question */}
            <div className="flex-1">
              <QuestionPanel
                questionNumber={questionNumber}
                question={question}
                choices={choices}
                selectedAnswer={selectedAnswer}
                onAnswerChange={onAnswerChange}
                isMarkedForReview={isMarkedForReview}
                onToggleMarkForReview={onToggleMarkForReview}
                isExpanded={false}
                expandDirection={null}
                testInfo={testInfo}
                onShowVideoLecture={onShowVideoLecture}
                imageUrl={imageUrl}
                isPracticeReview={isPracticeReview}
                correctAnswer={correctAnswer}
                explanation={explanation}
                passage={passage}
                onShowSimilarProblems={onShowSimilarProblems}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
