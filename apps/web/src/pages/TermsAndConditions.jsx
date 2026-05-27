import React, { useState, useRef, useEffect } from 'react';

const TENANT_TERMS = [
  { title: 'Account Responsibility', body: 'You are responsible for maintaining the confidentiality of your account credentials. Do not share your login information with others.' },
  { title: 'Accurate Information', body: 'You agree to provide accurate and truthful personal information during registration including your full name, valid ID, and contact details.' },
  { title: 'Rent Payment Obligations', body: 'You acknowledge that submitting a payment declaration through UPahan does not substitute for actual payment. Payment must still be made directly to your landlord.' },
  { title: 'Proof of Payment', body: 'You are required to upload a valid proof of payment when declaring rent. Submitting false or altered documents is strictly prohibited.' },
  { title: 'Maintenance Requests', body: 'Maintenance requests must be submitted in good faith. False or exaggerated reports may result in account suspension.' },
  { title: 'Unit Information', body: 'You agree not to misuse or share confidential unit information accessible through the platform.' },
  { title: 'Notification Consent', body: 'By using UPahan, you consent to receiving in-app notifications regarding your payments, maintenance requests, and unit status.' },
  { title: 'Termination', body: 'RGT Real Estate reserves the right to deactivate your account for violation of these terms.' },
  { title: 'Privacy', body: 'Your personal data will be handled in accordance with the Data Privacy Act of 2012 (Republic Act 10173).' },
  { title: 'Acceptance', body: 'By tapping "I Agree", you confirm that you have read, understood, and agreed to these Terms and Conditions.' },
];

const LANDLORD_TERMS = [
  { title: 'Account Responsibility', body: 'You are responsible for all actions performed under your landlord account. Keep your credentials secure and do not share them.' },
  { title: 'Accurate Property Information', body: 'You agree to provide accurate and up-to-date information for all units listed on UPahan, including rental price, location, and availability status.' },
  { title: 'Tenant Data Privacy', body: 'You acknowledge that tenant personal information accessible through UPahan (including valid IDs, contact numbers, and lease details) must be handled with confidentiality and used only for legitimate rental management purposes, in accordance with the Data Privacy Act of 2012 (Republic Act 10173).' },
  { title: 'Payment Verification', body: 'You are responsible for verifying tenant payment declarations accurately. Approving or rejecting payments must reflect the actual payment status.' },
  { title: 'Maintenance Management', body: 'You agree to respond to tenant maintenance requests in a timely and professional manner through the platform.' },
  { title: 'Unit Management', body: 'You are responsible for keeping unit statuses (vacant, occupied, under maintenance) accurate and updated at all times.' },
  { title: 'Fair Treatment', body: 'You agree to use the platform in a fair and non-discriminatory manner toward all tenants.' },
  { title: 'Notification Consent', body: 'By using UPahan, you consent to receiving in-app notifications regarding payment declarations, maintenance requests, and unit activity.' },
  { title: 'Termination', body: 'Misuse of the platform, including unauthorized access or manipulation of tenant data, may result in account deactivation.' },
  { title: 'Acceptance', body: 'By tapping "I Agree", you confirm that you have read, understood, and agreed to these Terms and Conditions.' },
];

export default function TermsAndConditions({ role, onAgree, onCancel }) {
  const isAdmin = role === 'admin';
  const accent  = isAdmin ? '#277571' : '#4A90D9';
  const terms   = isAdmin ? LANDLORD_TERMS : TENANT_TERMS;
  const title   = isAdmin ? 'Landlord Terms and Conditions' : 'Tenant Terms and Conditions';

  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && el.scrollHeight <= el.clientHeight) {
      setScrolledToBottom(true);
    }
  }, []);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 24) {
      setScrolledToBottom(true);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 16,
        width: '100%', maxWidth: 520,
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #F0EEEB',
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: accent, flexShrink: 0 }} />
          <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 17, color: '#1A1A1A', margin: 0 }}>
            {title}
          </h2>
        </div>

        {/* Scrollable body */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 4px' }}
        >
          <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#666666', lineHeight: 1.6, marginBottom: 18 }}>
            Please read these Terms and Conditions carefully before creating your account.
          </p>

          {terms.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <span style={{
                fontFamily: 'Inter', fontWeight: 700, fontSize: 14,
                color: accent, minWidth: 22, flexShrink: 0, paddingTop: 1,
              }}>
                {index + 1}.
              </span>
              <div>
                <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>
                  {item.title}
                </span>
                <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#555555', lineHeight: 1.6 }}>
                  {' '}— {item.body}
                </span>
              </div>
            </div>
          ))}

          <div style={{ height: 16 }} />
        </div>

        {/* Scroll hint */}
        {!scrolledToBottom && (
          <div style={{
            textAlign: 'center', padding: '8px 24px',
            fontFamily: 'Inter', fontSize: 12, color: '#999999',
            background: '#FAF8F5', borderTop: '1px solid #F0EEEB', flexShrink: 0,
          }}>
            ↓ Scroll down to read all terms before accepting
          </div>
        )}

        {/* Buttons */}
        <div style={{
          display: 'flex', gap: 12, padding: '16px 24px',
          borderTop: '1px solid #F0EEEB', flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1, height: 48, borderRadius: 999,
              background: 'transparent', border: '1.5px solid #888888',
              fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#555555',
              cursor: 'pointer', transition: 'all 150ms ease',
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onAgree}
            disabled={!scrolledToBottom}
            style={{
              flex: 2, height: 48, borderRadius: 999,
              background: scrolledToBottom ? accent : '#CCCCCC',
              border: 'none',
              fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: 'white',
              cursor: scrolledToBottom ? 'pointer' : 'not-allowed',
              transition: 'all 150ms ease', letterSpacing: '0.03em',
            }}
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}
