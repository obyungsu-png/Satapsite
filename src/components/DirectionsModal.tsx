import { Button } from "./ui/button";

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMathTest?: boolean;
}

export function DirectionsModal({ isOpen, onClose, isMathTest = false }: DirectionsModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile: centered overlay modal */}
      <div className="sm:hidden fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/20" />
        <div 
          className="relative bg-white border-2 border-gray-300 rounded-lg shadow-xl p-6 w-full max-w-sm max-h-[70vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            {isMathTest ? (
              <>
                <p className="text-gray-700 leading-relaxed" style={{ fontSize: '16px', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                  Each question includes one or more passages. Read carefully and choose the best answer.
                </p>
                <p className="text-gray-500 leading-relaxed" style={{ fontSize: '14px', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                  This section addresses important math skills. Calculator use is permitted for all questions. Unless otherwise indicated: all variables represent real numbers, figures are drawn to scale and lie in a plane, and the domain of <em>f</em> is the set of all real numbers <em>x</em> for which <em>f</em>(<em>x</em>) is real.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-800 leading-relaxed" style={{ fontSize: '16px', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                  Each question includes one or more passages. Read carefully and choose the best answer.
                </p>
                <p className="text-gray-500 leading-relaxed" style={{ fontSize: '14px', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                  All questions are <strong className="text-gray-800">multiple-choice with four answer choices</strong> and have a single best answer.
                </p>
              </>
            )}
            
            <div className="flex justify-center pt-2">
              <button 
                onClick={onClose}
                className="px-10 py-2.5 rounded-full"
                style={{ 
                  backgroundColor: '#F1BF00',
                  fontWeight: '700',
                  fontSize: '15px',
                  color: '#000000',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: dropdown positioned below button */}
      <div 
        className="hidden sm:block absolute top-full left-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-8 z-50"
        style={{ width: 'calc(50vw - 40px)' }}
      >
        <div className="space-y-6">
          {isMathTest ? (
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed" style={{ fontSize: '16px', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                The questions in this section address a number of important math skills.
              </p>
              <p className="text-gray-700 leading-relaxed" style={{ fontSize: '16px', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                Use of a calculator is permitted for all questions. A reference sheet, calculator, and these directions can be accessed throughout the test.
              </p>
              <p className="text-gray-700 leading-relaxed" style={{ fontSize: '16px', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                Unless otherwise indicated:
              </p>
              <div className="space-y-6 pt-2">
                <p className="text-gray-700 leading-relaxed" style={{ fontSize: '16px', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                  All variables and expressions represent real numbers.
                </p>
                <p className="text-gray-700 leading-relaxed" style={{ fontSize: '16px', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                  Figures provided are drawn to scale.
                </p>
                <p className="text-gray-700 leading-relaxed" style={{ fontSize: '16px', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                  All figures lie in a plane.
                </p>
                <p className="text-gray-700 leading-relaxed" style={{ fontSize: '16px', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                  The domain of a given function <em>f</em> is the set of all real numbers <em>x</em> for which <em>f</em>(<em>x</em>) is a real number.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-800 leading-relaxed" style={{ fontSize: '16px', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                The questions in this section address a number of important reading and writing skills. Each 
                question includes one or more passages, which may include a table or graph. Read each 
                passage and question carefully, and then choose the best answer to the question based on the 
                passage(s).
              </p>
              <p className="text-gray-800 leading-relaxed" style={{ fontSize: '16px', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                All questions in this section are <strong>multiple-choice with four answer choices</strong>. Each question 
                has a single best answer.
              </p>
            </>
          )}
          
          <div className="flex justify-end pt-4">
            <button 
              onClick={onClose}
              className="px-10 py-2.5 rounded-full"
              style={{ 
                backgroundColor: '#F1BF00',
                fontWeight: '700',
                fontSize: '15px',
                color: '#000000',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
