import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MailCheck, CheckCircle } from 'lucide-react';
import { confirmSignUp, autoSignIn, resendSignUpCode } from 'aws-amplify/auth';
import { PATHS } from '../../routes.js';
import { friendlyAuthError } from '../../member/authErrors.js';
import { AccountCard, TextField, Notice, SubmitButton } from '../../components/account/FormParts.jsx';

export default function VerifyEmailPage({ onSignedIn }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState(state?.email ?? '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(state?.notice ?? '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanCode = code.replace(/\s/g, '');
    if (!email.trim()) return setError('Please enter the email address you signed up with.');
    if (!/^\d{6}$/.test(cleanCode)) return setError('Please enter the 6-digit code from the email.');

    setLoading(true);
    try {
      const { nextStep } = await confirmSignUp({ username: email.trim().toLowerCase(), confirmationCode: cleanCode });
      if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
        try {
          const { isSignedIn } = await autoSignIn();
          if (isSignedIn) return onSignedIn();
        } catch (_) {
          // Fall through to the sign-in page below
        }
      }
      navigate(PATHS.login, { state: { notice: 'Your email is confirmed. Please sign in to continue.', email: email.trim() } });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setNotice('');
    if (!email.trim()) return setError('Please enter your email address first.');
    try {
      await resendSignUpCode({ username: email.trim().toLowerCase() });
      setNotice('A new code is on its way. It can take a minute or two — check your spam folder too.');
    } catch (err) {
      setError(friendlyAuthError(err));
    }
  };

  return (
    <AccountCard
      icon={<MailCheck className="w-10 h-10" />}
      title="Check Your Email"
      subtitle={state?.email ? `We sent a 6-digit code to ${state.email}.` : 'Enter the 6-digit code we emailed you.'}
      footer={
        <p className="mt-6 text-center text-lg text-slate-600">
          <Link to={PATHS.signup} className="text-blue-700 font-semibold hover:underline">Use a different email</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {!state?.email && (
          <TextField label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        )}
        <TextField
          label="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          maxLength={8}
          hint="The email comes from no-reply@verificationemail.com. Check your spam folder if you don't see it."
        />

        {notice && <Notice tone="info">{notice}</Notice>}
        {error && <Notice>{error}</Notice>}

        <SubmitButton loading={loading} loadingText="Checking your code…">
          <CheckCircle className="w-5 h-5" /> Confirm My Email
        </SubmitButton>

        <button type="button" onClick={handleResend} className="w-full py-3 text-lg text-blue-700 font-semibold hover:underline">
          Send a new code
        </button>
      </form>
    </AccountCard>
  );
}
