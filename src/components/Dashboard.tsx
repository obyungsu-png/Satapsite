import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Upload, FileText, Home, BookOpen, Target, BarChart3, BookmarkPlus, Settings, ArrowRight, GraduationCap, Download, Trash2, Volume2, Lock, Menu, X, Share2, Mail, MessageCircle, Copy, Check, TrendingUp, Zap, Database } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner@2.0.3";
import specialIcon from 'figma:asset/d7f2c71b688d83c12f0a6e1dec983a339119de39.png';
import satBannerImage from 'figma:asset/bc1fb792d358de72133d5188e17231b78849fcd5.png';
import { PracticeRecord } from './PracticeRecord';
import { AdBanner } from './AdBanner';
import { WordTest } from './WordTest';
import { UploadContent } from './UploadContent';
import { SATVocaPage } from './SATVocaPage';
import { WordFlashcard } from './WordFlashcard';
import { TrainingContent } from './TrainingContent';
import { SignUpPage } from './SignUpPage';
import { LoginPage } from './LoginPage';
import { LoginPopup } from './LoginPopup';
import { SubscriptionManager } from './SubscriptionManager';
import { generateTableRows } from './utils/generateTableRows';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { AdManagement, Advertisement, AdBannerDisplay } from './AdManagement';
import { LandingPage } from './LandingPage';
import { BulkUpload } from './BulkUpload';

interface DashboardProps {
  onStartTest: (testInfo?: any) => void;
  learnedWords?: any[];
  practiceRecords?: any[];
  currentUser?: any;
  setCurrentUser?: (user: any) => void;
}

// LocalStorage + Supabase 이중 저장 시스템
const STORAGE_KEY = 'sat_practice_tests';

// Timeout wrapper for fetch calls
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 10000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('Request timeout'), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

// localStorage에서 로드
const loadTestsFromStorage = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

// localStorage에 저장
const saveTestsToStorage = (tests: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Supabase에서 데이터 로드
const loadTestsFromSupabase = async (): Promise<any[] | null> => {
  try {
    console.log('📡 Supabase 서버에 연결 중...');
    const response = await fetchWithTimeout(`https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/practice-tests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('⚠️ Supabase 응답 에러, localStorage 사용:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Supabase에서 데이터 로드 완료');
    return data.tests || null;
  } catch (error) {
    const msg = error instanceof DOMException && error.name === 'AbortError'
      ? 'Request timed out'
      : (error instanceof Error ? error.message : String(error));
    console.log('⚠️ Supabase 로드 실패 (localStorage 사용):', msg);
    return null;
  }
};

// Supabase에 데이터 저장
const saveTestsToSupabase = async (tests: any[]) => {
  try {
    const response = await fetchWithTimeout(`https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/practice-tests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tests }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('⚠️ Supabase 저장 실패:', errorText);
    } else {
      console.log('✅ Supabase에 저장 완료');
    }
  } catch (error) {
    const msg = error instanceof DOMException && error.name === 'AbortError'
      ? 'Request timed out'
      : (error instanceof Error ? error.message : String(error));
    console.log('⚠️ Supabase 저장 실패 (로컬 저장은 완료):', msg);
  }
};

// 통합 저장 함수 - localStorage와 Supabase 둘 다 저장
const saveTestsBoth = async (tests: any[]) => {
  // 1. localStorage에 즉시 저장 (빠른 응답)
  saveTestsToStorage(tests);
  console.log('✅ localStorage에 저장 완료');
  
  // 2. Supabase에도 저장 (영구 보관)
  await saveTestsToSupabase(tests);
};

// TestCard Component with hover effect for Practice
function TestCard({ test, index, onStartTest, onViewWords, isUnlocked, onNavigateToPricing }: { 
  test: any; 
  index: number; 
  onStartTest: () => void;
  onViewWords: () => void;
  isUnlocked?: boolean;
  onNavigateToPricing?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isLocked = false; // 모든 잠금 해제
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-lg transition-all duration-300 relative"
      style={{
        backgroundColor: isLocked ? '#f5f5f5' : (isHovered ? '#E8EAF6' : '#F5F5F5'),
        boxShadow: isHovered ? '0 3px 12px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.06)',
        opacity: isLocked ? 0.6 : 1
      }}
      whileHover={{ scale: isLocked ? 1 : 1.015, y: isLocked ? 0 : -2 }}
    >
      <div className="p-3.5">
        {/* Icon and Title */}
        <div className="flex items-start gap-2.5 mb-3">
          <motion.div 
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: isLocked ? '#d1d5db' : '#E8EAF6' }}
          >
            {isLocked ? (
              <Lock className="w-4.5 h-4.5 text-gray-500" />
            ) : (
              <BookOpen className="w-4.5 h-4.5" style={{ color: '#3D5AA1' }} />
            )}
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 
              className="text-sm line-clamp-2 mb-1"
              style={{ color: isLocked ? '#6b7280' : '#000', fontWeight: 700 }}
            >
              {test.title}
            </h3>
            <p 
              className="text-xs transition-colors duration-300"
              style={{ 
                color: isLocked ? '#9ca3af' : (isHovered ? '#3D5AA1' : '#666'),
                fontWeight: 700
              }}
            >
              {test.type}
            </p>
          </div>
        </div>

        {/* Badges */}
        {test.isUploaded && !isLocked && (
          <div className="mb-3">
            <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#EBE9F5', color: '#2B478B' }}>
              <Upload className="w-3 h-3 inline-block mr-1" />
              업로드됨
            </span>
          </div>
        )}
        
        {/* Buttons */}
        {!isLocked && (
          <div className="space-y-2">
            <Button
              onClick={onStartTest}
              className="w-full py-2 rounded transition-colors text-xs"
              style={{ 
                backgroundColor: '#3D5AA1',
                color: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2F4A85';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3D5AA1';
              }}
              size="sm"
            >
              시작하기
            </Button>
            <Button
              onClick={onViewWords}
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-1.5 justify-center text-xs py-2"
            >
              <div className="w-3.5 h-3.5 bg-gray-400 rounded flex items-center justify-center">
                <BookOpen className="w-2 h-2 text-white" />
              </div>
              문제 단어 보기
            </Button>
          </div>
        )}
      </div>
      
      {/* Unlock Button Overlay */}
      {isLocked && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            if (onNavigateToPricing) {
              onNavigateToPricing();
            }
          }}
          className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg opacity-80 md:opacity-0 md:hover:opacity-100 transition-opacity touch-manipulation"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm shadow-md" style={{ backgroundColor: '#D4EDFF', color: '#3D5AA1', fontWeight: 700 }}>
            <Lock size={14} className="md:w-4 md:h-4" />
            <span className="whitespace-nowrap">Unlock Now</span>
          </div>
        </motion.button>
      )}
    </motion.div>
  );
}

