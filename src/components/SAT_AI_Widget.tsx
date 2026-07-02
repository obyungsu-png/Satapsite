import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Bot, User, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

function getAIModel(): string {
  return localStorage.getItem('selectedAIModel') || 'SGR-2.0';
}

const GLM_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

const suggestedQuestions = [
  '이 문제를 분석해줘',
  '이런 문제를 빨리 푸는 팁을 알려줘',
  '비슷한 유형의 문제를 더 연습하고 싶어',
  '오답 노트를 어떻게 작성해야 해?',
];

interface SAT_AI_WidgetProps {
  context?: {
    question?: string;
    passage?: string;
    choices?: string[];
    correctAnswer?: string;
    userAnswer?: string;
    isCorrect?: boolean;
    questionType?: string;
  };
  onPracticeClick?: () => void;
}

export function SAT_AI_Widget({ context, onPracticeClick }: SAT_AI_WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  useEffect(() => {
    const handleOpenWidget = () => setIsOpen(true);
    window.addEventListener('sat-ai-open-widget', handleOpenWidget);
    return () => window.removeEventListener('sat-ai-open-widget', handleOpenWidget);
  }, []);

  const handleSuggestedQuestion = (q: string) => {
    setChatInput(q);
  };

  const buildSystemPrompt = () => {
    let base = '당신은 SAT 시험 전문 AI 튜터입니다. 한국인 학생이 SAT를 준비하는 것을 돕고 있습니다. 친절하고 명확하게 한국어로 답변해주세요. 답변은 간결하고 실용적으로 해주세요.\n\n학생이 "이 문제를 분석해줘"라고 물으면, 다음 항목을 모두 포함한 종합 분석을 제공하세요:\n1. 문제 분석: 지문/문제의 핵심 내용과 출제 의도\n2. 핵심 포인트: 이 유형의 문제를 풀 때 반드시 체크해야 할 점\n3. 핵심 단어: 지문과 선택지에서 중요한 영어 단어와 뜻\n4. 오답 노트: 틀릴 수 있는 함정과 오답을 피하는 방법\n5. 풀이 전략: 빠르고 정확하게 푸는 팁\n\n질문이 분석을 요구하지 않더라도, 필요한 경우 위 항목 중 관련된 내용을 자연스럽게 섞어서 답변해주세요.';

    if (context?.question) {
      base += `\n\n현재 학생이 푸는 문제:\n- 문제: ${context.question}`;
      if (context.passage) base += `\n- 지문: ${context.passage.substring(0, 500)}`;
      if (context.choices) base += `\n- 선택지: ${context.choices.join(', ')}`;
      if (context.correctAnswer) base += `\n- 정답: ${context.correctAnswer}`;
      if (context.userAnswer) base += `\n- 학생 답: ${context.userAnswer}`;
      if (context.isCorrect !== undefined) base += `\n- 정오답: ${context.isCorrect ? '정답' : '오답'}`;
    }

    return base;
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiLoading) return;

    const userMessage = chatInput;
    setChatInput('');

    const newHistory: ChatMessage[] = [
      ...chatMessages,
      { role: 'user', content: userMessage, timestamp: Date.now() }
    ];
    setChatMessages(newHistory);
    setIsAiLoading(true);

    try {
      const model = getAIModel();
      const isGlm = model.toLowerCase().startsWith('glm-') || model.toLowerCase() === 'sgr-2.0';
      const endpoint = isGlm ? GLM_ENDPOINT : DEEPSEEK_ENDPOINT;
      const apiKey = isGlm ? 'dc2213720f4b4a88ae06ddbd434ab1dd.qDGcLtBM9gGqp6ff' : '';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...newHistory.map(msg => ({ role: msg.role, content: msg.content }))
          ],
          max_tokens: 800,
          temperature: 0.7,
        })
      });

      const data = await response.json();

      if (data.choices && data.choices[0]) {
        const reply = data.choices[0].message.content;
        setChatMessages(prev => [
          ...prev,
          { role: 'assistant', content: reply, timestamp: Date.now() }
        ]);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      console.error('SAT AI error:', err);
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: "죄송해요, 일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요. 😢", timestamp: Date.now() }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .sat-ai-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .sat-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          flex-shrink: 0;
        }
        .sat-chat-bubble {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
        }
        .sat-chat-bubble.user {
          background-color: #6366f1;
          color: white;
          border-bottom-right-radius: 2px;
        }
        .sat-chat-bubble.ai {
          background-color: #f3f4f6;
          color: #1f2937;
          border-bottom-left-radius: 2px;
        }
        .sat-ai-action-row {
          position: fixed;
          bottom: 80px;
          right: 20px;
          z-index: 55;
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }
        .sat-ai-action-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        .sat-ai-action-btn {
          width: 50px;
          height: 50px;
          padding: 0;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .sat-ai-action-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.35);
        }
        .sat-ai-action-btn.practice {
          background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 40%, #8b5cf6 100%);
        }
        .sat-ai-action-btn.ai {
          background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 40%, #8b5cf6 100%);
        }
        .sat-ai-action-label {
          font-size: 10px;
          font-weight: 600;
          line-height: 1;
          color: #64748b;
          text-align: center;
        }
        .sat-ai-face {
          position: relative;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sat-ai-face-circle {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #1e1b4b;
          position: relative;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sat-ai-face-circle svg {
          width: 18px;
          height: 18px;
        }
        .sat-ai-fab-eyes {
          display: flex;
          gap: 5px;
          align-items: center;
        }
        .sat-ai-fab-eyes span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #fff;
          display: block;
          opacity: 0.95;
        }
        .sat-ai-panel-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.35);
          z-index: 60;
          animation: satAiFadeIn 0.2s ease;
        }
        .sat-ai-panel {
          position: fixed;
          top: 0;
          right: 0;
          height: 100%;
          width: 420px;
          max-width: 100vw;
          background: #fff;
          z-index: 61;
          box-shadow: -8px 0 30px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          animation: satAiSlideIn 0.25s ease;
        }
        @keyframes satAiSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes satAiFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .sat-ai-suggestion {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 4px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          font-size: 14px;
          color: #374151;
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          width: 100%;
          text-align: left;
          transition: color 0.15s ease;
        }
        .sat-ai-suggestion:hover {
          color: #6366f1;
        }
      `}</style>

      {/* Action buttons — Practice and AI Tutor (가로 정렬) */}
      <div className="sat-ai-action-row">
        <div className="sat-ai-action-col">
          <button
            onClick={() => onPracticeClick?.()}
            className="sat-ai-action-btn practice"
            aria-label="Practice"
            title="Practice"
          >
            <BookOpen className="w-4 h-4" style={{ color: '#ffffff' }} />
          </button>
          <span className="sat-ai-action-label">Practice</span>
        </div>
        <div className="sat-ai-action-col">
          <button
            onClick={() => setIsOpen(true)}
            className="sat-ai-action-btn ai"
            aria-label="AI 튜터"
            title="AI 튜터"
          >
            <svg width="34" height="34" viewBox="0 0 40 42" fill="none">
              {/* Left ear */}
              <path d="M6 16 L8 4 L14 14" fill="#9ca3af" stroke="#6b7280" strokeWidth="1"/>
              <path d="M8 13 L9 6 L12 12" fill="#f3e8ff"/>
              {/* Right ear */}
              <path d="M26 14 L32 4 L34 16" fill="#9ca3af" stroke="#6b7280" strokeWidth="1"/>
              <path d="M28 12 L31 6 L32 13" fill="#f3e8ff"/>
              {/* Head base */}
              <rect x="5" y="11" width="30" height="24" rx="10" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1.2"/>
              {/* Screen face */}
              <rect x="9" y="15" width="22" height="15" rx="5" fill="#111827"/>
              {/* Left eye - > shape glowing purple */}
              <path d="M13 20 L17 22.5 L13 25" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="13.5" cy="20" r="1" fill="#c4b5fd"/>
              {/* Right eye - dash glowing cyan */}
              <line x1="23" y1="23" x2="29" y2="23" stroke="#67e8f9" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="29" cy="23" r="1" fill="#a5f3fc"/>
              {/* Body / shoulders */}
              <ellipse cx="20" cy="37" rx="10" ry="5" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1"/>
              {/* Body screen detail */}
              <rect x="16" y="35" width="8" height="3" rx="1.5" fill="#9ca3af"/>
            </svg>
          </button>
          <span className="sat-ai-action-label">AI 튜터</span>
        </div>
      </div>

      {/* AI 패널 (슬라이드인) */}
      {isOpen && (
        <>
          <div className="sat-ai-panel-overlay" onClick={() => setIsOpen(false)} />
          <div className="sat-ai-panel">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <span className="sat-ai-fab" style={{ width: 36, height: 36 }}>
                  {/* Mini cute robot cat avatar */}
                  <svg width="28" height="28" viewBox="0 0 40 42" fill="none">
                    {/* Left ear */}
                    <path d="M6 16 L8 4 L14 14" fill="#9ca3af" stroke="#6b7280" strokeWidth="1"/>
                    <path d="M8 13 L9 6 L12 12" fill="#f3e8ff"/>
                    {/* Right ear */}
                    <path d="M26 14 L32 4 L34 16" fill="#9ca3af" stroke="#6b7280" strokeWidth="1"/>
                    <path d="M28 12 L31 6 L32 13" fill="#f3e8ff"/>
                    {/* Head base */}
                    <rect x="5" y="11" width="30" height="24" rx="10" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1.2"/>
                    {/* Screen face */}
                    <rect x="9" y="15" width="22" height="15" rx="5" fill="#111827"/>
                    {/* Left eye */}
                    <path d="M13 20 L17 22.5 L13 25" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="13.5" cy="20" r="1" fill="#c4b5fd"/>
                    {/* Right eye */}
                    <line x1="23" y1="23" x2="29" y2="23" stroke="#67e8f9" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="29" cy="23" r="1" fill="#a5f3fc"/>
                    {/* Body */}
                    <ellipse cx="20" cy="37" rx="10" ry="5" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1"/>
                  </svg>
                </span>
                <span className="font-bold text-gray-800">SAT AI 튜터</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                  {getAIModel()}
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {chatMessages.length === 0 ? (
              <div className="flex-1 overflow-y-auto px-5 py-6">
                <p className="text-2xl font-bold text-gray-800 mb-1">hi~</p>
                <p className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-1">
                  SAT AI 튜터예요 <Sparkles className="w-5 h-5 text-yellow-400" />
                </p>
                <p className="text-sm text-gray-500 mt-2 mb-6">
                  {context?.question
                    ? '현재 푸는 문제에 대해 궁금한 점을 편하게 물어보세요'
                    : '문제 풀이, 유형 분석, 공부 방법 등 무엇이든 편하게 물어보세요'}
                </p>
                <div className="bg-gray-50 rounded-2xl px-4">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      className="sat-ai-suggestion"
                      onClick={() => handleSuggestedQuestion(q)}
                    >
                      <span>{q}</span>
                      <span className="text-gray-300">›</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50/50">
                <div className="flex flex-col space-y-4">
                  {chatMessages.map((msg, idx) => {
                    const cleanContent = msg.content.replace(/<think[\s\S]*?<\/think>/gi, '').trim();
                    return (
                      <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={msg.role === 'user' ? 'sat-user-avatar' : 'sat-ai-avatar'}>
                          {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`sat-chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                          {msg.role === 'assistant'
                            ? cleanContent.split('\n').map((line, i) => (
                                <span key={i}>
                                  {line}
                                  {i < cleanContent.split('\n').length - 1 && <br />}
                                </span>
                              ))
                            : cleanContent
                          }
                        </div>
                      </div>
                    );
                  })}
                  {isAiLoading && (
                    <div className="flex gap-2 flex-row">
                      <div className="sat-ai-avatar animate-pulse">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="sat-chat-bubble ai flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}

            <div className="p-3 border-t bg-white shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="질문을 입력하세요..."
                  className="flex-1 text-sm bg-gray-50 focus:bg-white transition-colors"
                  disabled={isAiLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                  disabled={!chatInput.trim() || isAiLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
