import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import SectionHeader from '../../components/SectionHeader';
import EmptyState from '../../components/EmptyState';
import api from '../../utils/api';
import { formatPeso, formatDate } from '../../utils/format';

const TEAL = '#277571';
const GOLD = '#C9A84C';

const labelStyle = {
  fontFamily: 'Inter', fontWeight: 700, fontSize: 10,
  color: GOLD, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
};

const statCard = (label, value, accent) => (
  <div className="stat-card" style={{
    flex: 1, background: accent ? TEAL : '#F0EEEB', borderRadius: 10,
    padding: '14px 16px', textAlign: 'center',
  }}>
    <p className="stat-label" style={{ ...labelStyle, color: accent ? 'rgba(255,255,255,0.7)' : GOLD }}>{label}</p>
    <p className="stat-value" style={{
      fontFamily: 'Inter', fontWeight: 800, fontSize: 22,
      color: accent ? '#fff' : '#4A4A4A',
    }}>{value}</p>
  </div>
);

const STATUS_PRINT_CLASS = {
  verified: 'status-verified', paid: 'status-verified', completed: 'status-verified',
  not_verified: 'status-not-verified', rejected: 'status-not-verified',
  pending: 'status-pending', pending_approval: 'status-pending',
  partial: 'status-partial', in_progress: 'status-partial',
};

function StatusPill({ status, isLate }) {
  const map = {
    verified:         { bg: '#E8F5F3', color: '#2E7D72', label: 'VERIFIED' },
    paid:             { bg: '#E8F5F3', color: '#2E7D72', label: 'VERIFIED' },
    partial:          { bg: '#EEF1FA', color: '#3A5BA0', label: 'PARTIAL' },
    pending_approval: { bg: '#FEF3EC', color: '#E07B39', label: 'PENDING' },
    not_verified:     { bg: '#FDEEEE', color: '#D64045', label: 'NOT VERIFIED' },
    rejected:         { bg: '#FDEEEE', color: '#D64045', label: 'NOT VERIFIED' },
    pending:          { bg: '#FEF3EC', color: '#E07B39', label: 'PENDING' },
    in_progress:      { bg: '#EEF1FA', color: '#3A5BA0', label: 'IN PROGRESS' },
    completed:        { bg: '#E8F5F3', color: '#2E7D72', label: 'COMPLETED' },
  };
  const cfg = map[status] || { bg: '#F0EEEB', color: '#888', label: status?.toUpperCase() || '—' };
  const printClass = STATUS_PRINT_CLASS[status] || '';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span className={printClass} style={{
        background: cfg.bg, color: cfg.color,
        fontFamily: 'Inter', fontWeight: 700, fontSize: 10,
        borderRadius: 4, padding: '2px 7px', letterSpacing: '0.06em',
      }}>{cfg.label}</span>
      {isLate && (
        <span className="status-late" style={{
          background: '#FEF3EC', color: '#E07B39',
          fontFamily: 'Inter', fontWeight: 700, fontSize: 10,
          borderRadius: 4, padding: '2px 7px', letterSpacing: '0.06em',
        }}>LATE</span>
      )}
    </span>
  );
}

function TableHead({ cols }) {
  return (
    <thead>
      <tr>
        {cols.map(c => (
          <th key={c} style={{
            padding: '8px 12px', textAlign: 'left',
            fontFamily: 'Inter', fontWeight: 700, fontSize: 10,
            color: GOLD, textTransform: 'uppercase', letterSpacing: '0.08em',
            background: '#FAF8F5', borderBottom: '1px solid #E0DDD8',
          }}>{c}</th>
        ))}
      </tr>
    </thead>
  );
}

