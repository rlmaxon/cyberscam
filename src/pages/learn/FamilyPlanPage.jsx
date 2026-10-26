import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Printer, AlertTriangle, CheckCircle } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { useProgress } from '../../member/useProgressState.js';
import { loadFamilyPlan } from '../../training/content.js';
import { BigButton, ErrorBlock, LoadingBlock } from '../../components/learn/LearnParts.jsx';

// A checklist a senior and their family complete together. Only "done" ticks are saved;
// nothing personal (like the code word or phone numbers) is ever typed into the site.
export default function FamilyPlanPage() {
  const { progress, update } = useProgress();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => { loadFamilyPlan().then(setItems).catch(() => setError(true)); }, []);

  if (error) return <ErrorBlock />;
  if (!items) return <LoadingBlock text="Loading the Family Safety Plan…" />;

  const plan = progress.familyPlan ?? {};
  const doneCount = items.filter((i) => plan[i.key]).length;
  const complete = doneCount === items.length;
  const toggle = (key, value) => update((p) => ({ ...p, familyPlan: { ...(p.familyPlan ?? {}), [key]: value } }));

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8 no-print">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4"><Home className="w-8 h-8" /></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Family Safety Plan</h1>
          <p className="text-xl text-slate-700">
            Seven simple steps to do together, over the phone or around the kitchen table. Tick each one when it's done.
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 mb-6 no-print">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xl font-bold text-slate-800">{complete ? 'Your family is ready!' : 'Your progress'}</p>
            <p className="text-lg text-slate-600">{doneCount} of {items.length} done</p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4 mb-6" aria-hidden="true">
            <div className="bg-green-600 h-4 rounded-full transition-all" style={{ width: `${(doneCount / items.length) * 100}%` }} />
          </div>
          <ol className="space-y-4">
            {items.map((item, i) => (
              <li key={item.key}>
                <label className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer ${plan[item.key] ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={!!plan[item.key]} onChange={(e) => toggle(item.key, e.target.checked)} className="mt-1 w-7 h-7 accent-green-600 flex-shrink-0" />
                  <span>
                    <span className="block text-xl font-bold text-slate-800 mb-1">{i + 1}. {item.title}</span>
                    <span className="block text-lg text-slate-700">{item.detail}</span>
                    {item.warning && (
                      <span className="mt-3 flex gap-2 text-base text-amber-900 bg-amber-50 border border-amber-300 rounded-lg p-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" /> {item.warning}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ol>
          {complete && (
            <p className="mt-6 text-lg text-green-800 bg-green-50 border-2 border-green-300 rounded-xl p-4 flex gap-2" role="status">
              <CheckCircle className="w-6 h-6 flex-shrink-0" /> Every step is done. You've earned the Family Safe badge!
            </p>
          )}
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <BigButton tone="white" onClick={() => window.print()}><Printer className="w-5 h-5" /> Print our plan</BigButton>
            <BigButton as={Link} to={PATHS.badges} tone="blue">See my badges</BigButton>
          </div>
        </div>

        {/* Printable version with blanks to fill in by hand */}
        <div className="hidden print-always-show print-card bg-white p-8">
          <h1 className="text-3xl font-bold mb-1">Our Family Safety Plan</h1>
          <p className="text-base mb-6">From Senior Cyber Secure. Keep this by the phone.</p>
          <h2 className="text-xl font-bold mb-2">Trusted numbers</h2>
          <p className="mb-1">Bank fraud line (from the back of my card): ______________________________</p>
          <p className="mb-1">Family member: ______________________ Phone: ________________________</p>
          <p className="mb-4">Family member or friend: ______________ Phone: ________________________</p>
          <h2 className="text-xl font-bold mb-2">Our rules</h2>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>We have a family code word. (Don't write it here. Keep it in your head.)</li>
            <li>Nobody sends money, gift cards, wire transfers, or crypto without calling someone above first.</li>
            <li>It's always okay to hang up and call back on a number we already know.</li>
            <li>Unknown callers go to voicemail.</li>
          </ul>
          <h2 className="text-xl font-bold mb-2">Steps</h2>
          <ol className="list-decimal pl-6 space-y-1">
            {items.map((i) => <li key={i.key}>{plan[i.key] ? '☑' : '☐'} {i.title}</li>)}
          </ol>
          <p className="mt-6 text-base">If something feels wrong: Pause. Hang up. Check. AARP Fraud Watch Helpline: 877-908-3360</p>
        </div>
      </div>
    </div>
  );
}
