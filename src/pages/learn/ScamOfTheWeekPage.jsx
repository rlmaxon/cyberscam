import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, XCircle, CalendarCheck, CheckCircle, ArrowRight } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { useProgress } from '../../member/useProgressState.js';
import { loadScamOfTheWeek } from '../../training/content.js';
import { ExampleMessage } from '../../training/exampleTypes.jsx';
import { BigButton, ErrorBlock, LoadingBlock } from '../../components/learn/LearnParts.jsx';

const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local time

const formatWeek = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

// Weeks done in a row, counting back from the most recent week (only shown when 2 or more).
function streak(entries, weekly) {
  let n = 0;
  for (const e of entries) { if (weekly[e.id]) n++; else break; }
  return n;
}

export default function ScamOfTheWeekPage() {
  const { weekId } = useParams();
  const { progress, update } = useProgress();
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => { loadScamOfTheWeek().then(setEntries).catch(() => setError(true)); }, []);

  // Weeks that have started, newest first. If none have started yet, show the first one.
  const available = useMemo(() => {
    if (!entries) return [];
    const started = entries.filter((e) => e.weekOf <= today()).sort((a, b) => b.weekOf.localeCompare(a.weekOf));
    return started.length ? started : entries.slice(0, 1);
  }, [entries]);

  if (error) return <ErrorBlock />;
  if (!entries) return <LoadingBlock text="Loading this week's scam…" />;

  const entry = (weekId && available.find((e) => e.id === weekId)) || available[0];
  const isCurrent = entry.id === available[0].id;
  const done = progress.weekly ?? {};
  const total = Object.keys(done).length;
  const inARow = streak(available, done);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6">
          <p className="text-lg font-semibold text-blue-700 flex items-center gap-2"><CalendarCheck className="w-5 h-5" /> {isCurrent ? 'This week' : 'From the archive'}: week of {formatWeek(entry.weekOf)}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">Scam of the Week: {entry.headline}</h1>
          <p className="text-lg text-slate-700">A 2-minute challenge. Read the message and decide: scam or safe?</p>
        </header>

        <WeekChallenge
          key={entry.id}
          entry={entry}
          previous={done[entry.id]}
          onAnswer={(correct) => update((p) => ({ ...p, weekly: { ...(p.weekly ?? {}), [entry.id]: { correct, at: new Date().toISOString() } } }))}
        />

        <section className="mt-8 bg-white rounded-2xl shadow border border-slate-200 p-6" aria-labelledby="weeks-heading">
          <h2 id="weeks-heading" className="text-2xl font-bold text-slate-800 mb-2">Your weekly challenges</h2>
          <p className="text-lg text-slate-700 mb-4">
            {total === 0 ? "You haven't tried one yet. This week's is above." : `You've tried ${total} Scam${total === 1 ? '' : 's'} of the Week${inARow >= 2 ? `, ${inARow} weeks in a row` : ''}. Nice work!`}
            {' '}Missed a week? No problem. You can try any past week below.
          </p>
          <ul className="space-y-2">
            {available.map((e) => (
              <li key={e.id}>
                <Link to={`${PATHS.scamOfTheWeek}/${e.id}`} aria-current={e.id === entry.id ? 'page' : undefined}
                  className={`flex items-center justify-between gap-3 p-4 rounded-xl border-2 min-h-[56px] ${e.id === entry.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <span className="text-lg text-slate-800"><strong>{formatWeek(e.weekOf)}:</strong> {e.headline}</span>
                  {done[e.id] ? <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" aria-label="Done" /> : <ArrowRight className="w-6 h-6 text-slate-400 flex-shrink-0" aria-hidden="true" />}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function WeekChallenge({ entry, previous, onAnswer }) {
  const ex = entry.example;
  const [guess, setGuess] = useState(null);
  const answered = guess !== null;
  const correct = answered && (guess === 'scam') === ex.isScam;

  const choose = (g) => {
    if (answered) return;
    setGuess(g);
    onAnswer((g === 'scam') === ex.isScam);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
      {previous && !answered && (
        <p className="mb-4 text-lg text-green-800 bg-green-50 border border-green-200 rounded-xl p-3">You've already tried this one. Try it again any time.</p>
      )}
      <ExampleMessage example={ex} />
      {!answered ? (
        <div className="grid sm:grid-cols-2 gap-3 mt-6" role="group" aria-label="Your answer">
          <BigButton tone="white" onClick={() => choose('scam')} className="border-red-300 text-red-800 hover:bg-red-50"><ShieldAlert className="w-6 h-6" /> It's a Scam</BigButton>
          <BigButton tone="white" onClick={() => choose('safe')} className="border-green-300 text-green-800 hover:bg-green-50"><ShieldCheck className="w-6 h-6" /> It's Safe</BigButton>
        </div>
      ) : (
        <div className="mt-6 space-y-4" role="status">
          <div className={`p-5 rounded-xl border-2 ${correct ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'}`}>
            <p className={`text-xl font-bold mb-1 ${correct ? 'text-green-800' : 'text-amber-900'}`}>{correct ? 'You got it!' : 'Good try.'} {ex.isScam ? 'This is a scam.' : 'This one is safe.'}</p>
            <p className="text-lg text-slate-800">{ex.explanation}</p>
          </div>
          {ex.redFlags?.length > 0 && (
            <div className="p-5 rounded-xl bg-red-50 border-2 border-red-200">
              <p className="text-lg font-bold text-red-800 mb-2">Red flags</p>
              <ul className="space-y-2">{ex.redFlags.map((f) => <li key={f} className="flex gap-2 text-lg text-red-900"><XCircle className="w-5 h-5 flex-shrink-0 mt-1" /> {f}</li>)}</ul>
            </div>
          )}
          <div className="p-5 rounded-xl bg-blue-50 border-2 border-blue-200">
            <p className="text-lg font-bold text-blue-800 mb-1">How to protect yourself</p>
            <p className="text-lg text-blue-900">{ex.howToSpot}</p>
          </div>
          <div className="p-5 rounded-xl bg-indigo-50 border-2 border-indigo-200">
            <p className="text-lg font-bold text-indigo-900 mb-1">This week's tip</p>
            <p className="text-lg text-indigo-950">{entry.tip}</p>
          </div>
          <p className="text-lg text-slate-700">Share this week's scam with someone you love. Talking about it is one of the best protections.</p>
        </div>
      )}
    </div>
  );
}
