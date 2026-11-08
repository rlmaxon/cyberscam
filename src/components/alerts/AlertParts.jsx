import React from 'react';
import { Link } from 'react-router-dom';
import { Info, AlertTriangle, Siren, ExternalLink, ArrowRight, CheckCircle } from 'lucide-react';
import { SEVERITIES, detailLines, formatAlertDate } from '../../alerts/alertsApi.js';

// Severity is shown with an icon and a word, never by color alone.
const STYLE = {
  info: { Icon: Info, badge: 'bg-blue-100 text-blue-900 border-blue-300', bar: 'border-l-blue-600' },
  warning: { Icon: AlertTriangle, badge: 'bg-amber-100 text-amber-900 border-amber-300', bar: 'border-l-amber-500' },
  urgent: { Icon: Siren, badge: 'bg-red-100 text-red-900 border-red-300', bar: 'border-l-red-600' },
};

export function SeverityBadge({ severity }) {
  const s = STYLE[severity] ?? STYLE.info;
  const { Icon } = s;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-base font-bold ${s.badge}`}>
      <Icon className="w-5 h-5" aria-hidden="true" /> {SEVERITIES[severity]?.label ?? 'Heads up'}
    </span>
  );
}

// A short card for lists: date, severity, title, summary, and a "Read more" link.
export function AlertSummaryCard({ alert, headingLevel = 'h2' }) {
  const H = headingLevel;
  const s = STYLE[alert.severity] ?? STYLE.info;
  return (
    <article className={`bg-white rounded-2xl shadow border border-slate-200 border-l-8 ${s.bar} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <SeverityBadge severity={alert.severity} />
        <span className="text-base text-slate-600">{formatAlertDate(alert.publishedOn)}</span>
      </div>
      <H className="text-2xl font-bold text-slate-800 mb-2">{alert.title}</H>
      <p className="text-lg text-slate-700 mb-4">{alert.summary}</p>
      <Link
        to={`/alerts/${encodeURIComponent(alert.id)}`}
        className="inline-flex items-center gap-2 min-h-[48px] px-5 py-3 rounded-xl bg-slate-100 text-slate-800 text-lg font-semibold hover:bg-slate-200"
      >
        What to do <ArrowRight className="w-5 h-5" aria-hidden="true" />
        <span className="sr-only">about: {alert.title}</span>
      </Link>
    </article>
  );
}

// The whole alert: summary, "What to do" checklist, and where it came from.
export function AlertFull({ alert }) {
  const s = STYLE[alert.severity] ?? STYLE.info;
  const lines = detailLines(alert.details);
  return (
    <article className={`bg-white rounded-2xl shadow-lg border border-slate-200 border-l-8 ${s.bar} p-6 sm:p-8`}>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SeverityBadge severity={alert.severity} />
        <span className="text-lg text-slate-600">Posted {formatAlertDate(alert.publishedOn)}</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">{alert.title}</h1>
      <p className="text-xl text-slate-700 mb-6 leading-relaxed">{alert.summary}</p>
      {lines.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">What to do</h2>
          <ul className="space-y-3 mb-6">
            {lines.map((line) => (
              <li key={line} className="flex items-start gap-3 text-lg text-slate-800">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {alert.sourceName && (
        <p className="text-lg text-slate-600">
          Source:{' '}
          {alert.sourceUrl ? (
            <a href={alert.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline inline-flex items-center gap-1">
              {alert.sourceName} <ExternalLink className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : alert.sourceName}
        </p>
      )}
    </article>
  );
}

// A one-line strip pointing to the newest alert (home page, dashboard, Scam of the Week).
export function LatestAlertStrip({ alert, className = '' }) {
  if (!alert) return null;
  const s = STYLE[alert.severity] ?? STYLE.info;
  const { Icon } = s;
  return (
    <Link
      to={`/alerts/${encodeURIComponent(alert.id)}`}
      className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white border-2 border-slate-200 border-l-8 ${s.bar} shadow hover:shadow-md transition-shadow ${className}`}
    >
      <Icon className="w-8 h-8 flex-shrink-0 text-slate-700" aria-hidden="true" />
      <span className="flex-1 min-w-0">
        <span className="block text-base font-bold text-slate-600 uppercase tracking-wide">Latest scam alert · {SEVERITIES[alert.severity]?.label}</span>
        <span className="block text-lg sm:text-xl font-bold text-slate-800">{alert.title}</span>
      </span>
      <ArrowRight className="w-6 h-6 text-slate-500 flex-shrink-0" aria-hidden="true" />
    </Link>
  );
}
