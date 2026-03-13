import React, { useState } from 'react';
import { BluebookExpandIcon } from './BluebookExpandIcon';

interface BluebookExpandButtonProps {
  type: 'expand' | 'collapse';
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  isExpanded?: boolean;
  flipX?: boolean;
  flipY?: boolean;
}

export function BluebookExpandButton({ type, onClick, className = '', isExpanded = false, flipX = false, flipY = false }: BluebookExpandButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => e.stopPropagation()}
      className={`
        w-[44px] h-[44px] rounded-full bg-white flex items-center justify-center 
        shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[rgba(0,0,0,0.015)]
        transition-colors duration-300 cursor-pointer 
        active:scale-95
        ${className}
      `}
      title={isExpanded ? "Collapse view" : "Expand view"}
    >
      <BluebookExpandIcon 
        type={type} 
        color={isHovered ? "#757575" : "#BDBDBD"} 
        className="w-[24px] h-[24px]"
        flipX={flipX}
        flipY={flipY}
      />
    </button>
  );
}
