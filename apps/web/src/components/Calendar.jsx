import React from 'react';

export default function Calendar({ color = '#4A90D9' }) {
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl" style={{ padding: '20px', textAlign: 'center' }}>
      <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: color }}>
        {monthName}
      </span>
    </div>
  );
}
