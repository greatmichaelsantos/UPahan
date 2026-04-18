import React from 'react';

export default function Logo({ size = 48, dark = false, className = '' }) {
  const color = dark ? '#ffffff' : '#1DB954';
  const bg = dark ? 'rgba(255,255,255,0.15)' : 'rgba(29,185,84,0.12)';
  return (
    <div
      className={`flex items-center justify-center rounded-2xl ${className}`}
      style={{ width: size, height: size, background: bg }}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 32 32" fill="none">
        <path d="M16 3L3 14h3v14h8v-8h4v8h8V14h3L16 3z" fill={color} />
        <rect x="13" y="8" width="2" height="2" rx="0.5" fill={dark ? '#0F1923' : '#ffffff'} />
        <circle cx="22" cy="22" r="5" fill={dark ? '#ffffff' : '#0F1923'} />
        <rect x="21" y="19" width="2" height="6" rx="1" fill={dark ? '#0F1923' : '#ffffff'} />
        <rect x="19" y="21" width="6" height="2" rx="1" fill={dark ? '#0F1923' : '#ffffff'} />
      </svg>
    </div>
  );
}
