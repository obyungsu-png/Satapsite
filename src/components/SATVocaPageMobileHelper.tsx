// Helper component for mobile-optimized SAT Voca modals
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
// Button 컴포넌트의 타입 오류 해결을 위해 BaseButton으로 가져옵니다.
import { Button as BaseButton } from "./ui/button";
import { X, Trash2 } from "lucide-react";

// Button 타입을 유연하게 처리하기 위한 정의
const Button = BaseButton as any;

interface MobileStep2ModalProps {
  step: number;
  setStep: (step: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showFirstLetter: boolean;
  setShowFirstLetter: (show: boolean) => void;
  availableWords: any[];
  selectedWords: any[];
  setSelectedWords: (words: any[]) => void;
  handleRemoveFromSelected: (id: number) => void;
  proceedToStep3: () => void;
}

export function MobileStep2Modal({
  step,
  setStep,
  activeTab,
  setActiveTab,
  showFirstLetter,
  setShowFirstLetter,
  availableWords,
  selectedWords,
  setSelectedWords,
  handleRemoveFromSelected,
  proceedToStep3
}: MobileStep2ModalProps) {
  return (
    <Dialog open={step === 2} onOpenChange={(open: boolean) => !open && setStep(1)}>
      <DialogContent className="!max-w-[95vw] md:!max-w-[1400px] !w-[95vw] md:!w-[90vw] !h-[68vh] md:!h-[85vh] !bottom-auto !top-[6vh] md:!top-auto p-0 overflow-hidden flex flex-col [&>button]:hidden !z-[100]">
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div>
              <DialogTitle className="text-base md:text-lg font-bold text-gray-900">출제 리스트 확인</DialogTitle>
              <DialogDescription className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                선택된 단어를 확인하고 출제 버튼을 눌러주세요.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              className="p-1 h-8 w-8 rounded-full"
            >
              <X className="w-5 h-5 text-gray-400" />
            </Button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full">
              {/* Sidebar - Desktop Only */}
              <div className="hidden md:flex w-64 flex-col border-r border-gray-50 bg-gray-50/30">
                <div className="p-4 space-y-1">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'all' ? 'bg-[#3DB89E] text-white shadow-sm' : 'text-gray-600 hover:bg-white'
                    }`}
                  >
                    <span>전체 단어</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{availableWords.length}</span>
                  </button>
                </div>
              </div>

              {/* Main List Area */}
              <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                <div className="p-3 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                    {selectedWords.map((word: any) => (
                      <div
                        key={word.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-[#3DB89E]/30 transition-colors group"
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="font-medium text-sm mb-1 truncate text-gray-900">{word.english}</div>
                          <div className="text-xs text-gray-600 truncate">{word.korean}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFromSelected(word.id)}
                          className="p-2 hover:bg-red-50 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    ))}
                    {selectedWords.length === 0 && (
                      <div className="col-span-full py-20 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3">
                          <Trash2 className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-400">선택된 단어가 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 md:px-6 py-3 md:py-4 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-5xl mx-auto">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#3DB89E] animate-pulse" />
                <p className="text-[11px] md:text-sm text-gray-500">
                  총 <span className="font-bold text-gray-900">{selectedWords.length}</span>개의 단어가 선택되었습니다.
                </p>
              </div>
              <Button
                onClick={proceedToStep3}
                className="w-full md:w-auto px-10 md:px-16 py-3 md:py-6 text-sm md:text-base rounded-xl text-white hover:opacity-90 transition-all font-bold shadow-md active:scale-[0.98]"
                style={{ backgroundColor: '#3DB89E' }}
              >
                시험지 생성하기
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
