import React from 'react';

const configs = {
  paid:     { bg: 'bg-green-100',  text: 'text-green-700',  label: 'PAID' },
  unpaid:   { bg: 'bg-red-100',    text: 'text-red-600',    label: 'UNPAID' },
  partial:  { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'PARTIAL' },
  late:     { bg: 'bg-orange-100', text: 'text-orange-600', label: 'LATE' },
  advance:  { bg: 'bg-blue-100',   text: 'text-blue-600',   label: 'ADVANCE' },
  pending:  { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'PENDING' },
  completed:{ bg: 'bg-green-100',  text: 'text-green-700',  label: 'COMPLETED' },
  in_progress:{ bg: 'bg-blue-100', text: 'text-blue-700',   label: 'IN PROGRESS' },
  vacant:   { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'VACANT' },
  occupied: { bg: 'bg-green-100',  text: 'text-green-700',  label: 'OCCUPIED' },
  under_maintenance: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'MAINTENANCE' },
  high:     { bg: 'bg-red-100',    text: 'text-red-600',    label: 'HIGH' },
  medium:   { bg: 'bg-orange-100', text: 'text-orange-600', label: 'MEDIUM' },
  low:      { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'LOW' },
  on_track: { bg: 'bg-green-100',  text: 'text-green-700',  label: 'ON TRACK' },
};

export default function StatusBadge({ status, className = '' }) {
  const cfg = configs[status?.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };
  return (
    <span className={`status-badge ${cfg.bg} ${cfg.text} ${className}`}>
      {cfg.label}
    </span>
  );
}
