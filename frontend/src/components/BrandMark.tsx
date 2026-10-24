import React from 'react';

// Brand mark: a "Q" built from a ring and a squared tail on a signal tile.
export const BrandMark: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect width="32" height="32" rx="7" fill="#c8f135" />
    <circle cx="15" cy="15" r="7" fill="none" stroke="#070908" strokeWidth="3" />
    <path d="M18.5 18.5 L24.5 24.5" stroke="#070908" strokeWidth="3.2" strokeLinecap="square" />
  </svg>
);

export default BrandMark;
