export const formatPeso = (amount) => {
  if (amount === null || amount === undefined) return '₱ 0.00';
  return `₱ ${parseFloat(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const formatDate = (dateString, style = 'long') => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date)) return '—';

  if (style === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
  }
  if (style === 'medium') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatMonthYear = (monthString) => {
  if (!monthString) return '—';
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const timeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

export const getCurrentMonth = () => {
  return new Date().toISOString().substring(0, 7);
};

export const categoryLabel = (cat) => {
  const map = {
    plumbing: 'Plumbing (Tulo ng Tubig)',
    electrical: 'Electrical (Kuryente)',
    structural: 'Structural (Sira sa Bahay)',
    others: 'Others'
  };
  return map[cat] || cat;
};
