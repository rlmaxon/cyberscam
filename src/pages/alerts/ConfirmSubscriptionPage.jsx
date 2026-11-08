import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MailCheck, CheckCircle } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { confirmSubscription } from '../../alerts/emailApi.js';
import { AccountCard, Notice } from '../../components/account/FormParts.jsx';

// Opened from the confirmation email. The person taps a button to confirm, rather than
// confirming as soon as the page opens, so email security scanners that open every link
// can't sign people up by accident.
export default function ConfirmSubscriptionPage() {
  const [params] = useSearchParams();
  const token = params.get('t') ?? '';
  const [state, setState] = useState({ status: 'ready', error: '' });

  const confirm = async () => {
    setState({ status: 'loading', error: '' });
    const result = await confirmSubscription(token);
    setState(result.ok ? { status: 'done', error: '' } : { status: 'ready', error: result.error });
  };

  return (
    <AccountCard
      icon={<MailCheck className="w-10 h-10" aria-hidden="true" />}
      title={state.status === 'done' ? "You're all set!" : 'Confirm your email'}
      subtitle={state.status === 'done' ? 'Thank you for signing up.' : 'One tap and you\'re signed up.'}
    >
      {state.status === 'done' ? (
        <div className="space-y-5">
          <Notice tone="success">You'll now get the emails you chose. Every email has a link to change your choices or stop them.</Notice>
          <Link to={PATHS.alerts} className="flex items-center justify-center w-full min-h-[56px] px-5 py-4 rounded-xl bg-blue-600 text-white text-lg font-bold hover:bg-blue-700">
            See the latest scam alerts
          </Link>
          <Link to={PATHS.learn} className="flex items-center justify-center w-full min-h-[56px] px-5 py-4 rounded-xl bg-slate-100 text-slate-800 text-lg font-semibold hover:bg-slate-200">
            Start the free training
          </Link>
        </div>
      ) : !token ? (
        <Notice>This link is missing a code. Please tap the button in your confirmation email again.</Notice>
      ) : (
        <div className="space-y-5">
          <p className="text-lg text-slate-700">Tap the button below to start getting free scam-safety emails from Senior Cyber Secure.</p>
          {state.error && <Notice>{state.error}</Notice>}
          <button
            type="button"
            onClick={confirm}
            disabled={state.status === 'loading'}
            className="w-full min-h-[56px] py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg text-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" aria-hidden="true" /> {state.status === 'loading' ? 'Confirming…' : 'Yes, send me these emails'}
          </button>
          <p className="text-base text-slate-600">Didn't sign up? You can close this page. Nothing will be sent.</p>
        </div>
      )}
    </AccountCard>
  );
}