const printStyles = `
  @page {
    margin: 20mm 15mm;
    size: A4;
  }

  @media print {
    /* Hide everything except report content */
    nav, aside, .sidebar, header, button, .no-print,
    [class*="sidebar"], [class*="nav"], [class*="header"] {
      display: none !important;
    }

    body {
      background: white !important;
      font-family: 'Inter', sans-serif;
      color: #1A1A1A;
      margin: 0;
      padding: 0;
    }

    .report-content {
      padding: 40px !important;
      max-width: 100% !important;
    }

    /* Report header */
    .report-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      border-bottom: 3px solid #277571 !important;
      padding-bottom: 20px !important;
      margin-bottom: 32px !important;
    }

    .report-logo {
      font-size: 28px !important;
      font-weight: 900 !important;
      color: #277571 !important;
      letter-spacing: -1px !important;
    }

    .report-meta {
      text-align: right !important;
      font-size: 13px !important;
      color: #666 !important;
    }

    /* Section titles */
    .report-section-title {
      font-size: 11px !important;
      font-weight: 600 !important;
      letter-spacing: 1.5px !important;
      color: #C9A84C !important;
      text-transform: uppercase !important;
      margin: 28px 0 12px !important;
      padding-bottom: 6px !important;
      border-bottom: 1px solid #E5E5E5 !important;
    }

    /* Stats grid */
    .stats-grid {
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 16px !important;
      margin-bottom: 20px !important;
    }

    .stat-card {
      background: #F8F8F8 !important;
      border: 1px solid #E5E5E5 !important;
      border-radius: 8px !important;
      padding: 16px !important;
      text-align: center !important;
    }

    .stat-label {
      font-size: 10px !important;
      color: #999 !important;
      text-transform: uppercase !important;
      letter-spacing: 1px !important;
      margin-bottom: 6px !important;
    }

    .stat-value {
      font-size: 24px !important;
      font-weight: 700 !important;
      color: #277571 !important;
    }

    /* Tables */
    table {
      width: 100% !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
      font-size: 12px !important;
      margin-top: 12px !important;
    }

    /* Payments table column widths */
    .payments-table th:nth-child(1) { width: 8% !important; }
    .payments-table th:nth-child(2) { width: 20% !important; }
    .payments-table th:nth-child(3) { width: 15% !important; }
    .payments-table th:nth-child(4) { width: 20% !important; }
    .payments-table th:nth-child(5) { width: 15% !important; }

    /* Maintenance table column widths */
    .maintenance-table th:nth-child(1) { width: 8% !important; }
    .maintenance-table th:nth-child(2) { width: 18% !important; }
    .maintenance-table th:nth-child(3) { width: 18% !important; }
    .maintenance-table th:nth-child(4) { width: 15% !important; }
    .maintenance-table th:nth-child(5) { width: 15% !important; }

    td {
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      white-space: normal !important;
    }

    thead tr {
      background: #277571 !important;
      color: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    thead th {
      padding: 10px 12px !important;
      text-align: left !important;
      font-weight: 600 !important;
      font-size: 11px !important;
      letter-spacing: 0.5px !important;
      color: white !important;
      background: transparent !important;
      border: none !important;
    }

    tbody tr:nth-child(even) {
      background: #F5F5F5 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    tbody td {
      padding: 9px 12px !important;
      border-bottom: 1px solid #EEEEEE !important;
      vertical-align: middle !important;
    }

    /* Status badges in print */
    .status-verified { color: #2E7D32 !important; font-weight: 600 !important; background: transparent !important; }
    .status-not-verified { color: #C62828 !important; font-weight: 600 !important; background: transparent !important; }
    .status-late { color: #E07B39 !important; font-weight: 600 !important; background: transparent !important; }
    .status-pending { color: #F57F17 !important; font-weight: 600 !important; background: transparent !important; }
    .status-partial { color: #1565C0 !important; font-weight: 600 !important; background: transparent !important; }

    /* Footer */
    .report-footer {
      margin-top: 40px !important;
      padding-top: 16px !important;
      border-top: 1px solid #E5E5E5 !important;
      font-size: 11px !important;
      color: #999 !important;
      display: flex !important;
      justify-content: space-between !important;
    }

    /* Page breaks */
    .page-break { page-break-before: always !important; }
    table { page-break-inside: auto !important; }
    tr { page-break-inside: avoid !important; }

    /* Hide period bar and card borders in print */
    .card { border: none !important; box-shadow: none !important; background: transparent !important; padding: 0 !important; }
  }
`;

