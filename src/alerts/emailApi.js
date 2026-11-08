import { hasEmailBackend } from '../amplifyConfig.js';

// Email sign-up and preferences. The backend (amplify/functions/mailer) does the work;
// these are thin wrappers that turn its replies into { ok, prefs } or { ok: false, error }.
//
// Visitors use the site's public API key. Signed-in members use their own sign-in, so
// the backend knows which (verified) email address is theirs.

let publicClient;
let memberClient;
const publicApi = () =>
  (publicClient ??= import('aws-amplify/data').then(({ generateClient }) => generateClient({ authMode: 'apiKey' })));
const memberApi = () =>
  (memberClient ??= import('aws-amplify/data').then(({ generateClient }) => generateClient({ authMode: 'userPool' })));

export const NEWS_TOPICS = [
  { key: 'scamAlerts', label: 'Scam alerts', hint: 'Recommended. Short warnings about scams going around right now.' },
  { key: 'newTraining', label: 'New training lessons', hint: 'When we add a new lesson or update one.' },
  { key: 'newVideos', label: 'New training videos', hint: 'When a new video is posted.' },
];

export const FAMILY_TOPICS = [
  { key: 'cheers', label: 'When family send me a cheer', hint: 'For people learning. You can always see cheers on your dashboard.' },
  { key: 'familyUpdates', label: 'When someone I follow earns a badge', hint: 'For family members following someone in their Family Circle.' },
];

export const DEFAULT_TOPICS = { scamAlerts: true, newTraining: false, newVideos: false };
export const DEFAULT_FAMILY = { cheers: true, familyUpdates: true };

const UNAVAILABLE = { ok: false, error: 'Email sign-up is being set up and will be available soon.', code: 'UNAVAILABLE' };
const NETWORK = { ok: false, error: "We couldn't reach our server. Please check your internet connection and try again.", code: 'NETWORK' };

const parse = (v) => {
  if (typeof v !== 'string') return v ?? null;
  try { return JSON.parse(v); } catch { return null; }
};

async function call(client, kind, name, args) {
  if (!hasEmailBackend) return UNAVAILABLE;
  try {
    const api = await client();
    const { data, errors } = await api[kind][name](args);
    const result = parse(data);
    if (result && typeof result.ok === 'boolean') return result;
    if (errors?.length) return { ok: false, error: 'Something went wrong. Please try again in a few minutes.', code: 'SERVER' };
    return { ok: false, error: 'Something went wrong. Please try again in a few minutes.', code: 'SERVER' };
  } catch {
    return NETWORK;
  }
}

// ---- Visitors (no account needed) ----

export const subscribe = (email, topics, website = '') =>
  call(publicApi, 'mutations', 'subscribeToEmails', { email, topics: JSON.stringify(topics), website });

export const confirmSubscription = (token) =>
  call(publicApi, 'mutations', 'confirmEmailSubscription', { token });

export const getPreferences = (token) =>
  call(publicApi, 'queries', 'getEmailPreferences', { token });

export const updatePreferences = (token, topics, family) =>
  call(publicApi, 'mutations', 'updateEmailPreferences', { token, topics: JSON.stringify(topics), family: JSON.stringify(family) });

export const unsubscribe = (token, scope = 'all') =>
  call(publicApi, 'mutations', 'unsubscribeEmail', { token, scope });

// ---- Signed-in members ----

export const getMyPreferences = () => call(memberApi, 'queries', 'getMyEmailPreferences', {});

export const updateMyPreferences = (topics, family) =>
  call(memberApi, 'mutations', 'updateMyEmailPreferences', { topics: JSON.stringify(topics), family: JSON.stringify(family) });

// ---- Admins ----

export const emailAlertToSubscribers = (alertId) => call(memberApi, 'mutations', 'emailScamAlert', { alertId });

export const sendAnnouncement = ({ topic, title, summary, path }) =>
  call(memberApi, 'mutations', 'sendEmailAnnouncement', { topic, title, summary, path });

export const getSubscriberStats = () => call(memberApi, 'queries', 'getSubscriberStats', {});
