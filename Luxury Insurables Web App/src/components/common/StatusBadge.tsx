import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { PolicyStatus } from '../../App';

interface StatusBadgeProps {
  status: PolicyStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = {
    active: {
      icon: CheckCircle,
      label: 'Active',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
    pending: {
      icon: Clock,
      label: 'Pending',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      iconColor: 'text-cyan-600',
      borderColor: 'border-cyan-200',
    },
    'not-bound': {
      icon: XCircle,
      label: 'Not Bound',
      bgColor: 'bg-slate-100',
      textColor: 'text-slate-700',
      iconColor: 'text-slate-500',
      borderColor: 'border-slate-200',
    },
    'needs-review': {
      icon: AlertCircle,
      label: 'Needs Review',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      iconColor: 'text-cyan-600',
      borderColor: 'border-cyan-200',
    },
  };

  const { icon: Icon, label, bgColor, textColor, iconColor, borderColor } = config[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${bgColor} ${textColor} ${borderColor}`}
    >
      <Icon className={`${iconSize} ${iconColor}`} />
      <span>{label}</span>
    </span>
  );
}