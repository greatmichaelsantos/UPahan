import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, DollarSign, Wrench, CheckCircle, XCircle, Home, X, BadgeCheck, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const TYPE_CONFIG = {
  payment_approved:        { icon: CheckCircle, color: '#2E7D72', route: '/tenant/payments' },
  payment_rejected:        { icon: XCircle,     color: '#D64045', route: '/tenant/payments' },
  new_payment_declaration: { icon: DollarSign,  color: '#C9A84C', route: '/admin/payments' },
  maintenance_update:      { icon: Wrench,      color: '#2E7D72', route: '/tenant/maintenance' },
  new_maintenance:         { icon: Wrench,      color: '#C9A84C', route: '/admin/maintenance' },
  document_verified:       { icon: BadgeCheck,  color: '#2E7D72', route: '/tenant/documents' },
  document_rejected:       { icon: XCircle,     color: '#D64045', route: '/tenant/documents' },
  new_document:            { icon: FileText,    color: '#C9A84C', route: '/admin/units' },
  unit_assigned:           { icon: Home,        color: '#2E7D72', route: '/tenant' },
  unit_unassigned:         { icon: Home,        color: '#D64045', route: '/tenant' },
};

// Bottom nav height + a small gap so the panel never covers it
const BOTTOM_NAV_HEIGHT = 64;

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell({ color = '#4A4A4A' }) {
  const navigate = useNavigate();
  const [open, setOpen]             = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [panelTop, setPanelTop]           = useState(0);
  const wrapperRef = useRef(null);
  const buttonRef  = useRef(null);

  const fetchCount = useCallback(() => {
    api.get('/notifications/unread-count')
      .then(r => setUnreadCount(r.data.data?.count || 0))
      .catch(() => {});
  }, []);

  const fetchNotifications = useCallback(() => {
    api.get('/notifications')
      .then(r => {
        setNotifications(r.data.data || []);
        setUnreadCount((r.data.data || []).filter(n => !n.is_read).length);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
      // Calculate fixed top position from the button's bottom edge
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPanelTop(rect.bottom + 8);
      }
    }
  }, [open, fetchNotifications]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleClick = async (notif) => {
    if (!notif.is_read) {
      await api.put(`/notifications/${notif.notification_id}/read`).catch(() => {});
      setNotifications(prev => prev.map(n =>
        n.notification_id === notif.notification_id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    const cfg = TYPE_CONFIG[notif.type];
    if (cfg?.route) { setOpen(false); navigate(cfg.route); }
  };

  const markAll = async () => {
    await api.put('/notifications/read-all').catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const deleteNotif = async (e, id) => {
    e.stopPropagation();
    await api.delete(`/notifications/${id}`).catch(() => {});
    setNotifications(prev => prev.filter(n => n.notification_id !== id));
  };

  // Max height: from panel top down to just above the bottom nav
  const maxPanelHeight = `calc(${window.innerHeight}px - ${panelTop}px - ${BOTTOM_NAV_HEIGHT}px - 8px)`;
  // Clamp to 70vh as an upper bound
  const clampedMaxHeight = `min(70vh, ${maxPanelHeight})`;

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Notifications"
      >
        <Bell size={22} color={color} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            background: '#D64045', color: 'white',
            fontSize: 10, fontWeight: 700, fontFamily: 'Inter',
            width: 18, height: 18, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed',
          top: panelTop,
          right: 0,
          width: 'min(320px, 100vw)',
          maxHeight: clampedMaxHeight,
          overflowY: 'auto',
          background: 'white',
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          border: '1px solid #F0EEEB',
          zIndex: 1000,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px 10px', borderBottom: '1px solid #F0EEEB',
            position: 'sticky', top: 0, background: 'white', zIndex: 1,
          }}>
            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: '#4A4A4A' }}>Notifications</p>
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={markAll}
                style={{ fontFamily: 'Inter', fontSize: 12, color: '#3A7BD5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <Bell size={32} color="#CCC" style={{ marginBottom: 8 }} />
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#AAA' }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map(notif => {
              const cfg = TYPE_CONFIG[notif.type] || {};
              const Icon = cfg.icon || Bell;
              return (
                <div
                  key={notif.notification_id}
                  onClick={() => handleClick(notif)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px',
                    borderLeft: notif.is_read ? 'none' : `3px solid ${cfg.color || '#3A7BD5'}`,
                    background: notif.is_read ? 'white' : '#FAFCFF',
                    borderBottom: '1px solid #F8F8F8',
                    cursor: 'pointer',
                    transition: 'background 150ms',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#F5F7FA'}
                  onMouseOut={e => e.currentTarget.style.background = notif.is_read ? 'white' : '#FAFCFF'}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <Icon size={16} color={cfg.color || '#888'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#4A4A4A', lineHeight: 1.5, marginBottom: 2, wordBreak: 'break-word' }}>
                      {notif.message}
                    </p>
                    <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#AAA' }}>{timeAgo(notif.created_at)}</p>
                  </div>
                  <button
                    onClick={e => deleteNotif(e, notif.notification_id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0, opacity: 0.4 }}
                    aria-label="Dismiss"
                  >
                    <X size={12} color="#888" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
