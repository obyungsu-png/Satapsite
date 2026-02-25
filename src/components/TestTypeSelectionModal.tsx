import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";

interface TestTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'multiple' | 'subjective' | 'mixed') => void;
}

export function TestTypeSelectionModal({ isOpen, onClose, onSelect }: TestTypeSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle className="text-center text-xl mb-6">시험 유형 선택</DialogTitle>
        <DialogDescription className="sr-only">
          객관식, 주관식, 또는 객관식+주관식 혼합 시험 유형을 선택하세요.
        </DialogDescription>
        
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => onSelect('multiple')}
            className="py-6 text-lg hover:opacity-90 transition-opacity"
            variant="outline"
            style={{ borderColor: '#3DB89E', color: '#3DB89E' }}
          >
            객관식
          </Button>
          <Button
            onClick={() => onSelect('subjective')}
            className="py-6 text-lg hover:opacity-90 transition-opacity"
            variant="outline"
            style={{ borderColor: '#3DB89E', color: '#3DB89E' }}
          >
            주관식
          </Button>
          <Button
            onClick={() => onSelect('mixed')}
            className="py-6 text-lg text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#3DB89E' }}
          >
            객관식 + 주관식
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
