import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileDown, CreditCard, ListChecks, Loader2, Scissors, Users } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { useTrainingData } from '../../training/content.js';
import { downloadAllWalletCards, downloadAllChecklists } from '../../training/printables.js';
import { DownloadButtons } from '../../components/learn/DownloadButtons.jsx';
import { ErrorBlock, LoadingBlock } from '../../components/learn/LearnParts.jsx';

// Free printable materials for every lesson. No account needed, so family can print them too.
export default function DownloadsPage() {
  const { loading, error, modules } = useTrainingData();
  const [busy, setBusy] = useState(null);

  const all = async (kind) => {
    setBusy(kind);
    try {
      await (kind === 'cards' ? downloadAllWalletCards(modules) : downloadAllChecklists(modules));
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock />;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <p className="text-lg font-semibold text-purple-700 flex items-center gap-2 mb-1"><FileDown className="w-6 h-6" aria-hidden="true" /> Free to print and share</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Printable Cards and Checklists</h1>
          <p className="text-xl text-slate-700">
            For each lesson there's a <strong>wallet card</strong> with the red flags to watch for (plus a large-print copy for by the phone)
            and a <strong>checklist</strong> of what to do if it happens to you.
          </p>
        </header>

        <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8" aria-labelledby="all-heading">
          <h2 id="all-heading" className="text-2xl font-bold text-slate-800 mb-2">Print everything at once</h2>
          <p className="text-lg text-slate-700 mb-4">Handy for a family visit, a senior center, or a church group.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <AllButton busy={busy} kind="cards" onClick={all} Icon={CreditCard} label={`All ${modules.length} wallet cards (PDF)`} />
            <AllButton busy={busy} kind="lists" onClick={all} Icon={ListChecks} label={`All ${modules.length} checklists (PDF)`} />
          </div>
          <ul className="mt-5 space-y-2 text-lg text-slate-700">
            <li className="flex items-start gap-3"><Scissors className="w-6 h-6 text-slate-500 flex-shrink-0" aria-hidden="true" /> Wallet cards: cut on the dashed line and fold in half. Thicker paper or card stock lasts longer.</li>
            <li className="flex items-start gap-3"><Users className="w-6 h-6 text-slate-500 flex-shrink-0" aria-hidden="true" /> Going over a card together is a great way to start the conversation with a parent.</li>
          </ul>
        </section>

        <ol className="space-y-4">
          {modules.map((m) => (
            <li key={m.key} className="bg-white rounded-2xl shadow border border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                {m.standalone ? m.title : `Lesson ${m.number}: ${m.title}`}
              </h2>
              <p className="text-lg text-slate-700 mb-4">{m.card?.rule}</p>
              <DownloadButtons module={m} />
              <p className="mt-3 text-lg"><Link to={`${PATHS.learn}/${m.key}`} className="text-blue-700 underline font-semibold">Take this lesson</Link></p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function AllButton({ busy, kind, onClick, Icon, label }) {
  return (
    <button
      type="button"
      onClick={() => onClick(kind)}
      disabled={!!busy}
      className="flex-1 min-h-[56px] px-5 py-3 rounded-xl bg-purple-700 text-white text-lg font-bold hover:bg-purple-800 disabled:opacity-60 flex items-center justify-center gap-2"
    >
      {busy === kind ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Icon className="w-5 h-5" aria-hidden="true" />}
      {busy === kind ? 'Making your PDF…' : label}
    </button>
  );
}
