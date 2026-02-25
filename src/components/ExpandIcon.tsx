interface ExpandIconProps {
  direction: 'left' | 'right';
  isExpanded?: boolean;
  className?: string;
}

export function ExpandIcon({ direction, isExpanded = false, className = '' }: ExpandIconProps) {
  if (direction === 'right') {
    // Right panel expand icon (expands question panel to the right)
    return isExpanded ? (
      // Collapse icon - 왼쪽 화살표 (축소)
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M11 7 L8 10 L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ) : (
      // Expand icon - 오른쪽 화살표 (확장)
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M9 7 L12 10 L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  } else {
    // Left panel expand icon (expands passage panel to the left) - 좌우 대칭
    return isExpanded ? (
      // Collapse icon - 오른쪽 화살표 (축소)
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M9 7 L12 10 L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ) : (
      // Expand icon - 왼쪽 화살표 (확장)
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M11 7 L8 10 L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
}
