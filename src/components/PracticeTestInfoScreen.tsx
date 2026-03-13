import { Clock, BarChart2, HelpCircle } from 'lucide-react';
import { NavigationButtons } from './NavigationButtons';

interface PracticeTestInfoScreenProps {
  onNext: () => void;
  testType?: string;
}

export function PracticeTestInfoScreen({ onNext, testType = "SAT" }: PracticeTestInfoScreenProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F7' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="max-w-4xl w-full">
          {/* Title */}
          <h1 className="text-center mb-6 sm:mb-12 text-2xl sm:text-[42px]" style={{ 
            fontWeight: '400', 
            color: '#1d1d1f',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}>
            {testType} Practice Test
          </h1>

          {/* Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-5 sm:p-12 mb-8" style={{ border: '1px solid #d2d2d7' }}>
            {/* Timing Section */}
            <div className="flex gap-3 sm:gap-6 mb-6 sm:mb-10">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f5f5f7' }}>
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#86868b' }} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-xl font-semibold mb-1.5 sm:mb-3" style={{ color: '#1d1d1f' }}>
                  Timing
                </h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#6e6e73' }}>
                  This full-length practice test is timed like the real {testType}, but you can pause any time by selecting <strong style={{ fontWeight: '600', color: '#1d1d1f' }}>Save and Exit</strong> from the <strong style={{ fontWeight: '600', color: '#1d1d1f' }}>More</strong> menu. You can also move from one section to the next before time expires.
                </p>
              </div>
            </div>

            {/* Scores Section */}
            <div className="flex gap-3 sm:gap-6 mb-6 sm:mb-10">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f5f5f7' }}>
                  <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#86868b' }} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-xl font-semibold mb-1.5 sm:mb-3" style={{ color: '#1d1d1f' }}>
                  Scores
                </h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#6e6e73' }}>
                  When you finish the practice test, go to <strong style={{ fontWeight: '600', color: '#1d1d1f' }}>My {testType}</strong> to see your scores and get personalized study tips.
                </p>
              </div>
            </div>

            {/* Assistive Technology Section */}
            <div className="flex gap-3 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f5f5f7' }}>
                  <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#86868b' }} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-xl font-semibold mb-1.5 sm:mb-3" style={{ color: '#1d1d1f' }}>
                  Assistive Technology
                </h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#6e6e73' }}>
                  If you use assistive technology, you should try it out on the practice test so you know what to expect on test day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <NavigationButtons
        onNext={onNext}
        showBack={false}
        showNext={true}
        variant="plain"
      />
    </div>
  );
}
