import React, { useState } from 'react';
import { Button } from './ui/button';
import { Upload, FileText, BookOpen, Target, BarChart3, Settings, FileDown, PlusCircle, Edit3, Tags, Trash2, BookmarkPlus, Megaphone, FileUp } from 'lucide-react';
import { AdBanner } from './AdBanner';
import { toast } from 'sonner@2.0.3';
import { SATVocaManagement } from './SATVocaManagement';
import { SubscriptionManager } from './SubscriptionManager';
import { AdManagement } from './AdManagement';

// LocalStorage 기반 데이터 관리
const STORAGE_KEY = 'sat_practice_tests';

const loadTestsFromStorage = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  // Return default tests if nothing in storage
  return [
    { id: 1, title: "2025년 6월 제1회 독해문법", type: "Reading", status: "available", category: "past-exams" },
    { id: 2, title: "2025년 6월 제2회 독해문법", type: "Reading", status: "available", category: "past-exams" },
    { id: 3, title: "2025년 6월 제2회 수학", type: "Math", status: "available", category: "past-exams" },
    { id: 4, title: "2025년 6월 제3회 독해문법", type: "Reading", status: "available", category: "past-exams" },
    { id: 5, title: "2025년 6월 제3회 수학", type: "Math", status: "available", category: "past-exams" },
    { id: 6, title: "2025년 6월 제4회 독해문법", type: "Reading", status: "available", category: "past-exams" },
    { id: 7, title: "2025년 8월 제1회 독해문법", type: "Reading", status: "available", category: "past-exams" },
    { id: 8, title: "2025년 8월 제1회 수학", type: "Math", status: "available", category: "past-exams" },
    { id: 9, title: "2025년 8월 제2회 독해문법", type: "Reading", status: "available", category: "past-exams" },
    { id: 10, title: "2025년 8월 제2회 수학", type: "Math", status: "available", category: "past-exams" },
    { id: 11, title: "2025년 8월 제3회 독해문법", type: "Reading", status: "available", category: "past-exams" },
    { id: 12, title: "2025년 8월 제3회 수학", type: "Math", status: "available", category: "past-exams" },
    { id: 13, title: "2025년 8월 제4회 독해문법", type: "Reading", status: "available", category: "past-exams" },
    { id: 14, title: "2025년 8월 제4회 수학", type: "Math", status: "available", category: "past-exams" },
    { id: 15, title: "2025년 8월 제5회 독해문법", type: "Reading", status: "available", category: "past-exams" },
    { id: 16, title: "2025년 8월 제5회 수학", type: "Math", status: "available", category: "past-exams" },
    { id: 17, title: "2025년 10월 제1회 독해문법", type: "Reading", status: "available", category: "past-exams" },
    { id: 18, title: "2025년 10월 제1회 수학", type: "Math", status: "available", category: "past-exams" },
    { id: 19, title: "2025년 10월 제2회 독해문법", type: "Reading", status: "available", category: "past-exams" },
    { id: 20, title: "2025년 10월 제2회 수학", type: "Math", status: "available", category: "past-exams" },
    { id: 21, title: "2025년 12월 제1회 독해문법", type: "Reading", status: "available", category: "past-exams" },
    { id: 22, title: "2025년 12월 제1회 수학", type: "Math", status: "available", category: "past-exams" },
    { id: 101, title: "SAT Official Sample 1 - Reading", type: "Reading", status: "available", category: "official-samples" },
    { id: 102, title: "SAT Official Sample 2 - Reading", type: "Reading", status: "available", category: "official-samples" },
    { id: 103, title: "SAT Official Sample 1 - Math", type: "Math", status: "available", category: "official-samples" },
    { id: 104, title: "SAT Official Sample 2 - Math", type: "Math", status: "available", category: "official-samples" },
    { id: 105, title: "SAT Official Sample 3 - Reading", type: "Reading", status: "available", category: "official-samples" },
    { id: 106, title: "SAT Official Sample 3 - Math", type: "Math", status: "available", category: "official-samples" }
  ];
};

interface UploadContentProps {
  setActiveTab: (tab: string) => void;
  onUnlockContent?: () => void;
  uploadedFiles: Array<{
    id: string;
    name: string;
    type: string;
    location: string;
    subcategory: string;
    questionType?: string;
    difficulty?: string;
    uploadDate: string;
    status: 'completed' | 'processing' | 'failed';
    questionCount?: number;
    data?: any;
  }>;
  setUploadedFiles: React.Dispatch<React.SetStateAction<Array<{
    id: string;
    name: string;
    type: string;
    location: string;
    subcategory: string;
    questionType?: string;
    difficulty?: string;
    uploadDate: string;
    status: 'completed' | 'processing' | 'failed';
    questionCount?: number;
    data?: any;
  }>>>;
  projectId?: string;
  publicAnonKey?: string;
  onAdsUpdate?: (ads: any[]) => void;
}

