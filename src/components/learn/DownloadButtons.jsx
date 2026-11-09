import React, { useState } from 'react';
import { CreditCard, ListChecks, Loader2 } from 'lucide-react';
import { downloadWalletCard, downloadChecklist } from '../../training/printables.js';

// "Wallet card (PDF)" and "Checklist (PDF)" buttons for one lesson.
// only: 'card' | 'checklist' shows just one of them.
export function DownloadButtons({ module, only, className = '' }) {
  const [busy, setBusy] = useState(null);
  const [failed, setFailed] = useState(false);

  const run = async (kind) => {
    setBusy(kind);
    setFailed(false);
    try {
      await (kind === 'card' ? downloadWalletCard(module) : downloadChecklist(module));
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  };

  const button = (kind, Icon, label) => (
    <button
      type="button"
      onClick={() => run(kind)}
      disabled={!!busy}
      className={`min-h-[56px] px-5 py-3 rounded-xl border-2 border-slate-300 bg-white text-lg font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-60 flex items-center justify-center gap-2 ${className}`}
    >
      {busy === kind ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Icon className="w-5 h-5" aria-hidden="true" />}
      {busy === kind ? 'Making your PDF…' : label}
    </button>
  );

  if (only) {
    return (
      <>
        {button(only, only === 'card' ? CreditCard : ListChecks, only === 'card' ? 'Wallet card (PDF)' : 'Download checklist (PDF)')}
        {failed && <p role="alert" className="text-base text-red-700">Sorry, the PDF didn't download. Please try again.</p>}
      </>
    );
  }
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3">
        {button('card', CreditCard, 'Wallet card (PDF)')}
        {button('checklist', ListChecks, 'Checklist (PDF)')}
      </div>
      {failed && <p role="alert" className="mt-2 text-base text-red-700">Sorry, the PDF didn't download. Please try again.</p>}
    </div>
  );
}
