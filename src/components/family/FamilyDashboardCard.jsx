import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Bell } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { useFamily } from '../../member/useFamilyState.js';
import { cheerText } from '../../member/cheers.js';
import { formatDay, getPendingInvite } from './FamilyParts.jsx';

// "Finish accepting your invite" reminder for people who signed up from an invite link.
export function PendingInviteBanner() {
  const id = getPendingInvite();
  if (!id) return null;
  return (
    <Link to={`${PATHS.familyJoin}/${id}`} className="block mb-8 p-5 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100">
      <p className="text-xl font-bold text-amber-950 flex items-center gap-2"><Bell className="w-6 h-6" /> You have a Family Circle invite waiting</p>
      <p className="text-lg text-amber-900 flex items-center gap-2">Tap here to finish accepting it <ArrowRight className="w-5 h-5" /></p>
    </Link>
  );
}

export default function FamilyDashboardCard({ lessonsTotal }) {
  const { family, status } = useFamily();
  if (status === 'unavailable' || status === 'idle') return null;

  const requests = family?.joinRequests ?? [];
  const cheers = family?.cheers ?? [];
  const following = family?.following ?? [];
  const sharing = !!family?.myShare;

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8" aria-labelledby="family-card-heading">
      <h2 id="family-card-heading" className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2"><Users className="w-6 h-6 text-blue-600" /> Family Circle</h2>

      {!family ? (
        <p className="text-lg text-slate-600">{status === 'error' ? "We couldn't load your Family Circle just now." : 'Loading…'}</p>
      ) : (
        <div className="space-y-3 mb-4">
          {requests.length > 0 && (
            <p className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-lg text-amber-950 font-semibold">
              {requests.length === 1 ? `${requests[0].requesterName} would like to follow your progress.` : `${requests.length} people would like to follow your progress.`}
            </p>
          )}
          {cheers.slice(0, 2).map((c) => {
            const t = cheerText(c.message);
            return (
              <p key={c.id} className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-lg text-slate-800 flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">{t.emoji}</span>
                <span>“{t.text}” <span className="text-slate-600">From {c.fromName}{c.createdAt ? `, ${formatDay(c.createdAt)}` : ''}</span></span>
              </p>
            );
          })}
          {following.slice(0, 3).map((s) => (
            <Link key={s.id} to={`${PATHS.familyView}/${s.id}`} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-400 text-lg">
              <span className="font-semibold text-slate-800">{s.displayName}</span>
              <span className="text-slate-700">
                {s.summary?.certified ? 'Certified!' : `${(s.summary?.passed ?? []).length} of ${s.summary?.lessonsTotal ?? lessonsTotal} lessons`}
              </span>
            </Link>
          ))}
          {requests.length === 0 && cheers.length === 0 && following.length === 0 && (
            <p className="text-lg text-slate-700">
              {sharing
                ? `${family.myShare.viewers.length === 1 ? '1 person follows' : `${family.myShare.viewers.length} people follow`} your progress. Cheers they send will show up here.`
                : 'Invite family to cheer you on, or follow a parent\'s progress and send them encouragement.'}
            </p>
          )}
        </div>
      )}

      <Link to={PATHS.family} className="inline-flex items-center gap-2 px-5 py-3 min-h-[48px] rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">
        Open Family Circle <ArrowRight className="w-5 h-5" />
      </Link>
    </section>
  );
}
