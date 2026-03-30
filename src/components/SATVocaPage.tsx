import { useState, useMemo, useEffect } from "react";
import { Button } from "./ui/button";
import { Check, Minus, Plus, RefreshCw, Trash2, FileText, Calendar, X } from "lucide-react";
import { generateSATWordsForDay } from "./vocaWordSets";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { TestTypeSelectionModal } from "./TestTypeSelectionModal";
import { SATVocaTest } from "./SATVocaTest";
import { projectId, publicAnonKey } from '../utils/supabase/info';

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
  const [korToEngSynonymCount, setKorToEngSynonymCount] = useState(0);
  const [defToEngCount, setDefToEngCount] = useState(0); // 영영풀이 → 영어 (SAT 전용)

  // Step 2 state
  const [activeTab, setActiveTab] = useState("랜덤");
  const [showFirstLetter, setShowFirstLetter] = useState(false);
  const [selectedWords, setSelectedWords] = useState<SATWord[]>([]);
  const [listTab, setListTab] = useState("전체");
  const [mobileListView, setMobileListView] = useState<'all' | 'selected'>('all');

  // Step 3 state
  const [testDate, setTestDate] = useState("2025.12.04");
  const [useDate, setUseDate] = useState(true);
  const [testName, setTestName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [showHackersLogo, setShowHackersLogo] = useState(true);
  const [showTestTypeModal, setShowTestTypeModal] = useState(false);
  const [schoolLogoFile, setSchoolLogoFile] = useState<File | null>(null);
  const [lineSpacing, setLineSpacing] = useState<'narrow' | 'wide'>('wide');
  
  // Download modal state
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'word'>('pdf');
  
  // Test state
  const [isTestActive, setIsTestActive] = useState(false);
  const [activeTestInfo, setActiveTestInfo] = useState<any>(null);

  // Raw word/day data from Supabase (or localStorage fallback)
  const [allSavedWords, setAllSavedWords] = useState<any[]>([]);
  const [allSavedDays, setAllSavedDays] = useState<any[]>([]);

  useEffect(() => {
    const apiBase = `https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1`;
    const load = async () => {
      try {
        const [wRes, dRes] = await Promise.all([
          fetch(`${apiBase}/words`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }),
          fetch(`${apiBase}/days`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } })
        ]);
        const wData = await wRes.json();
        const dData = await dRes.json();
        if (wData.success && Array.isArray(wData.words) && wData.words.length > 0) {
          setAllSavedWords(wData.words);
          setAllSavedDays(dData.days || []);
          return;
        }
      } catch {}
      // Fallback to localStorage
      const sw = localStorage.getItem('satVocaWords');
      const sd = localStorage.getItem('satVocaDays');
      if (sw) setAllSavedWords(JSON.parse(sw));
      if (sd) setAllSavedDays(JSON.parse(sd));
    };
    load();
  }, []);

  const availableDays = useMemo(() => {
    if (allSavedDays.length === 0) return [];
    return allSavedDays.filter((d: any) => (d.category || 'general') === vocaCategory);
  }, [vocaCategory, allSavedDays]);

  const totalAvailableWordsCount = useMemo(() => {
    return allSavedWords.filter((w: any) => (w.category || 'general') === vocaCategory).length;
  }, [vocaCategory, allSavedWords]);

  // Get available words based on selected days and category
  const availableWords = useMemo(() => {
    const categoryWords = allSavedWords.filter((w: any) => (w.category || 'general') === vocaCategory);
    
    if (selectedDays.length === 0) return [];
    
    const words: SATWord[] = [];
    let globalId = 1;
    
    selectedDays.forEach(day => {
      const dayWords = categoryWords.filter((w: any) => w.day === day);
      dayWords.forEach((word: any) => {
        // 단어를 표제어로 분류
        words.push({
          id: globalId++,
          english: word.english,
          korean: word.korean,
          definition: word.definition,
          synonyms: word.synonym || '',
          day: day,
          category: "표제어"
        });
        
        // 동의어도 추가
        if (word.synonym) {
          const synonymList = word.synonym.split(/[,/ ]+/).map((s: string) => s.trim()).filter(Boolean);
          synonymList.slice(0, 2).forEach((syn: string) => {
            words.push({
              id: globalId++,
              english: syn,
              korean: word.korean,
              definition: word.definition,
              synonyms: word.synonym,
              day: day,
              category: "동의어"
            });
          });
        }
      });
    });
    
    return words;
  }, [selectedDays, vocaCategory]);

  const maxAvailable = availableWords.length;

  // Calculate available headwords and synonyms
  const availableHeadwords = availableWords.filter(w => w.category === "표제어").length;
  const availableSynonyms = availableWords.filter(w => w.category === "동의어").length;

  const totalQuestions = useMemo(() => {
    return engToKorTableCount + engToKorSynonymCount + korToEngTableCount + korToEngSynonymCount + defToEngCount;
  }, [engToKorTableCount, engToKorSynonymCount, korToEngTableCount, korToEngSynonymCount, defToEngCount]);

  const days = useMemo(() => {
    return availableDays.map(d => d.day);
  }, [availableDays]);

  const handleDayClick = (dayNum: number) => {
    setSelectedDays(prev => {
      if (prev.includes(dayNum)) {
        return prev.filter(d => d !== dayNum);
      }
      return [...prev, dayNum];
    });
  };

  const handleSelectInput = () => {
    // Parse input like "1, 3-5, 7-8"
    const parts = inputValue.split(',').map(s => s.trim());
    const newDays: number[] = [];
    
    parts.forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        for (let i = start; i <= end; i++) {
          if (!newDays.includes(i)) {
            newDays.push(i);
          }
        }
      } else {
        const num = parseInt(part);
        if (!isNaN(num) && !newDays.includes(num)) {
          newDays.push(num);
        }
      }
    });
    
    setSelectedDays(newDays.sort((a, b) => a - b));
  };

  const handleAllDaysToggle = () => {
    if (selectedDays.length === availableDays.length) {
      setSelectedDays([]);
    } else {
      setSelectedDays(availableDays.map(d => d.day));
    }
  };

  const handleRemoveFromSelected = (wordId: number) => {
    setSelectedWords(prev => prev.filter(w => w.id !== wordId));
  };

  const proceedToStep2 = () => {
    if (selectedDays.length === 0) {
      alert("출제범위를 선택해주세요.");
      return;
    }
    if (totalQuestions === 0) {
      alert("출제 문제수를 선택해주세요.");
      return;
    }
    
    // Auto-select words based on question count
    const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(totalQuestions, shuffled.length));
    setSelectedWords(selected);
    setStep(2);
  };

  const proceedToStep3 = () => {
    if (selectedWords.length === 0) {
      alert("출제할 단어를 선택해주세요.");
      return;
    }
    setStep(3);
  };

  const handleStartTest = () => {
    setShowTestTypeModal(true);
  };

  const handleTestTypeSelect = (testType: 'multiple' | 'subjective' | 'mixed') => {
    setShowTestTypeModal(false);
    const testInfo = {
      type: 'sat_vocabulary',
      testType: testType,
      words: selectedWords,
      engToKorTableCount,
      engToKorSynonymCount,
      korToEngTableCount,
      korToEngSynonymCount,
      defToEngCount,
      totalQuestions: selectedWords.length,
      testDate,
      testName,
      schoolName
    };
    
    if (onStartTest) {
      onStartTest(testInfo);
    } else {
      // Internal test mode
      setActiveTestInfo(testInfo);
      setIsTestActive(true);
    }
  };

  const handleExitTest = () => {
    setIsTestActive(false);
    setActiveTestInfo(null);
  };

  const handleDownloadPDF = () => {
    setDownloadFormat('pdf');
    setShowDownloadModal(true);
  };

  const handleDownloadWord = () => {
    setDownloadFormat('word');
    setShowDownloadModal(true);
  };

  const executeDownload = (type: 'test' | 'answer' | 'all') => {
    if (downloadFormat === 'pdf') {
      executeDownloadPDF(type);
    } else {
      executeDownloadWord(type);
    }
    setShowDownloadModal(false);
  };

  const executeDownloadPDF = (type: 'test' | 'answer' | 'all') => {
    // Generate HTML for printing/PDF
    const htmlContent = generateTestHTML(type);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const executeDownloadWord = (type: 'test' | 'answer' | 'all') => {
    // Generate HTML for Word document
    const htmlContent = generateTestHTML(type);
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const typeText = type === 'test' ? '시험지' : type === 'answer' ? '답안지' : '전체자료';
    link.download = `SAT_어휘_${typeText}_${testDate.replace(/\./g, '')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateTestHTML = (type: 'test' | 'answer' | 'all') => {
    // Split words into two columns
    const wordsPerColumn = Math.ceil(selectedWords.length / 2);
    const leftColumn = selectedWords.slice(0, wordsPerColumn);
    const rightColumn = selectedWords.slice(wordsPerColumn);

    const maxRows = Math.max(leftColumn.length, rightColumn.length);

    // Generate test sheet rows (only English words)
    let testTableRows = '';
    for (let i = 0; i < maxRows; i++) {
      const leftWord = leftColumn[i];
      const rightWord = rightColumn[i];
      
      testTableRows += `
        <tr>
          <td style="width: 30px; text-align: center; padding: 8px 4px; border-bottom: 1px solid #ddd;">${leftWord ? i + 1 : ''}</td>
          <td style="width: 180px; padding: 8px 12px; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd;">${leftWord ? leftWord.english : ''}</td>
          <td style="width: 240px; padding: 8px 12px; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd;"></td>
          <td style="width: 30px; text-align: center; padding: 8px 4px; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd;">${rightWord ? wordsPerColumn + i + 1 : ''}</td>
          <td style="width: 180px; padding: 8px 12px; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd;">${rightWord ? rightWord.english : ''}</td>
          <td style="width: 240px; padding: 8px 12px; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd;"></td>
        </tr>
      `;
    }

    // Generate answer sheet rows (English + Korean)
    let answerTableRows = '';
    for (let i = 0; i < maxRows; i++) {
      const leftWord = leftColumn[i];
      const rightWord = rightColumn[i];
      
      answerTableRows += `
        <tr>
          <td style="width: 30px; text-align: center; padding: 8px 4px; border-bottom: 1px solid #ddd;">${leftWord ? i + 1 : ''}</td>
          <td style="width: 180px; padding: 8px 12px; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd;">${leftWord ? leftWord.english : ''}</td>
          <td style="width: 240px; padding: 8px 12px; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd; color: #dc2626;">${leftWord ? leftWord.korean : ''}</td>
          <td style="width: 30px; text-align: center; padding: 8px 4px; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd;">${rightWord ? wordsPerColumn + i + 1 : ''}</td>
          <td style="width: 180px; padding: 8px 12px; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd;">${rightWord ? rightWord.english : ''}</td>
          <td style="width: 240px; padding: 8px 12px; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd; color: #dc2626;">${rightWord ? rightWord.korean : ''}</td>
        </tr>
      `;
    }

    const tableRows = type === 'answer' ? answerTableRows : testTableRows;

    if (type === 'all') {
      // Both test and answer sheets
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SAT 어휘 전체 자료</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif;
      margin: 0;
      padding: 20px;
      font-size: 11pt;
    }
    .page {
      page-break-after: always;
    }
    .header {
      border-top: 3px solid #333;
      border-bottom: 1px solid #333;
      padding: 10px 0;
      margin-bottom: 15px;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;
    }
    .date {
      font-size: 10pt;
    }
    .info-fields {
      display: flex;
      gap: 40px;
      font-size: 10pt;
    }
    .info-field {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .field-label {
      padding: 2px 8px;
      border: 1px solid #333;
      border-radius: 12px;
    }
    .field-value {
      min-width: 150px;
      border-bottom: 1px solid #333;
      padding: 0 5px;
    }
    .instructions {
      text-align: center;
      padding: 15px 0;
      border-bottom: 2px solid #333;
      margin-bottom: 20px;
      font-size: 10pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #333;
    }
    th {
      background-color: #f5f5f5;
      padding: 8px;
      border: 1px solid #ddd;
      font-size: 10pt;
      font-weight: normal;
    }
    td {
      font-size: 10pt;
    }
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <!-- Test Sheet -->
  <div class="page">
    <div class="header">
      <div class="header-content">
        <div class="date">${useDate ? testDate : ''}</div>
        <div class="info-fields">
          <div class="info-field">
            <span class="field-label">이름</span>
            <span class="field-value"></span>
          </div>
          <div class="info-field">
            <span class="field-label">맞은개수</span>
            <span class="field-value">/ ${selectedWords.length}</span>
          </div>
        </div>
      </div>
    </div>
    
    <table>
      ${testTableRows}
    </table>
  </div>

  <!-- Answer Sheet -->
  <div>
    <div class="header">
      <div class="header-content">
        <div class="date">${useDate ? testDate : ''}</div>
        <div class="info-fields">
          <div class="info-field">
            <span class="field-label">이름</span>
            <span class="field-value"></span>
          </div>
          <div class="info-field">
            <span class="field-label">맞은개수</span>
            <span class="field-value">/ ${selectedWords.length}</span>
          </div>
        </div>
      </div>
    </div>
    
    <table>
      ${answerTableRows}
    </table>
  </div>
</body>
</html>
      `;
    }

    // Single page (test or answer)
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SAT 어휘 ${type === 'test' ? '시험지' : '답안지'}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    body {
      font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif;
      margin: 0;
      padding: 10px;
      font-size: 9pt;
      line-height: 1.2;
    }
    .header {
      border-top: 2px solid #333;
      border-bottom: 1px solid #333;
      padding: 6px 0;
      margin-bottom: 8px;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;
    }
    .date {
      font-size: 9pt;
    }
    .info-fields {
      display: flex;
      gap: 30px;
      font-size: 9pt;
    }
    .info-field {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .field-label {
      padding: 2px 6px;
      border: 1px solid #333;
      border-radius: 10px;
    }
    .field-value {
      min-width: 120px;
      border-bottom: 1px solid #333;
      padding: 0 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #333;
    }
    th {
      background-color: #f5f5f5;
      padding: 4px 6px;
      border: 1px solid #ddd;
      font-size: 9pt;
      font-weight: normal;
    }
    td {
      padding: 4px 6px;
      border: 1px solid #ddd;
      font-size: 9pt;
    }
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-content">
      <div class="date">${useDate ? testDate : ''}</div>
      <div class="info-fields">
        <div class="info-field">
          <span class="field-label">이름</span>
          <span class="field-value"></span>
        </div>
        <div class="info-field">
          <span class="field-label">맞은개수</span>
          <span class="field-value">/ ${selectedWords.length}</span>
        </div>
      </div>
    </div>
  </div>
  
  <table>
    ${tableRows}
  </table>
</body>
</html>
    `;
  };

  // If test is active, show test screen
  if (isTestActive && activeTestInfo) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50">
        <SATVocaTest testInfo={activeTestInfo} onExit={handleExitTest} />
      </div>
    );
  }

  // Step 1: DAY Selection Screen
  if (step === 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 pb-24 md:pb-8">
        <div className="bg-white rounded-lg md:border md:border-gray-300 md:p-10 p-4">
          {/* Title */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              💡 SAT 어휘 출제하기
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-100">
            <button
              onClick={() => {
                setVocaCategory('general');
                setSelectedDays([]);
                setInputValue("");
              }}
              className={`pb-3 px-2 font-bold text-lg transition-colors border-b-2 ${vocaCategory === 'general' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              SAT 어휘 출제
            </button>
            <button
              onClick={() => {
                setVocaCategory('yearly');
                setSelectedDays([]);
                setInputValue("");
              }}
              className={`pb-3 px-2 font-bold text-lg transition-colors border-b-2 ${vocaCategory === 'yearly' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              연도별 단어
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
            {/* Left: Day Selection */}
            <div>
              <div className="mb-4">
                <h3 className="mb-3 text-base md:text-lg font-medium">
                  <span className="text-gray-900">출제범위</span>{' '}
                  <span className="text-gray-400 text-sm">
                    {vocaCategory === 'general' ? '(예: 1-2)' : '(직접 입력 가능)'}
                  </span>
                </h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="예시) 1-2"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                  />
                  <Button
                    onClick={handleSelectInput}
                    className="px-4 md:px-8 text-white hover:opacity-90 text-sm rounded-lg"
                    style={{ backgroundColor: '#3DB89E' }}
                  >
                    선택
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAllDaysToggle}
                    className="hidden md:inline-flex px-6 border-gray-300 rounded-lg"
                  >
                    {selectedDays.length === availableDays.length ? '전체해제' : '전체선택'}
                  </Button>
                </div>
              </div>

              {/* Day List with Scroll */}
              <div className="border border-gray-300 rounded-xl p-3 md:p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white h-[350px] md:h-[500px]">
                {availableDays.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <p>등록된 {vocaCategory === 'general' ? 'DAY' : '연도'}가 없습니다.</p>
                    <p className="text-xs">CMS 관리자 페이지에서 추가해주세요.</p>
                  </div>
                ) : (
                  availableDays.map((dayInfo) => (
                    <div
                      key={dayInfo.day}
                      onClick={() => handleDayClick(dayInfo.day)}
                      className={`flex items-center justify-between px-3 md:px-4 py-2.5 md:py-2 mb-1.5 rounded-lg cursor-pointer transition-all ${
                        selectedDays.includes(dayInfo.day) 
                          ? 'bg-white border-2 shadow-sm'
                          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      style={selectedDays.includes(dayInfo.day) ? { borderColor: '#3DB89E' } : {}}
                    >
                      <div className="flex items-center gap-2 md:gap-4">
                        <span className="text-gray-400 w-5 md:w-6 text-sm">{dayInfo.day}</span>
                        <span className="text-gray-300 hidden md:inline">|</span>
                        <span className={`text-sm md:text-base ${selectedDays.includes(dayInfo.day) ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                          {dayInfo.name}
                        </span>
                        <span className="text-xs text-gray-400">({dayInfo.wordCount}개)</span>
                      </div>
                      {selectedDays.includes(dayInfo.day) && (
                        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3DB89E' }}>
                          <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Question Count */}
            <div>
              {/* Available Questions Box */}
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 md:p-5 mb-4 md:mb-5 text-center border border-teal-200 shadow-sm">
                <h3 className="text-xs md:text-sm text-gray-600 mb-2 font-medium">
                  출제 가능 문제수
                </h3>
                <div className="mb-1">
                  <span className="text-3xl md:text-4xl font-bold" style={{ color: '#3DB89E' }}>{totalAvailableWordsCount > 0 ? availableWords.length : 0}</span>
                  <span className="text-sm md:text-base text-gray-600 ml-1 font-medium">문제</span>
                </div>
                <p className="text-xs text-gray-600">
                  표제어 <span className="font-semibold" style={{ color: '#3DB89E' }}>{availableHeadwords}</span> / 동의어 <span className="font-semibold" style={{ color: '#3DB89E' }}>{availableSynonyms}</span>
                </p>
              </div>

              {/* Question Count Settings */}
              <div>
                <h3 className="mb-3 text-base md:text-lg font-medium text-gray-900">출제 문제수</h3>

                {/* English to Korean */}
                <div className="mb-3 md:mb-4 bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-700 text-sm font-medium">영어 →</span>
                    <span className="px-3 py-1 rounded-lg text-white text-xs font-semibold shadow-sm" style={{ backgroundColor: '#4CAF50' }}>
                      한글 쓰기
                    </span>
                  </div>
                  <div className="space-y-2.5 ml-0 md:ml-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-gray-700 font-medium">표제어</span>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-7 h-7 md:w-8 md:h-8 p-0 rounded-lg hover:bg-gray-100"
                          onClick={() => setEngToKorTableCount(Math.max(0, engToKorTableCount - 1))}
                        >
                          <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </Button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={engToKorTableCount === 0 ? '' : engToKorTableCount}
                          placeholder="0"
                          onChange={(e) => {
                            const rawInput = e.target.value.replace(/\D/g, '');
                            const numValue = rawInput === '' ? 0 : parseInt(rawInput, 10);
                            setEngToKorTableCount(Math.max(0, Math.min(availableHeadwords, numValue)));
                          }}
                          className="w-10 md:w-12 text-center border border-gray-300 rounded-lg py-1 text-sm font-semibold"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-7 h-7 md:w-8 md:h-8 p-0 rounded-lg hover:bg-gray-100"
                          onClick={() => setEngToKorTableCount(Math.min(availableHeadwords, engToKorTableCount + 1))}
                        >
                          <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-gray-700 font-medium">동의어</span>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-7 h-7 md:w-8 md:h-8 p-0 rounded-lg hover:bg-gray-100"
                          onClick={() => setEngToKorSynonymCount(Math.max(0, engToKorSynonymCount - 1))}
                        >
                          <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </Button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={engToKorSynonymCount === 0 ? '' : engToKorSynonymCount}
                          placeholder="0"
                          onChange={(e) => {
                            const rawInput = e.target.value.replace(/\D/g, '');
                            const numValue = rawInput === '' ? 0 : parseInt(rawInput, 10);
                            setEngToKorSynonymCount(Math.max(0, Math.min(availableSynonyms, numValue)));
                          }}
                          className="w-10 md:w-12 text-center border border-gray-300 rounded-lg py-1 text-sm font-semibold"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-7 h-7 md:w-8 md:h-8 p-0 rounded-lg hover:bg-gray-100"
                          onClick={() => setEngToKorSynonymCount(Math.min(availableSynonyms, engToKorSynonymCount + 1))}
                        >
                          <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Korean to English */}
                <div className="mb-3 md:mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-700 text-sm font-medium">한글 뜻 →</span>
                    <span className="px-3 py-1 rounded-lg text-white text-xs font-semibold shadow-sm" style={{ backgroundColor: '#2196F3' }}>
                      영어 쓰기
                    </span>
                  </div>
                  <div className="space-y-2.5 ml-0 md:ml-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-gray-700 font-medium">표제어</span>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-7 h-7 md:w-8 md:h-8 p-0 rounded-lg hover:bg-gray-100"
                          onClick={() => setKorToEngTableCount(Math.max(0, korToEngTableCount - 1))}
                        >
                          <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </Button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={korToEngTableCount === 0 ? '' : korToEngTableCount}
                          placeholder="0"
                          onChange={(e) => {
                            const rawInput = e.target.value.replace(/\D/g, '');
                            const numValue = rawInput === '' ? 0 : parseInt(rawInput, 10);
                            setKorToEngTableCount(Math.max(0, Math.min(availableHeadwords, numValue)));
                          }}
                          className="w-10 md:w-12 text-center border border-gray-300 rounded-lg py-1 text-sm font-semibold"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-7 h-7 md:w-8 md:h-8 p-0 rounded-lg hover:bg-gray-100"
                          onClick={() => setKorToEngTableCount(Math.min(availableHeadwords, korToEngTableCount + 1))}
                        >
                          <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-gray-700 font-medium">동의어</span>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-7 h-7 md:w-8 md:h-8 p-0 rounded-lg hover:bg-gray-100"
                          onClick={() => setKorToEngSynonymCount(Math.max(0, korToEngSynonymCount - 1))}
                        >
                          <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </Button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={korToEngSynonymCount === 0 ? '' : korToEngSynonymCount}
                          placeholder="0"
                          onChange={(e) => {
                            const rawInput = e.target.value.replace(/\D/g, '');
                            const numValue = rawInput === '' ? 0 : parseInt(rawInput, 10);
                            setKorToEngSynonymCount(Math.max(0, Math.min(availableSynonyms, numValue)));
                          }}
                          className="w-10 md:w-12 text-center border border-gray-300 rounded-lg py-1 text-sm font-semibold"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-7 h-7 md:w-8 md:h-8 p-0 rounded-lg hover:bg-gray-100"
                          onClick={() => setKorToEngSynonymCount(Math.min(availableSynonyms, korToEngSynonymCount + 1))}
                        >
                          <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Definition to English (SAT 전용) */}
                <div className="mb-3 md:mb-4 bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-purple-200 text-purple-800 rounded-lg text-xs font-semibold">SAT 전용</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-700 text-sm font-medium">영영풀이 →</span>
                    <span className="px-3 py-1 rounded-lg text-white text-xs font-semibold shadow-sm" style={{ backgroundColor: '#9C27B0' }}>
                      영어 쓰기
                    </span>
                  </div>
                  <div className="ml-0 md:ml-6 flex items-center justify-between">
                    <span className="text-xs md:text-sm text-gray-700 font-medium">문제수</span>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-7 h-7 md:w-8 md:h-8 p-0 rounded-lg hover:bg-gray-100"
                        onClick={() => setDefToEngCount(Math.max(0, defToEngCount - 1))}
                      >
                        <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      </Button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={defToEngCount === 0 ? '' : defToEngCount}
                        placeholder="0"
                        onChange={(e) => {
                          const rawInput = e.target.value.replace(/\D/g, '');
                          const numValue = rawInput === '' ? 0 : parseInt(rawInput, 10);
                          setDefToEngCount(Math.max(0, Math.min(maxAvailable, numValue)));
                        }}
                        className="w-10 md:w-12 text-center border border-gray-300 rounded-lg py-1 text-sm font-semibold"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-7 h-7 md:w-8 md:h-8 p-0 rounded-lg hover:bg-gray-100"
                        onClick={() => setDefToEngCount(Math.min(maxAvailable, defToEngCount + 1))}
                      >
                        <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-purple-600 mt-2 ml-0 md:ml-6 italic">
                    예: "to leave hurriedly..." → abscond
                  </p>
                </div>

                {/* Total */}
                <div className="text-center md:text-right pt-3 md:pt-4 border-t-2 border-gray-300 mt-2">
                  <span className="text-xl md:text-2xl font-bold" style={{ color: '#3DB89E' }}>총 {totalQuestions} 문제</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 md:mt-10 text-center">
            <Button
              onClick={proceedToStep2}
              className="w-full md:w-auto px-12 md:px-24 py-4 md:py-6 text-base md:text-lg rounded-xl md:rounded-full text-white hover:opacity-90 transition-all shadow-lg font-semibold"
              style={{ backgroundColor: '#3DB89E' }}
            >
              어휘 시험 출제하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Word Selection Screen (Modal)
  const Step2Modal = (
    <Dialog open={step === 2} onOpenChange={(open) => !open && setStep(1)}>
      <DialogContent className="!max-w-[1400px] !w-[95vw] md:!w-[90vw] !h-[80vh] md:!h-[85vh] !bottom-auto !top-[10vh] md:!top-auto p-0 overflow-hidden flex flex-col [&>button]:hidden">
        <DialogTitle className="sr-only">SAT 어휘 시험 출제하기 - Step 1. 출제 단어 확인 및 선택</DialogTitle>
        <DialogDescription className="sr-only">
          전체 단어 리스트에서 출제할 단어를 선택하고 출제 리스트를 관리할 수 있습니다.
        </DialogDescription>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="text-white text-center py-2.5 md:py-4 px-3 md:px-6 relative" style={{ backgroundColor: '#3DB89E' }}>
            <h1 className="text-sm md:text-xl font-semibold px-8 md:px-0">SAT 어휘 시험 출제하기 - Step 1. 출제 단어 확인 및 선택</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              className="absolute right-2 md:right-4 top-1.5 md:top-3 text-white hover:bg-white/20 p-1.5"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-1.5 md:py-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-1.5 md:gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-600">문제 배치</span>
                <Button
                  variant={activeTab === "랜덤" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("랜덤")}
                  className="text-xs md:text-sm px-3 md:px-4 h-6 md:h-8"
                  style={activeTab === "랜덤" ? { backgroundColor: '#3DB89E', color: 'white' } : {}}
                >
                  랜덤
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-600">영단어 첫 글자 보여주기</span>
                <Button
                  variant={showFirstLetter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFirstLetter(!showFirstLetter)}
                  className="text-xs md:text-sm px-4 md:px-6 h-6 md:h-8"
                  style={showFirstLetter ? { backgroundColor: '#3DB89E', color: 'white' } : {}}
                >
                  {showFirstLetter ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile: Tab Switcher */}
          <div className="md:hidden bg-white border-b border-gray-200 px-3 py-1.5">
            <div className="flex gap-2">
              <button
                onClick={() => setMobileListView('all')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mobileListView === 'all'
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                전체 리스트 ({availableWords.length})
              </button>
              <button
                onClick={() => setMobileListView('selected')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mobileListView === 'selected'
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                출제 리스트 ({selectedWords.length})
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto px-2 md:px-6 py-2 md:py-4 bg-gray-50">
            {/* Desktop: Two columns */}
            <div className="hidden md:grid grid-cols-2 gap-6">
              {/* Left: All Words */}
              <div className="bg-white rounded-lg border border-gray-300">
                <div className="border-b border-gray-300 p-3 flex items-center justify-between bg-gray-50">
                  <h3 className="text-base">전체 리스트 ({availableWords.length}개)</h3>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm text-gray-600">영단어</th>
                        <th className="px-3 py-2 text-left text-sm text-gray-600">한글 뜻</th>
                        <th className="px-3 py-2 text-left text-sm text-gray-600">영영풀이</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableWords.slice(0, 100).map((word) => (
                        <tr
                          key={word.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            selectedWords.find(w => w.id === word.id) ? 'bg-green-50' : ''
                          }`}
                          onClick={() => {
                            if (!selectedWords.find(w => w.id === word.id)) {
                              setSelectedWords(prev => [...prev, word]);
                            }
                          }}
                        >
                          <td className="px-3 py-2 text-sm">{word.english}</td>
                          <td className="px-3 py-2 text-sm text-gray-600">{word.korean}</td>
                          <td className="px-3 py-2 text-xs text-gray-500">{word.definition.slice(0, 25)}...</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Selected Words */}
              <div className="bg-white rounded-lg border border-gray-300">
                <div className="border-b border-gray-300 p-3 flex items-center justify-between bg-gray-50">
                  <h3 className="text-base">출제 리스�� ({selectedWords.length}개)</h3>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm text-gray-600">영단어</th>
                        <th className="px-3 py-2 text-left text-sm text-gray-600">한글 뜻</th>
                        <th className="px-3 py-2 text-left text-sm text-gray-600">삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedWords.map((word) => (
                        <tr key={word.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm">{word.english}</td>
                          <td className="px-3 py-2 text-sm text-gray-600">{word.korean}</td>
                          <td className="px-3 py-2 text-sm">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveFromSelected(word.id)}
                              className="p-1"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Mobile: Single List View */}
            <div className="md:hidden">
              {mobileListView === 'all' ? (
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
                  <div className="border-b border-gray-300 p-3 bg-gray-50">
                    <h3 className="text-sm font-semibold">전체 리스트 ({availableWords.length}개)</h3>
                    <p className="text-xs text-gray-500 mt-0.5">단어를 터치하여 출제 리스트에 추가하세요</p>
                  </div>
                  <div className="divide-y divide-gray-100 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
                    {availableWords.slice(0, 100).map((word) => (
                      <div
                        key={word.id}
                        className={`p-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors ${
                          selectedWords.find(w => w.id === word.id) ? 'bg-teal-50 border-l-4 border-teal-500' : ''
                        }`}
                        onClick={() => {
                          if (!selectedWords.find(w => w.id === word.id)) {
                            setSelectedWords(prev => [...prev, word]);
                          }
                        }}
                      >
                        <div className="font-medium text-sm mb-1">{word.english}</div>
                        <div className="text-xs text-gray-600">{word.korean}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
                  <div className="border-b border-gray-300 p-3 bg-gray-50">
                    <h3 className="text-sm font-semibold">출제 리스트 ({selectedWords.length}개)</h3>
                    <p className="text-xs text-gray-500 mt-0.5">삭제 버튼을 눌러 단어를 제거하세요</p>
                  </div>
                  <div className="divide-y divide-gray-100 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
                    {selectedWords.map((word) => (
                      <div key={word.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">{word.english}</div>
                          <div className="text-xs text-gray-600">{word.korean}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFromSelected(word.id)}
                          className="p-2 ml-2"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    ))}
                    {selectedWords.length === 0 && (
                      <div className="p-8 text-center text-gray-400 text-sm">
                        선택된 단어가 없습니다.<br/>전체 리스트에서 단어를 추가해주세요.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-3 md:px-6 py-2.5 md:py-4 bg-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
              <p className="text-xs md:text-sm text-gray-600 text-center md:text-left hidden md:block">
                * 출제 리스트 확인 후 [출제하기] 버튼을 클릭해주세요.
              </p>
              <Button
                onClick={proceedToStep3}
                className="w-full md:w-auto px-12 md:px-16 py-3 md:py-5 text-sm md:text-base rounded-xl md:rounded-full text-white hover:opacity-90 transition-opacity font-semibold shadow-lg"
                style={{ backgroundColor: '#3DB89E' }}
              >
                출제하기 →
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Step 3: Save and Download Screen (Modal)
  const Step3Modal = (
    <Dialog open={step === 3} onOpenChange={(open) => !open && setStep(2)}>
      <DialogContent className="!max-w-[1400px] !w-[95vw] md:!w-[90vw] !h-[80vh] md:!max-h-[90vh] !bottom-auto !top-[10vh] md:!top-auto p-0 overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">SAT 어휘 시험 출제하기 - Step 2. 저장 및 다운로드</DialogTitle>
        <DialogDescription className="sr-only">
          출��� 결과를 확인하고 테스트 정보를 설정한 후 다운로드하거나 테스트를 시작할 수 있습니다.
        </DialogDescription>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="text-white text-center py-2.5 md:py-4 px-3 md:px-6 relative flex-shrink-0" style={{ backgroundColor: '#3DB89E' }}>
            <h1 className="text-sm md:text-xl font-semibold leading-tight px-12 md:px-0">SAT 어휘 시험 출제하기 - Step 2. 저장 및 다운로드</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(2)}
              className="absolute left-1 md:left-4 top-1.5 md:top-3 text-white hover:bg-white/20 text-xs md:text-sm px-2 py-1.5 md:p-2"
            >
              &lt; 이전
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              className="absolute right-1 md:right-4 top-1.5 md:top-3 text-white hover:bg-white/20 p-1.5 md:p-2"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 px-3 md:px-6 py-2 md:py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
              {/* Left: Test Summary */}
              <div>
                <h3 className="text-base md:text-lg mb-2 md:mb-4 font-semibold">출제 결과</h3>
                <div className="space-y-1.5 md:space-y-3 mb-3 md:mb-6">
                  {engToKorTableCount > 0 && (
                    <div className="flex items-center justify-between py-1.5 md:py-3 border-b border-gray-300">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="text-xs md:text-sm">영어 →</span>
                        <span className="px-1.5 md:px-2 py-0.5 md:py-1 rounded text-white text-xs" style={{ backgroundColor: '#4CAF50' }}>
                          한글 쓰기
                        </span>
                      </div>
                      <span className="text-sm md:text-base font-medium">{engToKorTableCount}문제</span>
                    </div>
                  )}
                  {engToKorSynonymCount > 0 && (
                    <div className="flex items-center justify-between py-2 md:py-3 border-b border-gray-300">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="text-xs md:text-sm">영어 →</span>
                        <span className="px-1.5 md:px-2 py-0.5 md:py-1 rounded text-white text-xs" style={{ backgroundColor: '#4CAF50' }}>
                          한글 쓰기 (동의어)
                        </span>
                      </div>
                      <span className="text-sm md:text-base font-medium">{engToKorSynonymCount}문제</span>
                    </div>
                  )}
                  {korToEngTableCount > 0 && (
                    <div className="flex items-center justify-between py-2 md:py-3 border-b border-gray-300">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="text-xs md:text-sm">한글 뜻 →</span>
                        <span className="px-1.5 md:px-2 py-0.5 md:py-1 rounded text-white text-xs" style={{ backgroundColor: '#2196F3' }}>
                          영어 쓰기
                        </span>
                      </div>
                      <span className="text-sm md:text-base font-medium">{korToEngTableCount}문제</span>
                    </div>
                  )}
                  {korToEngSynonymCount > 0 && (
                    <div className="flex items-center justify-between py-1.5 md:py-3 border-b border-gray-300">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="text-xs md:text-sm">한글 뜻 →</span>
                        <span className="px-1.5 md:px-2 py-0.5 md:py-1 rounded text-white text-xs" style={{ backgroundColor: '#2196F3' }}>
                          영어 쓰기 (동의어)
                        </span>
                      </div>
                      <span className="text-sm md:text-base font-medium">{korToEngSynonymCount}문제</span>
                    </div>
                  )}
                  {defToEngCount > 0 && (
                    <div className="flex items-center justify-between py-1.5 md:py-3 border-b border-gray-300">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="text-xs md:text-sm">영영풀이 →</span>
                        <span className="px-1.5 md:px-2 py-0.5 md:py-1 rounded text-white text-xs" style={{ backgroundColor: '#9C27B0' }}>
                          영어 쓰기
                        </span>
                        <span className="px-1 md:px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">SAT</span>
                      </div>
                      <span className="text-sm md:text-base font-medium">{defToEngCount}문제</span>
                    </div>
                  )}
                </div>
                <div className="text-center py-2 md:py-6 border-t-2 border-gray-300">
                  <p className="text-sm md:text-xl">총 문항수 <span className="text-xl md:text-2xl ml-2 font-bold" style={{ color: '#3DB89E' }}>{selectedWords.length} 문제</span></p>
                </div>
              </div>

              {/* Right: Test Settings */}
              <div>
                <h3 className="text-base md:text-lg mb-2 md:mb-4 font-semibold">테스트 정보 설정</h3>
                <div className="space-y-2 md:space-y-4">
                  <div>
                    <label className="text-xs md:text-sm text-gray-700 mb-1 block">시험일자</label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 flex-1 px-2.5 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded bg-gray-50">
                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                        <input
                          type="text"
                          value={testDate}
                          onChange={(e) => setTestDate(e.target.value)}
                          className="flex-1 bg-transparent outline-none text-xs md:text-sm"
                        />
                      </div>
                      <input
                        type="checkbox"
                        id="useDate"
                        checked={useDate}
                        onChange={(e) => setUseDate(e.target.checked)}
                        className="w-3.5 h-3.5 md:w-4 md:h-4"
                        style={{ accentColor: '#3DB89E' }}
                      />
                      <label htmlFor="useDate" className="text-xs md:text-sm">사용</label>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm text-gray-700 mb-1 block">테스트명</label>
                    <input
                      type="text"
                      placeholder="테스트명을 입력해주세요."
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      className="w-full px-2.5 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded text-xs md:text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs md:text-sm text-gray-700 mb-1 block">학교/학원/클래스명</label>
                    <input
                      type="text"
                      placeholder="교육기관명을 입력해주세요."
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full px-2.5 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded text-xs md:text-sm"
                    />
                  </div>
                  
                  {/* Desktop Only: School Logo Upload */}
                  <div className="hidden md:block">
                    <label className="text-sm text-gray-700 mb-1 block">학교/학원 로고</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="선택된 파일 없음"
                        value={schoolLogoFile?.name || ""}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                      />
                      <label className="px-4 py-2 border border-gray-300 rounded text-sm cursor-pointer hover:bg-gray-50">
                        파일 선택
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/gif"
                          onChange={(e) => setSchoolLogoFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">*파일형식 jpg, png, gif (1MB 미만)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Section */}
            <div className="mt-4 md:mt-8 pt-3 md:pt-6 border-t border-gray-200 pb-4">
              <h2 className="text-base md:text-xl text-center mb-3 md:mb-6 font-semibold" style={{ color: '#3DB89E' }}>
                SAT 어휘 시험지 다운로드
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-2.5 md:gap-4">
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-4 rounded-lg border-2 hover:border-red-500 text-sm md:text-base"
                  style={{ borderColor: '#E0E0E0' }}
                >
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center bg-red-500 flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" />
                  </div>
                  <span className="text-sm md:text-base">PDF 다운로드</span>
                </Button>
                <Button
                  onClick={handleDownloadWord}
                  variant="outline"
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-4 rounded-lg border-2 hover:border-blue-500 text-sm md:text-base"
                  style={{ borderColor: '#E0E0E0' }}
                >
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center bg-blue-500 flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" />
                  </div>
                  <span className="text-sm md:text-base">워드 다운로드</span>
                </Button>
                <Button
                  onClick={handleStartTest}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-4 rounded-lg text-white hover:opacity-90 transition-opacity text-sm md:text-base"
                  style={{ backgroundColor: '#3DB89E' }}
                >
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center bg-white flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 md:w-5 md:h-5" style={{ color: '#3DB89E' }} />
                  </div>
                  <span className="text-sm md:text-base">테스트 시작</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {step === 1 && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg border border-gray-300 p-10">
            {/* Title */}
            <div className="mb-8">
              <h2 className="text-2xl">
                SAT 어휘 출제하기
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-start">
              {/* Left: Day Selection */}
              <div>
                <div className="mb-4">
                  <h3 className="mb-3">
                    <span className="text-gray-900">출제범위</span>{' '}
                    <span className="text-gray-400">(예시 : 1-2)</span>
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="예시) 1-2"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                    <Button
                      onClick={handleSelectInput}
                      className="px-8 text-white hover:opacity-90"
                      style={{ backgroundColor: '#3DB89E' }}
                    >
                      선택
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDays([])}
                      className="px-6 border-gray-300"
                    >
                      전체선택
                    </Button>
                  </div>
                </div>

                {/* Day List with Scroll */}
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 h-[500px] md:h-[1400px] overflow-y-auto">
                  {days.map((dayNum) => (
                    <div
                      key={dayNum}
                      onClick={() => handleDayClick(dayNum)}
                      className={`flex items-center justify-between px-3 py-1.5 mb-0.5 rounded-lg cursor-pointer transition-all ${
                        selectedDays.includes(dayNum) 
                          ? 'bg-white border-2'
                          : 'bg-white border border-gray-200 hover:border-gray-300'
                      }`}
                      style={selectedDays.includes(dayNum) ? { borderColor: '#3DB89E' } : {}}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 w-6">{dayNum}</span>
                        <span className="text-gray-400">|</span>
                        <span className={selectedDays.includes(dayNum) ? 'text-gray-900' : 'text-gray-600'}>
                          DAY {String(dayNum).padStart(2, '0')}
                        </span>
                        <span className="text-xs text-gray-400">(50개 단어)</span>
                      </div>
                      {selectedDays.includes(dayNum) && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3DB89E' }}>
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Question Count */}
              <div>
                {/* Available Questions Box */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center border border-gray-200">
                  <h3 className="text-sm mb-2">
                    출제 가능 문제수
                  </h3>
                  <div className="mb-1">
                    <span className="text-3xl" style={{ color: '#3DB89E' }}>{availableWords.length}</span>
                    <span className="text-base text-gray-600 ml-1">문제</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    표제어 <span style={{ color: '#3DB89E' }}>{availableHeadwords}</span> / 동의어 <span style={{ color: '#3DB89E' }}>{availableSynonyms}</span>
                  </p>
                </div>

                {/* Question Count Settings */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-xl mb-6">출제 문제수</h3>

                  {/* English to Korean */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-base">영어 →</span>
                      <span className="px-4 py-1.5 rounded-lg text-sm" style={{ backgroundColor: '#D4F4DD', color: '#22863a' }}>
                        한 한글 뜻 쓰���
                      </span>
                    </div>
                    
                    {/* 표제어 */}
                    <div className="ml-6 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-20">└ 표제어</span>
                        <button
                          onClick={() => setEngToKorTableCount(Math.max(0, engToKorTableCount - 1))}
                          className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <span className="text-xl text-gray-700">−</span>
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={engToKorTableCount === 0 ? '' : engToKorTableCount}
                          placeholder="0"
                          onChange={(e) => {
                            const rawInput = e.target.value.replace(/\D/g, '');
                            const numValue = rawInput === '' ? 0 : parseInt(rawInput, 10);
                            setEngToKorTableCount(Math.max(0, Math.min(availableHeadwords, numValue)));
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-28 text-center text-2xl border-2 border-gray-300 rounded-xl py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                        />
                        <button
                          onClick={() => setEngToKorTableCount(Math.min(availableHeadwords, engToKorTableCount + 1))}
                          className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <span className="text-xl text-gray-700">+</span>
                        </button>
                      </div>
                    </div>

                    {/* 동의어 */}
                    <div className="ml-6">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-20">└ 동의어</span>
                        <button
                          onClick={() => setEngToKorSynonymCount(Math.max(0, engToKorSynonymCount - 1))}
                          className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <span className="text-xl text-gray-700">−</span>
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={engToKorSynonymCount === 0 ? '' : engToKorSynonymCount}
                          placeholder="0"
                          onChange={(e) => {
                            const rawInput = e.target.value.replace(/\D/g, '');
                            const numValue = rawInput === '' ? 0 : parseInt(rawInput, 10);
                            setEngToKorSynonymCount(Math.max(0, Math.min(availableSynonyms, numValue)));
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-28 text-center text-2xl border-2 border-gray-300 rounded-xl py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                        />
                        <button
                          onClick={() => setEngToKorSynonymCount(Math.min(availableSynonyms, engToKorSynonymCount + 1))}
                          className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <span className="text-xl text-gray-700">+</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Korean to English */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-base">한글 뜻 →</span>
                      <span className="px-4 py-1.5 rounded-lg text-sm" style={{ backgroundColor: '#CCE5FF', color: '#0969da' }}>
                        E 영어 쓰기
                      </span>
                    </div>
                    
                    {/* 표제어 */}
                    <div className="ml-6 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-20">└ 표제어</span>
                        <button
                          onClick={() => setKorToEngTableCount(Math.max(0, korToEngTableCount - 1))}
                          className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <span className="text-xl text-gray-700">−</span>
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={korToEngTableCount === 0 ? '' : korToEngTableCount}
                          placeholder="0"
                          onChange={(e) => {
                            const rawInput = e.target.value.replace(/\D/g, '');
                            const numValue = rawInput === '' ? 0 : parseInt(rawInput, 10);
                            setKorToEngTableCount(Math.max(0, Math.min(availableHeadwords, numValue)));
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-28 text-center text-2xl border-2 border-gray-300 rounded-xl py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                        />
                        <button
                          onClick={() => setKorToEngTableCount(Math.min(availableHeadwords, korToEngTableCount + 1))}
                          className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <span className="text-xl text-gray-700">+</span>
                        </button>
                      </div>
                    </div>

                    {/* 동의어 */}
                    <div className="ml-6">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-20">└ 동의어</span>
                        <button
                          onClick={() => setKorToEngSynonymCount(Math.max(0, korToEngSynonymCount - 1))}
                          className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <span className="text-xl text-gray-700">−</span>
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={korToEngSynonymCount === 0 ? '' : korToEngSynonymCount}
                          placeholder="0"
                          onChange={(e) => {
                            const rawInput = e.target.value.replace(/\D/g, '');
                            const numValue = rawInput === '' ? 0 : parseInt(rawInput, 10);
                            setKorToEngSynonymCount(Math.max(0, Math.min(availableSynonyms, numValue)));
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-28 text-center text-2xl border-2 border-gray-300 rounded-xl py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                        />
                        <button
                          onClick={() => setKorToEngSynonymCount(Math.min(availableSynonyms, korToEngSynonymCount + 1))}
                          className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <span className="text-xl text-gray-700">+</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Total Questions Display */}
                  <div className="text-center py-6 bg-cyan-50 rounded-lg mt-6">
                    <span className="text-xl">총 </span>
                    <span className="text-5xl text-cyan-600" style={{ fontWeight: '700' }}>
                      {totalQuestions}
                    </span>
                    <span className="text-2xl text-cyan-600" style={{ fontWeight: '700' }}> 문제</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-10 text-center">
              <Button
                onClick={proceedToStep2}
                className="px-24 py-6 text-lg rounded-full text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#3DB89E' }}
              >
                어휘 시험 출제하기
              </Button>
            </div>
          </div>
        </div>
      )}
      {Step2Modal}
      {Step3Modal}
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
    </>
  );
}