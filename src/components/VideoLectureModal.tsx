import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { X, Zap, BookOpen, Target, Languages, CheckCircle, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface VideoLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: number;
  testInfo?: any;
  currentQuestion?: any;
}

export function VideoLectureModal({ isOpen, onClose, questionId, testInfo, currentQuestion }: VideoLectureModalProps) {
  const [activeAITab, setActiveAITab] = useState<'해석' | '분석' | '단어' | '정답'>('해석');
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiResponses, setAIResponses] = useState<Record<string, string>>({});

  // AI 기능 순서: 해석 → 분석 → 단어 → 정답
  const aiTabs = [
    { id: '해석', icon: Languages, color: 'blue', description: '지문 해석' },
    { id: '분석', icon: Target, color: 'purple', description: '문제 분석' },
    { id: '단어', icon: BookOpen, color: 'green', description: '핵심 단어' },
    { id: '정답', icon: CheckCircle, color: 'orange', description: '정답 해설' }
  ] as const;

  const handleAIRequest = async (type: string) => {
    setIsAILoading(true);
    
    try {
      // Call DeepSeek API through server
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/ai-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          type,
          question: currentQuestion?.question || '',
          passage: currentQuestion?.passage || '',
          choices: currentQuestion?.choices || []
        })
      });

      if (!response.ok) {
        throw new Error('AI 분석 요청 실패');
      }

      const data = await response.json();
      
      if (data.success) {
        setAIResponses(prev => ({
          ...prev,
          [type]: data.response
        }));
        toast.success(`${type} AI 분석 완료!`);
      } else {
        throw new Error(data.error || 'AI 분석 실패');
      }
    } catch (error) {
      console.error('AI request error:', error);
      
      // Fallback to mock response for demo
      const mockResponses: Record<string, string> = {
        '해석': `**지문 해석**\n\n이 지문은 [주제]에 대해 설명하고 있습니다.\n\n주요 내용:\n- 첫 번째 단락: ...\n- 두 번째 단락: ...\n- 핵심 논지: ...\n\n(DeepSeek API 연결 필요 - 현재는 데모 모드)`,
        '분석': `**문제 분석**\n\n이 문제는 [유형] 문제입니다.\n\n핵심 포인트:\n✓ 출제 의도: ...\n✓ 해결 전략: ...\n✓ 주의사항: ...\n\n(DeepSeek API 연결 필요 - 현재는 데모 모드)`,
        '단어': `**핵심 단어**\n\n📚 중요 어휘:\n\n1. **agglomeration** - 집적, 집합\n   예문: urban agglomeration economies\n\n2. **foster** - 촉진하다, 육성하다\n   예문: foster innovation\n\n(DeepSeek API 연결 필요 - 현재는 데모 모드)`,
        '정답': `**정답 해설**\n\n✅ 정답: B\n\n선택지 분석:\nA. ❌ [이유]\nB. ✅ [정답 근거]\nC. ❌ [이유]\nD. ❌ [이유]\n\n(DeepSeek API 연결 필요 - 현재는 데모 모드)`
      };
      
      setAIResponses(prev => ({
        ...prev,
        [type]: mockResponses[type] || '내용을 생성 중입니다...'
      }));
      
      toast.info('데모 모드로 실행 중입니다. DeepSeek API 연결이 필요합니다.');
    } finally {
      setIsAILoading(false);
    }
  };

  const videoData = {
    title: `⚡ 유형 뽀개기: 문제 ${questionId}번`,
    description: `${testInfo?.title || "SAT 기출문제"} - AI와 함께 완벽하게 마스터하세요!`,
    instructor: "AI 학습 코치",
    duration: "맞춤형 학습"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[85vh] p-0 flex flex-col bg-white">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
                <Zap className="h-5 w-5 text-white fill-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  {videoData.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-600 mt-0.5 font-medium">
                  {videoData.instructor} · {videoData.duration}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-white/50 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 p-6 overflow-hidden bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
            {/* AI 기능 영역 (왼쪽, 3/5) */}
            <div className="lg:col-span-3 h-full flex flex-col">
              {/* AI 탭 버튼 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-4">
                <div className="grid grid-cols-4 gap-2">
                  {aiTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeAITab === tab.id;
                    const colorClasses = {
                      blue: 'bg-blue-500 text-white',
                      purple: 'bg-purple-500 text-white',
                      green: 'bg-green-500 text-white',
                      orange: 'bg-orange-500 text-white'
                    };
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveAITab(tab.id as typeof activeAITab)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                          isActive
                            ? `${colorClasses[tab.color]} shadow-md scale-105`
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mb-1 ${isActive ? '' : 'opacity-70'}`} />
                        <span className="text-xs font-bold">{tab.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI 응답 영역 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI {activeAITab}
                  </h4>
                  {!aiResponses[activeAITab] && (
                    <Button
                      onClick={() => handleAIRequest(activeAITab)}
                      disabled={isAILoading}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 h-auto"
                    >
                      {isAILoading ? '분석 중...' : 'AI 분석 시작'}
                    </Button>
                  )}
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                  {isAILoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
                      <p className="text-gray-600 font-medium">AI가 분석 중입니다...</p>
                    </div>
                  ) : aiResponses[activeAITab] ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {aiResponses[activeAITab]}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-4 rounded-2xl mb-4">
                        <Sparkles className="w-12 h-12 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        AI {activeAITab} 분석
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-sm">
                        {aiTabs.find(t => t.id === activeAITab)?.description}을 AI가 자세히 분석해드립니다.
                      </p>
                      <Button
                        onClick={() => handleAIRequest(activeAITab)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-6 py-2.5"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI 분석 시작
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 유사 문제 추천 (오른쪽, 2/5) */}
            <div className="lg:col-span-2 h-full flex flex-col">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    유사 유형 문제 (3개)
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">Training에서 같은 유형 연습하기</p>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto space-y-3">
                  {/* Placeholder for similar problems from Training */}
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="border border-gray-200 rounded-lg p-3 hover:border-orange-300 hover:bg-orange-50/50 transition-all cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-700 text-sm font-bold flex-shrink-0">
                          {item}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-gray-900 text-sm mb-1">
                            유사 문제 #{item}
                          </h5>
                          <p className="text-xs text-gray-600 mb-2">
                            같은 유형 · 같은 난이도
                          </p>
                          <div className="flex gap-1">
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">독해</span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">보통</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800 leading-relaxed">
                      💡 <strong>Training 연동 예정</strong><br/>
                      같은 난이도, 같은 유형의 문제를 자동으로 추천해드립니다.
                    </p>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <Button
                    onClick={onClose}
                    className="w-full bg-gray-900 text-white hover:bg-gray-800 font-medium py-5 rounded-lg shadow-sm"
                  >
                    학습 완료
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}