import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, PlayCircle, Award, CalendarCheck, Home, Lightbulb, Send } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { useMember } from '../../member/MemberContext.jsx';
import { useFamily } from '../../member/useFamilyState.js';
import { getShare, leaveShare, sendCheer } from '../../member/familyApi.js';
import { progressFromSummary } from '../../member/familySummary.js';
import { CHEERS } from '../../member/cheers.js';
import { allBadges } from '../../training/badges.js';
import { emptyProgress } from '../../training/progress.js';
import { useTrainingData } from '../../training/content.js';
import ScamShield from '../../components/learn/ScamShield.jsx';
import BadgeIcon from '../../components/learn/BadgeIcon.jsx';
import { BigButton, LoadingBlock } from '../../components/learn/LearnParts.jsx';
import { ConfirmButton, Notice, formatDay } from '../../components/family/FamilyParts.jsx';

// A family member's read-only view of someone they follow.
export default function FollowPage() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { profile } = useMember();
  const { family, refresh, setFamily } = useFamily();
  const { modules, loading } = useTrainingData();
  const [share, setShare] = useState(undefined);
  const [sent, setSent] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getShare(shareId).then((s) => !cancelled && setShare(s)).catch(() => !cancelled && setShare(null));
    return () => { cancelled = true; };
  }, [shareId]);

  if (share === undefined || loading) return <LoadingBlock text="Loading their progress…" />;

  if (!share) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-3">This progress isn't shared with you</h1>
          <p className="text-xl text-slate-700 mb-6">They may have stopped sharing, or the request hasn't been approved yet.</p>
          <BigButton as={Link} to={PATHS.family} tone="blue">Back to my Family Circle</BigButton>
        </div>
      </div>
    );
  }

  const sum = share.summary ?? {};
  const progress = { ...emptyProgress(), ...progressFromSummary(sum) };
  const earnedIds = new Set(sum.badges ?? []);
  const badges = allBadges(emptyProgress(), modules, sum.planTotal ?? 0).map((b) => ({ ...b, earned: earnedIds.has(b.id) }));
  const earned = badges.filter((b) => b.earned);
  const passed = new Set(sum.passed ?? []);
  const name = share.displayName;
  const myName = profile?.displayName || 'Your family';

  const cheer = async (key) => {
    setError('');
    try {
      await sendCheer(share, key, myName);
      setSent((s) => ({ ...s, [key]: true }));
    } catch {
      setError("We couldn't send your cheer. Please check your internet connection and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to={PATHS.family} className="inline-flex items-center gap-2 text-lg text-blue-700 font-semibold hover:underline min-h-[44px]">
          <ArrowLeft className="w-5 h-5" /> My Family Circle
        </Link>

        <header className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 grid sm:grid-cols-[auto_1fr] gap-6 items-center">
          <ScamShield progress={progress} modules={modules} size={150} />
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{name}'s progress</h1>
            <p className="text-xl text-slate-700 mb-1">
              {sum.certified ? 'Passed the final exam and earned the certificate!' : `${passed.size} of ${sum.lessonsTotal ?? modules.length} lessons passed`}
            </p>
            {sum.updatedOn && <p className="text-lg text-slate-600">Last progress: {formatDay(sum.updatedOn)}</p>}
            {sum.certified && sum.certificateId && (
              <Link to={`${PATHS.verify}/${sum.certificateId}`} className="mt-3 inline-flex items-center gap-2 text-lg text-blue-700 font-semibold hover:underline min-h-[44px]">
                <Award className="w-5 h-5" /> See the certificate
              </Link>
            )}
          </div>
        </header>

        <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8" aria-labelledby="cheer-heading">
          <h2 id="cheer-heading" className="text-2xl font-bold text-slate-800 mb-2">Send {name} a cheer</h2>
          <p className="text-lg text-slate-700 mb-4">A little encouragement goes a long way. They'll see it next time they visit.</p>
          {error && <div className="mb-4"><Notice>{error}</Notice></div>}
          <div className="grid sm:grid-cols-2 gap-3">
            {CHEERS.map((c) => (
              <button key={c.key} type="button" disabled={sent[c.key]} onClick={() => cheer(c.key)}
                className={`min-h-[64px] p-4 rounded-xl border-2 text-left text-lg flex items-center gap-3 ${sent[c.key] ? 'border-green-400 bg-green-50 text-green-900' : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-800'}`}>
                <span className="text-3xl" aria-hidden="true">{c.emoji}</span>
                <span className="flex-1">{c.text}</span>
                {sent[c.key] ? <CheckCircle className="w-6 h-6 text-green-600" aria-label="Sent" /> : <Send className="w-5 h-5 text-slate-400" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8" aria-labelledby="lessons-heading">
          <h2 id="lessons-heading" className="text-2xl font-bold text-slate-800 mb-4">Lessons</h2>
          <ul className="space-y-2">
            {modules.map((m) => {
              const isPassed = passed.has(m.key);
              const isWorking = !isPassed && sum.working?.key === m.key;
              return (
                <li key={m.key} className={`flex items-center gap-3 p-3 rounded-xl ${isPassed ? 'bg-green-50' : isWorking ? 'bg-blue-50' : 'bg-slate-50'}`}>
                  {isPassed ? <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" aria-hidden="true" />
                    : isWorking ? <PlayCircle className="w-6 h-6 text-blue-600 flex-shrink-0" aria-hidden="true" />
                      : <Circle className="w-6 h-6 text-slate-300 flex-shrink-0" aria-hidden="true" />}
                  <span className="flex-1 text-lg text-slate-800">{m.title}</span>
                  <span className={`text-base font-semibold ${isPassed ? 'text-green-700' : isWorking ? 'text-blue-700' : 'text-slate-500'}`}>
                    {isPassed ? 'Passed' : isWorking ? `Working on it (${sum.working.steps} of ${sum.working.of} steps)` : 'Not yet'}
                  </span>
                </li>
              );
            })}
            <li className={`flex items-center gap-3 p-3 rounded-xl ${sum.certified ? 'bg-green-50' : 'bg-slate-50'}`}>
              {sum.certified ? <CheckCircle className="w-6 h-6 text-green-600" aria-hidden="true" /> : <Award className="w-6 h-6 text-slate-300" aria-hidden="true" />}
              <span className="flex-1 text-lg text-slate-800">Final exam and certificate</span>
              <span className={`text-base font-semibold ${sum.certified ? 'text-green-700' : 'text-slate-500'}`}>{sum.certified ? 'Passed' : 'Not yet'}</span>
            </li>
          </ul>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <p className="p-4 rounded-xl bg-indigo-50 text-lg text-indigo-950 flex gap-2"><CalendarCheck className="w-6 h-6 flex-shrink-0" /> Scam of the Week: tried {sum.weekly ?? 0}</p>
            <p className="p-4 rounded-xl bg-green-50 text-lg text-green-950 flex gap-2"><Home className="w-6 h-6 flex-shrink-0" /> Family Safety Plan: {sum.planDone ?? 0} of {sum.planTotal || 7} steps</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8" aria-labelledby="badges-heading">
          <h2 id="badges-heading" className="text-2xl font-bold text-slate-800 mb-4">Badges earned: {earned.length} of {badges.length}</h2>
          {earned.length === 0 ? (
            <p className="text-lg text-slate-700">No badges yet. The first one comes with the first lesson passed.</p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-3">
              {earned.map((b) => (
                <li key={b.id} className="flex items-center gap-3 p-3 rounded-xl border-2 border-amber-300">
                  <BadgeIcon icon={b.icon} earned />
                  <span><span className="block text-lg font-bold text-slate-800">{b.name}</span><span className="block text-base text-slate-600">{b.description}</span></span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-amber-50 rounded-2xl border-2 border-amber-200 p-6 sm:p-8" aria-labelledby="help-heading">
          <h2 id="help-heading" className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-2"><Lightbulb className="w-6 h-6 text-amber-600" /> Ways you can help</h2>
          <ul className="space-y-3 text-lg text-slate-800 list-disc pl-6">
            <li>Do the <Link to={PATHS.scamOfTheWeek} className="text-blue-700 font-semibold underline">Scam of the Week</Link> together over the phone. It takes two minutes.</li>
            <li>Make the <Link to={PATHS.familyPlan} className="text-blue-700 font-semibold underline">Family Safety Plan</Link> together, including a family code word.</li>
            <li>Praise, don't scold. Anyone can be fooled, and people who feel embarrassed are less likely to tell you when something happens.</li>
          </ul>
        </section>

        <div className="pt-2">
          <ConfirmButton
            className="text-slate-600 underline hover:text-red-700"
            question={`Stop following ${name}? You'll need a new invite to follow again.`}
            confirmLabel="Yes, stop following"
            onConfirm={async () => {
              try {
                await leaveShare(share, myName);
                setFamily((f) => (f ? { ...f, following: f.following.filter((s) => s.id !== share.id) } : f));
                refresh({ quiet: true });
                navigate(PATHS.family);
              } catch {
                setError("We couldn't do that just now. Please try again.");
              }
            }}
          >Stop following {name}</ConfirmButton>
        </div>
      </div>
    </div>
  );
}
