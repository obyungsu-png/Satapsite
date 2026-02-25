import { motion } from 'motion/react';
import { Star, Clock, BookOpen, Calculator, Pencil, Lightbulb } from 'lucide-react';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export function LoginPopup({ isOpen, onClose, onLoginClick }: LoginPopupProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      {/* Floating Clouds Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute top-10 left-0"
          style={{
            width: '200px',
            height: '80px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '100px',
            filter: 'blur(20px)'
          }}
        />
        <motion.div
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute top-40 left-0"
          style={{
            width: '150px',
            height: '60px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '100px',
            filter: 'blur(15px)'
          }}
        />
        <motion.div
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-32 left-0"
          style={{
            width: '180px',
            height: '70px',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            borderRadius: '100px',
            filter: 'blur(18px)'
          }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="relative w-11/12 max-w-2xl rounded-lg shadow-xl p-5 sm:p-8 md:p-10 max-h-[90vh] overflow-y-auto"
        style={{ 
          backgroundColor: '#E3F2FD',
          border: '1px solid #90CAF9'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 sm:top-4 sm:right-5 text-2xl sm:text-3xl text-gray-700 hover:text-black transition-colors z-10"
          style={{ fontWeight: 300 }}
        >
          ×
        </button>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 md:gap-8">
          {/* Left Text Area - Fade In Up */}
          <motion.div 
            className="flex-1 text-center md:text-left w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6" style={{ 
              fontWeight: 700,
              color: '#000',
              lineHeight: 1.3 
            }}>
              Please<br />log in and practice
            </h2>
            <button
              onClick={onLoginClick}
              className="text-lg sm:text-xl md:text-2xl transition-colors hover:underline"
              style={{ 
                fontWeight: 700,
                color: '#3BB9E3'
              }}
            >
              go to log in →
            </button>
          </motion.div>

          {/* Right Image Area - Slide In Right + Float */}
          <motion.div 
            className="flex-1 flex items-center justify-center w-full"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div 
              className="relative" 
              style={{ 
                width: 'min(280px, 80vw)', 
                height: 'min(300px, 85vw)',
                maxWidth: '280px',
                maxHeight: '300px'
              }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Left Bunny Ear */}
              <div 
                className="absolute"
                style={{
                  top: '-5%',
                  left: '21%',
                  width: '14%',
                  height: '30%',
                  backgroundColor: '#f2f0e9',
                  borderRadius: '50%',
                  transform: 'rotate(-25deg)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                }}
              />
              
              {/* Right Bunny Ear */}
              <div 
                className="absolute"
                style={{
                  top: '-5%',
                  right: '21%',
                  width: '14%',
                  height: '30%',
                  backgroundColor: '#f2f0e9',
                  borderRadius: '50%',
                  transform: 'rotate(25deg)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                }}
              />
              
              {/* Main Balloon Body */}
              <div 
                className="flex flex-col items-center justify-center rounded-full shadow-lg absolute"
                style={{
                  top: '10%',
                  left: '3.5%',
                  width: '93%',
                  height: '87%',
                  backgroundColor: '#f2f0e9',
                  padding: '10% 7% 8% 7%',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  borderRadius: '50% 50% 47% 53%'
                }}
              >
                {/* Balloon knot/tail */}
                <div 
                  className="absolute"
                  style={{
                    bottom: '-7%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '20px solid #f2f0e9',
                    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))'
                  }}
                />
                
                {/* SAT PREP Title */}
                <div className="text-center" style={{ marginTop: '5%' }}>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl" style={{
                    fontFamily: 'Georgia, serif',
                    fontWeight: 700,
                    color: '#222',
                    margin: '8px 0 4px 0',
                    letterSpacing: '-1px',
                    lineHeight: 1
                  }}>
                    SAT Prep
                  </h3>
                  <p className="text-[6px] sm:text-[8px]" style={{
                    fontWeight: 800,
                    color: '#444',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    marginTop: '4px'
                  }}>
                    실력 쑥쑥 점수 쑥쑥!
                  </p>
                </div>

                {/* Icons Grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3" style={{ marginTop: '6%' }}>
                  <Star 
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                    style={{ 
                      color: '#d9452b', 
                      transform: 'rotate(-10deg)',
                      fill: 'none',
                      strokeWidth: 2
                    }} 
                  />
                  <Clock 
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"
                    style={{ 
                      color: '#f2b705', 
                      transform: 'rotate(5deg)',
                      strokeWidth: 2
                    }} 
                  />
                  <BookOpen 
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                    style={{ 
                      color: '#3b4cca', 
                      transform: 'rotate(-5deg)',
                      strokeWidth: 2
                    }} 
                  />
                  <Calculator 
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                    style={{ 
                      color: '#28a745', 
                      transform: 'rotate(8deg)',
                      strokeWidth: 2
                    }} 
                  />
                  <Pencil 
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"
                    style={{ 
                      color: '#9b3bca', 
                      transform: 'rotate(-3deg)',
                      strokeWidth: 2
                    }} 
                  />
                  <Lightbulb 
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6"
                    style={{ 
                      color: '#f08a24', 
                      transform: 'rotate(15deg)',
                      strokeWidth: 2
                    }} 
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}