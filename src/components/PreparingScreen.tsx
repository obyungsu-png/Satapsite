import { useEffect } from "react";

interface PreparingScreenProps {
  onComplete: () => void;
}

export function PreparingScreen({ onComplete }: PreparingScreenProps) {
  // Auto advance after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl mx-auto text-center px-4 sm:px-6">
        <h1 className="text-2xl sm:text-4xl text-gray-800 mb-8 sm:mb-16">
          We're Preparing Your Test Exam
        </h1>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-12 mb-8">
          {/* Clock and Hourglass Icon */}
          <div className="flex justify-center mb-6 sm:mb-12">
            <svg viewBox="0 0 200 150" className="mx-auto w-[180px] h-[135px] sm:w-[300px] sm:h-[225px]">
              {/* Clock */}
              <circle cx="70" cy="75" r="45" fill="#D4E4F7" stroke="#2C3E50" strokeWidth="3" />
              {/* Clock ticks */}
              <line x1="70" y1="35" x2="70" y2="40" stroke="#2C3E50" strokeWidth="2" />
              <line x1="70" y1="110" x2="70" y2="115" stroke="#2C3E50" strokeWidth="2" />
              <line x1="25" y1="75" x2="30" y2="75" stroke="#2C3E50" strokeWidth="2" />
              <line x1="110" y1="75" x2="115" y2="75" stroke="#2C3E50" strokeWidth="2" />
              <line x1="43" y1="48" x2="47" y2="52" stroke="#2C3E50" strokeWidth="2" />
              <line x1="93" y1="98" x2="97" y2="102" stroke="#2C3E50" strokeWidth="2" />
              <line x1="97" y1="48" x2="93" y2="52" stroke="#2C3E50" strokeWidth="2" />
              <line x1="47" y1="98" x2="43" y2="102" stroke="#2C3E50" strokeWidth="2" />
              {/* Clock hands */}
              <line x1="70" y1="75" x2="70" y2="50" stroke="#2C3E50" strokeWidth="3" strokeLinecap="round" />
              <line x1="70" y1="75" x2="85" y2="75" stroke="#2C3E50" strokeWidth="3" strokeLinecap="round" />
              <circle cx="70" cy="75" r="4" fill="#2C3E50" />
              
              {/* Hourglass */}
              <g transform="translate(120, 40)">
                {/* Top frame */}
                <path d="M 10 0 L 50 0 L 45 5 L 15 5 Z" fill="none" stroke="#2C3E50" strokeWidth="3" />
                {/* Bottom frame */}
                <path d="M 10 70 L 50 70 L 45 65 L 15 65 Z" fill="none" stroke="#2C3E50" strokeWidth="3" />
                {/* Glass outline */}
                <path d="M 15 5 L 30 35 L 15 65 M 45 5 L 30 35 L 45 65" fill="none" stroke="#2C3E50" strokeWidth="3" />
                {/* Top sand */}
                <path d="M 18 8 L 30 30 L 42 8 Z" fill="#F4D03F" />
                {/* Bottom sand */}
                <path d="M 20 65 L 30 45 L 40 65 Z" fill="#F4D03F" />
                {/* Falling sand */}
                <line x1="30" y1="35" x2="30" y2="45" stroke="#F4D03F" strokeWidth="2" />
              </g>
            </svg>
          </div>
          
          <p className="text-base sm:text-lg text-gray-600 mb-2 sm:mb-3">
            This may take up to a minute.
          </p>
          <p className="text-base sm:text-lg text-gray-600">
            Please don't refresh this page or exit.
          </p>
        </div>
      </div>
    </div>
  );
}
