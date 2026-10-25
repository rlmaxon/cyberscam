import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle, Key, RefreshCw } from 'lucide-react';
import { PasswordRules, passwordMeetsRules } from '../components/account/FormParts.jsx';
import { useGo } from '../routes.js';

export default function ResetPasswordPage({ handleResetPassword, email }) {
  const go = useGo();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code) {
      setError('Please enter the verification code from your email.');
      return;
    }
    if (!passwordMeetsRules(newPassword)) {
      setError('Your new password needs to meet all the requirements listed.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }
    await handleResetPassword(code, newPassword, setLoading, setError);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Key className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Reset Your Password</h1>
          <p className="text-slate-600">
            Enter the code we sent to <span className="font-semibold text-slate-800">{email}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Check your email</strong> for a 6-digit verification code. It may take a minute to arrive. Check your spam folder if you don't see it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg text-center tracking-widest font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create a new password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-3"><PasswordRules password={newPassword} /></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg text-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Resetting Password…
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" /> Reset Password
                </>
              )}
            </button>
          </form>
        </div>

        <button
          onClick={() => go('login')}
          className="mt-6 text-slate-500 hover:text-slate-700 flex items-center justify-center gap-2 mx-auto"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}
