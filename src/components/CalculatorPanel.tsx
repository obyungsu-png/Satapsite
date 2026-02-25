import { useEffect, useRef } from "react";
import { X, Maximize2, MoreVertical } from "lucide-react";

interface CalculatorPanelProps {
  onClose: () => void;
  onExpand?: () => void;
  isExpanded?: boolean;
}

// Declare Desmos type for TypeScript
declare global {
  interface Window {
    Desmos: any;
  }
}

export function CalculatorPanel({ onClose, onExpand, isExpanded }: CalculatorPanelProps) {
  const calculatorRef = useRef<HTMLDivElement>(null);
  const calculatorInstance = useRef<any>(null);

  useEffect(() => {
    // Load Desmos API script if not already loaded
    if (!window.Desmos) {
      const script = document.createElement('script');
      script.src = 'https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
      script.async = true;
      
      script.onload = () => {
        initializeCalculator();
      };

      document.head.appendChild(script);
    } else {
      // Desmos already loaded
      initializeCalculator();
    }

    function initializeCalculator() {
      if (calculatorRef.current && window.Desmos) {
        // Initialize with keypad visible
        calculatorInstance.current = window.Desmos.GraphingCalculator(calculatorRef.current, {
          keypad: true,
          expressions: true,
          settingsMenu: true,
          zoomButtons: true,
          showGrid: true,
          showXAxis: true,
          showYAxis: true,
          xAxisNumbers: true,
          yAxisNumbers: true,
          projectorMode: false
        });
      }
    }

    // Cleanup on unmount
    return () => {
      if (calculatorInstance.current) {
        calculatorInstance.current.destroy();
        calculatorInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Custom Black Header */}
      <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
        {/* Left - Calculator Title */}
        <h3 className="text-base font-semibold">Calculator</h3>
        
        {/* Right - Icons */}
        <div className="flex items-center gap-3">
          {/* 3x3 Dots Menu */}
          <button className="hover:bg-gray-800 p-1 rounded transition-colors">
            <div className="grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-white rounded-full" />
              ))}
            </div>
          </button>
          
          {/* Maximize Button */}
          {onExpand && (
            <button 
              onClick={onExpand}
              className="hover:bg-gray-800 p-1 rounded transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          )}
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="hover:bg-gray-800 p-1 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desmos Calculator Container */}
      <div className="flex-1 w-full overflow-hidden">
        <div 
          ref={calculatorRef} 
          id="desmos-calculator" 
          className="w-full h-full"
        />
      </div>
    </div>
  );
}