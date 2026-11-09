import React, { useCallback, useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Users, Pencil, Trash2, Send, RefreshCw, Lock, ShieldAlert, Plus, MousePointerClick } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { useMember } from '../../member/MemberContext.jsx';
import { hasEmailBackend, hasClickTracking } from '../../amplifyConfig.js';
import { clickStats, pageLabel } from '../../affiliate/products.js';
import { listAlertsForAdmin, saveAlert, deleteAlert, SEVERITIES, formatAlertDate } from '../../alerts/alertsApi.js';
import { emailAlertToSubscribers, sendAnnouncement, getSubscriberStats } from '../../alerts/emailApi.js';
import { Notice, SubmitButton } from '../../components/account/FormParts.jsx';
import { SeverityBadge } from '../../components/alerts/AlertParts.jsx';

// Site admin tools (members in the Cognito "admin" group): post Scam Alerts, email them
// to subscribers, and announce new training or videos. The backend checks the group too.

const today = () => new Date().toLocaleDateString('en-CA');
const EMPTY = { title: '', summary: '', details: '', severity: 'warning', publishedOn: '', sourceName: '', sourceUrl: '' };
const inputClass = 'w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg';

function Field({ label, hint, children }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-base font-semibold text-slate-700 mb-2">{label}</label>
      {React.cloneElement(children, { id, className: inputClass })}
      {hint && <p className="text-base text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-5 flex items-center gap-3">{icon} {title}</h2>
      {children}
    </section>
  );
}

