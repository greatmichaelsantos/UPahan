import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SectionHeader({ label, title, onBack, backLabel = 'Back', children }) {
  return (
    <div className="md:hidden" style={{ background: '#2E7D72', padding: '24px 20px 28px' }}>
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 mb-4 transition-colors"
          style={{ color: 'rgba(255,255,255,0.7)' }}
          onMouseOver={e => e.currentTarget.style.color = 'white'}
          onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          aria-label={backLabel}
        >
          <ArrowLeft size={16} />
          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, letterSpacing: '0.06em' }}>
            {backLabel.toUpperCase()}
          </span>
        </button>
      )}

      <p style={{
        color: '#C9A84C',
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 6,
      }}>
        {label}
      </p>

      <h1 style={{
        color: 'white',
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 28,
        lineHeight: 1.2,
        margin: 0,
      }}>
        {title}
      </h1>

      {children}
    </div>
  );
}
