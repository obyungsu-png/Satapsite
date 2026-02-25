import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

export function LoginPage({ onNavigateToSignUp, onLoginSuccess }: { onNavigateToSignUp?: () => void; onLoginSuccess?: () => void }) {
  const [loginMethod, setLoginMethod] = useState<'password' | 'phone'>('password');
  const [captchaCode, setCaptchaCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countryCode, setCountryCode] = useState('+86');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    captcha: '',
    phone: '',
    verificationCode: ''
  });

  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let captcha = '';
    for (let i = 0; i < 4; i++) {
      captcha += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptchaCode(captcha);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSendCode = () => {
    if (!formData.phone) {
      toast.error('전화번호를 입력해주세요.');
      return;
    }
    
    let count = 60;
    setCountdown(count);
    
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    toast.success('인증 코드가 전송되었습니다! (시뮬레이션)');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      // Get registered users from localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      if (loginMethod === 'password') {
        // Verify captcha
        if (formData.captcha.toLowerCase() !== captchaCode.toLowerCase()) {
          setIsSubmitting(false);
          toast.error('인증 코드가 올바르지 않습니다.');
          generateCaptcha();
          return;
        }
        
        // Check username and password
        const user = registeredUsers.find((u: any) => 
          u.username === formData.username && u.password === formData.password
        );
        
        if (!user) {
          setIsSubmitting(false);
          toast.error('아이디 또는 비밀번호가 올바르지 않습니다.');
          return;
        }
        
        // Login successful
        localStorage.setItem('currentUser', JSON.stringify(user));
        toast.success(`환영합니다, ${user.username}님!`);
        
      } else {
        // Phone login
        const fullPhone = countryCode + formData.phone;
        const user = registeredUsers.find((u: any) => u.phone === fullPhone);
        
        if (!user) {
          setIsSubmitting(false);
          toast.error('등록되지 않은 전화번호입니다.');
          return;
        }
        
        // For simulation, any verification code is accepted if user exists
        localStorage.setItem('currentUser', JSON.stringify(user));
        toast.success(`환영합니다, ${user.username}님!`);
      }
      
      setIsSubmitting(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }, 1000);
  };

  const rotation = Math.floor(Math.random() * 20) - 10;
  const captchaColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

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

        .social-btn:hover {
          transform: scale(1.1) rotate(10deg);
          filter: brightness(1.1);
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

        {/* Right Side: Login Form */}
        <div className="form-section w-full max-w-md bg-white/25 backdrop-blur-lg p-5 sm:p-8 lg:p-10 rounded-2xl shadow-2xl border border-white/20 my-auto">
          <h2 className="text-center text-2xl sm:text-3xl text-gray-800 mb-4 sm:mb-6 font-bold tracking-wide">
            User Login
          </h2>
          
          {/* Login Method Toggle */}
          <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 bg-white/40 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setLoginMethod('password')}
              className="flex-1 py-2 rounded-md transition-all"
              style={{
                backgroundColor: loginMethod === 'password' ? 'white' : 'transparent',
                color: loginMethod === 'password' ? '#1F2937' : '#4B5563',
                fontWeight: loginMethod === 'password' ? 'bold' : 'normal',
                boxShadow: loginMethod === 'password' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className="flex-1 py-2 rounded-md transition-all"
              style={{
                backgroundColor: loginMethod === 'phone' ? 'white' : 'transparent',
                color: loginMethod === 'phone' ? '#1F2937' : '#4B5563',
                fontWeight: loginMethod === 'phone' ? 'bold' : 'normal',
                boxShadow: loginMethod === 'phone' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Phone Login
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {loginMethod === 'password' ? (
              <>
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

                {/* Captcha */}
                <div className="flex bg-white rounded-md shadow-sm overflow-hidden relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-10">
                    🛡️
                  </div>
                  <input
                    type="text"
                    placeholder="Verification Code"
                    required
                    value={formData.captcha}
                    onChange={(e) => setFormData({ ...formData, captcha: e.target.value })}
                    className="flex-1 px-4 py-4 pl-12 bg-transparent focus:outline-none text-gray-800"
                  />
                  <div
                    onClick={generateCaptcha}
                    className="w-32 bg-gray-100 flex items-center justify-center font-mono font-bold text-2xl tracking-widest text-gray-600 cursor-pointer border-l border-gray-300 select-none hover:bg-gray-200 transition-colors"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)',
                      transform: `rotate(${rotation}deg)`,
                      color: captchaColor
                    }}
                    title="Click to refresh"
                  >
                    {captchaCode}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Phone Number with Country Code */}
                <div className="relative">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-gray-700 font-semibold focus:outline-none z-10 cursor-pointer"
                    style={{ width: '80px' }}
                  >
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+82">🇰🇷 +82</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+44">🇬🇧 +44</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-4 pl-28 rounded-md bg-white shadow-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all"
                  />
                  <div className="absolute left-24 top-1/2 -translate-y-1/2 text-gray-300">
                    |
                  </div>
                </div>

                {/* Verification Code */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Verification Code"
                    required
                    value={formData.verificationCode}
                    onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                    className="w-full px-4 py-4 pl-12 pr-24 rounded-md bg-white shadow-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    🛡️
                  </div>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white font-semibold px-3 py-2 rounded cursor-pointer hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    {countdown > 0 ? `${countdown}s` : 'Get Code'}
                  </button>
                </div>
              </>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-500 text-white rounded-md text-lg font-bold cursor-pointer hover:bg-blue-600 hover:-translate-y-1 active:translate-y-0 transition-all shadow-lg disabled:opacity-70 mt-3"
            >
              {isSubmitting ? 'Verifying...' : 'Login'}
            </button>

            {/* Divider */}
            <div className="flex items-center text-center my-6">
              <div className="flex-1 border-b-2 border-black/10 mr-4"></div>
              <span className="text-gray-700 text-sm font-semibold">Other Login Methods</span>
              <div className="flex-1 border-b-2 border-black/10 ml-4"></div>
            </div>

            {/* Social Login Icons */}
            <div className="flex justify-center gap-8 mb-8">
              <div
                className="social-btn w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl cursor-pointer shadow-lg transition-all"
                title="Login with Mobile"
                onClick={() => setLoginMethod('phone')}
              >
                📱
              </div>
              <div
                className="social-btn w-14 h-14 rounded-full text-white flex items-center justify-center text-2xl cursor-pointer shadow-lg transition-all"
                style={{ backgroundColor: '#07c160' }}
                title="Login with WeChat"
                onClick={() => alert('WeChat login coming soon!')}
              >
                💬
              </div>
            </div>

            {/* Bottom Links */}
            <div className="flex justify-between text-sm px-2">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateToSignUp?.();
                }}
                className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors"
              >
                Register Now
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password recovery feature coming soon!');
                }}
                className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors"
              >
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}