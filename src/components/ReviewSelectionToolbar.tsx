import { useEffect, useRef, useState } from 'react';
import { Highlighter, Underline, BookOpen, Bot } from 'lucide-react';
import { AiTutorAction, AI_TUTOR_ACTION_LABELS } from '../utils/aiTutor';

export type HighlightColor = 'yellow' | 'blue' | 'pink';

const COLORS: { key: HighlightColor; bg: string; ring: string }[] = [
  { key: 'yellow', bg: '#FDE68A', ring: '#EAB308' },
  { key: 'blue', bg: '#BFDBFE', ring: '#3B82F6' },
  { key: 'pink', bg: '#FBCFE8', ring: '#EC4899' },
];

interface ReviewSelectionToolbarProps {
  highlightColor: HighlightColor;
  underlineColor: HighlightColor;
  onHighlight: (color: HighlightColor) => void;
  onUnderline: (color: HighlightColor) => void;
  onHighlightColorChange: (color: HighlightColor) => void;
  onUnderlineColorChange: (color: HighlightColor) => void;
  onDictionary: (anchor: { x: number; y: number }) => void;
  onAiTutor: (action: AiTutorAction, anchor: { x: number; y: number }) => void;
}

function ColorSwatch({
  color,
  active,
  onClick,
}: {
  color: (typeof COLORS)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 rounded-full border-2 transition-transform ${
        active ? 'scale-110' : 'hover:scale-105'
      }`}
      style={{
        backgroundColor: color.bg,
        borderColor: active ? color.ring : 'rgba(0,0,0,0.1)',
      }}
      aria-label={`색상 ${color.key}`}
    />
  );
}

export function ReviewSelectionToolbar({
  highlightColor,
  underlineColor,
  onHighlight,
  onUnderline,
  onHighlightColorChange,
  onUnderlineColorChange,
  onDictionary,
  onAiTutor,
}: ReviewSelectionToolbarProps) {
  const [pickerFor, setPickerFor] = useState<null | 'highlight' | 'underline'>(null);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);
  const aiBtnRef = useRef<HTMLButtonElement>(null);
  const dictBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  const startLongPress = (target: 'highlight' | 'underline') => {
    longPressedRef.current = false;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      longPressedRef.current = true;
      setPickerFor(target);
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleHighlightClick = () => {
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    onHighlight(highlightColor);
  };

  const handleUnderlineClick = () => {
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    onUnderline(underlineColor);
  };

  const currentHighlight = COLORS.find((c) => c.key === highlightColor)!;
  const currentUnderline = COLORS.find((c) => c.key === underlineColor)!;

  const handleDictionaryClick = () => {
    const rect = dictBtnRef.current?.getBoundingClientRect();
    onDictionary({
      x: rect ? rect.left : 0,
      y: rect ? rect.bottom + 8 : 0,
    });
  };

  const handleAiActionClick = (action: AiTutorAction) => {
    const rect = aiBtnRef.current?.getBoundingClientRect();
    setShowAiMenu(false);
    onAiTutor(action, {
      x: rect ? rect.left - 120 : 0,
      y: rect ? rect.bottom + 8 : 0,
    });
  };

  return (
    <div className="relative">
      {/* Main toolbar */}
      <div className="bg-white border border-gray-200 rounded-full shadow-lg px-3 py-2 flex items-center gap-2">
        {/* Highlighter with long-press color picker */}
        <button
          className="relative w-10 h-10 md:w-9 md:h-9 rounded-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
          onClick={handleHighlightClick}
          onMouseDown={() => startLongPress('highlight')}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          onTouchStart={() => startLongPress('highlight')}
          onTouchEnd={cancelLongPress}
          onTouchCancel={cancelLongPress}
          aria-label="하이라이트 (길게 눌러 색상 변경)"
          title="탭: 하이라이트 · 길게 누르기: 색상 변경"
        >
          <Highlighter className="h-5 w-5 md:h-[18px] md:w-[18px] text-gray-700" />
          <span
            className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white"
            style={{ backgroundColor: currentHighlight.bg }}
          />
        </button>

        {/* Underline with long-press color picker */}
        <button
          className="relative w-10 h-10 md:w-9 md:h-9 rounded-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
          onClick={handleUnderlineClick}
          onMouseDown={() => startLongPress('underline')}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          onTouchStart={() => startLongPress('underline')}
          onTouchEnd={cancelLongPress}
          onTouchCancel={cancelLongPress}
          aria-label="밑줄 (길게 눌러 색상 변경)"
          title="탭: 밑줄 · 길게 누르기: 색상 변경"
        >
          <Underline className="h-5 w-5 md:h-[18px] md:w-[18px] text-gray-700" />
          <span
            className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white"
            style={{ backgroundColor: currentUnderline.bg }}
          />
        </button>

        {/* Dictionary */}
        <button
          ref={dictBtnRef}
          className="w-10 h-10 md:w-9 md:h-9 rounded-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
          onClick={handleDictionaryClick}
          aria-label="사전"
          title="사전"
        >
          <BookOpen className="h-5 w-5 md:h-[18px] md:w-[18px] text-gray-700" />
        </button>

        {/* AI Tutor */}
        <button
          ref={aiBtnRef}
          className="w-10 h-10 md:w-9 md:h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 active:from-purple-700 active:to-purple-900 shadow-sm transition-colors"
          onClick={() => setShowAiMenu((v) => !v)}
          aria-label="AI 튜터"
          title="AI 튜터"
        >
          <Bot className="h-5 w-5 md:h-[18px] md:w-[18px] text-white" />
        </button>
      </div>

      {/* AI submenu */}
      {showAiMenu && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-full shadow-lg px-4 py-2 flex items-center gap-4 whitespace-nowrap z-10">
          {(['explain', 'translate', 'analyze', 'rewrite'] as AiTutorAction[]).map((action) => (
            <button
              key={action}
              onClick={() => handleAiActionClick(action)}
              className="text-sm text-gray-700 hover:text-purple-700 font-medium transition-colors"
            >
              {AI_TUTOR_ACTION_LABELS[action]}
            </button>
          ))}
        </div>
      )}

      {/* Color picker (opens on long-press) */}
      {pickerFor && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-white border border-gray-200 rounded-full shadow-lg px-3 py-2 flex items-center gap-2 z-10"
          onMouseLeave={() => setPickerFor(null)}
        >
          {COLORS.map((c) => {
            const active =
              pickerFor === 'highlight' ? c.key === highlightColor : c.key === underlineColor;
            return (
              <ColorSwatch
                key={c.key}
                color={c}
                active={active}
                onClick={() => {
                  if (pickerFor === 'highlight') {
                    onHighlightColorChange(c.key);
                    onHighlight(c.key);
                  } else {
                    onUnderlineColorChange(c.key);
                    onUnderline(c.key);
                  }
                  setPickerFor(null);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
