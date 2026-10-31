import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { PATHS } from '../../routes.js';
import SubscribeForm from '../../components/alerts/SubscribeForm.jsx';

// A page of its own for the email sign-up, so it can be linked from anywhere.
export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 py-12 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Free Scam Alerts by Email</h1>
          <p className="text-xl text-slate-700">Know about new scams before they reach you or someone you love.</p>
        </header>
        <SubscribeForm heading="Sign up in one step" />
        <p className="text-center text-lg">
          <Link to={PATHS.alerts} className="inline-flex items-center gap-2 font-semibold text-blue-700 underline min-h-[48px]">
            <ShieldAlert className="w-5 h-5" aria-hidden="true" /> See the latest alerts first
          </Link>
        </p>
      </div>
    </div>
  );
}
