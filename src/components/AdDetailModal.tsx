import { useState } from 'react';
import { X } from 'lucide-react';
import { Advertisement } from './AdManagement';

interface AdDetailModalProps {
  ad: Advertisement;
  onClose: () => void;
}

export function AdDetailModal({ ad, onClose }: AdDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
          <h2 className="text-2xl font-bold text-gray-900">{ad.title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/80 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6">
            {/* Main Image */}
            {ad.imageUrl && (
              <div className="w-full rounded-xl overflow-hidden shadow-lg">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Video */}
            {ad.detailVideoUrl && (
              <div className="w-full rounded-xl overflow-hidden shadow-lg bg-black">
                <video
                  controls
                  className="w-full h-auto"
                  src={ad.detailVideoUrl}
                >
                  비디오를 재생할 수 없습니다.
                </video>
              </div>
            )}

            {/* Description */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">설명</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {ad.description}
              </p>
            </div>

            {/* Detail Content */}
            {ad.detailContent && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">상세 내용</h3>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                  {ad.detailContent}
                </div>
              </div>
            )}

            {/* Detail Images */}
            {ad.detailImages && ad.detailImages.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">추가 이미지</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ad.detailImages.map((imgUrl, index) => (
                    <div key={index} className="rounded-xl overflow-hidden shadow-md">
                      <img
                        src={imgUrl}
                        alt={`${ad.title} - 이미지 ${index + 1}`}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-300 transition-colors"
          >
            닫기
          </button>
          <a
            href={ad.buttonLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-2.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold rounded-full hover:from-orange-500 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
          >
            {ad.buttonText}
          </a>
        </div>
      </div>
    </div>
  );
}
