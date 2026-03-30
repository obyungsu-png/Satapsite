import React from 'react';
import { ChevronLeft, ChevronRight, Volume2, RotateCcw, BookOpen } from 'lucide-react';

interface WordFlashcardProps {
  words: any[];
  currentWordIndex: number;
  isFlashcardFlipped: boolean;
  setIsFlashcardFlipped: (flipped: boolean) => void;
  handlePrevWord: () => void;
  handleNextWord: () => void;
}

export function WordFlashcard({
  words,
  currentWordIndex,
  isFlashcardFlipped,
  setIsFlashcardFlipped,
  handlePrevWord,
  handleNextWord
}: WordFlashcardProps) {
  const speakWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(words[currentWordIndex]?.word);
      utterance.lang = 'en-US';
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Victoria') || v.name.includes('Zira') || v.name.includes('Google US English'))
      );
      if (femaleVoice) utterance.voice = femaleVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const progress = ((currentWordIndex + 1) / words.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">플래시카드</h2>
            <p className="text-[11px] sm:text-xs text-gray-400">{currentWordIndex + 1} / {words.length} 단어</p>
          </div>
        </div>
        
        <button
          onClick={speakWord}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors text-indigo-600"
        >
          <Volume2 className="w-4 h-4" />
          <span className="text-xs font-semibold hidden sm:inline">발음 듣기</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-400 tabular-nums">{Math.round(progress)}%</span>
        </div>
      </div>
      
      {/* Flashcard with Navigation */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8">
        {/* Left Arrow */}
        <button
          onClick={handlePrevWord}
          disabled={currentWordIndex === 0}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
            currentWordIndex === 0
              ? 'bg-gray-50 cursor-not-allowed'
              : 'bg-white border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 shadow-sm hover:shadow-md'
          }`}
        >
          <ChevronLeft className={`w-6 h-6 ${currentWordIndex === 0 ? 'text-gray-200' : 'text-gray-600 hover:text-indigo-600'}`} />
        </button>

        {/* Flashcard */}
        <div 
          className="relative w-full max-w-xl h-60 sm:h-80 cursor-pointer perspective-1000"
          onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
        >
          <div className={`w-full h-full transition-transform duration-600 transform-style-3d ${isFlashcardFlipped ? 'rotate-y-180' : ''}`}>
            {/* Front */}
            <div className="absolute w-full h-full backface-hidden rounded-3xl shadow-xl flex items-center justify-center p-6 sm:p-10 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/4" />
              
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full mb-4 sm:mb-6">
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                  <span className="text-[11px] sm:text-xs text-white/80 font-medium">영어 단어</span>
                </div>
                <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
                  <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">{words[currentWordIndex]?.word}</h3>
                  <button
                    onClick={speakWord}
                    className="p-2.5 sm:p-3 rounded-xl bg-white/15 hover:bg-white/25 transition-all backdrop-blur-sm"
                    title="발음 듣기"
                  >
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-white/50 mt-3">탭하여 뜻 보기 →</p>
              </div>
            </div>
            
            {/* Back */}
            <div className="absolute w-full h-full backface-hidden rounded-3xl shadow-xl flex items-center justify-center p-6 sm:p-10 rotate-y-180 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
              }}
            >
              <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 -translate-x-1/4" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/3 translate-x-1/4" />
              
              <div className="relative z-10 text-center max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full mb-4 sm:mb-6">
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                  <span className="text-[11px] sm:text-xs text-white/80 font-medium">뜻 / 정의</span>
                </div>
                <h3 className="text-xl sm:text-3xl font-bold text-white leading-relaxed mb-3">{words[currentWordIndex]?.definition}</h3>
                <p className="text-xs sm:text-sm text-white/50 mt-4">← 탭하여 단어 보기</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNextWord}
          disabled={currentWordIndex === words.length - 1}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
            currentWordIndex === words.length - 1
              ? 'bg-gray-50 cursor-not-allowed'
              : 'bg-white border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 shadow-sm hover:shadow-md'
          }`}
        >
          <ChevronRight className={`w-6 h-6 ${currentWordIndex === words.length - 1 ? 'text-gray-200' : 'text-gray-600 hover:text-indigo-600'}`} />
        </button>
      </div>

      {/* Bottom Navigation Dots */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          {words.map((_, idx) => (
            <div
              key={idx}
              className={`rounded-full transition-all duration-300 ${
                idx === currentWordIndex 
                  ? 'w-6 h-2 bg-indigo-500' 
                  : idx < currentWordIndex 
                  ? 'w-2 h-2 bg-indigo-200' 
                  : 'w-2 h-2 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="text-center mt-6">
        <p className="text-[11px] text-gray-300">← → 화살표 키로 이동 · 스페이스바로 뒤집기</p>
      </div>
    </div>
  );
}
