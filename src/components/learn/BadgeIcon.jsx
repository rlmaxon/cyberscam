import React from 'react';
import { Footprints, Flag, Eye, CalendarCheck, Home, Award, Lock } from 'lucide-react';
import { ModuleIcon } from '../../training/exampleTypes.jsx';

const EXTRA = { footprints: Footprints, flag: Flag, eye: Eye, calendar: CalendarCheck, home: Home, award: Award };

// A round medal. Earned badges are gold; ones still to earn are gray with a lock.
export default function BadgeIcon({ icon, earned, size = 'md' }) {
  const box = size === 'lg' ? 'w-28 h-28' : 'w-16 h-16';
  const glyph = size === 'lg' ? 'w-14 h-14' : 'w-8 h-8';
  const Extra = EXTRA[icon];
  return (
    <div className={`relative ${box} rounded-full flex items-center justify-center flex-shrink-0 ${earned ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-md ring-4 ring-amber-200' : 'bg-slate-200 text-slate-400'}`}>
      {Extra ? <Extra className={glyph} aria-hidden="true" /> : <ModuleIcon iconKey={icon} className={glyph} />}
      {!earned && (
        <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center">
          <Lock className="w-4 h-4 text-slate-500" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}
