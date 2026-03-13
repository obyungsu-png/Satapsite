import { motion } from 'motion/react';
import { BookOpen, Headphones, Pencil, Lightbulb, X } from 'lucide-react';

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
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          y: 0,
        }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
        className="relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90vw',
          maxWidth: '450px',
          height: '90vw',
          maxHeight: '450px',
        }}
      >
        {/* Floating Animation Container */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            y: {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            rotate: {
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          className="relative w-full h-full"
        >
          {/* Bunny Ears */}
          <div className="absolute w-full h-full pointer-events-none">
            {/* Left Ear */}
            <motion.div
              animate={{
                rotate: [-5, 0, -5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute"
              style={{
                left: '28%',
                top: '-8%',
                width: '60px',
                height: '120px',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                background: 'linear-gradient(135deg, #0097a7 0%, #00bcd4 50%, #4dd0c8 100%)',
                transform: 'rotate(-25deg)',
                boxShadow: '0 8px 24px rgba(0, 188, 212, 0.3)',
              }}
            >
              {/* Inner ear */}
              <div
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '35px',
                  height: '70px',
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }}
              />
            </motion.div>

            {/* Right Ear */}
            <motion.div
              animate={{
                rotate: [5, 0, 5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.3,
              }}
              className="absolute"
              style={{
                right: '28%',
                top: '-8%',
                width: '60px',
                height: '120px',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                background: 'linear-gradient(135deg, #0097a7 0%, #00bcd4 50%, #4dd0c8 100%)',
                transform: 'rotate(25deg)',
                boxShadow: '0 8px 24px rgba(0, 188, 212, 0.3)',
              }}
            >
              {/* Inner ear */}
              <div
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '35px',
                  height: '70px',
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }}
              />
            </motion.div>
          </div>

          {/* Main Circle Body */}
          <div
            className="relative w-full h-full rounded-full overflow-hidden shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #0097a7 0%, #00bcd4 40%, #4dd0c8 100%)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-white"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
            >
              <X className="w-5 h-5" style={{ color: '#00bcd4' }} strokeWidth={2.5} />
            </button>

            {/* Decorative floating circles */}
            {[
              { size: 80, top: '15%', left: '10%', opacity: 0.1, delay: 0 },
              { size: 50, top: '60%', right: '15%', opacity: 0.15, delay: 1 },
              { size: 30, bottom: '20%', left: '20%', opacity: 0.12, delay: 2 },
            ].map((circle, idx) => (
              <motion.div
                key={idx}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [circle.opacity, circle.opacity * 1.5, circle.opacity],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: circle.delay,
                  ease: 'easeInOut',
                }}
                className="absolute rounded-full"
                style={{
                  width: `${circle.size}px`,
                  height: `${circle.size}px`,
                  backgroundColor: `rgba(255, 255, 255, ${circle.opacity})`,
                  ...Object.fromEntries(
                    Object.entries(circle).filter(([key]) => 
                      ['top', 'bottom', 'left', 'right'].includes(key)
                    )
                  ),
                }}
              />
            ))}

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 sm:px-12">
              {/* Icon Row */}
              <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8">
                {[
                  { Icon: BookOpen, delay: 0.1 },
                  { Icon: Headphones, delay: 0.15 },
                  { Icon: Pencil, delay: 0.2 },
                  { Icon: Lightbulb, delay: 0.25 },
                ].map(({ Icon, delay }, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />
                  </motion.div>
                ))}
              </div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center"
              >
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl leading-tight mb-2 sm:mb-3"
                  style={{ fontWeight: 800, color: '#fff' }}
                >
                  Start Your
                  <br />
                  SAT Journey
                </h2>
                <p
                  className="text-sm sm:text-base mb-6 sm:mb-8"
                  style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                >
                  Log in to access all practice tests
                </p>
              </motion.div>

              {/* Login Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLoginClick}
                className="w-full max-w-xs py-4 sm:py-5 rounded-full text-white text-lg sm:text-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-shadow hover:shadow-xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#00bcd4',
                }}
              >
                Log In
                <span className="text-xl sm:text-2xl">→</span>
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="text-center mt-4 sm:mt-6 text-xs sm:text-sm"
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                Practice smarter, score higher
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}