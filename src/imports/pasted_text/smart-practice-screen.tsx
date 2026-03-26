import React, { useState } from 'react';
import { BookOpen, Lock, ChevronLeft, ChevronRight, BookMarked } from 'lucide-react';

export default function SmartPracticeScreen() {
  const [activeTab, setActiveTab] = useState('기출문제');
  const [subject, setSubject] = useState('전체');
  const [sort, setSort] = useState('시간순 정렬');

  return (
    // 전체 배경색을 깔끔한 연한 회색으로 변경
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* 상단 제목 영역 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">스마트 연습</h1>
          <p className="text-gray-500">AI가 분석한 개인 취약점을 바탕으로 맞춤형 문제를 제공합니다.</p>
        </div>

        {/* 메인 탭 (기출문제, 공식문제 등) - 트렌디한 둥근 캡슐 디자인 */}
        <div className="flex flex-wrap gap-2 mb-10 bg-white p-2 rounded-2xl shadow-sm inline-flex border border-gray-100">
          {['기출문제', '공식문제', '단어관리', 'SAT VOCA'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-[#425486] text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 필터 영역 (과목, 정렬) - 세련된 흰색 박스와 둥근 버튼들 */}
        <div className="bg-white rounded-3xl p-8 mb-10 shadow-sm border border-gray-100">
          {/* 과목 필터 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#425486] rounded-full"></div>
              <span className="text-sm font-bold text-gray-700">과목</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {['전체', '독해문법', '수학'].map((item) => (
                <button
                  key={item}
                  onClick={() => setSubject(item)}
                  className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                    subject === item
                      ? 'bg-[#425486] text-white border-[#425486] shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#425486] hover:text-[#425486]'
                  }`}
                >
                  {item}
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
                  onClick={() => setSort(item)}
                  className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                    sort === item
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

        {/* 문제집 카드 목록 - 마우스 올리면 부드럽게 떠오르는 효과(hover:-translate-y-1) 추가 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          
          {/* 활성화된 카드 1 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF2F6] flex items-center justify-center text-[#425486] shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[#2C3E50] mb-1 leading-tight">2025년 6월 제1회 독해문법</h3>
                <p className="text-sm text-[#425486] font-medium">Reading</p>
              </div>
            </div>
            <button className="w-full bg-[#425486] text-white rounded-xl py-3 font-semibold mb-3 hover:bg-[#2C3E50] transition-colors shadow-sm">
              시작하기
            </button>
            <button className="w-full bg-white border border-gray-200 text-gray-600 rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <BookMarked className="w-4 h-4" /> 문제 단어 보기
            </button>
          </div>

          {/* 활성화된 카드 2 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF2F6] flex items-center justify-center text-[#425486] shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[#2C3E50] mb-1 leading-tight">2025년 6월 제2회 독해문법</h3>
                <p className="text-sm text-[#425486] font-medium">Reading</p>
              </div>
            </div>
            <button className="w-full bg-[#425486] text-white rounded-xl py-3 font-semibold mb-3 hover:bg-[#2C3E50] transition-colors shadow-sm">
              시작하기
            </button>
            <button className="w-full bg-white border border-gray-200 text-gray-600 rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <BookMarked className="w-4 h-4" /> 문제 단어 보기
            </button>
          </div>

          {/* 활성화된 카드 3 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF2F6] flex items-center justify-center text-[#425486] shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[#2C3E50] mb-1 leading-tight">2025년 6월 제2회 수학</h3>
                <p className="text-sm text-[#425486] font-medium">Math</p>
              </div>
            </div>
            <button className="w-full bg-[#425486] text-white rounded-xl py-3 font-semibold mb-3 hover:bg-[#2C3E50] transition-colors shadow-sm">
              시작하기
            </button>
            <button className="w-full bg-white border border-gray-200 text-gray-600 rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <BookMarked className="w-4 h-4" /> 문제 단어 보기
            </button>
          </div>

          {/* 잠긴 카드 (자물쇠 아이콘) */}
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 opacity-70">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-500 mb-1 leading-tight">2025년 6월 제3회 독해문법</h3>
                <p className="text-sm text-gray-400 font-medium">Reading</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 opacity-70">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-500 mb-1 leading-tight">2025년 6월 제3회 수학</h3>
                <p className="text-sm text-gray-400 font-medium">Math</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 opacity-70">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-500 mb-1 leading-tight">2025년 6월 제4회 독해문법</h3>
                <p className="text-sm text-gray-400 font-medium">Reading</p>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 페이지 번호 (Pagination) */}
        <div className="flex justify-center items-center gap-2">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white bg-[#425486] shadow-sm">
            1
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            2
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            3
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            4
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}