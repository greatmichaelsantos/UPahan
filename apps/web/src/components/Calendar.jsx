import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar({ color = '#4A90D9', hoverBg = '#EBF4FF' }) {
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year  = current.getFullYear();
  const month = current.getMonth();
  const monthName = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div className="bg-white rounded-xl" style={{ padding: '16px' }}>
      {/* Month header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prev}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
          onMouseOver={e => { e.currentTarget.style.background = hoverBg; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
          aria-label="Previous month"
        >
          <ChevronLeft size={16} style={{ color }} />
        </button>
        <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#4A4A4A' }}>
          {monthName}
        </span>
        <button
          onClick={next}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
          onMouseOver={e => { e.currentTarget.style.background = hoverBg; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
          aria-label="Next month"
        >
          <ChevronRight size={16} style={{ color }} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center py-1" style={{ fontSize: 10, fontWeight: 600, color: '#888888' }}>{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => (
          <div key={i} className="flex items-center justify-center aspect-square">
            {d && (
              <span
                className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-colors cursor-default"
                style={
                  isToday(d)
                    ? { background: color, color: 'white', fontWeight: 700 }
                    : { color: '#4A4A4A' }
                }
                onMouseOver={e => { if (!isToday(d)) e.currentTarget.style.background = hoverBg; }}
                onMouseOut={e => { if (!isToday(d)) e.currentTarget.style.background = 'transparent'; }}
              >
                {d}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
