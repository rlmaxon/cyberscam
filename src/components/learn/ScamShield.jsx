import React from 'react';
import { moduleProgress } from '../../training/progress.js';

// A shield that fills in one section for every lesson passed.
// The center circle is the Start Here lesson; the sections around it are the topic lessons.
const SHIELD = 'M100 8 L182 38 C182 120 150 172 100 196 C50 172 18 120 18 38 Z';

export default function ScamShield({ progress, modules, size = 220, showLegend = false }) {
  const center = modules.find((m) => m.standalone);
  const ring = modules.filter((m) => !m.standalone);
  const filled = ring.filter((m) => moduleProgress(progress, m.key).passed).length + (center && moduleProgress(progress, center.key).passed ? 1 : 0);
  const total = ring.length + (center ? 1 : 0);
  const cx = 100, cy = 100, R = 140;

  const wedges = ring.map((m, i) => {
    const a0 = (-90 + (360 / ring.length) * i) * (Math.PI / 180);
    const a1 = (-90 + (360 / ring.length) * (i + 1)) * (Math.PI / 180);
    const d = `M${cx} ${cy} L${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} A${R} ${R} 0 0 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)} Z`;
    return { key: m.key, d, passed: !!moduleProgress(progress, m.key).passed };
  });
  const centerPassed = center && moduleProgress(progress, center.key).passed;

  return (
    <figure className="flex flex-col items-center">
      <svg viewBox="0 0 200 204" width={size} height={size * 1.02} role="img" aria-label={`Scam Shield: ${filled} of ${total} sections filled in`}>
        <defs>
          <clipPath id="shield-clip"><path d={SHIELD} /></clipPath>
        </defs>
        <g clipPath="url(#shield-clip)">
          <rect x="0" y="0" width="200" height="204" fill="#e2e8f0" />
          {wedges.map((w) => (
            <path key={w.key} d={w.d} fill={w.passed ? '#16a34a' : '#e2e8f0'} stroke="#ffffff" strokeWidth="3" />
          ))}
          {center && <circle cx={cx} cy={cy} r="30" fill={centerPassed ? '#1d4ed8' : '#cbd5e1'} stroke="#ffffff" strokeWidth="4" />}
        </g>
        <path d={SHIELD} fill="none" stroke="#1e3a8a" strokeWidth="6" strokeLinejoin="round" />
        {center && (
          <path d="M88 100 l8 8 l16 -18" fill="none" stroke={centerPassed ? '#ffffff' : '#94a3b8'} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      <figcaption className="mt-2 text-lg font-semibold text-slate-800 text-center">
        Scam Shield: {filled} of {total} filled in
      </figcaption>
      {showLegend && (
        <p className="text-base text-slate-600 text-center max-w-xs mt-1">
          The center fills in when you finish Start Here. Each outer section fills in when you pass a lesson.
        </p>
      )}
    </figure>
  );
}
