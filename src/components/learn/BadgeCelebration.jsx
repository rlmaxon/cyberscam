import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';
import { useProgress } from '../../member/useProgressState.js';
import { loadModules, loadFamilyPlan } from '../../training/content.js';
import { allBadges, earnedBadgeIds } from '../../training/badges.js';
import BadgeIcon from './BadgeIcon.jsx';

// Shows a short celebration when a new badge is earned. Badges already earned
// before this feature existed are recorded quietly, so nobody gets a pile of pop-ups.
export default function BadgeCelebration() {
  const { progress, update, saving } = useProgress();
  const [modules, setModules] = useState(null);
  const [planTotal, setPlanTotal] = useState(0);
  const [queue, setQueue] = useState([]);
  const closeRef = useRef(null);

  useEffect(() => {
    loadModules().then(setModules).catch(() => {});
    loadFamilyPlan().then((p) => setPlanTotal(p.length)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!modules || saving === 'loading') return;
    const badges = allBadges(progress, modules, planTotal);
    const earned = earnedBadgeIds(badges);
    if (progress.badgesSeen == null) {
      // First time: remember what's already earned without celebrating it.
      update((p) => ({ ...p, badgesSeen: earned }));
      return;
    }
    const fresh = badges.filter((b) => b.earned && !progress.badgesSeen.includes(b.id));
    if (fresh.length) {
      setQueue((q) => [...q, ...fresh.filter((f) => !q.some((x) => x.id === f.id))]);
      update((p) => ({ ...p, badgesSeen: [...new Set([...(p.badgesSeen ?? []), ...fresh.map((b) => b.id)])] }));
    }
  }, [progress, modules, planTotal, saving]);

  useEffect(() => { if (queue.length) closeRef.current?.focus(); }, [queue.length]);

  const badge = queue[0];
  if (!badge) return null;
  const close = () => setQueue((q) => q.slice(1));

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4 no-print" onKeyDown={(e) => e.key === 'Escape' && close()}>
      <div role="dialog" aria-modal="true" aria-labelledby="badge-title" className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center motion-safe:animate-[pop_0.35s_ease-out]">
        <PartyPopper className="w-10 h-10 text-amber-500 mx-auto mb-2" aria-hidden="true" />
        <p className="text-lg font-semibold text-amber-700 mb-4">You earned a badge!</p>
        <div className="flex justify-center mb-4"><BadgeIcon icon={badge.icon} earned size="lg" /></div>
        <h2 id="badge-title" className="text-3xl font-bold text-slate-800 mb-2">{badge.name}</h2>
        <p className="text-lg text-slate-600 mb-6">{badge.description}</p>
        <div className="space-y-3">
          <button ref={closeRef} type="button" onClick={close} className="w-full py-4 min-h-[56px] bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700">
            {queue.length > 1 ? `Wonderful! (${queue.length - 1} more)` : 'Wonderful! Keep going'}
          </button>
          <Link to="/badges" onClick={() => setQueue([])} className="block w-full py-3 text-lg text-blue-700 font-semibold hover:underline">See all my badges</Link>
        </div>
      </div>
    </div>
  );
}
