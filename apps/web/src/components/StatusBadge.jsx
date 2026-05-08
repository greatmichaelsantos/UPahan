import React from 'react';

const configs = {
  paid:             { bg: '#E8F5F3', color: '#2E7D72',  label: 'PAID' },
  unpaid:           { bg: '#FDEEEE', color: '#D64045',  label: 'UNPAID' },
  partial:          { bg: '#EEF1FA', color: '#3A5BA0',  label: 'PARTIAL' },
  late:             { bg: '#FEF3EC', color: '#E07B39',  label: 'LATE' },
  advance:          { bg: '#EBF2FC', color: '#3A7BD5',  label: 'ADVANCE' },
  pending:          { bg: '#FEF3EC', color: '#E07B39',  label: 'PENDING' },
  completed:        { bg: '#E8F5F3', color: '#2E7D72',  label: 'COMPLETED' },
  in_progress:      { bg: '#EBF2FC', color: '#3A7BD5',  label: 'IN PROGRESS' },
  vacant:           { bg: '#FDF6E3', color: '#C9A84C',  label: 'VACANT' },
  occupied:         { bg: '#E8F5F3', color: '#2E7D72',  label: 'OCCUPIED' },
  under_maintenance:{ bg: '#F0EEEB', color: '#888888',  label: 'MAINTENANCE' },
  high:             { bg: '#D64045', color: '#FFFFFF',  label: 'HIGH', solid: true },
  medium:           { bg: '#E07B39', color: '#FFFFFF',  label: 'MEDIUM', solid: true },
  low:              { bg: '#888888', color: '#FFFFFF',  label: 'LOW', solid: true },
  on_track:         { bg: '#E8F5F3', color: '#2E7D72',  label: 'ON TRACK' },
  pending_approval: { bg: '#FEF3EC', color: '#E07B39',  label: 'PENDING' },
  rejected:         { bg: '#FDEEEE', color: '#D64045',  label: 'REJECTED' },
  verified:         { bg: '#E8F5F3', color: '#2E7D72',  label: 'VERIFIED' },
  under_review:     { bg: '#FEF3EC', color: '#E07B39',  label: 'UNDER REVIEW' },
};

export default function StatusBadge({ status, className = '' }) {
  const key = status?.toLowerCase().replace(/ /g, '_');
  const cfg = configs[key] || { bg: '#F0EEEB', color: '#888888', label: status };

  return (
    <span
      className={`status-badge ${className}`}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}
