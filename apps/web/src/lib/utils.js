import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  try { return format(parseISO(date), 'MMM dd, yyyy'); } catch { return '—'; }
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  try { return format(parseISO(date), 'MMM dd, yyyy HH:mm'); } catch { return '—'; }
};

export const timeAgo = (date) => {
  if (!date) return '—';
  try { return formatDistanceToNow(parseISO(date), { addSuffix: true }); } catch { return '—'; }
};

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const getAvatarColor = (name = '') => {
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

export const getRoleBadge = (role) => {
  const map = {
    admin: 'badge-blue',
    hr: 'badge-yellow',
    employee: 'badge-green',
  };
  return map[role] || 'badge-gray';
};

export const getStatusBadge = (status) => {
  const map = {
    active: 'badge-green',
    inactive: 'badge-gray',
    on_leave: 'badge-yellow',
    terminated: 'badge-red',
    pending: 'badge-yellow',
    approved: 'badge-green',
    rejected: 'badge-red',
    cancelled: 'badge-gray',
  };
  return map[status] || 'badge-gray';
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

export const capitalise = (str = '') => str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
};
