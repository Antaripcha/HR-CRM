import { capitalise, getStatusBadge, getRoleBadge } from '@/lib/utils';

export function StatusBadge({ status }) {
  return <span className={getStatusBadge(status)}>{capitalise(status)}</span>;
}

export function RoleBadge({ role }) {
  return <span className={getRoleBadge(role)}>{capitalise(role)}</span>;
}

export function LeaveBadge({ type }) {
  const colors = {
    annual: 'badge-blue', sick: 'badge-red', casual: 'badge-green',
    maternity: 'badge-yellow', paternity: 'badge-yellow', unpaid: 'badge-gray', other: 'badge-gray',
  };
  return <span className={`badge ${colors[type] || 'badge-gray'}`}>{capitalise(type)}</span>;
}
