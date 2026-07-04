import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const AI_MODEL_OPTIONS = [
  { value: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
  { value: 'deepseek-chat', label: 'DeepSeek' },
  { value: 'glm-4.7', label: 'SGR 2.0' },
  { value: 'glm-5.2', label: 'GLM 5.2' },
] as const;

type AIModel = typeof AI_MODEL_OPTIONS[number]['value'];

function getStoredAIModel(): AIModel {
  const stored = localStorage.getItem('selectedAIModel');
  const valid = AI_MODEL_OPTIONS.find(o => o.value === stored);
  if (valid) return valid.value;
  localStorage.setItem('selectedAIModel', 'claude-sonnet-5');
  return 'claude-sonnet-5';
}


// Streaming API call helper
function getAIConfig(model: string): { apiKey: string; endpoint: string; modelName: string } {
  const m = (model || '').toLowerCase();

  let apiKey = '';
  let endpoint = '';
  let modelName = model;

  if (m.includes('claude')) {
    apiKey = 'sk-dc6f9e27f2a453bdef8063cbf9c7330ff2ccec3491385740b094898bb304329a';
    // Try direct first (fast), proxy as fallback
    endpoint = 'https://apiclaude.cc/v1/chat/completions';
    modelName = 'claude-sonnet-5';
  } else if (m.includes('deepseek')) {
    apiKey = '';
    endpoint = '/api/deepseek/chat/completions';
    modelName = 'deepseek-chat';
  } else if (m.includes('glm-5.2')) {
    apiKey = 'dc2213720f4b4a88ae06ddbd434ab1dd.qDGcLtBM9gGqp6ff';
    endpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    modelName = 'glm-5.2';
  } else if (m.includes('glm-4.7')) {
    apiKey = 'dc2213720f4b4a88ae06ddbd434ab1dd.qDGcLtBM9gGqp6ff';
    endpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    modelName = 'glm-4.7';
  } else {
    apiKey = '';
    endpoint = 'https://api.openai.com/v1/chat/completions';
    modelName = 'gpt-4o-mini';
  }

  if (!apiKey) {
    console.warn('[SAT AI] Unknown model:', model, '- falling back to claude-sonnet-5');
    apiKey = 'sk-dc6f9e27f2a453bdef8063cbf9c7330ff2ccec3491385740b094898bb304329a';
    endpoint = '/api/claude/chat/completions';
    modelName = 'claude-sonnet-5';
  }

  return { apiKey, endpoint, modelName };
}

async function callAIStream(
  model: string,
  messages: { role: string; content: string }[],
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
): Promise<void> {
  const { apiKey, endpoint, modelName } = getAIConfig(model);

  // For Claude: try direct call first (fast), fall back to server proxy if CORS blocks
  const isClaude = (model || '').toLowerCase().includes('claude');
  const proxyEndpoint = isClaude ? '/api/claude/chat/completions' : null;

  async function tryFetch(url: string): Promise<Response | null> {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          max_tokens: 800,
          temperature: 0.7,
          stream: true,
        })
      });
      return res;
    } catch {
      return null; // CORS or network error, try fallback
    }
  }

  console.log('[SAT AI] stream request model:', model, '-> direct:', endpoint, 'fallback:', proxyEndpoint);

  try {
    let response = await tryFetch(endpoint);

    // Fall back to proxy if direct call failed and we have a proxy
    if (!response && proxyEndpoint) {
      console.log('[SAT AI] Direct call failed, trying proxy:', proxyEndpoint);
      response = await tryFetch(proxyEndpoint);
    }

    if (!response) {
      throw new Error('All endpoints failed');
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API error (${response.status}): ${errText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            onToken(delta);
          }
        } catch {
          // skip malformed JSON chunks
        }
      }
    }

    onDone();
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

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

