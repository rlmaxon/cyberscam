/**
 * Email subscriptions and sending, written without any AWS code so it can be tested
 * on its own. The Lambda handlers (api.ts, worker.ts, oneClick.ts) pass in the real
 * DynamoDB, SES, Cognito and Lambda calls through `Deps`.
 *
 * One Subscriber record per email address. Its ID is a hash of the address, so the
 * same person signing up twice (or signing up and also having an account) shares one
 * record and one set of choices.
 *
 * Newsletter topics (scam alerts, new training, new videos) need double opt-in: nothing
 * is sent until the person taps the link in the confirmation email. Members who verified
 * their email with their account skip that step. Family Circle emails (cheers, and
 * badges earned by someone they follow) go only to members, are on by default because the
 * member chose to take part, and can be turned off in one click.
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import {
  renderEmail,
  type EmailContent,
  alertEmail,
  announcementEmail,
  confirmEmail,
  cheerEmail,
  familyProgressEmail,
} from './emails';

// ---------- Types ----------

export const NEWS_TOPICS = ['scamAlerts', 'newTraining', 'newVideos'] as const;
export const FAMILY_TOPICS = ['familyUpdates', 'cheers'] as const;
export type NewsTopic = (typeof NEWS_TOPICS)[number];
export type FamilyTopic = (typeof FAMILY_TOPICS)[number];
export type Topic = NewsTopic | FamilyTopic;

export type Topics = Record<NewsTopic, boolean>;
export type FamilyPrefs = Record<FamilyTopic, boolean>;

export interface Subscriber {
  id: string;
  email: string;
  // pending: signed up, not confirmed yet. active: confirmed (or a verified member).
  // unsubscribed: turned everything off.
  status: 'pending' | 'active' | 'unsubscribed';
  topics: Topics;
  family: FamilyPrefs;
  // Choices waiting for the confirmation link to be tapped
  pendingTopics?: Partial<Topics> | null;
  // Only email today. Text messages will be added as another channel later.
  channels: string[];
  token: string;
  memberSub?: string | null;
  source: 'form' | 'member' | 'family';
  confirmSentAt?: string | null;
  confirmSendsDay?: string | null;
  confirmSends?: number;
  confirmedAt?: string | null;
  unsubscribedAt?: string | null;
  lastCheerEmailAt?: string | null;
  createdAt: string;
  updatedAt: string;
  __typename: 'Subscriber';
}

export interface ScamAlertRecord {
  id: string;
  title: string;
  summary: string;
  details?: string | null;
  severity: 'info' | 'warning' | 'urgent';
  publishedOn: string;
  sourceName?: string | null;
  sourceUrl?: string | null;
  emailStatus?: string | null;
  emailedAt?: string | null;
  emailCount?: number | null;
}

export interface Identity {
  sub?: string;
  username?: string;
  groups?: string[] | null;
  claims?: Record<string, unknown>;
}

export interface Deps {
  getSubscriber(id: string): Promise<Subscriber | null>;
  putSubscriber(rec: Subscriber): Promise<void>;
  // Every subscriber; the worker filters. Fine for thousands of records.
  scanSubscribers(): Promise<Subscriber[]>;
  getAlert(id: string): Promise<ScamAlertRecord | null>;
  updateAlert(id: string, fields: Partial<ScamAlertRecord>): Promise<void>;
  // Shares owned by a member (normally zero or one)
  findSharesByOwner(owner: string): Promise<Array<Record<string, unknown>>>;
  // A member's email from Cognito, by their sub. null if not found.
  getMemberEmail(sub: string): Promise<{ email: string; verified: boolean } | null>;
  sendEmail(to: string, content: EmailContent, headers?: Array<{ name: string; value: string }>): Promise<void>;
  invokeWorker(payload: unknown): Promise<void>;
  randomToken(): string;
  now(): Date;
  sleep(ms: number): Promise<void>;
  log(message: string, data?: Record<string, unknown>): void;
  env: {
    siteUrl: string;
    oneClickUrl?: string;
    mailingAddress?: string;
  };
}

export type Result = { ok: true; [key: string]: unknown } | { ok: false; error: string; code?: string };

const fail = (error: string, code?: string): Result => ({ ok: false, error, code });

// ---------- Helpers ----------

const NO_TOPICS: Topics = { scamAlerts: false, newTraining: false, newVideos: false };
const DEFAULT_FAMILY: FamilyPrefs = { familyUpdates: true, cheers: true };

// A confirmation email can be re-sent after this long, and at most this many times a day.
const RESEND_AFTER_MS = 10 * 60 * 1000;
const MAX_CONFIRM_SENDS_PER_DAY = 5;
const CONFIRM_LINK_DAYS = 7;
// At most one "you got a cheer" email per member in this window (cheers still show on the site).
const CHEER_EMAIL_GAP_MS = 2 * 60 * 60 * 1000;

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const subscriberId = (email: string) => createHash('sha256').update(normalizeEmail(email)).digest('hex');
export const isValidEmail = (email: unknown): email is string =>
  typeof email === 'string' && email.trim().length <= 254 && EMAIL_RE.test(email.trim());

// Member IDs are stored as "<sub>::<username>" by the data API.
export const subOf = (memberId: string) => String(memberId ?? '').split('::')[0];

export function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try { return JSON.parse(value) as T; } catch { return fallback; }
  }
  return value as T;
}

function cleanTopics(input: unknown, base: Topics = NO_TOPICS): Topics {
  const raw = parseJson<Record<string, unknown>>(input, {});
  const out = { ...base };
  for (const t of NEWS_TOPICS) if (typeof raw?.[t] === 'boolean') out[t] = raw[t] as boolean;
  return out;
}

function cleanFamily(input: unknown, base: FamilyPrefs = DEFAULT_FAMILY): FamilyPrefs {
  const raw = parseJson<Record<string, unknown>>(input, {});
  const out = { ...base };
  for (const t of FAMILY_TOPICS) if (typeof raw?.[t] === 'boolean') out[t] = raw[t] as boolean;
  return out;
}

const anyOn = (t: Partial<Record<string, boolean>>) => Object.values(t ?? {}).some(Boolean);

// Links in emails carry "<subscriber id>.<secret>". The secret never leaves the record
// except inside emails sent to that address.
export const linkToken = (rec: Pick<Subscriber, 'id' | 'token'>) => `${rec.id}.${rec.token}`;

function splitToken(value: unknown): { id: string; secret: string } | null {
  if (typeof value !== 'string') return null;
  const [id, secret, extra] = value.trim().split('.');
  if (!id || !secret || extra !== undefined || !/^[a-f0-9]{64}$/.test(id) || secret.length > 128) return null;
  return { id, secret };
}

function sameSecret(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function maskEmail(email: string) {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const shown = user.length <= 2 ? user[0] : `${user.slice(0, 2)}`;
  return `${shown}${'•'.repeat(Math.max(1, Math.min(6, user.length - shown.length)))}@${domain}`;
}

function publicPrefs(rec: Subscriber | null, extra: Record<string, unknown> = {}) {
  return {
    email: rec ? maskEmail(rec.email) : null,
    status: rec?.status ?? 'none',
    topics: rec?.topics ?? { ...NO_TOPICS },
    family: rec?.family ?? { ...DEFAULT_FAMILY },
    isMember: !!rec?.memberSub,
    textAlerts: 'coming-soon',
    ...extra,
  };
}

function newRecord(deps: Deps, email: string, fields: Partial<Subscriber>): Subscriber {
  const now = deps.now().toISOString();
  return {
    id: subscriberId(email),
    email: normalizeEmail(email),
    status: 'pending',
    topics: { ...NO_TOPICS },
    family: { ...DEFAULT_FAMILY },
    pendingTopics: null,
    channels: ['email'],
    token: deps.randomToken(),
    memberSub: null,
    source: 'form',
    confirmSends: 0,
    createdAt: now,
    updatedAt: now,
    __typename: 'Subscriber',
    ...fields,
  };
}

async function loadByToken(deps: Deps, token: unknown): Promise<Subscriber | null> {
  const parts = splitToken(token);
  if (!parts) return null;
  const rec = await deps.getSubscriber(parts.id);
  if (!rec || !sameSecret(rec.token, parts.secret)) return null;
  return rec;
}

async function save(deps: Deps, rec: Subscriber) {
  rec.updatedAt = deps.now().toISOString();
  if (rec.status !== 'pending') rec.status = anyOn(rec.topics) || anyOn(rec.family) ? 'active' : 'unsubscribed';
  if (rec.status === 'unsubscribed' && !rec.unsubscribedAt) rec.unsubscribedAt = rec.updatedAt;
  if (rec.status === 'active') rec.unsubscribedAt = null;
  await deps.putSubscriber(rec);
}

const BAD_LINK = 'This link is not valid. It may be from an old email. Please use the link in your most recent email.';

// ---------- Public: sign-up form (no account needed) ----------

export async function subscribe(deps: Deps, args: { email?: unknown; topics?: unknown; website?: unknown }): Promise<Result> {
  // "website" is a hidden field people never see. Bots fill it in; we quietly ignore them.
  if (typeof args.website === 'string' && args.website.trim()) return { ok: true };
  if (!isValidEmail(args.email)) return fail('Please enter your full email address, like name@example.com.', 'BAD_EMAIL');
  const wanted = cleanTopics(args.topics);
  if (!anyOn(wanted)) return fail('Please choose at least one kind of email.', 'NO_TOPICS');

  const email = normalizeEmail(args.email);
  const now = deps.now();
  const today = now.toISOString().slice(0, 10);
  const rec = (await deps.getSubscriber(subscriberId(email))) ?? newRecord(deps, email, { source: 'form' });

  // Already receiving everything they asked for: nothing to confirm.
  if (rec.status === 'active' && NEWS_TOPICS.every((t) => !wanted[t] || rec.topics[t])) {
    return { ok: true };
  }

  // Remember what they asked for. It only takes effect once they tap the link.
  const pending = { ...(rec.pendingTopics ?? {}) } as Partial<Topics>;
  for (const t of NEWS_TOPICS) if (wanted[t]) pending[t] = true;
  rec.pendingTopics = pending;

  const sentRecently = rec.confirmSentAt && now.getTime() - new Date(rec.confirmSentAt).getTime() < RESEND_AFTER_MS;
  const sendsToday = rec.confirmSendsDay === today ? rec.confirmSends ?? 0 : 0;
  // Same answer either way, so the form can't be used to find out who has signed up.
  if (sentRecently || sendsToday >= MAX_CONFIRM_SENDS_PER_DAY) {
    await save(deps, rec);
    deps.log('confirmation not re-sent', { reason: sentRecently ? 'recent' : 'daily-limit' });
    return { ok: true };
  }

  rec.confirmSentAt = now.toISOString();
  rec.confirmSendsDay = today;
  rec.confirmSends = sendsToday + 1;
  await save(deps, rec);
  const url = `${deps.env.siteUrl}/subscribe/confirm?t=${encodeURIComponent(linkToken(rec))}`;
  await deps.sendEmail(rec.email, renderEmail(confirmEmail({ confirmUrl: url, topics: pending, siteUrl: deps.env.siteUrl, mailingAddress: deps.env.mailingAddress })));
  return { ok: true };
}

export async function confirmSubscription(deps: Deps, args: { token?: unknown }): Promise<Result> {
  const rec = await loadByToken(deps, args.token);
  if (!rec) return fail(BAD_LINK, 'BAD_LINK');
  if (!rec.pendingTopics || !anyOn(rec.pendingTopics)) {
    if (rec.status === 'active' && anyOn(rec.topics)) return { ok: true, prefs: publicPrefs(rec, { already: true }) };
    return fail('There is nothing waiting to be confirmed. You can sign up again on the Scam Alerts page.', 'NOTHING_PENDING');
  }
  const sentAt = rec.confirmSentAt ? new Date(rec.confirmSentAt).getTime() : 0;
  if (deps.now().getTime() - sentAt > CONFIRM_LINK_DAYS * 24 * 60 * 60 * 1000) {
    return fail('This link has expired. Please sign up again and we will send you a new one.', 'EXPIRED');
  }
  for (const t of NEWS_TOPICS) if (rec.pendingTopics[t]) rec.topics[t] = true;
  rec.pendingTopics = null;
  rec.status = 'active';
  rec.confirmedAt = deps.now().toISOString();
  await save(deps, rec);
  return { ok: true, prefs: publicPrefs(rec) };
}

// ---------- Public: links in emails ----------

export async function getPreferencesByToken(deps: Deps, args: { token?: unknown }): Promise<Result> {
  const rec = await loadByToken(deps, args.token);
  if (!rec) return fail(BAD_LINK, 'BAD_LINK');
  return { ok: true, prefs: publicPrefs(rec) };
}

export async function updatePreferencesByToken(deps: Deps, args: { token?: unknown; topics?: unknown; family?: unknown }): Promise<Result> {
  const rec = await loadByToken(deps, args.token);
  if (!rec) return fail(BAD_LINK, 'BAD_LINK');
  rec.topics = cleanTopics(args.topics, rec.topics);
  rec.family = cleanFamily(args.family, rec.family);
  // Holding a link from one of our emails proves they own the address.
  if (rec.status === 'pending') rec.status = 'active';
  rec.pendingTopics = null;
  await save(deps, rec);
  return { ok: true, prefs: publicPrefs(rec) };
}

// scope: 'all', or one topic
export async function unsubscribe(deps: Deps, args: { token?: unknown; scope?: unknown }): Promise<Result> {
  const rec = await loadByToken(deps, args.token);
  if (!rec) return fail(BAD_LINK, 'BAD_LINK');
  const scope = typeof args.scope === 'string' ? args.scope : 'all';
  if ((NEWS_TOPICS as readonly string[]).includes(scope)) {
    rec.topics[scope as NewsTopic] = false;
  } else if ((FAMILY_TOPICS as readonly string[]).includes(scope)) {
    rec.family[scope as FamilyTopic] = false;
  } else {
    rec.topics = { ...NO_TOPICS };
    rec.family = { familyUpdates: false, cheers: false };
  }
  rec.pendingTopics = null;
  if (rec.status === 'pending') rec.status = 'unsubscribed';
  await save(deps, rec);
  deps.log('unsubscribed', { scope: (NEWS_TOPICS as readonly string[]).includes(scope) || (FAMILY_TOPICS as readonly string[]).includes(scope) ? scope : 'all' });
  return { ok: true, prefs: publicPrefs(rec) };
}

// ---------- Signed-in members ----------

async function memberEmail(deps: Deps, identity: Identity | null | undefined) {
  if (!identity?.sub) return null;
  return deps.getMemberEmail(identity.sub);
}

export async function getMyPreferences(deps: Deps, identity: Identity | null | undefined): Promise<Result> {
  const found = await memberEmail(deps, identity);
  if (!found) return fail('Please sign in again.', 'NO_MEMBER');
  const rec = await deps.getSubscriber(subscriberId(found.email));
  return { ok: true, prefs: rec ? publicPrefs(rec) : null };
}

export async function updateMyPreferences(
  deps: Deps,
  identity: Identity | null | undefined,
  args: { topics?: unknown; family?: unknown },
): Promise<Result> {
  const found = await memberEmail(deps, identity);
  if (!found) return fail('Please sign in again.', 'NO_MEMBER');
  if (!found.verified) return fail('Please confirm your email address first.', 'NOT_VERIFIED');
  const id = subscriberId(found.email);
  const rec = (await deps.getSubscriber(id)) ?? newRecord(deps, found.email, { source: 'member', status: 'active' });
  rec.topics = cleanTopics(args.topics, rec.topics);
  rec.family = cleanFamily(args.family, rec.family);
  rec.pendingTopics = null;
  rec.memberSub = identity!.sub!;
  if (rec.status === 'pending') {
    rec.status = 'active';
    rec.confirmedAt = deps.now().toISOString();
  }
  await save(deps, rec);
  return { ok: true, prefs: publicPrefs(rec) };
}

// ---------- Admin ----------

export const isAdmin = (identity: Identity | null | undefined) => {
  const groups = identity?.groups ?? (identity?.claims?.['cognito:groups'] as string[] | undefined) ?? [];
  return Array.isArray(groups) && groups.includes('admin');
};

export async function queueAlertEmail(deps: Deps, identity: Identity | null | undefined, args: { alertId?: unknown }): Promise<Result> {
  if (!isAdmin(identity)) return fail('Only site admins can do this.', 'FORBIDDEN');
  const alertId = typeof args.alertId === 'string' ? args.alertId : '';
  const alert = alertId ? await deps.getAlert(alertId) : null;
  if (!alert) return fail('That alert was not found.', 'NOT_FOUND');
  if (alert.emailStatus === 'sending' || alert.emailStatus === 'sent') {
    return fail('This alert has already been emailed.', 'ALREADY_SENT');
  }
  await deps.updateAlert(alert.id, { emailStatus: 'sending' });
  await deps.invokeWorker({ kind: 'alert', alertId: alert.id });
  return { ok: true, queued: true };
}

const SITE_PATH = /^\/[A-Za-z0-9/_\-?=&#.]*$/;

export async function queueAnnouncement(
  deps: Deps,
  identity: Identity | null | undefined,
  args: { topic?: unknown; title?: unknown; summary?: unknown; path?: unknown },
): Promise<Result> {
  if (!isAdmin(identity)) return fail('Only site admins can do this.', 'FORBIDDEN');
  const topic = args.topic === 'newTraining' || args.topic === 'newVideos' ? args.topic : null;
  const title = typeof args.title === 'string' ? args.title.trim() : '';
  const summary = typeof args.summary === 'string' ? args.summary.trim() : '';
  const path = typeof args.path === 'string' && args.path.trim() ? args.path.trim() : '/';
  if (!topic) return fail('Choose who should get this email.', 'BAD_TOPIC');
  if (!title || title.length > 120) return fail('Add a title (up to 120 characters).', 'BAD_TITLE');
  if (!summary || summary.length > 1000) return fail('Add a short summary (up to 1,000 characters).', 'BAD_SUMMARY');
  if (!SITE_PATH.test(path)) return fail('The link must be a page on this site, starting with /', 'BAD_PATH');
  await deps.invokeWorker({ kind: 'announcement', topic, title, summary, path });
  return { ok: true, queued: true };
}

export async function subscriberStats(deps: Deps, identity: Identity | null | undefined): Promise<Result> {
  if (!isAdmin(identity)) return fail('Only site admins can do this.', 'FORBIDDEN');
  const all = await deps.scanSubscribers();
  const active = all.filter((s) => s.status === 'active');
  const stats: Record<string, number> = { total: all.length, active: active.length, pending: all.filter((s) => s.status === 'pending').length };
  for (const t of NEWS_TOPICS) stats[t] = active.filter((s) => s.topics?.[t]).length;
  return { ok: true, stats };
}

// ---------- Worker: sending ----------

function unsubscribeHeaders(deps: Deps, rec: Subscriber, scope: string) {
  if (!deps.env.oneClickUrl) return undefined;
  const url = `${deps.env.oneClickUrl}?t=${encodeURIComponent(linkToken(rec))}&s=${encodeURIComponent(scope)}`;
  return [
    { name: 'List-Unsubscribe', value: `<${url}>` },
    { name: 'List-Unsubscribe-Post', value: 'List-Unsubscribe=One-Click' },
  ];
}

const prefsUrl = (deps: Deps, rec: Subscriber, unsubscribeScope?: string) =>
  `${deps.env.siteUrl}/email-preferences?t=${encodeURIComponent(linkToken(rec))}${unsubscribeScope ? `&unsubscribe=${encodeURIComponent(unsubscribeScope)}` : ''}`;

// Send to many people at a steady pace (SES allows about 14 a second by default).
async function sendToAll(deps: Deps, recipients: Subscriber[], build: (rec: Subscriber) => { content: EmailContent; scope: string }) {
  let sent = 0;
  let failed = 0;
  const PER_BATCH = 8;
  for (let i = 0; i < recipients.length; i += PER_BATCH) {
    const batch = recipients.slice(i, i + PER_BATCH);
    const started = deps.now().getTime();
    const results = await Promise.allSettled(batch.map((rec) => {
      const { content, scope } = build(rec);
      return deps.sendEmail(rec.email, content, unsubscribeHeaders(deps, rec, scope));
    }));
    for (const r of results) {
      if (r.status === 'fulfilled') sent++;
      else {
        failed++;
        deps.log('send failed', { error: String((r.reason as Error)?.name ?? r.reason) });
      }
    }
    const wait = 1000 - (deps.now().getTime() - started);
    if (i + PER_BATCH < recipients.length && wait > 0) await deps.sleep(wait);
  }
  return { sent, failed };
}

export async function sendAlertToSubscribers(deps: Deps, alertId: string) {
  const alert = await deps.getAlert(alertId);
  if (!alert) { deps.log('alert not found', { alertId }); return { sent: 0, failed: 0 }; }
  if (alert.emailStatus === 'sent') return { sent: 0, failed: 0 };
  const recipients = (await deps.scanSubscribers()).filter((s) => s.status === 'active' && s.topics?.scamAlerts);
  const result = await sendToAll(deps, recipients, (rec) => ({
    scope: 'scamAlerts',
    content: renderEmail(alertEmail({
      alert,
      alertUrl: `${deps.env.siteUrl}/alerts/${encodeURIComponent(alert.id)}`,
      siteUrl: deps.env.siteUrl,
      manageUrl: prefsUrl(deps, rec),
      unsubscribeUrl: prefsUrl(deps, rec, 'scamAlerts'),
      mailingAddress: deps.env.mailingAddress,
    })),
  }));
  await deps.updateAlert(alert.id, { emailStatus: 'sent', emailedAt: deps.now().toISOString(), emailCount: result.sent });
  deps.log('alert emailed', { alertId, ...result });
  return result;
}

export async function sendAnnouncementToSubscribers(
  deps: Deps,
  job: { topic: 'newTraining' | 'newVideos'; title: string; summary: string; path: string },
) {
  const recipients = (await deps.scanSubscribers()).filter((s) => s.status === 'active' && s.topics?.[job.topic]);
  const result = await sendToAll(deps, recipients, (rec) => ({
    scope: job.topic,
    content: renderEmail(announcementEmail({
      ...job,
      url: `${deps.env.siteUrl}${job.path}`,
      siteUrl: deps.env.siteUrl,
      manageUrl: prefsUrl(deps, rec),
      unsubscribeUrl: prefsUrl(deps, rec, job.topic),
      mailingAddress: deps.env.mailingAddress,
    })),
  }));
  deps.log('announcement emailed', { topic: job.topic, ...result });
  return result;
}

// Family Circle emails go to members. They get a Subscriber record (for their choices and
// unsubscribe link) the first time one is sent, with newsletter topics left off.
async function familyRecipient(deps: Deps, memberId: string, kind: FamilyTopic) {
  const sub = subOf(memberId);
  const found = sub ? await deps.getMemberEmail(sub) : null;
  if (!found?.email || !found.verified) return null;
  let rec = await deps.getSubscriber(subscriberId(found.email));
  if (!rec) {
    rec = newRecord(deps, found.email, { source: 'family', status: 'active', memberSub: sub });
    await save(deps, rec);
  }
  if (rec.family?.[kind] === false) return null;
  return rec;
}

const BADGE_NAMES: Record<string, string> = {
  'first-step': 'First Step',
  'lesson-mindset': 'Ready to Hang Up',
  'lesson-email': 'Phishing Spotter',
  'lesson-text': 'Text Detective',
  'lesson-phone': 'Phone Scam Stopper',
  'lesson-popup': 'Pop-up Proof',
  'lesson-government': 'Impostor Spotter',
  'lesson-marketplace': 'Smart Shopper',
  'lesson-romance': 'Heart Guard',
  'lesson-investment': 'Money Protector',
  halfway: 'Halfway There',
  'sharp-eye': 'Sharp Eye',
  'weekly-watcher': 'Weekly Watcher',
  'family-safe': 'Family Safe',
  'scam-buster': 'Scam Buster',
};
export const badgeName = (id: string) => BADGE_NAMES[id] ?? null;

const CHEERS: Record<string, string> = {
  proud: "I'm so proud of you!",
  'keep-going': "Keep going, you're doing great!",
  badge: 'Congratulations on your new badge!',
  thanks: 'Thank you for learning this. It means a lot to me.',
  weekly: "Let's do the Scam of the Week together. I'll call you!",
  love: 'Love you! Stay safe out there.',
};
export const cheerMessage = (key: string) => CHEERS[key] ?? 'Sent you a cheer!';

// A family member sent a cheer. Email the learner, but only if the sender is someone the
// learner approved, and not more often than every couple of hours.
export async function onCheerCreated(deps: Deps, cheer: Record<string, unknown>) {
  const sender = String(cheer.owner ?? '');
  const recipient = String(cheer.recipient ?? '');
  if (!sender || !recipient || subOf(sender) === subOf(recipient)) return 'skipped';
  const shares = await deps.findSharesByOwner(recipient);
  const share = shares.find((s) => (s.viewers as string[] | undefined ?? []).includes(sender));
  if (!share) return 'not-approved';
  const rec = await familyRecipient(deps, recipient, 'cheers');
  if (!rec) return 'opted-out';
  const now = deps.now();
  if (rec.lastCheerEmailAt && now.getTime() - new Date(rec.lastCheerEmailAt).getTime() < CHEER_EMAIL_GAP_MS) return 'too-soon';
  // Use the name the learner saw and approved, not whatever the sender typed on the cheer.
  const names = parseJson<Record<string, { name?: string; relationship?: string }>>(share.viewerNames, {});
  const from = names[sender]?.name || 'A family member';
  const relationship = names[sender]?.relationship || '';
  await deps.sendEmail(rec.email, renderEmail(cheerEmail({
    fromName: from,
    relationship,
    message: cheerMessage(String(cheer.message ?? '')),
    dashboardUrl: `${deps.env.siteUrl}/dashboard`,
    siteUrl: deps.env.siteUrl,
    manageUrl: prefsUrl(deps, rec),
    unsubscribeUrl: prefsUrl(deps, rec, 'cheers'),
    mailingAddress: deps.env.mailingAddress,
  })), unsubscribeHeaders(deps, rec, 'cheers'));
  rec.lastCheerEmailAt = now.toISOString();
  await save(deps, rec);
  return 'sent';
}

// A learner's shared summary changed. If they earned new badges or the certificate,
// let each approved family member know.
export async function onShareUpdated(deps: Deps, oldShare: Record<string, unknown> | null, newShare: Record<string, unknown>) {
  const before = parseJson<{ badges?: string[]; certified?: boolean }>(oldShare?.summary, {});
  const after = parseJson<{ badges?: string[]; certified?: boolean; certificateId?: string | null }>(newShare.summary, {});
  const had = new Set(before.badges ?? []);
  // Only badges, never the certificate badge twice: it's announced as the certificate.
  const newBadges = (after.badges ?? []).filter((b) => !had.has(b) && b !== 'scam-buster').map(badgeName).filter(Boolean) as string[];
  const certified = !!after.certified && !before.certified;
  if (!newBadges.length && !certified) return 0;
  // A brand-new summary (nothing shared before) isn't news.
  if (!oldShare || !before.badges) return 0;

  const learner = String(newShare.displayName ?? 'Your family member');
  const viewers = ((newShare.viewers as string[] | undefined) ?? []).filter(Boolean);
  const followUrl = `${deps.env.siteUrl}/family/view/${encodeURIComponent(String(newShare.id))}`;
  let sent = 0;
  for (const viewer of viewers) {
    const rec = await familyRecipient(deps, viewer, 'familyUpdates');
    if (!rec) continue;
    try {
      await deps.sendEmail(rec.email, renderEmail(familyProgressEmail({
        learner,
        badges: newBadges,
        certified,
        certificateUrl: certified && after.certificateId ? `${deps.env.siteUrl}/verify/${encodeURIComponent(after.certificateId)}` : null,
        followUrl,
        siteUrl: deps.env.siteUrl,
        manageUrl: prefsUrl(deps, rec),
        unsubscribeUrl: prefsUrl(deps, rec, 'familyUpdates'),
        mailingAddress: deps.env.mailingAddress,
      })), unsubscribeHeaders(deps, rec, 'familyUpdates'));
      sent++;
    } catch (err) {
      deps.log('family email failed', { error: String((err as Error)?.name ?? err) });
    }
  }
  return sent;
}
