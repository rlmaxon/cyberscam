import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { useProgress } from '../../member/useProgressState.js';
import { useTrainingData, loadFamilyPlan } from '../../training/content.js';
import { allBadges } from '../../training/badges.js';
import ScamShield from '../../components/learn/ScamShield.jsx';
import BadgeIcon from '../../components/learn/BadgeIcon.jsx';
import { ErrorBlock, LoadingBlock } from '../../components/learn/LearnParts.jsx';

export default function BadgesPage() {
  const { progress } = useProgress();
  const { modules, loading, error } = useTrainingData();
  const [planTotal, setPlanTotal] = useState(0);
  useEffect(() => { loadFamilyPlan().then((p) => setPlanTotal(p.length)).catch(() => {}); }, []);

  if (loading) return <LoadingBlock text="Loading your badges…" />;
  if (error) return <ErrorBlock />;

  const badges = allBadges(progress, modules, planTotal);
  const earned = badges.filter((b) => b.earned).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">My Badges & Scam Shield</h1>
          <p className="text-xl text-slate-600">You've earned {earned} of {badges.length} badges. Every one is a scam you're ready for.</p>
        </header>

        <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 mb-8 flex flex-col items-center" aria-label="Scam Shield">
          <ScamShield progress={progress} modules={modules} size={240} showLegend />
          <Link to={PATHS.learn} className="mt-6 inline-flex items-center gap-2 text-lg text-blue-700 font-semibold hover:underline min-h-[44px]">
            Continue my lessons <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        <section aria-labelledby="badges-heading">
          <h2 id="badges-heading" className="text-2xl font-bold text-slate-800 mb-4">Badges</h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {badges.map((b) => (
              <li key={b.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${b.earned ? 'bg-white border-amber-300' : 'bg-slate-100 border-slate-200'}`}>
                <BadgeIcon icon={b.icon} earned={b.earned} />
                <div>
                  <p className={`text-lg font-bold ${b.earned ? 'text-slate-800' : 'text-slate-600'}`}>{b.name}</p>
                  <p className="text-base text-slate-600">{b.earned ? b.description : `To earn: ${b.how}`}</p>
                  <p className="sr-only">{b.earned ? 'Earned' : 'Not earned yet'}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <Link to={PATHS.scamOfTheWeek} className="block p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-blue-400 text-lg font-semibold text-slate-800">
            Try this week's Scam of the Week →
          </Link>
          <Link to={PATHS.familyPlan} className="block p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-blue-400 text-lg font-semibold text-slate-800">
            Make your Family Safety Plan →
          </Link>
        </div>
      </div>
    </div>
  );
}
