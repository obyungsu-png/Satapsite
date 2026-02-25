import { Button } from "./ui/button";

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMathTest?: boolean;
}

export function DirectionsModal({ isOpen, onClose, isMathTest = false }: DirectionsModalProps) {
  if (!isOpen) return null;

  // Debug log
  console.log('DirectionsModal isMathTest:', isMathTest);

  return (
    <div className="absolute top-full left-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-8 max-w-3xl w-full md:w-[800px] z-50">
      <div className="space-y-6">
        {isMathTest ? (
          // Math Directions
          <>
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
          </>
        ) : (
          // Reading and Writing Directions
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
              fontSize: '15px',
              fontWeight: '700',
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
  );
}