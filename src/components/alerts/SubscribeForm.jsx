import React, { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, MailCheck, Send, UserCircle } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { useMember } from '../../member/MemberContext.jsx';
import { hasEmailBackend } from '../../amplifyConfig.js';
import { subscribe, DEFAULT_TOPICS } from '../../alerts/emailApi.js';
import { TextField, Notice, SubmitButton } from '../account/FormParts.jsx';
import { NewsChoices, TextAlertsComingSoon } from './EmailChoices.jsx';

// "Get free scam alerts by email". No account needed. Nothing is sent until the person
// taps the link in the confirmation email (double opt-in).
export default function SubscribeForm({ compact = false, heading = 'Get free scam alerts by email' }) {
  const { isLoggedIn } = useMember();
  const [email, setEmail] = useState('');
  const [topics, setTopics] = useState(DEFAULT_TOPICS);
  const [website, setWebsite] = useState(''); // hidden: only bots fill this in
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');
  const headingId = useId();

  if (isLoggedIn) {
    return (
      <Box headingId={headingId} heading={heading}>
        <p className="text-lg text-slate-700 mb-4">You're signed in, so you can choose your emails on your profile. No confirmation needed.</p>
        <Link to={PATHS.profile} className="inline-flex items-center gap-2 min-h-[48px] px-5 py-3 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700">
          <UserCircle className="w-5 h-5" aria-hidden="true" /> Choose my emails
        </Link>
      </Box>
    );
  }

  if (sentTo) {
    return (
      <Box headingId={headingId} heading="Almost done! Check your email" icon={<MailCheck className="w-7 h-7" />}>
        <div role="status">
          <p className="text-lg text-slate-700 mb-3">
            We sent a message to <strong className="break-all">{sentTo}</strong>. Open it and tap <strong>“Yes, send me these emails.”</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1 text-lg text-slate-700 mb-4">
            <li>It comes from <strong>noreply@seniorcybersecurityedu.com</strong>.</li>
            <li>Don't see it in a few minutes? Check your spam or junk folder.</li>
            <li>We won't send anything else until you tap the link.</li>
          </ul>
          <button type="button" onClick={() => { setSentTo(''); setEmail(''); }} className="min-h-[48px] px-5 py-3 rounded-xl bg-slate-100 text-slate-800 text-lg font-semibold hover:bg-slate-200">
            Use a different email
          </button>
        </div>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError('Please enter your full email address, like name@example.com.');
    if (!Object.values(topics).some(Boolean)) return setError('Please choose at least one kind of email.');
    setLoading(true);
    const result = await subscribe(email.trim(), topics, website);
    setLoading(false);
    if (result.ok) setSentTo(email.trim());
    else setError(result.error);
  };

  return (
    <Box headingId={headingId} heading={heading}>
      {!compact && (
        <p className="text-lg text-slate-700 mb-4">
          Short, plain-language warnings about scams going around right now. Free, no account needed, and you can stop any time.
        </p>
      )}
      {!hasEmailBackend && <div className="mb-4"><Notice tone="info">Email sign-up is being set up and will open soon.</Notice></div>}
      <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-labelledby={headingId}>
        <TextField
          label="Your email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          maxLength={254}
        />
        <fieldset>
          <legend className="block text-base font-semibold text-slate-700 mb-3">Email me about:</legend>
          <div className="space-y-3">
            <NewsChoices topics={topics} onChange={setTopics} />
            {!compact && <TextAlertsComingSoon />}
          </div>
        </fieldset>
        {/* Bot trap: hidden from people and screen readers */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
          <label>Website <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
        </div>
        {error && <Notice>{error}</Notice>}
        <SubmitButton loading={loading} loadingText="Sending…" disabled={!hasEmailBackend || loading}>
          <Send className="w-5 h-5" aria-hidden="true" /> Sign me up
        </SubmitButton>
        <p className="text-base text-slate-600">
          We'll email you once to confirm. We never share or sell your address.
        </p>
      </form>
    </Box>
  );
}

function Box({ heading, headingId, icon, children }) {
  return (
    <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8" aria-labelledby={headingId}>
      <h2 id={headingId} className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
        <span className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">{icon ?? <Bell className="w-7 h-7" aria-hidden="true" />}</span>
        {heading}
      </h2>
      {children}
    </section>
  );
}
