import { X } from "lucide-react";
import { Button } from "./ui/button";

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferenceModal({ isOpen, onClose }: ReferenceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Reference Sheet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Geometry Formulas - Top Row */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <svg width="80" height="80" viewBox="0 0 80 80" className="mb-2">
                <circle cx="40" cy="40" r="30" fill="none" stroke="black" strokeWidth="1.5" />
                <circle cx="40" cy="40" r="2" fill="black" />
                <line x1="40" y1="40" x2="70" y2="40" stroke="black" strokeWidth="1" />
                <text x="58" y="35" fontSize="12" fontStyle="italic">r</text>
              </svg>
              <div className="text-center text-sm">
                <div><i>A</i> = π<i>r</i><sup>2</sup></div>
                <div><i>C</i> = 2π<i>r</i></div>
              </div>
            </div>

            {/* Rectangle */}
            <div className="flex flex-col items-center">
              <svg width="80" height="80" viewBox="0 0 80 80" className="mb-2">
                <rect x="15" y="25" width="50" height="30" fill="none" stroke="black" strokeWidth="1.5" />
                <text x="38" y="55" fontSize="11" fontStyle="italic">w</text>
                <text x="68" y="42" fontSize="11" fontStyle="italic">ℓ</text>
              </svg>
              <div className="text-center text-sm">
                <div><i>A</i> = ℓ<i>w</i></div>
              </div>
            </div>

            {/* Triangle */}
            <div className="flex flex-col items-center">
              <svg width="80" height="80" viewBox="0 0 80 80" className="mb-2">
                <polygon points="40,20 15,60 65,60" fill="none" stroke="black" strokeWidth="1.5" />
                <line x1="40" y1="20" x2="40" y2="60" stroke="black" strokeWidth="1" strokeDasharray="2,2" />
                <text x="43" y="42" fontSize="11" fontStyle="italic">h</text>
                <text x="38" y="70" fontSize="11" fontStyle="italic">b</text>
              </svg>
              <div className="text-center text-sm">
                <div><i>A</i> = <sup>1</sup>/<sub>2</sub><i>bh</i></div>
              </div>
            </div>

            {/* Right Triangle */}
            <div className="flex flex-col items-center">
              <svg width="80" height="80" viewBox="0 0 80 80" className="mb-2">
                <polygon points="20,60 20,20 60,60" fill="none" stroke="black" strokeWidth="1.5" />
                <text x="8" y="42" fontSize="11" fontStyle="italic">a</text>
                <text x="42" y="70" fontSize="11" fontStyle="italic">b</text>
                <text x="42" y="35" fontSize="11" fontStyle="italic">c</text>
              </svg>
              <div className="text-center text-sm">
                <div><i>c</i><sup>2</sup> = <i>a</i><sup>2</sup> + <i>b</i><sup>2</sup></div>
              </div>
            </div>
          </div>

          {/* Special Right Triangles */}
          <div className="flex justify-center gap-12 mb-8">
            {/* 30-60-90 Triangle */}
            <div className="flex flex-col items-center">
              <svg width="100" height="100" viewBox="0 0 100 100" className="mb-2">
                <polygon points="30,70 30,20 80,70" fill="none" stroke="black" strokeWidth="1.5" />
                <text x="20" y="48" fontSize="11" fontStyle="italic">x</text>
                <text x="57" y="80" fontSize="11" fontStyle="italic">x</text>
                <text x="28" y="15" fontSize="10">60°</text>
                <text x="70" y="72" fontSize="10">30°</text>
                <text x="58" y="42" fontSize="11">2<i>x</i></text>
                <text x="48" y="88" fontSize="11" fontStyle="italic">x√3</text>
              </svg>
            </div>

            {/* 45-45-90 Triangle */}
            <div className="flex flex-col items-center">
              <svg width="100" height="100" viewBox="0 0 100 100" className="mb-2">
                <polygon points="25,70 25,25 70,70" fill="none" stroke="black" strokeWidth="1.5" />
                <text x="15" y="50" fontSize="11" fontStyle="italic">s</text>
                <text x="45" y="80" fontSize="11" fontStyle="italic">s</text>
                <text x="20" y="20" fontSize="10">45°</text>
                <text x="62" y="72" fontSize="10">45°</text>
                <text x="50" y="45" fontSize="11"><i>s</i>√2</text>
              </svg>
            </div>

            {/* Rectangular Prism */}
            <div className="flex flex-col items-center">
              <svg width="100" height="100" viewBox="0 0 100 100" className="mb-2">
                <rect x="20" y="40" width="45" height="35" fill="none" stroke="black" strokeWidth="1.5" />
                <path d="M 35,25 L 80,25 L 80,60 L 65,75" fill="none" stroke="black" strokeWidth="1.5" strokeDasharray="3,3" />
                <path d="M 65,40 L 80,25" stroke="black" strokeWidth="1.5" />
                <path d="M 65,75 L 80,60" stroke="black" strokeWidth="1.5" />
                <path d="M 65,40 L 65,75" stroke="black" strokeWidth="1.5" />
                <text x="42" y="85" fontSize="11" fontStyle="italic">w</text>
                <text x="68" y="57" fontSize="11" fontStyle="italic">ℓ</text>
                <text x="83" y="45" fontSize="11" fontStyle="italic">h</text>
              </svg>
              <div className="text-center text-sm mt-2">
                <div><i>V</i> = ℓ<i>wh</i></div>
              </div>
            </div>

            {/* Cylinder */}
            <div className="flex flex-col items-center">
              <svg width="100" height="100" viewBox="0 0 100 100" className="mb-2">
                <ellipse cx="50" cy="30" rx="25" ry="8" fill="none" stroke="black" strokeWidth="1.5" />
                <line x1="25" y1="30" x2="25" y2="70" stroke="black" strokeWidth="1.5" />
                <line x1="75" y1="30" x2="75" y2="70" stroke="black" strokeWidth="1.5" />
                <ellipse cx="50" cy="70" rx="25" ry="8" fill="none" stroke="black" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="2" fill="black" />
                <text x="54" y="55" fontSize="11" fontStyle="italic">r</text>
                <text x="78" y="52" fontSize="11" fontStyle="italic">h</text>
              </svg>
              <div className="text-center text-sm mt-2">
                <div><i>V</i> = π<i>r</i><sup>2</sup><i>h</i></div>
              </div>
            </div>
          </div>

          {/* 3D Shapes - Bottom Row */}
          <div className="grid grid-cols-3 gap-8 mb-8">
            {/* Sphere */}
            <div className="flex flex-col items-center">
              <svg width="100" height="100" viewBox="0 0 100 100" className="mb-2">
                <circle cx="50" cy="50" r="30" fill="none" stroke="black" strokeWidth="1.5" />
                <ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="black" strokeWidth="1" strokeDasharray="3,3" />
                <circle cx="50" cy="50" r="2" fill="black" />
                <line x1="50" y1="50" x2="80" y2="50" stroke="black" strokeWidth="1" />
                <text x="68" y="46" fontSize="11" fontStyle="italic">r</text>
              </svg>
              <div className="text-center text-sm">
                <div><i>V</i> = <sup>4</sup>/<sub>3</sub>π<i>r</i><sup>3</sup></div>
              </div>
            </div>

            {/* Cone */}
            <div className="flex flex-col items-center">
              <svg width="100" height="100" viewBox="0 0 100 100" className="mb-2">
                <ellipse cx="50" cy="75" rx="30" ry="8" fill="none" stroke="black" strokeWidth="1.5" />
                <line x1="20" y1="75" x2="50" y2="20" stroke="black" strokeWidth="1.5" />
                <line x1="80" y1="75" x2="50" y2="20" stroke="black" strokeWidth="1.5" />
                <line x1="50" y1="20" x2="50" y2="75" stroke="black" strokeWidth="1" strokeDasharray="2,2" />
                <text x="54" y="50" fontSize="11" fontStyle="italic">h</text>
                <text x="62" y="80" fontSize="11" fontStyle="italic">r</text>
              </svg>
              <div className="text-center text-sm">
                <div><i>V</i> = <sup>1</sup>/<sub>3</sub>π<i>r</i><sup>2</sup><i>h</i></div>
              </div>
            </div>

            {/* Pyramid */}
            <div className="flex flex-col items-center">
              <svg width="100" height="100" viewBox="0 0 100 100" className="mb-2">
                <path d="M 50,20 L 20,75 L 80,75 Z" fill="none" stroke="black" strokeWidth="1.5" />
                <path d="M 50,20 L 50,75" stroke="black" strokeWidth="1" strokeDasharray="2,2" />
                <line x1="20" y1="75" x2="80" y2="75" stroke="black" strokeWidth="1.5" />
                <text x="54" y="50" fontSize="11" fontStyle="italic">h</text>
                <text x="48" y="88" fontSize="11" fontStyle="italic">ℓ</text>
                <text x="83" y="80" fontSize="11" fontStyle="italic">w</text>
              </svg>
              <div className="text-center text-sm">
                <div><i>V</i> = <sup>1</sup>/<sub>3</sub>ℓ<i>wh</i></div>
              </div>
            </div>
          </div>

          {/* Text Information */}
          <div className="space-y-2 text-sm text-gray-800 border-t pt-4">
            <p>The number of degrees of arc in a circle is 360.</p>
            <p>The number of radians of arc in a circle is 2π.</p>
            <p>The sum of the measures in degrees of the angles of a triangle is 180.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