export default function AdminReports() {
  const today = new Date().toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split('T')[0];

  const [period, setPeriod]       = useState('monthly');
  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate]     = useState(today);
  const [report, setReport]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleDownload = () => {
    const originalTitle = document.title;
    document.title = `UPahan-Report-${new Date().toISOString().split('T')[0]}`;
    window.print();
    document.title = originalTitle;
  };

  const handleExportCSV = () => {
    if (!report) return;
    const rows = [
      ['Unit', 'Tenant', 'Amount', 'Month Covered', 'Status', 'Late'],
      ...report.payments.breakdown.map(p => [
        p.unit_code, p.tenant, p.amount, p.month_covered, p.status, p.is_late ? 'Yes' : 'No',
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upahan-report-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchReport = async (p) => {
    setError('');
    setLoading(true);
    try {
      const params = p === 'custom'
        ? `period=custom&start_date=${startDate}&end_date=${endDate}`
        : `period=${p}`;
      const res = await api.get(`/reports/landlord?${params}`);
      setReport(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => fetchReport(period);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchReport('monthly');
    const interval = setInterval(() => fetchReport(period), 30000);
    return () => clearInterval(interval);
  }, []);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const generatedLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <AdminLayout title="Reports">
      <style>{printStyles}</style>
      <div className="no-print">
        <SectionHeader label="Reports" title="Reports" />
      </div>

      <div className="report-content" style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Print-only branded header */}
        <div className="report-header" style={{ display: 'none' }}>
          <div>
            <div className="report-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: '#277571',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
                  <path d="M9 22V12h6v10" fill="#1D5754"/>
                </svg>
              </div>
              <span>UPAHAN</span>
            </div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>RGT Real Estate Marketing</div>
          </div>
          <div className="report-meta">
            <div style={{ fontWeight: 600, fontSize: 14 }}>Landlord Report</div>
            <div>Generated: {generatedLabel}</div>
            <div>Period: {report?.period?.start} — {report?.period?.end}</div>
          </div>
        </div>

        {/* Period selector */}
        <div className="card no-print" style={{ padding: 16 }}>
          <p style={labelStyle}>Select Period</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: period === 'custom' ? 12 : 0 }}>
            {[
              { key: 'weekly',  label: 'This Week' },
              { key: 'monthly', label: 'This Month' },
              { key: 'custom',  label: 'Custom Range' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                style={{
                  padding: '9px 18px', borderRadius: 999, border: '1.5px solid',
                  borderColor: period === key ? TEAL : '#E0DDD8',
                  background: period === key ? TEAL : 'white',
                  color: period === key ? 'white' : '#4A4A4A',
                  fontFamily: 'Inter', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >{label}</button>
            ))}
          </div>
          {period === 'custom' && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <div>
                <p style={{ ...labelStyle, marginBottom: 4 }}>Start Date</p>
                <input type="date" value={startDate} max={endDate}
                  onChange={e => setStartDate(e.target.value)}
                  style={{
                    height: 40, borderRadius: 8, border: '1.5px solid #E0DDD8',
                    fontFamily: 'Inter', fontSize: 13, padding: '0 10px', outline: 'none',
                  }}
                />
              </div>
              <div>
                <p style={{ ...labelStyle, marginBottom: 4 }}>End Date</p>
                <input type="date" value={endDate} min={startDate} max={today}
                  onChange={e => setEndDate(e.target.value)}
                  style={{
                    height: 40, borderRadius: 8, border: '1.5px solid #E0DDD8',
                    fontFamily: 'Inter', fontSize: 13, padding: '0 10px', outline: 'none',
                  }}
                />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 12 }}>
            <button
              onClick={handleGenerate} disabled={loading}
              style={{
                height: 44, borderRadius: 8, background: loading ? '#888' : TEAL,
                color: 'white', border: 'none', fontFamily: 'Inter', fontWeight: 700, fontSize: 14,
                padding: '0 28px', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, transition: 'all 150ms',
              }}
            >{loading ? 'Generating…' : 'Generate Report'}</button>
            {report && (
              <>
                <button
                  onClick={handleDownload}
                  style={{
                    height: 44, borderRadius: 8, background: '#4A4A4A',
                    color: 'white', border: 'none', fontFamily: 'Inter', fontWeight: 700, fontSize: 13,
                    padding: '0 20px', cursor: 'pointer', transition: 'all 150ms',
                  }}
                >⬇ Download PDF</button>
                <button
                  onClick={handleExportCSV}
                  style={{
                    height: 44, borderRadius: 8, background: 'white',
                    color: TEAL, border: `1.5px solid ${TEAL}`, fontFamily: 'Inter', fontWeight: 700, fontSize: 13,
                    padding: '0 20px', cursor: 'pointer', transition: 'all 150ms',
                  }}
                >⬇ Export CSV</button>
              </>
            )}
          </div>
          {error && (
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#D64045', marginTop: 8 }}>{error}</p>
          )}
        </div>

        {!report && !loading && (
          <EmptyState icon={BarChart2} title="No Report Yet" message="Select a period and click Generate Report." />
        )}

        {report && (
          <>
            {/* Period header */}
            <div className="no-print" style={{ background: TEAL, borderRadius: 10, padding: '12px 16px' }}>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                Report Period
              </p>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: '#fff' }}>
                {fmtDate(report.period.start)} — {fmtDate(report.period.end)}
              </p>
            </div>

            {/* Unit Status */}
            <div className="card" style={{ padding: 16 }}>
              <p className="report-section-title" style={{ ...labelStyle, marginBottom: 12 }}>Unit Occupancy</p>
              <div className="stats-grid" style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                {statCard('Occupied', report.units.occupied, true)}
                {statCard('Vacant', report.units.vacant, false)}
              </div>
              <div className="stats-grid" style={{ display: 'flex', gap: 10 }}>
                {statCard('Total Units', report.units.total, false)}
                {statCard('Occupancy Rate', report.units.occupancy_rate, false)}
              </div>
            </div>

            {/* Payments */}
            <div className="card" style={{ padding: 16 }}>
              <p className="report-section-title" style={{ ...labelStyle, marginBottom: 8 }}>Payments</p>
              <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 28, color: TEAL, marginBottom: 12 }}>
                {formatPeso(report.payments.total_collected)}
              </p>
              <div className="stats-grid" style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {statCard('Transactions', report.payments.total_transactions, false)}
                {statCard('Late', report.payments.late_payments, false)}
                {statCard('Not Verified', report.payments.not_verified, false)}
              </div>
              {report.payments.breakdown.length === 0 ? (
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888' }}>No payment data for the selected period.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="payments-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <TableHead cols={['Unit', 'Tenant', 'Amount', 'Month Covered', 'Status']} />
                    <tbody>
                      {report.payments.breakdown.map((p, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #F0EEEB' }}>
                          <td style={{ padding: '9px 12px', fontFamily: 'Inter', fontWeight: 600, color: '#4A4A4A' }}>{p.unit_code}</td>
                          <td style={{ padding: '9px 12px', fontFamily: 'Inter', color: '#4A4A4A' }}>{p.tenant}</td>
                          <td style={{ padding: '9px 12px', fontFamily: 'Inter', fontWeight: 700, color: TEAL }}>{formatPeso(p.amount)}</td>
                          <td style={{ padding: '9px 12px', fontFamily: 'Inter', color: '#4A4A4A' }}>{p.month_covered}</td>
                          <td style={{ padding: '9px 12px' }}><StatusPill status={p.status} isLate={p.is_late} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Maintenance */}
            <div className="card" style={{ padding: 16 }}>
              <p className="report-section-title" style={{ ...labelStyle, marginBottom: 12 }}>Maintenance</p>
              <div className="stats-grid" style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {statCard('Total', report.maintenance.total_requests, false)}
                {statCard('Resolved', report.maintenance.resolved, true)}
                {statCard('Pending', report.maintenance.pending, false)}
              </div>
              {report.maintenance.breakdown.length === 0 ? (
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888' }}>No maintenance data for the selected period.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="maintenance-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <TableHead cols={['Unit', 'Tenant', 'Category', 'Status', 'Date']} />
                    <tbody>
                      {report.maintenance.breakdown.map((m, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #F0EEEB' }}>
                          <td style={{ padding: '9px 12px', fontFamily: 'Inter', fontWeight: 600, color: '#4A4A4A' }}>{m.unit_code}</td>
                          <td style={{ padding: '9px 12px', fontFamily: 'Inter', color: '#4A4A4A' }}>{m.tenant}</td>
                          <td style={{ padding: '9px 12px', fontFamily: 'Inter', color: '#4A4A4A', textTransform: 'capitalize' }}>{m.category}</td>
                          <td style={{ padding: '9px 12px' }}><StatusPill status={m.status} /></td>
                          <td style={{ padding: '9px 12px', fontFamily: 'Inter', color: '#888', fontSize: 12 }}>{fmtDate(m.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Print-only footer */}
        <div className="report-footer" style={{ display: 'none' }}>
          <div>UPahan — Rental Property Management System</div>
          <div>Confidential — For internal use only</div>
          <div>Page <span className="page-number"></span></div>
        </div>
      </div>
    </AdminLayout>
  );
}
