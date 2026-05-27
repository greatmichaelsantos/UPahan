import React from 'react';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function Calendar({ color = '#4A90D9' }) {
  const today = new Date();

  // Sunday of the current week
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const monthLabel = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={{ width: '100%' }}>
      {/* Month + year label */}
      <p style={{
        textAlign: 'center',
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 14,
        color: color,
        marginBottom: 12,
      }}>
        {monthLabel}
      </p>

      {/* 7-day row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
        {DAY_LABELS.map((label, i) => {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          const isToday = day.toDateString() === today.toDateString();

          return (
            <div
              key={i}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
            >
              <span style={{
                fontFamily: 'Inter',
                fontSize: 11,
                fontWeight: 600,
                color: '#AAAAAA',
              }}>
                {label}
              </span>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isToday ? color : 'transparent',
                color: isToday ? '#fff' : '#4A4A4A',
                fontFamily: 'Inter',
                fontWeight: isToday ? 700 : 400,
                fontSize: 13,
                userSelect: 'none',
              }}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
