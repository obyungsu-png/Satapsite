import { useState, useRef, useEffect } from "react";
import { Pen, Eraser, Trash2, Minimize2 } from "lucide-react";

// ─── HandwritingOverlay ───────────────────────────
// 투명 SVG 캔버스를 콘텐츠 위에 덮어서 자유 필기 가능.
// 3가지 색상 + 두께 슬라이더 + 지우개 + 전체 삭제.
// 저장: localStorage(레슨+페이지 키, 용량 가드 포함). 메모리 우선.
// 용량 최소화: stroke = point 배열(JSON). 100스트로크 ≈ 80KB 이하.

export interface HandwritingOverlayProps {
  active: boolean;
  storageKey: string;          // e.g. `sgrClass_${lessonId}_${pageKey}`
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

type Point = { x: number; y: number };
type Stroke = {
  color: string;
  width: number;
  points: Point[];
};

const COLORS = [
  { key: "red", hex: "#ef4444", label: "빨강" },
  { key: "blue", hex: "#3b82f6", label: "파랑" },
  { key: "black", hex: "#1f2937", label: "검정" },
  { key: "white", hex: "#ffffff", label: "흰색" },
  { key: "skin", hex: "#ffd9b3", label: "살색" },
];

const WIDTHS = [2, 4, 6, 10];
const DEFAULT_WIDTH = 4;
const MAX_STORAGE_BYTES = 1_500_000; // 1.5MB 가드

function loadStrokes(key: string): Stroke[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStrokes(key: string, strokes: Stroke[]) {
  try {
    const raw = JSON.stringify(strokes);
    if (raw.length > MAX_STORAGE_BYTES) {
      // 용량 초과 시 저장 생략 (메모리엔 유지)
      return;
    }
    localStorage.setItem(key, raw);
  } catch {
    /* quota 에러 무시 */
  }
}

export default function HandwritingOverlay({
  active,
  storageKey,
}: HandwritingOverlayProps) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [color, setColor] = useState(COLORS[2].hex); // 검정 기본
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [eraser, setEraser] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const drawingRef = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0 });
  const [size, setSize] = useState({ w: 0, h: 0 });

  // 스토리지 로드 (키 변경 시)
  useEffect(() => {
    setStrokes(loadStrokes(storageKey));
    setCurrentStroke(null);
  }, [storageKey]);

  // 저장 (스트로크 변경 시)
  useEffect(() => {
    saveStrokes(storageKey, strokes);
  }, [strokes, storageKey]);

  // 컨테이너 크기 추적 (ResizeObserver)
  useEffect(() => {
    if (!active) return;
    const parent = svgRef.current?.parentElement;
    if (!parent) return;
    const update = () => {
      const r = parent.getBoundingClientRect();
      sizeRef.current = { w: r.width, h: r.height };
      setSize({ w: r.width, h: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(parent);
    window.addEventListener("scroll", update, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
    };
  }, [active]);

  const getPoint = (e: React.PointerEvent): Point => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!active) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drawingRef.current = true;
    const p = getPoint(e);
    if (eraser) {
      // 지우개: 가까운 스트로크 제거
      eraseAt(p);
    } else {
      setCurrentStroke({ color, width, points: [p] });
    }
  };

  const eraseAt = (p: Point) => {
    setStrokes(prev =>
      prev.filter(s => !s.points.some(pt => Math.hypot(pt.x - p.x, pt.y - p.y) < width * 3 + 6))
    );
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!active || !drawingRef.current) return;
    const p = getPoint(e);
    if (eraser) {
      eraseAt(p);
    } else if (currentStroke) {
      // 마지막 점과 거리가 있을 때만 추가 (용량 절약)
      const last = currentStroke.points[currentStroke.points.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) > 1.5) {
        setCurrentStroke({ ...currentStroke, points: [...currentStroke.points, p] });
      }
    }
  };

  const onPointerUp = () => {
    if (!active) return;
    drawingRef.current = false;
    if (currentStroke && currentStroke.points.length > 1) {
      setStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
  };

  const handleClear = () => {
    if (window.confirm("현재 페이지의 모든 필기를 삭제할까요?")) {
      setStrokes([]);
      setCurrentStroke(null);
    }
  };

  const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;

  const strokeToPath = (s: Stroke) => {
    if (s.points.length === 0) return "";
    const d = s.points
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ");
    return d;
  };

  if (!active) return null;

  return (
    <>
      {/* SVG 캔버스 오버레이 */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          pointerEvents: "auto",
          touchAction: "none",
          cursor: eraser ? "cell" : "crosshair",
          zIndex: 20,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {allStrokes.map((s, i) => (
          <path
            key={i}
            d={strokeToPath(s)}
            stroke={s.color}
            strokeWidth={s.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </svg>

      {/* 컨트롤 패널 */}
      {!collapsed ? (
        <div
          className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-3 flex flex-col gap-2"
          style={{ minWidth: 200 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">필기 도구</span>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
              title="접기"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 색상 */}
          <div className="flex items-center gap-2">
            {COLORS.map(c => (
              <button
                key={c.key}
                onClick={() => { setColor(c.hex); setEraser(false); }}
                title={c.label}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  color === c.hex && !eraser ? "border-gray-800 dark:border-white scale-110" : "border-gray-300"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          {/* 두께 - 선 모양 선택 */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 w-6">두께</span>
            <div className="flex items-center gap-1.5 flex-1">
              {WIDTHS.map(w => (
                <button
                  key={w}
                  onClick={() => setWidth(w)}
                  title={`두께 ${w}`}
                  className={`flex-1 h-7 rounded-lg flex items-center justify-center transition-all ${
                    width === w ? "bg-[#3D5AA1]/15 ring-1 ring-[#3D5AA1]" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span
                    className="block rounded-full"
                    style={{
                      width: 22,
                      height: w,
                      backgroundColor: width === w ? "#3D5AA1" : "#9ca3af",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 모드 / 삭제 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEraser(false)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                !eraser ? "bg-[#3D5AA1] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              <Pen className="w-3 h-3" /> 펜
            </button>
            <button
              onClick={() => setEraser(true)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                eraser ? "bg-[#3D5AA1] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              <Eraser className="w-3 h-3" /> 지우개
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 hover:bg-red-100"
              title="전체 삭제"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCollapsed(false)}
          className="fixed bottom-4 right-4 z-50 bg-[#3D5AA1] text-white rounded-full shadow-xl p-3"
          title="필기 도구 펼치기"
        >
          <Pen className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
