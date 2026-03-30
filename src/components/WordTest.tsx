import React from 'react';
import { Volume2, RotateCcw, Download, ArrowRight, CheckCircle2, XCircle, Sparkles, Target, Zap } from 'lucide-react';

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
  
  React.useEffect(() => {
    setShowHint(false);
  }, [currentWordIndex]);
  
  const totalQuestions = testType === 'mixed' 
    ? selectedWordList.words.length * 2
    : selectedWordList.words.length;
    
  const shouldShowReview = currentWordIndex % 10 === 0 && currentWordIndex !== 0 && currentWordIndex < totalQuestions && !showTestResult[currentWordIndex];
  
  let isMultipleChoice: boolean;
  let wordIdx: number;
  
  if (testType === 'multiple') {
    isMultipleChoice = true;
    wordIdx = currentWordIndex;
  } else if (testType === 'subjective') {
    isMultipleChoice = false;
    wordIdx = currentWordIndex;
  } else {
    isMultipleChoice = Math.floor(currentWordIndex / 10) % 2 === 0;
    wordIdx = Math.floor(currentWordIndex / 20) * 10 + (currentWordIndex % 10);
  }
  
  const currentWord = selectedWordList.words[wordIdx];
  const progressPercent = Math.round((currentWordIndex / totalQuestions) * 100);

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Victoria') || v.name.includes('Zira') || v.name.includes('Google US English'))
      );
      if (femaleVoice) utterance.voice = femaleVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Review Screen
  if (shouldShowReview) {
    const roundStart = currentWordIndex - 10;
    
    const correctCount = Array.from({ length: 10 }).reduce((acc: number, _, idx) => {
      const questionIdx = roundStart + idx;
      let qWordIdx: number;
      if (testType === 'mixed') {
        qWordIdx = Math.floor(questionIdx / 20) * 10 + (questionIdx % 10);
      } else {
        qWordIdx = questionIdx;
      }
      const word = selectedWordList.words[qWordIdx];
      if (word && testAnswers[questionIdx] === word.word) return acc + 1;
      return acc;
    }, 0) as number;
    
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Round Complete Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 sm:p-10 mb-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">라운드 완료!</h2>
                <p className="text-sm text-white/70">점점 더 나아가고 있어요</p>
              </div>
            </div>

            {/* Progress Ring */}
            <div className="flex items-center gap-6 sm:gap-10 mt-6">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#progressGradient)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(correctCount / 10) * 264} 264`} />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#6ee7b7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold text-white">{correctCount}</span>
                  <span className="text-xs text-white/60">/10</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-sm text-white/80">정답</span>
                  <span className="ml-auto text-lg font-bold text-emerald-400">{correctCount}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-400" />
                  <span className="text-sm text-white/80">오답</span>
                  <span className="ml-auto text-lg font-bold text-orange-400">{10 - correctCount}</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/60">전체 진행률</span>
                  <span className="ml-auto text-sm font-semibold text-white">{progressPercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Word Review List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">이 라운드에서 학습한 단어</h3>
          </div>
          <div className="divide-y divide-gray-50">
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
              const isCorrect = testAnswers[questionIdx] === word.word;
              
              return (
                <div key={questionIdx} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors group">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isCorrect ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-800">{word.word}</span>
                    <span className="text-xs text-gray-400 ml-2 truncate">{word.definition}</span>
                  </div>
                  <button 
                    onClick={() => speakWord(word.word)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => handleNextWord()}
            className="group flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all"
          >
            계속하기
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    );
  }
  
  // Test Complete Screen
  if (!currentWord || currentWordIndex >= totalQuestions) {
    const correctAnswers = Object.keys(showTestResult).filter(idx => {
      const qWordIdx = testType === 'mixed' 
        ? Math.floor(Number(idx) / 20) * 10 + (Number(idx) % 10)
        : Number(idx);
      const word = selectedWordList.words[qWordIdx];
      return testAnswers[Number(idx)] === word?.word;
    }).length;
    const totalAnswered = Object.keys(showTestResult).length;
    const incorrectAnswersCount = totalAnswered - correctAnswers;
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
    
    const handleDownloadResults = () => {
      const results = {
        testTitle: selectedWordList.title,
        testDate: new Date().toLocaleDateString('ko-KR'),
        totalQuestions: totalAnswered,
        correctAnswers,
        incorrectAnswers: incorrectAnswersCount,
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

    const getGradeEmoji = () => {
      if (accuracy >= 90) return { icon: '🏆', label: 'Perfect!', color: 'from-yellow-400 to-amber-500' };
      if (accuracy >= 70) return { icon: '🎉', label: 'Great!', color: 'from-emerald-400 to-teal-500' };
      if (accuracy >= 50) return { icon: '💪', label: 'Good effort!', color: 'from-blue-400 to-indigo-500' };
      return { icon: '📚', label: 'Keep studying!', color: 'from-violet-400 to-purple-500' };
    };
    const grade = getGradeEmoji();
    
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Hero Completion Card */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${grade.color} p-8 sm:p-12 mb-6 shadow-2xl`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative z-10 text-center">
            <div className="text-6xl sm:text-7xl mb-4">{grade.icon}</div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">테스트 완료!</h2>
            <p className="text-sm sm:text-base text-white/80">{grade.label}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{accuracy}%</div>
            <div className="text-[11px] sm:text-xs text-gray-500 mt-1">정답률</div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{correctAnswers}</div>
            <div className="text-[11px] sm:text-xs text-gray-500 mt-1">정답</div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-orange-600">{incorrectAnswersCount}</div>
            <div className="text-[11px] sm:text-xs text-gray-500 mt-1">오답</div>
          </div>
        </div>
          
        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              setWordStudyMode('list');
              setCurrentWordIndex(0);
              setTestAnswers({});
              setShowTestResult({});
              setSubjectiveAnswer('');
            }}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            단어 목록으로 돌아가기
          </button>
          
          <button
            onClick={handleDownloadResults}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-medium text-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <Download className="w-4 h-4" />
            학습 결과 다운로드 (JSON)
          </button>
        </div>
      </div>
    );
  }
  
  // Regular Question
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">학습하기</h2>
            <p className="text-[11px] sm:text-xs text-gray-400">{currentWordIndex + 1} / {totalQuestions} 문제</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
            isMultipleChoice 
              ? 'bg-blue-50 text-blue-600' 
              : 'bg-purple-50 text-purple-600'
          }`}>
            {isMultipleChoice ? '객관식' : '주관식'}
          </span>
        </div>
      </div>

      {/* Progress Bar - Modern */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-500 tabular-nums min-w-[36px] text-right">{progressPercent}%</span>
        </div>
        {/* Mini dots */}
        <div className="flex gap-[3px]">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const isAnswered = showTestResult[idx];
            let qWordIdx: number;
            if (testType === 'mixed') {
              qWordIdx = Math.floor(idx / 20) * 10 + (idx % 10);
            } else {
              qWordIdx = idx;
            }
            const isCorrect = isAnswered && testAnswers[idx] === selectedWordList.words[qWordIdx]?.word;
            
            return (
              <div
                key={idx}
                className={`flex-1 h-1 rounded-full transition-all ${
                  isCorrect ? 'bg-emerald-400' : isAnswered ? 'bg-orange-400' : idx === currentWordIndex ? 'bg-indigo-400' : 'bg-gray-200'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Test Card - Multiple Choice */}
      {isMultipleChoice ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          {/* Definition Section */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 sm:p-8 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 bg-white rounded-lg text-[11px] font-semibold text-gray-500 shadow-sm border border-gray-100">뜻</span>
              <button 
                onClick={() => speakWord(currentWord?.definition || '')}
                className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-indigo-500"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-lg sm:text-xl text-gray-800 leading-relaxed font-medium">
              {currentWord?.definition}
            </p>
          </div>

          {/* Answer Options */}
          <div className="p-5 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">정답을 고르세요</h3>
              {showTestResult[currentWordIndex] && (
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${
                    testAnswers[currentWordIndex] === currentWord?.word ? 'text-emerald-500' : 'text-orange-500'
                  }`}>
                    {testAnswers[currentWordIndex] === currentWord?.word
                      ? ['Perfect! 💯', 'Excellent! ⭐', 'Correct! ✨'][currentWordIndex % 3]
                      : '다음엔 맞출 수 있어요!'}
                  </span>
                  {testAnswers[currentWordIndex] !== currentWord?.word && (
                    <button
                      onClick={() => handleRetryQuestion(currentWordIndex)}
                      className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      재도전
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-3">
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
                    onClick={() => handleTestAnswer(currentWordIndex, option, currentWord?.word)}
                    disabled={showResult}
                    className={`w-full p-4 sm:p-5 text-left rounded-2xl transition-all duration-200 flex items-center gap-4 group ${
                      showResult && isCorrect
                        ? 'bg-emerald-50 border-2 border-emerald-400 shadow-sm shadow-emerald-100'
                        : showResult && isSelected && !isCorrect
                        ? 'bg-orange-50 border-2 border-orange-400 shadow-sm shadow-orange-100'
                        : showResult
                        ? 'border-2 border-gray-100 opacity-50'
                        : 'border-2 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm active:scale-[0.99]'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                      showResult && isCorrect
                        ? 'bg-emerald-500 text-white'
                        : showResult && isSelected && !isCorrect
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                    }`}>
                      {showResult && isCorrect ? '✓' : showResult && isSelected && !isCorrect ? '✕' : String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-sm sm:text-base font-medium ${
                      showResult && isCorrect ? 'text-emerald-700' : showResult && isSelected && !isCorrect ? 'text-orange-700' : 'text-gray-700'
                    }`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Subjective Question */
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          {/* Definition */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 sm:p-8 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 bg-white rounded-lg text-[11px] font-semibold text-gray-500 shadow-sm border border-gray-100">뜻</span>
              <button 
                onClick={() => speakWord(currentWord?.definition || '')}
                className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-indigo-500"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-lg sm:text-xl text-gray-800 leading-relaxed font-medium">
              {currentWord?.definition}
            </p>
          </div>

          <div className="p-5 sm:p-8">
            {showTestResult[currentWordIndex] ? (
              <>
                {testAnswers[currentWordIndex] === currentWord?.word ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-600">
                        {['Perfect! 💯', 'Excellent! ⭐', 'Correct! ✨'][currentWordIndex % 3]}
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">✓</div>
                        <span className="text-base font-semibold text-emerald-700">{currentWord?.word}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-semibold text-orange-600">다음엔 맞출 수 있어요!</span>
                      </div>
                      <button
                        onClick={() => handleRetryQuestion(currentWordIndex)}
                        className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium px-2.5 py-1.5 rounded-xl hover:bg-orange-50 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        재도전
                      </button>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-orange-50 border-2 border-orange-400 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center text-sm">✕</div>
                        <span className="text-base font-medium text-orange-700 line-through">{testAnswers[currentWordIndex]}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">정답</span>
                      <button className="text-xs text-indigo-500 hover:text-indigo-600 font-medium hover:underline">
                        정답으로 처리하기
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-dashed border-emerald-400">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-sm">✓</div>
                        <span className="text-base font-semibold text-emerald-700">{currentWord?.word}</span>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Answer Input */}
                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">답을 입력하세요</label>
                  <input
                    type="text"
                    value={subjectiveAnswer}
                    onChange={(e) => setSubjectiveAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && subjectiveAnswer.trim()) {
                        handleTestAnswer(currentWordIndex, subjectiveAnswer.trim(), currentWord?.word);
                        setShowHint(false);
                      }
                    }}
                    placeholder="영어 단어를 입력하세요..."
                    className="w-full p-4 border-2 border-indigo-200 rounded-2xl text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-base"
                    autoFocus
                  />
                </div>

                {/* Hint and Submit */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowHint(!showHint)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                        showHint 
                          ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      💡 힌트
                    </button>
                    
                    {showHint && (
                      <span className="text-sm text-gray-500 font-mono bg-gray-50 px-3 py-1.5 rounded-lg">
                        {currentWord?.word?.slice(0, Math.min(4, currentWord?.word?.length || 0))}___
                      </span>
                    )}
                  </div>
                  
                  {subjectiveAnswer.trim() && (
                    <button
                      onClick={() => {
                        handleTestAnswer(currentWordIndex, subjectiveAnswer.trim(), currentWord?.word);
                        setShowHint(false);
                      }}
                      className="px-6 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all"
                    >
                      답하기
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {showTestResult[currentWordIndex] && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-2">
          <p className="text-xs text-gray-400 hidden sm:block">
            Enter 키를 눌러 계속하세요
          </p>
          <button
            onClick={() => {
              if (currentWordIndex < totalQuestions - 1) {
                handleNextWord();
              } else {
                setWordStudyMode('list');
                setCurrentWordIndex(0);
                setTestAnswers({});
                setShowTestResult({});
                setSubjectiveAnswer('');
              }
            }}
            className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all"
          >
            계속
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