// Two-step button for anything that sends email or deletes: tap, then confirm.
function ConfirmButton({ label, confirmText, confirmLabel, onConfirm, busy, danger }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} disabled={busy} className={`min-h-[48px] px-4 py-2 rounded-xl text-base font-semibold disabled:opacity-60 ${danger ? 'bg-red-50 text-red-800 hover:bg-red-100' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}`}>
        {label}
      </button>
    );
  }
  return (
    <div role="alertdialog" aria-label={confirmText} className="w-full p-4 rounded-xl border-2 border-amber-300 bg-amber-50">
      <p className="text-lg text-slate-800 mb-3">{confirmText}</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={async () => { await onConfirm(); setAsking(false); }} disabled={busy} className={`min-h-[48px] px-5 py-2 rounded-xl text-white text-base font-bold disabled:opacity-60 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {confirmLabel}
        </button>
        <button type="button" onClick={() => setAsking(false)} className="min-h-[48px] px-5 py-2 rounded-xl bg-white border-2 border-slate-300 text-base font-semibold">Cancel</button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin } = useMember();
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <Lock className="w-12 h-12 mx-auto text-slate-400 mb-4" aria-hidden="true" />
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Admins only</h1>
        <p className="text-lg text-slate-700 mb-6">This page is for site administrators. If you were just added as an admin, sign out and sign back in.</p>
        <Link to={PATHS.dashboard} className="text-lg font-semibold text-blue-700 underline">Back to my dashboard</Link>
      </div>
    );
  }
  if (!hasEmailBackend) {
    return <div className="max-w-xl mx-auto py-16 px-4"><Notice tone="info">The admin tools need the Phase 5 backend, which isn't deployed here yet.</Notice></div>;
  }
  return <AdminTools />;
}

function AdminTools() {
  const [alerts, setAlerts] = useState(null);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ ...EMPTY, publishedOn: today() });
  const [emailNow, setEmailNow] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [step, setStep] = useState('edit'); // 'edit' | 'confirm'

  const refresh = useCallback(async () => {
    const [list, s] = await Promise.all([listAlertsForAdmin().catch(() => []), getSubscriberStats()]);
    setAlerts(list);
    if (s.ok) setStats(s.stats);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (!form.title.trim()) return 'Add a title.';
    if (!form.summary.trim()) return 'Add a short summary.';
    if (!form.publishedOn) return 'Choose a date.';
    if (form.sourceUrl.trim() && !/^https:\/\/\S+$/.test(form.sourceUrl.trim())) return 'The source link must start with https://';
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setNotice({ tone: 'error', text: problem });
    if (!form.id && emailNow && step === 'edit') return setStep('confirm');
    setBusy(true);
    setNotice(null);
    try {
      const saved = await saveAlert(form);
      let text = form.id ? 'Alert updated.' : 'Alert posted. It\'s live on the Scam Alerts page.';
      if (!form.id && emailNow) {
        const r = await emailAlertToSubscribers(saved.id);
        text += r.ok ? ' Emails are on their way.' : ` It was not emailed: ${r.error}`;
      }
      setNotice({ tone: 'success', text });
      setForm({ ...EMPTY, publishedOn: today() });
      setStep('edit');
      await refresh();
    } catch {
      setNotice({ tone: 'error', text: "We couldn't save the alert. Check that you're still signed in as an admin and try again." });
    } finally {
      setBusy(false);
    }
  };

  const emailOne = async (alert) => {
    setBusy(true);
    const r = await emailAlertToSubscribers(alert.id);
    setBusy(false);
    setNotice(r.ok ? { tone: 'success', text: `“${alert.title}” is being emailed.` } : { tone: 'error', text: r.error });
    refresh();
  };

  const remove = async (alert) => {
    setBusy(true);
    try {
      await deleteAlert(alert.id);
      setNotice({ tone: 'success', text: 'Alert deleted.' });
    } catch {
      setNotice({ tone: 'error', text: "We couldn't delete that alert." });
    }
    setBusy(false);
    refresh();
  };

  const subscriberCount = stats?.scamAlerts ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">Site Admin</h1>
          <p className="text-lg text-slate-700">Post scam alerts and email subscribers. Starter alerts live in <code>public/training-data/alerts.json</code> and are edited with a commit.</p>
        </header>

        {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

        <Section icon={<Users className="w-7 h-7 text-blue-600" aria-hidden="true" />} title="Subscribers">
          {stats ? (
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[['Confirmed', stats.active], ['Waiting to confirm', stats.pending], ['Scam alerts', stats.scamAlerts], ['New training', stats.newTraining], ['New videos', stats.newVideos]].map(([label, n]) => (
                <div key={label} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <dt className="text-base text-slate-600">{label}</dt>
                  <dd className="text-3xl font-bold text-slate-800">{n ?? 0}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-lg text-slate-600">Loading…</p>
          )}
        </Section>

        <Section icon={<ShieldAlert className="w-7 h-7 text-red-600" aria-hidden="true" />} title={form.id ? 'Edit alert' : 'Post a scam alert'}>
          <form onSubmit={submit} className="space-y-5" noValidate>
            <Field label="Title" hint="Short and plain, like: Texts about “unpaid tolls” are fake"><input value={form.title} onChange={set('title')} maxLength={120} /></Field>
            <Field label="Summary" hint="One to three sentences: what the scam looks like."><textarea rows={3} value={form.summary} onChange={set('summary')} maxLength={600} /></Field>
            <Field label="What to do" hint="One step per line."><textarea rows={5} value={form.details} onChange={set('details')} maxLength={2000} /></Field>
            <fieldset>
              <legend className="block text-base font-semibold text-slate-700 mb-2">How serious?</legend>
              <div className="grid sm:grid-cols-3 gap-3">
                {Object.entries(SEVERITIES).map(([key, s]) => (
                  <label key={key} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer ${form.severity === key ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                    <input type="radio" name="severity" value={key} checked={form.severity === key} onChange={set('severity')} className="mt-1 w-5 h-5 accent-blue-600" />
                    <span><span className="block text-lg font-semibold">{s.label}</span><span className="block text-base text-slate-600">{s.description}</span></span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Date"><input type="date" value={form.publishedOn} onChange={set('publishedOn')} /></Field>
              <Field label="Source (optional)"><input value={form.sourceName} onChange={set('sourceName')} placeholder="Federal Trade Commission" /></Field>
              <Field label="Source link (optional)"><input type="url" value={form.sourceUrl} onChange={set('sourceUrl')} placeholder="https://" /></Field>
            </div>
            {!form.id && (
              <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-slate-200 cursor-pointer">
                <input type="checkbox" checked={emailNow} onChange={(e) => { setEmailNow(e.target.checked); setStep('edit'); }} className="mt-1 w-6 h-6 accent-blue-600" />
                <span><span className="block text-lg font-semibold">Email it to scam-alert subscribers now</span><span className="block text-base text-slate-600">{subscriberCount} confirmed subscriber{subscriberCount === 1 ? '' : 's'}. You can also email it later.</span></span>
              </label>
            )}
            {step === 'confirm' && (
              <div role="alertdialog" aria-label="Confirm sending" className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50 text-lg">
                This posts the alert and emails it to <strong>{subscriberCount}</strong> {subscriberCount === 1 ? 'person' : 'people'}. Emails can't be unsent. Tap <strong>Post and email</strong> again to go ahead.
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <SubmitButton loading={busy} loadingText="Saving…">
                {form.id ? <><Pencil className="w-5 h-5" aria-hidden="true" /> Save changes</> : emailNow ? <><Send className="w-5 h-5" aria-hidden="true" /> Post and email</> : <><Plus className="w-5 h-5" aria-hidden="true" /> Post alert</>}
              </SubmitButton>
              {(form.id || step === 'confirm') && (
                <button type="button" onClick={() => { setForm({ ...EMPTY, publishedOn: today() }); setStep('edit'); }} className="min-h-[56px] px-6 rounded-xl border-2 border-slate-300 text-lg font-semibold">Cancel</button>
              )}
            </div>
          </form>
        </Section>

        <Section icon={<ShieldAlert className="w-7 h-7 text-slate-600" aria-hidden="true" />} title="Posted alerts">
          {!alerts ? (
            <p className="text-lg text-slate-600 flex items-center gap-2"><RefreshCw className="w-5 h-5 animate-spin" aria-hidden="true" /> Loading…</p>
          ) : !alerts.length ? (
            <p className="text-lg text-slate-600">No alerts posted yet. (The starter alerts still show on the public page.)</p>
          ) : (
            <ul className="space-y-4">
              {alerts.map((a) => (
                <li key={a.id} className="p-4 rounded-xl border-2 border-slate-200">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <SeverityBadge severity={a.severity} />
                    <span className="text-base text-slate-600">{formatAlertDate(a.publishedOn)}</span>
                    <span className="text-base text-slate-600">
                      {a.emailStatus === 'sent' ? `Emailed to ${a.emailCount ?? 0} ${a.emailCount === 1 ? 'person' : 'people'}` : a.emailStatus === 'sending' ? 'Emailing now…' : 'Not emailed'}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-800 mb-3"><Link to={`/alerts/${a.id}`} className="underline">{a.title}</Link></p>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => { setForm({ ...EMPTY, ...Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v ?? ''])) }); setStep('edit'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="min-h-[48px] px-4 py-2 rounded-xl bg-slate-100 text-base font-semibold hover:bg-slate-200 flex items-center gap-2">
                      <Pencil className="w-4 h-4" aria-hidden="true" /> Edit
                    </button>
                    {!a.emailStatus && (
                      <ConfirmButton busy={busy} label="Email to subscribers" confirmText={`Email “${a.title}” to ${subscriberCount} ${subscriberCount === 1 ? 'person' : 'people'}? This can't be undone.`} confirmLabel="Yes, email it" onConfirm={() => emailOne(a)} />
                    )}
                    <ConfirmButton danger busy={busy} label={<span className="flex items-center gap-2"><Trash2 className="w-4 h-4" aria-hidden="true" /> Delete</span>} confirmText={`Delete “${a.title}” from the site?`} confirmLabel="Yes, delete" onConfirm={() => remove(a)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <AnnouncementForm stats={stats} />

        {hasClickTracking && <AffiliateClicks />}
      </div>
    </div>
  );
}

