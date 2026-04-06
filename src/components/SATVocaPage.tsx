import { useState, useMemo, useEffect } from "react";
// Button 컴포넌트가 props를 인식하지 못하는 문제를 해결하기 위해 타입을 캐스팅하여 가져옵니다.
import { Button as BaseButton } from "./ui/button";
import { Check, Minus, Plus, RefreshCw, Trash2, FileText, Calendar, X } from "lucide-react";
import { generateSATWordsForDay } from "./vocaWordSets";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { TestTypeSelectionModal } from "./TestTypeSelectionModal";
import { SATVocaTest } from "./SATVocaTest";
import { kvGet } from '../utils/supabase/client';

// Button 컴포넌트의 타입을 확장하여 variant와 size를 인식하도록 정의
const Button = BaseButton as any;

interface SATWord {
  id: number;
  english: string;
  korean: string;
  definition: string;
  synonyms: string;
  day: number;
  category: "표제어" | "동의어";
}

interface SATVocaPageProps {
  onStartTest?: (testInfo: any) => void;
}

export function SATVocaPage({ onStartTest }: SATVocaPageProps) {
  const [vocaCategory, setVocaCategory] = useState<'general' | 'yearly'>('general');
  const [step, setStep] = useState(1); // 1: DAY 선택, 2: 단어 확인, 3: 저장 및 다운로드
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState("");
  
  // Question count state
  const [engToKorTableCount, setEngToKorTableCount] = useState(0);
  const [engToKorSynonymCount, setEngToKorSynonymCount] = useState(0);
  const [korToEngTableCount, setKorToEngTableCount] = useState(0);
  const [synonymChoiceCount, setSynonymChoiceCount] = useState(0);
  
  const [availableDays, setAvailableDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTestTypeModal, setShowTestTypeModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [testType, setTestType] = useState<'korean' | 'english' | 'mixed'>('korean');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    async function loadDays() {
      try {
        setLoading(true);
        const data = await kvGet('sat_voca_available_days');
        if (data) {
          setAvailableDays(data);
        } else {
          const defaultDays = Array.from({ length: 40 }, (_, i) => ({
            day: i + 1,
            count: 40,
            isCompleted: false
          }));
          setAvailableDays(defaultDays);
        }
      } catch (error: any) {
        console.error("Failed to load days:", error);
        const defaultDays = Array.from({ length: 40 }, (_, i) => ({
          day: i + 1,
          count: 40,
          isCompleted: false
        }));
        setAvailableDays(defaultDays);
      } finally {
        setLoading(false);
      }
    }
    loadDays();
  }, []);

  const selectedWords = useMemo(() => {
    let words: SATWord[] = [];
    selectedDays.forEach(day => {
      words = [...words, ...generateSATWordsForDay(day)];
    });
    return words;
  }, [selectedDays]);

  const handleDayToggle = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleAddDays = () => {
    const days = inputValue.split(/[ ,]+/).map(d => parseInt(d.trim())).filter(d => !isNaN(d) && d > 0 && d <= 40);
    const newDays = [...new Set([...selectedDays, ...days])].sort((a, b) => a - b);
    setSelectedDays(newDays);
    setInputValue("");
  };

  const resetSelection = () => {
    setSelectedDays([]);
    setStep(1);
  };

  const handleTestTypeSelect = (type: 'korean' | 'english' | 'mixed') => {
    setTestType(type);
    setShowTestTypeModal(false);
    setIsTesting(true);
  };

  const handleTestFinish = (results: any) => {
    setIsTesting(false);
    if (onStartTest) {
      onStartTest({
        type: testType,
        days: selectedDays,
        results
      });
    }
  };

  const executeDownload = (type: 'test' | 'answer' | 'all') => {
    console.log(`Downloading ${type}...`);
    const htmlContent = generateTestHTML(type);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAT_Voca_Test_Day_${selectedDays.join('_')}_${type}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDownloadModal(false);
  };

  const generateTestHTML = (type: 'test' | 'answer' | 'all') => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>SAT Vocabulary Test</title>
          <style>
            body { font-family: sans-serif; padding: 40px; }
            h1 { text-align: center; color: #333; }
            .info { margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            .word-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .word-item { border-bottom: 1px solid #eee; padding: 8px; display: flex; }
            .num { width: 30px; font-weight: bold; color: #666; }
          </style>
        </head>
        <body>
          <h1>SAT Voca Test (Day ${selectedDays.join(', ')})</h1>
          <div class="info">
            <p>Name: _________________</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="word-grid">
            ${selectedWords.map((word, index) => `
              <div class="word-item">
                <span class="num">${index + 1}.</span>
                <span>${type === 'answer' ? `${word.english} : ${word.korean}` : (testType === 'korean' ? word.english : '_________________')}</span>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;
  };

  if (isTesting) {
    return (
      <SATVocaTest 
        days={selectedDays} 
        words={selectedWords} 
        type={testType} 
        onFinish={handleTestFinish}
        onCancel={() => setIsTesting(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SAT Vocabulary</h1>
        <p className="text-gray-600">학습할 DAY를 선택하고 시험지를 생성하세요.</p>
      </header>

      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#3DB89E]" />
                DAY 선택
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="예: 1, 2, 5"
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DB89E]/50 w-32"
                />
                <Button onClick={handleAddDays} style={{ backgroundColor: '#3DB89E', color: 'white' }}>
                  추가
                </Button>
                <Button variant="outline" onClick={resetSelection}>
                  초기화
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-3">
              {availableDays.map((dayInfo: any) => (
                <button
                  key={dayInfo.day}
                  onClick={() => handleDayToggle(dayInfo.day)}
                  className={`
                    h-12 rounded-lg border-2 transition-all flex flex-col items-center justify-center
                    ${selectedDays.includes(dayInfo.day) 
                      ? 'border-[#3DB89E] bg-[#3DB89E]/5 text-[#3DB89E] font-bold' 
                      : 'border-gray-100 hover:border-gray-300 text-gray-500'}
                  `}
                >
                  <span className="text-sm">DAY</span>
                  <span className="text-lg leading-none">{dayInfo.day}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedDays.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
              <Button 
                className="w-full py-6 text-lg shadow-xl"
                style={{ backgroundColor: '#3DB89E', color: 'white' }}
                onClick={() => setStep(2)}
              >
                {selectedDays.length}개 DAY 단어 확인하기
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(1)} className="flex items-center gap-2">
              <Minus className="w-4 h-4" /> 뒤로가기
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTestTypeModal(true)}>
                <RefreshCw className="w-4 h-4 mr-2" /> 테스트 시작
              </Button>
              <Button style={{ backgroundColor: '#3DB89E', color: 'white' }} onClick={() => setShowDownloadModal(true)}>
                <FileText className="w-4 h-4 mr-2" /> PDF/인쇄
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-bottom border-gray-100 flex justify-between items-center">
              <span className="font-medium text-gray-700">선택된 단어 (총 {selectedWords.length}개)</span>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>표제어: {selectedWords.filter(w => w.category === '표제어').length}</span>
                <span>동의어: {selectedWords.filter(w => w.category === '동의어').length}</span>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {selectedWords.map((word, idx) => (
                <div key={idx} className="p-4 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                  <span className="text-gray-300 font-mono text-sm mt-1">{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{word.english}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${word.category === '표제어' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {word.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{word.korean}</p>
                    {word.synonyms && (
                      <p className="text-sm text-gray-400 mt-1 italic">Syn: {word.synonyms}</p>
                    )}
                  </div>
                  <div className="text-xs font-medium text-[#3DB89E] bg-[#3DB89E]/10 px-2 py-1 rounded">
                    DAY {word.day}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Test Type Modal */}
      <TestTypeSelectionModal 
        isOpen={showTestTypeModal}
        onClose={() => setShowTestTypeModal(false)}
        onSelect={handleTestTypeSelect}
      />
      
      {/* Download Type Selection Modal */}
      <Dialog open={showDownloadModal} onOpenChange={setShowDownloadModal}>
        <DialogContent className="max-w-md">
          <DialogTitle className="text-center text-xl mb-6">다운로드 유형 선택</DialogTitle>
          <DialogDescription className="sr-only">
            다운로드할 유형을 선택하세요. 시험지, 답안지 또는 둘 다 다운로드할 수 있습니다.
          </DialogDescription>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => executeDownload('test')}
              className="py-6 text-lg hover:opacity-90 transition-opacity"
              variant="outline"
              style={{ borderColor: '#3DB89E', color: '#3DB89E' }}
            >
              시험지 다운로드
            </Button>

            <Button
              onClick={() => executeDownload('answer')}
              className="py-6 text-lg hover:opacity-90 transition-opacity"
              variant="outline"
              style={{ borderColor: '#3DB89E', color: '#3DB89E' }}
            >
              답안지 다운로드
            </Button>

            <Button
              onClick={() => executeDownload('all')}
              className="py-6 text-lg text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#3DB89E' }}
            >
              시험지 + 답안지
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
