import React from 'react';

export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#E8F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <Icon size={36} style={{ color: '#2E7D72' }} aria-hidden="true" />
        </div>
      )}
      <h3 style={{
        fontFamily: 'Inter',
        fontWeight: 700, fontSize: 20, color: '#4A4A4A', margin: '0 0 8px',
      }}>
        {title}
      </h3>
      {message && (
        <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#888888', maxWidth: 260, lineHeight: 1.5, margin: '0 0 20px' }}>
          {message}
        </p>
      )}
      {action}
    </div>
  );
}
