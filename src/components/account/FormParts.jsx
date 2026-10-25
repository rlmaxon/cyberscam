import React, { useId, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

// Shared building blocks for the account screens (sign up, verify, welcome, profile).
// Large text, big tap targets, and every input tied to its label for screen readers.

const inputClass =
  'w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg';

export function AccountCard({ icon, title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-white">
            {icon}
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{title}</h1>
          {subtitle && <p className="text-lg text-slate-600">{subtitle}</p>}
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">{children}</div>
        {footer}
      </div>
    </div>
  );
}

export function TextField({ label, hint, ...inputProps }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-base font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <input id={id} className={inputClass} {...inputProps} />
      {hint && <p className="text-base text-slate-500 mt-2">{hint}</p>}
    </div>
  );
}

export function PasswordField({ label, value, onChange, autoComplete = 'new-password', ...rest }) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-base font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`${inputClass} pr-14`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-700"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

// Matches the Cognito password policy in src/aws-exports.js
export const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'An uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'A lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
  { label: 'A number (0–9)', test: (p) => /[0-9]/.test(p) },
];

export const passwordMeetsRules = (p) => PASSWORD_RULES.every((r) => r.test(p));

export function PasswordRules({ password }) {
  return (
    <ul className="space-y-1" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li key={rule.label} className={`flex items-center gap-2 text-base ${ok ? 'text-green-700' : 'text-slate-500'}`}>
            {ok ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <span className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-slate-300" />}
            <span>
              {rule.label}
              <span className="sr-only">{ok ? ' (done)' : ' (not yet)'}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function Notice({ tone = 'error', children }) {
  const tones = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  const Icon = tone === 'success' ? CheckCircle : AlertCircle;
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`border rounded-xl p-4 text-base flex items-start gap-3 ${tones[tone]}`}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function SubmitButton({ loading, loadingText, children, ...rest }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg text-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      {...rest}
    >
      {loading ? (
        <>
          <RefreshCw className="w-5 h-5 animate-spin" /> {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