export function UploadContent({ setActiveTab, onUnlockContent, uploadedFiles, setUploadedFiles, projectId, publicAnonKey, onAdsUpdate }: UploadContentProps) {
  const [uploadTab, setUploadTab] = useState('직접 입력');
  const [uploadLocation, setUploadLocation] = useState('스마트 연습');
  const [uploadSubcategory, setUploadSubcategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Add question type and difficulty state for 기출문제/공식문제
  const [questionType, setQuestionType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  
  // Training category state (Reading/Grammar/Math)
  const [trainingCategory, setTrainingCategory] = useState('');
  
  // Main category state for question types (리딩/문법/수학)
  const [mainQuestionCategory, setMainQuestionCategory] = useState('');
  
  // Edit filter state
  const [editFilterCategory, setEditFilterCategory] = useState('all'); // all, past-exams, official-samples
  const [editFilterType, setEditFilterType] = useState('all'); // all, Reading, Math
  
  // Expanded card state for 2-step selection UI
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  
  // Category management state
  const [categories, setCategories] = useState<{[key: string]: Array<{value: string, label: string}>}>({
    '스마트 연습': [
      { value: 'past-exams', label: '기출문제' },
      { value: 'official-samples', label: '공식 샘플' },
    ],
    '강의 및 특강': [
      { value: 'basic', label: '기본 과정' },
      { value: 'past-exams-lecture', label: '기출 문제 분석' },
      { value: 'special', label: '특별 강의' },
    ],
    '전문 훈련': [
      { value: 'reading', label: '리딩 (Reading)' },
      { value: 'grammar', label: '문법 (Grammar)' },
      { value: 'math', label: '수학 (Math)' },
    ],
  });

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryLabel, setEditingCategoryLabel] = useState('');
  const [newCategoryValue, setNewCategoryValue] = useState('');
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState('스마트 연습');
  
  // Manual input form state
  const [manualCardTitle, setManualCardTitle] = useState(''); // Card title
  const [manualQuestionTitle, setManualQuestionTitle] = useState('');
  const [manualPassage, setManualPassage] = useState('');
  const [manualQuestion, setManualQuestion] = useState('');
  const [manualChoices, setManualChoices] = useState<string[]>(['', '', '', '']);
  const [manualCorrectAnswer, setManualCorrectAnswer] = useState('a');
  const [manualExplanation, setManualExplanation] = useState('');
  const [manualImageUrl, setManualImageUrl] = useState(''); // Image URL for manual input
  const [manualImageUploading, setManualImageUploading] = useState(false);
  
  // File upload state
  const [fileCardTitle, setFileCardTitle] = useState(''); // Card title for file upload
  
  // Edit state - expanded for full content editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number>(0); // Index of question being edited in array
  const [editingCardTitle, setEditingCardTitle] = useState(''); // Card title
  const [editingTitle, setEditingTitle] = useState('');
  const [editingPassage, setEditingPassage] = useState('');
  const [editingQuestion, setEditingQuestion] = useState('');
  const [editingChoices, setEditingChoices] = useState<string[]>(['', '', '', '']);
  const [editingCorrectAnswer, setEditingCorrectAnswer] = useState('a');
  const [editingExplanation, setEditingExplanation] = useState('');
  const [editingImageUrl, setEditingImageUrl] = useState(''); // Image URL for editing

  // Add question to existing file state
  const [addingQuestionToFileId, setAddingQuestionToFileId] = useState<string | null>(null);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionPassage, setNewQuestionPassage] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionChoices, setNewQuestionChoices] = useState<string[]>(['', '', '', '']);
  const [newQuestionCorrectAnswer, setNewQuestionCorrectAnswer] = useState('a');
  const [newQuestionExplanation, setNewQuestionExplanation] = useState('');
  const [newQuestionImageUrl, setNewQuestionImageUrl] = useState(''); // Image URL for new question

  // Bulk upload state
  const [bulkUploadText, setBulkUploadText] = useState('');
  const [bulkUploadResult, setBulkUploadResult] = useState<{ success: boolean; message: string; parsedData?: any } | null>(null);

  // SUBCATEGORY mapping based on category
  const mapSubcategory = (category: string, subcategory: string): string => {
    const categoryLower = category.toLowerCase();
    const subcategoryLower = subcategory.toLowerCase();
    
    // Reading subcategories
    const readingMap: { [key: string]: string } = {
      'central ideas and details': 'central-ideas',
      'central ideas': 'central-ideas',
      '중심 생각': 'central-ideas',
      '주제': 'central-ideas',
      'command of evidence (textual)': 'evidence-textual',
      'evidence textual': 'evidence-textual',
      '근거 (텍스트)': 'evidence-textual',
      'command of evidence (quantitative)': 'evidence-quantitative',
      'evidence quantitative': 'evidence-quantitative',
      '근거 (수량)': 'evidence-quantitative',
      'inferences': 'inferences',
      '추론': 'inferences',
      'words in context': 'words-context',
      '문맥 속 단어': 'words-context',
      'text structure and purpose': 'text-structure',
      'text structure': 'text-structure',
      '텍스트 구조': 'text-structure',
      'cross-text connections': 'cross-text',
      'cross text': 'cross-text',
      '지문 간 연결': 'cross-text',
    };
    
    // Grammar subcategories
    const grammarMap: { [key: string]: string } = {
      'punctuation marks': 'punctuation-marks',
      'punctuation': 'punctuation-marks',
      '구두점': 'punctuation-marks',
      'sentence connection': 'sentence-connection',
      '문장 연결': 'sentence-connection',
      'verb practice': 'verb-practice',
      'verb': 'verb-practice',
      '동사': 'verb-practice',
      'nouns, pronouns': 'nouns-pronouns',
      'nouns pronouns': 'nouns-pronouns',
      '명사, 대명사': 'nouns-pronouns',
      'adjectives': 'adjectives',
      '형용사': 'adjectives',
      'attributive, adverbial': 'attributive-adverbial',
      'attributive adverbial': 'attributive-adverbial',
      '관형어, 부사': 'attributive-adverbial',
      'appositive': 'appositive',
      '동격': 'appositive',
      'transition': 'transition',
      '전환': 'transition',
      'rhetorical synthesis': 'rhetorical-synthesis',
      '수사적 종합': 'rhetorical-synthesis',
    };
    
    // Math subcategories
    const mathMap: { [key: string]: string } = {
      'basic operations': 'basic-operations',
      '기본 연산': 'basic-operations',
      'linear functions': 'linear-functions',
      'linear': 'linear-functions',
      '일차 함수': 'linear-functions',
      'quadratic functions': 'quadratic-functions',
      'quadratic': 'quadratic-functions',
      '이차 함수': 'quadratic-functions',
      'exponential functions': 'exponential-functions',
      'exponential': 'exponential-functions',
      '지수 함수': 'exponential-functions',
      'word problems': 'word-problems',
      '응용 문제': 'word-problems',
      'geometry': 'geometry',
      '기하': 'geometry',
      'circles': 'circles',
      '원': 'circles',
      'trigonometric functions': 'trigonometric-functions',
      'trigonometric': 'trigonometric-functions',
      '삼각 함수': 'trigonometric-functions',
      'statistics': 'statistics',
      '통계': 'statistics',
      'data analysis': 'data-analysis',
      '데이터 분석': 'data-analysis',
      'basic functions': 'basic-functions',
      '기본 함수': 'basic-functions',
      'algebra': 'linear-functions', // Default algebra to linear functions
      '대수': 'linear-functions',
    };
    
    if (categoryLower.includes('독해') || categoryLower.includes('reading')) {
      return readingMap[subcategoryLower] || subcategory;
    } else if (categoryLower.includes('문법') || categoryLower.includes('grammar')) {
      return grammarMap[subcategoryLower] || subcategory;
    } else if (categoryLower.includes('수학') || categoryLower.includes('math')) {
      return mathMap[subcategoryLower] || subcategory;
    }
    
    return subcategory;
  };

  // Get subcategory options based on upload location
  const getSubcategoryOptions = () => {
    return categories[uploadLocation] || [];
  };

  // Reset subcategory when upload location changes
  const handleUploadLocationChange = (location: string) => {
    setUploadLocation(location);
    setUploadSubcategory('');
    setMainQuestionCategory('');
    setQuestionType('');
  };

  // Get question type options based on main category
  const getQuestionTypeOptions = () => {
    if (mainQuestionCategory === 'reading') {
      return [
        { value: 'central-ideas', label: 'Central Ideas and Details' },
        { value: 'evidence-textual', label: 'Command of Evidence (Textual)' },
        { value: 'evidence-quantitative', label: 'Command of Evidence (Quantitative)' },
        { value: 'inferences', label: 'Inferences' },
        { value: 'words-context', label: 'Words in Context' },
        { value: 'text-structure', label: 'Text Structure and Purpose' },
        { value: 'cross-text', label: 'Cross-Text Connections' },
      ];
    } else if (mainQuestionCategory === 'grammar') {
      return [
        { value: 'punctuation-marks', label: 'Punctuation Marks' },
        { value: 'sentence-connection', label: 'Sentence Connection' },
        { value: 'verb-practice', label: 'Verb Practice' },
        { value: 'nouns-pronouns', label: 'Nouns, Pronouns' },
        { value: 'adjectives', label: 'Adjectives' },
        { value: 'attributive-adverbial', label: 'Attributive, Adverbial' },
        { value: 'appositive', label: 'Appositive' },
        { value: 'transition', label: 'Transition' },
        { value: 'rhetorical-synthesis', label: 'Rhetorical Synthesis' },
      ];
    } else if (mainQuestionCategory === 'math') {
      return [
        { value: 'basic-operations', label: 'Basic Operations' },
        { value: 'linear-functions', label: 'Linear Functions' },
        { value: 'quadratic-functions', label: 'Quadratic Functions' },
        { value: 'exponential-functions', label: 'Exponential Functions' },
        { value: 'word-problems', label: 'Word Problems' },
        { value: 'geometry', label: 'Geometry' },
        { value: 'circles', label: 'Circles' },
        { value: 'trigonometric-functions', label: 'Trigonometric Functions' },
        { value: 'statistics', label: 'Statistics' },
        { value: 'data-analysis', label: 'Data Analysis' },
        { value: 'basic-functions', label: 'Basic Functions' },
      ];
    }
    return [];
  };

  // Handle image upload
  const handleImageUpload = async (file: File, target: 'manual' | 'editing' | 'newQuestion') => {
    if (!projectId || !publicAnonKey) {
      toast.error('서버 정보가 없습니다.');
      return;
    }

    try {
      if (target === 'manual') {
        setManualImageUploading(true);
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/upload-image`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify({
                fileData: base64Data,
                fileName: file.name,
                contentType: file.type
              })
            }
          );

          const data = await response.json();
          
          if (data.success && data.imageUrl) {
            if (target === 'manual') {
              setManualImageUrl(data.imageUrl);
            } else if (target === 'editing') {
              setEditingImageUrl(data.imageUrl);
            } else if (target === 'newQuestion') {
              setNewQuestionImageUrl(data.imageUrl);
            }
            toast.success('이미지가 업로드되었습니다!');
          } else {
            throw new Error(data.error || 'Upload failed');
          }
        } catch (error) {
          console.error('Image upload error:', error);
          toast.error('이미지 업로드에 실패했습니다.');
        } finally {
          if (target === 'manual') {
            setManualImageUploading(false);
          }
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File read error:', error);
      toast.error('파일을 읽을 수 없습니다.');
      if (target === 'manual') {
        setManualImageUploading(false);
      }
    }
  };

  // Handle manual question submission
  const handleManualSubmit = () => {
    if (!manualCardTitle || !manualQuestionTitle || !manualPassage || !manualQuestion || 
        manualChoices.some(c => !c) || !manualExplanation) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    if (!uploadSubcategory) {
      toast.error('업로드 위치와 카테고리를 선택해주세요.');
      return;
    }

    setIsUploading(true);

    // Simulate saving
    setTimeout(() => {
      // Check if a card with the same title already exists
      const existingCardIndex = uploadedFiles.findIndex(
        file => file.name === manualCardTitle && 
                file.location === uploadLocation && 
                file.subcategory === uploadSubcategory
      );

      if (existingCardIndex !== -1) {
        // Add question to existing card
        const existingCard = uploadedFiles[existingCardIndex];
        const newQuestionData = {
          title: manualQuestionTitle,
          passage: manualPassage,
          question: manualQuestion,
          choices: manualChoices,
          correctAnswer: manualCorrectAnswer,
          explanation: manualExplanation,
          imageUrl: manualImageUrl || undefined
        };

        // Update the existing card with the new question
        const updatedCard = {
          ...existingCard,
          questionCount: (existingCard.questionCount || 0) + 1,
          data: Array.isArray(existingCard.data) 
            ? [...existingCard.data, newQuestionData]
            : [existingCard.data, newQuestionData]
        };

        setUploadedFiles(prev => prev.map((file, idx) => 
          idx === existingCardIndex ? updatedCard : file
        ));

        toast.success(`"${manualCardTitle}"에 문제가 추가되었습니다! (총 ${updatedCard.questionCount}개)`);
      } else {
        // Create new card
        const newQuestion = {
          id: Math.random().toString(36).substr(2, 9),
          name: manualCardTitle,
          type: 'manual',
          location: uploadLocation,
          subcategory: uploadSubcategory,
          ...(((uploadSubcategory === 'past-exams' || uploadSubcategory === 'official-samples' || uploadLocation === '전문 훈련') && questionType) && { questionType }),
          ...(((uploadSubcategory === 'past-exams' || uploadSubcategory === 'official-samples' || uploadLocation === '전문 훈련') && difficulty) && { difficulty }),
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'completed' as const,
          questionCount: 1,
          data: {
            title: manualQuestionTitle,
            passage: manualPassage,
            question: manualQuestion,
            choices: manualChoices,
            correctAnswer: manualCorrectAnswer,
            explanation: manualExplanation,
            imageUrl: manualImageUrl || undefined
          }
        };
        
        setUploadedFiles(prev => [...prev, newQuestion]);
        toast.success('새 카드가 생성되고 문제가 추가되었습니다!');
      }
      
      // Reset form - but keep the card title, category info so user can add more questions to the same card
      // setManualCardTitle(''); // Don't reset card title
      setManualQuestionTitle('');
      setManualPassage('');
      setManualQuestion('');
      setManualChoices(['', '', '', '']);
      setManualCorrectAnswer('a');
      setManualExplanation('');
      setManualImageUrl(''); // Reset image URL
      // Keep questionType, difficulty, and mainQuestionCategory as well
      // setQuestionType('');
      // setDifficulty('');
      // setMainQuestionCategory('');
      
      setIsUploading(false);
    }, 1000);
  };

  // Parse bulk upload text
  const parseBulkUploadText = (text: string) => {
    try {
      const lines = text.split('\n');
      let currentLine = 0;
      
      // Parse header info
      const headerInfo: any = {};
      const questions: any[] = [];
      
      // Read header
      while (currentLine < lines.length) {
        const line = lines[currentLine].trim();
        
        if (line.startsWith('TITLE:')) {
          headerInfo.title = line.substring(6).trim();
        } else if (line.startsWith('TYPE:')) {
          headerInfo.type = line.substring(5).trim();
        } else if (line.startsWith('SUBJECT:')) {
          headerInfo.subject = line.substring(8).trim();
        } else if (line.startsWith('MODULE:')) {
          headerInfo.module = line.substring(7).trim();
        } else if (line === '' && headerInfo.title) {
          // Empty line after header, start parsing questions
          currentLine++;
          break;
        }
        currentLine++;
      }
      
      // Parse questions
      let currentQuestion: any = {};
      let choicesCount = 0;
      
      while (currentLine < lines.length) {
        const line = lines[currentLine].trim();
        
        if (line === '') {
          // Empty line - end of question
          if (currentQuestion.question && currentQuestion.answer) {
            questions.push({ ...currentQuestion });
          }
          currentQuestion = {};
          choicesCount = 0;
        } else if (line.startsWith('CATEGORY:')) {
          currentQuestion.category = line.substring(9).trim();
        } else if (line.startsWith('SUBCATEGORY:')) {
          const rawSubcategory = line.substring(12).trim();
          // Map subcategory to standard format - will be done after we know the category
          currentQuestion.subcategory = rawSubcategory;
        } else if (line.startsWith('NUMBER:')) {
          currentQuestion.number = line.substring(7).trim();
        } else if (line.startsWith('DIFFICULTY:')) {
          currentQuestion.difficulty = line.substring(11).trim();
        } else if (line.startsWith('PASSAGE:')) {
          currentQuestion.passage = line.substring(8).trim();
        } else if (line.startsWith('QUESTION:')) {
          currentQuestion.question = line.substring(9).trim();
        } else if (line.match(/^[A-D]\)/)) {
          // Choice line
          if (!currentQuestion.choices) {
            currentQuestion.choices = [];
          }
          currentQuestion.choices.push(line.substring(3).trim());
          choicesCount++;
        } else if (line.startsWith('ANSWER:')) {
          currentQuestion.answer = line.substring(7).trim().toUpperCase();
        } else if (line.startsWith('EXPLANATION:')) {
          currentQuestion.explanation = line.substring(12).trim();
        } else {
          // Multi-line content (passage, explanation, etc.)
          if (currentQuestion.passage !== undefined && !currentQuestion.question) {
            currentQuestion.passage += '\n' + line;
          } else if (currentQuestion.explanation !== undefined) {
            currentQuestion.explanation += '\n' + line;
          } else if (currentQuestion.question && !line.match(/^[A-D]\)/) && choicesCount === 0) {
            currentQuestion.question += ' ' + line;
          }
        }
        
        currentLine++;
      }
      
      // Add last question if exists
      if (currentQuestion.question && currentQuestion.answer) {
        questions.push(currentQuestion);
      }
      
      // Map subcategories to standard format
      questions.forEach((q: any) => {
        if (q.subcategory && q.category) {
          q.subcategory = mapSubcategory(q.category, q.subcategory);
        }
      });
      
      return {
        success: true,
        data: {
          headerInfo,
          questions
        }
      };
    } catch (error) {
      return {
        success: false,
        error: '텍스트 파싱 중 오류가 발생했습니다: ' + (error as Error).message
      };
    }
  };

  // Handle bulk upload submission
  const handleBulkUploadSubmit = () => {
    if (!bulkUploadText.trim()) {
      toast.error('업로드할 텍스트를 입력해주세요.');
      return;
    }

    if (!uploadSubcategory) {
      toast.error('업로드 위치와 카테고리를 선택해주세요.');
      return;
    }

    setIsUploading(true);
    
    const parseResult = parseBulkUploadText(bulkUploadText);
    
    if (!parseResult.success) {
      toast.error(parseResult.error || '파싱 실패');
      setBulkUploadResult({ success: false, message: parseResult.error || '파싱 실패' });
      setIsUploading(false);
      return;
    }

    const { headerInfo, questions } = parseResult.data;

    // Convert to upload format
    const formattedQuestions = questions.map((q: any) => ({
      title: `문제 ${q.number || ''}`,
      passage: q.passage || '',
      question: q.question,
      choices: q.choices || ['', '', '', ''],
      correctAnswer: q.answer.toLowerCase(),
      explanation: q.explanation || '',
      category: q.category || '',
      subcategory: q.subcategory || '',
      difficulty: q.difficulty || '',
    }));

    const newFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: headerInfo.title || '대량 업로드 테스트',
      location: uploadLocation,
      subcategory: uploadSubcategory,
      type: headerInfo.subject || 'Reading',
      uploadDate: new Date().toLocaleDateString('ko-KR'),
      questionCount: formattedQuestions.length,
      data: formattedQuestions,
      questionType: '',
      difficulty: '',
      category: uploadSubcategory,
    };

    setUploadedFiles(prev => [...prev, newFile]);

    // Save to both localStorage and Supabase
    const updatedFiles = [...uploadedFiles, newFile];
    localStorage.setItem('uploaded_files', JSON.stringify(updatedFiles));

    if (projectId && publicAnonKey) {
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ files: updatedFiles }),
      }).catch(err => console.error('Supabase upload error:', err));
    }

    setBulkUploadResult({
      success: true,
      message: `성공적으로 ${formattedQuestions.length}개의 문제가 업로드되었습니다!`,
      parsedData: { headerInfo, questions: formattedQuestions }
    });

    toast.success(`${formattedQuestions.length}개 문제가 업로드되었습니다!`);
    
    // Clear form
    setBulkUploadText('');
    
    setIsUploading(false);
  };

  // Handle file upload
  const handleFileUpload = (files: FileList) => {
    if (!uploadSubcategory) {
      toast.error('업로드 위치와 카테고리를 선택해주세요.');
      return;
    }

    setIsUploading(true);

    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // CSV 파일 처리
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          throw new Error('파일에 데이터가 없습니다.');
        }
        
        // 첫 번째 줄은 헤더
        const headers = lines[0].split(',').map(h => h.trim());
        
        // 데이터 파싱
        const questions = [];
        for (let i = 1; i < lines.length; i++) {
          // CSV 파싱 (따옴표 안의 쉼표 처리)
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
          values.push(current.trim()); // 마지막 값 추가
          
          if (values.length >= 11) {
            questions.push({
              title: `${values[1]} - 문제 ${values[0]}`,
              passage: values[3].replace(/^"|"$/g, ''), // 따옴표 제거
              question: values[4].replace(/^"|"$/g, ''),
              choices: [
                values[5].replace(/^"|"$/g, ''),
                values[6].replace(/^"|"$/g, ''),
                values[7].replace(/^"|"$/g, ''),
                values[8].replace(/^"|"$/g, '')
              ],
              answer: values[9].toLowerCase(),
              explanation: values[10].replace(/^"|"$/g, '')
            });
          }
        }
        
        if (questions.length === 0) {
          throw new Error('올바른 형식의 문제가 없습니다.');
        }

        const newFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: fileCardTitle || file.name.replace(/\.(csv|xlsx)$/i, ''), // Changed from 'title' to 'name'
          type: 'csv', // Added type field
          location: uploadLocation,
          subcategory: uploadSubcategory,
          ...(((uploadSubcategory === 'past-exams' || uploadSubcategory === 'official-samples' || uploadLocation === '전문 훈련') && questionType) && { questionType }),
          ...(((uploadSubcategory === 'past-exams' || uploadSubcategory === 'official-samples' || uploadLocation === '전문 훈련') && difficulty) && { difficulty }),
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'completed' as const,
          questionCount: questions.length,
          data: questions
        };

        setUploadedFiles(prev => [...prev, newFile]);
        setFileCardTitle('');
        setQuestionType('');
        setDifficulty('');
        setMainQuestionCategory('');
        setIsUploading(false);
        toast.success(`${questions.length}개 문제가 성공적으로 업로드되었습니다!`);
      } catch (error) {
        setIsUploading(false);
        const errorMessage = error instanceof Error ? error.message : '파일 형식이 올바르지 않습니다.';
        toast.error(errorMessage + ' CSV 템플릿을 사용해주세요.');
      }
    };

    reader.readAsText(file);
  };

  // Download template
  const downloadTemplate = () => {
    // CSV 형식 템플릿 생성
    const csvHeader = '문제번호,과목,유형,지문,질문,A,B,C,D,정답,해설\n';
    const csvRows = [
      '1,독해,Main Ideas,"Cities benefit from what is called an agglomeration effect. When firms are located near each other, they can take advantage of economies of scale...","What is the main idea of the passage?","Agglomeration creates economies of scale","Cities are too crowded","Firms should avoid clustering","Transportation costs are decreasing",A,"The passage primarily discusses how agglomeration effects create economies of scale for firms located near each other."',
      '2,문법,Punctuation,"The companys products are: computers, tablets and phones.","Which punctuation is correct?","company\'s products are: computers,","companys products are: computers","company\'s products are; computers","companies products are: computers",A,"Possessive form requires an apostrophe."',
      '3,수학,Linear Functions,"A line passes through points (2,5) and (4,9).","What is the slope of the line?",2,4,0.5,1,A,"Slope = (9-5)/(4-2) = 4/2 = 2"'
    ];
    
    const csvContent = csvHeader + csvRows.join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM for Excel compatibility
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'question_template.csv';
    link.click();
    
    toast.success('CSV 템플릿이 다운로드되었습니다!');
  };

  // Remove uploaded file
  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success('문제가 삭제되었습니다.');
  };

  // Category management functions
  const handleAddCategory = () => {
    if (!newCategoryValue || !newCategoryLabel) {
      toast.error('카테고리 ID와 이름을 모두 입력하세요.');
      return;
    }

    setCategories(prev => ({
      ...prev,
      [selectedMainCategory]: [
        ...prev[selectedMainCategory],
        { value: newCategoryValue, label: newCategoryLabel }
      ]
    }));

    setNewCategoryValue('');
    setNewCategoryLabel('');
    toast.success('새 카테고리가 추가되었습니다!');
  };

  const handleEditCategory = (mainCat: string, categoryId: string) => {
    setEditingCategoryId(`${mainCat}-${categoryId}`);
    const category = categories[mainCat].find(c => c.value === categoryId);
    if (category) {
      setEditingCategoryLabel(category.label);
    }
  };

  const handleSaveCategory = (mainCat: string, categoryId: string) => {
    setCategories(prev => ({
      ...prev,
      [mainCat]: prev[mainCat].map(c => 
        c.value === categoryId ? { ...c, label: editingCategoryLabel } : c
      )
    }));
    setEditingCategoryId(null);
    setEditingCategoryLabel('');
    toast.success('카테고리 이름이 수정되었습니다!');
  };

  const handleDeleteCategory = (mainCat: string, categoryId: string) => {
    setCategories(prev => ({
      ...prev,
      [mainCat]: prev[mainCat].filter(c => c.value !== categoryId)
    }));
    toast.success('카테고리가 삭제되었습니다.');
  };

  // SAT VOCA 탭 선택 시 SATVocaManagement 컴포넌트 렌더링
  if (uploadTab === 'SAT VOCA') {
    return <SATVocaManagement />;
  }

  // 구독관리 탭 선택 시 SubscriptionManager 컴포넌트 렌더링
  if (uploadTab === '구독관리') {
    return <SubscriptionManager onUnlockSuccess={onUnlockContent} />;
  }

  // 광고 관리 탭 선택 시 AdManagement 컴포넌트 렌더링
  if (uploadTab === '광고 관리') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <AdManagement
              onClose={() => setUploadTab('직접 입력')}
              projectId={projectId || ''}
              publicAnonKey={publicAnonKey || ''}
              onAdsUpdate={onAdsUpdate || (() => {})}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#1e3a8a' }}>
        {/* Decorative circles */}
        <div className="absolute top-6 left-12 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: '#60a5fa' }}></div>
        <div className="absolute bottom-6 right-12 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: '#60a5fa' }}></div>
        
        <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">SAT Content Upload</h1>
          <p className="text-sm md:text-base text-blue-100 text-center">Your Path to Success</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-6 min-w-max">
            <button
              onClick={() => setUploadTab('직접 입력')}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                uploadTab === '직접 입력'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
              직��� 입력
            </button>
            <button
              onClick={() => setUploadTab('파일업로���')}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                uploadTab === '파일업로드'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
              파일 업로드
            </button>
            <button
              onClick={() => setUploadTab('대량 업로드')}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                uploadTab === '대량 업로드'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <FileUp className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
              대량 업로드
            </button>
            <button
              onClick={() => setUploadTab('편집')}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                uploadTab === '편집'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
              편집
            </button>
            <button
              onClick={() => setUploadTab('관리')}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                uploadTab === '관리'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
              관리
            </button>
            <button
              onClick={() => setUploadTab('SAT VOCA')}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                uploadTab === 'SAT VOCA'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <BookmarkPlus className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
              SAT VOCA 관리
            </button>
            <button
              onClick={() => setUploadTab('구독관리')}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                uploadTab === '구독관리'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
              구독 관리
            </button>
            <button
              onClick={() => setUploadTab('광고 관리')}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                uploadTab === '광고 관리'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Megaphone className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
              광고 관리
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Main Panel - Input Form */}
          <div className="space-y-4 sm:space-y-6">
            {/* Category Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">업로드 위치 선택</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">메인 카테고리</label>
                  <select 
                    className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md bg-white"
                    value={uploadLocation}
                    onChange={(e) => handleUploadLocationChange(e.target.value)}
                  >
                    <option value="스마트 연습">스마트 연습</option>
                    <option value="강의 및 특강">강의 및 특강</option>
                    <option value="전문 훈련">전문 훈련</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">세부 카테고리</label>
                  <select 
                    className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md bg-white"
                    value={uploadSubcategory}
                    onChange={(e) => setUploadSubcategory(e.target.value)}
                  >
                    <option value="">선택하세요</option>
                    {getSubcategoryOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {uploadSubcategory && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">{uploadLocation}</span> → <span className="font-medium">{getSubcategoryOptions().find(o => o.value === uploadSubcategory)?.label}</span>에 문제가 추가됩니다.
                  </p>
                </div>
              )}

              {/* Question Type and Difficulty for 기출문제 or 공식문제 */}
              {(uploadSubcategory === 'past-exams' || uploadSubcategory === 'official-samples') && (
                <div className="mt-3 sm:mt-4 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-medium text-green-900 mb-2 sm:mb-3">🏷️ 문제 분류 (Training 탭에서 검색 가능)</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">메인 카테고리</label>
                      <select 
                        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-green-300 rounded-md bg-white"
                        value={mainQuestionCategory}
                        onChange={(e) => {
                          setMainQuestionCategory(e.target.value);
                          setQuestionType(''); // Reset question type when main category changes
                        }}
                      >
                        <option value="">선택하세요</option>
                        <option value="reading">리딩 (Reading)</option>
                        <option value="grammar">문법 (Grammar)</option>
                        <option value="math">수학 (Math)</option>
                      </select>
                    </div>
                    
                    {mainQuestionCategory && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">문제 유형</label>
                          <select 
                            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-green-300 rounded-md bg-white"
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value)}
                          >
                            <option value="">선택하세요</option>
                            {getQuestionTypeOptions().map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">난이도</label>
                          <select 
                            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-green-300 rounded-md bg-white"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                          >
                            <option value="">선택하세요</option>
                            <option value="쉬움">쉬움</option>
                            <option value="보통">보통</option>
                            <option value="어려움">어려움</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    💡 이 정보는 나중에 전문 훈련 탭에서 유형별로 문제를 찾는 데 사용됩니다.
                  </p>
                </div>
              )}

              {/* Category and Difficulty selection for Training */}
              {uploadLocation === '전문 훈련' && uploadSubcategory && (
                <div className="mt-3 sm:mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-medium text-purple-900 mb-2 sm:mb-3">🏷️ 문제 분류 설정</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        메인 카테고리: <span className="text-purple-700 font-semibold">
                          {uploadSubcategory === 'reading' ? '리딩 (Reading)' : 
                           uploadSubcategory === 'grammar' ? '문법 (Grammar)' : 
                           uploadSubcategory === 'math' ? '수학 (Math)' : uploadSubcategory}
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">문제 유형</label>
                      <select 
                        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-purple-300 rounded-md bg-white"
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value)}
                      >
                        <option value="">선택하세요</option>
                        {uploadSubcategory === 'reading' && [
                          { value: 'central-ideas', label: 'Central Ideas and Details' },
                          { value: 'evidence-textual', label: 'Command of Evidence (Textual)' },
                          { value: 'evidence-quantitative', label: 'Command of Evidence (Quantitative)' },
                          { value: 'inferences', label: 'Inferences' },
                          { value: 'words-context', label: 'Words in Context' },
                          { value: 'text-structure', label: 'Text Structure and Purpose' },
                          { value: 'cross-text', label: 'Cross-Text Connections' },
                        ].map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                        {uploadSubcategory === 'grammar' && [
                          { value: 'punctuation-marks', label: 'Punctuation Marks' },
                          { value: 'sentence-connection', label: 'Sentence Connection' },
                          { value: 'verb-practice', label: 'Verb Practice' },
                          { value: 'nouns-pronouns', label: 'Nouns, Pronouns' },
                          { value: 'adjectives', label: 'Adjectives' },
                          { value: 'attributive-adverbial', label: 'Attributive, Adverbial' },
                          { value: 'appositive', label: 'Appositive' },
                          { value: 'transition', label: 'Transition' },
                          { value: 'rhetorical-synthesis', label: 'Rhetorical Synthesis' },
                        ].map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                        {uploadSubcategory === 'math' && [
                          { value: 'basic-operations', label: 'Basic Operations' },
                          { value: 'linear-functions', label: 'Linear Functions' },
                          { value: 'quadratic-functions', label: 'Quadratic Functions' },
                          { value: 'exponential-functions', label: 'Exponential Functions' },
                          { value: 'word-problems', label: 'Word Problems' },
                          { value: 'geometry', label: 'Geometry' },
                          { value: 'circles', label: 'Circles' },
                          { value: 'trigonometric-functions', label: 'Trigonometric Functions' },
                          { value: 'statistics', label: 'Statistics' },
                          { value: 'data-analysis', label: 'Data Analysis' },
                          { value: 'basic-functions', label: 'Basic Functions' },
                        ].map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">난이도</label>
                      <select 
                        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-purple-300 rounded-md bg-white"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                      >
                        <option value="">선택하세요</option>
                        <option value="쉬움">쉬움</option>
                        <option value="보통">보통</option>
                        <option value="어려움">어려움</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-purple-700 mt-2">
                    💡 카테고리와 난이도별로 문제를 구분하여 체계적인 학습이 가능합니다.
                  </p>
                </div>
              )}
            </div>

            {/* Direct Input Form */}
            {uploadTab === '직접 입력' && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <h2 className="text-base sm:text-lg font-medium text-gray-800">문제 직접 입력</h2>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {/* Card Title */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <label className="block text-xs sm:text-sm font-medium text-blue-900">
                        📁 카드 제목 (목록에 표시될 이름) *
                      </label>
                      {manualCardTitle && (
                        <button
                          onClick={() => {
                            setManualCardTitle('');
                            setQuestionType('');
                            setDifficulty('');
                            setMainQuestionCategory('');
                            toast.info('새 카드를 시작합니다.');
                          }}
                          className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                        >
                          새 카드 시작
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="예: 2024년 3월 기출문제 세트"
                      value={manualCardTitle}
                      onChange={(e) => setManualCardTitle(e.target.value)}
                      className="w-full p-2 sm:p-3 text-sm sm:text-base border border-blue-300 rounded-md bg-white"
                    />
                    <p className="text-[10px] sm:text-xs text-blue-700 mt-1 sm:mt-2">
                      {manualCardTitle 
                        ? `현재 "${manualCardTitle}" 카드에 문제가 추가됩니다. 같은 카드에 여러 문제를 연속으로 추가할 수 있습니다.`
                        : '이 이름은 우측 목록과 각 탭에서 표시됩니다.'
                      }
                    </p>
                  </div>

                  {/* Question Title */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2"><span className="font-bold">문제 제목 *</span></label>
                    <input
                      type="text"
                      placeholder="예: 도시 집적 경제 지문 - Q1"
                      value={manualQuestionTitle}
                      onChange={(e) => setManualQuestionTitle(e.target.value)}
                      className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md"
                    />
                  </div>

                  {/* Passage */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2"><span className="font-bold">지문 *</span></label>
                    <textarea
                      placeholder="지문 내용을 입력하세요..."
                      value={manualPassage}
                      onChange={(e) => setManualPassage(e.target.value)}
                      rows={6}
                      className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md resize-none"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2">
                      <span className="font-bold">이미지/그래프</span>
                      <span className="text-gray-500 ml-2 font-normal">(선택사항 - 수학 문제용)</span>
                    </label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file, 'manual');
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={manualImageUploading}
                      />
                      {manualImageUploading && (
                        <p className="text-sm text-blue-600">이미지 업로드 중...</p>
                      )}
                      {manualImageUrl && (
                        <div className="relative">
                          <img 
                            src={manualImageUrl} 
                            alt="Preview" 
                            className="max-w-full h-auto max-h-48 rounded-md border border-gray-300"
                          />
                          <button
                            onClick={() => setManualImageUrl('')}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Question */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2"><span className="font-bold">질문 *</span></label>
                    <textarea
                      placeholder="질문을 입력하세요..."
                      value={manualQuestion}
                      onChange={(e) => setManualQuestion(e.target.value)}
                      rows={3}
                      className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md resize-none"
                    />
                  </div>

                  {/* Choices */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2"><span className="font-bold">선택지 *</span></label>
                    <div className="space-y-2">
                      {['A', 'B', 'C', 'D'].map((letter, index) => (
                        <div key={letter} className="flex items-center gap-2">
                          <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0">
                            {letter}
                          </span>
                          <input
                            type="text"
                            placeholder={`선택지 ${letter}`}
                            value={manualChoices[index]}
                            onChange={(e) => {
                              const newChoices = [...manualChoices];
                              newChoices[index] = e.target.value;
                              setManualChoices(newChoices);
                            }}
                            className="flex-1 p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2"><span className="font-bold">정답 *</span></label>
                    <select
                      value={manualCorrectAnswer}
                      onChange={(e) => setManualCorrectAnswer(e.target.value)}
                      className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md bg-white"
                    >
                      <option value="a">A</option>
                      <option value="b">B</option>
                      <option value="c">C</option>
                      <option value="d">D</option>
                    </select>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2"><span className="font-bold">해설 *</span></label>
                    <textarea
                      placeholder="정답 해설을 입력하세요..."
                      value={manualExplanation}
                      onChange={(e) => setManualExplanation(e.target.value)}
                      rows={4}
                      className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleManualSubmit}
                    disabled={isUploading || !uploadSubcategory}
                    className="w-full bg-blue-500 text-white py-2 sm:py-3 text-sm sm:text-base rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    {isUploading ? '저장 중...' : '문제 추가하기'}
                  </Button>
                </div>
              </div>
            )}

            {/* File Upload Form */}
            {uploadTab === '파일업로드' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-medium text-gray-800">표준화된 파일 업로드</h2>
                </div>

                <div className="space-y-4">
                  {/* Card Title Input */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      📁 카드 제목 (목록에 표시될 이름) *
                    </label>
                    <input
                      type="text"
                      placeholder="예: 2024년 SAT 실전 모의고사"
                      value={fileCardTitle}
                      onChange={(e) => setFileCardTitle(e.target.value)}
                      className="w-full p-3 border border-blue-300 rounded-md bg-white"
                    />
                    <p className="text-xs text-blue-700 mt-2">
                      파일 업로드 후 이 이름으로 카드가 생성됩니다. 비워두면 파일명이 사용됩니다.
                    </p>
                  </div>

                  {/* Template Download */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileDown className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-yellow-900 mb-1">표준 템플릿 사용</h3>
                        <p className="text-sm text-yellow-800 mb-3">
                          올바른 형식으로 문제를 업로드하려면 아래 표준 템플릿을 다운로드하여 사용하세요.
                        </p>
                        <Button
                          onClick={downloadTemplate}
                          size="sm"
                          className="bg-yellow-600 text-white hover:bg-yellow-700"
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          템플릿 다운로드 (CSV)
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* File Upload Area */}
                  <div
                    className="border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50"
                    onClick={() => {
                      if (!uploadSubcategory) {
                        toast.error('먼저 업로드 위치를 선택해주세요.');
                        return;
                      }
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.csv, .xlsx';
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files) handleFileUpload(files);
                      };
                      input.click();
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (!uploadSubcategory) {
                        toast.error('먼저 업로드 위치를 선택해주세요.');
                        return;
                      }
                      const files = e.dataTransfer.files;
                      if (files) handleFileUpload(files);
                    }}
                  >
                    <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      파일을 여기에 드래그하거나 클릭하여 업로드
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      CSV 또는 XLSX 형식의 표준 템플릿 파일만 지원됩니다
                    </p>
                    <Button
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                      disabled={!uploadSubcategory || isUploading}
                    >
                      {isUploading ? '업로드 중...' : '파일 선택'}
                    </Button>
                    {!uploadSubcategory && (
                      <p className="text-xs text-red-500 mt-3">
                        업로드 위치와 세부 카테고리를 먼저 선택하세요
                      </p>
                    )}
                  </div>

                  {/* Format Guide */}
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                    <h4 className="font-medium text-gray-800 mb-2">📋 파일 형식 안내</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>CSV 또는 XLSX 파일 형식만 지원됩니다</li>
                      <li>표준 템플릿을 다운로드하여 내용을 수정하세요</li>
                      <li>한 파일에 여러 문제를 포함할 수 있습니다</li>
                      <li>모든 필드(지문, 질문, 선택지, 정답, 해설)를 채워주세요</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Upload Form */}
            {uploadTab === '대량 업로드' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileUp className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-medium text-gray-800">대량 업로드 (텍스트 양식)</h2>
                </div>

                <div className="space-y-4">
                  {/* 양식 안내 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">📝 표준 양식</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      아래 양식을 따라 문제를 입력하세요. 각 문제는 빈 줄로 구분됩니다.
                    </p>
                    <div className="bg-white rounded p-3 font-mono text-xs text-gray-700 overflow-x-auto">
                      <pre>{
`TITLE: SAT Practice Test 1
TYPE: SAT
SUBJECT: Reading and Writing
MODULE: 1

CATEGORY: 문법
SUBCATEGORY: Punctuation Marks
NUMBER: 1
DIFFICULTY: 보통

PASSAGE:
The Apollo Moon landings (1969-1972) brought atmospheric sensors...

QUESTION: Which choice completes the text?
A) salvage
B) improve
C) amend
D) simplify

