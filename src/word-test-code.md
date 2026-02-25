# 단어 테스트 관련 코드

이 파일은 단어 관리의 "테스트" 기능과 관련된 모든 코드를 포함합니다.

## 1. 컴포넌트: WordTest.tsx

```tsx
import React from 'react';

interface WordTestProps {
  selectedWordList: any;
  currentWordIndex: number;
  setCurrentWordIndex: (index: number) => void;
  testAnswers: {[key: number]: string};
  setTestAnswers: (answers: {[key: number]: string} | ((prev: {[key: number]: string}) => {[key: number]: string})) => void;
  showTestResult: {[key: number]: boolean};
  setShowTestResult: (results: {[key: number]: boolean} | ((prev: {[key: number]: boolean}) => {[key: number]: boolean})) => void;
  subjectiveAnswer: string;
  setSubjectiveAnswer: (answer: string) => void;
  setWordStudyMode: (mode: 'list' | 'flashcard' | 'test') => void;
  generateTestOptions: (definition: string, allWords: any[], currentIndex: number) => string[];
  handleTestAnswer: (questionIndex: number, answer: string, correctAnswer: string) => void;
  handleNextWord: () => void;
  handleRetryQuestion: (questionIndex: number) => void;
  incorrectQuestions: number[];
  setIncorrectQuestions: (questions: number[] | ((prev: number[]) => number[])) => void;
  testType: 'multiple' | 'subjective' | 'mixed';
}

export function WordTest({
  selectedWordList,
  currentWordIndex,
  setCurrentWordIndex,
  testAnswers,
  setTestAnswers,
  showTestResult,
  setShowTestResult,
  subjectiveAnswer,
  setSubjectiveAnswer,
  setWordStudyMode,
  generateTestOptions,
  handleTestAnswer,
  handleNextWord,
  handleRetryQuestion,
  incorrectQuestions,
  setIncorrectQuestions,
  testType
}: WordTestProps) {
  
  const [showHint, setShowHint] = React.useState(false);
  
  // Reset hint when moving to next question
  React.useEffect(() => {
    setShowHint(false);
  }, [currentWordIndex]);
  
  // Calculate total questions and type based on testType
  const totalQuestions = testType === 'mixed' 
    ? selectedWordList.words.length * 2 // Each word twice: multiple choice + subjective
    : selectedWordList.words.length; // Each word once
    
  const shouldShowReview = currentWordIndex % 10 === 0 && currentWordIndex !== 0 && currentWordIndex < totalQuestions && !showTestResult[currentWordIndex];
  
  // Determine if current question is multiple choice based on testType
  let isMultipleChoice: boolean;
  let wordIdx: number;
  
  if (testType === 'multiple') {
    isMultipleChoice = true;
    wordIdx = currentWordIndex;
  } else if (testType === 'subjective') {
    isMultipleChoice = false;
    wordIdx = currentWordIndex;
  } else { // mixed
    isMultipleChoice = Math.floor(currentWordIndex / 10) % 2 === 0;
    wordIdx = Math.floor(currentWordIndex / 20) * 10 + (currentWordIndex % 10);
  }
  
  const currentWord = selectedWordList.words[wordIdx];
  
  // Review Screen
  if (shouldShowReview) {
    const roundStart = currentWordIndex - 10;
    const roundEnd = currentWordIndex;
    
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl">학습하기</h2>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl mb-2">잘했어요. 점점 더 나아가고 있어요.</h2>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all" 
                  style={{ width: `${(currentWordIndex / totalQuestions) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                총 세트 전체률: <span className="text-green-600">{Math.round((currentWordIndex / totalQuestions) * 100)}%</span>
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">정답</span>
              <span className="text-gray-600">총 문제</span>
            </div>
          </div>

          <h3 className="text-lg mb-4">이 라운드에서 학습한 단어</h3>
          <div className="space-y-3 mb-6">
            {Array.from({ length: 10 }).map((_, idx) => {
              const questionIdx = roundStart + idx;
              let qWordIdx: number;
              if (testType === 'mixed') {
                qWordIdx = Math.floor(questionIdx / 20) * 10 + (questionIdx % 10);
              } else {
                qWordIdx = questionIdx;
              }
              const word = selectedWordList.words[qWordIdx];
              
              if (!word) return null;
              
              return (
                <div key={questionIdx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-gray-800">{word.word}</span>
                    <span className="text-gray-500 text-sm">{word.definition}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-gray-200 rounded">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.122-2.121" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                // Move to next question - don't mark current as answered
                handleNextWord();
              }}
              className="px-8 py-3 rounded-lg text-white hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#4F46E5' }}
            >
              계속
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Test Complete Screen
  if (!currentWord || currentWordIndex >= totalQuestions) {
    // Calculate results
    const correctAnswers = Object.keys(showTestResult).filter(idx => {
      const qWordIdx = Math.floor(Number(idx) / 20) * 10 + (Number(idx) % 10);
      const word = selectedWordList.words[qWordIdx];
      return testAnswers[Number(idx)] === word?.word;
    }).length;
    const totalAnswered = Object.keys(showTestResult).length;
    const incorrectAnswers = totalAnswered - correctAnswers;
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
    
    const handleDownloadResults = () => {
      const results = {
        testTitle: selectedWordList.title,
        testDate: new Date().toLocaleDateString('ko-KR'),
        totalQuestions: totalAnswered,
        correctAnswers,
        incorrectAnswers,
        accuracy: `${accuracy}%`,
        words: selectedWordList.words.map((word: any, idx: number) => ({
          word: word.word,
          definition: word.definition,
          context: word.context,
          multipleChoiceResult: showTestResult[idx] ? (testAnswers[idx] === word.word ? '정답' : '오답') : '미응답',
          subjectiveResult: showTestResult[idx + 10] ? (testAnswers[idx + 10] === word.word ? '정답' : '오답') : '미응답'
        }))
      };
      
      const dataStr = JSON.stringify(results, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `단어테스트_결과_${new Date().toLocaleDateString('ko-KR')}.json`;
      link.click();
      URL.revokeObjectURL(url);
    };
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl mb-3">🎉 테스트 완료!</h2>
            <p className="text-gray-600">모든 단어 학습을 완료했습니다.</p>
          </div>
          
          {/* Score Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg mb-4 text-center">점수 요약</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl mb-1">{accuracy}%</div>
                <div className="text-sm text-gray-600">정답률</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-green-600 mb-1">{correctAnswers}</div>
                <div className="text-sm text-gray-600">정답</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-orange-600 mb-1">{incorrectAnswers}</div>
                <div className="text-sm text-gray-600">오답</div>
              </div>
            </div>
            <div className="text-center text-sm text-gray-500">
              총 {totalAnswered}문제 응답
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setWordStudyMode('list');
                setCurrentWordIndex(0);
                setTestAnswers({});
                setShowTestResult({});
                setSubjectiveAnswer('');
              }}
              className="w-full px-8 py-3 rounded-lg text-white hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#4F46E5' }}
            >
              단어 목록으로 돌아가기
            </button>
            
            <button
              onClick={handleDownloadResults}
              className="w-full px-6 py-2 text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              학습 결과 다운로드 (JSON)
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Regular Question
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl">학습하기</h2>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-1">
            {Array.from({ length: totalQuestions }).map((_, idx) => {
              const isAnswered = showTestResult[idx];
              const qWordIdx = Math.floor(idx / 20) * 10 + (idx % 10);
              const isCorrect = isAnswered && testAnswers[idx] === selectedWordList.words[qWordIdx]?.word;
              
              return (
                <div
                  key={idx}
                  className={`flex-1 h-3 rounded-full transition-all relative ${
                    isCorrect
                      ? 'bg-green-500'
                      : isAnswered
                      ? 'bg-orange-500'
                      : idx === currentWordIndex
                      ? 'bg-gray-400'
                      : 'bg-gray-200'
                  }`}
                >
                  {idx === currentWordIndex && (
                    <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded-full">
                      {idx + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {totalQuestions}
          </span>
        </div>
      </div>

      {/* Test Card - Multiple Choice */}
      {isMultipleChoice ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          {/* Word Definition */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">뜻</span>
              <button className="p-1 hover:bg-gray-100 rounded-full">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.122-2.121" />
                </svg>
              </button>
            </div>
            <p className="text-xl text-gray-800 leading-relaxed">
              {currentWord?.definition}
            </p>
          </div>

          {/* Answer Options */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm ${
                showTestResult[currentWordIndex] && testAnswers[currentWordIndex] === currentWord?.word
                  ? 'text-green-600'
                  : showTestResult[currentWordIndex] && testAnswers[currentWordIndex] !== currentWord?.word
                  ? 'text-orange-600'
                  : 'text-gray-600'
              }`}>
                {showTestResult[currentWordIndex] && testAnswers[currentWordIndex] === currentWord?.word
                  ? ['잘했어요!', '훌륭해요!', '정답입니다'][currentWordIndex % 3]
                  : showTestResult[currentWordIndex] && testAnswers[currentWordIndex] !== currentWord?.word
                  ? '걱정하지 마세요, 아직 배우고 있잖아요!'
                  : '정답을 고르세요'}
              </p>
              {/* Retry button for incorrect answers */}
              {showTestResult[currentWordIndex] && testAnswers[currentWordIndex] !== currentWord?.word && (
                <button
                  onClick={() => handleRetryQuestion(currentWordIndex)}
                  className="text-sm text-orange-600 hover:underline"
                >
                  다시 해봅시다
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {generateTestOptions(
                currentWord?.definition,
                selectedWordList.words,
                wordIdx
              ).map((option, idx) => {
                const isSelected = testAnswers[currentWordIndex] === option;
                const isCorrect = option === currentWord?.word;
                const showResult = showTestResult[currentWordIndex];
                
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      handleTestAnswer(currentWordIndex, option, currentWord?.word);
                    }}
                    disabled={showResult}
                    className={`p-4 text-left rounded-lg transition-all relative ${
                      showResult && isCorrect
                        ? 'border-2 border-green-500 bg-white'
                        : showResult && isSelected && !isCorrect
                        ? 'border-2 border-orange-500 bg-white'
                        : showResult && !isSelected && isCorrect
                        ? 'border-2 border-dashed border-green-500 bg-white'
                        : 'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    style={showResult && !isSelected && isCorrect ? { borderStyle: 'dashed' } : {}}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <span className={`text-sm ${
                          showResult && isCorrect
                            ? 'text-green-600'
                            : showResult && isSelected && !isCorrect
                            ? 'text-orange-600'
                            : 'text-gray-500'
                        }`}>
                          {showResult && isCorrect
                            ? '✓'
                            : showResult && isSelected && !isCorrect
                            ? 'X'
                            : idx + 1}
                        </span>
                        <span className="text-gray-800">{option}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Help Link */}
          <div className="flex justify-end">
            <button className="text-sm text-blue-600 hover:underline">
              모르시겠어요?
            </button>
          </div>
        </div>
      ) : (
        /* Subjective Question */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          {/* Word Type */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-gray-600">뜻</span>
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.122-2.121" />
              </svg>
            </button>
          </div>

          {/* Definition */}
          <p className="text-xl text-gray-800 leading-relaxed mb-12">
            {currentWord?.definition}
          </p>

          {/* Feedback and Answer */}
          {showTestResult[currentWordIndex] ? (
            <>
              {testAnswers[currentWordIndex] === currentWord?.word ? (
                // Correct Answer
                <>
                  <p className="text-green-600 text-sm mb-4">
                    {['잘했어요!', '훌륭해요!', '정답입니다'][currentWordIndex % 3]}
                  </p>
                  
                  {/* Correct Answer */}
                  <div className="p-4 rounded-lg border-2 border-green-500 bg-white">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-800">{currentWord?.word}</span>
                    </div>
                  </div>
                </>
              ) : (
                // Wrong Answer
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-orange-600 text-sm">
                      걱정하지 마세요, 아직 배우고 있잖아요!
                    </p>
                    {/* Retry button for incorrect answers */}
                    <button
                      onClick={() => handleRetryQuestion(currentWordIndex)}
                      className="text-sm text-orange-600 hover:underline"
                    >
                      다시 해봅시다
                    </button>
                  </div>
                  
                  {/* Wrong Answer */}
                  <div className="mb-4 p-4 rounded-lg border-2 border-orange-500 bg-white">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">✕</span>
                      <span className="text-gray-800">{testAnswers[currentWordIndex]}</span>
                    </div>
                  </div>

                  {/* Correct Answer Label */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-green-600">정답</h3>
                    <button className="text-sm text-blue-600 hover:underline">
                      정답으로 처리하기
                    </button>
                  </div>

                  {/* Correct Answer */}
                  <div className="p-4 rounded-lg border-2 border-dashed border-green-500 bg-white">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-800">{currentWord?.word}</span>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Answer Input Section */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-600 mb-3">희원님의 답</h3>
                <input
                  type="text"
                  value={subjectiveAnswer}
                  onChange={(e) => setSubjectiveAnswer(e.target.value)}
                  placeholder="정답을 입력하세요"
                  className="w-full p-4 border-2 border-blue-400 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Hint and Submit Section */}
              <div className="flex items-center justify-between mb-6">
                {/* Hint Button and Hint Display */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowHint(!showHint)}
                    className="px-4 py-2 text-sm text-blue-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    힌트 보기
                  </button>
                  
                  {/* Hint Display - Show inline next to button */}
                  {showHint && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">></span>
                      <span className="text-sm text-gray-600">
                        {currentWord?.word?.slice(0, Math.min(4, currentWord?.word?.length || 0))}___
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Right side: Don't know + Submit button */}
                <div className="flex items-center gap-3">
                  <button className="text-sm text-blue-600 hover:underline">
                    모르시겠어요?
                  </button>
                  
                  {/* Submit Button - Only show when answer is entered */}
                  {subjectiveAnswer.trim() && (
                    <button
                      onClick={() => {
                        handleTestAnswer(currentWordIndex, subjectiveAnswer.trim(), currentWord?.word);
                        setShowHint(false); // Reset hint when submitting
                      }}
                      className="px-5 py-2 text-sm rounded-full text-white hover:opacity-90 transition-colors"
                      style={{ backgroundColor: '#1E40AF' }}
                    >
                      답하기
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Continue Button and Message */}
      {showTestResult[currentWordIndex] && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            정답을 클릭하거나 이동 키나 놓고 계속하세요
          </p>
          <button
            onClick={() => {
              if (currentWordIndex < totalQuestions - 1) {
                handleNextWord();
              } else {
                // Test complete
                setWordStudyMode('list');
                setCurrentWordIndex(0);
                setTestAnswers({});
                setShowTestResult({});
                setSubjectiveAnswer('');
              }
            }}
            className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-colors text-sm"
            style={{ backgroundColor: '#1E40AF' }}
          >
            계속
          </button>
        </div>
      )}
    </div>
  );
}
```

## 2. Dashboard.tsx State 관리

```tsx
// State 선언부
const [wordStudyMode, setWordStudyMode] = useState<'list' | 'flashcard' | 'test' | 'browse'>('list');
const [selectedWordList, setSelectedWordList] = useState<any>(null);
const [currentWordIndex, setCurrentWordIndex] = useState(0);
const [testAnswers, setTestAnswers] = useState<{[key: number]: string}>({});
const [showTestResult, setShowTestResult] = useState<{[key: number]: boolean}>({});
const [subjectiveAnswer, setSubjectiveAnswer] = useState('');
const [incorrectQuestions, setIncorrectQuestions] = useState<number[]>([]);
const [completedWordTests, setCompletedWordTests] = useState<any[]>([]);
const [viewedWordLists, setViewedWordLists] = useState<any[]>([]);
const [showTestDialog, setShowTestDialog] = useState(false);
const [testType, setTestType] = useState<'multiple' | 'subjective' | 'mixed'>('multiple');
```

## 3. 테스트 관련 핸들러 함수들

```tsx
// 단어 테스트 시작
const handleStartWordTest = (wordList: any) => {
  setSelectedWordList(wordList);
  setCurrentWordIndex(0);
  setWordStudyMode('test');
  setTestAnswers({});
  setShowTestResult({});
};

// 다음 단어로 이동
const handleNextWord = () => {
  if (selectedWordList && currentWordIndex < selectedWordList.words.length - 1) {
    setCurrentWordIndex(currentWordIndex + 1);
    setIsFlashcardFlipped(false);
    setSubjectiveAnswer('');
  }
};

// 테스트 옵션 생성 (객관식)
const generateTestOptions = (correctAnswer: string, allWords: any[], seed: number) => {
  const currentWord = allWords.find(w => w.definition === correctAnswer);
  
  // Seeded random function for consistent ordering per question
  const seededRandom = (index: number) => {
    const x = Math.sin(seed * 9999 + index * 1234) * 10000;
    return x - Math.floor(x);
  };
  
  const incorrectOptions = allWords
    .filter(w => w.word !== currentWord?.word)
    .map((w, idx) => ({ word: w.word, sortKey: seededRandom(idx) }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(0, 3)
    .map(item => item.word);
  
  const allOptions = [currentWord?.word, ...incorrectOptions];
  const sortedOptions = allOptions
    .map((opt, idx) => ({ word: opt, sortKey: seededRandom(idx + 100) }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(item => item.word);
  
  return sortedOptions;
};

// 테스트 답변 처리 (정답 체크 + 사운드)
const handleTestAnswer = (questionIndex: number, answer: string, correctAnswer: string) => {
  setTestAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  setShowTestResult(prev => ({ ...prev, [questionIndex]: true }));
  
  // Track incorrect answers
  if (answer !== correctAnswer) {
    setIncorrectQuestions(prev => {
      if (!prev.includes(questionIndex)) {
        return [...prev, questionIndex];
      }
      return prev;
    });
  }
  
  // Play sound based on answer correctness
  try {
    if (answer === correctAnswer) {
      // Correct answer - "슥싹" check mark sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a quick swoosh sound followed by a light tap
      // First swoosh (슥)
      const swooshOsc = audioContext.createOscillator();
      const swooshGain = audioContext.createGain();
      const swooshFilter = audioContext.createBiquadFilter();
      
      swooshOsc.connect(swooshFilter);
      swooshFilter.connect(swooshGain);
      swooshGain.connect(audioContext.destination);
      
      swooshOsc.type = 'sawtooth';
      swooshFilter.type = 'highpass';
      swooshFilter.frequency.value = 1000;
      
      // Quick frequency drop for swoosh effect
      swooshOsc.frequency.setValueAtTime(2000, audioContext.currentTime);
      swooshOsc.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.08);
      
      swooshGain.gain.setValueAtTime(0.1, audioContext.currentTime);
      swooshGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
      
      swooshOsc.start(audioContext.currentTime);
      swooshOsc.stop(audioContext.currentTime + 0.08);
      
      // Second tap (싹)
      const tapOsc = audioContext.createOscillator();
      const tapGain = audioContext.createGain();
      
      tapOsc.connect(tapGain);
      tapGain.connect(audioContext.destination);
      
      tapOsc.type = 'sine';
      tapOsc.frequency.value = 1200;
      
      const tapStart = audioContext.currentTime + 0.06;
      tapGain.gain.setValueAtTime(0.12, tapStart);
      tapGain.gain.exponentialRampToValueAtTime(0.01, tapStart + 0.05);
      
      tapOsc.start(tapStart);
      tapOsc.stop(tapStart + 0.05);
    } else {
      // Wrong answer - electric zap sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create electric zapping sound with noise
      const bufferSize = audioContext.sampleRate * 0.15;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate noisy electric sound
      for (let i = 0; i < bufferSize; i++) {
        const randomValue = Math.random() * 2 - 1;
        const decay = 1 - (i / bufferSize);
        data[i] = randomValue * decay * 0.3;
      }
      
      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = buffer;
      
      const noiseFilter = audioContext.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 800;
      noiseFilter.Q.value = 5;
      
      const noiseGain = audioContext.createGain();
      noiseGain.gain.setValueAtTime(0.25, audioContext.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);
      
      noiseSource.start(audioContext.currentTime);
      
      // Add buzzing oscillator for electric feel
      const buzzOsc = audioContext.createOscillator();
      const buzzGain = audioContext.createGain();
      
      buzzOsc.type = 'square';
      buzzOsc.frequency.setValueAtTime(120, audioContext.currentTime);
      buzzOsc.frequency.linearRampToValueAtTime(80, audioContext.currentTime + 0.15);
      
      buzzGain.gain.setValueAtTime(0.15, audioContext.currentTime);
      buzzGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      buzzOsc.connect(buzzGain);
      buzzGain.connect(audioContext.destination);
      
      buzzOsc.start(audioContext.currentTime);
      buzzOsc.stop(audioContext.currentTime + 0.15);
    }
  } catch (error) {
    console.log('Audio playback failed:', error);
  }
};

// 틀린 문제 다시 풀기
const handleRetryQuestion = (questionIndex: number) => {
  // Reset the question to be answered again
  setTestAnswers(prev => {
    const newAnswers = { ...prev };
    delete newAnswers[questionIndex];
    return newAnswers;
  });
  setShowTestResult(prev => {
    const newResults = { ...prev };
    delete newResults[questionIndex];
    return newResults;
  });
  setSubjectiveAnswer('');
};

// 단어 목록으로 돌아가기 (테스트 결과 저장)
const handleBackToWordLists = () => {
  // Save to viewedWordLists (단어목록) - for any mode
  if (selectedWordList) {
    const alreadyViewed = viewedWordLists.some(list => list.id === selectedWordList.id);
    
    if (!alreadyViewed) {
      const viewedList = {
        ...selectedWordList,
        viewedDate: new Date().toLocaleDateString('ko-KR'),
        wordCount: selectedWordList.words.length,
        mastered: wordStudyMode === 'test' ? Object.values(showTestResult).filter(result => result === true).length : 0,
        learning: selectedWordList.words.length - (wordStudyMode === 'test' ? Object.values(showTestResult).filter(result => result === true).length : 0)
      };
      
      setViewedWordLists(prev => [viewedList, ...prev]);
    }
  }
  
  // Save completed test if it was a test mode and has answers
  if (selectedWordList && wordStudyMode === 'test' && Object.keys(testAnswers).length > 0) {
    const testId = selectedWordList.id;
    
    // Check if this test is not already in completedWordTests
    const alreadyCompleted = completedWordTests.some(test => test.id === testId);
    
    if (!alreadyCompleted) {
      const completedTest = {
        id: testId,
        title: selectedWordList.title,
        description: selectedWordList.description,
        completedDate: new Date().toLocaleDateString('ko-KR'),
        totalQuestions: selectedWordList.words.length,
        answeredQuestions: Object.keys(testAnswers).length,
        correctAnswers: Object.values(showTestResult).filter(result => result === true).length,
        type: selectedWordList.type,
        category: selectedWordList.category,
        difficulty: selectedWordList.difficulty
      };
      
      setCompletedWordTests(prev => [completedTest, ...prev]);
    }
  }
  
  setSelectedWordList(null);
  setWordStudyMode('browse');
  setShowWordBrowseView(true);
  setCurrentWordIndex(0);
  setTestAnswers({});
  setShowTestResult({});
  setIncorrectQuestions([]);
};
```

## 4. 테스트 타입 선택 UI (Dashboard.tsx 내부)

```tsx
{/* 테스트 버튼 with 옵션 메뉴 */}
<div className="relative">
  <button
    onClick={() => setShowTestDialog(!showTestDialog)}
    className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all ${
      wordStudyMode === 'test'
        ? 'bg-blue-600 text-white border-2 border-blue-600'
        : 'bg-gray-100 border-2 border-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
    title="테스트 옵션"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    테스트
  </button>
  
  {/* 테스트 옵션 다이얼로그 */}
  {showTestDialog && (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setShowTestDialog(false)}
      />
      <div className="absolute top-full mt-2 -left-12 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 min-w-max">
        <div className="flex gap-1.5">
          {/* 객관식 버튼 */}
          <button
            onClick={() => {
              setTestType('multiple');
              setWordStudyMode('test');
              setCurrentWordIndex(0);
              setTestAnswers({});
              setShowTestResult({});
              setSubjectiveAnswer('');
              setShowTestDialog(false);
            }}
            className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border-2 border-transparent hover:border-blue-200"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-xs text-center">
              <div className="font-medium text-gray-700">객관식</div>
            </div>
          </button>
          
          {/* 주관식 버튼 */}
          <button
            onClick={() => {
              setTestType('subjective');
              setWordStudyMode('test');
              setCurrentWordIndex(0);
              setTestAnswers({});
              setShowTestResult({});
              setSubjectiveAnswer('');
              setShowTestDialog(false);
            }}
            className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border-2 border-transparent hover:border-blue-200"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="text-xs text-center">
              <div className="font-medium text-gray-700">주관식</div>
            </div>
          </button>
          
          {/* 혼합 버튼 */}
          <button
            onClick={() => {
              setTestType('mixed');
              setWordStudyMode('test');
              setCurrentWordIndex(0);
              setTestAnswers({});
              setShowTestResult({});
              setSubjectiveAnswer('');
              setShowTestDialog(false);
            }}
            className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border-2 border-transparent hover:border-blue-200"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div className="text-xs text-center">
              <div className="font-medium text-gray-700">혼합</div>
            </div>
          </button>
        </div>
      </div>
    </>
  )}
</div>
```

## 5. WordTest 컴포넌트 사용 예시

```tsx
{wordStudyMode === 'test' && (
  <WordTest
    selectedWordList={selectedWordList}
    currentWordIndex={currentWordIndex}
    setCurrentWordIndex={setCurrentWordIndex}
    testAnswers={testAnswers}
    setTestAnswers={setTestAnswers}
    showTestResult={showTestResult}
    setShowTestResult={setShowTestResult}
    subjectiveAnswer={subjectiveAnswer}
    setSubjectiveAnswer={setSubjectiveAnswer}
    setWordStudyMode={setWordStudyMode}
    generateTestOptions={generateTestOptions}
    handleTestAnswer={handleTestAnswer}
    handleNextWord={handleNextWord}
    handleRetryQuestion={handleRetryQuestion}
    incorrectQuestions={incorrectQuestions}
    setIncorrectQuestions={setIncorrectQuestions}
    testType={testType}
  />
)}
```

## 6. 주요 기능 설명

### 6.1 테스트 타입
- **객관식 (multiple)**: 4지선다형 객관식 문제
- **주관식 (subjective)**: 직접 입력하는 주관식 문제
- **혼합 (mixed)**: 객관식과 주관식이 섞인 형태 (10문제씩 번갈아가며)

### 6.2 진행 상태
- **Progress Bar**: 전체 문제 중 현재 위치와 정답/오답 상태 시각화
- **Review Screen**: 10문제마다 중간 리뷰 화면 표시
- **Completion Screen**: 모든 문제 완료 시 결과 요약 및 다운로드 옵션

### 6.3 사운드 피드백
- **정답 사운드**: "슥싹" 체크 마크 소리 (swoosh + tap)
- **오답 사운드**: 전기 충격 소리 (electric zap)

### 6.4 재시도 기능
- 틀린 문제는 "다시 해봅시다" 버튼으로 재시도 가능
- 재시도 시 답변과 결과가 초기화됨

### 6.5 힌트 기능 (주관식)
- 단어의 처음 4글자를 힌트로 제공
- 힌트 보기/숨기기 토글 가능

### 6.6 결과 저장
- **completedWordTests**: 완료한 테스트 목록 저장
- **viewedWordLists**: 학습한 단어 목록 저장
- JSON 형식으로 결과 다운로드 가능

## 7. 데이터 구조

### 7.1 Word 객체
```typescript
interface Word {
  word: string;          // 단어
  definition: string;    // 정의/뜻
  context?: string;      // 예문/문맥
}
```

### 7.2 WordList 객체
```typescript
interface WordList {
  id: string;
  title: string;
  description: string;
  words: Word[];
  type?: string;
  category?: string;
  difficulty?: string;
}
```

### 7.3 TestAnswers State
```typescript
{
  [questionIndex: number]: string  // 문제 번호 -> 답변
}
```

### 7.4 ShowTestResult State
```typescript
{
  [questionIndex: number]: boolean  // 문제 번호 -> 답변 여부
}
```

---

이 코드를 복사해서 원하는 곳에 사용하시면 됩니다!
