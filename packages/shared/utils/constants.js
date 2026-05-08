// ─── Brand Colors ────────────────────────────────────────────────────────────

export const COLORS = {
  // Role colors
  green:        '#2A9D5C',
  greenDark:    '#1E7A45',
  greenLight:   '#E8F5EE',
  navy:         '#1A2332',
  navyMid:      '#2D3748',
  purple:       '#7C6FCD',
  purpleLight:  '#F0EEF9',

  // Neutral
  bg:           '#F5F5F5',
  white:        '#FFFFFF',
  textPrimary:  '#1A1A1A',
  textSecondary:'#888888',
  inputFill:    '#F0F0F0',
  border:       '#E5E5E5',

  // Alerts
  red:          '#E53E3E',
  redLight:     '#FED7D7',
  orange:       '#DD6B20',
  orangeLight:  '#FEEBC8',

  // Legacy aliases (keep for any remaining references)
  teal:         '#2A9D5C',
  tealDark:     '#1E7A45',
  tealLight:    '#E8F5EE',
  gold:         '#7C6FCD',
  goldLight:    '#F0EEF9',
  charcoal:     '#1A1A1A',
  cream:        '#F5F5F5',
  grayMid:      '#888888',
  grayLight:    '#E5E5E5',
  blueAccent:   '#2A9D5C',
  blueLight:    '#E8F5EE',
  redAlert:     '#E53E3E',
  redLight2:    '#FED7D7',
  orangeMid:    '#DD6B20',
  orangeLight2: '#FEEBC8',
};

// ─── Local Storage / AsyncStorage Keys ───────────────────────────────────────

export const STORAGE_KEYS = {
  TOKEN:  'upahan_token',
  USER:   'upahan_user',
  TENANT: 'upahan_tenant',
};

// ─── Status Badge Configs ─────────────────────────────────────────────────────

export const STATUS_CONFIGS = {
  paid:              { bg: '#E8F5EE', color: '#2A9D5C', label: 'PAID' },
  unpaid:            { bg: '#FED7D7', color: '#E53E3E', label: 'UNPAID' },
  partial:           { bg: '#EEF1FA', color: '#3A5BA0', label: 'PARTIAL' },
  late:              { bg: '#FEEBC8', color: '#DD6B20', label: 'LATE' },
  advance:           { bg: '#E8F5EE', color: '#2A9D5C', label: 'ADVANCE' },
  pending:           { bg: '#FEEBC8', color: '#DD6B20', label: 'PENDING' },
  pending_approval:  { bg: '#FEEBC8', color: '#DD6B20', label: 'PENDING' },
  completed:         { bg: '#E8F5EE', color: '#2A9D5C', label: 'COMPLETED' },
  in_progress:       { bg: '#E8EAF0', color: '#1A2332', label: 'IN PROGRESS' },
  vacant:            { bg: '#F0EEF9', color: '#7C6FCD', label: 'VACANT' },
  occupied:          { bg: '#E8F5EE', color: '#2A9D5C', label: 'OCCUPIED' },
  under_maintenance: { bg: '#F5F5F5', color: '#888888', label: 'MAINTENANCE' },
  high:              { bg: '#E53E3E', color: '#FFFFFF', label: 'HIGH' },
  medium:            { bg: '#DD6B20', color: '#FFFFFF', label: 'MEDIUM' },
  low:               { bg: '#888888', color: '#FFFFFF', label: 'LOW' },
  on_track:          { bg: '#E8F5EE', color: '#2A9D5C', label: 'ON TRACK' },
  rejected:          { bg: '#FED7D7', color: '#E53E3E', label: 'REJECTED' },
  verified:          { bg: '#E8F5EE', color: '#2A9D5C', label: 'VERIFIED' },
  under_review:      { bg: '#FEEBC8', color: '#DD6B20', label: 'UNDER REVIEW' },
};

// ─── Maintenance Categories ───────────────────────────────────────────────────

export const MAINTENANCE_CATEGORIES = [
  { value: 'plumbing',   label: 'Plumbing (Tulo ng Tubig)' },
  { value: 'electrical', label: 'Electrical (Kuryente)' },
  { value: 'structural', label: 'Structural (Sira sa Bahay)' },
  { value: 'others',     label: 'Others' },
];

// ─── API Routes ───────────────────────────────────────────────────────────────

export const API_ROUTES = {
  // Auth
  LOGIN:    '/auth/login',
  REGISTER: '/auth/register',
  AUTH_PROFILE: '/auth/profile',

  // Users
  USER_ME:          '/users/me',
  USER_ME_PASSWORD: '/users/me/password',
  USER_ME_PHOTO:    '/users/me/photo',
  UNASSIGNED_TENANTS: '/users/unassigned-tenants',

  // Units
  UNITS:              '/units',
  COLLECTION_SUMMARY: '/units/collection-summary',
  unitById:           (id) => `/units/${id}`,
  unitPhotos:         (id) => `/units/${id}/photos`,
  unitRemoveTenant:   (id) => `/units/${id}/remove-tenant`,

  // Tenants
  TENANTS:   '/tenants',
  TENANT_ME: '/tenants/me',

  // Payments
  PAYMENTS:              '/payments',
  PAYMENT_CURRENT_MONTH: '/payments/current-month',
  PAYMENT_DECLARE:       '/payments/declare',
  PAYMENT_MY_DECLARATIONS: '/payments/my-declarations',
  PAYMENT_PENDING:       '/payments/pending',
  PAYMENT_SUMMARY:       '/payments/summary',
  paymentsForUnit:       (unitId) => `/payments?unitId=${unitId}`,
  paymentApprove:        (id) => `/payments/${id}/approve`,
  paymentReject:         (id) => `/payments/${id}/reject`,

  // Maintenance
  MAINTENANCE:         '/maintenance',
  MAINTENANCE_PENDING: '/maintenance?status=pending',
  maintenanceById:     (id) => `/maintenance/${id}`,
  maintenancePhotos:   (id) => `/maintenance/${id}/photos`,

  // Documents
  MY_DOCUMENTS:     '/documents/my-documents',
  SUBMIT_ID:        '/documents/submit-id',
  UPLOAD_CONTRACT:  '/documents/upload-contract',
  documentsForUnit: (id) => `/documents/unit/${id}`,
  documentVerify:   (id) => `/documents/${id}/verify`,
  documentReject:   (id) => `/documents/${id}/reject`,

  // Notifications
  NOTIFICATIONS:              '/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread-count',
  NOTIFICATIONS_READ_ALL:     '/notifications/read-all',
  notificationRead:           (id) => `/notifications/${id}/read`,
};
