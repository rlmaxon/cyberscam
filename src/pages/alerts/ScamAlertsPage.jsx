import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Phone, RefreshCw } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { useAlerts } from '../../alerts/alertsApi.js';
import { AlertSummaryCard, AlertFull } from '../../components/alerts/AlertParts.jsx';
import SubscribeForm from '../../components/alerts/SubscribeForm.jsx';

function HelpBox() {
  return (
    <aside className="bg-red-50 border-2 border-red-200 rounded-2xl p-6" aria-label="If you already sent money">
      <h2 className="text-xl font-bold text-red-900 mb-2">Already sent money or shared a password?</h2>
      <p className="text-lg text-red-900 mb-4">Call your bank right away, using the number on the back of your card. Then see our step-by-step help.</p>
      <Link to={PATHS.emergency} className="inline-flex items-center gap-2 min-h-[48px] px-5 py-3 rounded-xl bg-red-600 text-white text-lg font-bold hover:bg-red-700">
        <Phone className="w-5 h-5" aria-hidden="true" /> Get help now
      </Link>
    </aside>
  );
}

export default function ScamAlertsPage() {
  const { alertId } = useParams();
  const { loading, alerts } = useAlerts();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xl text-slate-600 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin" aria-hidden="true" /> Loading scam alerts…
      </div>
    );
  }

  if (alertId) {
    const alert = alerts.find((a) => a.id === alertId);
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Link to={PATHS.alerts} className="inline-flex items-center gap-2 min-h-[48px] text-lg font-semibold text-blue-700 hover:text-blue-900">
            <ArrowLeft className="w-5 h-5" aria-hidden="true" /> All scam alerts
          </Link>
          {alert ? (
            <AlertFull alert={alert} />
          ) : (
            <div className="bg-white rounded-2xl shadow border border-slate-200 p-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-3">We couldn't find that alert</h1>
              <p className="text-lg text-slate-700">It may have been removed. See all current alerts on the Scam Alerts page.</p>
            </div>
          )}
          <HelpBox />
          <SubscribeForm compact heading="Get alerts like this by email" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <p className="text-lg font-semibold text-red-700 flex items-center gap-2 mb-1"><ShieldAlert className="w-6 h-6" aria-hidden="true" /> Free scam warnings</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Scam Alerts</h1>
          <p className="text-xl text-slate-700 max-w-3xl">
            Scams that are going around right now, in plain language, with simple steps to stay safe. Based on warnings from the FTC, FBI, and other official sources.
          </p>
        </header>
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          <div className="space-y-6">
            {alerts.length ? (
              alerts.map((a) => <AlertSummaryCard key={a.id} alert={a} />)
            ) : (
              <p className="text-lg text-slate-700">No alerts right now. Check back soon.</p>
            )}
          </div>
          <div className="space-y-6 lg:sticky lg:top-28">
            <SubscribeForm compact />
            <HelpBox />
          </div>
        </div>
      </div>
    </div>
  );
}
