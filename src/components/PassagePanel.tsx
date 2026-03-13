import { useState, useRef, useEffect } from "react";
import { Trash2, Underline, FileText } from "lucide-react";

interface PassagePanelProps {
  content: string;
  highlightsMode?: boolean;
  onExpandRight?: () => void;
  isExpanded?: boolean;
  expandDirection?: 'left' | 'right' | null;
}

interface HighlightData {
  id: string;
  start: number;
  end: number;
  color: 'yellow' | 'blue' | 'pink';
  type: 'highlight' | 'underline';
  text: string;
}

interface ToolbarPosition {
  x: number;
  y: number;
}

export function PassagePanel({ content, highlightsMode = false, onExpandRight, isExpanded = false, expandDirection = null }: PassagePanelProps) {
  // Add default highlight for question 4 passage
  const getInitialHighlights = (): HighlightData[] => {
    if (content.includes("In the decades after Mexico")) {
      const highlightText = "In the decades after";
      const start = content.indexOf(highlightText);
      if (start !== -1) {
        return [{
          id: 'default-1',
          start,
          end: start + highlightText.length,
          color: 'yellow',
          type: 'highlight',
          text: highlightText
        }];
      }
    }
    return [];
  };

  const [highlights, setHighlights] = useState<HighlightData[]>(getInitialHighlights());
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ x: 0, y: 0 });
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number; text: string } | null>(null);
  // Responsive default: 21px on mobile for better readability, 18px on desktop
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return 21;
    return 18;
  });
  const contentRef = useRef<HTMLDivElement>(null);

  // Mouse wheel zoom handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        setFontSize(prev => Math.max(12, Math.min(32, prev + delta)));
      }
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (element) {
        element.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (!highlightsMode) return;
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();
      
      if (selectedText.length > 0 && contentRef.current?.contains(range.startContainer)) {
        const rect = range.getBoundingClientRect();
        const containerRect = contentRef.current.getBoundingClientRect();
        
        setToolbarPosition({
          x: rect.left + rect.width / 2 - containerRect.left,
          y: Math.max(10, rect.top - containerRect.top - 60) // Ensure minimum 10px from top
        });
        
        // Calculate text positions using data-char-index attributes
        let start = -1;
        let end = -1;
        
        try {
          // Helper function to get all char indices covered by the selection
          const getSelectionIndices = (): { start: number; end: number } => {
            // Get all span elements with data-char-index within the selection
            const selectedSpans: HTMLElement[] = [];
            
            // Create a range clone to work with
            const rangeClone = range.cloneRange();
            
            // Get all span[data-char-index] elements in the container
            const allSpans = contentRef.current!.querySelectorAll('span[data-char-index]');
            
            // Check which spans are within the selection
            allSpans.forEach((span) => {
              const spanRange = document.createRange();
              spanRange.selectNodeContents(span);
              
              // Check if this span intersects with the selection
              if (
                range.compareBoundaryPoints(Range.END_TO_START, spanRange) <= 0 &&
                range.compareBoundaryPoints(Range.START_TO_END, spanRange) >= 0
              ) {
                selectedSpans.push(span as HTMLElement);
              }
            });
            
            if (selectedSpans.length > 0) {
              // Get the first and last selected span indices
              const firstIndex = parseInt(selectedSpans[0].getAttribute('data-char-index') || '0');
              const lastIndex = parseInt(selectedSpans[selectedSpans.length - 1].getAttribute('data-char-index') || '0');
              
              return { start: firstIndex, end: lastIndex + 1 };
            }
            
            return { start: -1, end: -1 };
          };
          
          const indices = getSelectionIndices();
          start = indices.start;
          end = indices.end;
          
          // Fallback: if data-char-index method fails, use text search
          if (start < 0 || end < 0) {
            start = content.indexOf(selectedText);
            if (start >= 0) {
              end = start + selectedText.length;
            }
          }
        } catch (e) {
          console.error('Error finding selection position:', e);
          // Last resort: search in content
          start = content.indexOf(selectedText);
          if (start >= 0) {
            end = start + selectedText.length;
          }
        }
        
        // Only set selected range if we found a valid position
        if (start >= 0 && end > start && end <= content.length) {
          const actualSelectedText = content.slice(start, end);
          setSelectedRange({ start, end, text: actualSelectedText });
        } else {
          setShowToolbar(false);
          return;
        }
        setShowToolbar(true);
      } else {
        setShowToolbar(false);
        setSelectedRange(null);
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (highlightsMode && showToolbar) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleCut = (e: ClipboardEvent) => {
      if (highlightsMode) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
    };
  }, [highlightsMode, showToolbar]);

  const addHighlight = (color: 'yellow' | 'blue' | 'pink', type: 'highlight' | 'underline' = 'highlight') => {
    if (!selectedRange) return;
    
    // Use a unique ID that includes timestamp and random number for better uniqueness
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check for existing highlights in the same range to prevent duplicates
    const hasExistingHighlight = highlights.some(h => 
      h.start === selectedRange.start && 
      h.end === selectedRange.end && 
      h.type === type && 
      h.color === color
    );
    
    if (hasExistingHighlight) {
      setShowToolbar(false);
      setSelectedRange(null);
      return;
    }
    
    const newHighlight: HighlightData = {
      id: uniqueId,
      start: selectedRange.start,
      end: selectedRange.end,
      color,
      type,
      text: selectedRange.text
    };
    
    setHighlights(prev => [...prev, newHighlight]);
    setShowToolbar(false);
    setSelectedRange(null);
    
    // Clear selection after a short delay to ensure UI updates
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
    }, 100);
  };

  const removeHighlight = (id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
  };

  const renderHighlightedText = () => {
    if (highlights.length === 0) {
      return content.split('').map((char, i) => (
        <span key={i} data-char-index={i}>{char}</span>
      ));
    }

    // Sort highlights by start position
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);
    
    // Merge overlapping highlights
    const mergedHighlights: HighlightData[] = [];
    for (const highlight of sortedHighlights) {
      const existing = mergedHighlights.find(h => 
        (h.start <= highlight.start && h.end >= highlight.start) ||
        (h.start <= highlight.end && h.end >= highlight.end) ||
        (highlight.start <= h.start && highlight.end >= h.end)
      );
      
      if (!existing) {
        mergedHighlights.push(highlight);
      }
    }

    const parts: JSX.Element[] = [];
    let lastEnd = 0;

    mergedHighlights.forEach((highlight, index) => {
      // Ensure we don't go beyond content boundaries
      const safeStart = Math.max(0, Math.min(highlight.start, content.length));
      const safeEnd = Math.max(safeStart, Math.min(highlight.end, content.length));

      // Add text before highlight (with char indices)
      if (safeStart > lastEnd) {
        const textBefore = content.slice(lastEnd, safeStart);
        if (textBefore) {
          parts.push(
            <span key={`text-${index}`}>
              {textBefore.split('').map((char, i) => (
                <span key={`${index}-${i}`} data-char-index={lastEnd + i}>{char}</span>
              ))}
            </span>
          );
        }
      }

      // Add highlighted text (with char indices)
      const highlightedText = content.slice(safeStart, safeEnd);
      if (highlightedText) {
        const colorClasses = {
          yellow: 'bg-yellow-200',
          blue: 'bg-blue-200', 
          pink: 'bg-pink-200'
        };

        let className = '';
        let style: React.CSSProperties = {};
        
        if (highlight.type === 'underline') {
          className = 'inline-block';
          switch (highlight.color) {
            case 'yellow':
              style = {
                borderBottom: '2px solid #EAB308',
                textDecoration: 'none'
              };
              break;
            case 'blue':
              style = {
                borderBottom: '2px solid #3B82F6',
                textDecoration: 'none'
              };
              break;
            case 'pink':
              style = {
                borderBottom: '2px solid #EC4899',
                textDecoration: 'none'
              };
              break;
          }
        } else {
          className = colorClasses[highlight.color];
        }

        parts.push(
          <span
            key={highlight.id}
            className={`${className} cursor-pointer relative group`}
            style={style}
            onClick={() => removeHighlight(highlight.id)}
          >
            {highlightedText.split('').map((char, i) => (
              <span key={`${highlight.id}-${i}`} data-char-index={safeStart + i}>{char}</span>
            ))}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 hidden md:block">
              Click to remove
            </span>
          </span>
        );
      }

      lastEnd = Math.max(lastEnd, safeEnd);
    });

    // Add remaining text (with char indices)
    if (lastEnd < content.length) {
      const remainingText = content.slice(lastEnd);
      if (remainingText) {
        parts.push(
          <span key="text-end">
            {remainingText.split('').map((char, i) => (
              <span key={`end-${i}`} data-char-index={lastEnd + i}>{char}</span>
            ))}
          </span>
        );
      }
    }

    return <>{parts}</>;
  };

  // Calculate clamped toolbar position for mobile
  const getClampedToolbarStyle = (): React.CSSProperties => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      // On mobile: fixed to bottom of the passage panel as a bottom sheet style toolbar
      return {
        left: '50%',
        bottom: '12px',
        top: 'auto',
        transform: 'translateX(-50%)',
        position: 'sticky' as const,
      };
    }
    // Desktop: follow selection position, clamped to container
    const containerWidth = contentRef.current?.clientWidth || 400;
    const toolbarWidth = 300; // approximate toolbar width
    const halfToolbar = toolbarWidth / 2;
    const clampedX = Math.max(halfToolbar, Math.min(toolbarPosition.x, containerWidth - halfToolbar));
    return {
      left: `${clampedX}px`,
      top: `${Math.max(10, toolbarPosition.y)}px`,
      transform: 'translateX(-50%)',
    };
  };

  return (
    <div 
      className="h-full px-5 md:px-10 pt-8 md:pt-16 pb-8 bg-white overflow-y-auto relative" 
      ref={contentRef}
      style={{ WebkitTouchCallout: highlightsMode ? 'none' : 'default' } as React.CSSProperties}
      onMouseUp={() => {
        // Additional cleanup when mouse is released
        if (!highlightsMode) {
          setShowToolbar(false);
          setSelectedRange(null);
        }
      }}
      onTouchEnd={() => {
        // On mobile, give a short delay for selection to register
        if (highlightsMode) {
          setTimeout(() => {
            const selection = window.getSelection();
            if (!selection || selection.toString().trim().length === 0) {
              // Don't hide immediately - user may still be adjusting selection
            }
          }, 200);
        }
      }}
    >
      <div className="max-w-2xl">
        <p className="leading-[1.8] md:leading-[1.8] text-gray-900 select-text" style={{ fontSize: `${fontSize}px`, fontFamily: '"Times New Roman", Times, serif', fontWeight: 400 }}>
          {renderHighlightedText()}
        </p>
      </div>

      {/* Highlight Toolbar - Desktop: floating near selection, Mobile: bottom sticky bar */}
      {showToolbar && highlightsMode && (
        <div 
          className="absolute z-30 bg-white border border-gray-200 rounded-2xl md:rounded-full shadow-xl md:shadow-lg px-2 md:px-3 py-2 md:py-2 flex items-center justify-center gap-1 md:gap-2"
          style={getClampedToolbarStyle()}
        >
          {/* Yellow highlight */}
          <button
            className="w-10 h-10 md:w-8 md:h-8 p-0 rounded-full hover:bg-yellow-100 active:bg-yellow-200 flex items-center justify-center transition-colors"
            onClick={() => addHighlight('yellow')}
          >
            <div className="w-6 h-6 md:w-5 md:h-5 rounded-full bg-yellow-300 border-2 border-yellow-400"></div>
          </button>
          
          {/* Blue highlight */}
          <button
            className="w-10 h-10 md:w-8 md:h-8 p-0 rounded-full hover:bg-blue-100 active:bg-blue-200 flex items-center justify-center transition-colors"
            onClick={() => addHighlight('blue')}
          >
            <div className="w-6 h-6 md:w-5 md:h-5 rounded-full bg-blue-300 border-2 border-blue-400"></div>
          </button>
          
          {/* Pink highlight */}
          <button
            className="w-10 h-10 md:w-8 md:h-8 p-0 rounded-full hover:bg-pink-100 active:bg-pink-200 flex items-center justify-center transition-colors"
            onClick={() => addHighlight('pink')}
          >
            <div className="w-6 h-6 md:w-5 md:h-5 rounded-full bg-pink-300 border-2 border-pink-400"></div>
          </button>

          {/* Underline */}
          <button
            className="w-10 h-10 md:w-8 md:h-8 p-0 rounded-full hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-colors"
            onClick={() => addHighlight('blue', 'underline')}
          >
            <Underline className="h-5 w-5 md:h-4 md:w-4 text-gray-600" />
          </button>

          {/* Separator */}
          <div className="w-px h-7 md:h-6 bg-gray-300 mx-0.5 md:mx-1"></div>

          {/* Delete / Cancel */}
          <button
            className="w-10 h-10 md:w-8 md:h-8 p-0 rounded-full hover:bg-red-100 active:bg-red-200 text-red-500 flex items-center justify-center transition-colors"
            onClick={() => {
              setShowToolbar(false);
              setSelectedRange(null);
              window.getSelection()?.removeAllRanges();
            }}
          >
            <Trash2 className="h-5 w-5 md:h-4 md:w-4" />
          </button>

          {/* Note */}
          <button
            className="w-10 h-10 md:w-8 md:h-8 p-0 rounded-full hover:bg-gray-100 active:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
          >
            <FileText className="h-5 w-5 md:h-4 md:w-4" />
          </button>
        </div>
      )}
    </div>
  );
}