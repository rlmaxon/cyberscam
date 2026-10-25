import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import { useGo, PATHS } from '../routes.js';
import { Notice } from '../components/account/FormParts.jsx';

export default function LoginPage({ handleLogin, handleForgotPassword }) {
  const go = useGo();
  const { state } = useLocation();
  const [email, setEmail] = useState(state?.email ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email address and password.');
      return;
    }
    await handleLogin(email, password, setLoading, setError);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Member Sign In</h1>
          <p className="text-lg text-slate-600">Welcome back. Sign in to see your dashboard.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {state?.notice && <Notice tone="success">{state.notice}</Notice>}
            <div>
              <label htmlFor="login-email" className="block text-base font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="block text-base font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => go('forgotPassword')}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
                  <RefreshCw className="w-5 h-5 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-lg text-slate-700 mb-4">New here?</p>
            <Link
              to={PATHS.signup}
              className="w-full py-4 bg-white border-2 border-blue-600 text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors text-lg flex items-center justify-center"
            >
              Create a Free Account
            </Link>
            <p className="text-center text-base text-slate-500 mt-4">
              You don't need an account for the training or emergency help.{' '}
              <button type="button" onClick={() => go('training')} className="text-blue-700 font-medium hover:underline">
                Start free training
              </button>
            </p>
          </div>
        </div>

        <button
          onClick={() => go('landing')}
          className="mt-6 text-slate-500 hover:text-slate-700 flex items-center justify-center gap-2 mx-auto"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
