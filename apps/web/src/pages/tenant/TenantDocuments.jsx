import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, FileText, Upload, ExternalLink } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import StatusBadge from '../../components/StatusBadge';
import SubmitIdModal from '../../components/SubmitIdModal';
import api from '../../utils/api';
import { formatDate } from '../../utils/format';

const BASE_URL = (import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');

export default function TenantDocuments() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showIdModal, setShowIdModal] = useState(false);

  const fetchDocuments = useCallback(() => {
    setLoading(true);
    api.get('/documents/my-documents')
      .then(r => setDocuments(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const idDoc   = documents.find(d => d.document_type === 'valid_id');
  const contract = documents.find(d => d.document_type === 'contract');

  const canSubmitId = !idDoc || idDoc.status === 'rejected';

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', paddingBottom: 90 }}>

      {/* Header */}
      <div style={{ background: 'white', padding: '16px 20px 14px', borderBottom: '1px solid #F0EEEB', boxShadow: '0 1px 8px rgba(46,125,114,0.05)' }}>
        <button
          onClick={() => navigate('/tenant')}
          style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 13, color: '#3A7BD5', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}
        >
          ← Back
        </button>
        <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 26, color: '#4A4A4A' }}>
          My Documents
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888', marginTop: 4 }}>
          Manage your identification and lease documents
        </p>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Valid ID card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CreditCard size={20} color="#3A7BD5" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#4A4A4A' }}>Valid ID</p>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888', marginTop: 2 }}>
                Government-issued photo ID (front and back)
              </p>
            </div>
            {!loading && idDoc && (
              <StatusBadge status={idDoc.status === 'under_review' ? 'under_review' : idDoc.status} />
            )}
          </div>

          {loading ? (
            <div style={{ height: 48, background: '#F5F5F5', borderRadius: 10 }} />
          ) : idDoc ? (
            <>
              <div style={{ background: '#F8F8F8', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888', marginBottom: 2 }}>ID Type</p>
                <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#4A4A4A' }}>{idDoc.id_type}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#AAA', marginTop: 4 }}>
                  Submitted {formatDate(idDoc.created_at, 'medium')}
                </p>
              </div>

              {idDoc.status === 'under_review' && (
                <div style={{ background: '#FFF8EC', border: '1px solid #E07B39', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#E07B39', fontWeight: 600 }}>
                    Under Review
                  </p>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#E07B39', marginTop: 2 }}>
                    The landlord will verify your ID shortly.
                  </p>
                </div>
              )}

              {idDoc.status === 'verified' && (
                <div style={{ background: '#E8F5F3', border: '1px solid #2E7D72', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#2E7D72', fontWeight: 600 }}>
                    ✓ Verified by landlord
                  </p>
                </div>
              )}

              {idDoc.status === 'rejected' && (
                <div style={{ background: '#FEF2F2', border: '1px solid #D64045', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#D64045', fontWeight: 600, marginBottom: 2 }}>
                    ID Rejected
                  </p>
                  {idDoc.rejection_reason && (
                    <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#D64045' }}>
                      Reason: {idDoc.rejection_reason}
                    </p>
                  )}
                </div>
              )}

              {canSubmitId && (
                <button
                  onClick={() => setShowIdModal(true)}
                  style={{
                    width: '100%', padding: '12px', background: '#3A7BD5', color: 'white',
                    border: 'none', borderRadius: 10, fontFamily: 'Inter', fontWeight: 700,
                    fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                  }}
                >
                  <Upload size={16} /> Resubmit ID
                </button>
              )}
            </>
          ) : (
            <>
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#999', marginBottom: 14, lineHeight: 1.5 }}>
                You haven't submitted a valid ID yet. Please upload your government-issued ID so the landlord can verify your identity.
              </p>
              <button
                onClick={() => setShowIdModal(true)}
                style={{
                  width: '100%', padding: '13px', background: '#3A7BD5', color: 'white',
                  border: 'none', borderRadius: 10, fontFamily: 'Inter', fontWeight: 700,
                  fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8,
                }}
              >
                <Upload size={16} /> Submit Valid ID
              </button>
            </>
          )}
        </div>

        {/* Lease Contract card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F0F9F7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={20} color="#2E7D72" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#4A4A4A' }}>Lease Contract</p>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888', marginTop: 2 }}>
                Uploaded by your landlord
              </p>
            </div>
            {!loading && contract && <StatusBadge status="verified" />}
          </div>

          {loading ? (
            <div style={{ height: 48, background: '#F5F5F5', borderRadius: 10 }} />
          ) : contract ? (
            <>
              <div style={{ background: '#F8F8F8', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                {(contract.contract_start_date || contract.contract_end_date) && (
                  <div style={{ marginBottom: 6 }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888', marginBottom: 2 }}>Contract Period</p>
                    <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#4A4A4A' }}>
                      {contract.contract_start_date ? formatDate(contract.contract_start_date, 'medium') : '—'}
                      {' – '}
                      {contract.contract_end_date ? formatDate(contract.contract_end_date, 'medium') : 'Ongoing'}
                    </p>
                  </div>
                )}
                {contract.notes && (
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#666', fontStyle: 'italic' }}>
                    {contract.notes}
                  </p>
                )}
                <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#AAA', marginTop: 6 }}>
                  Uploaded {formatDate(contract.created_at, 'medium')}
                </p>
              </div>
              <a
                href={`${BASE_URL}/uploads/documents/${contract.contract_file}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '12px', background: '#F0F9F7', color: '#2E7D72',
                  border: '1.5px solid #2E7D72', borderRadius: 10, fontFamily: 'Inter',
                  fontWeight: 700, fontSize: 14, textDecoration: 'none', boxSizing: 'border-box',
                }}
              >
                <ExternalLink size={16} /> View / Download Contract
              </a>
            </>
          ) : (
            <div style={{ background: '#F8F8F8', borderRadius: 10, padding: '14px' }}>
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#999', lineHeight: 1.5 }}>
                Your landlord hasn't uploaded a lease contract yet. It will appear here once they do.
              </p>
            </div>
          )}
        </div>

      </div>

      <BottomNav role="tenant" />

      {showIdModal && (
        <SubmitIdModal
          onClose={() => setShowIdModal(false)}
          onSuccess={() => { setShowIdModal(false); fetchDocuments(); }}
        />
      )}
    </div>
  );
}
