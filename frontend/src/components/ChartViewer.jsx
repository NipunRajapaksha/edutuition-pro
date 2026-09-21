import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ProgressLineChart = ({ data = [], height = 160 }) => {
  const { colors } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted, fontSize: '12px' }}>
        No evaluation data recorded yet
      </div>
    );
  }

  const width = 320;
  const paddingX = 30;
  const paddingY = 25;

  const points = data.map((item, index) => {
    const x = paddingX + (index * (width - 2 * paddingX)) / Math.max(1, data.length - 1);
    const score = item.percentage ?? item.marksObtained ?? 0;
    const y = height - paddingY - (score / 100) * (height - 2 * paddingY);
    return { x, y, score, label: item.subject || item.examName || `T${index + 1}` };
  });

  const pathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height, overflow: 'visible' }}>
        {/* Grid lines */}
        {[25, 50, 75, 100].map(val => {
          const y = height - paddingY - (val / 100) * (height - 2 * paddingY);
          return (
            <g key={val}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke={colors.border} strokeDasharray="3,3" />
              <text x={paddingX - 6} y={y + 3} fill={colors.textMuted} fontSize="9" textAnchor="end">
                {val}%
              </text>
            </g>
          );
        })}

        {/* Path line */}
        <path d={pathD} fill="none" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r="5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
            <text x={pt.x} y={pt.y - 8} fill={colors.text} fontSize="10" fontWeight="700" textAnchor="middle">
              {pt.score}%
            </text>
            <text x={pt.x} y={height - 6} fill={colors.textMuted} fontSize="8" textAnchor="middle">
              {pt.label.length > 8 ? pt.label.slice(0, 7) + '..' : pt.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export const TrendBarChart = ({ data = [], height = 150 }) => {
  const { colors } = useTheme();

  if (!data || data.length === 0) return null;

  const width = 320;
  const barWidth = Math.max(14, (width - 40) / (data.length * 1.8));

  const maxVal = Math.max(1, ...data.map(d => (d.present ?? 0) + (d.absent ?? 0)));

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height }}>
        {data.map((item, i) => {
          const x = 30 + i * ((width - 40) / data.length);
          const total = (item.present ?? 0) + (item.absent ?? 0);
          const barHeight = ((item.present ?? 0) / maxVal) * (height - 40);
          const y = height - 25 - barHeight;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(4, barHeight)}
                rx="4"
                fill="#10B981"
              />
              <text x={x + barWidth / 2} y={height - 8} fill={colors.textMuted} fontSize="9" textAnchor="middle">
                {item.date}
              </text>
              <text x={x + barWidth / 2} y={y - 4} fill={colors.text} fontSize="9" fontWeight="600" textAnchor="middle">
                {item.present}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
