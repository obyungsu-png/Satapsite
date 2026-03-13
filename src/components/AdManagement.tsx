import { Trash2, Wand2, Sparkles, X, FileText, Video, Image as ImageIcon, Tag, Target, DollarSign, Calendar, Eye, EyeOff, Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { useState, useEffect } from 'react';

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 10000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('Request timeout'), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  showInPractice: boolean;
  showInLectures: boolean;
  showInTraining: boolean;
  showInHistory: boolean;
  showInPricing: boolean;
  detailContent?: string; // 상세 설명
  detailImages?: string[]; // 상세 이미지들
  detailVideoUrl?: string; // 상세 비디오
}

interface AdManagementProps {
  onClose: () => void;
  projectId: string;
  publicAnonKey: string;
  onAdsUpdate: (ads: Advertisement[]) => void;
}

export function AdManagement({ onClose, projectId, publicAnonKey, onAdsUpdate }: AdManagementProps) {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [buttonText, setButtonText] = useState('더 알아보기');
  const [buttonLink, setButtonLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showInPractice, setShowInPractice] = useState(true);
  const [showInLectures, setShowInLectures] = useState(true);
  const [showInTraining, setShowInTraining] = useState(true);
  const [showInHistory, setShowInHistory] = useState(true);
  const [showInPricing, setShowInPricing] = useState(true);
  const [detailContent, setDetailContent] = useState('');
  const [detailImages, setDetailImages] = useState<string[]>([]);
  const [detailVideoUrl, setDetailVideoUrl] = useState('');

  // Load advertisements
  useEffect(() => {
    loadAdvertisements();
  }, []);

  const loadAdvertisements = async () => {
    try {
      const response = await fetchWithTimeout(
        `https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/advertisements`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setAdvertisements(data);
          onAdsUpdate(data);
        }
      } else {
        console.log('⚠️ 광고 로드 실패 (빈 배열 사용):', response.status);
        setAdvertisements([]);
        onAdsUpdate([]);
      }
    } catch (error) {
      console.log('⚠️ 광고 로드 에러 (빈 배열 사용):', error instanceof Error ? error.message : String(error));
      // 네트워크 에러가 발생해도 계속 진행
      setAdvertisements([]);
      onAdsUpdate([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !description || !buttonLink) {
      toast.error('모든 필수 항목을 입력해주세요');
      return;
    }

    const ad: Advertisement = {
      id: editingAd?.id || `ad-${Date.now()}`,
      title,
      description,
      buttonText,
      buttonLink,
      imageUrl,
      isActive: true,
      createdAt: editingAd?.createdAt || new Date().toISOString(),
      showInPractice,
      showInLectures,
      showInTraining,
      showInHistory,
      showInPricing,
      detailContent,
      detailImages,
      detailVideoUrl,
    };

    try {
      const response = await fetchWithTimeout(
        `https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/advertisements`,
        {
          method: editingAd ? 'PUT' : 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ad),
        }
      );

      if (response.ok) {
        toast.success(editingAd ? '광고가 수정되었습니다' : '광고가 생성되었습니다');
        resetForm();
        loadAdvertisements();
      }
    } catch (error) {
      console.error('광고 저장 에러:', error);
      toast.error('광고 저장에 실패했습니다');
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setTitle(ad.title || '');
    setDescription(ad.description || '');
    setButtonText(ad.buttonText || '더 알아보기');
    setButtonLink(ad.buttonLink || '');
    setImageUrl(ad.imageUrl || '');
    setShowInPractice(ad.showInPractice ?? true);
    setShowInLectures(ad.showInLectures ?? true);
    setShowInTraining(ad.showInTraining ?? true);
    setShowInHistory(ad.showInHistory ?? true);
    setShowInPricing(ad.showInPricing ?? true);
    setDetailContent(ad.detailContent || '');
    setDetailImages(ad.detailImages || []);
    setDetailVideoUrl(ad.detailVideoUrl || '');
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 광고를 삭제하시겠습니까?')) return;

    try {
      const response = await fetchWithTimeout(
        `https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/advertisements/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        toast.success('광고가 삭제되었습니다');
        loadAdvertisements();
      }
    } catch (error) {
      console.error('광고 삭제 에러:', error);
      toast.error('광고 삭제에 실패했습니다');
    }
  };

  const toggleActive = async (ad: Advertisement) => {
    const updatedAd = { ...ad, isActive: !ad.isActive };

    try {
      const response = await fetchWithTimeout(
        `https://${projectId}.supabase.co/functions/v1/make-server-46fa08c1/advertisements`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedAd),
        }
      );

      if (response.ok) {
        toast.success(updatedAd.isActive ? '광고가 활성화되었습니다' : '광고가 비활성화되었습니다');
        loadAdvertisements();
      }
    } catch (error) {
      console.error('광고 상태 변경 에러:', error);
    }
  };

  const resetForm = () => {
    setEditingAd(null);
    setTitle('');
    setDescription('');
    setButtonText('더 알아보기');
    setButtonLink('');
    setImageUrl('');
    setShowInPractice(true);
    setShowInLectures(true);
    setShowInTraining(true);
    setShowInHistory(true);
    setShowInPricing(true);
    setDetailContent('');
    setDetailImages([]);
    setDetailVideoUrl('');
    setIsEditing(false);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">광고 관리</h2>
        <p className="text-gray-600 mt-2">Practice, Lectures, Training, History 탭에 표시할 광고를 관리합니다.</p>
      </div>

      {/* Content */}
      <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingAd ? '광고 수정' : '새 광고 만들기'}
                </h3>
                {editingAd && (
                  <Button onClick={resetForm} variant="outline" size="sm">
                    취소
                  </Button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 시즌 특별 할인!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명 *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="할인 자료 단어 완성 공식 - 알성격 출이징 인성 그렇게..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  버튼 텍스트
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="더 알아보기"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  버튼 링크 *
                </label>
                <input
                  type="url"
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이미지 URL (선택)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  표시 위치
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showInPractice}
                      onChange={(e) => setShowInPractice(e.target.checked)}
                      className="mr-2"
                    />
                    Practice 탭
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showInLectures}
                      onChange={(e) => setShowInLectures(e.target.checked)}
                      className="mr-2"
                    />
                    Lectures 탭
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showInTraining}
                      onChange={(e) => setShowInTraining(e.target.checked)}
                      className="mr-2"
                    />
                    Training 탭
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showInHistory}
                      onChange={(e) => setShowInHistory(e.target.checked)}
                      className="mr-2"
                    />
                    History 탭
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showInPricing}
                      onChange={(e) => setShowInPricing(e.target.checked)}
                      className="mr-2"
                    />
                    Pricing 탭
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상세 설명 (선택)
                </label>
                <textarea
                  value={detailContent}
                  onChange={(e) => setDetailContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="광고에 대한 상세 설명을 입력하세요..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상세 이미지 URL (선택, 쉼표로 구분)
                </label>
                <textarea
                  value={detailImages.join(', ')}
                  onChange={(e) => setDetailImages(e.target.value.split(',').map(url => url.trim()).filter(url => url))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="https://example.com/image1.png, https://example.com/image2.png"
                />
                <p className="text-xs text-gray-500 mt-1">여러 이미지 URL을 쉼표로 구분하여 입력하세요</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상세 비디오 URL (선택)
                </label>
                <input
                  type="url"
                  value={detailVideoUrl}
                  onChange={(e) => setDetailVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/video.mp4"
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                {editingAd ? '수정하기' : '생성하기'}
              </Button>
            </div>

            {/* Right: List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">광고 목록</h3>
              
              {loading ? (
                <div className="text-center py-8 text-gray-500">로딩 중...</div>
              ) : advertisements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">광고가 없습니다</div>
              ) : (
                <div className="space-y-3">
                  {advertisements.map((ad) => (
                    <div
                      key={ad.id}
                      className="border rounded-lg p-4 space-y-2"
                      style={{
                        opacity: ad.isActive ? 1 : 0.5,
                        borderColor: ad.isActive ? '#10B981' : '#9CA3AF'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{ad.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{ad.description}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => toggleActive(ad)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title={ad.isActive ? '비활성화' : '활성화'}
                          >
                            {ad.isActive ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(ad)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="수정"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(ad.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {ad.showInPractice && <span className="bg-blue-100 px-2 py-0.5 rounded">Practice</span>}
                        {ad.showInLectures && <span className="bg-purple-100 px-2 py-0.5 rounded">Lectures</span>}
                        {ad.showInTraining && <span className="bg-orange-100 px-2 py-0.5 rounded">Training</span>}
                        {ad.showInHistory && <span className="bg-green-100 px-2 py-0.5 rounded">History</span>}
                        {ad.showInPricing && <span className="bg-red-100 px-2 py-0.5 rounded">Pricing</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}

// AdBanner Component for displaying ads in each tab
interface AdBannerDisplayProps {
  advertisements: Advertisement[];
  location: 'practice' | 'lectures' | 'training' | 'history' | 'pricing';
}

export function AdBannerDisplay({ advertisements, location }: AdBannerDisplayProps) {
  const [hiddenAds, setHiddenAds] = useState<Set<string>>(new Set());
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'images' | 'details'>('video');

  const locationKey = {
    'practice': 'showInPractice',
    'lectures': 'showInLectures',
    'training': 'showInTraining',
    'history': 'showInHistory',
    'pricing': 'showInPricing',
  }[location] as keyof Advertisement;

  const activeAds = advertisements.filter(
    (ad) => ad.isActive && ad[locationKey] && !hiddenAds.has(ad.id)
  );

  const hideAd = (adId: string) => {
    setHiddenAds(prev => new Set([...prev, adId]));
  };

  if (activeAds.length === 0) return null;

  return (
    <>
      <div className="space-y-3 mb-6">
        {activeAds.map((ad) => (
          <div
            key={ad.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all p-3 md:p-4 relative group cursor-pointer"
            onClick={() => setSelectedAd(ad)}
          >
            {/* Ad Badge */}
            <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded z-10">
              Ad
            </div>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                hideAd(ad.id);
              }}
              className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10 group"
              title="광고 닫기"
            >
              <X className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
            </button>

            {/* Mobile Layout */}
            <div className="flex md:hidden flex-col items-center gap-2 pt-4">
              {/* Image/Icon */}
              {ad.imageUrl ? (
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-24 h-24 object-contain rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-2"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center text-4xl">
                  📚
                </div>
              )}

              {/* Content */}
              <div className="text-center w-full">
                <h3 className="font-semibold text-gray-900 mb-1.5 text-base">
                  {ad.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2 px-2">
                  {ad.description}
                </p>
              </div>

              {/* Button */}
              <button
                className="w-full px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium rounded-full hover:from-amber-500 hover:to-orange-600 transition-all shadow-sm hover:shadow text-sm"
              >
                더 알아보기
              </button>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center gap-4">
              {/* Image/Icon */}
              {ad.imageUrl ? (
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-20 h-20 object-contain rounded-lg flex-shrink-0 bg-gradient-to-br from-blue-50 to-cyan-50 p-2"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center flex-shrink-0 text-4xl p-2">
                  📚
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 text-base">
                  {ad.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {ad.description}
                </p>
              </div>

              {/* Button */}
              <button
                className="px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium rounded-full hover:from-amber-500 hover:to-orange-600 transition-all shadow-sm hover:shadow whitespace-nowrap flex-shrink-0 text-sm"
              >
                더 알아보기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedAd && (
        <div 
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAd(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 relative">
              {/* FEATURED Badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold">FEATURED</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-2">{selectedAd.title}</h2>

              {/* Close button */}
              <button 
                onClick={() => setSelectedAd(null)} 
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-white px-6">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('video')}
                  className={`py-3 px-1 border-b-2 transition-colors text-sm font-medium flex items-center gap-2 ${
                    activeTab === 'video'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  동영상
                </button>
                <button
                  onClick={() => setActiveTab('images')}
                  className={`py-3 px-1 border-b-2 transition-colors text-sm font-medium flex items-center gap-2 ${
                    activeTab === 'images'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  사진
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-3 px-1 border-b-2 transition-colors text-sm font-medium flex items-center gap-2 ${
                    activeTab === 'details'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  상세정보
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              {activeTab === 'video' && (
                <div className="space-y-4">
                  {selectedAd.detailVideoUrl ? (
                    <div className="w-full rounded-xl overflow-hidden shadow-lg bg-black" style={{ minHeight: '400px' }}>
                      <video
                        controls
                        className="w-full h-full"
                        style={{ minHeight: '400px' }}
                        src={selectedAd.detailVideoUrl}
                      >
                        비디오를 재생할 수 없습니다.
                      </video>
                    </div>
                  ) : (
                    <div className="bg-gray-200 rounded-xl text-center" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium">연결을 거부했습니다.</p>
                        <p className="text-sm text-gray-400">www.youtube.com</p>
                      </div>
                    </div>
                  )}
                  {/* Description below video */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedAd.description}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'images' && (
                <div className="space-y-4" style={{ minHeight: '400px' }}>
                  {selectedAd.detailImages && selectedAd.detailImages.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {selectedAd.detailImages.map((imgUrl, index) => (
                        <div key={index} className="rounded-xl overflow-hidden shadow-md bg-white">
                          <img
                            src={imgUrl}
                            alt={`${selectedAd.title} - 이미지 ${index + 1}`}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : selectedAd.imageUrl ? (
                    <div className="rounded-xl overflow-hidden shadow-md bg-white">
                      <img
                        src={selectedAd.imageUrl}
                        alt={selectedAd.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl text-center" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-400">이미지가 없습니다</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-4" style={{ minHeight: '400px' }}>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">상세 정보</h3>
                    {selectedAd.detailContent ? (
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedAd.detailContent}
                      </div>
                    ) : (
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedAd.description}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">더 많은 정보가 필요하십니까?</span>
                </div>
                <a
                  href={selectedAd.buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-full hover:from-amber-500 hover:to-orange-600 transition-all shadow-md hover:shadow-lg text-sm"
                >
                  문의
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}