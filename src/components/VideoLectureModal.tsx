import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { X, Zap, BookOpen, Target, Languages, CheckCircle, Sparkles, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from '../utils/supabase/info';

const AI_MODEL_OPTIONS = [
  { value: 'claude-4', label: 'Claude 4' },
  { value: 'glm-4.7', label: 'SGR 2.0' },
  { value: 'glm-5.2', label: 'GLM 5.2' }
] as const;

type AIModel = typeof AI_MODEL_OPTIONS[number]['value'];

function getStoredAIModel(): AIModel {
  return (localStorage.getItem('selectedAIModel') as AIModel) || 'claude-4';
}

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
  const [selectedModel, setSelectedModel] = useState<AIModel>(getStoredAIModel);

  useEffect(() => {
    setSelectedModel(getStoredAIModel());
  }, [isOpen]);

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
      // 타입별 시스템 프롬프트 구성
      const promptMap: Record<string, string> = {
        '해석': '당신은 SAT 전문 강사입니다. 다음 SAT 지문을 자연스럽고 정확한 한국어로 번역해주세요. 학생이 내용을 쉽게 이해할 수 있도록 문단별로 번역하세요.',
        '분석': '당신은 SAT 전문 강사입니다. 다음 SAT 문제를 분석해주세요. 문제 유형, 출제 의도, 해결 전략, 주의사항을 한국어로 명확하게 설명해주세요.',
        '단어': '당신은 SAT 어휘 전문가입니다. 다음 SAT 지문에서 학생이 반드시 알아야 할 핵심 어휘 5~7개를 추출하고, 각 단어의 품사·뜻·예문을 한국어로 설명해주세요.',
        '정답': '당신은 SAT 전문 강사입니다. 다음 SAT 문제의 정답을 찾고, 정답인 이유와 오답인 이유를 각 선택지별로 한국어로 상세히 해설해주세요.'
      };

      const passageText = currentQuestion?.passage || '지문 없음';
      const questionText = currentQuestion?.question || '문제 없음';
      const choicesArr = currentQuestion?.choices || [];
      const choicesText = Array.isArray(choicesArr)
        ? choicesArr.map((c: any, i: number) => `${String.fromCharCode(65 + i)}. ${c.text || c}`).join('\n')
        : String(choicesArr);

      const userContent = `지문:\n${passageText}\n\n문제:\n${questionText}\n\n선택지:\n${choicesText}`;
      const systemContent = promptMap[type] || '다음 SAT 문제를 한국어로 분석해주세요.';

      // GLM 외 모든 모델은 Claude(apiclaude.cc) 통합
      const isGlm = selectedModel.includes('glm');
      let endpoint: string;
      let apiKey: string;
      let modelName: string;

      if (isGlm) {
        endpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
        apiKey = 'dc2213720f4b4a88ae06ddbd434ab1dd.qDGcLtBM9gGqp6ff';
        modelName = selectedModel.includes('5.2') ? 'glm-5.2' : 'glm-4.7';
      } else {
        endpoint = '/api/claude/chat/completions';
        apiKey = 'sk-b61aadf9ae08a918738cd7adee5f261c550b41bc4bf95987602816c3ce9e84f0';
        modelName = 'claude-sonnet-5';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemContent },
            { role: 'user', content: userContent }
          ],
          max_tokens: 1500,
          temperature: 0.4
        })
      });

      if (!response.ok) {
        throw new Error(`AI 분석 요청 실패 (${response.status})`);
      }

      const data = await response.json();
      const aiText = data.choices?.[0]?.message?.content || '응답을 생성하지 못했습니다.';

      setAIResponses(prev => ({
        ...prev,
        [type]: aiText
      }));
      toast.success(`${type} AI 분석 완료! (${AI_MODEL_OPTIONS.find((option) => option.value === selectedModel)?.label})`);
    } catch (error) {
      console.error('AI request error:', error);
      setAIResponses(prev => ({
        ...prev,
        [type]: `AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.\n\n오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      }));
      toast.error('AI 분석 중 오류가 발생했습니다.');
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
