import React from 'react';
// Button 컴포넌트 타입 오류 해결
import { Button as BaseButton } from './ui/button';
import { ArrowLeft, X, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';

// Button 타입을 유연하게 처리
const Button = BaseButton as any;

interface SATVocaTestProps {
  testInfo: any;
  onExit: () => void;
}

export function SATVocaTest({ testInfo, onExit }: SATVocaTestProps) {
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [testAnswers, setTestAnswers] = React.useState<{[key: number]: string}>({});
  const [showTestResult, setShowTestResult] = React.useState<{[key: number]: boolean}>({});
  const [subjectiveAnswer, setSubjectiveAnswer] = React.useState('');
  const [showHint, setShowHint] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'list' | 'flashcard' | 'test'>('test');
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = React.useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [voiceGender, setVoiceGender] = React.useState<'male' | 'female'>('female');
  const [phonetic, setPhonetic] = React.useState<string>('');
  const [audioUrl, setAudioUrl] = React.useState<string>('');
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // testInfo가 없을 경우를 대비한 방어 코드
  const words = testInfo?.words || [];
  const testType = testInfo?.testType || 'korean';

  const handleNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setSubjectiveAnswer('');
      setShowHint(false);
    } else {
      // 테스트 종료 로직
      onExit();
    }
  };

  const handlePrevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1);
    }
  };

  const handleSpeak = (text: string) => {
    if (!text) return;
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <button onClick={onExit} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-[#4F46E5] mb-0.5">SAT VOCA TEST</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#4F46E5] transition-all duration-300"
                style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-gray-400">
              {currentWordIndex + 1} / {words.length}
            </span>
          </div>
        </div>
        <button onClick={onExit} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        {words.length > 0 && (
          <>
            <div className="w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-12 mb-8 relative overflow-hidden border border-gray-100">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#4F46E5]" />
              
              <div className="flex justify-between items-start mb-10">
                <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-[#4F46E5] text-xs font-bold uppercase tracking-wider">
                  {testType === 'korean' ? 'English to Korean' : 'Korean to English'}
                </span>
                <button 
                  onClick={() => handleSpeak(words[currentWordIndex].english)}
                  disabled={isSpeaking}
                  className={`p-3 rounded-2xl transition-all ${isSpeaking ? 'bg-indigo-100 text-[#4F46E5]' : 'bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-[#4F46E5]'}`}
                >
                  <Volume2 className={`w-6 h-6 ${isSpeaking ? 'animate-pulse' : ''}`} />
                </button>
              </div>

              <div className="text-center space-y-6">
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
                  {testType === 'korean' ? words[currentWordIndex].english : words[currentWordIndex].korean}
                </h2>
                
                <div className="pt-10">
                  <input
                    type="text"
                    value={subjectiveAnswer}
                    onChange={(e) => setSubjectiveAnswer(e.target.value)}
                    placeholder="정답을 입력하세요"
                    className="w-full max-w-md mx-auto block text-center text-xl md:text-2xl py-4 border-b-2 border-gray-200 focus:border-[#4F46E5] focus:outline-none transition-colors placeholder:text-gray-300"
                    onKeyDown={(e) => e.key === 'Enter' && !showTestResult[currentWordIndex] && setShowTestResult(prev => ({...prev, [currentWordIndex]: true}))}
                  />
                </div>
              </div>

              {showTestResult[currentWordIndex] && (
                <div className="mt-12 p-6 rounded-2xl bg-gray-50 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Correct Answer</span>
                    <p className="text-2xl md:text-3xl font-bold text-[#4F46E5]">
                      {testType === 'korean' ? words[currentWordIndex].korean : words[currentWordIndex].english}
                    </p>
                    {words[currentWordIndex].synonyms && (
                      <p className="text-sm text-gray-500 mt-2">
                        <span className="font-semibold">Synonyms:</span> {words[currentWordIndex].synonyms}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 w-full max-w-md">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrevWord}
                disabled={currentWordIndex === 0}
                className="flex-1 py-6 rounded-2xl border-2 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold text-gray-600"
              >
                <ChevronLeft className="w-5 h-5 mr-2" /> 이전
              </Button>
              
              {!showTestResult[currentWordIndex] ? (
                <Button
                  size="lg"
                  onClick={() => setShowTestResult(prev => ({...prev, [currentWordIndex]: true}))}
                  className="flex-[1.5] py-6 rounded-2xl text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-lg"
                  style={{ backgroundColor: '#4F46E5' }}
                >
                  정답 확인
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleNextWord}
                  className="flex-[1.5] py-6 rounded-2xl text-white shadow-lg shadow-green-200 hover:shadow-green-300 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-lg"
                  style={{ backgroundColor: '#10B981' }}
                >
                  {currentWordIndex === words.length - 1 ? '테스트 종료' : '다음 단어'} <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
