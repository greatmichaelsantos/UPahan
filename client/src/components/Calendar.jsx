import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar({ dark = false }) {
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = current.getFullYear();
  const month = current.getMonth();
  const monthName = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const textMain = dark ? 'text-white' : 'text-gray-800';
  const textMuted = dark ? 'text-gray-400' : 'text-gray-400';
  const dayText = dark ? 'text-gray-300' : 'text-gray-600';
  const bg = dark ? 'bg-transparent' : 'bg-white';

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div className={`${bg} rounded-2xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className={`p-1 rounded-lg ${dark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}>
          <ChevronLeft size={16} className={textMuted} />
        </button>
        <span className={`text-sm font-semibold ${textMain}`}>{monthName}</span>
        <button onClick={next} className={`p-1 rounded-lg ${dark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}>
          <ChevronRight size={16} className={textMuted} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className={`text-center text-[10px] font-semibold ${textMuted} py-1`}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => (
          <div key={i} className="flex items-center justify-center aspect-square">
            {d && (
              <span
                className={`
                  flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all
                  ${isToday(d)
                    ? 'bg-primary text-white font-bold shadow-sm'
                    : `${dayText} ${dark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`
                  }
                `}
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
