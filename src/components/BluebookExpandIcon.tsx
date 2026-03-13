import React from 'react';

interface BluebookExpandIconProps {
  type: 'expand' | 'collapse';
  className?: string;
  color?: string;
  flipX?: boolean;
  flipY?: boolean;
}

export function BluebookExpandIcon({ type, className = '', color = '#AFAFAF', flipX = false, flipY = false }: BluebookExpandIconProps) {
  // Use CSS scale for mirroring
  const scaleX = flipX ? -1 : 1;
  const scaleY = flipY ? -1 : 1;
  const transform = `scale(${scaleX}, ${scaleY})`;
  const strokeWidth = "1.6";
  
  if (type === 'expand') {
    return (
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ transform, transition: 'stroke 0.2s ease' }}
      >
        {/* Outer Frame - Top and Right part */}
        <path 
          d="M4 10V4H20V20H14" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
        {/* Small Square - Bottom Left */}
        <path 
          d="M4 14H10V20H4V14Z" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
        {/* Diagonal Arrow - Shorter as requested (7.5 -> 6 units) */}
        <path 
          d="M10 14L16 8" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          strokeLinecap="butt"
        />
        {/* Arrow Head - Long wings */}
        <path 
          d="M12.5 8H16V11.5" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
      </svg>
    );
  } else {
    // Inward pointing arrow (Collapse)
    return (
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ transform, transition: 'stroke 0.2s ease' }}
      >
        <path 
          d="M4 10V4H20V20H14" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
        <path 
          d="M4 14H10V20H4V14Z" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
        {/* Arrow pointing back to corner */}
        <path 
          d="M16 8L10 14" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          strokeLinecap="butt"
        />
        <path 
          d="M13.5 14H10V10.5" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
      </svg>
    );
  }
}
