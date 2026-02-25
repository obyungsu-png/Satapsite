import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { X, ExternalLink } from "lucide-react";

interface VideoLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: number;
  testInfo?: any;
}

export function VideoLectureModal({ isOpen, onClose, questionId, testInfo }: VideoLectureModalProps) {
  // Generate video data based on question ID and test info
  const getVideoData = () => {
    return {
      title: `문제 ${questionId} 해설 강의`,
      description: `${testInfo?.title || "SAT 기출문제"} - 문제 ${questionId}번에 대한 전문가 해설입니다.`,
      instructor: "김영수 선생님",
      duration: "15분 30초",
      videoUrl: `https://youtube.com/watch?v=example_question_${questionId}`,
      transcript: [
        "안녕하세요, 이번 문제는 독해 유형의 문제입니다.",
        "먼저 지문을 차근차근 읽어보겠습니다.",
        "핵심 키워드를 찾는 것이 중요합니다.",
        "정답은 문맥상 가장 적절한 선택지를 골라야 합니다."
      ]
    };
  };

  const videoData = getVideoData();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                🎥 {videoData.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                {videoData.instructor} · {videoData.duration}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 p-6 pt-0 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Video Player Area */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center relative">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    동영상 강의
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">
                    실제 서비스에서는 동영상이 재생됩니다
                  </p>
                  <Button
                    onClick={() => window.open(videoData.videoUrl, '_blank')}
                    className="bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    YouTube에서 보기
                  </Button>
                </div>
              </div>
              
              {/* Video Description */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">강의 설명</h4>
                <p className="text-sm text-gray-600">
                  {videoData.description}
                </p>
              </div>
            </div>

            {/* Transcript and Notes */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4 h-full">
                <h4 className="font-medium text-gray-800 mb-3">강의 요약</h4>
                <div className="space-y-3">
                  {videoData.transcript.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h5 className="font-medium text-gray-800 mb-2">학습 팁</h5>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• 키워드에 집중하세요</p>
                    <p>• 문맥을 파악하세요</p>
                    <p>• 선택지를 비교 분석하세요</p>
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full"
                  >
                    강의 완료
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}