function AnnouncementForm({ stats }) {
  const [form, setForm] = useState({ topic: 'newTraining', title: '', summary: '', path: '/learn' });
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const set = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setAsking(false); };
  const count = stats?.[form.topic] ?? 0;

  const submit = async (e) => {
    e.preventDefault();
    setNotice(null);
    if (!form.title.trim() || !form.summary.trim()) return setNotice({ tone: 'error', text: 'Add a title and a summary.' });
    if (!form.path.startsWith('/')) return setNotice({ tone: 'error', text: 'The link must be a page on this site, starting with /' });
    if (!asking) return setAsking(true);
    setBusy(true);
    const r = await sendAnnouncement(form);
    setBusy(false);
    setAsking(false);
    if (r.ok) {
      setNotice({ tone: 'success', text: 'Your announcement is being emailed.' });
      setForm({ topic: form.topic, title: '', summary: '', path: '/learn' });
    } else setNotice({ tone: 'error', text: r.error });
  };

  return (
    <Section icon={<Megaphone className="w-7 h-7 text-purple-600" aria-hidden="true" />} title="Announce new training or videos">
      <form onSubmit={submit} className="space-y-5" noValidate>
        <fieldset>
          <legend className="block text-base font-semibold text-slate-700 mb-2">Send to people who asked about</legend>
          <div className="grid sm:grid-cols-2 gap-3">
            {[['newTraining', 'New training lessons'], ['newVideos', 'New training videos']].map(([key, label]) => (
              <label key={key} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer ${form.topic === key ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                <input type="radio" name="topic" value={key} checked={form.topic === key} onChange={set('topic')} className="w-5 h-5 accent-blue-600" />
                <span className="text-lg font-semibold">{label} <span className="font-normal text-slate-600">({stats?.[key] ?? 0})</span></span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Title"><input value={form.title} onChange={set('title')} maxLength={120} /></Field>
        <Field label="Summary"><textarea rows={3} value={form.summary} onChange={set('summary')} maxLength={1000} /></Field>
        <Field label="Link to" hint="A page on this site, like /learn/phone"><input value={form.path} onChange={set('path')} /></Field>
        {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
        {asking && (
          <div role="alertdialog" aria-label="Confirm sending" className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50 text-lg">
            This emails <strong>{count}</strong> {count === 1 ? 'person' : 'people'}. Tap <strong>Send announcement</strong> again to go ahead.
          </div>
        )}
        <SubmitButton loading={busy} loadingText="Sending…"><Send className="w-5 h-5" aria-hidden="true" /> Send announcement</SubmitButton>
      </form>
    </Section>
  );
}

// Clicks on Security Toolbox product links over the last 30 days. Counts only: no
// information about who clicked. Use it to see which programs are worth joining.
function AffiliateClicks() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    clickStats(30).then(setData).catch(() => setFailed(true));
  }, []);
  return (
    <Section icon={<MousePointerClick className="w-7 h-7 text-green-700" aria-hidden="true" />} title="Product link clicks (last 30 days)">
      {failed ? (
        <Notice>We couldn't load the click counts.</Notice>
      ) : !data ? (
        <p className="text-lg text-slate-600">Loading…</p>
      ) : !data.products.length ? (
        <p className="text-lg text-slate-600">No clicks yet. Counts appear here as people use the Security Toolbox links.</p>
      ) : (
        <>
          <p className="text-lg text-slate-700 mb-4"><strong>{data.total}</strong> click{data.total === 1 ? '' : 's'} since {data.since}.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-lg">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th scope="col" className="py-2 pr-4">Product</th>
                  <th scope="col" className="py-2 pr-4">Clicks</th>
                  <th scope="col" className="py-2">Where</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((p) => (
                  <tr key={p.product} className="border-b border-slate-100 align-top">
                    <th scope="row" className="py-2 pr-4 font-semibold">{p.name}</th>
                    <td className="py-2 pr-4">{p.clicks}</td>
                    <td className="py-2 text-base text-slate-600">
                      {Object.entries(p.pages).sort((a, b) => b[1] - a[1]).map(([page, n]) => `${pageLabel(page)}: ${n}`).join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Section>
  );
}
