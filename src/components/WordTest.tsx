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
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-xl">학습하기</h2>
          <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
          <h2 className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2">잘했어요. 점점 더 나아가고 있어요.</h2>
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all" 
                  style={{ width: `${(currentWordIndex / totalQuestions) * 100}%` }}
                />
              </div>
              <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                총 세트 전체률: <span className="text-green-600">{Math.round((currentWordIndex / totalQuestions) * 100)}%</span>
              </span>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm sm:text-base text-gray-600">정답</span>
              <span className="text-sm sm:text-base text-gray-600">총 문제</span>
            </div>
          </div>

          <h3 className="text-base sm:text-lg mb-3 sm:mb-4">이 라운드에서 학습한 단어</h3>
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
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
                <div key={questionIdx} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1 min-w-0">
                    <span className="text-sm sm:text-base text-gray-800 font-medium">{word.word}</span>
                    <span className="text-xs sm:text-sm text-gray-500 truncate">{word.definition}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button className="p-1 sm:p-1.5 hover:bg-gray-200 rounded">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <button className="p-1 sm:p-1.5 hover:bg-gray-200 rounded">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg text-white hover:opacity-90 transition-colors"
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl mb-2 sm:mb-3">🎉 테스트 완료!</h2>
            <p className="text-sm sm:text-base text-gray-600">모든 단어 학습을 완료했습니다.</p>
          </div>
          
          {/* Score Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg mb-3 sm:mb-4 text-center">점수 요약</h3>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-1">{accuracy}%</div>
                <div className="text-xs sm:text-sm text-gray-600">정답률</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl text-green-600 mb-1">{correctAnswers}</div>
                <div className="text-xs sm:text-sm text-gray-600">정답</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl text-orange-600 mb-1">{incorrectAnswers}</div>
                <div className="text-xs sm:text-sm text-gray-600">오답</div>
              </div>
            </div>
            <div className="text-center text-xs sm:text-sm text-gray-500">
              총 {totalAnswered}문제 응답
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <button
              onClick={() => {
                setWordStudyMode('list');
                setCurrentWordIndex(0);
                setTestAnswers({});
                setShowTestResult({});
                setSubjectiveAnswer('');
              }}
              className="w-full px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg text-white hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#4F46E5' }}
            >
              단어 목록으로 돌아가기
            </button>
            
            <button
              onClick={handleDownloadResults}
              className="w-full px-4 sm:px-6 py-2 text-xs sm:text-sm rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-8">
        <h2 className="text-lg sm:text-xl">학습하기</h2>
        <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 sm:mb-8">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-0.5 sm:gap-1">
            {Array.from({ length: totalQuestions }).map((_, idx) => {
              const isAnswered = showTestResult[idx];
              const qWordIdx = Math.floor(idx / 20) * 10 + (idx % 10);
              const isCorrect = isAnswered && testAnswers[idx] === selectedWordList.words[qWordIdx]?.word;
              
              return (
                <div
                  key={idx}
                  className={`flex-1 h-2 sm:h-3 rounded-full transition-all relative ${
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
                    <div className="absolute -top-6 sm:-top-7 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                      {idx + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-xs sm:text-sm text-gray-600 ml-1 sm:ml-2">
            {totalQuestions}
          </span>
        </div>
      </div>

      {/* Test Card - Multiple Choice */}
      {isMultipleChoice ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          {/* Word Definition */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm text-gray-600">뜻</span>
              <button className="p-1 hover:bg-gray-100 rounded-full">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.122-2.121" />
                </svg>
              </button>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-gray-800 leading-relaxed">
              {currentWord?.definition}
            </p>
          </div>

          {/* Answer Options */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">정답을 고르세요</h3>
            {showTestResult[currentWordIndex] && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <p className={`text-xs sm:text-sm ${
                  testAnswers[currentWordIndex] === currentWord?.word
                    ? 'text-green-600'
                    : 'text-orange-600'
                }`}>
                  {testAnswers[currentWordIndex] === currentWord?.word
                    ? ['잘했어요!', '훌륭해요!', '정답입니다'][currentWordIndex % 3]
                    : '걱정하지 마세요, 아직 배우고 있잖아요!'}
                </p>
                {/* Retry button for incorrect answers */}
                {testAnswers[currentWordIndex] !== currentWord?.word && (
                  <button
                    onClick={() => handleRetryQuestion(currentWordIndex)}
                    className="text-xs sm:text-sm text-orange-600 hover:underline whitespace-nowrap self-start sm:self-auto"
                  >
                    다시 해봅시다
                  </button>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3">
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
                    className={`p-3 sm:p-4 text-left rounded-lg transition-all relative w-full ${
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
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span className={`text-sm flex-shrink-0 ${
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
                      <span className="text-sm sm:text-base text-gray-800 break-words">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>


        </div>
      ) : (
        /* Subjective Question */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">

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
                      <span className="text-gray-400">&gt;</span>
                      <span className="text-sm text-gray-600">
                        {currentWord?.word?.slice(0, Math.min(4, currentWord?.word?.length || 0))}___
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Right side: Don't know + Submit button */}
                <div className="flex items-center gap-3">

                  
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
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
          <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
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
            className="w-full sm:w-auto px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-colors text-sm"
            style={{ backgroundColor: '#1E40AF' }}
          >
            계속
          </button>
        </div>
      )}
    </div>
  );
}