// CourseCard Component with hover effect for Lectures
// TestCard Component with hover effect for Practice
function TestCard({ test, index, onStartTest, onViewWords, isUnlocked, onNavigateToPricing }: { 
  test: any; 
  index: number; 
  onStartTest: () => void;
  onViewWords: () => void;
  isUnlocked?: boolean;
  onNavigateToPricing?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isLocked = false; 
  
  return (
    <div
      className={`bg-white rounded-3xl p-6 shadow-sm border transition-all duration-300 transform ${
        isLocked ? 'opacity-70 bg-gray-50 border-gray-100 cursor-not-allowed' :
        isHovered ? 'shadow-lg border-[#425486] -translate-y-1 cursor-pointer' : 'border-gray-100'
      } relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
          isLocked ? 'bg-gray-200 text-gray-400' : 'bg-[#EEF2F6] text-[#425486]'
        }`}>
          {isLocked ? <Lock className="w-5 h-5" /> : <BookOpen className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold mb-1 leading-tight line-clamp-2 ${isLocked ? 'text-gray-500' : 'text-[#2C3E50]'}`}>
            {test.title}
          </h3>
          <p className={`text-sm font-medium ${isLocked ? 'text-gray-400' : 'text-[#425486]'}`}>
            {test.type}
          </p>
        </div>
      </div>

      {test.isUploaded && !isLocked && (
        <div className="mb-4">
          <span className="text-xs px-2.5 py-1 rounded-md bg-[#EEF2F6] text-[#425486] font-medium inline-flex items-center">
            <Upload className="w-3 h-3 mr-1" /> 업로드됨
          </span>
        </div>
      )}

      {!isLocked && (
        <div className="space-y-3 mt-auto">
          <button
            onClick={onStartTest}
            className="w-full bg-[#425486] text-white rounded-xl py-3 font-semibold hover:bg-[#2C3E50] transition-colors shadow-sm"
          >
            시작하기
          </button>
          <button
            onClick={onViewWords}
            className="w-full bg-white border border-gray-200 text-gray-600 rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <BookmarkPlus className="w-4 h-4" /> 문제 단어 보기
          </button>
        </div>
      )}

      {/* Unlock Button Overlay */}
      {isLocked && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (onNavigateToPricing) onNavigateToPricing();
          }}
          className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-3xl opacity-0 hover:opacity-100 transition-opacity"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-[#D4EDFF] text-[#3D5AA1] font-bold shadow-md cursor-pointer">
            <Lock size={16} />
            Unlock Now
          </div>
        </div>
      )}
    </div>
  );
}
// TrainingCard Component with hover effect for Training
function TrainingCard({ type, index, uploadedCount, onStartTraining }: { 
  type: any; 
  index: number; 
  uploadedCount: number;
  onStartTraining: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = type.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-xl transition-all duration-300"
      style={{
        backgroundColor: isHovered ? '#D1C4E9' : '#F5F5F5',
        boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.08)'
      }}
      whileHover={{ scale: 1.02, y: -3 }}
    >
      <div className="p-4 text-center">
        <motion.div 
          className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
          style={{ backgroundColor: 'white' }}
        >
          <Icon className="w-5 h-5" style={{ color: '#5E35B1' }} />
        </motion.div>
        
        <h3 className="mb-1 text-sm" style={{ color: '#000', fontWeight: 700 }}>
          {type.name}
        </h3>
        
        {uploadedCount > 0 && (
          <div className="mb-2">
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
              <Upload className="w-3 h-3 inline-block mr-1" />
              업로드된 자료 {uploadedCount}개
            </span>
          </div>
        )}
        
        <p 
          className="text-xs mb-3 transition-colors duration-300"
          style={{ 
            color: isHovered ? '#5E35B1' : '#666',
            fontWeight: 700
          }}
        >
          전문 훈련 문제
        </p>

        <div className="space-y-1.5">
          <Button
            onClick={onStartTraining}
            className="w-full py-1.5 rounded transition-colors text-white text-xs"
            size="sm"
            style={{ backgroundColor: '#2B478B' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F3666'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2B478B'}
          >
            훈련 시작
          </Button>
          
          {uploadedCount > 0 && (
            <Button
              className="w-full bg-gray-100 text-gray-700 py-1.5 rounded hover:bg-gray-200 text-xs"
              size="sm"
            >
              업로드된 자료만 ({uploadedCount}개)
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// FeatureCard Component for Home page
function FeatureCard({ title, description, icon: Icon, color, hoverColor, iconColor, index, onClick }: {
  title: string;
  description: string;
  icon: any;
  color: string;
  hoverColor: string;
  iconColor: string;
  index: number;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="bg-white rounded-xl transition-all duration-300 cursor-pointer p-4 sm:p-8 shadow-sm hover:shadow-md border border-gray-100"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Desktop Layout */}
      <div className="hidden sm:flex flex-col items-start text-left">
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
          style={{ backgroundColor: iconColor + '15' }}
        >
          <Icon className="w-8 h-8" style={{ color: iconColor }} />
        </div>
        
        <h3 className="flex items-center gap-2 text-lg mb-3 text-gray-800 uppercase tracking-wide" style={{ fontWeight: 700 }}>
          {title}
          <ArrowRight className="w-4 h-4" style={{ color: iconColor }} />
        </h3>
        
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Mobile Layout - Icon on left, Title on right, no description */}
      <div className="flex sm:hidden items-center gap-3">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconColor + '15' }}
        >
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
        
        <h3 className="flex items-center gap-1.5 text-xs text-gray-800 uppercase tracking-wide" style={{ fontWeight: 700 }}>
          {title}
          <ArrowRight className="w-3 h-3" style={{ color: iconColor }} />
        </h3>
      </div>
    </motion.div>
  );
}

// PracticeRecordCard Component for History
function PracticeRecordCard({ record, index, onViewDetail, onRetry }: {
  record: any;
  index: number;
  onViewDetail: () => void;
  onRetry: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-lg transition-all duration-300"
      style={{
        backgroundColor: isHovered ? '#E8F5E9' : 'white',
        boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
      }}
      whileHover={{ scale: 1.01, y: -2 }}
    >
      <div className="p-4 flex items-start gap-4">
        {/* Record Icon */}
        <motion.div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-700"
          style={{ 
            backgroundColor: isHovered ? 'white' : '#BBDEFB',
            fontWeight: 700
          }}
          animate={{
            backgroundColor: isHovered ? 'white' : '#BBDEFB'
          }}
        >
          {record.id}
        </motion.div>

        {/* Record Details */}
        <div className="flex-1">
          <h3 className="font-medium text-gray-800 mb-1">{record.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <span>{record.date}</span>
            <span>문제 수: {record.questionsCount}</span>
            <span className="text-green-600 font-medium">정답률: {record.accuracy}%</span>
          </div>
          <p className="text-xs text-gray-500">소요 시간: {record.timeUsed}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onViewDetail}
            className="text-xs"
          >
            상세보기
          </Button>
          <Button
            size="sm"
            onClick={onRetry}
            className="bg-blue-200 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-300"
          >
            다시연습
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Extract words from practice test passages and questions
const extractWordsFromTests = () => {
  const keyWords = [
    // From Question 3 - agglomeration economies passage
    { word: "agglomeration", definition: "a mass or collection of things", difficulty: "어려움", testId: 1, questionId: 3, context: "agglomeration economies", category: "독해" },
    { word: "economies", definition: "the wealth and resources of a country or region", difficulty: "보통", testId: 1, questionId: 3, context: "agglomeration economies", category: "독해" },
    { word: "concentrate", definition: "focus one's attention or effort on", difficulty: "보통", testId: 1, questionId: 3, context: "firms that concentrate in a region", category: "독해" },
    { word: "readily", definition: "without hesitation or reluctance; willingly", difficulty: "보통", testId: 1, questionId: 3, context: "can more readily take advantage", category: "독해" },
    { word: "fosters", definition: "encourage the development of", difficulty: "어려움", testId: 1, questionId: 3, context: "fosters greater technological innovation", category: "독해" },
    { word: "technological", definition: "relating to or involving technology", difficulty: "쉬움", testId: 1, questionId: 3, context: "technological innovation", category: "독해" },
    { word: "innovation", definition: "the action or process of innovating", difficulty: "보통", testId: 1, questionId: 3, context: "technological innovation", category: "독해" },
    
    // From Question 4 - Mexico literature passage
    { word: "autonomous", definition: "having the freedom to act independently", difficulty: "어려움", testId: 1, questionId: 4, context: "autonomous identity", category: "독해" },
    { word: "medium", definition: "a means of communication or artistic expression", difficulty: "보통", testId: 1, questionId: 4, context: "literature became a medium", category: "독해" },
    { word: "distinctly", definition: "in a way that is recognizably different", difficulty: "보통", testId: 1, questionId: 4, context: "distinctly Mexican literary tradition", category: "독해" },
    { word: "tradition", definition: "the transmission of customs or beliefs", difficulty: "쉬움", testId: 1, questionId: 4, context: "literary tradition", category: "독해" },
    { word: "realized", definition: "became fully aware of as a fact", difficulty: "보통", testId: 1, questionId: 4, context: "nation realized its identity", category: "독해" },
    
    // From Question 5 - Pluto crater passage
    { word: "probe", definition: "a spacecraft designed to explore space", difficulty: "보통", testId: 1, questionId: 5, context: "New Horizons space probe", category: "독해" },
    { word: "crater", definition: "a large bowl-shaped cavity", difficulty: "쉬움", testId: 1, questionId: 5, context: "23-mile-long crater", category: "독해" },
    { word: "methane", definition: "a colorless, odorless flammable gas", difficulty: "어려움", testId: 1, questionId: 5, context: "frozen methane and nitrogen", category: "독해" },
    { word: "nitrogen", definition: "a colorless, odorless unreactive gas", difficulty: "어려움", testId: 1, questionId: 5, context: "frozen methane and nitrogen", category: "독해" },
    { word: "ammonia", definition: "a colorless gas with a characteristic smell", difficulty: "어려움", testId: 1, questionId: 5, context: "water ice and ammonia", category: "독해" },
    { word: "eruptions", definition: "instances of erupting or bursting forth", difficulty: "보통", testId: 1, questionId: 5, context: "eruptions from ice volcanoes", category: "독해" },
    { word: "volcanoes", definition: "mountains with openings to Earth's interior", difficulty: "쉬움", testId: 1, questionId: 5, context: "ice volcanoes", category: "독해" },
    { word: "hypothesized", definition: "put forward as a hypothesis", difficulty: "어려움", testId: 1, questionId: 5, context: "team hypothesized that", category: "독해" },
    { word: "massive", definition: "extremely large or heavy", difficulty: "쉬움", testId: 1, questionId: 5, context: "massive ice volcano", category: "독해" }
  ];
  
  return keyWords;
};

export function Dashboard({ onStartTest, learnedWords = [], practiceRecords = [], currentUser, setCurrentUser }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('Home');
  const [showSignUpPage, setShowSignUpPage] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(!!currentUser);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isContentUnlocked, setIsContentUnlocked] = useState(() => {
    // 관리자 모드가 활성화되어 있으면 자동으로 unlock
    return localStorage.getItem('adminMode') === 'true';
  });
  
  // 관리자 모드 변경 감지
  useEffect(() => {
    const checkAdminMode = () => {
      const adminMode = localStorage.getItem('adminMode') === 'true';
      setIsContentUnlocked(adminMode);
    };
    
    // 초기 체크
    checkAdminMode();
    
    // storage 이벤트 리스너 추가 (다른 탭에서 변경 시 감지)
    window.addEventListener('storage', checkAdminMode);
    
    return () => {
      window.removeEventListener('storage', checkAdminMode);
    };
  }, []);

  // Helper function to save student to Supabase
  const saveStudentToSupabase = async (student: any) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Student saved to Supabase:', data);
        return data.student;
      } else {
        console.error('Failed to save student to Supabase');
        return null;
      }
    } catch (error) {
      console.error('Error saving student to Supabase:', error);
      return null;
    }
  };

  // Handle login
  const handleLogin = async (email: string, name: string) => {
    const user = {
      id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      createdAt: new Date().toISOString(),
    };
    
    // Save to Supabase
    const savedUser = await saveStudentToSupabase(user);
    
    // Update local state
    if (setCurrentUser) {
      setCurrentUser(savedUser || user);
    }
    setIsLoggedIn(true);
    setShowLoginPage(false);
    setShowSignUpPage(false);
    toast.success(`환영합니다, ${name}님!`);
  };
  
  // Practice content state
  const [smartPracticeTab, setSmartPracticeTab] = useState('기출문제'); // 기출문제 or 공식문제 or 단어관리
  const [practiceOrder, setPracticeOrder] = useState('시간순 정렬'); // 시간순 정렬, 모의고사 연습 적합, 보충 연습 적합
  const [smartPracticeSubject, setSmartPracticeSubject] = useState('전체'); // 전체, Reading, Math
  
  // Word Management state
  const [wordListType, setWordListType] = useState('전체'); // 전체, 고빈도 단어, 어려운 단어, 틀린 단어
  const [wordCategory, setWordCategory] = useState('전체'); // 전체, 독해, 수학
  const [wordDifficulty, setWordDifficulty] = useState('전체'); // 전체, 쉬움, 보통, 어려움
  const [wordQuestionCount, setWordQuestionCount] = useState('10'); // 10, 30, 50, 100
  const [wordAttemptFilter, setWordAttemptFilter] = useState('전체'); // 전체, 미연습, 한 번 틀린 문제, 두 번 이상 틀린 문제
  const [wordStudyMode, setWordStudyMode] = useState<'list' | 'flashcard' | 'test' | 'browse'>('list'); // 단어 학습 모드
  const [showWordBrowseView, setShowWordBrowseView] = useState(false); // Start 버튼으로 단어 목록 보기 활성화
  const [selectedWordList, setSelectedWordList] = useState<any>(null); // 선택된 단어 목록
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // 현재 단어 인덱스 (플래시카드/테스트용)
  const [testAnswers, setTestAnswers] = useState<{[key: number]: string}>({}); // 테스트 답변 저장
  const [showTestResult, setShowTestResult] = useState<{[key: number]: boolean}>({}); // 정답/오답 표시
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false); // 플래시카드 뒤집기 상태
  const [subjectiveAnswer, setSubjectiveAnswer] = useState(''); // 주관식 답변 입력
  const [incorrectQuestions, setIncorrectQuestions] = useState<number[]>([]); // 틀린 문제 목록
  const [completedWordTests, setCompletedWordTests] = useState<any[]>([]); // 완료한 단어 테스트 목록
  const [viewedWordLists, setViewedWordLists] = useState<any[]>([]); // 학습한 단어 목록 (단어목록에 표시됨)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false); // 다운로드 옵션 다이얼로그 표시
  const [showTestDialog, setShowTestDialog] = useState(false); // 테스트 옵션 다이얼로그 표시
  const [testType, setTestType] = useState<'multiple' | 'subjective' | 'mixed'>('multiple'); // 테스트 유형: 객관식, 주관식, 혼합
  
  // Training content state
  const [selectedSubject, setSelectedSubject] = useState('독해');
  const [selectedSource, setSelectedSource] = useState('전체');
  const [selectedProgress, setSelectedProgress] = useState('전체');
  const [selectedDifficulty, setSelectedDifficulty] = useState('쉬움');
  const [selectedQuestionCount, setSelectedQuestionCount] = useState('5문제');
  const [trainingAttemptFilter, setTrainingAttemptFilter] = useState('전체'); // 전체, 미연습, 한 번 틀린 문제, 두 번 이상 틀린 문제
  const [selectedAnswerOption, setSelectedAnswerOption] = useState('즉시 정답 해설 확인');
  const [trainingSource, setTrainingSource] = useState('전체'); // 题목来源
  const [answerDisplayMode, setAnswerDisplayMode] = useState('즉시'); // 选项选择
  
  // Practice record state
  const [recordSelectedSubject, setRecordSelectedSubject] = useState('전체');
  const [sortBy, setSortBy] = useState('date');
  
  // Advertisement state
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [showAdManagement, setShowAdManagement] = useState(false);
  
  // Upload content state
  const [uploadTab, setUploadTab] = useState('직접 입력'); // 직접 입력 or 파일업로드 or 대량 업로드 or 학생관리
  const [uploadLocation, setUploadLocation] = useState('스마트 연습');
  
  // Student management state
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string | null>(null);
  const [uploadSubcategory, setUploadSubcategory] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'local' | 'external'>('local');
  const [externalLink, setExternalLink] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    type: string;
    location: string;
    subcategory: string;
    uploadDate: string;
    status: 'processing' | 'completed' | 'failed';
    questionCount?: number;
    data?: any;
    questionType?: string;
    difficulty?: string;
    cardTitle?: string;
    trainingCategory?: string;
    trainingType?: string;
    trainingDifficulty?: string;
    trainingSource?: string;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Load uploaded files from Supabase or localStorage on mount
  useEffect(() => {
    const loadUploadedFiles = async () => {
      console.log('🔍 uploadedFiles를 Supabase에서 로드 시도...');
      
      try {
        const response = await fetchWithTimeout(`https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/uploaded-files`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.files && Array.isArray(data.files) && data.files.length > 0) {
            console.log('✅ Supabase에서 uploadedFiles 로드 성공:', data.files.length, '개');
            setUploadedFiles(data.files);
            localStorage.setItem('sat_practice_tests', JSON.stringify(data.files));
            return;
          }
        }
      } catch (error) {
        console.log('Supabase uploadedFiles 로드 실패, localStorage 사용:', error);
      }

      // Supabase 실패 시 localStorage에서 로드
      const stored = localStorage.getItem('sat_practice_tests');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            console.log('📂 localStorage에서 uploadedFiles 로드:', parsed.length, '개');
            setUploadedFiles(parsed);
            
            // localStorage 데이터를 Supabase에 백업 (setUploadedFiles의 save useEffect에서 자동 처리)
          }
        } catch (error) {
          console.error('Error loading practice tests from localStorage:', error);
        }
      }
    };
    
    loadUploadedFiles();
  }, []);
  
  // Save uploaded files to localStorage AND Supabase whenever they change
  useEffect(() => {
    if (uploadedFiles.length === 0) return;

    // 1. localStorage에 즉시 저장
    localStorage.setItem('sat_practice_tests', JSON.stringify(uploadedFiles));
    console.log('✅ uploadedFiles를 localStorage에 저장');

    // 2. Supabase 저장은 debounce + AbortController로 관리
    const abortController = new AbortController();
    const debounceTimer = setTimeout(async () => {
      if (abortController.signal.aborted) return; // cleanup 후에는 실행하지 않음
      try {
        console.log('📡 uploadedFiles를 Supabase에 저장 시도...');
        const response = await fetchWithTimeout(`https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/uploaded-files`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ files: uploadedFiles }),
        });

        if (response.ok) {
          console.log('✅ uploadedFiles를 Supabase에 저장 완료');
        } else {
          const errorText = await response.text();
          console.error('❌ Supabase uploadedFiles 저장 실패:', errorText);
        }
      } catch (error) {
        if (abortController.signal.aborted) return; // cleanup abort는 무시
        console.warn('⚠️ Supabase uploadedFiles 저장 에러 (로컬 데이터는 정상 저장됨):', error instanceof Error ? error.message : String(error));
      }
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
      abortController.abort();
    };
  }, [uploadedFiles]);

  // Load students from Supabase on mount
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await fetchWithTimeout(
          `https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/students`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Students loaded from Supabase:', data.students);
          setStudents(data.students || []);
        }
      } catch (error) {
        console.error('Error loading students from Supabase:', error);
      }
    };

    loadStudents();
  }, []);

  // Load advertisements from Supabase on mount
  useEffect(() => {
    const loadAdvertisements = async () => {
      try {
        const response = await fetchWithTimeout(
          `https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/advertisements`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setAdvertisements(data);
            console.log('✅ 광고 로드 완료:', data.length, '개');
          }
        } else {
          console.log('광고 로드 실패, 빈 배열 사용');
          setAdvertisements([]);
        }
      } catch (error) {
        console.log('광고 로드 에러, 빈 배열 사용:', error);
        setAdvertisements([]);
      }
    };

    loadAdvertisements();
  }, []);
  
  // Manual input form state
  const [manualQuestionTitle, setManualQuestionTitle] = useState('');
  const [manualPassage, setManualPassage] = useState('');
  const [manualQuestion, setManualQuestion] = useState('');
  const [manualChoices, setManualChoices] = useState<string[]>(['', '', '', '']);
  const [manualCorrectAnswer, setManualCorrectAnswer] = useState('');
  const [manualExplanation, setManualExplanation] = useState('');
  
  // Practice record content state
  const [practiceRecordCategory, setPracticeRecordCategory] = useState('기출문제');
  const [practiceRecordSubject, setPracticeRecordSubject] = useState('전체');
  const [practiceRecordDifficulty, setPracticeRecordDifficulty] = useState('전체');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [showAIHelp, setShowAIHelp] = useState(false);
  
  // Study Hub password protection
  const [showStudyHubPassword, setShowStudyHubPassword] = useState(false);
  const [studyHubPasswordInput, setStudyHubPasswordInput] = useState('');
  const [isStudyHubUnlocked, setIsStudyHubUnlocked] = useState(false);

  // Course content state
  const [selectedCourseCategory, setSelectedCourseCategory] = useState('basic');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [coursePage, setCoursePage] = useState(1);
  const [wordListPage, setWordListPage] = useState(1);
  const coursesPerPage = 8;
  
  // Report content state
  const [reportCopied, setReportCopied] = useState(false);
  const [reportStudentMessage, setReportStudentMessage] = useState('');
  
  const testsPerPage = 6;
  
  // Render practice records using the separate component
  const renderPracticeRecordContent = () => {
    return (
      <PracticeRecord
        practiceRecordCategory={practiceRecordCategory}
        setPracticeRecordCategory={setPracticeRecordCategory}
        practiceRecordSubject={practiceRecordSubject}
        setPracticeRecordSubject={setPracticeRecordSubject}
        practiceRecordDifficulty={practiceRecordDifficulty}
        setPracticeRecordDifficulty={setPracticeRecordDifficulty}
        selectedQuestion={selectedQuestion}
        setSelectedQuestion={setSelectedQuestion}
        showAIHelp={showAIHelp}
        setShowAIHelp={setShowAIHelp}
        practiceRecords={practiceRecords}
        onStartTest={onStartTest}
        advertisements={advertisements}
        reportContent={renderReportContentInner()}
        uploadedFiles={uploadedFiles}
        currentUser={currentUser}
        selectedStudentFilter={selectedStudentFilter}
        setSelectedStudentFilter={setSelectedStudentFilter}
      />
    );
  };

  const renderReportContentInner = () => {
    // Use component-level state hooks instead of declaring them here
    const copied = reportCopied;
    const setCopied = setReportCopied;
    const studentMessage = reportStudentMessage;
    const setStudentMessage = setReportStudentMessage;

    // 학습 데이터 계산
    const studyStats = {
      mockTests: { count: 15, avgScore: 85 },
      realTests: { count: 8, avgScore: 82 },
      vocabulary: { count: 20 },
      training: { count: 10 },
      questionTypes: { count: 5 }
    };

    const performanceData = {
      totalTests: 23,
      totalQuestions: 450,
      correctAnswers: 365,
      averageScore: 84,
      highestScore: 92,
      lowestScore: 76
    };

    const subjectPerformance = [
      { name: 'Reading', score: 85, count: 15, color: '#10B981', status: '우수' },
      { name: 'Writing', score: 88, count: 12, color: '#10B981', status: '우수' },
      { name: 'Math', score: 68, count: 12, color: '#F59E0B', status: '보통' },
      { name: 'Advanced Math', score: 55, count: 8, color: '#EF4444', status: '취약' }
    ];

    const bestSubject = subjectPerformance.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );
    const weakestSubject = subjectPerformance.reduce((prev, current) => 
      (prev.score < current.score) ? prev : current
    );

    const generateReportText = () => {
      return `📊 SAT 학습 리포트 (${new Date().toLocaleDateString('ko-KR')})

📈 학습 횟수 요약
• 모의고사: ${studyStats.mockTests.count}회 (평균 ${studyStats.mockTests.avgScore}점)
• 실전 테스트: ${studyStats.realTests.count}회 (평균 ${studyStats.realTests.avgScore}점)
• 어휘 학습: ${studyStats.vocabulary.count}회
• 전문 훈련: ${studyStats.training.count}회
• 문제 유형: ${studyStats.questionTypes.count}회

🎯 성적 분석
• 평균 점수: ${performanceData.averageScore}점
• 최고 점수: ${performanceData.highestScore}점
• 최저 점수: ${performanceData.lowestScore}점
• 전체 정답률: ${Math.round((performanceData.correctAnswers / performanceData.totalQuestions) * 100)}%
• 푼 문제 수: ${performanceData.totalQuestions}문제
• 맞춘 문제 수: ${performanceData.correctAnswers}문제

📚 영역별 성적
${subjectPerformance.map(subject => 
  `${subject.status === '우수' ? '🟢' : subject.status === '보통' ? '🟡' : '🔴'} ${subject.name}: ${subject.score}% (${subject.count}회) - ${subject.status}`
).join('\n')}

⚠️ 자동 분석
• 우수 영역: ${bestSubject.name} (${bestSubject.score}%) → ${bestSubject.name} 영역에서 뛰어난 실력을 보이고 있습니다!
• 취약 영역: ${weakestSubject.name} (${weakestSubject.score}%) → ${weakestSubject.name} 영역의 집중 학습이 필요합니다.

💡 종합 평가
총 ${performanceData.totalTests}회의 테스트를 통해 꾸준한 학습 습관을 보여주고 있습니다. 평균 정답률 ${Math.round((performanceData.correctAnswers / performanceData.totalQuestions) * 100)}%로 전반적으로 양호한 수준이며, 특히 ${bestSubject.name} 영역에서 강점을 보입니다. ${weakestSubject.name} 영역에 더 집중하면 더욱 균형잡힌 실력 향상이 가능할 것입니다.

💌 학생 메시지
${studentMessage || '(메시지가 없습니다)'}`;
    };

    const handleCopyReport = () => {
      navigator.clipboard.writeText(generateReportText());
      setCopied(true);
      toast.success('리포트가 클립보드에 복사되었습니다!');
      setTimeout(() => setCopied(false), 2000);
    };

    const handleShareEmail = () => {
      const subject = encodeURIComponent('SAT 학습 리포트');
      const body = encodeURIComponent(generateReportText());
      window.open(`mailto:?subject=${subject}&body=${body}`);
    };

    const handleShareSMS = () => {
      const body = encodeURIComponent(generateReportText());
      window.open(`sms:?body=${body}`);
    };

    return (
      <div className="bg-gray-50 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3D5AA1' }}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">학습 리포트</h1>
                  <p className="text-sm text-gray-600">Monthly Progress Report</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">생성일</p>
                <p className="text-base font-semibold text-gray-900">{new Date().toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          </div>

          {/* 📈 학습 횟수 요약 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📈 학습 횟수 요약
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">모의고사</p>
                <p className="text-2xl font-bold text-gray-900">{studyStats.mockTests.count}회</p>
                <p className="text-xs text-gray-600 mt-1">평균 {studyStats.mockTests.avgScore}점</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">실전 테스트</p>
                <p className="text-2xl font-bold text-gray-900">{studyStats.realTests.count}회</p>
                <p className="text-xs text-gray-600 mt-1">평균 {studyStats.realTests.avgScore}점</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">어휘 학습</p>
                <p className="text-2xl font-bold text-gray-900">{studyStats.vocabulary.count}회</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">전문 훈련</p>
                <p className="text-2xl font-bold text-gray-900">{studyStats.training.count}회</p>
              </div>
            </div>
          </div>

          {/* 🎯 성적 분석 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              🎯 성적 분석
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">평균 점수</p>
                <p className="text-2xl font-bold" style={{ color: '#3D5AA1' }}>{performanceData.averageScore}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">최고 점수</p>
                <p className="text-2xl font-bold text-green-600">{performanceData.highestScore}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">최저 점수</p>
                <p className="text-2xl font-bold text-orange-600">{performanceData.lowestScore}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">전체 정답률</p>
                <p className="text-2xl font-bold" style={{ color: '#10B981' }}>
                  {Math.round((performanceData.correctAnswers / performanceData.totalQuestions) * 100)}%
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">푼 문제 수</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.totalQuestions}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">맞춘 문제</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.correctAnswers}</p>
              </div>
            </div>
          </div>

          {/* 📚 영역별 성적 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📚 영역별 성적
            </h2>
            <div className="space-y-4">
              {subjectPerformance.map((subject, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{subject.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ 
                        backgroundColor: subject.color + '20', 
                        color: subject.color 
                      }}>
                        {subject.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold" style={{ color: subject.color }}>{subject.score}%</span>
                      <span className="text-xs text-gray-500 ml-2">({subject.count}회)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${subject.score}%`, 
                        backgroundColor: subject.color 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ⚠️ 자동 분석 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              ⚠️ 자동 분석
            </h2>
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p className="text-sm font-semibold text-green-900 mb-1">
                  우수 영역: {bestSubject.name} ({bestSubject.score}%)
                </p>
                <p className="text-xs text-green-700">
                  {bestSubject.name} 영역에서 뛰어난 실력을 보이고 있습니다!
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm font-semibold text-red-900 mb-1">
                  취약 영역: {weakestSubject.name} ({weakestSubject.score}%)
                </p>
                <p className="text-xs text-red-700">
                  {weakestSubject.name} 영역의 집중 학습이 필요합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 💡 종합 평가 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              💡 종합 평가
            </h2>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                총 <span className="font-bold">{performanceData.totalTests}회</span>의 테스트를 통해 꾸준한 학습 습관을 보여주고 있습니다. 
                평균 정답률 <span className="font-bold">{Math.round((performanceData.correctAnswers / performanceData.totalQuestions) * 100)}%</span>로 
                전반적으로 양호한 수준이며, 특히 <span className="font-bold" style={{ color: bestSubject.color }}>{bestSubject.name}</span> 영역에서 
                강점을 보입니다. <span className="font-bold" style={{ color: weakestSubject.color }}>{weakestSubject.name}</span> 영역에 
                더 집중하면 더욱 균형잡힌 실력 향상이 가능할 것입니다.
              </p>
            </div>
          </div>

          {/* 💌 학생 메시지 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              💌 학생 메시지
            </h2>
            <textarea
              value={studentMessage}
              onChange={(e) => setStudentMessage(e.target.value)}
              placeholder="부모님께 전하고 싶은 메시지를 작성하세요..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
          </div>

          {/* 공유 버튼 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">리포트 공유하기</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={handleCopyReport}
                className="flex items-center justify-center gap-2 py-3"
                style={{ backgroundColor: '#6B7280', color: 'white' }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '복사됨!' : '텍스트 복사'}
              </Button>
              <Button
                onClick={handleShareEmail}
                className="flex items-center justify-center gap-2 py-3"
                style={{ backgroundColor: '#3D5AA1', color: 'white' }}
              >
                <Mail className="w-4 h-4" />
                이메일
              </Button>
              <Button
                onClick={handleShareSMS}
                className="flex items-center justify-center gap-2 py-3"
                style={{ backgroundColor: '#10B981', color: 'white' }}
              >
                <MessageCircle className="w-4 h-4" />
                문자/WeChat
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              💡 한 달에 한 번씩 부모님께 학습 상황을 공유해보세요!
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Helper functions for uploaded files integration
  const getUploadedFilesForSmartPractice = () => {
    return uploadedFiles.filter(file => 
      file && file.location && file.location.includes('스마트 연습') && file.status === 'completed'
    );
  };

  const getUploadedFilesForTraining = () => {
    return uploadedFiles.filter(file => {
      if (!file || !file.status || file.status !== 'completed') return false;
      
      // Check if any question in the file has training classification
      if (Array.isArray(file.data)) {
        // Array of questions - check if at least one has training data
        const hasTrainingData = file.data.some((q: any) => 
          q.trainingCategory || q.trainingType || q.trainingDifficulty || q.trainingSource
        );
        return hasTrainingData;
      } else if (file.data) {
        // Single question - check if it has training data
        const hasTrainingData = file.data.trainingCategory || file.data.trainingType || 
                               file.data.trainingDifficulty || file.data.trainingSource;
        return hasTrainingData;
      }
      
      return false;
    });
  };

  const createPracticeTestFromFile = (file: typeof uploadedFiles[0]) => {
    // Convert uploaded data to the format expected by App.tsx
    const convertToQuestionFormat = (rawData: any) => {
      if (!rawData) return [];
      
      // Handle both single question and array of questions
      const dataArray = Array.isArray(rawData) ? rawData : [rawData];
      
      // Limit to 27 questions per module (total 54 for both modules)
      const limitedData = dataArray.slice(0, 54);
      
      return limitedData.map((item, index) => ({
        id: index + 1,
        title: item.title || `Question ${index + 1}`,
        passage: item.passage || '',
        question: item.question || '',
        choices: item.choices 
          ? item.choices.map((choice: string, i: number) => ({
              id: ['a', 'b', 'c', 'd'][i],
              text: choice
            }))
          : [],
        answer: item.correctAnswer || item.answer || 'a',
        explanation: item.explanation || '',
        category: file.questionType || 'general',
        difficulty: file.difficulty || 'medium'
      }));
    };
    
    return {
      id: `uploaded-${file.id}-${file.name}-${Date.now()}`, // Use unique string ID to avoid duplicates
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
      type: file.subcategory === 'reading-grammar' ? 'Reading' : 
            file.subcategory === 'math' ? 'Math' : '업로드된 자료',
      status: 'available',
      isUploaded: true,
      uploadDate: file.uploadDate,
      fileId: file.id,
      uploadedData: convertToQuestionFormat(file.data), // Convert to proper format
      subcategory: file.subcategory,
      questionType: file.questionType,
      difficulty: file.difficulty
    };
  };
  
  // Extract words from actual test questions
  const allWordsFromTests = extractWordsFromTests();
  
  // Create word lists based on actual test content and user's learned words
  const wordLists = [
    // User's recently learned words from solving problems
    ...(learnedWords.length > 0 ? [{
      id: 0,
      title: "최근 학습한 단어",
      type: "학습완료",
      category: "전체",
      difficulty: "전체",
      wordCount: learnedWords.length,
      mastered: learnedWords.filter(w => w.mastered).length,
      learning: learnedWords.filter(w => !w.mastered).length,
      description: "문제를 풀면서 자동으로 수집된 어휘 목록",
      words: learnedWords.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()),
      sourceTests: [...new Set(learnedWords.map(w => `문제 ${w.questionId}`))]
    }] : []),
    {
      id: 1,
      title: "기출문제 핵심 단어",
      type: "기출문제",
      category: "독해",
      difficulty: "전체",
      wordCount: allWordsFromTests.length,
      mastered: Math.floor(allWordsFromTests.length * 0.6),
      learning: Math.floor(allWordsFromTests.length * 0.4),
      description: "실제 SAT 기출문제에서 추출한 핵심 어휘",
      words: allWordsFromTests,
      sourceTests: ["2025년 6월 제1회", "2025년 6월 제2회", "2025년 6월 제3회"]
    },
    {
      id: 2,
      title: "경제학 지문 단어",
      type: "주제별",
      category: "독해",
      difficulty: "어려움",
      wordCount: 7,
      mastered: 4,
      learning: 3,
      description: "경제학 관련 지문에서 나온 전문 용어",
      words: allWordsFromTests.filter(w => w.questionId === 3),
      sourceTests: ["2025년 6월 제1회"]
    },
    {
      id: 3,
      title: "문학 및 역사 단어",
      type: "주제별",
      category: "독해",
      difficulty: "보통",
      wordCount: 5,
      mastered: 3,
      learning: 2,
      description: "문학과 역사 지문에서 나온 핵심 어휘",
      words: allWordsFromTests.filter(w => w.questionId === 4),
      sourceTests: ["2025년 6월 제2회"]
    },
    {
      id: 4,
      title: "과학 지문 전문 용어",
      type: "주제별",
      category: "독해",
      difficulty: "어려움",
      wordCount: 9,
      mastered: 3,
      learning: 6,
      description: "과학 지문에서 나온 전문 어휘와 기술 용어",
      words: allWordsFromTests.filter(w => w.questionId === 5),
      sourceTests: ["2025년 6월 제3회"]
    },
    {
      id: 5,
      title: "어려운 단어 모음",
      type: "난이도별",
      category: "독해",
      difficulty: "어려움",
      wordCount: allWordsFromTests.filter(w => w.difficulty === '어려움').length,
      mastered: 2,
      learning: allWordsFromTests.filter(w => w.difficulty === '어려움').length - 2,
      description: "고득점을 위한 고난도 어휘 집중 학습",
      words: allWordsFromTests.filter(w => w.difficulty === '어려움'),
      sourceTests: ["기출문제 전체"]
    },
    {
      id: 6,
      title: "복습이 필요한 단어",
      type: "복습",
      category: "전체",
      difficulty: "전체",
      wordCount: learnedWords.filter(w => !w.mastered && w.reviewCount < 3).length || 3,
      mastered: learnedWords.filter(w => w.mastered).length || 1,
      learning: learnedWords.filter(w => !w.mastered).length || 2,
      description: "학습했지만 아직 완전히 익히지 못한 단어들",
      words: learnedWords.length > 0 
        ? learnedWords.filter(w => !w.mastered && w.reviewCount < 3)
        : [
            allWordsFromTests.find(w => w.word === 'autonomous'),
            allWordsFromTests.find(w => w.word === 'hypothesized'),
            allWordsFromTests.find(w => w.word === 'ammonia')
          ].filter(Boolean),
      sourceTests: learnedWords.length > 0 ? ["학습한 문제"] : ["최근 연습"]
    }
  ];

  // Get default practice tests (with fallback to hardcoded values)
  const getDefaultPracticeTests = () => {
    const defaultTests = [
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
    
    // If no uploaded files with practice data, return defaults
    if (uploadedFiles.length === 0) {
      return defaultTests;
    }
    
    // Filter uploadedFiles that are past-exams or official-samples and merge with defaults
    const practiceFiles = uploadedFiles.filter(
      file => file && file.subcategory && file.location &&
              (file.subcategory === 'past-exams' || file.subcategory === 'official-samples') && 
              (file.location === '스마트 연습')
    );
    
    // Create a map of existing default test IDs to avoid duplicates
    const defaultIds = new Set(defaultTests.map(t => t.id));
    
    // Convert uploaded files to test format
    const uploadedTests = practiceFiles.map(file => ({
      id: file.id,
      title: file.name,
      type: file.type,
      status: file.status === 'completed' ? 'available' : 'processing',
      category: file.subcategory,
      data: file.data // Include the actual question data
    }));
    
    // Merge: keep defaults and add uploaded tests that don't conflict
    const mergedTests = [
      ...defaultTests,
      ...uploadedTests.filter(ut => !defaultIds.has(ut.id))
    ];
    
    return mergedTests;
  };

  // Practice tests state - loaded from localStorage
  const [practiceTests, setPracticeTests] = useState<any[]>(() => {
    const stored = loadTestsFromStorage();
    return stored || getDefaultPracticeTests();
  });
  const [practiceTestsLoading, setPracticeTestsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // 초기 로드: Supabase에서 데이터 가져오기
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('🔍 Supabase에서 데이터 로드 시도...');
      const supabaseData = await loadTestsFromSupabase();
      
      if (supabaseData && supabaseData.length > 0) {
        console.log('✅ Supabase에서 데이터 로드 성공:', supabaseData.length, '개');
        setPracticeTests(supabaseData);
        saveTestsToStorage(supabaseData); // localStorage에도 동기화
      } else {
        console.log('📂 localStorage 데이터 사용');
        const localData = loadTestsFromStorage();
        if (localData && localData.length > 0) {
          // localStorage 데이터를 Supabase에 백업
          await saveTestsToSupabase(localData);
        }
      }
      setIsDataLoaded(true);
    };
    
    loadInitialData();
  }, []);

  // Save to localStorage AND Supabase whenever practiceTests changes
  useEffect(() => {
    if (!isDataLoaded) return; // 초기 로드 중에는 저장하지 않음
    
    saveTestsBoth(practiceTests);
  }, [practiceTests, isDataLoaded]);
  
  // Update practiceTests when uploadedFiles changes
  useEffect(() => {
    const updated = getDefaultPracticeTests();
    setPracticeTests(updated);
  }, [uploadedFiles]);

  // Load advertisements from Supabase
  useEffect(() => {
    const loadAdvertisements = async () => {
      try {
        console.log('📡 광고 데이터 로드 시도...');
        const response = await fetchWithTimeout(
          `https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/advertisements`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ 광고 데이터 로드 완료:', data.length, '개');
          if (Array.isArray(data)) {
            setAdvertisements(data);
          }
        } else {
          const errorText = await response.text();
          console.log('⚠️ 광고 로드 실패 (빈 배열 사용):', response.status);
          setAdvertisements([]);
        }
      } catch (error) {
        console.log('⚠️ 광고 로드 에러 (빈 배열 사용):', error instanceof Error ? error.message : String(error));
        setAdvertisements([]);
      }
    };
    
    loadAdvertisements();
  }, []);

  // Sample practice record data with question history
  const practiceRecordData = [
    {
      id: 1,
      testTitle: "2025년 6월 제1회 독해문법",
      date: "2025-01-15",
      score: 85,
      totalQuestions: 27,
      correctAnswers: 23,
      duration: "32분",
      questions: [
        {
          id: 1,
          text: "The concept of sustainability has become increasingly important in modern business practices...",
          options: ["A) environmental", "B) economical", "C) technological", "D) social"],
          correctAnswer: "A",
          userAnswer: "A",
          isCorrect: true,
          difficulty: "중간"
        },
        {
          id: 2,
          text: "Climate change represents one of the most pressing challenges facing humanity today...",
          options: ["A) represents", "B) challenging", "C) humanity", "D) today"],
          correctAnswer: "B",
          userAnswer: "A",
          isCorrect: false,
          difficulty: "어려움"
        },
        {
          id: 3,
          text: "The development of renewable energy sources has accelerated significantly in recent years...",
          options: ["A) development", "B) renewable", "C) accelerated", "D) significantly"],
          correctAnswer: "C",
          userAnswer: "C",
          isCorrect: true,
          difficulty: "쉬움"
        },
        {
          id: 4,
          text: "Economic inequality has been a persistent issue in many developed countries...",
          options: ["A) persistent", "B) issue", "C) developed", "D) countries"],
          correctAnswer: "A",
          userAnswer: "B",
          isCorrect: false,
          difficulty: "중간"
        },
        {
          id: 5,
          text: "Technological innovation continues to reshape the landscape of modern education...",
          options: ["A) innovation", "B) continues", "C) reshape", "D) landscape"],
          correctAnswer: "D",
          userAnswer: "D",
          isCorrect: true,
          difficulty: "중간"
        }
      ]
    },
    {
      id: 2,
      testTitle: "2025년 6월 제2회 수학",
      date: "2025-01-10",
      score: 78,
      totalQuestions: 22,
      correctAnswers: 17,
      duration: "28분",
      questions: [
        {
          id: 1,
          text: "If 2x + 3 = 11, what is the value of x?",
          options: ["A) 2", "B) 3", "C) 4", "D) 5"],
          correctAnswer: "C",
          userAnswer: "B",
          isCorrect: false,
          difficulty: "쉬움"
        }
      ]
    }
  ];

  // Get all words based on filters for word management
  const getAllWords = () => {
    let words: any[] = [];
    
    // Collect words from all wordLists based on filters
    wordLists.forEach(list => {
      // Filter by type (기출문제/공식문제)
      if (wordListType !== '전체' && list.type !== wordListType) return;
      
      // Filter by category (Reading/Math)
      if (wordCategory !== '전체' && list.category !== wordCategory && list.category !== '전체') return;
      
      // Filter by difficulty
      if (wordDifficulty !== '전체' && list.difficulty !== wordDifficulty && list.difficulty !== '전체') return;
      
      // Add words from this list
      if (list.words && Array.isArray(list.words)) {
        words = [...words, ...list.words];
      }
    });
    
    // Remove duplicates based on word text
    const uniqueWords = words.filter((word, index, self) => 
      index === self.findIndex(w => w.word === word.word)
    );
    
    return uniqueWords;
  };

  // Combine original tests with uploaded files for Practice
  const getAllPracticeTests = () => {
    const uploadedSmartPracticeFiles = getUploadedFilesForSmartPractice();
    const uploadedTests = uploadedSmartPracticeFiles.map(createPracticeTestFromFile);
    
    // Create a map of uploaded tests by title for easy lookup
    const uploadedTestsMap = new Map();
    uploadedTests.forEach(test => {
      uploadedTestsMap.set(test.title, test);
    });
    
    // Filter based on current tab (기출문제 or 공식문제)
    const filteredUploaded = uploadedTests.filter(test => {
      if (smartPracticeTab === '기출문제') {
        return uploadedSmartPracticeFiles.find(f => f.id === test.fileId)?.subcategory === 'past-exams';
      } else if (smartPracticeTab === '공식문제') {
        return uploadedSmartPracticeFiles.find(f => f.id === test.fileId)?.subcategory === 'official-samples';
      }
      return true;
    });
    
    // Filter by subject for uploaded tests
    const subjectFilteredUploaded = filteredUploaded.filter(test => {
      if (smartPracticeSubject === '전체') return true;
      return test.type === smartPracticeSubject;
    });
    
    // Filter by subject and category for original practice tests from Supabase
    // Replace original tests with uploaded versions if they exist (same title)
    const subjectFilteredOriginal = practiceTests
      .filter(test => {
        // Filter by tab (기출문제 or 공식문제)
        if (smartPracticeTab === '기출문제' && test.category !== 'past-exams') return false;
        if (smartPracticeTab === '공식문제' && test.category !== 'official-samples') return false;
        
        // Filter by subject
        if (smartPracticeSubject === '전체') return true;
        return test.type === smartPracticeSubject;
      })
      .map(test => {
        // If an uploaded version exists with the same title, use that instead
        const uploadedVersion = uploadedTestsMap.get(test.title);
        if (uploadedVersion) {
          return uploadedVersion;
        }
        return test;
      });
    
    // Only add uploaded tests that don't have matching titles in original tests
    const originalTitles = new Set(practiceTests.map(t => t.title));
    const uniqueUploadedTests = subjectFilteredUploaded.filter(
      test => !originalTitles.has(test.title)
    );
    
    const combined = [...subjectFilteredOriginal, ...uniqueUploadedTests];
    
    // Sort by date (newest first) - extract year and month from title
    const sortedTests = combined.sort((a, b) => {
      // Extract year and month from title
      // Format examples: "2026년 3월 제1회 독해문법", "2025년 12월 제2회 수학"
      const extractDate = (title: string) => {
        const match = title.match(/(\d{4})년\s*(\d{1,2})월/);
        if (match) {
          const year = parseInt(match[1]);
          const month = parseInt(match[2]);
          return year * 100 + month; // e.g., 2026년 3월 -> 202603
        }
        return 0; // No date found, push to end
      };
      
      const dateA = extractDate(a.title);
      const dateB = extractDate(b.title);
      
      return dateB - dateA; // Descending order (newest first)
    });
    
    return sortedTests;
  };

  const allTests = getAllPracticeTests();
  const totalPages = Math.ceil(allTests.length / testsPerPage);
  const startIndex = (currentPage - 1) * testsPerPage;
  const currentTests = allTests.slice(startIndex, startIndex + testsPerPage);
  
  // Word list pagination
  const totalWordPages = Math.ceil(wordLists.length / testsPerPage);
  const currentWordLists = wordLists.slice(startIndex, startIndex + testsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const renderHomeContent = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner with decorative circles */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#1e3a8a' }}>
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: '#60a5fa' }}></div>
        <div className="absolute bottom-10 right-20 w-40 h-40 rounded-full opacity-15" style={{ backgroundColor: '#60a5fa' }}></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: '#60a5fa' }}></div>
        <div className="absolute top-20 right-1/4 w-20 h-20 rounded-full opacity-15" style={{ backgroundColor: 'white' }}></div>
        <div className="absolute bottom-16 left-1/3 w-16 h-16 rounded-full opacity-10" style={{ backgroundColor: 'white' }}></div>
        
        <div className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
          <h1 className="text-5xl font-bold text-white mb-4">
            SAT Preparation
          </h1>
          <p className="text-xl text-white opacity-90">
            Your Path to Success
          </p>
        </div>
      </div>

      {/* Test Sets Filter */}
      <div className="max-w-7xl mx-auto px-6 mt-10 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-lg font-semibold text-gray-800">Test Sets:</span>
          <div className="flex gap-2">
            {['1-4', '5-8', '9-12', '13-16', '17-20'].map((range, idx) => (
              <button
                key={range}
                className={`px-5 py-2 rounded-md font-medium transition-colors ${
                  idx === 0 
                    ? 'text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                style={idx === 0 ? { backgroundColor: '#3b82f6' } : {}}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              {/* Card Header */}
              <div className="p-4 text-white font-bold text-lg" style={{ backgroundColor: '#1e40af' }}>
                TPO {num}
              </div>
              
              {/* Card Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-800">Reading</span>
                  <Button 
                    className="px-4 py-1.5 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={() => onStartTest({ 
                      title: `SAT Practice Test ${num} - Reading`, 
                      type: "Reading & Writing", 
                      source: "Homepage",
                      date: new Date().toISOString().split('T')[0] 
                    })}
                  >
                    Start Test
                  </Button>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-800">Listening</span>
                  <Button 
                    className="px-4 py-1.5 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={() => onStartTest({ 
                      title: `SAT Practice Test ${num} - Listening`, 
                      type: "Listening", 
                      source: "Homepage",
                      date: new Date().toISOString().split('T')[0] 
                    })}
                  >
                    Start Test
                  </Button>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <span className="font-medium text-gray-800">Writing</span>
                  <Button 
                    className="px-4 py-1.5 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={() => onStartTest({ 
                      title: `SAT Practice Test ${num} - Writing`, 
                      type: "Writing", 
                      source: "Homepage",
                      date: new Date().toISOString().split('T')[0] 
                    })}
                  >
                    Start Test
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-4">
          <span className="text-red-500 font-bold">Study Guide &gt;&gt;</span>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            title="FOR LEARNERS"
            description="실제 기출문제에서 추출한 핵심 단어 학습과 맞춤형 문제 연습을 제공합니다."
            icon={BookOpen}
            color="#F5F5F5"
            hoverColor="#B3E5FC"
            iconColor="#3b5998"
            index={0}
            onClick={() => setActiveTab('스마트 연습')}
          />

          <FeatureCard
            title="FOR INSTITUTIONS"
            description="전문 강사진의 고품질 강의를 통해 점수를 향상시키세요."
            icon={Target}
            color="#F5F5F5"
            hoverColor="#FFE0B2"
            iconColor="#3b5998"
            index={1}
            onClick={() => setActiveTab('강의 및 특강')}
          />
          
          <FeatureCard
            title="FOR TEACHERS"
            description="체계적인 전문 훈련 프로그램으로 실력을 한 단계 높이세요."
            icon={BookmarkPlus}
            color="#F5F5F5"
            hoverColor="#D1C4E9"
            iconColor="#3b5998"
            index={2}
            onClick={() => setActiveTab('전문 훈련')}
          />

          <FeatureCard
            title="FOR ADVISORS"
            description="학습 진행 상황을 추적하고 성과를 분석하세요."
            icon={BarChart3}
            color="#F5F5F5"
            hoverColor="#C8E6C9"
            iconColor="#3b5998"
            index={3}
            onClick={() => setActiveTab('연습 기록')}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Study Hub Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#00bcd4' }}>
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg text-gray-900 font-bold">AllMyExam-<span style={{ color: '#00bcd4' }}>SAT</span></h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Empowering learners worldwide with personalized education.
              </p>
            </div>

            {/* Courses */}
            <div>
              <h4 className="text-sm text-gray-900 mb-4">Courses</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2B478B'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Math</a></li>
                <li><a href="#" className="text-sm text-gray-600 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2B478B'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Science</a></li>
                <li><a href="#" className="text-sm text-gray-600 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2B478B'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>English</a></li>
                <li><a href="#" className="text-sm text-gray-600 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2B478B'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Korean</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2B478B'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-600 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2B478B'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Contact Us</a></li>
                <li><a href="#" className="text-sm text-gray-600 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2B478B'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Community</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2B478B'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>About</a></li>
                <li><a href="#" className="text-sm text-gray-600 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2B478B'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Careers</a></li>
                <li><a href="#" className="text-sm text-gray-600 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2B478B'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>Privacy</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              © 2025 AllMyExam-SAT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );

  const renderSmartPracticeContent = () => {
    const handleStartTest = () => {
      onStartTest();
    };

    const uploadedCount = getUploadedFilesForSmartPractice().length;
    
    // Banner Component
    const Banner = () => (
      <div className="mb-6">
        <img 
          src={satBannerImage} 
          alt="SAT Preparation - Your Path to Success" 
          className="w-full h-auto rounded-lg shadow-sm"
        />
      </div>
    );

    // Filter word lists based on selected filters for word management tab
    const filteredWordLists = smartPracticeTab === '단어관리' 
      ? (() => {
          // Combine viewedWordLists and wordLists, removing duplicates
          const combined = [...viewedWordLists, ...wordLists];
          const uniqueList = combined.filter((wordList, index, self) =>
            index === self.findIndex(w => w.id === wordList.id)
          );
          
          // Apply filters
          return uniqueList.filter(wordList => {
            let matches = true;
            
            if (wordListType !== '전체' && wordList.type !== wordListType) matches = false;
            if (wordCategory !== '전체' && wordList.category !== wordCategory && wordList.category !== '전체') matches = false;
            if (wordDifficulty !== '전체' && wordList.difficulty !== wordDifficulty && wordList.difficulty !== '전체') matches = false;
            
            return matches;
          });
        })()
      : [];

    // Word study functions
    const handleWordListSelect = (wordList: any) => {
      setSelectedWordList(wordList);
      setCurrentWordIndex(0);
      setWordStudyMode('list');
    };

    const handleStartFlashcard = (wordList: any) => {
      setSelectedWordList(wordList);
      setCurrentWordIndex(0);
      setWordStudyMode('flashcard');
      setIsFlashcardFlipped(false);
    };

    const handleStartWordTest = (wordList: any) => {
      setSelectedWordList(wordList);
      setCurrentWordIndex(0);
      setWordStudyMode('test');
      setTestAnswers({});
      setShowTestResult({});
    };

    // Download functions
    const handleDownloadQuestions = (type: 'questions' | 'answers' | 'both') => {
      if (!selectedWordList || !selectedWordList.words) return;
      
      const today = new Date();
      const dateString = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;
      const totalCount = selectedWordList.words.length;
      
      // Using imported generateTableRows function from utils
      
      if (type === "questions") {
        // 시험지 다운로드 - SAT VOCA 양식
        const htmlContent = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta charset="utf-8">
            <title>${selectedWordList.title} - 시험지</title>
            <style>
              @page {
                size: A4;
                margin: 2cm 1.5cm;
              }
              body {
                font-family: "Malgun Gothic", sans-serif;
                padding: 20px;
              }
            </style>
          </head>
          <body>
            <div style="font-size: 9pt; margin-bottom: 15px; display: flex; justify-content: space-between;">
              <span>${dateString} 오후 3:08</span>
              <span style="flex: 1; text-align: center; font-weight: bold; font-size: 11pt;">SAT 어휘 시험지</span>
            </div>
            
            <div style="border-top: 3px solid #000; margin-bottom: 20px;"></div>
            
            <div style="margin-bottom: 20px; padding: 10px 0; border-top: 1px solid #000; border-bottom: 1px solid #000;">
              <table style="width: 100%; font-size: 11pt;">
                <tr>
                  <td style="width: 20%;">${dateString}</td>
                  <td style="width: 30%; text-align: center;">
                    <span style="display: inline-block; border: 1px solid #000; border-radius: 15px; padding: 2px 15px; margin: 0 10px;">이름</span>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 150px;"></span>
                  </td>
                  <td style="width: 50%; text-align: right;">
                    <span style="display: inline-block; border: 1px solid #000; border-radius: 15px; padding: 2px 15px; margin: 0 10px;">맞은개수</span>
                    <span>/ ${totalCount}</span>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 150px; margin-left: 10px;"></span>
                  </td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin-bottom: 20px; font-size: 10pt; padding: 10px 0;">
              (1~${totalCount}) ※ 알맞은 영어 단어의 한글 뜻을 적으세요.
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              ${generateTableRows(selectedWordList.words, false)}
            </table>
            
            <div style="font-size: 8pt; color: #666; display: flex; justify-content: space-between; margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd;">
              <span>about-blank</span>
              <span>1/2</span>
            </div>
          </body>
          </html>
        `;
        const blob = new Blob(["\ufeff", htmlContent], { type: "application/msword" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${selectedWordList.title}_시험지.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("시험지가 다운로드되었습니다!");
      } else if (type === "answers") {
        // 답안지 다운로드 - SAT VOCA 양식 (정답 포함)
        const htmlContent = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta charset="utf-8">
            <title>${selectedWordList.title} - 답안지</title>
            <style>
              @page {
                size: A4;
                margin: 2cm 1.5cm;
              }
              body {
                font-family: "Malgun Gothic", sans-serif;
                padding: 20px;
              }
            </style>
          </head>
          <body>
            <div style="font-size: 9pt; margin-bottom: 15px; display: flex; justify-content: space-between;">
              <span>${dateString} 오후 3:08</span>
              <span style="flex: 1; text-align: center; font-weight: bold; font-size: 11pt;">SAT 어휘 답안지</span>
            </div>
            
            <div style="border-top: 3px solid #000; margin-bottom: 20px;"></div>
            
            <div style="margin-bottom: 20px; padding: 10px 0; border-top: 1px solid #000; border-bottom: 1px solid #000;">
              <table style="width: 100%; font-size: 11pt;">
                <tr>
                  <td style="width: 20%;">${dateString}</td>
                  <td style="width: 30%; text-align: center;">
                    <span style="display: inline-block; border: 1px solid #000; border-radius: 15px; padding: 2px 15px; margin: 0 10px;">이름</span>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 150px;"></span>
                  </td>
                  <td style="width: 50%; text-align: right;">
                    <span style="display: inline-block; border: 1px solid #000; border-radius: 15px; padding: 2px 15px; margin: 0 10px;">맞은개수</span>
                    <span>/ ${totalCount}</span>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 150px; margin-left: 10px;"></span>
                  </td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin-bottom: 20px; font-size: 10pt; padding: 10px 0; color: red; font-weight: bold;">
              ※ 정답이 빨간색으로 표시되어 있습니다.
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              ${generateTableRows(selectedWordList.words, true)}
            </table>
            
            <div style="font-size: 8pt; color: #666; display: flex; justify-content: space-between; margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd;">
              <span>about-blank</span>
              <span>2/2</span>
            </div>
          </body>
          </html>
        `;
        const blob = new Blob(["\ufeff", htmlContent], { type: "application/msword" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${selectedWordList.title}_답안지.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("답안지가 다운로드되었습니다!");
      } else {
        // 시험지와 답안지 전체 다운로드 - PDF (인쇄 대화상자)
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          toast.error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
          setShowDownloadDialog(false);
          return;
        }
        
        const half = Math.ceil(totalCount / 2);
        let testRows = '';
        let answerRows = '';
        for (let i = 0; i < half; i++) {
          const lw = selectedWordList.words[i];
          const rw = i + half < totalCount ? selectedWordList.words[i + half] : null;
          testRows += `<tr><td class="num">${i+1}</td><td class="word">${lw?.word||''}</td><td class="blank"></td>`;
          testRows += rw ? `<td class="num">${i+half+1}</td><td class="word">${rw.word||''}</td><td class="blank"></td></tr>` : `<td></td><td></td><td></td></tr>`;
          answerRows += `<tr><td class="num">${i+1}</td><td class="word">${lw?.word||''}</td><td class="def">${lw?.definition||''}</td>`;
          answerRows += rw ? `<td class="num">${i+half+1}</td><td class="word">${rw.word||''}</td><td class="def">${rw.definition||''}</td></tr>` : `<td></td><td></td><td></td></tr>`;
        }
        
        printWindow.document.write(`<html><head><meta charset="utf-8"><title>${selectedWordList.title}</title>
          <style>
            @page{size:A4;margin:1.5cm 1.2cm}
            @media print{.page-break{page-break-before:always}}
            body{font-family:"Malgun Gothic","Apple SD Gothic Neo",sans-serif;padding:20px;margin:0}
            .hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
            .date{font-size:9pt;color:#666}
            .badge{font-size:9pt;background:#f97316;color:#fff;padding:2px 10px;border-radius:3px;font-weight:700;font-style:italic}
            .bar{width:4px;background:#ef4444;display:inline-block;height:20px;vertical-align:middle;margin-right:8px}
            .stitle{font-size:10pt;text-align:center;color:#333;padding:8px 0;margin-bottom:12px}
            .stitle.ans{color:#f97316}
            hr{border:none;border-top:1px solid #ddd;margin:8px 0}
            table{width:100%;border-collapse:collapse}
            td{padding:6px 10px;font-size:10pt;border-bottom:1px solid #eee;vertical-align:top}
            .num{width:30px;color:#999;text-align:right;padding-right:12px}
            .word{font-weight:600}
            .def{color:#f97316}
            .blank{width:40%}
          </style></head><body>
          <div class="hdr"><span class="date">${dateString}</span></div><hr>
          <div class="stitle"><span class="bar"></span>(1~${totalCount}) ※ 알맞은 영어 단어의 한글 뜻을 적으세요.</div>
          <table>${testRows}</table>
          <div class="page-break"></div>
          <div class="hdr"><span class="date">${dateString}</span><span class="badge">ANSWER KEY</span></div><hr>
          <div class="stitle ans"><span class="bar"></span>(1~${totalCount}) ※ 답안지 — 정답 확인용</div>
          <table>${answerRows}</table>
          </body></html>`);
        printWindow.document.close();
        printWindow.onload = () => { printWindow.print(); };
        toast.success("PDF 인쇄 대화상자가 열렸습니다!");
      }
      setShowDownloadDialog(false);
    };

    const handleBackToWordLists = () => {
      // Save to viewedWordLists (단어목록) - for any mode
      if (selectedWordList) {
        const alreadyViewed = viewedWordLists.some(list => list.id === selectedWordList.id);
        
        if (!alreadyViewed) {
          const viewedList = {
            ...selectedWordList,
            viewedDate: new Date().toLocaleDateString('ko-KR'),
            wordCount: selectedWordList.words.length,
            mastered: wordStudyMode === 'test' ? Object.values(showTestResult).filter(result => result === true).length : 0,
            learning: selectedWordList.words.length - (wordStudyMode === 'test' ? Object.values(showTestResult).filter(result => result === true).length : 0)
          };
          
          setViewedWordLists(prev => [viewedList, ...prev]);
        }
      }
      
      // Save completed test if it was a test mode and has answers
      if (selectedWordList && wordStudyMode === 'test' && Object.keys(testAnswers).length > 0) {
        const testId = selectedWordList.id;
        
        // Check if this test is not already in completedWordTests
        const alreadyCompleted = completedWordTests.some(test => test.id === testId);
        
        if (!alreadyCompleted) {
          const completedTest = {
            id: testId,
            title: selectedWordList.title,
            description: selectedWordList.description,
            completedDate: new Date().toLocaleDateString('ko-KR'),
            totalQuestions: selectedWordList.words.length,
            answeredQuestions: Object.keys(testAnswers).length,
            correctAnswers: Object.values(showTestResult).filter(result => result === true).length,
            type: selectedWordList.type,
            category: selectedWordList.category,
            difficulty: selectedWordList.difficulty
          };
          
          setCompletedWordTests(prev => [completedTest, ...prev]);
        }
      }
      
      setSelectedWordList(null);
      setWordStudyMode('browse');
      setShowWordBrowseView(true);
      setCurrentWordIndex(0);
      setTestAnswers({});
      setShowTestResult({});
      setIncorrectQuestions([]);
    };

    const handleNextWord = () => {
      if (selectedWordList && currentWordIndex < selectedWordList.words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setIsFlashcardFlipped(false);
        setSubjectiveAnswer('');
      }
    };

    const handlePrevWord = () => {
      if (currentWordIndex > 0) {
        setCurrentWordIndex(currentWordIndex - 1);
        setIsFlashcardFlipped(false);
      }
    };

    const generateTestOptions = (correctAnswer: string, allWords: any[], seed: number) => {
      // For test mode, we show definition and ask for the word
      // correctAnswer is the definition, we need to return words as options
      const currentWord = allWords.find(w => w.definition === correctAnswer);
      
      // Seeded random function for consistent ordering per question
      const seededRandom = (index: number) => {
        const x = Math.sin(seed * 9999 + index * 1234) * 10000;
        return x - Math.floor(x);
      };
      
      const incorrectOptions = allWords
        .filter(w => w.word !== currentWord?.word)
        .map((w, idx) => ({ word: w.word, sortKey: seededRandom(idx) }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .slice(0, 3)
        .map(item => item.word);
      
      const allOptions = [currentWord?.word, ...incorrectOptions];
      const sortedOptions = allOptions
        .map((opt, idx) => ({ word: opt, sortKey: seededRandom(idx + 100) }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(item => item.word);
      
      return sortedOptions;
    };

    const handleTestAnswer = (questionIndex: number, answer: string, correctAnswer: string) => {
      setTestAnswers(prev => ({ ...prev, [questionIndex]: answer }));
      setShowTestResult(prev => ({ ...prev, [questionIndex]: true }));
      
      // Track incorrect answers
      if (answer !== correctAnswer) {
        setIncorrectQuestions(prev => {
          if (!prev.includes(questionIndex)) {
            return [...prev, questionIndex];
          }
          return prev;
        });
      }
      
      // Play sound based on answer correctness
      try {
        if (answer === correctAnswer) {
          // Correct answer - "슥싹" check mark sound
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          // Create a quick swoosh sound followed by a light tap
          // First swoosh (슥)
          const swooshOsc = audioContext.createOscillator();
          const swooshGain = audioContext.createGain();
          const swooshFilter = audioContext.createBiquadFilter();
          
          swooshOsc.connect(swooshFilter);
          swooshFilter.connect(swooshGain);
          swooshGain.connect(audioContext.destination);
          
          swooshOsc.type = 'sawtooth';
          swooshFilter.type = 'highpass';
          swooshFilter.frequency.value = 1000;
          
          // Quick frequency drop for swoosh effect
          swooshOsc.frequency.setValueAtTime(2000, audioContext.currentTime);
          swooshOsc.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.08);
          
          swooshGain.gain.setValueAtTime(0.1, audioContext.currentTime);
          swooshGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
          
          swooshOsc.start(audioContext.currentTime);
          swooshOsc.stop(audioContext.currentTime + 0.08);
          
          // Second tap (싹)
          const tapOsc = audioContext.createOscillator();
          const tapGain = audioContext.createGain();
          
          tapOsc.connect(tapGain);
          tapGain.connect(audioContext.destination);
          
          tapOsc.type = 'sine';
          tapOsc.frequency.value = 1200;
          
          const tapStart = audioContext.currentTime + 0.06;
          tapGain.gain.setValueAtTime(0.12, tapStart);
          tapGain.gain.exponentialRampToValueAtTime(0.01, tapStart + 0.05);
          
          tapOsc.start(tapStart);
          tapOsc.stop(tapStart + 0.05);
        } else {
          // Wrong answer - electric zap sound
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          // Create electric zapping sound with noise
          const bufferSize = audioContext.sampleRate * 0.15;
          const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
          const data = buffer.getChannelData(0);
          
          // Generate noisy electric sound
          for (let i = 0; i < bufferSize; i++) {
            const randomValue = Math.random() * 2 - 1;
            const decay = 1 - (i / bufferSize);
            data[i] = randomValue * decay * 0.3;
          }
          
          const noiseSource = audioContext.createBufferSource();
          noiseSource.buffer = buffer;
          
          const noiseFilter = audioContext.createBiquadFilter();
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.value = 800;
          noiseFilter.Q.value = 5;
          
          const noiseGain = audioContext.createGain();
          noiseGain.gain.setValueAtTime(0.25, audioContext.currentTime);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          
          noiseSource.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(audioContext.destination);
          
          noiseSource.start(audioContext.currentTime);
          
          // Add buzzing oscillator for electric feel
          const buzzOsc = audioContext.createOscillator();
          const buzzGain = audioContext.createGain();
          
          buzzOsc.type = 'square';
          buzzOsc.frequency.setValueAtTime(120, audioContext.currentTime);
          buzzOsc.frequency.linearRampToValueAtTime(80, audioContext.currentTime + 0.15);
          
          buzzGain.gain.setValueAtTime(0.15, audioContext.currentTime);
          buzzGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          
          buzzOsc.connect(buzzGain);
          buzzGain.connect(audioContext.destination);
          
          buzzOsc.start(audioContext.currentTime);
          buzzOsc.stop(audioContext.currentTime + 0.15);
        }
      } catch (error) {
        console.log('Audio playback failed:', error);
      }
    };

    const handleRetryQuestion = (questionIndex: number) => {
      // Reset the question to be answered again
      setTestAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[questionIndex];
        return newAnswers;
      });
      setShowTestResult(prev => {
        const newResults = { ...prev };
        delete newResults[questionIndex];
        return newResults;
      });
      setSubjectiveAnswer('');
    };

    return (
      return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* 상단 배너 (광고) */}
        <div className="mb-6">
          <AdBannerDisplay advertisements={advertisements} location="practice" />
        </div>

        {/* 1. 제목 영역 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">스마트 연습</h1>
          <p className="text-gray-500">AI가 분석한 개인 취약점을 바탕으로 맞춤형 문제를 제공합니다.</p>
        </div>

        {/* 2. 메인 탭 영역 */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm inline-flex border border-gray-100">
            {['기출문제', '공식문제', '단어관리', 'SAT VOCA'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSmartPracticeTab(tab)}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  smartPracticeTab === tab
                    ? 'bg-[#425486] text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 3. 필터 영역 (단어관리가 아닐 때만 표시) */}
        {smartPracticeTab !== 'SAT VOCA' && smartPracticeTab !== '단어관리' && (
          <div className="bg-white rounded-3xl p-8 mb-10 shadow-sm border border-gray-100">
            {/* 과목 필터 */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#425486] rounded-full"></div>
                <span className="text-sm font-bold text-gray-700">과목</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {['전체', 'Reading', 'Math'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setSmartPracticeSubject(item)}
                    className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                      smartPracticeSubject === item
                        ? 'bg-[#425486] text-white border-[#425486] shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#425486] hover:text-[#425486]'
                    }`}
                  >
                    {item === 'Reading' ? '독해문법' : item === 'Math' ? '수학' : item}
                  </button>
                ))}
              </div>
            </div>

            {/* 정렬 필터 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#425486] rounded-full"></div>
                <span className="text-sm font-bold text-gray-700">정렬</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {['시간순 정렬', '모의고사 연습 적합', '보충 연습 적합'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setPracticeOrder(item)}
                    className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                      practiceOrder === item
                        ? 'bg-[#425486] text-white border-[#425486] shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#425486] hover:text-[#425486]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

          {/* Word Management Filters */}
          {smartPracticeTab === '단어관리' && !selectedWordList && !showWordBrowseView && (
            <>
              {/* 단어 유형 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-800 mb-3">단어 유형:</h3>
                <div className="flex flex-wrap gap-2">
                  {['���체', '기출문제', '공식문제'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setWordListType(type)}
                      className="px-6 py-2.5 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: wordListType === type ? '#3D5AA1' : 'white',
                        color: wordListType === type ? 'white' : '#374151',
                        border: `1px solid ${wordListType === type ? '#3D5AA1' : '#D1D5DB'}`
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 카테고리 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-800 mb-3">카테고리:</h3>
                <div className="flex flex-wrap gap-2">
                  {['전체', 'Reading', 'Math'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setWordCategory(category)}
                      className="px-6 py-2.5 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: wordCategory === category ? '#3D5AA1' : 'white',
                        color: wordCategory === category ? 'white' : '#374151',
                        border: `1px solid ${wordCategory === category ? '#3D5AA1' : '#D1D5DB'}`
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* 난이도 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-800 mb-3">난이도:</h3>
                <div className="flex flex-wrap gap-2">
                  {['전체', '쉬움', '보통', '어려움'].map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setWordDifficulty(difficulty)}
                      className="px-6 py-2.5 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: wordDifficulty === difficulty ? '#3D5AA1' : 'white',
                        color: wordDifficulty === difficulty ? 'white' : '#374151',
                        border: `1px solid ${wordDifficulty === difficulty ? '#3D5AA1' : '#D1D5DB'}`
                      }}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              {/* 문항수 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-800 mb-3">문항수:</h3>
                <div className="flex flex-wrap gap-2">
                  {['10', '30', '50', '100'].map((count) => (
                    <button
                      key={count}
                      onClick={() => setWordQuestionCount(count)}
                      className="px-6 py-2.5 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: wordQuestionCount === count ? '#3D5AA1' : 'white',
                        color: wordQuestionCount === count ? 'white' : '#374151',
                        border: `1px solid ${wordQuestionCount === count ? '#3D5AA1' : '#D1D5DB'}`
                      }}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* 연습 유형 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-800 mb-3">연습 유형:</h3>
                <div className="flex flex-wrap gap-2">
                  {['전체', '미연습', '한 번 틀린 문제', '두 번 이상 틀린 문제'].map((attempt) => (
                    <button
                      key={attempt}
                      onClick={() => setWordAttemptFilter(attempt)}
                      className="px-6 py-2.5 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: wordAttemptFilter === attempt ? '#3D5AA1' : 'white',
                        color: wordAttemptFilter === attempt ? 'white' : '#374151',
                        border: `1px solid ${wordAttemptFilter === attempt ? '#3D5AA1' : '#D1D5DB'}`
                      }}
                    >
                      {attempt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    // Create a new word study session with timestamp
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, "0");
                    const day = String(now.getDate()).padStart(2, "0");
                    const hours = String(now.getHours()).padStart(2, "0");
                    const minutes = String(now.getMinutes()).padStart(2, "0");
                    const mobileTimestamp = `${month}.${day} ${hours}:${minutes}`;
                    const desktopTimestamp = `${year}.${month}.${day} ${hours}:${minutes}`;
                    
                    const newSession = {
                      id: `session-${Date.now()}`,
                      title: `단어 학습`,
                      mobileTimestamp,
                      desktopTimestamp,
                      description: `${wordListType} - ${wordCategory} - ${wordDifficulty}`,
                      category: wordCategory,
                      difficulty: wordDifficulty,
                      type: wordListType,
                      createdAt: now.toISOString(),
                      attemptCount: 0,
                      filters: {
                        type: wordListType,
                        category: wordCategory,
                        difficulty: wordDifficulty,
                        questionCount: wordQuestionCount,
                        attemptFilter: wordAttemptFilter
                      }
                    };
                    
                    // Add to viewed word lists
                    setViewedWordLists(prev => [newSession, ...prev]);
                    
                    // Show browse view with session list
                    setShowWordBrowseView(true);
                    setWordStudyMode('browse');
                  }}
                  className="px-8 sm:px-16 py-3 text-sm text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#3D5AA1' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2B478B'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3D5AA1'}
                >
                  시작
                </button>
              </div>
            </>
          )}

          {/* Content Area */}
          {smartPracticeTab === 'SAT VOCA' ? (
            <SATVocaPage />
          ) : smartPracticeTab === '단어관리' ? (
            // Word Management Content
            showWordBrowseView ? (
              // Browse Mode - Show word study session list
              <div className="space-y-6">
                {/* Back to normal view button */}
                <div className="flex items-start sm:items-center justify-between mb-4 gap-2">
                  <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <Button
                      onClick={() => {
                        setShowWordBrowseView(false);
                        setWordStudyMode('list');
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 text-xs sm:text-sm"
                    >
                      ←
                    </Button>
                    <h2 className="text-sm sm:text-xl font-medium text-gray-800 leading-tight">
                      단어 목록 <span className="text-gray-500 text-xs sm:text-base">({wordListType} · {wordCategory} · {wordDifficulty})</span>
                    </h2>
                  </div>
                </div>

                {/* Word Study Sessions List */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">목록보기</h3>
                  <div className="space-y-3">
                    {viewedWordLists.length > 0 ? (
                      <>
                        {(() => {
                          const itemsPerPage = 5;
                          const totalPages = Math.ceil(viewedWordLists.length / itemsPerPage);
                          const startIndex = (wordListPage - 1) * itemsPerPage;
                          const endIndex = startIndex + itemsPerPage;
                          const currentItems = viewedWordLists.slice(startIndex, endIndex);
                          
                          return (
                            <>
                              {currentItems.map((session: any) => (
                                <div key={session.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                                  <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4">
                                    <div className="flex-1 cursor-pointer"
                                      onClick={() => {
                                        // Select this session to view its words
                                        const filteredWords = getAllWords();
                                        const selectedCount = parseInt(session.filters?.questionCount || '10');
                                        const wordsToShow = filteredWords.slice(0, selectedCount);
                                        
                                        setSelectedWordList({
                                          ...session,
                                          words: wordsToShow
                                        });
                                        setShowWordBrowseView(false);
                                        setWordStudyMode('list');
                                      }}
                                    >
                                      <div className="flex items-start sm:items-center justify-between gap-2 mb-1.5">
                                        <h4 className="text-sm sm:text-base font-medium text-gray-800 flex-1 min-w-0" style={{ wordBreak: 'keep-all' }}>
                                          {session.title}
                                        </h4>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                          <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-blue-100 text-blue-600 whitespace-nowrap">
                                            {session.type}
                                          </span>
                                          {!session.attemptCount || session.attemptCount === 0 ? (
                                            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-green-100 text-green-600 font-medium whitespace-nowrap">
                                              new
                                            </span>
                                          ) : (
                                            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-gray-100 text-gray-600 font-medium whitespace-nowrap">
                                              {session.attemptCount}회
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-500 mb-1 line-clamp-1">{session.description}</p>
                                      <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-600 flex-wrap">
                                        <span className="hidden sm:inline">생성일: {new Date(session.createdAt).toLocaleDateString('ko-KR')}</span>
                                        {session.filters && (
                                          <span>문항수: {session.filters.questionCount}개</span>
                                        )}
                                      </div>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const filteredWords = getAllWords();
                                          const selectedCount = parseInt(session.filters?.questionCount || '10');
                                          const wordsToShow = filteredWords.slice(0, selectedCount);
                                          
                                          setSelectedWordList({
                                            ...session,
                                            words: wordsToShow
                                          });
                                          setShowWordBrowseView(false);
                                          setWordStudyMode('test');
                                          setCurrentWordIndex(0);
                                          setTestAnswers({});
                                          setShowTestResult({});
                                        }}
                                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm text-white rounded-md transition-colors whitespace-nowrap"
                                        style={{ backgroundColor: '#2B478B' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F3666'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2B478B'}
                                      >
                                        테스트 시작
                                      </Button>
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm(`"${session.title}" 목록을 삭제하시겠습니까?`)) {
                                            setViewedWordLists(prev => prev.filter(s => s.id !== session.id));
                                            toast.success('단어 목록이 삭제되었습니다.');
                                          }
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-300 hover:bg-red-50 flex-shrink-0"
                                      >
                                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Pagination */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200">
                                  <Button
                                    onClick={() => setWordListPage(prev => Math.max(1, prev - 1))}
                                    disabled={wordListPage === 1}
                                    variant="outline"
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </Button>
                                  
                                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <Button
                                      key={page}
                                      onClick={() => setWordListPage(page)}
                                      variant={wordListPage === page ? "default" : "outline"}
                                      size="sm"
                                      className="w-8 h-8 p-0"
                                      style={wordListPage === page ? { backgroundColor: '#2B478B' } : {}}
                                    >
                                      {page}
                                    </Button>
                                  ))}
                                  
                                  <Button
                                    onClick={() => setWordListPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={wordListPage === totalPages}
                                    variant="outline"
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <BookmarkPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-500 mb-2">
                          학습한 단어 목록이 없습니다
                        </h4>
                        <p className="text-sm text-gray-400">
                          Start 버튼을 눌러 단어 학습을 시작하세요.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Completed Tests Section */}
                {completedWordTests.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
                    <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">완료한 테스트</h3>
                    <div className="space-y-3">
                      {completedWordTests.map((test: any, index: number) => (
                        <div key={`completed-${test.id}-${index}`} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="text-sm sm:text-base font-medium text-gray-800" style={{ wordBreak: 'keep-all' }}>{test.title}</h4>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Button
                                onClick={() => {
                                  const filteredWords = getAllWords();
                                  setSelectedWordList({
                                    ...test,
                                    words: filteredWords.slice(0, test.totalQuestions)
                                  });
                                  setWordStudyMode('test');
                                  setShowWordBrowseView(false);
                                  setCurrentWordIndex(0);
                                  setTestAnswers({});
                                  setShowTestResult({});
                                  setIncorrectQuestions([]);
                                }}
                                size="sm"
                                variant="outline"
                                className="text-xs px-2 py-1"
                              >
                                다시 풀기
                              </Button>
                              <Button
                                onClick={() => {
                                  if (confirm(`"${test.title}" 테스트 기록을 삭제하시겠습니까?`)) {
                                    setCompletedWordTests(prev => prev.filter(t => t.id !== test.id));
                                    toast.success('테스트 기록이 삭제되었습니다.');
                                  }
                                }}
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-1.5 hidden sm:block">{test.description}</p>
                          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-600">
                            <span>완료일: {test.completedDate}</span>
                            <span>정답률: {Math.round((test.correctAnswers / test.totalQuestions) * 100)}%</span>
                            <span>문항: {test.answeredQuestions}/{test.totalQuestions}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : selectedWordList ? (
              // Word Study Mode (List, Flashcard, or Test)
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6 mb-4 sm:mb-6">
                {/* Header with back button */}
                <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleBackToWordLists}
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 py-1 h-7 flex-shrink-0"
                    >
                      ←
                    </Button>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{selectedWordList.title}</h2>
                      <p className="text-xs text-gray-500 truncate hidden sm:block">{selectedWordList.desktopTimestamp || selectedWordList.mobileTimestamp}</p>
                    </div>
                    {/* Mobile download button */}
                    <button
                      onClick={() => handleDownloadQuestions('both')}
                      className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all text-[11px] bg-gray-100 text-red-500 hover:bg-gray-200 whitespace-nowrap flex-shrink-0"
                      title="PDF 다운로드"
                    >
                      <Download className="w-3 h-3" />
                      <span>다운</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:flex sm:gap-1.5 sm:overflow-x-auto pb-1">
                    <button
                      onClick={() => setWordStudyMode('list')}
                      className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-6 py-2 rounded-full transition-all text-xs sm:text-sm whitespace-nowrap ${
                        wordStudyMode === 'list'
                          ? 'bg-white border-2 border-gray-300 text-gray-700 font-medium'
                          : 'bg-gray-100 border-2 border-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>단어 목록</span>
                    </button>
                    <button
                      onClick={() => {
                        setWordStudyMode('flashcard');
                        setCurrentWordIndex(0);
                        setIsFlashcardFlipped(false);
                      }}
                      className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-6 py-2 rounded-full transition-all text-xs sm:text-sm whitespace-nowrap ${
                        wordStudyMode === 'flashcard'
                          ? 'bg-white border-2 border-gray-300 text-gray-700 font-medium'
                          : 'bg-gray-100 border-2 border-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>플래시카드</span>
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowTestDialog(!showTestDialog)}
                        className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-6 py-2 rounded-full transition-all text-xs sm:text-sm whitespace-nowrap w-full ${
                          wordStudyMode === 'test'
                            ? 'bg-blue-600 text-white border-2 border-blue-600 font-medium'
                            : 'bg-gray-100 border-2 border-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="테스트 옵션"
                      >
                        <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>Test</span>
                      </button>
                      
                      {/* Test Options Popover */}
                      {showTestDialog && (
                        <>
                          {/* Backdrop to close popover when clicking outside */}
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowTestDialog(false)}
                          />
                          <div className="absolute top-full mt-2 left-0 sm:-left-12 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 min-w-max">
                            <div className="flex flex-col sm:flex-row gap-1.5">
                              <button
                                onClick={() => {
                                  setTestType('multiple');
                                  setWordStudyMode('test');
                                  setCurrentWordIndex(0);
                                  setTestAnswers({});
                                  setShowTestResult({});
                                  setSubjectiveAnswer('');
                                  setShowTestDialog(false);
                                }}
                                className="flex flex-col items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all min-w-[100px] sm:min-w-[110px]"
                              >
                                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600" />
                                <div className="text-center">
                                  <div className="text-[10px] sm:text-[11px] font-medium text-gray-800">객관식</div>
                                  <div className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">4지선다형</div>
                                </div>
                              </button>
                              
                              <button
                                onClick={() => {
                                  setTestType('subjective');
                                  setWordStudyMode('test');
                                  setCurrentWordIndex(0);
                                  setTestAnswers({});
                                  setShowTestResult({});
                                  setSubjectiveAnswer('');
                                  setShowTestDialog(false);
                                }}
                                className="flex flex-col items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all min-w-[100px] sm:min-w-[110px]"
                              >
                                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600" />
                                <div className="text-center">
                                  <div className="text-[10px] sm:text-[11px] font-medium text-gray-800">주관식</div>
                                  <div className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">직접 입력형</div>
                                </div>
                              </button>
                              
                              <button
                                onClick={() => {
                                  setTestType('mixed');
                                  setWordStudyMode('test');
                                  setCurrentWordIndex(0);
                                  setTestAnswers({});
                                  setShowTestResult({});
                                  setSubjectiveAnswer('');
                                  setShowTestDialog(false);
                                }}
                                className="flex flex-col items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all min-w-[100px] sm:min-w-[110px]"
                              >
                                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600" />
                                <div className="text-center">
                                  <div className="text-[10px] sm:text-[11px] font-medium text-gray-800">객관식+주관식</div>
                                  <div className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">혼합형</div>
                                </div>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="w-px h-8 bg-gray-300 mx-1 hidden sm:block"></div>
                    <button
                      onClick={() => handleDownloadQuestions('both')}
                      className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full transition-all text-sm bg-gray-100 border-2 border-gray-100 text-red-500 hover:bg-gray-200 whitespace-nowrap flex-shrink-0"
                      title="시험지+답안지 다운로드"
                    >
                      <Download className="w-4 h-4" />
                      <span>다운로드</span>
                    </button>
                  </div>
                </div>

                {/* Word Study Content */}
                {wordStudyMode === 'list' && (
                  <div className="space-y-3 sm:space-y-4">
                    {selectedWordList.words.map((word: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 flex gap-2.5 sm:gap-3 items-start">
                        <span className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5 sm:mt-1 flex-shrink-0 w-5 sm:w-7 text-right">{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <h3 className="text-base sm:text-lg font-medium text-gray-800">{word.word}</h3>
                            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0 ${
                              word.difficulty === '어려움' ? 'bg-red-100 text-red-600' :
                              word.difficulty === '보통' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {word.difficulty}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base text-gray-600">{word.definition}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {wordStudyMode === 'flashcard' && (
                  <WordFlashcard
                    words={selectedWordList.words}
                    currentWordIndex={currentWordIndex}
                    isFlashcardFlipped={isFlashcardFlipped}
                    setIsFlashcardFlipped={setIsFlashcardFlipped}
                    handlePrevWord={handlePrevWord}
                    handleNextWord={handleNextWord}
                  />
                )}

                {wordStudyMode === 'test' && (
                  <WordTest
                    selectedWordList={selectedWordList}
                    currentWordIndex={currentWordIndex}
                    setCurrentWordIndex={setCurrentWordIndex}
                    testAnswers={testAnswers}
                    setTestAnswers={setTestAnswers}
                    showTestResult={showTestResult}
                    setShowTestResult={setShowTestResult}
                    subjectiveAnswer={subjectiveAnswer}
                    setSubjectiveAnswer={setSubjectiveAnswer}
                    setWordStudyMode={setWordStudyMode}
                    generateTestOptions={generateTestOptions}
                    handleTestAnswer={handleTestAnswer}
                    handleNextWord={handleNextWord}
                    handleRetryQuestion={handleRetryQuestion}
                    incorrectQuestions={incorrectQuestions}
                    setIncorrectQuestions={setIncorrectQuestions}
                    testType={testType}
                  />
                )}
              </div>
            ) : (
              // Word Lists Grid - Removed, only show filter bar
              <div className="text-center py-16">
                <BookmarkPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  단어 학습을 시작하세요
                </h3>
                <p className="text-sm text-gray-400">
                  위의 필터를 설정한 후 <strong>Start</strong> 버튼을 눌러 단어 ���습을 시작할 수 있습니다.
                </p>
              </div>
            )
          ) : (
            // Practice Tests Grid
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {currentTests.map((test, index) => (
                <TestCard
                  key={`${test.id}-${test.title}-${index}`}
                  test={test}
                  index={index}
                  onStartTest={() => onStartTest(test)}
                  onViewWords={() => {
                    // Show words from this test
                    const testWords = allWordsFromTests.filter(w => w.testId === test.id);
                    if (testWords.length > 0) {
                      const testWordList = {
                        id: `test_${test.id}`,
                        title: `${test.title} 단어`,
                        type: "문제별",
                        category: test.type === 'Reading' ? 'Reading' : 'Math',
                        difficulty: "전체",
                        wordCount: testWords.length,
                        mastered: 0,
                        learning: testWords.length,
                        description: `${test.title}에서 나온 핵심 어휘`,
                        words: testWords,
                        sourceTests: [test.title]
                      };
                      
                      // Add to viewedWordLists (단어목록)
                      const alreadyInWordList = viewedWordLists.some(list => list.id === testWordList.id);
                      if (!alreadyInWordList) {
                        setViewedWordLists(prev => [testWordList, ...prev]);
                      }
                      
                      // Add to completed word tests (view mode, not test mode)
                      const alreadyViewed = completedWordTests.some(t => t.id === testWordList.id);
                      if (!alreadyViewed) {
                        const viewedTest = {
                          id: testWordList.id,
                          title: testWordList.title,
                          description: testWordList.description,
                          completedDate: new Date().toLocaleDateString('ko-KR'),
                          totalQuestions: testWordList.words.length,
                          answeredQuestions: 0,
                          correctAnswers: 0,
                          type: testWordList.type,
                          category: testWordList.category,
                          difficulty: testWordList.difficulty
                        };
                        setCompletedWordTests(prev => [viewedTest, ...prev]);
                      }
                      
                      setSmartPracticeTab('단어관리');
                      setWordStudyMode('list'); // Set to list mode by default
                      setShowWordBrowseView(false);
                      handleWordListSelect(testWordList);
                    } else {
                      // No words available for this test yet
                      toast.info('이 문제의 단어가 아직 등록되지 않았습니다. 문제를 풀면서 단어를 저장하면 자동으로 생성됩니다.');
                    }
                  }}
                  isUnlocked={isContentUnlocked}
                  onNavigateToPricing={() => {
                    setShowLoginPage(false);
                    setShowSignUpPage(false);
                    setActiveTab('가격');
                  }}
                />
              ))}
            </div>
            )
          }

          {/* Middle Advertisement - Only show when not in word study mode */}


          {/* Empty State */}
          {(smartPracticeTab === '단어관리' ? (!selectedWordList && !showWordBrowseView && filteredWordLists.length === 0) : currentTests.length === 0) && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              {smartPracticeTab === '단어관리' ? (
                <>
                  <BookmarkPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">
                    선택한 조건에 맞는 단어 목록이 없습니다
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    필터 조건을 변경하거나 다른 문제를 풀어 새로운 단어를 학습해보세요.
                  </p>
                </>
              ) : (
                <>
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">
                    {smartPracticeTab}에 사용할 수 있는 문제가 없습니다
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    업로드 탭에서 새로운 자료를 업로드해보세요.
                  </p>
                  <Button
                    onClick={() => setActiveTab('업로드')}
                    className="bg-blue-200 text-blue-700 px-4 py-2 rounded hover:bg-blue-300"
                  >
                    자료 업로드하기
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Pagination */}
          {(smartPracticeTab === '단어관리' ? totalWordPages > 1 : totalPages > 1) && (
            <div className="flex justify-center items-center gap-2">
              <Button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border rounded-md text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#3D5AA1',
                  borderColor: '#3D5AA1'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.backgroundColor = '#2F4A85';
                    e.currentTarget.style.borderColor = '#2F4A85';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3D5AA1';
                  e.currentTarget.style.borderColor = '#3D5AA1';
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {generatePageNumbers().map((pageNum, index) => (
                <Button
                  key={index}
                  onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                  disabled={pageNum === '...'}
                  className={`px-3 py-2 border rounded-md text-sm ${
                    pageNum === currentPage
                      ? 'text-white'
                      : "text-white"
                  } ${pageNum === "..." ? "cursor-default" : ""}`}
                  style={
                    pageNum === currentPage
                      ? { backgroundColor: "#2B478B", borderColor: "#2B478B" }
                      : pageNum === '...'
                      ? { backgroundColor: '#3D5AA1', borderColor: '#3D5AA1', opacity: 0.5 }
                      : { backgroundColor: '#3D5AA1', borderColor: '#3D5AA1' }
                  }
                  onMouseEnter={(e) => {
                    if (pageNum !== currentPage && pageNum !== '...') {
                      e.currentTarget.style.backgroundColor = '#2F4A85';
                      e.currentTarget.style.borderColor = '#2F4A85';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pageNum !== currentPage && pageNum !== '...') {
                      e.currentTarget.style.backgroundColor = '#3D5AA1';
                      e.currentTarget.style.borderColor = '#3D5AA1';
                    }
                  }}
                >
                  {pageNum}
                </Button>
              ))}
              
              <Button
                onClick={() => handlePageChange(Math.min(smartPracticeTab === '단어관리' ? totalWordPages : totalPages, currentPage + 1))}
                disabled={currentPage === (smartPracticeTab === '단어관리' ? totalWordPages : totalPages)}
                className="px-3 py-2 border rounded-md text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#3D5AA1',
                  borderColor: '#3D5AA1'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== (smartPracticeTab === '단어관리' ? totalWordPages : totalPages)) {
                    e.currentTarget.style.backgroundColor = '#2F4A85';
                    e.currentTarget.style.borderColor = '#2F4A85';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3D5AA1';
                  e.currentTarget.style.borderColor = '#3D5AA1';
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Advertisement Banner - Moved to Bottom */}
          {(smartPracticeTab !== 'SAT VOCA') && (
            <div className="mt-6">
              <div className="rounded-md p-3" style={{ backgroundColor: '#F5F7FA', border: '1px solid #E0E4E8' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs text-gray-700">SAT 프리미엄 학습 자료</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      전문가가 엄선한 고품질 SAT 학습 자료로 목표 점수를 달성하세요.
                    </p>
                  </div>
                  <motion.button
                    onClick={() => window.open('https://example.com', '_blank')}
                    className="px-3 py-1.5 text-white text-[10px] rounded-md transition-all whitespace-nowrap"
                    style={{ backgroundColor: '#3D5AA1' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    자세히 보기
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTrainingContent = () => {
    return (
      <TrainingContent
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        trainingSource={trainingSource}
        setTrainingSource={setTrainingSource}
        trainingAttemptFilter={trainingAttemptFilter}
        setTrainingAttemptFilter={setTrainingAttemptFilter}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        selectedQuestionCount={selectedQuestionCount}
        setSelectedQuestionCount={setSelectedQuestionCount}
        answerDisplayMode={answerDisplayMode}
        setAnswerDisplayMode={setAnswerDisplayMode}
        onStartTest={onStartTest}
        isUnlocked={isContentUnlocked}
        advertisements={advertisements}
        uploadedFiles={uploadedFiles}
        onNavigateToPricing={() => {
          setShowLoginPage(false);
          setShowSignUpPage(false);
          setActiveTab('가격');
        }}
      />
    );
  };

  const renderCoursesContent = () => {
    // Course categories
    const courseCategories = [
      { id: 'basic', name: 'Basic Concepts', icon: BookOpen, description: 'Systematically learn essential SAT concepts' },
      { id: 'pastExams', name: 'Past Exams', icon: BookOpen, description: 'Real practice with actual SAT past papers' },
      { id: 'special', name: 'Special Lectures', icon: Target, description: 'Special lecture series for high scores' }
    ];

    // Course data for each category
    const courseData = {
      basic: [
        {
          id: 1,
          title: 'SAT 독해 기본 개념',
          category: '독해문법',
          date: '2025-01-15',
          videoLink: 'https://youtube.com/watch?v=example1',
          hasVideo: true
        },
        {
          id: 2,
          title: 'SAT 문법 핵심 규칙',
          category: '독해문법',
          date: '2025-01-14',
          videoLink: 'https://youtube.com/watch?v=example2',
          hasVideo: true
        },
        {
          id: 3,
          title: 'SAT 수학 대수 기초',
          category: '수학',
          date: '2025-01-13',
          videoLink: 'https://youtube.com/watch?v=example3',
          hasVideo: true
        },
        {
          id: 4,
          title: 'SAT 수학 기하 개념',
          category: '수학',
          date: '2025-01-12',
          videoLink: 'https://youtube.com/watch?v=example4',
          hasVideo: true
        },
        {
          id: 5,
          title: 'SAT 어휘 학습 전략',
          category: '독해문법',
          date: '2025-01-11',
          videoLink: 'https://youtube.com/watch?v=example5',
          hasVideo: true
        },
        {
          id: 6,
          title: 'SAT 독해 유형별 접근법',
          category: '독해문법',
          date: '2025-01-10',
          videoLink: 'https://youtube.com/watch?v=example6',
          hasVideo: true
        },
        {
          id: 7,
          title: 'SAT 수학 통계와 확률',
          category: '수학',
          date: '2025-01-09',
          videoLink: 'https://youtube.com/watch?v=example7',
          hasVideo: true
        },
        {
          id: 8,
          title: 'SAT 문법 고급 개념',
          category: '독해문법',
          date: '2025-01-08',
          videoLink: 'https://youtube.com/watch?v=example8',
          hasVideo: true
        },
        {
          id: 9,
          title: 'SAT 수학 함수와 그래프',
          category: '수학',
          date: '2025-01-07',
          videoLink: 'https://youtube.com/watch?v=example9',
          hasVideo: true
        },
        {
          id: 10,
          title: 'SAT 독해 심화 문제',
          category: '독해문법',
          date: '2025-01-06',
          videoLink: 'https://youtube.com/watch?v=example10',
          hasVideo: true
        }
      ],
      pastExams: getAllPracticeTests(), // 스마트 연습의 기출문제와 동일
      special: [
        {
          id: 1,
          title: '1600점 달성 전략',
          category: '고득점 전략',
          date: '2025-01-20',
          videoLink: 'https://youtube.com/watch?v=special1',
          hasVideo: true
        },
        {
          id: 2,
          title: '시간 관리 마스터',
          category: '시간관리',
          date: '2025-01-18',
          videoLink: 'https://youtube.com/watch?v=special2',
          hasVideo: true
        },
        {
          id: 3,
          title: '실전 모의고사 전략',
          category: '실전 대비',
          date: '2025-01-16',
          videoLink: 'https://youtube.com/watch?v=special3',
          hasVideo: true
        },
        {
          id: 4,
          title: '고난도 문제 해결법',
          category: '고난도 대비',
          date: '2025-01-14',
          videoLink: 'https://youtube.com/watch?v=special4',
          hasVideo: true
        },
        {
          id: 5,
          title: '오답 분석 전략',
          category: '분석 기법',
          date: '2025-01-12',
          videoLink: 'https://youtube.com/watch?v=special5',
          hasVideo: true
        },
        {
          id: 6,
          title: '수험 컨디션 관리',
          category: '멘탈 관리',
          date: '2025-01-10',
          videoLink: 'https://youtube.com/watch?v=special6',
          hasVideo: true
        },
        {
          id: 7,
          title: '마지막 점검 체크리스트',
          category: '최종 점검',
          date: '2025-01-08',
          videoLink: 'https://youtube.com/watch?v=special7',
          hasVideo: true
        }
      ]
    };



    const allCourses = courseData[selectedCourseCategory] || [];
    const totalCoursePages = Math.ceil(allCourses.length / coursesPerPage);
    const startCourseIndex = (coursePage - 1) * coursesPerPage;
    const currentCourses = allCourses.slice(startCourseIndex, startCourseIndex + coursesPerPage);

    // Reset page when category changes
    const handleCategoryChange = (categoryId: string) => {
      setSelectedCourseCategory(categoryId);
      setCoursePage(1);
    };

    // Generate page numbers for course pagination
    const generateCoursePageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      const startPage = Math.max(1, coursePage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalCoursePages, startPage + maxVisiblePages - 1);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalCoursePages) {
        if (endPage < totalCoursePages - 1) pages.push('...');
        pages.push(totalCoursePages);
      }

      return pages;
    };

    const handleCoursePageChange = (page: number) => {
      setCoursePage(page);
    };

    // Video modal component
    const VideoModal = ({ course, onClose }: { course: any, onClose: () => void }) => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">{course.title || course.testTitle} - 동영상 강의</h3>
            <Button onClick={onClose} variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎥</div>
              <p className="text-gray-600 mb-4">동영�� 플레이어</p>
              <p className="text-sm text-gray-500 mb-4">실제 구현 시 YouTube/Vimeo 등의 동영상이 재생됩니다.</p>
              <a 
                href={course.videoLink || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline"
              >
                {course.videoLink || '동영상 링크가 제공될 예정입니다'}
              </a>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">강의 정보</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">카테고리:</span>
                <span className="ml-2 font-medium">{course.category || course.type}</span>
              </div>
              <div>
                <span className="text-gray-600">날짜:</span>
                <span className="ml-2">{course.date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    if (selectedCourse) {
      return <VideoModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />;
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Banner */}
        <div className="relative overflow-hidden" style={{ backgroundColor: '#1e3a8a' }}>
          {/* Decorative circles */}
          <div className="absolute top-6 left-12 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: '#60a5fa' }}></div>
          <div className="absolute bottom-6 right-12 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: '#60a5fa' }}></div>
          <div className="absolute top-16 right-1/4 w-20 h-20 rounded-full opacity-15" style={{ backgroundColor: 'white' }}></div>
          <div className="absolute bottom-10 left-1/3 w-16 h-16 rounded-full opacity-10" style={{ backgroundColor: 'white' }}></div>
          
          <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">SAT Lectures</h1>
            <p className="text-sm md:text-base text-blue-100 text-center">Your Path to Success</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Advertisement Banner - Moved to Top */}
          <div className="mb-6">
            <AdBannerDisplay advertisements={advertisements} location="lectures" />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-gray-800 mb-2">강의 및 특강</h1>
            <p className="text-gray-600">AI가 분석한 개��� 취약점을 바탕으로 맞춤형 문제를 제공합니다.</p>
          </div>

          {/* Category Tabs - Updated to match Training page style */}
          <div className="mb-6">
            <div className="flex gap-2 border-b border-gray-200">
              {courseCategories.map((category) => {
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-6 py-3 text-sm transition-colors rounded-t-lg ${
                      selectedCourseCategory === category.id
                        ? 'text-white font-medium'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                    style={selectedCourseCategory === category.id ? { backgroundColor: '#3D5AA1' } : {}}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters - for all categories */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">정렬</label>
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>시간순</option>
                  <option>인기순</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">과목</label>
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>전체</option>
                  <option>독해문법</option>
                  <option>수학</option>
                </select>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {currentCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                category={selectedCourseCategory}
                onAction={() => {
                  if (selectedCourseCategory === 'pastExams') {
                    onStartTest({
                      ...course,
                      source: "기출문제"
                    });
                  } else {
                    setSelectedCourse(course);
                  }
                }}
                isUnlocked={isContentUnlocked}
                onNavigateToPricing={() => {
                  setShowLoginPage(false);
                  setShowSignUpPage(false);
                  setActiveTab('가격');
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalCoursePages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                onClick={() => handleCoursePageChange(Math.max(1, coursePage - 1))}
                disabled={coursePage === 1}
                className="px-3 py-2 border rounded-md text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#3D5AA1',
                  borderColor: '#3D5AA1'
                }}
                onMouseEnter={(e) => {
                  if (coursePage !== 1) {
                    e.currentTarget.style.backgroundColor = '#2F4A85';
                    e.currentTarget.style.borderColor = '#2F4A85';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3D5AA1';
                  e.currentTarget.style.borderColor = '#3D5AA1';
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {generateCoursePageNumbers().map((pageNum, index) => (
                <Button
                  key={index}
                  onClick={() => typeof pageNum === 'number' && handleCoursePageChange(pageNum)}
                  disabled={pageNum === '...'}
                  className={`px-3 py-2 border rounded-md text-sm ${
                    pageNum === coursePage
                      ? 'text-white'
                      : "text-white"
                  } ${pageNum === "..." ? "cursor-default" : ""}`}
                  style={
                    pageNum === coursePage
                      ? { backgroundColor: "#2B478B", borderColor: "#2B478B" }
                      : pageNum === '...'
                      ? { backgroundColor: '#3D5AA1', borderColor: '#3D5AA1', opacity: 0.5 }
                      : { backgroundColor: '#3D5AA1', borderColor: '#3D5AA1' }
                  }
                  onMouseEnter={(e) => {
                    if (pageNum !== coursePage && pageNum !== '...') {
                      e.currentTarget.style.backgroundColor = '#2F4A85';
                      e.currentTarget.style.borderColor = '#2F4A85';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pageNum !== coursePage && pageNum !== '...') {
                      e.currentTarget.style.backgroundColor = '#3D5AA1';
                      e.currentTarget.style.borderColor = '#3D5AA1';
                    }
                  }}
                >
                  {pageNum}
                </Button>
              ))}
              
              <Button
                onClick={() => handleCoursePageChange(Math.min(totalCoursePages, coursePage + 1))}
                disabled={coursePage === totalCoursePages}
                className="px-3 py-2 border rounded-md text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#3D5AA1',
                  borderColor: '#3D5AA1'
                }}
                onMouseEnter={(e) => {
                  if (coursePage !== totalCoursePages) {
                    e.currentTarget.style.backgroundColor = '#2F4A85';
                    e.currentTarget.style.borderColor = '#2F4A85';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3D5AA1';
                  e.currentTarget.style.borderColor = '#3D5AA1';
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Empty State */}
          {currentCourses.length === 0 && allCourses.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {courseCategories.find(cat => cat.id === selectedCourseCategory)?.name}에 사용할 수 있는 강의가 없습니다
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                {selectedCourseCategory === 'pastExams' 
                  ? '업로드 탭에서 기출문제 자료를 업로드해보세요.'
                  : '곧 다양한 강의 콘텐츠가 제공될 예정입니다.'
                }
              </p>
              {selectedCourseCategory === 'pastExams' && (
                <Button
                  onClick={() => setActiveTab('업로드')}
                  className="bg-blue-200 text-blue-700 px-4 py-2 rounded hover:bg-blue-300"
                >
                  자료 업로드하기
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUploadContent = () => {

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-medium text-gray-800 mb-2">업로드 및 관리</h1>
            <p className="text-gray-600">파일 업로드 및 시스템 관리 기능을 제공합니다.</p>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setUploadTab('���일업로드')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  uploadTab === '파일업로드'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Upload className="h-4 w-4 inline mr-2" />
                파일 업로드
              </button>
              <button
                onClick={() => setUploadTab('대량업로드')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  uploadTab === '대량업로드'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Database className="h-4 w-4 inline mr-2" />
                대량 업로드
              </button>
              <button
                onClick={() => setUploadTab('광고관리')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  uploadTab === '광고관리'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                광고 관리
              </button>
              <button
                onClick={() => setUploadTab('학생관리')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  uploadTab === '학생관리'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <GraduationCap className="h-4 w-4 inline mr-2" />
                학생 관리
              </button>
              <button
                onClick={() => setUploadTab('관리자모드')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors border-transparent text-gray-600 hover:text-gray-800`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                관리자 모드 (LSM)
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Advertisement Banner */}
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <AdBanner
            image="https://images.unsplash.com/photo-1511629091441-ee46146481b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFjaGVyJTIwaW5zdHJ1Y3RvcnxlbnwxfHx8fDE3NjE0Nzk2NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            title="맞춤형 자료 제작 서비스"
            description="여러분의 학습 목표에 맞는 전문 자료를 제작해드립니다. 전문가가 분석한 취약점을 보완하는 맞춤 문제와 해설을 제공합니다."
            size="large"
            onButtonClick={() => alert("자료 제작 서비스 문의")}
          />
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Bulk Upload Content */}
            {uploadTab === '대량업로드' ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <BulkUpload
                    onUploadSuccess={(files) => {
                      const updatedFiles = [...uploadedFiles, ...files];
                      setUploadedFiles(updatedFiles);
                      toast.success('파일이 업로드되었습니다. 바로 실전 문제를 풀 수 있습니다!');
                    }}
                  />
                </div>
              </div>
            ) : uploadTab === '광고관리' ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <AdManagement
                    onClose={() => setUploadTab('파일업로드')}
                    projectId={projectId}
                    publicAnonKey={publicAnonKey}
                    onAdsUpdate={setAdvertisements}
                  />
                </div>
              </div>
            ) : uploadTab === '학생관리' ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">학생 관리</h2>
                  
                  {students.length === 0 ? (
                    <div className="text-center py-12">
                      <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">등록된 학생이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시험 횟수</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(student.createdAt).toLocaleDateString('ko-KR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.testCount || 0}회
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  onClick={() => {
                                    setSelectedStudentFilter(student.id);
                                    setActiveTab('연습 기록');
                                    setUploadTab('파일업로드');
                                    toast.success(`${student.name} 학생의 기록을 표시합니다.`);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                >
                                  기록 보기
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Upload Form */}
                <div className="space-y-6">
              {/* File Upload Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-medium text-gray-800">파일 업로드</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  자료를 업로드할 카테고���를 선택하고 파일을 업로드하세요.
                </p>

                {/* Upload Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">업로드 위치 선택</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-md bg-white"
                    value={uploadLocation}
                    onChange={(e) => handleUploadLocationChange(e.target.value)}
                  >
                    <option value="스마트 연습 - 기출문제">스마트 연습 - 기출문제</option>
                    <option value="스마트 연습 - 공식 샘플">스마트 연습 - 공식 샘플</option>
                    <option value="전문 훈련">전문 훈련</option>
                    <option value="강의 자료">강의 자료</option>
                  </select>
                </div>

                {/* Category Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">세부 카테고리 선택</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-md bg-white"
                    value={uploadSubcategory}
                    onChange={(e) => setUploadSubcategory(e.target.value)}
                  >
                    <option value="">
                      {uploadLocation === '전문 훈련' ? '문제 유형을 선택하세요' : '세부 카테고리를 선택하세요'}
                    </option>
                    {getSubcategoryOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload Method Selection */}
                <div className="bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">{uploadLocation}</h3>
                  {uploadSubcategory && (
                    <p className="text-sm text-gray-600 mb-4">
                      {uploadLocation === '전문 훈련' 
                        ? questionTypes.find(type => type.id === uploadSubcategory)?.name
                        : getSubcategoryOptions().find(option => option.value === uploadSubcategory)?.label
                      }
                    </p>
                  )}
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={() => setUploadMethod('local')}
                      className={`px-4 py-2 rounded ${
                        uploadMethod === 'local' 
                          ? 'bg-blue-500 text-white hover:bg-blue-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      로컬 파일
                    </Button>
                    <Button 
                      onClick={() => setUploadMethod('external')}
                      className={`px-4 py-2 rounded ${
                        uploadMethod === 'external' 
                          ? 'bg-blue-500 text-white hover:bg-blue-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      외부 링크
                    </Button>
                  </div>
                </div>

                {/* Upload Area - Local Files */}
                {uploadMethod === 'local' && (
                  <div 
                    className="mt-6 border-2 border-gray-300 border-dashed rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (!uploadSubcategory) return;
                      const input = document.createElement("input");
                      input.type = "file";
                      input.multiple = true;
                      input.accept = ".pdf,.doc,.docx";
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files) handleFileUpload(files);
                      };
                      input.click();
                    }}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-700 mb-2">파일을 여기에 드래그하거나 클릭하여 업로드</h3>
                    <p className="text-sm text-gray-500 mb-4">PDF, DOC, DOCX 파일 (최대 10MB)</p>
                    <Button 
                      className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                      disabled={!uploadSubcategory || isUploading}
                    >
                      {isUploading ? '업로드 중...' : '파일 선택'}
                    </Button>
                    {!uploadSubcategory && (
                      <p className="text-xs text-red-500 mt-2">
                        {uploadLocation === '전문 훈��' ? '문제 유형을 선택하세요' : '세부 카테고리를 선택하세요'}
                      </p>
                    )}
                  </div>
                )}

                {/* Upload Area - External Links */}
                {uploadMethod === 'external' && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">지원되는 외부 링크</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-white px-3 py-1 rounded text-xs text-gray-600 border">Google Drive</span>
                        <span className="bg-white px-3 py-1 rounded text-xs text-gray-600 border">Dropbox</span>
                        <span className="bg-white px-3 py-1 rounded text-xs text-gray-600 border">OneDrive</span>
                        <span className="bg-white px-3 py-1 rounded text-xs text-gray-600 border">Box</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://drive.google.com/file/... 또는 다른 클라우드 링크"
                        value={externalLink}
                        onChange={(e) => setExternalLink(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-md bg-white text-sm"
                        disabled={!uploadSubcategory}
                      />
                      <Button
                        onClick={handleExternalLinkUpload}
                        className="bg-blue-200 text-blue-700 px-6 py-3 rounded hover:bg-blue-300"
                        disabled={!uploadSubcategory || !externalLink || isUploading}
                      >
                        {isUploading ? '처리 중...' : '추가'}
                      </Button>
                    </div>
                    
                    {!uploadSubcategory && (
                      <p className="text-xs text-red-500">
                        {uploadLocation === '전문 훈련' ? '문제 유형을 선택하세요' : '세부 카테고리를 선택하세요'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPracticeRecordContentNew = () => {
    // Mock practice records data
    const practiceRecords = [
      {
        id: 1,
        title: "어휘 문제 전문훈련",
        date: "2025-08-28",
        questionsCount: 10,
        accuracy: 0,
        timeUsed: "0min 00s"
      },
      {
        id: 2,
        title: "지문 문제 전문훈련", 
        date: "2025-08-28",
        questionsCount: 10,
        accuracy: 0,
        timeUsed: "0min 00s"
      },
      {
        id: 3,
        title: "문법 문제 전문훈련",
        date: "2025-08-21",
        questionsCount: 5,
        accuracy: 0,
        timeUsed: "0min 35s"
      },
      {
        id: 4,
        title: "주제별 문제 전문훈련",
        date: "2025-08-21",
        questionsCount: 5,
        accuracy: 0,
        timeUsed: "0min 26s"
      },
      {
        id: 5,
        title: "도표 문제 전문훈련",
        date: "2025-08-21",
        questionsCount: 5,
        accuracy: 0,
        timeUsed: "0min 28s"
      },
      {
        id: 6,
        title: "순서 문제 전문훈련",
        date: "2025-08-21",
        questionsCount: 5,
        accuracy: 0,
        timeUsed: "0min 29s"
      },
      {
        id: 7,
        title: "지문 문제 전문훈련",
        date: "2025-08-08",
        questionsCount: 10,
        accuracy: 0,
        timeUsed: "0min 00s"
      }
    ];

    const recordCategories = [
      { id: 'all', name: 'All Records', icon: BookOpen },
      { id: 'mock', name: 'Mock Tests', icon: BookOpen },
      { id: 'wrong', name: 'Wrong Answers', icon: BookOpen }
    ];

    const subjects = ['전체', '독해', '문법', '수학'];
    const difficulties = ['전체', 'Hard문항', 'Medium문항', 'Easy문항'];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Banner - Full width above sidebar */}
          <div className="px-6 pt-6">
            <Banner />
          </div>
          
          <div className="flex">
            {/* Left Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
              <div className="p-4">
                <h2 className="text-lg font-medium text-gray-800 mb-4">연습기록</h2>
                <div className="space-y-2">
                  {recordCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setPracticeRecordCategory(category.name)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        practiceRecordCategory === category.name
                          ? 'text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      style={practiceRecordCategory === category.name ? { backgroundColor: '#2B478B' } : {}}
                    >
                      {category.icon === specialIcon ? (
                     <img src={category.icon} alt={category.name} className="w-5 h-5" />
                   ) : (
                     <span className="text-lg">{category.icon}</span>
                   )}
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <h1 className="text-xl font-medium text-gray-800">{practiceRecordCategory}</h1>
              </div>

              {/* Filter Section */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="space-y-4">
                  {/* Subject Filter */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 min-w-[80px]">소속 과목:</span>
                    <div className="flex items-center gap-2">
                      {subjects.map((subject) => (
                        <Button
                          key={subject}
                          onClick={() => setPracticeRecordSubject(subject)}
                          className={`px-4 py-2 rounded text-sm ${
                            practiceRecordSubject === subject
                              ? 'text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          style={practiceRecordSubject === subject ? { 
                            backgroundColor: '#2B478B'
                          } : {}}
                          onMouseEnter={(e) => {
                            if (practiceRecordSubject === subject) {
                              e.currentTarget.style.backgroundColor = '#1F3666';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (practiceRecordSubject === subject) {
                              e.currentTarget.style.backgroundColor = '#2B478B';
                            }
                          }}
                        >
                          {subject}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Filter */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 min-w-[80px]">난이도별:</span>
                    <div className="flex items-center gap-2">
                      {difficulties.map((difficulty) => (
                        <Button
                          key={difficulty}
                          onClick={() => setPracticeRecordDifficulty(difficulty)}
                          className={`px-4 py-2 rounded text-sm ${
                            practiceRecordDifficulty === difficulty
                              ? 'text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          style={practiceRecordDifficulty === difficulty ? { 
                            backgroundColor: '#2B478B'
                          } : {}}
                          onMouseEnter={(e) => {
                            if (practiceRecordDifficulty === difficulty) {
                              e.currentTarget.style.backgroundColor = '#1F3666';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (practiceRecordDifficulty === difficulty) {
                              e.currentTarget.style.backgroundColor = '#2B478B';
                            }
                          }}
                        >
                          {difficulty}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Records List */}
              <div className="p-6">
                <div className="space-y-4">
                  {practiceRecords.map((record, index) => (
                    <PracticeRecordCard
                      key={record.id}
                      record={record}
                      index={index}
                      onViewDetail={() => {}}
                      onRetry={onStartTest}
                    />
                  ))}
                </div>

                {/* Empty State (if no records) */}
                {practiceRecords.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <FileText className="w-16 h-16 mx-auto" />
                    </div>
                    <p className="text-gray-500 mb-4">연습 기록이 없습니다</p>
                    <Button
                      onClick={onStartTest}
                      className="bg-blue-200 text-blue-700 px-6 py-2 rounded hover:bg-blue-300"
                    >
                      연습 시작하기
                    </Button>
                  </div>
                )}
              </div>

              {/* Advertisement Section */}
              <div className="mt-8">
                <AdBanner
                  image="https://images.unsplash.com/photo-1661675639921-c425af954585?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRseSUyMGVkdWNhdG9yJTIwdGVhY2hpbmd8ZW58MXx8fHwxNzYxNTM2MjMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  title="성적 분석 및 진단 서비스"
                  description="전문가의 상세한 성적 분석으로 정확한 학습 방향을 제시합니다. 약점 보완과 강점 극대화 전략을 함께 수립하세요."
                  size="large"
                  onButtonClick={() => alert("성적 분석 서비스 신청")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginPage(false);
    setShowSignUpPage(false);
    setActiveTab('스마트 연습');
    toast.success('로그인 성공!');
  };

  const renderContent = () => {
    // Show login page if active
    if (showLoginPage) {
      return <LoginPage 
        onNavigateToSignUp={() => {
          setShowLoginPage(false);
          setShowSignUpPage(true);
        }}
        onLoginSuccess={handleLoginSuccess}
        onLogin={handleLogin}
      />;
    }
    
    // Show signup page if active
    if (showSignUpPage) {
      return <SignUpPage onSignUpSuccess={handleLoginSuccess} onSignUp={handleLogin} />;
    }
    
    // Show regular tab content
    switch (activeTab) {
      case 'Home':
        return <LandingPage onGetStarted={() => setActiveTab('스마트 연습')} />;
      case '스마트 연습':
        return renderSmartPracticeContent();
      case '강의 및 특강':
        return renderCoursesContent();
      case '전문 훈련':
        return renderTrainingContent();
      case '업로드':
        return <UploadContent 
          setActiveTab={setActiveTab} 
          onUnlockContent={() => setIsContentUnlocked(true)}
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          projectId={projectId}
          publicAnonKey={publicAnonKey}
          onAdsUpdate={setAdvertisements}
        />;
      case '연습 기록':
        return renderPracticeRecordContent();
      case '리포트':
        // Report is now inside History tab - fallback
        return renderPracticeRecordContent();
      default:
        return renderSmartPracticeContent();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-6">
              <div 
                className="flex-shrink-0 flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  if (!isStudyHubUnlocked) {
                    setShowStudyHubPassword(true);
                  } else {
                    setShowLoginPage(false);
                    setShowSignUpPage(false);
                    setActiveTab('업로드');
                  }
                }}
                title="Study Hub CMS"
              >
                <Zap className="w-5 h-5" style={{ color: '#00bcd4' }} fill="#00bcd4" />
                <h1 className="text-lg text-gray-900 font-extrabold tracking-tight">AllMyExam-<span style={{ color: '#00bcd4' }}>SAT</span></h1>
              </div>
              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              {/* Desktop navigation */}
              <div className="hidden sm:flex sm:space-x-4">
                <button
                  onClick={() => {
                    setShowLoginPage(false);
                    setShowSignUpPage(false);
                    setActiveTab('Home');
                  }}
                  className={`inline-flex items-center px-5 py-3 border-b-2 text-base transition-colors ${
                    activeTab === 'Home' && !showLoginPage && !showSignUpPage
                      ? 'text-gray-900 font-extrabold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 font-bold'
                  }`}
                  style={activeTab === 'Home' && !showLoginPage && !showSignUpPage ? { borderBottomColor: '#2B478B' } : {}}
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      setShowLoginPage(false);
                      setShowSignUpPage(false);
                      setActiveTab('스마트 연습');
                      setShowLoginPopup(true);
                      return;
                    }
                    setShowLoginPage(false);
                    setShowSignUpPage(false);
                    setActiveTab('스마트 연습');
                  }}
                  className={`inline-flex items-center px-5 py-3 border-b-2 text-base transition-colors ${
                    activeTab === '스마트 연습' && !showLoginPage && !showSignUpPage
                      ? 'text-gray-900 font-extrabold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 font-bold'
                  }`}
                  style={activeTab === '스마트 연습' && !showLoginPage && !showSignUpPage ? { borderBottomColor: '#2B478B' } : {}}
                >
                  Practice
                </button>
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      setShowLoginPage(false);
                      setShowSignUpPage(false);
                      setActiveTab('강의 및 특강');
                      setShowLoginPopup(true);
                      return;
                    }
                    setShowLoginPage(false);
                    setShowSignUpPage(false);
                    setActiveTab('강의 및 특강');
                  }}
                  className={`inline-flex items-center px-5 py-3 border-b-2 text-base transition-colors ${
                    activeTab === '강의 및 특강' && !showLoginPage && !showSignUpPage
                      ? 'text-gray-900 font-extrabold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 font-bold'
                  }`}
                  style={activeTab === '강의 및 특강' && !showLoginPage && !showSignUpPage ? { borderBottomColor: '#2B478B' } : {}}
                >
                  Pattern 뽀개기
                </button>
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      setShowLoginPage(false);
                      setShowSignUpPage(false);
                      setActiveTab('전문 훈련');
                      setShowLoginPopup(true);
                      return;
                    }
                    setShowLoginPage(false);
                    setShowSignUpPage(false);
                    setActiveTab('전문 훈련');
                  }}
                  className={`inline-flex items-center px-5 py-3 border-b-2 text-base transition-colors ${
                    activeTab === '전문 훈련' && !showLoginPage && !showSignUpPage
                      ? 'text-gray-900 font-extrabold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 font-bold'
                  }`}
                  style={activeTab === '전문 훈련' && !showLoginPage && !showSignUpPage ? { borderBottomColor: '#2B478B' } : {}}
                >
                  Training
                </button>
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      setShowLoginPage(false);
                      setShowSignUpPage(false);
                      setActiveTab('연습 기록');
                      setShowLoginPopup(true);
                      return;
                    }
                    setShowLoginPage(false);
                    setShowSignUpPage(false);
                    setActiveTab('연습 기록');
                  }}
                  className={`inline-flex items-center px-5 py-3 border-b-2 text-base transition-colors ${
                    activeTab === '연습 기록' && !showLoginPage && !showSignUpPage
                      ? 'text-gray-900 font-extrabold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 font-bold'
                  }`}
                  style={activeTab === '연습 기록' && !showLoginPage && !showSignUpPage ? { borderBottomColor: '#2B478B' } : {}}
                >
                  History
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm sm:text-base font-semibold text-gray-700">
                    Hi, <span style={{ color: '#0891B2' }}>{currentUser.name || currentUser.username || currentUser.email}</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (setCurrentUser) {
                        setCurrentUser(null);
                      }
                      setIsLoggedIn(false);
                      toast.success('로그아웃되었습니다.');
                    }}
                    className="px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-md text-xs sm:text-base transition-colors font-semibold whitespace-nowrap"
                    style={{ 
                      backgroundColor: 'white',
                      color: '#374151',
                      border: '1px solid #D1D5DB'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F3F4F6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setShowLoginPage(true);
                      setShowSignUpPage(false);
                    }}
                    className="px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-md text-xs sm:text-base transition-colors font-semibold whitespace-nowrap"
                    style={{ 
                      backgroundColor: showLoginPage && !showSignUpPage ? '#0891B2' : 'white',
                      color: showLoginPage && !showSignUpPage ? 'white' : '#374151',
                      border: '1px solid #D1D5DB'
                    }}
                    onMouseEnter={(e) => {
                      if (!showLoginPage || showSignUpPage) {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = showLoginPage && !showSignUpPage ? '#0891B2' : 'white';
                    }}
                  >
                    로그인
                  </button>
                  <button 
                    onClick={() => {
                      setShowSignUpPage(true);
                      setShowLoginPage(false);
                    }}
                    className="px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-md text-xs sm:text-base transition-colors font-semibold whitespace-nowrap"
                    style={{ 
                      backgroundColor: showSignUpPage && !showLoginPage ? '#0891B2' : 'white',
                      color: showSignUpPage && !showLoginPage ? 'white' : '#374151',
                      border: '1px solid #D1D5DB'
                    }}
                    onMouseEnter={(e) => {
                      if (!showSignUpPage || showLoginPage) {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = showSignUpPage && !showLoginPage ? '#0891B2' : 'white';
                    }}
                  >
                    회원가입
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile dropdown menu */}
        {showMobileMenu && (
          <div className="sm:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              <button
                onClick={() => {
                  setShowLoginPage(false);
                  setShowSignUpPage(false);
                  setActiveTab('Home');
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === 'Home' && !showLoginPage && !showSignUpPage
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50 font-medium'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    setShowLoginPage(false);
                    setShowSignUpPage(false);
                    setActiveTab('스마트 연습');
                    setShowLoginPopup(true);
                    setShowMobileMenu(false);
                    return;
                  }
                  setShowLoginPage(false);
                  setShowSignUpPage(false);
                  setActiveTab('스마트 연습');
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === '스마트 연습' && !showLoginPage && !showSignUpPage
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50 font-medium'
                }`}
              >
                Practice
              </button>
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    setShowLoginPage(false);
                    setShowSignUpPage(false);
                    setActiveTab('강의 및 특강');
                    setShowLoginPopup(true);
                    setShowMobileMenu(false);
                    return;
                  }
                  setShowLoginPage(false);
                  setShowSignUpPage(false);
                  setActiveTab('강의 및 특강');
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === '강의 및 특강' && !showLoginPage && !showSignUpPage
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50 font-medium'
                }`}
              >
                Lectures
              </button>
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    setShowLoginPage(false);
                    setShowSignUpPage(false);
                    setActiveTab('전문 훈련');
                    setShowLoginPopup(true);
                    setShowMobileMenu(false);
                    return;
                  }
                  setShowLoginPage(false);
                  setShowSignUpPage(false);
                  setActiveTab('전문 훈련');
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === '전문 훈련' && !showLoginPage && !showSignUpPage
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50 font-medium'
                }`}
              >
                Training
              </button>
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    setShowLoginPage(false);
                    setShowSignUpPage(false);
                    setActiveTab('연습 기록');
                    setShowLoginPopup(true);
                    setShowMobileMenu(false);
                    return;
                  }
                  setShowLoginPage(false);
                  setShowSignUpPage(false);
                  setActiveTab('연습 기록');
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === '연습 기록' && !showLoginPage && !showSignUpPage
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50 font-medium'
                }`}
              >
                History
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Tab Content */}
      <div className="pb-0 md:pb-0">
        <div className="pb-20 md:pb-0">
          {renderContent()}
        </div>
      </div>

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onLoginClick={() => {
          setShowLoginPopup(false);
          setShowLoginPage(true);
          setShowSignUpPage(false);
        }}
      />

      {/* Study Hub Password Modal */}
      {showStudyHubPassword && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Study Hub CMS</h2>
            <p className="text-sm text-gray-600 mb-4">
              관리자 비밀번호를 입력해주세요.
            </p>
            <input
              type="password"
              value={studyHubPasswordInput}
              onChange={(e) => setStudyHubPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (studyHubPasswordInput === 'matanboy00') {
                    setIsStudyHubUnlocked(true);
                    setShowStudyHubPassword(false);
                    setStudyHubPasswordInput('');
                    setShowLoginPage(false);
                    setShowSignUpPage(false);
                    setActiveTab('업로드');
                    toast.success('Study Hub CMS가 열렸습니다!');
                  } else {
                    toast.error('비밀번호가 올바르지 않습니다.');
                    setStudyHubPasswordInput('');
                  }
                }
              }}
              placeholder="비밀번호 입력"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowStudyHubPassword(false);
                  setStudyHubPasswordInput('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (studyHubPasswordInput === 'matanboy00') {
                    setIsStudyHubUnlocked(true);
                    setShowStudyHubPassword(false);
                    setStudyHubPasswordInput('');
                    setShowLoginPage(false);
                    setShowSignUpPage(false);
                    setActiveTab('업로드');
                    toast.success('Study Hub CMS가 열렸습니다!');
                  } else {
                    toast.error('비밀번호가 올바르지 않습니다.');
                    setStudyHubPasswordInput('');
                  }
                }}
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: '#00bcd4' }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="flex justify-around items-center px-2 py-2">
          {/* Home */}
          <button
            onClick={() => {
              setShowLoginPage(false);
              setShowSignUpPage(false);
              setActiveTab('Home');
            }}
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-lg transition-colors"
            style={{
              color: activeTab === 'Home' && !showLoginPage && !showSignUpPage ? '#10B981' : '#6B7280'
            }}
          >
            <Home size={22} strokeWidth={activeTab === 'Home' && !showLoginPage && !showSignUpPage ? 2.5 : 2} />
            <span className="text-xs mt-0.5 font-medium">Home</span>
          </button>

          {/* Practice */}
          <button
            onClick={() => {
              if (!isLoggedIn) {
                setShowLoginPage(false);
                setShowSignUpPage(false);
                setActiveTab('스마트 연습');
                setShowLoginPopup(true);
                return;
              }
              setShowLoginPage(false);
              setShowSignUpPage(false);
              setActiveTab('스마트 연습');
            }}
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-lg transition-colors"
            style={{
              color: activeTab === '스마트 연습' && !showLoginPage && !showSignUpPage ? '#10B981' : '#6B7280'
            }}
          >
            <BookOpen size={22} strokeWidth={activeTab === '스마트 연습' && !showLoginPage && !showSignUpPage ? 2.5 : 2} />
            <span className="text-xs mt-0.5 font-medium">Practice</span>
          </button>

          {/* Lectures */}
          <button
            onClick={() => {
              if (!isLoggedIn) {
                setShowLoginPage(false);
                setShowSignUpPage(false);
                setActiveTab('강의 및 특강');
                setShowLoginPopup(true);
                return;
              }
              setShowLoginPage(false);
              setShowSignUpPage(false);
              setActiveTab('강의 및 특강');
            }}
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-lg transition-colors"
            style={{
              color: activeTab === '강의 및 특강' && !showLoginPage && !showSignUpPage ? '#10B981' : '#6B7280'
            }}
          >
            <GraduationCap size={22} strokeWidth={activeTab === '강의 및 특강' && !showLoginPage && !showSignUpPage ? 2.5 : 2} />
            <span className="text-xs mt-0.5 font-medium">Pattern 뽀개기</span>
          </button>

          {/* Training */}
          <button
            onClick={() => {
              if (!isLoggedIn) {
                setShowLoginPage(false);
                setShowSignUpPage(false);
                setActiveTab('전문 훈련');
                setShowLoginPopup(true);
                return;
              }
              setShowLoginPage(false);
              setShowSignUpPage(false);
              setActiveTab('전문 훈련');
            }}
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-lg transition-colors"
            style={{
              color: activeTab === '전문 훈련' && !showLoginPage && !showSignUpPage ? '#10B981' : '#6B7280'
            }}
          >
            <Target size={22} strokeWidth={activeTab === '전문 훈련' && !showLoginPage && !showSignUpPage ? 2.5 : 2} />
            <span className="text-xs mt-0.5 font-medium">Training</span>
          </button>

          {/* History */}
          <button
            onClick={() => {
              if (!isLoggedIn) {
                setShowLoginPage(false);
                setShowSignUpPage(false);
                setActiveTab('연습 기록');
                setShowLoginPopup(true);
                return;
              }
              setShowLoginPage(false);
              setShowSignUpPage(false);
              setActiveTab('연습 기록');
            }}
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-lg transition-colors"
            style={{
              color: activeTab === '연습 기록' && !showLoginPage && !showSignUpPage ? '#10B981' : '#6B7280'
            }}
          >
            <BarChart3 size={22} strokeWidth={activeTab === '연습 기록' && !showLoginPage && !showSignUpPage ? 2.5 : 2} />
            <span className="text-xs mt-0.5 font-medium">History</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
