import { useEffect, useState } from 'react';
import { hasEmailBackend } from '../amplifyConfig.js';
import { listAll } from '../member/listAll.js';

// Scam Alerts come from two places:
// - starter alerts in public/training-data/alerts.json (edited with a commit)
// - alerts posted by admins on /admin (stored in the ScamAlert table)
// Both are shown together, newest first.

let publicClient;
let adminClient;
const publicApi = () =>
  (publicClient ??= import('aws-amplify/data').then(({ generateClient }) => generateClient({ authMode: 'apiKey' })));
const adminApi = () =>
  (adminClient ??= import('aws-amplify/data').then(({ generateClient }) => generateClient({ authMode: 'userPool' })));

export const SEVERITIES = {
  info: { label: 'Heads up', description: 'Good to know' },
  warning: { label: 'Warning', description: 'A scam going around now' },
  urgent: { label: 'Urgent', description: 'Costly and spreading fast' },
};

const FIELDS = ['id', 'title', 'summary', 'details', 'severity', 'publishedOn', 'sourceName', 'sourceUrl', 'emailStatus', 'emailedAt', 'emailCount', 'createdAt'];

const byNewest = (a, b) => (b.publishedOn ?? '').localeCompare(a.publishedOn ?? '') || (b.createdAt ?? '').localeCompare(a.createdAt ?? '');

let starterPromise;
function loadStarters() {
  starterPromise ??= fetch('/training-data/alerts.json')
    .then((r) => (r.ok ? r.json() : { alerts: [] }))
    .then((d) => (d.alerts ?? []).map((a) => ({ ...a, starter: true })))
    .catch(() => { starterPromise = null; return []; });
  return starterPromise;
}

async function loadPosted() {
  if (!hasEmailBackend) return [];
  const client = await publicApi();
  return listAll(client.models.ScamAlert, { selectionSet: FIELDS });
}

let cache = null;
export async function loadAlerts({ fresh = false } = {}) {
  if (cache && !fresh) return cache;
  const [starters, posted] = await Promise.all([loadStarters(), loadPosted().catch(() => [])]);
  cache = [...posted, ...starters].sort(byNewest);
  return cache;
}

export function useAlerts() {
  const [state, setState] = useState({ loading: !cache, alerts: cache ?? [], error: false });
  useEffect(() => {
    let cancelled = false;
    loadAlerts()
      .then((alerts) => !cancelled && setState({ loading: false, alerts, error: false }))
      .catch(() => !cancelled && setState((s) => ({ ...s, loading: false, error: true })));
    return () => { cancelled = true; };
  }, []);
  return state;
}

// "What to do" lines: one per line, with or without a leading dash.
export const detailLines = (details) =>
  String(details ?? '').split(/\n+/).map((l) => l.replace(/^\s*[-*•]\s*/, '').trim()).filter(Boolean);

export function formatAlertDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ---- Admins ----

const check = ({ data, errors }) => {
  if (errors?.length) throw new Error(errors[0].message);
  return data;
};

export async function listAlertsForAdmin() {
  const client = await adminApi();
  return (await listAll(client.models.ScamAlert, { selectionSet: FIELDS })).sort(byNewest);
}

export async function saveAlert(fields) {
  const client = await adminApi();
  const input = {
    title: fields.title.trim(),
    summary: fields.summary.trim(),
    details: fields.details?.trim() || null,
    severity: fields.severity,
    publishedOn: fields.publishedOn,
    sourceName: fields.sourceName?.trim() || null,
    sourceUrl: fields.sourceUrl?.trim() || null,
  };
  const saved = fields.id
    ? check(await client.models.ScamAlert.update({ id: fields.id, ...input }))
    : check(await client.models.ScamAlert.create(input));
  cache = null;
  return saved;
}

export async function deleteAlert(id) {
  const client = await adminApi();
  check(await client.models.ScamAlert.delete({ id }));
  cache = null;
}
