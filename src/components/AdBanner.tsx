import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { useState } from "react";

interface AdBannerProps {
  image: string;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  size?: 'large' | 'small';
}

export function AdBanner({ 
  image, 
  title, 
  description, 
  buttonText = "더 알아보기",
  onButtonClick,
  size = 'large'
}: AdBannerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isLarge = size === 'large';

  return (
    <div 
      className={`bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 ${
        isLarge ? 'p-4' : 'p-4'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.08)'
      }}
    >
      {/* AD Label */}
      <div className="flex justify-end mb-1">
        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500">
          AD
        </span>
      </div>

      <div className={`flex ${isLarge ? 'flex-row gap-5' : 'flex-col gap-3'} items-center`}>
        {/* Image */}
        <div className={`${isLarge ? 'w-32 h-24' : 'w-full h-32'} flex-shrink-0 rounded-lg overflow-hidden`}>
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 
            className={`${isLarge ? 'text-base mb-1.5' : 'text-base mb-2'} text-gray-900`}
            style={{ fontWeight: 700 }}
          >
            {title}
          </h3>
          <p className={`${isLarge ? 'text-sm mb-2.5' : 'text-xs mb-3'} text-gray-600 leading-relaxed`}>
            {description}
          </p>
          <div>
            <Button
              onClick={onButtonClick}
              className={`${isLarge ? 'px-5 py-1.5 text-sm' : 'px-4 py-1.5 text-sm'} rounded-full text-white transition-all`}
              style={{ 
                backgroundColor: isHovered ? '#C17D4A' : '#D4894E'
              }}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
