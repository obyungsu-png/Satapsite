import { useState } from 'react';
import { Button } from './ui/button';
import { Upload, Check, AlertCircle, FileText, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

interface BulkUploadProps {
  onUploadSuccess: (files: any[]) => void;
  uploadLocation?: string;
  uploadSubcategory?: string;
}

export function BulkUpload({ onUploadSuccess, uploadLocation: propUploadLocation, uploadSubcategory: propUploadSubcategory }: BulkUploadProps) {
  const [cardTitle, setCardTitle] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // 입력 방식: 텍스트 직접 입력 vs CSV 파일 업로드
  const [inputMode, setInputMode] = useState<'text' | 'csv'>('text');
  const [csvFileName, setCsvFileName] = useState('');
  const [csvQuestions, setCsvQuestions] = useState<any[]>([]);
  const [csvError, setCsvError] = useState('');
  
  // Add category selection state
  const [uploadLocation, setUploadLocation] = useState(propUploadLocation || '스마트 연습');
  const [uploadSubcategory, setUploadSubcategory] = useState(propUploadSubcategory || '');

  // 과목 구분 (스마트 연습 전용): 리딩·문법은 한 세트(모듈1+2 통합), 수학은 모듈별 별도 시험
  const [subjectType, setSubjectType] = useState<'reading' | 'math'>('reading');
  const [moduleInfo, setModuleInfo] = useState<'module1' | 'module2'>('module1');

  // 과목별 최대 문제 수 (리딩: 모듈1+2 = 27+27, 수학: 모듈당 22)
  const maxQuestions = subjectType === 'math' ? 22 : 54;

  // Category options
  const categoryOptions: Record<string, Array<{value: string, label: string}>> = {
    '스마트 연습': [
      { value: 'past-exams', label: '기출문제' },
      { value: 'official-samples', label: '공식문제' },
    ],
    '전문 훈련': [
      { value: 'reading', label: '독해 (Reading)' },
      { value: 'grammar', label: '문법 (Grammar)' },
      { value: 'math', label: '수학 (Math)' },
    ],
  };

  // Subcategory options for Training
  const trainingSubcategories: Record<string, Array<{value: string, label: string}>> = {
    'reading': [
      { value: 'central-ideas', label: 'Central Ideas and Details' },
      { value: 'command-evidence', label: 'Command of Evidence' },
      { value: 'inferences', label: 'Inferences' },
      { value: 'craft-structure', label: 'Craft and Structure' },
    ],
    'grammar': [
      { value: 'boundaries', label: 'Boundaries' },
      { value: 'form-structure', label: 'Form, Structure, and Sense' },
      { value: 'transitions', label: 'Transitions' },
      { value: 'rhetorical-synthesis', label: 'Rhetorical Synthesis' },
    ],
    'math': [
      { value: 'algebra', label: 'Algebra' },
      { value: 'advanced-math', label: 'Advanced Math' },
      { value: 'problem-solving', label: 'Problem-Solving and Data Analysis' },
      { value: 'geometry', label: 'Geometry and Trigonometry' },
    ],
  };

  // Simple template for copy
  const getTemplate = () => {
    return `PASSAGE: 도시 집적 경제는 도시 지역에 산업과 인구가 집중될 때 발생하는 경제적 이익을 말한다.
QUESTION: 이 지문의 주요 주제는 무엇인가?
A: 도시의 인구 증가
B: 도시 집적 경제의 정의
C: 산업의 발전
D: 경제적 손실
ANSWER: B

PASSAGE: 다른 지문...
QUESTION: 두 번째 질문
A: 선택지 A
B: 선택지 B
C: 선택지 C
D: 선택지 D
ANSWER: A

_____

PASSAGE: Module 2 첫 번째 지문...
QUESTION: Module 2 첫 번째 질문
A: 선택지 A
B: 선택지 B
C: 선택지 C
D: 선택지 D
ANSWER: C

PASSAGE: Module 2 두 번째 지문...
QUESTION: Module 2 두 번째 질문
A: 선택지 A
B: 선택지 B
C: 선택지 C
D: 선택지 D
ANSWER: B`;
  };

  const downloadTemplate = () => {
    const template = getTemplate();
    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SAT_대량업로드_템플릿.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('템플릿이 다운로드되었습니다!');
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(getTemplate());
    toast.success('템플릿이 클립보드에 복사되었습니다!');
  };

  // ── CSV 업로드 지원 ──
  // CSV 템플릿 (기출문제/공식문제 대량 업로드용)
  // passage/question/choices에 쉼표·줄바꿈이 포함될 수 있으므로 항상 큰따옴표로 감싼다.
  // module 열: 리딩 한 세트 업로드 시 모듈 구분 표기용(1 또는 2). 비워두면 문제 순서로 자동 구분(앞 27문제=모듈1).
  // vocabulary/analysis 열: 단어·분석 메모. AI 튜터/복습 화면에서 활용된다.
  const getCsvTemplate = () => {
    return [
      'passage,question,choiceA,choiceB,choiceC,choiceD,answer,explanation,vocabulary,analysis,imageUrl,module',
      '"도시 집적 경제는 도시 지역에 산업과 인구가 집중될 때 발생하는 경제적 이익을 말한다.","이 지문의 주요 주제는 무엇인가?","도시의 인구 증가","도시 집적 경제의 정의","산업의 발전","경제적 손실","B","도시 집적 경제의 정의를 묻는 문제입니다.","agglomeration:집적; economy:경제","주제문은 첫 문장에 있다","",""',
      '"Two-line passage can be written like this.","Which choice best states the main idea?","Choice A","Choice B","Choice C","Choice D","A","","","","","1"',
      '"","지문 없이 질문만 있는 문제도 가능합니다.","선택지 1","선택지 2","선택지 3","선택지 4","C","","","","https://example.com/image.png","2"',
    ].join('\n');
  };

  const downloadCsvTemplate = () => {
    // Excel에서 한글 깨짐 방지용 BOM 추가
    const blob = new Blob(['\uFEFF' + getCsvTemplate()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SAT_기출공식_대량업로드_템플릿.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV 템플릿이 다운로드되었습니다!');
  };

  // 큰따옴표("...") 안의 쉼표/줄바꿈/이스케이프("")를 처리하는 CSV 파서
  const parseCSVText = (text: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;
    // BOM 제거
    const src = text.replace(/^\uFEFF/, '');
    for (let i = 0; i < src.length; i++) {
      const c = src[i];
      if (inQuotes) {
        if (c === '"') {
          if (src[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else {
          field += c;
        }
      } else {
        if (c === '"') {
          inQuotes = true;
        } else if (c === ',') {
          row.push(field); field = '';
        } else if (c === '\n' || c === '\r') {
          if (c === '\r' && src[i + 1] === '\n') i++;
          row.push(field); field = '';
          if (row.length > 1 || row[0].trim() !== '') rows.push(row);
          row = [];
        } else {
          field += c;
        }
      }
    }
    if (field !== '' || row.length > 0) {
      row.push(field);
      if (row.length > 1 || row[0].trim() !== '') rows.push(row);
    }
    return rows;
  };

  // CSV rows → 문제 배열 변환 (헤더 이름 기준 매핑)
  const convertCsvToQuestions = (rows: string[][]) => {
    if (rows.length < 2) {
      throw new Error('CSV에 문제 데이터가 없습니다. 헤더 다음에 문제 행을 추가해주세요.');
    }
    const header = rows[0].map(h => h.trim().toLowerCase());
    const col = (name: string) => header.indexOf(name);
    const idx = {
      passage: col('passage'),
      question: col('question'),
      choiceA: col('choicea'),
      choiceB: col('choiceb'),
      choiceC: col('choicec'),
      choiceD: col('choiced'),
      answer: col('answer'),
      explanation: col('explanation'),
      vocabulary: col('vocabulary'),
      analysis: col('analysis'),
      imageUrl: col('imageurl'),
      module: col('module'),
    };
    if (idx.question === -1 || idx.choiceA === -1 || idx.choiceB === -1 ||
        idx.choiceC === -1 || idx.choiceD === -1 || idx.answer === -1) {
      throw new Error('CSV 헤더가 올바르지 않습니다. question, choiceA, choiceB, choiceC, choiceD, answer 열이 필요합니다.');
    }

    const get = (row: string[], i: number) => (i >= 0 && i < row.length ? row[i].trim() : '');
    const questions: any[] = [];
    rows.slice(1).forEach((row, n) => {
      const line = n + 2; // 헤더 포함 실제 행 번호
      const question = get(row, idx.question);
      const answer = get(row, idx.answer).toLowerCase();
      if (!question && !get(row, idx.passage)) return; // 완전 빈 행 스킵
      if (!question) throw new Error(`${line}행: question이 비어 있습니다.`);
      if (!['a', 'b', 'c', 'd'].includes(answer)) {
        throw new Error(`${line}행: answer는 A, B, C, D 중 하나여야 합니다. (현재: "${get(row, idx.answer)}")`);
      }
      const moduleRaw = get(row, idx.module);
      questions.push({
        title: `문제 ${questions.length + 1}`,
        passage: get(row, idx.passage),
        question,
        choices: [get(row, idx.choiceA), get(row, idx.choiceB), get(row, idx.choiceC), get(row, idx.choiceD)],
        correctAnswer: answer,
        explanation: get(row, idx.explanation),
        vocabulary: get(row, idx.vocabulary),
        analysis: get(row, idx.analysis),
        imageUrl: get(row, idx.imageUrl),
        module: moduleRaw === '1' || moduleRaw === '2' ? Number(moduleRaw) : null,
      });
    });

    if (questions.length === 0) throw new Error('유효한 문제가 없습니다.');
    if (questions.length > maxQuestions) {
      throw new Error(
        subjectType === 'math'
          ? `총 ${questions.length}개 문제가 있습니다. 수학 모듈별 시험은 최대 22문제까지 가능합니다.`
          : `총 ${questions.length}개 문제가 있습니다. 최대 54문제(모듈1: 27 + 모듈2: 27)까지 가능합니다.`
      );
    }
    return questions;
  };

  const handleCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError('');
    setCsvQuestions([]);
    setCsvFileName(file.name);
    try {
      const text = await file.text();
      const rows = parseCSVText(text);
      const questions = convertCsvToQuestions(rows);
      setCsvQuestions(questions);
      toast.success(`CSV 파싱 완료: ${questions.length}개 문제 인식`);
    } catch (err: any) {
      console.error('CSV parse error:', err);
      setCsvError(err.message || 'CSV 파싱에 실패했습니다.');
      setCsvFileName('');
    }
    // 같은 파일 재선택 가능하도록 초기화
    e.target.value = '';
  };

  const parseTextUpload = (text: string) => {
    try {
      // Check if there's a module separator
      const hasSeparator = text.includes('_____');
      let module1Text = text;
      let module2Text = '';
      
      if (hasSeparator) {
        const parts = text.split('_____');
        module1Text = parts[0];
        module2Text = parts.slice(1).join('_____'); // In case there are multiple separators
      }

      const parseModule = (moduleText: string) => {
        const lines = moduleText.split('\n').map(line => line.trim());
        const questions = [];
        let currentQuestion: any = {};

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Skip empty lines
          if (!line) {
            // Empty line indicates end of current question
            if (Object.keys(currentQuestion).length > 0) {
              questions.push({ ...currentQuestion });
              currentQuestion = {};
            }
            continue;
          }

          if (line.startsWith('PASSAGE:')) {
            currentQuestion.passage = line.substring(8).trim();
          } else if (line.startsWith('QUESTION:')) {
            currentQuestion.question = line.substring(9).trim();
          } else if (line.startsWith('A:')) {
            currentQuestion.choiceA = line.substring(2).trim();
          } else if (line.startsWith('B:')) {
            currentQuestion.choiceB = line.substring(2).trim();
          } else if (line.startsWith('C:')) {
            currentQuestion.choiceC = line.substring(2).trim();
          } else if (line.startsWith('D:')) {
            currentQuestion.choiceD = line.substring(2).trim();
          } else if (line.startsWith('ANSWER:')) {
            currentQuestion.answer = line.substring(7).trim().toLowerCase();
          }
        }

        // Add last question if exists
        if (Object.keys(currentQuestion).length > 0) {
          questions.push(currentQuestion);
        }

        return questions;
      };

      const module1Questions = parseModule(module1Text);
      const module2Questions = module2Text ? parseModule(module2Text) : [];
      const allQuestions = [...module1Questions, ...module2Questions];

      if (allQuestions.length === 0) {
        throw new Error('문제를 찾을 수 없습니다. 형식을 확인해주세요.');
      }

      if (allQuestions.length > maxQuestions) {
        throw new Error(
          subjectType === 'math'
            ? `총 ${allQuestions.length}개 문제가 있습니다. 수학 모듈별 시험은 최대 22문제까지 가능합니다.`
            : `총 ${allQuestions.length}개 문제가 있습니다. 최대 54문제까지 가능합니다.`
        );
      }

      // Convert to proper format with auto-incrementing numbers
      const formattedQuestions = allQuestions.map((q: any, idx: number) => ({
        title: `문제 ${idx + 1}`,
        passage: q.passage || '',
        question: q.question || '',
        choices: [q.choiceA || '', q.choiceB || '', q.choiceC || '', q.choiceD || ''],
        correctAnswer: q.answer || 'a'
      }));

      return formattedQuestions;
    } catch (error: any) {
      console.error('Parse error:', error);
      throw error;
    }
  };

  const handleBulkUpload = async () => {
    if (!cardTitle.trim()) {
      toast.error('카드 제목을 입력해주세요.');
      return;
    }

    if (inputMode === 'text' && !textInput.trim()) {
      toast.error('문제 데이터를 입력해주세요.');
      return;
    }

    if (inputMode === 'csv' && csvQuestions.length === 0) {
      toast.error('CSV 파일을 선택해주세요.');
      return;
    }

    if (!uploadLocation || !uploadSubcategory) {
      toast.error('업로드 위치와 카테고리를 선택해주세요.');
      return;
    }

    setIsUploading(true);

    try {
      const parsedData = inputMode === 'csv' ? csvQuestions : parseTextUpload(textInput);
      const newFiles = [];
      const isSmartPractice = uploadLocation === '스마트 연습';

      // 수학 모듈별 시험은 카드 제목에 모듈 표기를 자동 추가 (예: "2025년 6월 수학 [모듈1]")
      const finalTitle =
        isSmartPractice && subjectType === 'math'
          ? `${cardTitle.trim()} [${moduleInfo === 'module1' ? '모듈1' : '모듈2'}]`
          : cardTitle.trim();

      // Create single card with all questions
      const combinedFile = {
        id: `bulk_${Date.now()}`,
        name: finalTitle,
        type: 'bulk-upload',
        location: uploadLocation,
        subcategory: uploadSubcategory,
        subjectType: isSmartPractice ? subjectType : undefined, // 실전 시험 과목 구분 (Reading/Math 판별용)
        moduleInfo: isSmartPractice && subjectType === 'math' ? moduleInfo : null, // 수학: 모듈별 별도 시험
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'completed' as const,
        questionCount: parsedData.length,
        data: parsedData
      };
      newFiles.push(combinedFile);

      // Call parent callback
      onUploadSuccess(newFiles);

      toast.success(`✅ 업로드 완료! 총 ${parsedData.length}문제`);

      // Reset form
      setCardTitle('');
      setTextInput('');
      setCsvFileName('');
      setCsvQuestions([]);
      setCsvError('');
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      toast.error(`업로드 실패: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">📝 초간단 대량 업로드</h2>
            <p className="text-sm text-gray-600 mb-3">
              텍스트 형식으로 한 번에 업로드! 문제 구분은 빈 줄 1칸만 띄우면 끝!
            </p>
            <div className="bg-white rounded-lg p-4 text-xs text-gray-600 space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span><strong>1개 카드에 통합</strong> (최대 54문제)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span><strong>간편 양식:</strong> PASSAGE, QUESTION, A~D, ANSWER만 입력</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span><strong>Training 분류는 \"편집\" 탭에서</strong> 각 문제별로 설정하세요</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Download/Copy */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <FileText className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-yellow-900 mb-1">✨ 업로드 양식 다운로드</h3>
            <p className="text-xs text-yellow-800 mb-2">
              텍스트 양식을 복사/다운로드하거나, Excel에서 편집 가능한 CSV 템플릿을 다운로드하세요.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={copyTemplate}
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            텍스트 템플릿 복사
          </Button>
          <Button
            onClick={downloadTemplate}
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            텍스트 템플릿 다운로드
          </Button>
          <Button
            onClick={downloadCsvTemplate}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            CSV 템플릿 다운로드
          </Button>
        </div>
      </div>

      {/* Card Title Input */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <span className="text-2xl">📁</span> 카드 제목 (목록에 표시될 이름) *
        </label>
        <input
          type="text"
          value={cardTitle}
          onChange={(e) => setCardTitle(e.target.value)}
          placeholder="예: 2024년 3월 SAT 기출문제"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="mt-2 text-xs text-gray-500">
          💡 모든 문제가 1개의 카드로 저장됩니다.
        </p>
      </div>

      {/* Category Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">📂 업로드 위치 선택</h3>
        
        {/* Main Category */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">메인 카테고리</label>
          <select
            value={uploadLocation}
            onChange={(e) => {
              setUploadLocation(e.target.value);
              setUploadSubcategory('');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">선택하세요</option>
            {Object.keys(categoryOptions).map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Sub Category */}
        {uploadLocation && (
          <div>
            <label className="block text-sm text-gray-600 mb-2">세부 카테고리</label>
            <select
              value={uploadSubcategory}
              onChange={(e) => setUploadSubcategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">선택하세요</option>
              {categoryOptions[uploadLocation]?.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 과목 구분 (스마트 연습 전용): 리딩·문법 / 수학 */}
        {uploadLocation === '스마트 연습' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="block text-sm text-gray-600 mb-2">과목 구분 *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSubjectType('reading')}
                className={`px-4 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                  subjectType === 'reading'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                📖 리딩·문법
                <span className="block text-xs font-normal mt-1 text-gray-400">한 세트 = 모듈1 + 모듈2 (최대 54문제)</span>
              </button>
              <button
                type="button"
                onClick={() => setSubjectType('math')}
                className={`px-4 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                  subjectType === 'math'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                🧮 수학
                <span className="block text-xs font-normal mt-1 text-gray-400">모듈별 별도 시험 (모듈당 최대 22문제)</span>
              </button>
            </div>

            {/* 모듈 구분 (수학 전용) */}
            {subjectType === 'math' && (
              <div className="mt-3">
                <label className="block text-sm text-gray-600 mb-2">모듈 선택 (수학) *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModuleInfo('module1')}
                    className={`px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                      moduleInfo === 'module1'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    모듈 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setModuleInfo('module2')}
                    className={`px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                      moduleInfo === 'module2'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    모듈 2
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  💡 수학은 모듈1·모듈2를 각각 따로 업로드하면 별도의 시험 카드로 생성됩니다.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Text/CSV Input Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <FileText className="w-4 h-4 text-purple-600" /> 문제 데이터 입력 *
        </label>

        {/* 입력 방식 토글 */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4 w-fit">
          <button
            type="button"
            onClick={() => setInputMode('text')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'text'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            텍스트 직접 입력
          </button>
          <button
            type="button"
            onClick={() => setInputMode('csv')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'csv'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            CSV 파일 업로드
          </button>
        </div>

        {inputMode === 'csv' ? (
          <div>
            <div className="mb-3 p-3 bg-green-50 rounded-lg text-xs text-green-800 space-y-1">
              <p className="font-semibold">📋 CSV 형식 안내:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>필수 열: <code className="bg-white px-1 rounded">question, choiceA, choiceB, choiceC, choiceD, answer</code> (answer는 A~D)</li>
                <li>선택 열: <code className="bg-white px-1 rounded">passage, explanation, vocabulary, analysis, imageUrl, module</code></li>
                <li><code className="bg-white px-1 rounded">module</code> 열은 1 또는 2 (비워두면 문제 순서로 자동 구분)</li>
                <li>쉼표·줄바꿈이 포함된 내용은 반드시 큰따옴표("...")로 감싸주세요</li>
                <li>위의 <strong>CSV 템플릿 다운로드</strong> 버튼으로 예시 파일을 받아 Excel에서 편집하면 가장 쉽습니다</li>
              </ul>
            </div>

            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-green-300 rounded-lg cursor-pointer bg-green-50/50 hover:bg-green-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-sm text-gray-700 font-medium">
                  {csvFileName ? csvFileName : 'CSV 파일을 선택하세요'}
                </p>
                <p className="text-xs text-gray-500 mt-1">.csv 파일 (최대 {maxQuestions}문제{subjectType === 'math' ? ' · 수학 모듈별' : ''})</p>
              </div>
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvFile} />
            </label>

            {csvError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{csvError}</span>
              </div>
            )}

            {csvQuestions.length > 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-800 flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4" />
                  {csvQuestions.length}개 문제 인식 완료 — 아래에서 확인 후 업로드하세요
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {csvQuestions.slice(0, 5).map((q, i) => (
                    <div key={i} className="text-xs text-gray-700 bg-white rounded px-3 py-2 border border-green-100">
                      <span className="font-semibold text-green-700">{q.title}.</span>{' '}
                      {q.question.length > 60 ? q.question.substring(0, 60) + '…' : q.question}
                      <span className="ml-2 text-gray-400">정답: {q.correctAnswer.toUpperCase()}</span>
                    </div>
                  ))}
                  {csvQuestions.length > 5 && (
                    <p className="text-xs text-gray-500 text-center py-1">
                      … 외 {csvQuestions.length - 5}개 문제
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-700 mb-2">📋 양식 예시:</p>
              <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed">
{`PASSAGE: 지문 내용
QUESTION: 질문
A: 선택지 A
B: 선택지 B
C: 선택지 C
D: 선택지 D
ANSWER: B

PASSAGE: 다음 지문...
QUESTION: 다음 질문
A: 선택지 A
B: 선택지 B
C: 선택지 C
D: 선택지 D
ANSWER: A`}
              </pre>
            </div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="위 양식대로 문제를 입력하세요..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[500px] resize-y"
            />
            <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-800 space-y-1">
              <p className="font-semibold">ℹ️ 입력 팁:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>각 필드는 대문자로 시작: PASSAGE:, QUESTION:, A:, B:, C:, D:, ANSWER:</li>
                <li>문제 구분은 빈 줄 1칸 띄우기</li>
                <li><strong>Module 구분:</strong> _____ (밑줄 5개)로 Module 1과 Module 2 구분 가능</li>
                <li>문제 번호는 자동 생성됨 (===문제=== 불필요)</li>
                <li>최대 54문제까지 업로드 가능 (리딩 27+27, 수학 22+22)</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={() => {
            setCardTitle('');
            setTextInput('');
            setCsvFileName('');
            setCsvQuestions([]);
            setCsvError('');
          }}
          className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
          disabled={isUploading}
        >
          초기화
        </Button>
        <Button
          onClick={handleBulkUpload}
          disabled={
            isUploading ||
            !cardTitle.trim() ||
            (inputMode === 'text' ? !textInput.trim() : csvQuestions.length === 0)
          }
          className="px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              업로드 중...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              업로드하기
            </>
          )}
        </Button>
      </div>
    </div>
  );
}