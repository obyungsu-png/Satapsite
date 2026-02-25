import React from 'react';
import { Button } from './ui/button';
import { ArrowLeft, X, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const { words, testType } = testInfo;

  // Fetch pronunciation data from Dictionary API
  const fetchPronunciation = async (word: string) => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data[0]) {
          // Get phonetic
          const phoneticText = data[0].phonetic || data[0].phonetics?.[0]?.text || '';
          setPhonetic(phoneticText);
          
          // Get audio URL - prefer female voice, then male, then any
          let audioSource = '';
          const phonetics = data[0].phonetics || [];
          
          // Try to find female voice (usually contains 'us' or 'uk')
          const femaleAudio = phonetics.find((p: any) => p.audio && (p.audio.includes('-us') || p.audio.includes('-uk')));
          if (femaleAudio && voiceGender === 'female') {
            audioSource = femaleAudio.audio;
          } else {
            // Fallback to any available audio
            const anyAudio = phonetics.find((p: any) => p.audio);
            if (anyAudio) {
              audioSource = anyAudio.audio;
            }
          }
          
          setAudioUrl(audioSource);
        }
      }
    } catch (error) {
      console.error('Failed to fetch pronunciation:', error);
      setPhonetic('');
      setAudioUrl('');
    }
  };

  // Load pronunciation when flashcard index changes
  React.useEffect(() => {
    if (activeTab === 'flashcard' && words[currentFlashcardIndex]) {
      fetchPronunciation(words[currentFlashcardIndex].english);
    }
  }, [currentFlashcardIndex, activeTab, words]);

  // Play pronunciation
  const speakWord = () => {
    if (audioUrl) {
      // Use dictionary API audio (natural voice)
      setIsSpeaking(true);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = 1.0; // 1x speed
        audioRef.current.play()
          .then(() => {})
          .catch((error) => {
            console.error('Audio playback failed:', error);
            setIsSpeaking(false);
            fallbackToSpeechSynthesis();
          });
      } else {
        const audio = new Audio(audioUrl);
        audio.playbackRate = 1.0;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          setIsSpeaking(false);
          fallbackToSpeechSynthesis();
        };
        audio.play();
        audioRef.current = audio;
      }
    } else {
      // Fallback to Speech Synthesis
      fallbackToSpeechSynthesis();
    }
  };

  // Fallback to Web Speech API with better voice selection
  const fallbackToSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(words[currentFlashcardIndex]?.english);
      utterance.lang = 'en-US';
      utterance.rate = 1.0; // 1x speed
      utterance.pitch = voiceGender === 'female' ? 1.2 : 0.9;
      
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;
      
      if (voiceGender === 'female') {
        // Look for high-quality female voices
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          !voice.localService && // Prefer online voices (better quality)
          (voice.name.includes('Google') || voice.name.includes('Microsoft')) &&
          (voice.name.toLowerCase().includes('female') || 
           voice.name.includes('Samantha') ||
           voice.name.includes('Karen') ||
           voice.name.includes('Victoria'))
        ) || voices.find(voice => 
          voice.lang.startsWith('en-US') && 
          (voice.name.includes('Zira') || voice.name.includes('Female'))
        );
      } else {
        // Look for high-quality male voices
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          !voice.localService &&
          (voice.name.includes('Google') || voice.name.includes('Microsoft')) &&
          (voice.name.toLowerCase().includes('male') || 
           voice.name.includes('David') ||
           voice.name.includes('Mark'))
        ) || voices.find(voice => 
          voice.lang.startsWith('en-US') && 
          (voice.name.includes('David') || voice.name.includes('Male'))
        );
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Audio ended event
  React.useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.onended = () => setIsSpeaking(false);
    }
  }, [audioRef.current]);

  // Load voices when component mounts
  React.useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Reset hint when moving to next question
  React.useEffect(() => {
    setShowHint(false);
  }, [currentWordIndex]);

  // Calculate total questions
  const totalQuestions = testType === 'mixed' 
    ? words.length * 2 
    : words.length;

  const shouldShowReview = currentWordIndex % 10 === 0 && currentWordIndex !== 0 && currentWordIndex < totalQuestions && !showTestResult[currentWordIndex];

  // Determine if current question is multiple choice
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

  const currentWord = words[wordIdx];

  const generateTestOptions = (correctWord: string, allWords: any[], currentIndex: number, seed: number) => {
    // Seeded random function for consistent ordering per question
    const seededRandom = (index: number) => {
      const x = Math.sin(seed * 9999 + index * 1234) * 10000;
      return x - Math.floor(x);
    };
    
    const options = [correctWord];
    const otherWords = allWords.filter((_, idx) => idx !== currentIndex);
    
    // Use seeded random to select options
    const selectedIndices: number[] = [];
    while (options.length < 4 && selectedIndices.length < otherWords.length) {
      const randomValue = seededRandom(options.length);
      const randomIdx = Math.floor(randomValue * otherWords.length);
      
      if (!selectedIndices.includes(randomIdx)) {
        const randomWord = otherWords[randomIdx].english;
        if (!options.includes(randomWord)) {
          options.push(randomWord);
          selectedIndices.push(randomIdx);
        }
      }
    }
    
    // Sort options using seeded random
    return options.sort((a, b) => {
      const hashA = a.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hashB = b.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return seededRandom(hashA) - seededRandom(hashB);
    });
  };

  const handleTestAnswer = (questionIndex: number, answer: string, correctAnswer: string) => {
    setTestAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    setShowTestResult(prev => ({ ...prev, [questionIndex]: true }));
    
    // Play sound based on answer correctness
    try {
      const isCorrect = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      
      if (isCorrect) {
        // Correct answer - bird chirp sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create a cheerful bird-like sound
        const playBirdChirp = (startTime: number, freq: number, duration: number) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          
          osc.connect(gain);
          gain.connect(audioContext.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + duration);
          
          gain.gain.setValueAtTime(0.15, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
          
          osc.start(startTime);
          osc.stop(startTime + duration);
        };
        
        // Three quick chirps
        playBirdChirp(audioContext.currentTime, 800, 0.08);
        playBirdChirp(audioContext.currentTime + 0.1, 1000, 0.08);
        playBirdChirp(audioContext.currentTime + 0.2, 1200, 0.1);
        
      } else {
        // Wrong answer - "beep beep beep" error sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create three short beeps
        for (let i = 0; i < 3; i++) {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          
          osc.connect(gain);
          gain.connect(audioContext.destination);
          
          osc.type = 'square';
          osc.frequency.value = 400;
          
          const startTime = audioContext.currentTime + (i * 0.15);
          gain.gain.setValueAtTime(0.15, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
          
          osc.start(startTime);
          osc.stop(startTime + 0.1);
        }
      }
    } catch (error) {
      console.error('Sound effect error:', error);
    }
  };

  const handleNextWord = () => {
    setCurrentWordIndex(prev => prev + 1);
    setSubjectiveAnswer('');
  };

  const handleRetryQuestion = (questionIndex: number) => {
    setShowTestResult(prev => {
      const newResult = { ...prev };
      delete newResult[questionIndex];
      return newResult;
    });
    setTestAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionIndex];
      return newAnswers;
    });
  };

  // Review Screen
  if (shouldShowReview) {
    const roundStart = currentWordIndex - 10;
    const roundEnd = currentWordIndex;

    return (
      <div className="h-screen bg-gray-50 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onExit} className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-xl">학습하기</h2>
            </div>
            <Button variant="ghost" className="p-2">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
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
                const word = words[qWordIdx];

                if (!word) return null;

                return (
                  <div key={questionIdx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-gray-800">{word.english}</span>
                      <span className="text-gray-500 text-sm">{word.korean}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleNextWord}
                className="px-8 py-3 text-white"
                style={{ backgroundColor: '#4F46E5' }}
              >
                계속
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test Complete Screen
  if (!currentWord || currentWordIndex >= totalQuestions) {
    const correctAnswers = Object.keys(showTestResult).filter(idx => {
      let qWordIdx: number;
      if (testType === 'mixed') {
        qWordIdx = Math.floor(Number(idx) / 20) * 10 + (Number(idx) % 10);
      } else {
        qWordIdx = Number(idx);
      }
      const word = words[qWordIdx];
      return testAnswers[Number(idx)]?.toLowerCase().trim() === word?.english?.toLowerCase().trim();
    }).length;
    const totalAnswered = Object.keys(showTestResult).length;
    const incorrectAnswers = totalAnswered - correctAnswers;
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

    return (
      <div className="h-screen bg-gray-50 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl mb-3">🎉 테스트 완료!</h2>
              <p className="text-gray-600">모든 단어 학습을 완료했습니다.</p>
            </div>

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

            <div className="flex flex-col gap-3">
              <Button
                onClick={onExit}
                className="w-full px-8 py-3 text-white"
                style={{ backgroundColor: '#4F46E5' }}
              >
                단어 목록으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular Question
  return (
    <div className="h-screen bg-gray-50 overflow-auto">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button variant="ghost" onClick={onExit} className="p-1.5 sm:p-2 flex-shrink-0">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-xl font-semibold truncate">
                {testInfo.testName || '단어 학습'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {testType === 'multiple' ? '객관식' : testType === 'subjective' ? '주관식' : '객관식+주관식'}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
            <Button
              variant={activeTab === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('list')}
              className="flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 h-auto whitespace-nowrap"
              style={activeTab === 'list' ? { backgroundColor: '#4F46E5', color: 'white' } : {}}
            >
              단어 목록
            </Button>
            <Button
              variant={activeTab === 'flashcard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('flashcard')}
              className="flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 h-auto whitespace-nowrap"
              style={activeTab === 'flashcard' ? { backgroundColor: '#4F46E5', color: 'white' } : {}}
            >
              플래시카드
            </Button>
            <Button
              variant={activeTab === 'test' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('test')}
              className="flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 h-auto whitespace-nowrap"
              style={activeTab === 'test' ? { backgroundColor: '#4F46E5', color: 'white' } : {}}
            >
              테스트
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl mb-6">단어 목록</h2>
            <div className="space-y-2">
              {words.map((word: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-gray-500 w-8">{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg">{word.english}</span>
                        <span className="text-gray-600">{word.korean}</span>
                      </div>
                      <p className="text-sm text-gray-500">{word.definition}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'flashcard' && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col md:relative md:inset-auto md:z-auto md:bg-transparent">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-4 border-b">
              <h1 className="text-xl font-bold text-indigo-600">단어 카드</h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={speakWord}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-indigo-600' : 'text-gray-600'}`} />
                  <span className="text-sm text-gray-600">재생</span>
                </button>
                <button
                  onClick={() => setActiveTab('test')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Mobile Progress Bar */}
            <div className="md:hidden px-4 py-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{currentFlashcardIndex + 1} / {words.length}</span>
                <span className="text-sm font-semibold text-indigo-600">
                  {Math.round(((currentFlashcardIndex + 1) / words.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${((currentFlashcardIndex + 1) / words.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-6">
              <h2 className="text-xl">플래시카드</h2>
              
              {/* Voice Gender Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setVoiceGender('female')}
                  className={`px-3 py-1.5 rounded text-sm transition-all ${
                    voiceGender === 'female' 
                      ? 'bg-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  여성 음성
                </button>
                <button
                  onClick={() => setVoiceGender('male')}
                  className={`px-3 py-1.5 rounded text-sm transition-all ${
                    voiceGender === 'male' 
                      ? 'bg-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  남성 음성
                </button>
              </div>
            </div>
            
            {/* Mobile Flashcard - Full Screen */}
            <div className="md:hidden flex-1 flex items-center justify-center px-4 py-4 relative">
              {/* Flashcard */}
              <div 
                className="relative w-full max-w-md h-full max-h-[600px] cursor-pointer perspective-1000"
                onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
              >
                <div className={`w-full h-full transition-transform duration-500 transform-style-3d ${showFlashcardAnswer ? 'rotate-y-180' : ''}`}>
                  {/* Front */}
                  <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl shadow-2xl flex items-center justify-center p-8">
                    <div className="text-center text-white">
                      <p className="text-sm mb-4 opacity-75">영어 단어</p>
                      {phonetic && (
                        <p className="text-base mb-5 opacity-90 tracking-wide font-light">
                          {phonetic}
                        </p>
                      )}
                      <h2 className="text-5xl font-bold mb-8">{words[currentFlashcardIndex]?.english}</h2>
                      <p className="text-sm opacity-75">클릭하여 뜻보기</p>
                    </div>
                  </div>
                  
                  {/* Back */}
                  <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl shadow-2xl flex items-center justify-center p-8 rotate-y-180">
                    <div className="text-center text-white">
                      <p className="text-sm mb-6 opacity-75">한글 뜻</p>
                      <h2 className="text-4xl mb-6 font-bold">{words[currentFlashcardIndex]?.korean}</h2>
                      <p className="text-lg mb-4 opacity-90 leading-relaxed">
                        {words[currentFlashcardIndex]?.definition}
                      </p>
                      <p className="text-sm opacity-75 mt-6">클릭하여 단어 보기</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Left Arrow - Overlapping Card */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentFlashcardIndex > 0) {
                    setCurrentFlashcardIndex(currentFlashcardIndex - 1);
                    setShowFlashcardAnswer(false);
                  }
                }}
                disabled={currentFlashcardIndex === 0}
                className={`absolute left-6 bottom-12 w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${
                  currentFlashcardIndex === 0
                    ? 'bg-gray-100 cursor-not-allowed opacity-40'
                    : 'bg-indigo-500 hover:bg-indigo-600 opacity-80'
                }`}
              >
                <ChevronLeft className={`w-8 h-8 ${currentFlashcardIndex === 0 ? 'text-gray-300' : 'text-white'}`} />
              </button>

              {/* Right Arrow - Overlapping Card */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentFlashcardIndex < words.length - 1) {
                    setCurrentFlashcardIndex(currentFlashcardIndex + 1);
                    setShowFlashcardAnswer(false);
                  }
                }}
                disabled={currentFlashcardIndex === words.length - 1}
                className={`absolute right-6 bottom-12 w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${
                  currentFlashcardIndex === words.length - 1
                    ? 'bg-gray-100 cursor-not-allowed opacity-40'
                    : 'bg-indigo-500 hover:bg-indigo-600 opacity-80'
                }`}
              >
                <ChevronRight className={`w-8 h-8 ${currentFlashcardIndex === words.length - 1 ? 'text-gray-300' : 'text-white'}`} />
              </button>
            </div>

            {/* Mobile Progress Dots */}
            <div className="md:hidden flex justify-center gap-2 px-4 pb-6">
              {words.map((_, idx) => {
                const distance = Math.abs(idx - currentFlashcardIndex);
                const isVisible = distance <= 5 || words.length <= 15;
                
                if (!isVisible && words.length > 15) return null;
                
                return (
                  <div
                    key={idx}
                    className={`flex-shrink-0 w-2 h-2 rounded-full transition-all ${
                      idx === currentFlashcardIndex
                        ? 'bg-indigo-600 w-8'
                        : idx < currentFlashcardIndex
                        ? 'bg-indigo-400'
                        : 'bg-gray-300'
                    }`}
                  />
                );
              })}
            </div>

            {/* Desktop Flashcard with Side Navigation */}
            <div className="hidden md:flex items-center justify-between w-full mb-8 px-2 sm:px-0 sm:gap-6">
              {/* Left Arrow */}
              <button
                onClick={() => {
                  setCurrentFlashcardIndex(Math.max(0, currentFlashcardIndex - 1));
                  setShowFlashcardAnswer(false);
                }}
                disabled={currentFlashcardIndex === 0}
                className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                  currentFlashcardIndex === 0
                    ? 'bg-gray-100 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600 shadow-md hover:shadow-lg'
                }`}
              >
                <ChevronLeft className={`w-5 h-5 sm:w-8 sm:h-8 ${currentFlashcardIndex === 0 ? 'text-gray-300' : 'text-white'}`} />
              </button>

              {/* Flashcard */}
              <div 
                className="relative flex-1 mx-2 sm:mx-0 sm:max-w-2xl h-72 sm:h-96 cursor-pointer perspective-1000"
                onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
              >
                <div className={`w-full h-full transition-transform duration-500 transform-style-3d ${showFlashcardAnswer ? 'rotate-y-180' : ''}`}>
                  {/* Front */}
                  <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center p-6 sm:p-10">
                    <div className="text-center text-white">
                      <p className="text-xs sm:text-sm mb-2 sm:mb-4 opacity-75">영어 단어</p>
                      
                      {/* Phonetic at top */}
                      {phonetic && (
                        <p className="text-sm sm:text-lg mb-3 sm:mb-5 opacity-90 tracking-wide font-light">
                          {phonetic}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                        <h3 className="text-3xl sm:text-5xl font-medium">{words[currentFlashcardIndex]?.english}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord();
                          }}
                          className={`p-2 sm:p-4 rounded-full bg-white/20 hover:bg-white/30 transition-all ${
                            isSpeaking ? 'animate-pulse bg-white/40' : ''
                          }`}
                          title="발음 듣기"
                        >
                          <Volume2 className={`w-5 h-5 sm:w-7 sm:h-7 text-white ${isSpeaking ? 'text-yellow-200' : ''}`} />
                        </button>
                      </div>
                      
                      <p className="text-xs sm:text-sm opacity-75 mt-1">클릭하여 뜻 보기</p>
                    </div>
                  </div>
                  
                  {/* Back */}
                  <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-2xl flex items-center justify-center p-6 sm:p-10 rotate-y-180">
                    <div className="text-center text-white">
                      <p className="text-xs sm:text-sm mb-3 sm:mb-6 opacity-75">한��� 뜻</p>
                      <h3 className="text-xl sm:text-4xl mb-3 sm:mb-6 font-medium">{words[currentFlashcardIndex]?.korean}</h3>
                      <p className="text-sm sm:text-lg mb-2 sm:mb-4 opacity-95 leading-relaxed max-w-xl mx-auto px-2 sm:px-0">
                        {words[currentFlashcardIndex]?.definition}
                      </p>
                      <p className="text-xs sm:text-sm opacity-75 mt-2 sm:mt-6">클릭하여 단어 보기</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => {
                  setCurrentFlashcardIndex(Math.min(words.length - 1, currentFlashcardIndex + 1));
                  setShowFlashcardAnswer(false);
                }}
                disabled={currentFlashcardIndex === words.length - 1}
                className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                  currentFlashcardIndex === words.length - 1
                    ? 'bg-gray-100 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600 shadow-md hover:shadow-lg'
                }`}
              >
                <ChevronRight className={`w-5 h-5 sm:w-8 sm:h-8 ${currentFlashcardIndex === words.length - 1 ? 'text-gray-300' : 'text-white'}`} />
              </button>
            </div>

            {/* Desktop Counter */}
            <div className="hidden md:block text-center">
              <span className="text-gray-600 text-lg">
                {currentFlashcardIndex + 1} / {words.length}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'test' && (
          <>
            <h2 className="text-base sm:text-xl mb-3 sm:mb-6">학습하기</h2>

            {/* Progress Bar */}
            <div className="mb-4 sm:mb-8">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                  {Array.from({ length: totalQuestions }).map((_, idx) => {
                    const isAnswered = showTestResult[idx];
                    let qWordIdx: number;
                    if (testType === 'mixed') {
                      qWordIdx = Math.floor(idx / 20) * 10 + (idx % 10);
                    } else {
                      qWordIdx = idx;
                    }
                    const isCorrect = isAnswered && testAnswers[idx]?.toLowerCase().trim() === words[qWordIdx]?.english?.toLowerCase().trim();

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
                          <div className="absolute -top-6 sm:-top-7 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <span className="text-xs sm:text-sm text-gray-600 ml-2">
                  {totalQuestions}
                </span>
              </div>
            </div>

            {/* Test Card - Multiple Choice */}
            {isMultipleChoice ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-8 mb-2 sm:mb-6">
                {/* Word Definition */}
                <div className="mb-3 sm:mb-8">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-4">
                    <span className="text-xs sm:text-sm text-gray-600">뜻</span>
                    <button className="p-0.5 sm:p-1 hover:bg-gray-100 rounded-full">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.122-2.121" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm sm:text-xl text-gray-800 leading-snug sm:leading-relaxed">
                    {currentWord?.definition || currentWord?.korean}
                  </p>
                </div>

                {/* Answer Options */}
                <div className="mb-2 sm:mb-6">
                  <h3 className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-4">정답을 고르세요</h3>
                  {showTestResult[currentWordIndex] && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-3">
                      <p className={`text-xs sm:text-sm ${
                        testAnswers[currentWordIndex]?.toLowerCase().trim() === currentWord?.english?.toLowerCase().trim()
                          ? 'text-green-600 font-medium'
                          : 'text-orange-600'
                      }`}>
                        {testAnswers[currentWordIndex]?.toLowerCase().trim() === currentWord?.english?.toLowerCase().trim()
                          ? ['잘했어요!', '훌륭해요!', '정답입니다'][currentWordIndex % 3]
                          : '걱정하지 마세요, 아직 배우고 있잖아요!'}
                      </p>
                      {testAnswers[currentWordIndex]?.toLowerCase().trim() !== currentWord?.english?.toLowerCase().trim() && (
                        <button
                          onClick={() => handleRetryQuestion(currentWordIndex)}
                          className="text-xs sm:text-sm text-orange-600 hover:underline whitespace-nowrap self-start sm:self-auto"
                        >
                          다시 해봅시다
                        </button>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-1.5 sm:gap-3">
                    {generateTestOptions(
                      currentWord?.english,
                      words,
                      wordIdx,
                      currentWordIndex
                    ).map((option, idx) => {
                      const isSelected = testAnswers[currentWordIndex] === option;
                      const isCorrect = option === currentWord?.english;
                      const showResult = showTestResult[currentWordIndex];

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            handleTestAnswer(currentWordIndex, option, currentWord?.english);
                          }}
                          disabled={showResult}
                          className={`p-2 sm:p-4 text-left rounded-lg transition-all relative w-full ${
                            showResult && isCorrect
                              ? 'border-2 border-green-500 bg-white'
                              : showResult && isSelected && !isCorrect
                              ? 'border-2 border-orange-500 bg-white'
                              : showResult && !isSelected && isCorrect
                              ? 'border-2 border-dashed border-green-500 bg-white'
                              : 'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <span className={`text-xs sm:text-sm flex-shrink-0 font-medium ${
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
                            <span className="text-xs sm:text-base text-gray-800 break-words">{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Help Link */}
                <div className="flex justify-end">
                  <button className="text-sm" style={{ color: '#4F46E5' }}>
                    모르시겠어요?
                  </button>
                </div>
              </div>
            ) : (
              /* Subjective Question */
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-8 mb-3 sm:mb-6">
                {/* Word Type - Hide on mobile */}
                <div className="hidden sm:flex items-center gap-2 mb-6">
                  <span className="text-sm text-gray-600">뜻</span>
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.122-2.121" />
                    </svg>
                  </button>
                </div>

                {/* Definition */}
                <p className="text-base sm:text-xl text-gray-800 leading-snug sm:leading-relaxed mb-4 sm:mb-12">
                  {currentWord?.definition || currentWord?.korean}
                </p>

                {/* Feedback and Answer */}
                {showTestResult[currentWordIndex] ? (
                  <>
                    {testAnswers[currentWordIndex]?.toLowerCase().trim() === currentWord?.english?.toLowerCase().trim() ? (
                      <>
                        <p className="text-green-600 text-sm mb-4">
                          {['잘했어요!', '훌륭해요!', '정답입니다'][currentWordIndex % 3]}
                        </p>
                        
                        <div className="p-4 rounded-lg border-2 border-green-500 bg-white">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-gray-800">{currentWord?.english}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-orange-600 text-sm">
                            오답입니다
                          </p>
                          <button
                            onClick={() => handleRetryQuestion(currentWordIndex)}
                            className="text-sm text-orange-600 hover:underline"
                          >
                            다시 시도
                          </button>
                        </div>
                        
                        <div className="mb-4 p-4 rounded-lg border-2 border-orange-500 bg-white">
                          <div className="flex items-center gap-2">
                            <span className="text-orange-600">✕</span>
                            <span className="text-gray-800">{testAnswers[currentWordIndex]}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm text-green-600">정답</h3>
                        </div>

                        <div className="p-4 rounded-lg border-2 border-dashed border-green-500 bg-white">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-gray-800">{currentWord?.english}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-4 md:mb-6">
                      <h3 className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">정답을 고르세요</h3>
                      <input
                        type="text"
                        value={subjectiveAnswer}
                        onChange={(e) => setSubjectiveAnswer(e.target.value)}
                        placeholder="정답을 입력하세요"
                        className="w-full p-3 md:p-4 border-2 rounded-lg text-sm md:text-base text-gray-800 placeholder-gray-400 focus:outline-none"
                        style={{ borderColor: '#4F46E5' }}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                      <div className="flex items-center gap-2 md:gap-3">
                        <button 
                          onClick={() => setShowHint(!showHint)}
                          className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors whitespace-nowrap"
                          style={{ color: '#4F46E5' }}
                        >
                          힌트 보기
                        </button>
                        
                        {showHint && (
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <span className="text-gray-400 text-sm">&gt;</span>
                            <span className="text-xs md:text-sm text-gray-600">
                              {currentWord?.english?.slice(0, Math.min(4, currentWord?.english?.length || 0))}___뭐였어요?
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-end gap-2 md:gap-3">
                        <button className="text-xs md:text-sm whitespace-nowrap" style={{ color: '#4F46E5' }}>
                          모르시겠어요?
                        </button>
                        
                        {subjectiveAnswer.trim() && (
                          <Button
                            onClick={() => {
                              handleTestAnswer(currentWordIndex, subjectiveAnswer.trim(), currentWord?.english);
                              setShowHint(false);
                            }}
                            className="px-4 md:px-5 py-1.5 md:py-2 text-xs md:text-sm rounded-full text-white whitespace-nowrap"
                            style={{ backgroundColor: '#1E40AF' }}
                          >
                            답하기
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Continue Button */}
            {showTestResult[currentWordIndex] && (
              <div className="sticky bottom-0 left-0 right-0 bg-white shadow-lg mt-6 sm:mt-8 -mx-3 sm:mx-0 px-3 sm:px-0 py-3 sm:py-4 sm:shadow-none sm:bg-transparent">
                <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-2 sm:gap-3 max-w-4xl mx-auto">
                  <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                    정답을 확인한 후 계속 버튼을 클릭하세요
                  </p>
                  <Button
                    onClick={handleNextWord}
                    className="w-auto px-12 py-3 sm:py-3.5 text-white text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                    style={{ backgroundColor: '#4F46E5' }}
                  >
                    계속 →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}