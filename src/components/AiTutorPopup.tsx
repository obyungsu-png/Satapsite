import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AiTutorAction, AI_TUTOR_ACTION_LABELS, askAiTutor } from '../utils/aiTutor';

interface AiTutorPopupProps {
  action: AiTutorAction;
  text: string;
  context?: string;
  x: number;
  y: number;
  onClose: () => void;
}

export function AiTutorPopup({ action, text, context, x, y, onClose }: AiTutorPopupProps) {
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState<string>('');
  const [error, setError] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setAnswer('');
    (async () => {
      const res = await askAiTutor(action, text, context);
      if (cancelled) return;
      if (!res) {
        setError(true);
      } else {
        setAnswer(res);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [action, text, context]);

  useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      let nx = x;
      let ny = y;
      if (nx + rect.width > window.innerWidth - 20) {
        nx = Math.max(20, window.innerWidth - rect.width - 20);
      }
      if (ny + rect.height > window.innerHeight - 20) {
        ny = Math.max(20, y - rect.height - 40);
      }
      setPos({ x: Math.max(20, nx), y: Math.max(20, ny) });
    }
  }, [x, y, loading, answer]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={popupRef}
      className="fixed z-[100] bg-white rounded-2xl shadow-2xl border border-purple-200 p-4 max-w-md"
      style={{ left: pos.x, top: pos.y, minWidth: 300 }}
    >
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white text-xs flex items-center justify-center font-bold">
            AI
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {AI_TUTOR_ACTION_LABELS[action]}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="text-xs text-gray-500 italic mb-2 line-clamp-2">"{text}"</div>

      {loading ? (
        <div className="flex items-center py-3">
          <div className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-500">AI가 답변 중...</span>
        </div>
      ) : error ? (
        <p className="text-sm text-gray-500 py-2">답변을 가져올 수 없습니다. 잠시 후 다시 시도해주세요.</p>
      ) : (
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{answer}</p>
      )}
    </div>,
    document.body
  );
}
