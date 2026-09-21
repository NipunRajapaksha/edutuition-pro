import React from 'react';

const Badge = ({ variant = 'default', children, size = 'md' }) => {
  const styles = {
    present: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    reviewed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    
    late: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    partially_paid: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    
    absent: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    overdue: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    
    excused: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    submitted: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    
    high: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    default: 'bg-gray-500/10 text-gray-300 border-gray-500/30'
  };

  const currentStyle = styles[variant] || styles.default;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '9999px',
        border: '1px solid',
        textTransform: 'capitalize',
        letterSpacing: '0.025em'
      }}
      className={`${padding} ${currentStyle}`}
    >
      {children}
    </span>
  );
};

export default Badge;