ANSWER: A
EXPLANATION: 오래된 저장 기술에 있는 데이터를 "구출"...

CATEGORY: 독해
SUBCATEGORY: Central Ideas and Details
NUMBER: 2
DIFFICULTY: 어려움

PASSAGE:
Scientists have long debated...

QUESTION: Which choice best describes the main idea?
A) Option 1
B) Option 2
C) Option 3
D) Option 4

ANSWER: C
EXPLANATION: 지문은 돌고래의 지능에 대한...

CATEGORY: 수학
SUBCATEGORY: Linear Functions
NUMBER: 3
DIFFICULTY: 쉬움

QUESTION: If 3x + 5 = 20, what is x?
A) 3
B) 5
C) 7
D) 15

ANSWER: B
EXPLANATION: 3x = 15이므로 x = 5`
                      }</pre>
                    </div>
                  </div>

                  {/* 필드 설명 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">🔑 필수 필드</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li><strong>헤더:</strong> TITLE, TYPE, SUBJECT, MODULE</li>
                      <li><strong>각 문제:</strong> CATEGORY, NUMBER, QUESTION, A) B) C) D), ANSWER</li>
                      <li><strong>선택 필드:</strong> SUBCATEGORY, DIFFICULTY, PASSAGE, EXPLANATION</li>
                      <li><strong>구분자:</strong> 각 문제 사이는 빈 줄로 구분</li>
                    </ul>
                  </div>

                  {/* 카테고리 안내 */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">📚 SUBCATEGORY 옵션</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-white rounded-lg p-3">
                        <p className="font-semibold text-blue-900 mb-2">독해 (Reading)</p>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Central Ideas and Details</li>
                          <li>• Command of Evidence (Textual)</li>
                          <li>• Command of Evidence (Quantitative)</li>
                          <li>• Inferences</li>
                          <li>• Words in Context</li>
                          <li>• Text Structure and Purpose</li>
                          <li>• Cross-Text Connections</li>
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="font-semibold text-green-900 mb-2">문법 (Grammar)</p>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Punctuation Marks</li>
                          <li>• Sentence Connection</li>
                          <li>• Verb Practice</li>
                          <li>• Nouns, Pronouns</li>
                          <li>• Adjectives</li>
                          <li>• Attributive, Adverbial</li>
                          <li>• Appositive</li>
                          <li>• Transition</li>
                          <li>• Rhetorical Synthesis</li>
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="font-semibold text-purple-900 mb-2">수학 (Math)</p>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Basic Operations</li>
                          <li>• Linear Functions</li>
                          <li>• Quadratic Functions</li>
                          <li>• Exponential Functions</li>
                          <li>• Word Problems</li>
                          <li>• Geometry</li>
                          <li>• Circles</li>
                          <li>• Trigonometric Functions</li>
                          <li>• Statistics</li>
                          <li>• Data Analysis</li>
                          <li>• Basic Functions</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 텍스트 입력 영역 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      문제 입력 (위 양식대로 작성) *
                    </label>
                    <textarea
                      value={bulkUploadText}
                      onChange={(e) => setBulkUploadText(e.target.value)}
                      placeholder="TITLE: SAT Practice Test 1&#10;TYPE: SAT&#10;SUBJECT: Reading and Writing&#10;MODULE: 1&#10;&#10;CATEGORY: 문법&#10;NUMBER: 1&#10;..."
                      rows={20}
                      className="w-full p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {bulkUploadText.split('\n\n').filter(s => s.trim()).length - 1}개의 문제 블록 감지됨
                    </p>
                  </div>

                  {/* 업로드 결과 */}
                  {bulkUploadResult && (
                    <div className={`rounded-lg p-4 ${
                      bulkUploadResult.success 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`text-sm font-medium ${
                        bulkUploadResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {bulkUploadResult.message}
                      </p>
                      {bulkUploadResult.parsedData && (
                        <div className="mt-2 text-xs text-green-800">
                          <p>제목: {bulkUploadResult.parsedData.headerInfo?.title}</p>
                          <p>문제 수: {bulkUploadResult.parsedData.questions?.length}개</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 업로드 버튼 */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleBulkUploadSubmit}
                      disabled={!bulkUploadText.trim() || !uploadSubcategory || isUploading}
                      className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isUploading ? '업로드 중...' : '대량 업로드'}
                    </Button>
                    <Button
                      onClick={() => {
                        setBulkUploadText('');
                        setBulkUploadResult(null);
                      }}
                      variant="outline"
                      className="px-6 py-3"
                    >
                      초기화
                    </Button>
                  </div>

                  {!uploadSubcategory && (
                    <p className="text-sm text-red-500">
                      ⚠️ 업로드 위치와 세부 카테고리를 먼저 선택하세요
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Edit Form */}
            {uploadTab === '편집' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Edit3 className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-medium text-gray-800">업로드된 문제 편집</h2>
                </div>

                {/* Filter Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">카테고리 필터</label>
                      <select 
                        className="w-full p-2 text-sm border border-gray-300 rounded-md bg-white"
                        value={editFilterCategory}
                        onChange={(e) => setEditFilterCategory(e.target.value)}
                      >
                        <option value="all">전체</option>
                        <option value="past-exams">기출문제</option>
                        <option value="official-samples">공식 샘플</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">문제 유형</label>
                      <select 
                        className="w-full p-2 text-sm border border-gray-300 rounded-md bg-white"
                        value={editFilterType}
                        onChange={(e) => setEditFilterType(e.target.value)}
                      >
                        <option value="all">전체</option>
                        <option value="Reading">Reading</option>
                        <option value="Math">Math</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">총 {uploadedFiles.length}개</span> 문제
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <Button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
                    onClick={() => {
                      // 새 문제 추가 - 직접 입력 탭으로 이동
                      setUploadTab('직접 입력');
                      toast.info('새 문제를 직접 입력해주세요.');
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                    새 문제 추가
                  </Button>
                  <Button
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center gap-2"
                    onClick={() => {
                      // 기출/공식 문제 불러오기 다이얼로그 표시
                      const confirmLoad = window.confirm(
                        '기출 및 공식 문제를 불러오시겠습니까?\n\n총 28개 문제 (기출 22개 + 공식 6개)\n불러온 문제는 편집하고 저장할 수 있습니다.'
                      );
                      if (confirmLoad) {
                        // localStorage에서 문제 ���러오기
                        const storedTests = loadTestsFromStorage();
                        
                        if (storedTests && storedTests.length > 0) {
                          // 모든 문제 불러오기 (28개 전체)
                          const convertedTests = storedTests.map((test: any) => {
                            // 카테고리별 기본 문제 내용 템플릿 생성
                            const isReading = test.type === 'Reading';
                            const isMath = test.type === 'Math';
                            const isPastExam = test.category === 'past-exams';
                            
                            return {
                              id: Math.random().toString(36).substr(2, 9),
                              name: test.title,
                              type: 'imported',
                              location: '스마트 연습',
                              subcategory: test.category || 'past-exams',
                              questionType: isReading ? 'central-ideas' : isMath ? 'linear-functions' : 'punctuation-marks',
                              difficulty: '보통',
                              uploadDate: new Date().toISOString().split('T')[0],
                              status: 'completed' as const,
                              questionCount: isReading ? 54 : 44,
                              data: (() => {
                                const questionsPerModule = isReading ? 27 : 22;
                                const allQuestions = [];
                                for (let module = 1; module <= 2; module++) {
                                  for (let q = 1; q <= questionsPerModule; q++) {
                                    allQuestions.push({
                                      title: `${test.title} - Module ${module}, Q${q}`,
                                      passage: isReading ? `[Module ${module}, Q${q}]\\n\\n이 지문은 ${isPastExam ? '기출문제' : '공식 샘플'}에서 불러온 내용입니다.` : `[Module ${module}, Q${q}]\\n\\n이 ${isMath ? '수학' : '문법'} 문제입니다.`,
                                      question: `Question ${q}: 편집하여 실제 질문을 작성하세요.`,
                                      choices: ['선택지 A (편집)', '선택지 B (편집)', '선택지 C (편집)', '선택지 D (편집)'],
                                      correctAnswer: 'a',
                                      explanation: `[Module ${module}, Q${q} 해설]\\n\\n정답: A`
                                    });
                                  }
                                }
                                return allQuestions;
                              })()
                            };
                          });
                          
                          setUploadedFiles(prev => [...prev, ...convertedTests]);
                          toast.success(`✅ ${convertedTests.length}개의 카드를 불러왔습니다!\\n\\n편집 탭에서 각 문제를 수정/보완하세요.`, {
                            duration: 4000
                          });
                        } else {
                          toast.error('불러올 문제가 없습니다.');
                        }
                      }
                    }}
                  >
                    <BookOpen className="h-4 w-4" />
                    기출/공식 문제 불러오기
                  </Button>
                </div>

                <div className="space-y-4">
                  {uploadedFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-gray-200 border-dashed rounded-lg">
                      <FileText className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500">편집할 문제가 없습니다.</p>
                      <p className="text-sm text-gray-400 mt-2">먼저 문제를 업로드하거나 기출/공식 문제를 불러오세요.</p>
                    </div>
                  ) : (() => {
                    const filteredFiles = uploadedFiles.filter(file => {
                      // Category filter
                      if (editFilterCategory !== 'all' && file.subcategory !== editFilterCategory) {
                        return false;
                      }
                      // Type filter - check both the file's data and name
                      if (editFilterType !== 'all') {
                        const nameHasReading = file.name?.toLowerCase().includes('reading') || file.name?.toLowerCase().includes('독해');
                        const nameHasMath = file.name?.toLowerCase().includes('math') || file.name?.toLowerCase().includes('수학');
                        if (editFilterType === 'Reading' && !nameHasReading) {
                          return false;
                        }
                        if (editFilterType === 'Math' && !nameHasMath) {
                          return false;
                        }
                      }
                      return true;
                    });

                    if (filteredFiles.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-12 border-2 border-gray-200 border-dashed rounded-lg">
                          <FileText className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="text-gray-500">필터 조건에 맞는 문제가 없습니다.</p>
                          <p className="text-sm text-gray-400 mt-2">필터를 변경하거나 새 문제를 추가하세요.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {filteredFiles.map((file, index) => {
                          const isArray = Array.isArray(file.data);
                          const isExpanded = expandedCardId === file.id;
                          
                          return (
                        <div key={`${file.id}-${index}`} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                          {editingId === file.id ? (
                            <div className="p-5 space-y-4">
                              {/* Card Title */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <label className="block text-sm font-medium text-blue-900 mb-2">
                                  📁 카드 제목 (목록에 표시될 이름) *
                                </label>
                                <input
                                  type="text"
                                  value={editingCardTitle}
                                  onChange={(e) => setEditingCardTitle(e.target.value)}
                                  className="w-full p-3 border border-blue-300 rounded-md bg-white"
                                />
                                <p className="text-xs text-blue-700 mt-2">
                                  이 이름은 우측 목록과 각 탭에서 표시됩니다.
                                </p>
                              </div>

                              {/* Question Title */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">문제 제목 *</label>
                                <input
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  className="w-full p-3 border border-gray-300 rounded-md"
                                  placeholder="문제 제목을 입력하세요"
                                />
                              </div>

                              {file.data && (
                                <>
                                  {/* Passage */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">지문 *</label>
                                    <textarea
                                      value={editingPassage}
                                      onChange={(e) => setEditingPassage(e.target.value)}
                                      className="w-full p-3 border border-gray-300 rounded-md resize-none"
                                      rows={6}
                                      placeholder="지문 내용을 입력하세요"
                                    />
                                  </div>

                                  {/* Question */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">질문 *</label>
                                    <textarea
                                      value={editingQuestion}
                                      onChange={(e) => setEditingQuestion(e.target.value)}
                                      className="w-full p-3 border border-gray-300 rounded-md resize-none"
                                      rows={3}
                                      placeholder="질문을 입력하세요"
                                    />
                                  </div>

                                  {/* Choices */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">선택지 *</label>
                                    <div className="space-y-2">
                                      {['A', 'B', 'C', 'D'].map((letter, index) => (
                                        <div key={letter} className="flex items-center gap-2">
                                          <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                                            {letter}
                                          </span>
                                          <input
                                            type="text"
                                            value={editingChoices[index]}
                                            onChange={(e) => {
                                              const newChoices = [...editingChoices];
                                              newChoices[index] = e.target.value;
                                              setEditingChoices(newChoices);
                                            }}
                                            className="flex-1 p-3 border border-gray-300 rounded-md"
                                            placeholder={`선택지 ${letter}`}
                                          />
                                        </div>
                                      ))  }
                                    </div>
                                  </div>

                                  {/* Correct Answer */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">정답 *</label>
                                    <select
                                      value={editingCorrectAnswer}
                                      onChange={(e) => setEditingCorrectAnswer(e.target.value)}
                                      className="w-full p-3 border border-gray-300 rounded-md bg-white"
                                    >
                                      <option value="a">A</option>
                                      <option value="b">B</option>
                                      <option value="c">C</option>
                                      <option value="d">D</option>
                                    </select>
                                  </div>

                                  {/* Explanation */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">해설 *</label>
                                    <textarea
                                      value={editingExplanation}
                                      onChange={(e) => setEditingExplanation(e.target.value)}
                                      className="w-full p-3 border border-gray-300 rounded-md resize-none"
                                      rows={4}
                                      placeholder="정답 해설을 입력하세요"
                                    />
                                  </div>
                                </>
                              )}

                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                                  onClick={() => {
                                    if (!editingTitle.trim()) {
                                      toast.error('제목을 입력하세요.');
                                      return;
                                    }
                                    
                                    if (file.data) {
                                      if (!editingPassage || !editingQuestion || 
                                          editingChoices.some(c => !c) || !editingExplanation) {
                                        toast.error('모든 필드를 입력해주세요.');
                                        return;
                                      }
                                    }

                                    setUploadedFiles(prev => 
                                      prev.map(f => {
                                        if (f.id === file.id) {
                                          // Check if data is an array
                                          if (Array.isArray(f.data)) {
                                            // Update specific question in array
                                            const updatedData = [...f.data];
                                            updatedData[editingQuestionIdx] = {
                                              title: editingTitle,
                                              passage: editingPassage,
                                              question: editingQuestion,
                                              choices: editingChoices,
                                              correctAnswer: editingCorrectAnswer,
                                              explanation: editingExplanation
                                            };
                                            return {
                                              ...f,
                                              name: editingCardTitle,
                                              data: updatedData
                                            };
                                          } else {
                                            // Single question object
                                            return {
                                              ...f,
                                              name: editingCardTitle,
                                              data: {
                                                title: editingTitle,
                                                passage: editingPassage,
                                                question: editingQuestion,
                                                choices: editingChoices,
                                                correctAnswer: editingCorrectAnswer,
                                                explanation: editingExplanation
                                              }
                                            };
                                          }
                                        }
                                        return f;
                                      })
                                    );
                                    setEditingId(null);
                                    setEditingCardTitle('');
                                    setEditingTitle('');
                                    setEditingPassage('');
                                    setEditingQuestion('');
                                    setEditingChoices(['', '', '', '']);
                                    setEditingCorrectAnswer('a');
                                    setEditingExplanation('');
                                    toast.success('문제가 수정되었습니다!');
                                  }}
                                >
                                  저장
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditingCardTitle('');
                                    setEditingTitle('');
                                    setEditingPassage('');
                                    setEditingQuestion('');
                                    setEditingChoices(['', '', '', '']);
                                    setEditingCorrectAnswer('a');
                                    setEditingExplanation('');
                                  }}
                                >
                                  취소
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {/* Card Header - Clickable to expand/collapse */}
                              <button
                                className="w-full p-5 text-left hover:bg-gray-100 transition-colors"
                                onClick={() => setExpandedCardId(isExpanded ? null : file.id)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="text-sm font-medium text-gray-800">
                                        {file.name}
                                      </h4>
                                      {file.type === 'imported' && (
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                          불러온 문제
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      {file.location} • {getSubcategoryOptions().find(o => o.value === file.subcategory)?.label || file.subcategory}
                                    </p>
                                    {(file.questionType || file.difficulty) && (
                                      <div className="flex gap-1 mt-1.5 flex-wrap">
                                        {file.questionType && (
                                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                            {getQuestionTypeOptions().find(opt => opt.value === file.questionType)?.label || 
                                             categories['전문 훈련']?.find(c => c.value === file.questionType)?.label || 
                                             file.questionType}
                                          </span>
                                        )}
                                        {file.difficulty && (
                                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                            난이도: {file.difficulty}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 ml-3">
                                    <span className="text-xs text-gray-600 font-medium">{file.questionCount}문제</span>
                                    <svg
                                      className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400 mt-2">
                                  {file.uploadDate}
                                </div>
                              </button>
                              
                              {/* Expanded Content - Question Numbers List */}
                              {isExpanded && (
                                <div className="px-5 pb-5 border-t border-gray-200">
                                  {Array.isArray(file.data) && file.data.length > 0 ? (
                                    <div className="pt-4">
                                      <h5 className="text-xs font-medium text-gray-700 mb-3">📝 문제 목록 (클릭하여 편집)</h5>
                                      <div className="grid grid-cols-10 gap-1.5 mb-4">
                                        {file.data.map((q: any, idx: number) => (
                                          <button
                                            key={idx}
                                            onClick={() => {
                                              setEditingId(file.id);
                                              setEditingQuestionIdx(idx);
                                              setEditingCardTitle(file.name);
                                              setEditingTitle(q.title || `문제 ${idx + 1}`);
                                              setEditingPassage(q.passage || '');
                                              setEditingQuestion(q.question || '');
                                              setEditingChoices(q.choices || ['', '', '', '']);
                                              setEditingCorrectAnswer(q.correctAnswer || 'a');
                                              setEditingExplanation(q.explanation || '');
                                            }}
                                            className="px-2 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-colors"
                                          >
                                            {idx + 1}
                                          </button>
                                        ))}
                                      </div>
                                      
                                      {/* Action Buttons */}
                                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                                        <Button
                                          size="sm"
                                          className="bg-green-50 text-green-700 py-2 px-3 rounded hover:bg-green-100"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setAddingQuestionToFileId(file.id);
                                          }}
                                        >
                                          <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                                          문제 추가
                                        </Button>
                                        <Button
                                          size="sm"
                                          className="bg-red-50 text-red-700 py-2 px-3 rounded hover:bg-red-100"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFile(file.id);
                                          }}
                                        >
                                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                          카드 삭제
                                        </Button>
                                      </div>
                                    </div>
                                  ) : file.data ? (
                                    <div className="pt-4">
                                      <div className="bg-white rounded p-3 mb-3 text-xs text-gray-600 space-y-1">
                                        <p className="truncate"><span className="font-medium">지문:</span> {file.data.passage?.substring(0, 50)}...</p>
                                        <p className="truncate"><span className="font-medium">질문:</span> {file.data.question?.substring(0, 50)}...</p>
                                      </div>
                                      
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          className="flex-1 bg-blue-50 text-blue-700 py-2 rounded hover:bg-blue-100"
                                          onClick={() => {
                                            setEditingId(file.id);
                                            setEditingQuestionIdx(0);
                                            setEditingCardTitle(file.name);
                                            setEditingTitle(file.data?.title || file.name);
                                            if (file.data) {
                                              setEditingPassage(file.data.passage);
                                              setEditingQuestion(file.data.question);
                                              setEditingChoices(file.data.choices);
                                              setEditingCorrectAnswer(file.data.correctAnswer);
                                              setEditingExplanation(file.data.explanation);
                                            }
                                          }}
                                        >
                                          <Edit3 className="h-3.5 w-3.5 mr-2 inline" />
                                          문제 편집
                                        </Button>
                                        <Button
                                          size="sm"
                                          className="bg-green-50 text-green-700 py-2 px-3 rounded hover:bg-green-100"
                                          onClick={() => setAddingQuestionToFileId(file.id)}
                                        >
                                          <PlusCircle className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          className="bg-red-50 text-red-700 py-2 px-3 rounded hover:bg-red-100"
                                          onClick={() => handleRemoveFile(file.id)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="pt-4 text-center text-xs text-gray-400">
                                      문제 데이터가 없습니다
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                          );
                        })}
                    </div>
                  );
                })()}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {uploadTab === '설정' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-medium text-gray-800">카테고리 관리</h2>
                </div>

                {/* Main Category Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">메인 카테고리 선택</label>
                  <select
                    value={selectedMainCategory}
                    onChange={(e) => setSelectedMainCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="스마트 연습">스마트 연습</option>
                    <option value="전문 훈련">전문 훈련</option>
                  </select>
                </div>

                {/* Add New Category */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-800 mb-3">새 카테고리 추가</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryLabel}
                      onChange={(e) => setNewCategoryLabel(e.target.value)}
                      placeholder="카테고리 이름"
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={newCategoryValue}
                      onChange={(e) => setNewCategoryValue(e.target.value)}
                      placeholder="카테고리 값 (영문)"
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                    />
                    <Button
                      size="sm"
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      onClick={() => handleAddCategory()}
                    >
                      추가
                    </Button>
                  </div>
                </div>

                {/* Current Categories */}
                <div>
                  <h3 className="text-sm font-medium text-gray-800 mb-3">
                    현재 카테고리 - {selectedMainCategory}
                  </h3>
                  <div className="space-y-2">
                    {categories[selectedMainCategory]?.map((category) => (
                      <div key={category.value} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                        <div>
                          <span className="font-medium">{category.label}</span>
                          <span className="text-sm text-gray-500 ml-2">({category.value})</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600"
                          onClick={() => handleDeleteCategory(selectedMainCategory, category.value)}
                        >
                          삭제
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AdBanner />
    </div>
  );
}
