import { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

export function SignUpPage({ onSignUpSuccess, onSignUp }: { onSignUpSuccess?: () => void; onSignUp?: (email: string, name: string) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      // Save user data to localStorage
      const userData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        registeredAt: new Date().toISOString()
      };
      
      // Get existing users
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Check if user already exists
      const userExists = existingUsers.some((user: any) => 
        user.username === formData.username || user.email === userData.email
      );
      
      if (userExists) {
        setIsSubmitting(false);
        toast.error('이미 존재하는 사용자명 또는 이메일입니다.');
        return;
      }
      
      // Add new user
      existingUsers.push(userData);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
      
      setIsSubmitting(false);
      toast.success('회원가입이 완료되었습니다!');
      
      if (onSignUpSuccess) {
        onSignUpSuccess();
      }

      if (onSignUp) {
        onSignUp(formData.email, formData.username);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)'
    }}>
      <style>{`
        @keyframes floatCloud {
          0% { transform: translateX(0); }
          50% { transform: translateX(20px); }
          100% { transform: translateX(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
          from { opacity: 0; transform: translateY(20px); }
        }

        @keyframes slideInRight {
          to { opacity: 1; transform: translateX(0); }
        }

        .cloud {
          position: absolute;
          opacity: 0.6;
          animation: floatCloud 20s linear infinite;
          z-index: 0;
          color: rgba(255, 255, 255, 0.4);
        }

        .cloud-1 { top: 5%; left: 10%; font-size: 4rem; animation-duration: 25s; }
        .cloud-2 { top: 15%; right: 15%; font-size: 6rem; animation-duration: 30s; animation-direction: reverse; }
        .cloud-3 { bottom: 10%; left: 20%; font-size: 3rem; animation-duration: 20s; }

        .hero-title {
          opacity: 0;
          animation: fadeInUp 0.8s ease forwards;
        }

        .hero-subtitle {
          opacity: 0;
          animation: fadeInUp 0.8s ease 0.3s forwards;
        }

        .hero-illustration {
          animation: float 6s ease-in-out infinite;
        }

        .form-section {
          transform: translateX(50px);
          opacity: 0;
          animation: slideInRight 0.8s ease 0.5s forwards;
        }
      `}</style>

      {/* Background Clouds */}
      <div className="cloud cloud-1">☁</div>
      <div className="cloud cloud-2">☁</div>
      <div className="cloud cloud-3">☁</div>

      <div className="flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-5 py-6 sm:py-10 gap-6 lg:gap-10 relative z-10 min-h-screen overflow-y-auto">
        {/* Left Side: Hero Section */}
        <div className="flex-1 text-white text-center px-3 sm:px-5 hidden lg:block">
          <h1 className="hero-title text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 drop-shadow-md">
            Practice Makes Perfect.
          </h1>
          <p className="hero-subtitle text-lg sm:text-xl lg:text-2xl mb-10 opacity-90">
            Knowledge Advances by Steps Not by Leaps.
          </p>
          
          {/* Illustration */}
          <div className="hero-illustration w-64 sm:w-80 h-40 sm:h-52 bg-white/20 border-4 border-white rounded-2xl mx-auto flex items-center justify-center backdrop-blur-sm">
            <div className="text-6xl sm:text-8xl">💻</div>
          </div>
        </div>

        {/* Right Side: Sign Up Form */}
        <div className="form-section w-full max-w-md bg-white/25 backdrop-blur-lg p-5 sm:p-8 lg:p-10 rounded-2xl shadow-2xl border border-white/20 my-auto">
          <h2 className="text-center text-2xl sm:text-3xl text-gray-800 mb-6 sm:mb-8 font-semibold">
            User Registration
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-4 pl-12 rounded-md bg-white shadow-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                ✉️
              </div>
            </div>

            {/* Username */}
            <div className="relative">
              <input
                type="text"
                placeholder="Username"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-4 pl-12 rounded-md bg-white shadow-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                👤
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-4 pl-12 rounded-md bg-white shadow-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                🔒
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type="password"
                placeholder="Confirm Password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-4 pl-12 rounded-md bg-white shadow-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                🔒
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center text-sm text-gray-800">
              <input
                type="checkbox"
                id="terms"
                required
                className="mr-3 w-4 h-4 accent-blue-500 cursor-pointer"
              />
              <label htmlFor="terms" className="cursor-pointer">
                I have read and agree to the{' '}
                <a href="#" className="text-gray-800 font-semibold underline hover:text-blue-600">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-500 text-white rounded-md text-lg font-semibold cursor-pointer hover:bg-blue-600 hover:-translate-y-1 active:translate-y-0 transition-all shadow-lg disabled:opacity-70"
            >
              {isSubmitting ? 'Processing...' : 'Sign Up'}
            </button>

            {/* Login Link */}
            <div className="text-center text-sm text-gray-800">
              Already have an account?{' '}
              <a href="#" className="text-blue-500 font-bold ml-1 hover:underline">
                Log In
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}