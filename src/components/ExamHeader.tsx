import { useState } from "react";
import { Button } from "./ui/button";
import { MoreHorizontal, Eye, EyeOff, Edit3, Clock, HelpCircle, Keyboard, Accessibility, AlignLeft, ChevronDown, ChevronUp, Save, Calculator, BookOpen } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { DirectionsModal } from "./DirectionsModal";

interface ExamHeaderProps {
  sectionTitle: string;
  timeRemaining: string;
  isHidden: boolean;
  onToggleHide: () => void;
  onToggleHighlights: () => void;
  onSaveAndExit?: () => void;
  isMathTest?: boolean;
  onOpenCalculator?: () => void;
  onOpenReference?: () => void;
}

export function ExamHeader({ 
  sectionTitle, 
  timeRemaining, 
  isHidden, 
  onToggleHide, 
  onToggleHighlights,
  onSaveAndExit,
  isMathTest,
  onOpenCalculator,
  onOpenReference
}: ExamHeaderProps) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [directionsOpen, setDirectionsOpen] = useState(true); // Start with directions open

  return (
    <div className="border-b-2 border-dashed border-black bg-[#E8EEF7] relative">
      <div className="flex items-center p-3 md:p-4 relative">
        {/* Left section */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-black truncate" style={{ fontSize: '22px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: '800', letterSpacing: '-0.5px' }}>{sectionTitle}</span>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs px-1 md:px-2 py-0.5 md:py-1 h-auto flex items-center gap-1 rounded-none border-none transition-colors bg-transparent text-gray-700 hover:bg-white"
              onClick={() => setDirectionsOpen(!directionsOpen)}
            >
              <span className="text-xs">Directions</span>
              {directionsOpen ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
            
            {/* Directions popup */}
            <DirectionsModal 
              isOpen={directionsOpen} 
              onClose={() => setDirectionsOpen(false)} 
              isMathTest={isMathTest}
            />
          </div>
        </div>
        
        {/* Center section - Timer and Hide button */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center gap-1 md:gap-2">
          {/* Timer above Hide button */}
          {isHidden ? (
            <Clock className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-gray-600" />
          ) : (
            <span className="whitespace-nowrap" style={{ fontSize: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: '600' }}>{timeRemaining}</span>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onToggleHide}
            className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3 lg:px-4 py-1 md:py-2 h-auto bg-white hover:bg-gray-50 border-gray-300"
          >
            {isHidden ? <Eye className="h-3 w-3 md:h-4 md:w-4" /> : <EyeOff className="h-3 w-3 md:h-4 md:w-4" />}
            <span className="hidden sm:inline text-xs md:text-sm">{isHidden ? "Show" : "Hide"}</span>
          </Button>
        </div>
        
        {/* Right section */}
        <div className="flex flex-col items-center gap-2">        
          <div className="flex items-center gap-3">
            {/* Show Calculator and Reference buttons for Math tests */}
            {isMathTest && onOpenCalculator && onOpenReference && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onOpenCalculator}
                  className="flex flex-col items-center gap-1 px-2 py-1 h-auto hover:bg-gray-100"
                >
                  <Calculator className="h-4 w-4 text-gray-700" />
                  <span className="text-xs text-gray-700">Calculator</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onOpenReference}
                  className="flex flex-col items-center gap-1 px-2 py-1 h-auto hover:bg-gray-100"
                >
                  <BookOpen className="h-4 w-4 text-gray-700" />
                  <span className="text-xs text-gray-700">Reference</span>
                </Button>
              </>
            )}
            
            {/* Show Highlights & Notes only for non-Math tests */}
            {!isMathTest && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onToggleHighlights}
                className="flex flex-col items-center gap-1 px-2 py-1 h-auto hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  <Edit3 className="h-4 w-4 text-gray-700" />
                  <AlignLeft className="h-4 w-4 text-gray-700" />
                </div>
                <span className="text-xs text-gray-700">Highlights & Notes</span>
              </Button>
            )}
            
            <Popover open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex flex-col items-center gap-1 px-2 py-1 h-auto hover:bg-gray-100"
                >
                  <MoreHorizontal className="h-5 w-5 text-gray-700" style={{ transform: 'rotate(90deg)' }} />
                  <span className="text-xs text-gray-700">More</span>
                </Button>
              </PopoverTrigger>
            <PopoverContent className="w-40 md:w-44 p-0 bg-white rounded-xl shadow-lg border-0" align="end">
              <div className="py-2">
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-2 px-3 hover:bg-gray-50 rounded-none">
                  <Keyboard className="h-3 w-3 md:h-4 md:w-4 text-gray-800" />
                  <span className="text-xs md:text-sm text-gray-800">Shortcuts</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-2 px-3 hover:bg-gray-50 rounded-none">
                  <Accessibility className="h-3 w-3 md:h-4 md:w-4 text-gray-800" />
                  <span className="text-xs md:text-sm text-gray-800 truncate">Assistive Tech</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-2 px-3 hover:bg-gray-50 rounded-none">
                  <AlignLeft className="h-3 w-3 md:h-4 md:w-4 text-gray-800" />
                  <span className="text-xs md:text-sm text-gray-800">Line Reader</span>
                </Button>
                {onSaveAndExit && (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2 h-auto py-2 px-3 hover:bg-gray-50 rounded-none"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      onSaveAndExit();
                    }}
                  >
                    <Save className="h-3 w-3 md:h-4 md:w-4 text-gray-800" />
                    <span className="text-xs md:text-sm text-gray-800">Save & Exit</span>
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}