function parseInlineMarkdown(line: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = line;
  let idx = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/);
    const italicMatch = remaining.match(/^(.*?)\*(?!\*)(.+?)\*(?!\*)(.*)$/);
    const mathMatch = remaining.match(/^(.*?)\\\((.+?)\\\)(.*)$/);
    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)$/);

    const matches = [
      { type: 'bold', match: boldMatch, end: boldMatch ? boldMatch[1].length + boldMatch[2].length + 4 : Infinity },
      { type: 'italic', match: italicMatch, end: italicMatch ? italicMatch[1].length + italicMatch[2].length + 2 : Infinity },
      { type: 'math', match: mathMatch, end: mathMatch ? mathMatch[1].length + mathMatch[2].length + 4 : Infinity },
      { type: 'code', match: codeMatch, end: codeMatch ? codeMatch[1].length + codeMatch[2].length + 2 : Infinity },
    ].filter(m => m.match).sort((a, b) => a.end - b.end);

    if (matches.length === 0) {
      nodes.push(<span key={idx++}>{remaining}</span>);
      break;
    }

    const first = matches[0];
    const m = first.match!;

    if (m[1]) {
      nodes.push(<span key={idx++}>{m[1]}</span>);
    }

    const content = m[2];
    if (first.type === 'bold') {
      nodes.push(<strong key={idx++} className="font-bold text-gray-900">{content}</strong>);
    } else if (first.type === 'italic') {
      nodes.push(<em key={idx++} className="italic text-gray-700">{content}</em>);
    } else if (first.type === 'math') {
      nodes.push(<span key={idx++} className="px-1 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">{content}</span>);
    } else if (first.type === 'code') {
      nodes.push(<code key={idx++} className="px-1 py-0.5 bg-gray-100 text-pink-600 rounded text-xs font-mono">{content}</code>);
    }

    remaining = m[3];
  }

  return nodes;
}

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '' || trimmed === '---') {
      result.push(<div key={key++} className="h-2" />);
      continue;
    }

    if (/^#\s+/.test(trimmed)) {
      const content = trimmed.replace(/^#\s+/, '');
      result.push(<h1 key={key++} className="text-lg font-bold text-indigo-700 mt-3 mb-1">{parseInlineMarkdown(content)}</h1>);
      continue;
    }

    if (/^##\s+/.test(trimmed)) {
      const content = trimmed.replace(/^##\s+/, '');
      result.push(<h2 key={key++} className="text-base font-bold text-cyan-700 mt-3 mb-1">{parseInlineMarkdown(content)}</h2>);
      continue;
    }

    if (/^###\s+/.test(trimmed)) {
      const content = trimmed.replace(/^###\s+/, '');
      result.push(<h3 key={key++} className="text-sm font-bold text-teal-600 mt-2 mb-1">{parseInlineMarkdown(content)}</h3>);
      continue;
    }

    if (/^-\s+/.test(trimmed)) {
      const content = trimmed.replace(/^-\s+/, '');
      result.push(<div key={key++} className="flex items-start gap-2 ml-1 my-0.5"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" /><span className="text-gray-700">{parseInlineMarkdown(content)}</span></div>);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s+/, '');
      result.push(<div key={key++} className="flex items-start gap-2 ml-1 my-0.5"><span className="text-xs font-bold text-cyan-600 shrink-0 mt-0.5">{trimmed.match(/^\d+/)?.[0]}.</span><span className="text-gray-700">{parseInlineMarkdown(content)}</span></div>);
      continue;
    }

    result.push(<p key={key++} className="text-gray-800 leading-relaxed my-1">{parseInlineMarkdown(line)}</p>);
  }

  return result;
}

export function SAT_AI_Widget({ context, onPracticeClick }: SAT_AI_WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(getStoredAIModel);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  useEffect(() => {
    const handleOpenWidget = () => setIsOpen(true);
    window.addEventListener('sat-ai-open-widget', handleOpenWidget);
    return () => window.removeEventListener('sat-ai-open-widget', handleOpenWidget);
  }, []);


  const handleModelChange = (value: string) => {
    const model = value as AIModel;
    localStorage.setItem('selectedAIModel', model);
    setSelectedModel(model);
    const label = AI_MODEL_OPTIONS.find((option) => option.value === model)?.label;
    toast.success(`AI 모델이 ${label}(으)로 변경되었습니다.`);
  };


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

    const userMsg: ChatMessage = { role: 'user', content: userMessage, timestamp: Date.now() };
    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    setIsAiLoading(true);

    // Add empty assistant message that will be filled by streaming
    const assistantMsg: ChatMessage = { role: 'assistant', content: '', timestamp: Date.now() };
    setChatMessages([...updatedHistory, assistantMsg]);

    const messages = [
      { role: 'system', content: buildSystemPrompt() },
      ...updatedHistory.map(msg => ({ role: msg.role, content: msg.content }))
    ];

    await callAIStream(
      selectedModel,
      messages,
      (token) => {
        // Append token to the last assistant message
        setChatMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === 'assistant') {
            return [...prev.slice(0, -1), { ...lastMsg, content: lastMsg.content + token }];
          }
          return prev;
        });
      },
      () => {
        setIsAiLoading(false);
      },
      (err) => {
        console.error('SAT AI stream error:', err);
        setChatMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === 'assistant' && !lastMsg.content) {
            return [...prev.slice(0, -1), { ...lastMsg, content: "죄송해요, 일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요. 😢" }];
          }
          return prev;
        });
        setIsAiLoading(false);
      }
    );
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
          border: 1px solid rgba(255, 255, 255, 0.72);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 24px rgba(96, 165, 250, 0.22), inset 0 1px 0 rgba(255,255,255,0.42);
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
          background: linear-gradient(180deg, rgba(255,255,255,0.42), rgba(255,255,255,0));
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
            radial-gradient(circle at 34% 24%, rgba(199, 218, 255, 0.9) 0 20%, transparent 42%),
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
          background: linear-gradient(180deg, #f5fbff 0%, #ffffff 42%, #f7fefe 100%);
          z-index: 61;
          box-shadow: -8px 0 30px rgba(14, 116, 144, 0.16);
          display: flex;
          flex-direction: column;
          animation: satAiSlideIn 0.25s ease;
        }
        .sat-ai-panel-header {
          background: linear-gradient(135deg, rgba(219, 234, 254, 0.9) 0%, rgba(207, 250, 254, 0.9) 100%);
          border-bottom: 1px solid rgba(125, 211, 252, 0.45);
        }
        .sat-ai-welcome-card {
          background: linear-gradient(135deg, rgba(239, 246, 255, 0.92) 0%, rgba(236, 254, 255, 0.92) 100%);
          border: 1px solid rgba(125, 211, 252, 0.32);
          box-shadow: 0 14px 34px rgba(14, 116, 144, 0.08);
        }
        .sat-ai-input-bar {
          background: linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(240, 253, 250, 0.95) 100%);
          border-top: 1px solid rgba(125, 211, 252, 0.35);
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
        <div className="sat-ai-action-col">
          <button
            onClick={() => onPracticeClick?.()}
            className="sat-ai-action-btn practice"
            aria-label="Practice"
            title="Practice"
          >
            <svg width="34" height="34" viewBox="0 0 44 44" fill="none" aria-hidden="true">
              <rect x="12" y="8.5" width="20" height="27" rx="5" fill="rgba(255,255,255,0.92)" stroke="rgba(255,255,255,0.95)" strokeWidth="2" />
              <path d="M17 16.5L19 18.5L23 14.5" stroke="#21b7aa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M25.5 17H29" stroke="#8aa0c0" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M17 25L19 27L23 23" stroke="#21b7aa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M25.5 25.5H29" stroke="#8aa0c0" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="22" cy="10" r="2.2" fill="#7dd3fc" />
            </svg>
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
            <div className="flex items-center justify-between px-5 py-4 sat-ai-panel-header">
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
                <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="h-6 text-xs px-2 py-0.5 bg-white/70 border border-indigo-200 hover:border-indigo-400 rounded-full outline-none cursor-pointer focus:ring-1 focus:ring-indigo-300 appearance-none"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'none', paddingRight: '20px' }}
                >
                  {AI_MODEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </option>
                  ))}
                </select>
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
                <div className="sat-ai-welcome-card rounded-2xl px-4">
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
              <div className="flex-1 overflow-y-auto px-5 py-4" style={{ background: 'linear-gradient(180deg, rgba(240, 249, 255, 0.62) 0%, rgba(240, 253, 250, 0.62) 100%)' }}>
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
                            ? renderMarkdown(cleanContent)
                            : <span>{cleanContent}</span>
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

            <div className="p-3 shrink-0 sat-ai-input-bar">
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
                  className="flex-1 text-sm bg-white/80 border-cyan-100 focus:bg-white focus:border-cyan-300 transition-colors"
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
