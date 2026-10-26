import { hasDataBackend } from '../amplifyConfig.js';
import { emptyProgress, mergeProgress } from '../training/progress.js';

// Where progress is kept:
// - Always in this browser (so guests can learn without an account).
// - Also in the member's account when signed in, so it follows them to any device.

const LOCAL_KEY = 'scs-training-progress-v1';

export function loadLocalProgress() {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? { ...emptyProgress(), ...JSON.parse(raw) } : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function saveLocalProgress(progress) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(progress));
  } catch {
    // Private browsing or storage turned off: progress still lasts for this visit.
  }
}

export function clearLocalProgress() {
  try { window.localStorage.removeItem(LOCAL_KEY); } catch { /* ignore */ }
}

let clientPromise;
const api = () =>
  (clientPromise ??= import('aws-amplify/data').then(({ generateClient }) => generateClient({ authMode: 'userPool' })));

// AWSJSON fields arrive as strings; accept objects too.
const parse = (v) => {
  if (v == null) return null;
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return null; }
  }
  return v;
};

function fromRecord(r) {
  const extras = parse(r.extras) ?? {};
  return {
    modules: parse(r.modules) ?? {},
    finalExam: parse(r.finalExam),
    lastModuleKey: r.lastModuleKey ?? null,
    certificateId: r.certificateId ?? null,
    weekly: extras.weekly ?? {},
    familyPlan: extras.familyPlan ?? {},
    badgesSeen: extras.badgesSeen ?? null,
  };
}

function toFields(p) {
  return {
    modules: JSON.stringify(p.modules ?? {}),
    finalExam: p.finalExam ? JSON.stringify(p.finalExam) : null,
    lastModuleKey: p.lastModuleKey ?? null,
    certificateId: p.certificateId ?? null,
    extras: JSON.stringify({ weekly: p.weekly ?? {}, familyPlan: p.familyPlan ?? {}, badgesSeen: p.badgesSeen ?? null }),
  };
}

// Returns { record, progress } for the signed-in member, or null when there's no backend.
export async function loadAccountProgress() {
  if (!hasDataBackend) return null;
  const { data, errors } = await (await api()).models.TrainingProgress.list({ limit: 1 });
  if (errors?.length) throw new Error(errors[0].message);
  const record = data?.[0] ?? null;
  return { record, progress: record ? fromRecord(record) : null };
}

export async function saveAccountProgress(record, progress) {
  const client = await api();
  const fields = toFields(progress);
  const { data, errors } = record
    ? await client.models.TrainingProgress.update({ id: record.id, ...fields })
    : await client.models.TrainingProgress.create(fields);
  if (errors?.length) throw new Error(errors[0].message);
  return data;
}

export { mergeProgress };
