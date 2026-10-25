import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { signUp } from 'aws-amplify/auth';
import { PATHS } from '../../routes.js';
import { friendlyAuthError } from '../../member/authErrors.js';
import {
  AccountCard, TextField, PasswordField, PasswordRules, passwordMeetsRules, Notice, SubmitButton,
} from '../../components/account/FormParts.jsx';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return setError('Please enter your email address and choose a password.');
    if (!passwordMeetsRules(password)) return setError('Your password needs to meet all the requirements listed.');
    if (password !== confirm) return setError('The two passwords don\'t match. Please type them again.');

    setLoading(true);
    try {
      const { nextStep } = await signUp({
        username: cleanEmail,
        password,
        options: { userAttributes: { email: cleanEmail }, autoSignIn: true },
      });
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        navigate(PATHS.verifyEmail, { state: { email: cleanEmail, fromSignUp: true } });
      } else {
        navigate(PATHS.login, { state: { notice: 'Your account is ready. Please sign in.' } });
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountCard
      icon={<UserPlus className="w-10 h-10" />}
      title="Create Your Free Account"
      subtitle="Save your place in the training and get scam alerts by email."
      footer={
        <p className="mt-6 text-center text-lg text-slate-600">
          Already have an account?{' '}
          <Link to={PATHS.login} className="text-blue-700 font-semibold hover:underline">Sign in</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <TextField
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          autoComplete="email"
          hint="We'll send a 6-digit code here to confirm it's you."
        />
        <div className="space-y-3">
          <PasswordField label="Choose a password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <PasswordRules password={password} />
        </div>
        <PasswordField label="Type the password again" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

        {error && <Notice>{error}</Notice>}

        <SubmitButton loading={loading} loadingText="Creating your account…">
          <ShieldCheck className="w-5 h-5" /> Create Free Account
        </SubmitButton>

        <p className="text-base text-slate-500 text-center">
          We never sell your information. You can delete your account at any time.
        </p>
      </form>
    </AccountCard>
  );
}
