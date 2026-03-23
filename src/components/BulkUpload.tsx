import { useState } from 'react';
import { Button } from './ui/button';
import { Upload, Check, AlertCircle, FileText, Copy, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BulkUploadProps {
  onUploadSuccess: (files: any[]) => void;
  uploadLocation?: string;
  uploadSubcategory?: string;
}

export function BulkUpload({ onUploadSuccess, uploadLocation: propUploadLocation, uploadSubcategory: propUploadSubcategory }: BulkUploadProps) {
  const [cardTitle, setCardTitle] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Add category selection state
  const [uploadLocation, setUploadLocation] = useState(propUploadLocation || '스마트 연습');
  const [uploadSubcategory, setUploadSubcategory] = useState(propUploadSubcategory || '');

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

      if (allQuestions.length > 54) {
        throw new Error(`총 ${allQuestions.length}개 문제가 있습니다. 최대 54문제까지만 가능합니다.`);
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

    if (!textInput.trim()) {
      toast.error('문제 데이터를 입력해주세요.');
      return;
    }

    if (!uploadLocation || !uploadSubcategory) {
      toast.error('업로드 위치와 카테고리를 선택해주세요.');
      return;
    }

    setIsUploading(true);

    try {
      const parsedData = parseTextUpload(textInput);
      const newFiles = [];

      // Create single card with all questions
      const combinedFile = {
        id: `bulk_${Date.now()}`,
        name: cardTitle.trim(),
        type: 'bulk-upload',
        location: uploadLocation,
        subcategory: uploadSubcategory,
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
            <h3 className="text-sm font-bold text-yellow-900 mb-1">✨ 초간단 업로드 양식</h3>
            <p className="text-xs text-yellow-800 mb-2">
              아래 템플릿을 복사/다운로드하여 사용하세요. 문제 구분은 빈 줄 1칸, 필수 필드만 입력!
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={copyTemplate}
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            템플릿 복사
          </Button>
          <Button
            onClick={downloadTemplate}
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            템플릿 다운로드
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
      </div>

      {/* Text Input Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <FileText className="w-4 h-4 text-purple-600" /> 문제 데이터 입력 *
        </label>
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

      {/* Upload Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={() => {
            setCardTitle('');
            setTextInput('');
          }}
          className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
          disabled={isUploading}
        >
          초기화
        </Button>
        <Button
          onClick={handleBulkUpload}
          disabled={isUploading || !cardTitle.trim() || !textInput.trim()}
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