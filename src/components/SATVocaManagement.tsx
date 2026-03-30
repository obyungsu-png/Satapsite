import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Plus, Edit3, Trash2, Save, X, Download, Upload, Search, Settings, FolderPlus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { generateSATWordsForDay } from './vocaWordSets';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface VocaWord {
  id: string;
  day: number;
  english: string;
  korean: string;
  definition: string;
  synonym?: string;
  antonym?: string;
  example?: string;
  category?: 'general' | 'yearly';
}

interface DayInfo {
  day: number;
  name: string;
  wordCount: number;
  category?: 'general' | 'yearly';
}

export function SATVocaManagement() {
  const [words, setWords] = useState<VocaWord[]>([]);
  const [days, setDays] = useState<DayInfo[]>([]);
  const [vocaCategory, setVocaCategory] = useState<'general' | 'yearly'>('general');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [categoryTab, setCategoryTab] = useState<'all' | 'general' | 'yearly'>('general');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDayManagement, setShowDayManagement] = useState(false);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [bulkText, setBulkText] = useState('');
  
  // Day management state
  const [editingDayNumber, setEditingDayNumber] = useState<number | null>(null);
  const [editingDayName, setEditingDayName] = useState('');
  const [newDayNumber, setNewDayNumber] = useState<number>(1);
  const [newDayName, setNewDayName] = useState('');
  
  // Add new word form
  const [newWord, setNewWord] = useState<Partial<VocaWord>>({
    day: 1,
    english: '',
    korean: '',
    definition: '',
    synonym: '',
    antonym: '',
    example: ''
  });

  // Editing word form
  const [editingWord, setEditingWord] = useState<Partial<VocaWord>>({});

  // Load words from localStorage or initialize from vocaWordSets
  useEffect(() => {
    const savedWords = localStorage.getItem('satVocaWords');
    const savedDays = localStorage.getItem('satVocaDays');
    
    if (savedWords && savedDays) {
      let parsedWords = JSON.parse(savedWords).map((w: any) => ({ ...w, category: w.category || 'general' }));
      // DAY1에 50개만 남기고 나머지 삭제
      const day1Words = parsedWords.filter(w => w.day === 1);
      if (day1Words.length > 50) {
        const keep = day1Words.slice(0, 50);
        parsedWords = [
          ...keep,
          ...parsedWords.filter(w => w.day !== 1)
        ];
        localStorage.setItem('satVocaWords', JSON.stringify(parsedWords));
      }
      const parsedDays = JSON.parse(savedDays).map((d: any) => ({ ...d, category: d.category || 'general' }));
      setWords(parsedWords);
      setDays(parsedDays);
    } else {
      // Initialize with existing SAT VOCA data (1,500 words)
      const initialWords: VocaWord[] = [];
      const initialDays: DayInfo[] = [];
      
      for (let day = 1; day <= 30; day++) {
        const dayWords = generateSATWordsForDay(day);
        
        dayWords.forEach((word, index) => {
          initialWords.push({
            id: `${day}-${index + 1}`,
            day,
            english: word.english,
            korean: word.korean,
            definition: word.definition,
            synonym: word.synonyms,
            antonym: '',
            example: '',
            category: 'general'
          });
        });
        
        initialDays.push({
          day,
          name: `DAY ${day}`,
          wordCount: dayWords.length,
          category: 'general'
        });
      }
      
      setWords(initialWords);
      setDays(initialDays);
      localStorage.setItem('satVocaWords', JSON.stringify(initialWords));
      localStorage.setItem('satVocaDays', JSON.stringify(initialDays));
    }
  }, []);

  // Update day word counts
  useEffect(() => {
    const updatedDays = days.map(day => ({
      ...day,
      wordCount: words.filter(w => w.day === day.day).length
    }));
    
    if (JSON.stringify(updatedDays) !== JSON.stringify(days)) {
      setDays(updatedDays);
      localStorage.setItem('satVocaDays', JSON.stringify(updatedDays));
    }
  }, [words]);

  // Save words to localStorage
  const saveWords = (updatedWords: VocaWord[]) => {
    setWords(updatedWords);
    localStorage.setItem('satVocaWords', JSON.stringify(updatedWords));
  };

  // Save days to localStorage
  const saveDays = (updatedDays: DayInfo[]) => {
    setDays(updatedDays);
    localStorage.setItem('satVocaDays', JSON.stringify(updatedDays));
  };

  // Bulk upload words
  const handleBulkUpload = () => {
    if (!bulkText.trim() || !newWord.day) {
      toast.error("내용과 DAY를 모두 선택해주세요.");
      return;
    }

    const lines = bulkText.split('\n').filter(line => line.trim() !== '');
    const parsedData: VocaWord[] = lines.map((line, index) => {
      const parts = line.trim().split('\t');
      return {
        id: `${newWord.day}-${Date.now()}-${index}`,
        day: newWord.day as number,
        english: parts[0] || "",
        korean: parts[1] || "",
        definition: parts[2] || "",
        synonym: parts[3] || "",
        antonym: '',
        example: '',
        category: vocaCategory
      };
    });

    if (parsedData.length === 0) {
      toast.error("추가할 단어가 없습니다.");
      return;
    }

    const updatedWords = [...words, ...parsedData];
    saveWords(updatedWords);
    setBulkText('');
    setIsBulkUpload(false);
    toast.success(`${parsedData.length}개의 단어가 추가되었습니다!`);
  };

  // Add new word
  const handleAddWord = () => {
    if (!newWord.english || !newWord.korean || !newWord.day) {
      toast.error('영어 단어, 한글 뜻, DAY는 필수 입력 항목입니다.');
      return;
    }

    const word: VocaWord = {
      id: `${newWord.day}-${Date.now()}`,
      day: newWord.day,
      english: newWord.english,
      korean: newWord.korean,
      definition: newWord.definition || '',
      synonym: newWord.synonym || '',
      antonym: newWord.antonym || '',
      example: newWord.example || '',
      category: vocaCategory
    };

    const updatedWords = [...words, word];
    saveWords(updatedWords);
    
    // Reset form
    setNewWord({
      day: newWord.day,
      english: '',
      korean: '',
      definition: '',
      synonym: '',
      antonym: '',
      example: ''
    });
    
    toast.success('새 단어가 추가되었습니다!');
  };

  // Start editing
  const handleStartEdit = (word: VocaWord) => {
    setEditingId(word.id);
    setEditingWord({ ...word });
  };

  // Save edit
  const handleSaveEdit = () => {
    if (!editingWord.english || !editingWord.korean) {
      toast.error('영어 단어와 한글 뜻은 필수 입력 항목입니다.');
      return;
    }

    const updatedWords = words.map(w => 
      w.id === editingId ? { ...w, ...editingWord } as VocaWord : w
    );
    
    saveWords(updatedWords);
    setEditingId(null);
    setEditingWord({});
    toast.success('단어가 수정되었습니다!');
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingWord({});
  };

  // Delete word
  const handleDeleteWord = (id: string) => {
    if (confirm('정말 이 단어를 삭제하시겠습니까?')) {
      const updatedWords = words.filter(w => w.id !== id);
      saveWords(updatedWords);
      toast.success('단어가 삭제되었습니다.');
    }
  };

  // Add new DAY
  const handleAddDay = () => {
    if (!newDayName.trim()) {
      toast.error('DAY 이름을 입력해주세요.');
      return;
    }

    if (days.some(d => d.day === newDayNumber && d.category === vocaCategory)) {
      toast.error(`DAY ${newDayNumber}은(는) 이미 존재합니다.`);
      return;
    }

    const newDay: DayInfo = {
      day: newDayNumber,
      name: newDayName,
      wordCount: 0,
      category: vocaCategory
    };

    const updatedDays = [...days, newDay].sort((a, b) => a.day - b.day);
    saveDays(updatedDays);
    
    // Find next day number for current category
    const categoryDays = updatedDays.filter(d => d.category === vocaCategory);
    setNewDayNumber(categoryDays.length > 0 ? Math.max(...categoryDays.map(d => d.day)) + 1 : 1);
    setNewDayName('');
    toast.success(`${newDayName}이(가) 추가되었습니다!`);
  };

  // Start editing DAY name
  const handleStartEditDay = (day: number, currentName: string) => {
    setEditingDayNumber(day);
    setEditingDayName(currentName);
  };

  // Save DAY name
  const handleSaveDayName = () => {
    if (!editingDayName.trim()) {
      toast.error('DAY 이름을 입력해주세요.');
      return;
    }

    const updatedDays = days.map(d => 
      d.day === editingDayNumber ? { ...d, name: editingDayName } : d
    );
    
    saveDays(updatedDays);
    setEditingDayNumber(null);
    setEditingDayName('');
    toast.success('DAY 이름이 수정되었습니다!');
  };

  // Delete DAY
  const handleDeleteDay = (dayNumber: number) => {
    const dayInfo = days.find(d => d.day === dayNumber);
    if (dayInfo && dayInfo.wordCount > 0) {
      if (!confirm(`${dayInfo.name}에 ${dayInfo.wordCount}개의 단어가 있습니다. 정말 삭제하시겠습니까?`)) {
        return;
      }
      // Delete all words in this day
      const updatedWords = words.filter(w => w.day !== dayNumber);
      saveWords(updatedWords);
    }

    const updatedDays = days.filter(d => d.day !== dayNumber);
    saveDays(updatedDays);
    
    if (selectedDay === dayNumber) {
      setSelectedDay(null);
    }
    
    toast.success('DAY가 삭제되었습니다.');
  };

  // Export words as CSV
  const handleExport = () => {
    const csvContent = [
      'DAY,영어,한글,영영풀이,동의어,반의어,예문',
      ...words.map(w => 
        `${w.day},"${w.english}","${w.korean}","${w.definition || ''}","${w.synonym || ''}","${w.antonym || ''}","${w.example || ''}"`
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SAT_VOCA_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success('CSV 파일이 다운로드되었습니다!');
  };

  // Import words from CSV
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('파일에 데이터가 없습니다.');
        }

        const importedWords: VocaWord[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = [];
          let current = '';
          let inQuotes = false;
          
          for (let char of lines[i]) {
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          if (values.length >= 3) {
            importedWords.push({
              id: `${values[0]}-${Date.now()}-${i}`,
              day: parseInt(values[0]) || 1,
              english: values[1].replace(/^"|"$/g, ''),
              korean: values[2].replace(/^"|"$/g, ''),
              definition: values[3]?.replace(/^"|"$/g, '') || '',
              synonym: values[4]?.replace(/^"|"$/g, '') || '',
              antonym: values[5]?.replace(/^"|"$/g, '') || '',
              example: values[6]?.replace(/^"|"$/g, '') || ''
            });
          }
        }

        if (importedWords.length === 0) {
          throw new Error('올바른 형식의 단어가 없습니다.');
        }

        saveWords(importedWords);
        toast.success(`${importedWords.length}개의 단어를 불러왔습니다!`);
      } catch (error) {
        toast.error('파일 형식이 올바르지 않습니다.');
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  // Filter days by category
  const filteredDays = days.filter(d => categoryTab === 'all' ? true : d.category === vocaCategory);

  // Filter words
  const filteredWords = words.filter(w => {
    const matchesCategory = categoryTab === 'all' ? true : w.category === vocaCategory;
    const matchesDay = selectedDay === null || w.day === selectedDay;
    const matchesSearch = !searchTerm || 
      w.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.korean.includes(searchTerm);
    return matchesCategory && matchesDay && matchesSearch;
  });

  // Supabase 저장 함수 (단어 전체 동기화)
  const saveWordsToSupabase = async (words: VocaWord[]) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/words`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ words }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.log('⚠️ Supabase 저장 실패:', errorText);
      } else {
        console.log('✅ Supabase에 단어 저장 완료');
      }
    } catch (error) {
      console.log('⚠️ Supabase 저장 실패:', error);
    }
  };

  // Supabase 저장 함수 (DAY 전체 동기화)
  const saveDaysToSupabase = async (days: DayInfo[]) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/days`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.log('⚠️ Supabase DAY 저장 실패:', errorText);
      } else {
        console.log('✅ Supabase에 DAY 저장 완료');
      }
    } catch (error) {
      console.log('⚠️ Supabase DAY 저장 실패:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl mb-1 sm:mb-2">SAT VOCA 단어 관리</h1>
          <p className="text-sm sm:text-base text-gray-600">DAY별로 단어를 추가하고 편집할 수 있습니다. (총 {words.length}개 단어)</p>
          
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => {
                setCategoryTab('all');
                setVocaCategory('general');
                setSelectedDay(null);
              }}
              className={`px-4 py-2 font-bold border-b-2 transition-colors ${categoryTab === 'all' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              전체 단어
            </button>
            <button
              onClick={() => {
                setCategoryTab('general');
                setVocaCategory('general');
                setSelectedDay(null);
              }}
              className={`px-4 py-2 font-bold border-b-2 transition-colors ${categoryTab === 'general' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              SAT 어휘 출제
            </button>
            <button
              onClick={() => {
                setCategoryTab('yearly');
                setVocaCategory('yearly');
                setSelectedDay(null);
                setNewDayNumber(1);
              }}
              className={`px-4 py-2 font-bold border-b-2 transition-colors ${categoryTab === 'yearly' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              연도별 단어
            </button>
          </div>
        </div>
      </div>

      {/* Tools */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 sm:justify-between">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                placeholder="단어 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg w-full sm:w-64"
              />
            </div>

            {/* Day Filter */}
            <select
              value={selectedDay || ''}
              onChange={(e) => setSelectedDay(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white w-full sm:w-auto"
            >
              <option value="">전체 DAY</option>
              {filteredDays.map(day => (
                <option key={day.day} value={day.day}>
                  {day.name} ({day.wordCount}개)
                </option>
              ))}
            </select>

            {/* DAY Management Button */}
            <Button
              onClick={() => setShowDayManagement(!showDayManagement)}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto ${
                showDayManagement 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              DAY 관리
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button
              onClick={handleExport}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              CSV 내보내기
            </Button>
            
            <label className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
              CSV 가져오기
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* DAY Management Panel */}
      {showDayManagement && (
        <div className="bg-purple-50 border-b border-purple-200 px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg border border-purple-300 p-6">
              <h2 className="text-lg mb-4 flex items-center gap-2 text-purple-800">
                <Settings className="w-5 h-5" />
                DAY 관리
              </h2>

              {/* Add New DAY */}
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="text-sm mb-3">새 {vocaCategory === 'general' ? 'DAY' : '연도/제목'} 추가</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={newDayNumber}
                    onChange={(e) => setNewDayNumber(parseInt(e.target.value) || 1)}
                    className="w-24 p-2 border border-gray-300 rounded"
                    placeholder="번호 (예: 1)"
                    min="1"
                  />
                  <input
                    type="text"
                    value={newDayName}
                    onChange={(e) => setNewDayName(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded"
                    placeholder={vocaCategory === 'general' ? "DAY 이름 (예: DAY 31)" : "연도/제목 (예: 2024 March)"}
                  />
                  <Button
                    onClick={handleAddDay}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
                  >
                    <FolderPlus className="w-4 h-4 inline mr-2" />
                    추가
                  </Button>
                </div>
              </div>

              {/* DAY List */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredDays.map((day) => (
                  <div
                    key={day.day}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    {editingDayNumber === day.day ? (
                      <div className="flex items-center gap-3 flex-1">
                        <span className="w-16 text-sm text-gray-600">DAY {day.day}</span>
                        <input
                          type="text"
                          value={editingDayName}
                          onChange={(e) => setEditingDayName(e.target.value)}
                          className="flex-1 p-2 border border-purple-300 rounded"
                          autoFocus
                        />
                        <Button
                          onClick={handleSaveDayName}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingDayNumber(null);
                            setEditingDayName('');
                          }}
                          className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded text-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="w-16 text-sm text-gray-600">DAY {day.day}</span>
                          <span className="font-medium">{day.name}</span>
                          <span className="text-sm text-gray-500">({day.wordCount}개)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEditDay(day.day, day.name)}
                            className="p-2 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteDay(day.day)}
                            className="p-2 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col gap-6">
          {/* Add New Word Form */}
          <div className="w-full">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8">
              <h2 className="text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                {vocaCategory === 'general' ? '새 단어 추가' : '연도별 단어 추가'}
              </h2>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setIsBulkUpload(false)}
                  className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${!isBulkUpload ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold' : 'bg-white border-gray-200 text-gray-500'}`}
                >
                  직접 입력
                </button>
                <button
                  onClick={() => setIsBulkUpload(true)}
                  className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${isBulkUpload ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold' : 'bg-white border-gray-200 text-gray-500'}`}
                >
                  대량 업로드
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm mb-1 sm:mb-2">DAY *</label>
                  <select
                    value={newWord.day || 1}
                    onChange={(e) => setNewWord({ ...newWord, day: parseInt(e.target.value) })}
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-lg"
                  >
                    {filteredDays.map(day => (
                      <option key={day.day} value={day.day}>{day.name}</option>
                    ))}
                  </select>
                </div>

                {isBulkUpload ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm mb-1 sm:mb-2">단어 데이터 입력 (단어 뜻 영영 동의어)</label>
                      <textarea
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        className="w-full p-2 text-xs sm:text-sm border border-gray-300 rounded-lg font-mono min-h-[220px] sm:min-h-[300px] resize-vertical"
                        rows={14}
                        placeholder={
                          `예시)\nsimultaneous\t동시의\thappening at the same time; synchronous\tconcurrent, synchronous\nabandon\t포기하다\tgive up something; forsake\tstop, throw out`
                        }
                      />
                      <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                        * 줄바꿈으로 여러 단어를 입력할 수 있습니다. <br/>
                        * 단어, 뜻, 영영, 동의어 순서로 <b>탭(→)</b>으로 구분해 주세요.<br/>
                        * 예시: simultaneous[탭]동시의[탭]happening at the same time; synchronous[탭]concurrent, synchronous
                      </p>
                    </div>
                    <Button
                      onClick={handleBulkUpload}
                      className="w-full py-2 text-sm sm:text-base bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                    >
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                      대량 추가하기
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm mb-1 sm:mb-2">영어 단어 *</label>
                      <input
                        type="text"
                        value={newWord.english || ''}
                        onChange={(e) => setNewWord({ ...newWord, english: e.target.value })}
                        className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-lg"
                        placeholder="e.g., abandon"
                      />
                    </div>

                <div>
                  <label className="block text-xs sm:text-sm mb-1 sm:mb-2">한글 뜻 *</label>
                  <input
                    type="text"
                    value={newWord.korean || ''}
                    onChange={(e) => setNewWord({ ...newWord, korean: e.target.value })}
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-lg"
                    placeholder="e.g., 버리다, 포기하다"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm mb-1 sm:mb-2">영영풀이</label>
                  <textarea
                    value={newWord.definition || ''}
                    onChange={(e) => setNewWord({ ...newWord, definition: e.target.value })}
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="e.g., to leave someone or something"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm mb-1 sm:mb-2">동의어</label>
                  <input
                    type="text"
                    value={newWord.synonym || ''}
                    onChange={(e) => setNewWord({ ...newWord, synonym: e.target.value })}
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-lg"
                    placeholder="e.g., desert, forsake"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm mb-1 sm:mb-2">반의어</label>
                  <input
                    type="text"
                    value={newWord.antonym || ''}
                    onChange={(e) => setNewWord({ ...newWord, antonym: e.target.value })}
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-lg"
                    placeholder="e.g., keep, maintain"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm mb-1 sm:mb-2">예문</label>
                  <textarea
                    value={newWord.example || ''}
                    onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="e.g., He abandoned his car in the parking lot."
                  />
                </div>

                <Button
                  onClick={handleAddWord}
                  className="w-full py-2 text-sm sm:text-base bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                  추가하기
                </Button>
              </>
            )}
          </div>
            </div>
          </div>

          {/* Word List */}
          <div className="w-full">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-base sm:text-lg">
                  단어 목록 
                  <span className="text-gray-500 ml-2 text-sm sm:text-base">
                    ({filteredWords.length}개)
                  </span>
                </h2>
              </div>

              <div className="divide-y divide-gray-200 max-h-[600px] sm:max-h-[800px] overflow-y-auto">
                {filteredWords.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center text-gray-500">
                    <p className="text-sm sm:text-base">단어가 없습니다.</p>
                    <p className="text-xs sm:text-sm mt-2">좌측에서 새 단어를 추가해주세요.</p>
                  </div>
                ) : (
                  filteredWords.map((word) => (
                    <div key={word.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      {editingId === word.id ? (
                        /* Edit Mode */
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-600 mb-1">영어 *</label>
                              <input
                                type="text"
                                value={editingWord.english || ''}
                                onChange={(e) => setEditingWord({ ...editingWord, english: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-gray-600 mb-1">한글 *</label>
                              <input
                                type="text"
                                value={editingWord.korean || ''}
                                onChange={(e) => setEditingWord({ ...editingWord, korean: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 mb-1">영영풀이</label>
                            <textarea
                              value={editingWord.definition || ''}
                              onChange={(e) => setEditingWord({ ...editingWord, definition: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded"
                              rows={2}
                            />
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-600 mb-1">동의어</label>
                              <input
                                type="text"
                                value={editingWord.synonym || ''}
                                onChange={(e) => setEditingWord({ ...editingWord, synonym: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-gray-600 mb-1">반의어</label>
                              <input
                                type="text"
                                value={editingWord.antonym || ''}
                                onChange={(e) => setEditingWord({ ...editingWord, antonym: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 mb-1">예문</label>
                            <textarea
                              value={editingWord.example || ''}
                              onChange={(e) => setEditingWord({ ...editingWord, example: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded"
                              rows={2}
                            />
                          </div>

                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              onClick={handleSaveEdit}
                              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded"
                            >
                              <Save className="w-3.5 h-3.5 inline mr-1" />
                              저장
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              className="px-4 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded"
                            >
                              <X className="w-3.5 h-3.5 inline mr-1" />
                              취소
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded">
                                {days.find(d => d.day === word.day)?.name || `DAY ${word.day}`}
                              </span>
                              <h3 className="text-lg">
                                {word.english}
                              </h3>
                              <span className="text-gray-600">
                                {word.korean}
                              </span>
                            </div>
                            
                            {word.definition && (
                              <p className="text-sm text-gray-600 mb-2 italic">
                                정의: {word.definition}
                              </p>
                            )}
                            
                            {(word.synonym || word.antonym) && (
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                {word.synonym && (
                                  <span>동의어: {word.synonym}</span>
                                )}
                                {word.antonym && (
                                  <span>반의어: {word.antonym}</span>
                                )}
                              </div>
                            )}
                            
                            {word.example && (
                              <p className="text-sm text-gray-500 italic">
                                예: {word.example}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleStartEdit(word)}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Edit3 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteWord(word.id)}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Supabase 저장 함수 (단어 전체 동기화)
const saveWordsToSupabase = async (words: VocaWord[]) => {
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/words`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ words }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.log('⚠️ Supabase 저장 실패:', errorText);
    } else {
      console.log('✅ Supabase에 단어 저장 완료');
    }
  } catch (error) {
    console.log('⚠️ Supabase 저장 실패:', error);
  }
};

// Supabase 저장 함수 (DAY 전체 동기화)
const saveDaysToSupabase = async (days: DayInfo[]) => {
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/days`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ days }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.log('⚠️ Supabase DAY 저장 실패:', errorText);
    } else {
      console.log('✅ Supabase에 DAY 저장 완료');
    }
  } catch (error) {
    console.log('⚠️ Supabase DAY 저장 실패:', error);
  }
};
