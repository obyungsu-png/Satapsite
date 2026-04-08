import React from 'react';
import { ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';

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
      // Select female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Victoria') || v.name.includes('Zira') || v.name.includes('Google US English'))
      );
      if (femaleVoice) utterance.voice = femaleVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-base sm:text-xl">플래시카드</h2>
        
        {/* Voice button - female only */}
        <button
          onClick={speakWord}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm text-gray-700"
        >
          <Volume2 className="w-4 h-4" />
          <span className="text-xs sm:text-sm">여성 음성</span>
        </button>
      </div>
      
      {/* Flashcard with Side Navigation */}
      <div className="flex items-center justify-center gap-2 sm:gap-6 mb-4 sm:mb-8">
        {/* Left Arrow */}
        <button
          onClick={handlePrevWord}
          disabled={currentWordIndex === 0}
          className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
            currentWordIndex === 0
              ? 'bg-gray-100 cursor-not-allowed'
              : 'bg-white border-2 border-indigo-400 hover:border-indigo-600 hover:bg-indigo-50 shadow-md hover:shadow-lg'
          }`}
        >
          <ChevronLeft className={`w-5 h-5 sm:w-8 sm:h-8 ${currentWordIndex === 0 ? 'text-gray-300' : 'text-indigo-600'}`} />
        </button>

        {/* Flashcard */}
        <div 
          className="relative w-full max-w-2xl h-56 sm:h-96 cursor-pointer perspective-1000"
          onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
        >
          <div className={`w-full h-full transition-transform duration-500 transform-style-3d ${isFlashcardFlipped ? 'rotate-y-180' : ''}`}>
            {/* Front */}
            <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-2xl flex items-center justify-center p-5 sm:p-10">
              <div className="text-center text-white">
                <p className="text-xs sm:text-sm mb-3 sm:mb-6 opacity-75">영어 단어</p>
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <h3 className="text-2xl sm:text-5xl">{words[currentWordIndex]?.word}</h3>
                  <button
                    onClick={speakWord}
                    className="p-2 sm:p-4 rounded-full bg-white/20 hover:bg-white/30 transition-all"
                    title="발음 듣기"
                  >
                    <Volume2 className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm opacity-75">클릭하여 뜻 보기</p>
              </div>
            </div>
            
            {/* Back */}
            <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-2xl flex items-center justify-center p-5 sm:p-10 rotate-y-180">
              <div className="text-center text-white">
                <p className="text-xs sm:text-sm mb-3 sm:mb-6 opacity-75">뜻 / 정의</p>
                <h3 className="text-xl sm:text-4xl mb-3 sm:mb-6">{words[currentWordIndex]?.definition}</h3>
                <p className="text-xs sm:text-sm opacity-75 mt-3 sm:mt-6">클릭하여 단어 보기</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNextWord}
          disabled={currentWordIndex === words.length - 1}
          className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
            currentWordIndex === words.length - 1
              ? 'bg-gray-100 cursor-not-allowed'
              : 'bg-white border-2 border-indigo-400 hover:border-indigo-600 hover:bg-indigo-50 shadow-md hover:shadow-lg'
          }`}
        >
          <ChevronRight className={`w-5 h-5 sm:w-8 sm:h-8 ${currentWordIndex === words.length - 1 ? 'text-gray-300' : 'text-indigo-600'}`} />
        </button>
      </div>

      {/* Counter */}
      <div className="text-center">
        <span className="text-gray-600 text-sm sm:text-lg">
          {currentWordIndex + 1} / {words.length}
        </span>
      </div>
    </div>
  );
}
