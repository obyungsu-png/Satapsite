import { useState } from 'react';
import { X } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [showTopBanner, setShowTopBanner] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Top Banner */}
      {showTopBanner && (
        <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 border-b border-yellow-500">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex-1 text-center">
              <span className="text-gray-900 font-medium text-sm md:text-base">
                Platform updates coming January 2026 ·{' '}
                <a href="#" className="underline font-semibold hover:text-gray-700">
                  learn more
                </a>
              </span>
            </div>
            <button
              onClick={() => setShowTopBanner(false)}
              className="p-1 hover:bg-yellow-500/30 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-900" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Master Your Test<br />
              and unlock college<br />
              opportunities
            </h2>
            
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              The <span className="font-semibold">SAT</span> and <span className="font-semibold">ACT</span> tests are more than exams — they're your gateway to college success. From top university admissions to scholarship opportunities and academic excellence, your test scores open doors to your future.
            </p>

            <p className="text-base text-gray-600 mb-8">
              Trusted by millions of students nationwide. Comprehensive practice platform for real exam preparation.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-3 bg-blue-900 text-white font-semibold rounded-md hover:bg-blue-800 transition-colors shadow-md"
              >
                SAT Prep
              </button>
              <div className="relative inline-block">
                <button
                  disabled
                  className="px-8 py-3 bg-white text-emerald-600 font-semibold rounded-md border-2 border-emerald-600 opacity-60 cursor-not-allowed transition-colors"
                >
                  ACT Prep
                </button>
                <span className="absolute -top-3 -right-3 bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Comprehensive Content</h4>
              <p className="text-gray-600">Access full SAT & ACT practice tests with detailed explanations</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Track Progress</h4>
              <p className="text-gray-600">Monitor your improvement with detailed analytics</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Real Exam Experience</h4>
              <p className="text-gray-600">Practice with authentic SAT & ACT test format</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to achieve your dream score?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Join thousands of students who have successfully prepared for SAT & ACT with our platform
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-4 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-lg text-lg"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-1.5 mb-4">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#00bcd4" stroke="none"><path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z"/></svg>
                <h3 className="text-white font-extrabold text-lg tracking-tight">AllMyExam-<span style={{ color: '#00bcd4' }}>SAT</span></h3>
              </div>
              <p className="text-sm">Your complete college test preparation platform</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Learners</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Practice Tests</a></li>
                <li><a href="#" className="hover:text-white">Study Materials</a></li>
                <li><a href="#" className="hover:text-white">Score Reports</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Partnerships</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 SAT & ACT Prep. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}