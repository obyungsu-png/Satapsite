import { Button } from './ui/button';
import { Clock, BarChart2, HelpCircle, ChevronRight } from 'lucide-react';

interface PracticeTestInfoScreenProps {
  onNext: () => void;
  testType?: string;
}

export function PracticeTestInfoScreen({ onNext, testType = "SAT" }: PracticeTestInfoScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#F5F5F7' }}>
      <div className="max-w-4xl w-full mx-6">
        {/* Title */}
        <h1 className="text-center mb-12" style={{ 
          fontSize: '42px', 
          fontWeight: '400', 
          color: '#1d1d1f',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}>
          {testType} Practice Test
        </h1>

        {/* Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-12 mb-8" style={{ border: '1px solid #d2d2d7' }}>
          {/* Timing Section */}
          <div className="flex gap-6 mb-10">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f5f5f7' }}>
                <Clock className="w-6 h-6" style={{ color: '#86868b' }} />
              </div>
            </div>
            <div className="flex-1">
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1d1d1f',
                marginBottom: '12px'
              }}>
                Timing
              </h3>
              <p style={{ 
                fontSize: '16px', 
                lineHeight: '1.6', 
                color: '#6e6e73'
              }}>
                This full-length practice test is timed like the real {testType}, but you can pause any time by selecting <strong style={{ fontWeight: '600', color: '#1d1d1f' }}>Save and Exit</strong> from the <strong style={{ fontWeight: '600', color: '#1d1d1f' }}>More</strong> menu. You can also move from one section to the next before time expires.
              </p>
            </div>
          </div>

          {/* Scores Section */}
          <div className="flex gap-6 mb-10">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f5f5f7' }}>
                <BarChart2 className="w-6 h-6" style={{ color: '#86868b' }} />
              </div>
            </div>
            <div className="flex-1">
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1d1d1f',
                marginBottom: '12px'
              }}>
                Scores
              </h3>
              <p style={{ 
                fontSize: '16px', 
                lineHeight: '1.6', 
                color: '#6e6e73'
              }}>
                When you finish the practice test, go to <strong style={{ fontWeight: '600', color: '#1d1d1f' }}>My {testType}</strong> to see your scores and get personalized study tips.
              </p>
            </div>
          </div>

          {/* Assistive Technology Section */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f5f5f7' }}>
                <HelpCircle className="w-6 h-6" style={{ color: '#86868b' }} />
              </div>
            </div>
            <div className="flex-1">
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1d1d1f',
                marginBottom: '12px'
              }}>
                Assistive Technology
              </h3>
              <p style={{ 
                fontSize: '16px', 
                lineHeight: '1.6', 
                color: '#6e6e73'
              }}>
                If you use assistive technology, you should try it out on the practice test so you know what to expect on test day.
              </p>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className="flex justify-end">
          <Button
            onClick={onNext}
            className="flex items-center gap-2 text-white px-8 py-2 rounded-full"
            style={{
              backgroundColor: '#2B478B',
              border: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1F3666';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2B478B';
            }}
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}