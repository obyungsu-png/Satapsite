// Helper component for mobile-optimized SAT Voca modals
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { X, Trash2 } from "lucide-react";

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
    <Dialog open={step === 2} onOpenChange={(open) => !open && setStep(1)}>
      <DialogContent className="!max-w-[95vw] md:!max-w-[1400px] !w-[95vw] md:!w-[90vw] !h-[68vh] md:!h-[85vh] !bottom-auto !top-[6vh] !translate-y-0 md:!top-auto md:!translate-y-[-50%] p-0 overflow-hidden flex flex-col [&>button]:hidden !z-[60]">
        <DialogTitle className="sr-only">SAT 어휘 시험 출제하기 - Step 1. 출제 단어 확인 및 선택</DialogTitle>
        <DialogDescription className="sr-only">
          전체 단어 리스트에서 출제할 단어를 선택하고 출제 리스트를 관리할 수 있습니다.
        </DialogDescription>
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className="text-white text-center py-3 md:py-4 px-4 md:px-6 relative" style={{ backgroundColor: '#3DB89E' }}>
            <h1 className="text-sm md:text-xl font-semibold leading-tight">
              SAT 어휘 시험 출제하기 - Step 1.<br className="md:hidden" /> 출제 단어 확인 및 선택
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              className="absolute right-2 md:right-4 top-2 md:top-3 text-white hover:bg-white/20 p-1"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-2 md:py-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-600 font-medium">문제 배치</span>
                <Button
                  variant={activeTab === "랜덤" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("랜덤")}
                  className="text-xs md:text-sm px-3 md:px-4 h-7 md:h-8 rounded-lg"
                  style={activeTab === "랜덤" ? { backgroundColor: '#3DB89E', color: 'white' } : {}}
                >
                  랜덤
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-600 font-medium">영단어 첫 글자 보여주기</span>
                <Button
                  variant={showFirstLetter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFirstLetter(!showFirstLetter)}
                  className="text-xs md:text-sm px-4 md:px-6 h-7 md:h-8 rounded-lg font-semibold"
                  style={showFirstLetter ? { backgroundColor: '#3DB89E', color: 'white' } : {}}
                >
                  {showFirstLetter ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-0 overflow-auto px-2 md:px-6 py-3 md:py-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              {/* Left: All Words */}
              <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
                <div className="border-b border-gray-300 p-2 md:p-3 flex items-center justify-between bg-gray-50">
                  <h3 className="text-sm md:text-base font-semibold">전체 리스트 ({availableWords.length}개)</h3>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
                  <div className="hidden md:block">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left text-sm text-gray-600 font-medium">영단어</th>
                          <th className="px-3 py-2 text-left text-sm text-gray-600 font-medium">한글 뜻</th>
                          <th className="px-3 py-2 text-left text-sm text-gray-600 font-medium">영영풀이</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableWords.slice(0, 100).map((word) => (
                          <tr
                            key={word.id}
                            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              selectedWords.find(w => w.id === word.id) ? 'bg-green-50' : ''
                            }`}
                            onClick={() => {
                              if (!selectedWords.find(w => w.id === word.id)) {
                                setSelectedWords([...selectedWords, word]);
                              }
                            }}
                          >
                            <td className="px-3 py-2 text-sm">{word.english}</td>
                            <td className="px-3 py-2 text-sm text-gray-600">{word.korean}</td>
                            <td className="px-3 py-2 text-xs text-gray-500">{word.definition.slice(0, 25)}...</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile List View */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {availableWords.slice(0, 100).map((word) => (
                      <div
                        key={word.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer ${
                          selectedWords.find(w => w.id === word.id) ? 'bg-green-50' : ''
                        }`}
                        onClick={() => {
                          if (!selectedWords.find(w => w.id === word.id)) {
                            setSelectedWords([...selectedWords, word]);
                          }
                        }}
                      >
                        <div className="font-medium text-sm mb-1">{word.english}</div>
                        <div className="text-xs text-gray-600">{word.korean}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Selected Words */}
              <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
                <div className="border-b border-gray-300 p-2 md:p-3 flex items-center justify-between bg-gray-50">
                  <h3 className="text-sm md:text-base font-semibold">출제 리스트 ({selectedWords.length}개)</h3>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
                  <div className="hidden md:block">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left text-sm text-gray-600 font-medium">영단어</th>
                          <th className="px-3 py-2 text-left text-sm text-gray-600 font-medium">한글 뜻</th>
                          <th className="px-3 py-2 text-left text-sm text-gray-600 font-medium">삭제</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedWords.map((word) => (
                          <tr key={word.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm">{word.english}</td>
                            <td className="px-3 py-2 text-sm text-gray-600">{word.korean}</td>
                            <td className="px-3 py-2 text-sm">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveFromSelected(word.id)}
                                className="p-1"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile List View */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {selectedWords.map((word) => (
                      <div key={word.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">{word.english}</div>
                          <div className="text-xs text-gray-600">{word.korean}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFromSelected(word.id)}
                          className="p-2"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-3 md:px-6 py-3 md:py-4 bg-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-xs md:text-sm text-gray-600 text-center md:text-left">
                * 출제 리스트 확인 후 [출제하기] 버튼을 클릭해주세요.
              </p>
              <Button
                onClick={proceedToStep3}
                className="w-full md:w-auto px-12 md:px-16 py-3 md:py-5 text-sm md:text-base rounded-xl md:rounded-full text-white hover:opacity-90 transition-opacity font-semibold shadow-lg"
                style={{ backgroundColor: '#3DB89E' }}
              >
                출제하기
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
