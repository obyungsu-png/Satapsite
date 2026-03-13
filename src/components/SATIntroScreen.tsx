import { Clock, BarChart2, HelpCircle } from "lucide-react";
import { NavigationButtons } from "./NavigationButtons";

interface SATIntroScreenProps {
  onNext: () => void;
}

export function SATIntroScreen({ onNext }: SATIntroScreenProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 pt-12 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl text-center text-gray-800 mb-6 font-medium">
            SAT Practice Test
          </h1>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-800 mb-1">Timing</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  This full-length practice test is timed like the real SAT, but you can pause any time by selecting <strong>Save and Exit</strong> from the <strong>More</strong> menu. You can also move from one section to the next before time expires.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <BarChart2 className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-800 mb-1">Scores</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  When you finish the practice test, go to <strong>My SAT</strong> to see your scores and get personalized study tips.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-800 mb-1">Assistive Technology</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
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