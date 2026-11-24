import React from 'react';

export const AttendanceGauge = ({ percentage = 0, size = 130, strokeWidth = 10, label = 'Attendance' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePct = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (safePct / 100) * circumference;

  let color = '#10b981'; // Green for >= 75%
  if (safePct < 60) {
    color = '#ef4444'; // Red for < 60%
  } else if (safePct < 75) {
    color = '#f59e0b'; // Amber for 60-74%
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size,
            height: size,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ fontSize: size * 0.22, fontWeight: 800, color: '#1e293b' }}>
            {safePct}%
          </span>
          <span style={{ fontSize: size * 0.1, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            {safePct >= 75 ? 'On Track' : safePct >= 60 ? 'At Risk' : 'Critical'}
          </span>
        </div>
      </div>
      {label && (
        <span style={{ marginTop: 8, fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
          {label}
        </span>
      )}
    </div>
  );
};
