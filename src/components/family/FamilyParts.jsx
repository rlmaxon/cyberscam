import React, { useState } from 'react';
import { Copy, Check, MessageSquare, Mail } from 'lucide-react';

export const formatDay = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

// A message (usually with a link) plus big buttons to copy it, text it, or email it.
export function ShareMessage({ label, message, link, subject }) {
  const [copied, setCopied] = useState(false);
  const full = link ? `${message} ${link}` : message;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link ?? full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };
  const btn = 'flex-1 min-h-[52px] px-4 py-3 rounded-xl border-2 font-semibold text-lg flex items-center justify-center gap-2';
  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
      {label && <p className="text-lg font-semibold text-slate-800 mb-2">{label}</p>}
      {link ? (
        <input readOnly value={link} aria-label="Invite link" onFocus={(e) => e.target.select()}
          className="w-full mb-3 px-4 py-3 text-lg rounded-lg border border-blue-300 bg-white text-slate-800" />
      ) : (
        <p className="mb-3 p-3 text-lg rounded-lg border border-blue-300 bg-white text-slate-800">{message}</p>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={copy} className={`${btn} border-blue-600 bg-blue-600 text-white hover:bg-blue-700`}>
          {copied ? <><Check className="w-5 h-5" /> Copied!</> : <><Copy className="w-5 h-5" /> {link ? 'Copy link' : 'Copy message'}</>}
        </button>
        <a href={`sms:?&body=${encodeURIComponent(full)}`} className={`${btn} border-slate-300 bg-white text-slate-800 hover:bg-slate-50`}>
          <MessageSquare className="w-5 h-5" /> Text it
        </a>
        <a href={`mailto:?subject=${encodeURIComponent(subject ?? 'Senior Cyber Secure')}&body=${encodeURIComponent(full)}`} className={`${btn} border-slate-300 bg-white text-slate-800 hover:bg-slate-50`}>
          <Mail className="w-5 h-5" /> Email it
        </a>
      </div>
      <p className="sr-only" aria-live="polite">{copied ? 'Copied' : ''}</p>
    </div>
  );
}

// A button that asks "Are you sure?" in place, instead of a pop-up box.
export function ConfirmButton({ children, question, confirmLabel = 'Yes', onConfirm, className = '', tone = 'red' }) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const toneClass = tone === 'red' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white';
  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className={`min-h-[48px] px-4 py-2 rounded-xl font-semibold text-lg ${className}`}>
        {children}
      </button>
    );
  }
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-slate-100 border border-slate-300" role="group">
      <p className="text-lg text-slate-800 flex-1">{question}</p>
      <div className="flex gap-2">
        <button type="button" disabled={busy}
          onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); setAsking(false); } }}
          className={`min-h-[48px] px-5 rounded-xl font-bold text-lg ${toneClass} disabled:opacity-60`}>
          {busy ? 'One moment…' : confirmLabel}
        </button>
        <button type="button" disabled={busy} onClick={() => setAsking(false)} className="min-h-[48px] px-5 rounded-xl font-semibold text-lg bg-white border-2 border-slate-300 text-slate-800">
          Cancel
        </button>
      </div>
    </div>
  );
}

export function Notice({ tone = 'red', children }) {
  const tones = {
    red: 'text-red-800 bg-red-50 border-red-200',
    green: 'text-green-800 bg-green-50 border-green-300',
    amber: 'text-amber-900 bg-amber-50 border-amber-300',
  };
  return <p role={tone === 'red' ? 'alert' : 'status'} className={`text-lg border-2 rounded-xl p-4 ${tones[tone]}`}>{children}</p>;
}

export const PENDING_INVITE_KEY = 'scs-pending-family-invite';
export const getPendingInvite = () => { try { return window.localStorage.getItem(PENDING_INVITE_KEY); } catch { return null; } };
export const setPendingInvite = (id) => { try { window.localStorage.setItem(PENDING_INVITE_KEY, id); } catch { /* ignore */ } };
export const clearPendingInvite = () => { try { window.localStorage.removeItem(PENDING_INVITE_KEY); } catch { /* ignore */ } };
