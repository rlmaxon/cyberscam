import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bell, BellOff, RefreshCw, Save } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { getPreferences, updatePreferences, unsubscribe, NEWS_TOPICS, FAMILY_TOPICS } from '../../alerts/emailApi.js';
import { AccountCard, Notice, SubmitButton } from '../../components/account/FormParts.jsx';
import { NewsChoices, FamilyChoices, TextAlertsComingSoon } from '../../components/alerts/EmailChoices.jsx';

const ALL_TOPICS = [...NEWS_TOPICS, ...FAMILY_TOPICS];
const scopeLabel = (scope) => {
  const t = ALL_TOPICS.find((x) => x.key === scope);
  return t ? `“${t.label.toLowerCase()}” emails` : 'all emails from us';
};

// Opened from the links at the bottom of every email. The link's code is what lets
// someone change their choices, so no sign-in is needed.
export default function EmailPreferencesPage() {
  const [params] = useSearchParams();
  const token = params.get('t') ?? '';
  const askedScope = params.get('unsubscribe');
  const [prefs, setPrefs] = useState(null);
  const [topics, setTopics] = useState({});
  const [family, setFamily] = useState({});
  const [status, setStatus] = useState(token ? 'loading' : 'error');
  const [error, setError] = useState(token ? '' : 'This link is missing a code. Please use the link in one of our emails.');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [unsubDone, setUnsubDone] = useState(false);

  const apply = (p) => {
    setPrefs(p);
    setTopics(p.topics ?? {});
    setFamily(p.family ?? {});
  };

  useEffect(() => {
    if (!token) return;
    getPreferences(token).then((r) => {
      if (r.ok) { apply(r.prefs); setStatus('ready'); } else { setError(r.error); setStatus('error'); }
    });
  }, [token]);

  const doUnsubscribe = async (scope) => {
    setBusy(true);
    setMessage('');
    setError('');
    const r = await unsubscribe(token, scope);
    setBusy(false);
    if (r.ok) {
      apply(r.prefs);
      setUnsubDone(true);
      setMessage(`Done. You won't get ${scopeLabel(scope)} anymore.`);
    } else setError(r.error);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');
    const r = await updatePreferences(token, topics, family);
    setBusy(false);
    if (r.ok) { apply(r.prefs); setMessage('Your choices are saved.'); } else setError(r.error);
  };

  let body;
  if (status === 'loading') {
    body = <p className="text-lg text-slate-600 flex items-center gap-2"><RefreshCw className="w-5 h-5 animate-spin" aria-hidden="true" /> Loading your choices…</p>;
  } else if (status === 'error') {
    body = (
      <div className="space-y-4">
        <Notice>{error}</Notice>
        <Link to={PATHS.alerts} className="block text-center text-lg font-semibold text-blue-700 underline">Go to Scam Alerts</Link>
      </div>
    );
  } else {
    body = (
      <div className="space-y-8">
        {askedScope && !unsubDone && (
          <div className="p-5 rounded-xl bg-amber-50 border-2 border-amber-200">
            <p className="text-lg text-slate-800 mb-4">Stop {scopeLabel(askedScope)}?</p>
            <button
              type="button"
              onClick={() => doUnsubscribe(askedScope)}
              disabled={busy}
              className="w-full min-h-[56px] py-4 rounded-xl bg-slate-800 text-white text-lg font-bold hover:bg-slate-900 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <BellOff className="w-5 h-5" aria-hidden="true" /> Yes, stop these emails
            </button>
          </div>
        )}
        {message && <Notice tone="success">{message}</Notice>}
        {error && <Notice>{error}</Notice>}

        <form onSubmit={save} className="space-y-6" noValidate>
          <fieldset>
            <legend className="text-xl font-bold text-slate-800 mb-3">Scam-safety emails</legend>
            <div className="space-y-3">
              <NewsChoices topics={topics} onChange={setTopics} />
              <TextAlertsComingSoon />
            </div>
          </fieldset>
          {prefs?.isMember && (
            <fieldset>
              <legend className="text-xl font-bold text-slate-800 mb-3">Family Circle emails</legend>
              <FamilyChoices family={family} onChange={setFamily} />
            </fieldset>
          )}
          <SubmitButton loading={busy} loadingText="Saving…">
            <Save className="w-5 h-5" aria-hidden="true" /> Save my choices
          </SubmitButton>
        </form>

        {prefs?.status !== 'unsubscribed' && (
          <button
            type="button"
            onClick={() => doUnsubscribe('all')}
            disabled={busy}
            className="w-full min-h-[48px] py-3 rounded-xl border-2 border-slate-300 text-slate-700 text-lg font-semibold hover:bg-slate-100 disabled:opacity-60"
          >
            Unsubscribe from all emails
          </button>
        )}
      </div>
    );
  }

  return (
    <AccountCard
      icon={<Bell className="w-10 h-10" aria-hidden="true" />}
      title="Your Email Choices"
      subtitle={prefs?.email ? `For ${prefs.email}` : 'Choose which emails you get from us.'}
    >
      {body}
    </AccountCard>
  );
}
