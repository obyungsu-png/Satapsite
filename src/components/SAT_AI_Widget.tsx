import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Bot, User } from 'lucide-react';
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
          background: linear-gradient(135deg, #a9c7ff 0%, #76dbe5 100%);
          color: #1f2937;
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
          border: 1px solid rgba(255, 255, 255, 0.7);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 24px rgba(96, 165, 250, 0.22), inset 0 1px 0 rgba(255,255,255,0.4);
          transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
          position: relative;
          overflow: hidden;
        }
        .sat-ai-action-btn::before {
          content: '';
          position: absolute;
          inset: 4px 7px auto;
          height: 16px;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.38), rgba(255,255,255,0));
          pointer-events: none;
        }
        .sat-ai-action-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 14px 28px rgba(96, 165, 250, 0.3), 0 0 0 3px rgba(125, 211, 252, 0.18);
          filter: saturate(1.04);
        }
        .sat-ai-action-btn.practice,
        .sat-ai-action-btn.ai {
          background:
            radial-gradient(circle at 34% 24%, rgba(199, 218, 255, 0.95) 0 20%, transparent 42%),
            linear-gradient(135deg, #a9c7ff 0%, #96d8f2 52%, #76dbe5 100%);
        }
        .sat-ai-action-btn svg {
          position: relative;
          z-index: 1;
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
          color: #0f766e;
        }
      `}</style>

      {/* Action buttons — Practice and AI Tutor (가로 정렬) */}
      <div className="sat-ai-action-row">
        {onPracticeClick && (
          <div className="sat-ai-action-col">
            <button
              onClick={() => onPracticeClick?.()}
              className="sat-ai-action-btn practice"
              aria-label="Practice"
              title="Practice"
            >
              <svg width="34" height="34" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                <path d="M11 13.5C11 11.9 12.3 10.6 13.9 10.6H21.5V32.4C18.7 30.7 15.5 30.7 12.6 32.1C11.8 32.5 11 31.9 11 31V13.5Z" fill="url(#practicePageLeftGradient)" stroke="rgba(255,255,255,0.92)" strokeWidth="2" strokeLinejoin="round" />
                <path d="M22.5 10.6H30.1C31.7 10.6 33 11.9 33 13.5V31C33 31.9 32.2 32.5 31.4 32.1C28.5 30.7 25.3 30.7 22.5 32.4V10.6Z" fill="url(#practicePageRightGradient)" stroke="rgba(255,255,255,0.92)" strokeWidth="2" strokeLinejoin="round" />
                <path d="M16 16.6H19.2M16 21.2H19.2M24.8 16.6H28M24.8 21.2H28" stroke="#8aa0c0" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M13.6 29.4C16 28.5 18.7 28.8 21.5 30.6C24.3 28.8 27 28.5 30.4 29.4" stroke="#3cc7bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21.5 11.5V31.8" stroke="#c7d6ef" strokeWidth="1.5" strokeLinecap="round" />
                <defs>
                  <linearGradient id="practicePageLeftGradient" x1="11" y1="10" x2="22" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffffff" />
                    <stop offset="1" stopColor="#eef7ff" />
                  </linearGradient>
                  <linearGradient id="practicePageRightGradient" x1="22" y1="10" x2="33" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffffff" />
                    <stop offset="1" stopColor="#e8fbff" />
                  </linearGradient>
                </defs>
              </svg>
            </button>
            <span className="sat-ai-action-label">Practice</span>
          </div>
        )}
        <div className="sat-ai-action-col">
          <button
            onClick={() => setIsOpen(true)}
            className="sat-ai-action-btn ai"
            aria-label="AI 튜터"
            title="AI 튜터"
          >
            <svg width="38" height="38" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <path d="M13.5 16.5L10.3 7.5L17.9 13.5" fill="#c8d2df" stroke="#6f7684" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M34.5 16.5L37.7 7.5L30.1 13.5" fill="#c8d2df" stroke="#6f7684" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M13.6 30.2C13.2 30.8 12.6 32 12.6 33.7C12.6 37.5 17.1 39.9 24 39.9C30.9 39.9 35.4 37.5 35.4 33.7C35.4 32 34.8 30.8 34.4 30.2" fill="#b9c5d2" />
              <rect x="9.5" y="12" width="29" height="23" rx="9" fill="url(#aiBotHeadGradient)" />
              <rect x="12.4" y="17" width="23.2" height="12.2" rx="5.3" fill="url(#aiBotVisorGradient)" stroke="#1f2530" strokeWidth="1.2" />
              <path d="M18.2 20.5L21.1 23.3L18.2 26.1" stroke="#57d3de" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M25.1 23.3H30.2" stroke="#5eead4" strokeWidth="2.8" strokeLinecap="round" />
              <ellipse cx="24" cy="34.2" rx="7.4" ry="2.8" fill="#ecfeff" stroke="#7f8b99" strokeWidth="1.4" />
              <path d="M21 34.2H27" stroke="#8bb3bf" strokeWidth="1.1" strokeLinecap="round" />
              <circle cx="12.7" cy="24" r="2.4" fill="#8f9baa" />
              <circle cx="35.3" cy="24" r="2.4" fill="#8f9baa" />
              <defs>
                <linearGradient id="aiBotHeadGradient" x1="14" y1="11" x2="32" y2="37" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f8fbff" />
                  <stop offset="0.52" stopColor="#b7c4d1" />
                  <stop offset="1" stopColor="#7c8796" />
                </linearGradient>
                <linearGradient id="aiBotVisorGradient" x1="12" y1="17" x2="36" y2="29" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#101522" />
                  <stop offset="1" stopColor="#28313f" />
                </linearGradient>
              </defs>
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
                  <svg width="30" height="30" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <path d="M13.5 16.5L10.3 7.5L17.9 13.5" fill="#c8d2df" stroke="#6f7684" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M34.5 16.5L37.7 7.5L30.1 13.5" fill="#c8d2df" stroke="#6f7684" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M13.6 30.2C13.2 30.8 12.6 32 12.6 33.7C12.6 37.5 17.1 39.9 24 39.9C30.9 39.9 35.4 37.5 35.4 33.7C35.4 32 34.8 30.8 34.4 30.2" fill="#b9c5d2" />
                    <rect x="9.5" y="12" width="29" height="23" rx="9" fill="url(#aiBotHeadMiniGradient)" />
                    <rect x="12.4" y="17" width="23.2" height="12.2" rx="5.3" fill="url(#aiBotVisorMiniGradient)" stroke="#1f2530" strokeWidth="1.2" />
                    <path d="M18.2 20.5L21.1 23.3L18.2 26.1" stroke="#57d3de" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M25.1 23.3H30.2" stroke="#5eead4" strokeWidth="2.8" strokeLinecap="round" />
                    <ellipse cx="24" cy="34.2" rx="7.4" ry="2.8" fill="#ecfeff" stroke="#7f8b99" strokeWidth="1.4" />
                    <defs>
                      <linearGradient id="aiBotHeadMiniGradient" x1="14" y1="11" x2="32" y2="37" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#f8fbff" />
                        <stop offset="0.52" stopColor="#b7c4d1" />
                        <stop offset="1" stopColor="#7c8796" />
                      </linearGradient>
                      <linearGradient id="aiBotVisorMiniGradient" x1="12" y1="17" x2="36" y2="29" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#101522" />
                        <stop offset="1" stopColor="#28313f" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <span className="font-bold text-gray-800">SAT AI 튜터</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #cffafe 100%)', color: '#0f766e' }}>
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
                  className="text-white shrink-0 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #a9c7ff 0%, #76dbe5 100%)' }}
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
