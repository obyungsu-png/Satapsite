import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  showBack?: boolean;
  showNext?: boolean;
  backLabel?: string;
  nextLabel?: string;
  variant?: 'exam' | 'plain';
}

export function NavigationButtons({
  onBack,
  onNext,
  canGoBack = true,
  canGoNext = true,
  showBack = true,
  showNext = true,
  backLabel = "Back",
  nextLabel = "Next",
  variant = 'exam',
}: NavigationButtonsProps) {
  const activeStyle = {
    backgroundColor: '#2B478B',
    border: 'none',
    transition: 'all 0.2s',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#1F3666';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#2B478B';
  };

  return (
    <div className="w-full">
      {/* Dashed top border - only for exam variant */}
      {variant === 'exam' && <div className="border-t-2 border-dashed border-black" />}
      
      {/* Button bar */}
      <div
        className="flex items-center justify-center md:justify-end gap-4 py-4 px-6 md:mr-16"
        style={{ backgroundColor: variant === 'exam' ? '#E8EEF7' : 'transparent' }}
      >
        {showBack && (
          canGoBack && onBack ? (
            <Button
              onClick={onBack}
              className="flex items-center gap-3 text-white px-8 py-2.5 rounded-full h-11 min-w-[130px] justify-center text-[15px] font-semibold"
              style={activeStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <ChevronLeft className="h-5 w-5" />
              {backLabel}
            </Button>
          ) : (
            <Button
              disabled
              className="flex items-center gap-3 bg-gray-300 text-gray-500 px-8 py-2.5 rounded-full h-11 min-w-[130px] justify-center text-[15px] font-semibold cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
              {backLabel}
            </Button>
          )
        )}

        {showNext && (
          canGoNext && onNext ? (
            <Button
              onClick={onNext}
              className="flex items-center gap-3 text-white px-8 py-2.5 rounded-full h-11 min-w-[130px] justify-center text-[15px] font-semibold"
              style={activeStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {nextLabel}
              <ChevronRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              disabled
              className="flex items-center gap-3 bg-gray-300 text-gray-500 px-8 py-2.5 rounded-full h-11 min-w-[130px] justify-center text-[15px] font-semibold cursor-not-allowed"
            >
              {nextLabel}
              <ChevronRight className="h-5 w-5" />
            </Button>
          )
        )}
      </div>
    </div>
  );
}