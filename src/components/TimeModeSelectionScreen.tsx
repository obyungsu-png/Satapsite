import { Button } from './ui/button';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NavigationButtons } from './NavigationButtons';

interface TimeModeSelectionScreenProps {
  onBack: () => void;
  onNext: (isTimed: boolean) => void;
}

export function TimeModeSelectionScreen({ onBack, onNext }: TimeModeSelectionScreenProps) {
  const [selectedMode, setSelectedMode] = useState<'Timed' | 'Untimed'>('Timed');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<'Timed' | 'Untimed' | null>('Timed');

  const handleNext = () => {
    onNext(selectedMode === 'Timed');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F7' }}>
      {/* Top Border */}
      <div style={{ 
        height: '2px', 
        background: 'linear-gradient(to right, transparent, #d2d2d7 20%, #d2d2d7 80%, transparent)',
        width: '100%'
      }} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6" style={{ paddingTop: '15vh' }}>
        <div className="max-w-2xl w-full">
          {/* Title */}
          <h1 className="text-center mb-12" style={{ 
            fontSize: '36px', 
            fontWeight: '400', 
            color: '#1d1d1f',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}>
            Choose a Time Mode for Your Practice
          </h1>

          {/* Selection Card */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8" style={{ border: '1px solid #d2d2d7' }}>
            <div className="mb-2">
              <label style={{ 
                fontSize: '15px', 
                fontWeight: '600', 
                color: '#1d1d1f',
                display: 'block',
                marginBottom: '8px'
              }}>
                Timing <span style={{ color: '#d32f2f' }}>*</span>
              </label>
              <span style={{ 
                fontSize: '13px', 
                color: '#86868b',
                float: 'right',
                marginTop: '-28px'
              }}>
                * = Required
              </span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 text-left rounded-md flex items-center justify-between"
                style={{
                  border: '1px solid #d2d2d7',
                  backgroundColor: 'white',
                  fontSize: '15px',
                  color: '#1d1d1f',
                  cursor: 'pointer'
                }}
              >
                <span>{selectedMode}</span>
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 12 12" 
                  fill="none" 
                  style={{ 
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <path d="M2 4L6 8L10 4" stroke="#86868b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {isDropdownOpen && (
                <div 
                  className="absolute w-full mt-1 bg-white rounded-md shadow-lg overflow-hidden z-10"
                  style={{ border: '1px solid #d2d2d7' }}
                >
                  <button
                    onClick={() => {
                      setSelectedMode('Timed');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left transition-colors"
                    style={{
                      backgroundColor: hoveredOption === 'Timed' ? '#86868b' : 'white',
                      color: hoveredOption === 'Timed' ? 'white' : '#1d1d1f',
                      fontSize: '15px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={() => setHoveredOption('Timed')}
                    onMouseLeave={() => setHoveredOption(null)}
                  >
                    Timed
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMode('Untimed');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left transition-colors"
                    style={{
                      backgroundColor: hoveredOption === 'Untimed' ? '#86868b' : 'white',
                      color: hoveredOption === 'Untimed' ? 'white' : '#1d1d1f',
                      fontSize: '15px',
                      border: 'none',
                      cursor: 'pointer',
                      borderTop: '1px solid #f5f5f7'
                    }}
                    onMouseEnter={() => setHoveredOption('Untimed')}
                    onMouseLeave={() => setHoveredOption(null)}
                  >
                    Untimed
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Border and Buttons */}
      <NavigationButtons
        onBack={onBack}
        onNext={handleNext}
        showBack={true}
        showNext={true}
        variant="plain"
      />
    </div>
  );
}