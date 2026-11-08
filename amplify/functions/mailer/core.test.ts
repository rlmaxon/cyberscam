// Tests for the mailer logic with fake AWS calls. Run: npm run test:mailer
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as core from './core';
import { route } from './api';
import { handleStream } from './worker';
import { respond } from './oneClick';
import { marshall } from '@aws-sdk/util-dynamodb';

type Sent = { to: string; subject: string; html: string; text: string; headers?: Array<{ name: string; value: string }> };

function fakes(start = '2026-11-01T12:00:00Z') {
  let clock = new Date(start).getTime();
  let n = 0;
  const subscribers = new Map<string, core.Subscriber>();
  const alerts = new Map<string, core.ScamAlertRecord>();
  const shares: Array<Record<string, unknown>> = [];
  const members: Record<string, { email: string; verified: boolean }> = {
    'sub-mary': { email: 'Mary@Example.com', verified: true },
    'sub-jane': { email: 'jane@example.com', verified: true },
    'sub-unverified': { email: 'new@example.com', verified: false },
  };
  const sent: Sent[] = [];
  const invoked: unknown[] = [];
  const logs: string[] = [];
  const deps: core.Deps = {
    getSubscriber: async (id) => structuredClone(subscribers.get(id) ?? null),
    putSubscriber: async (rec) => { subscribers.set(rec.id, structuredClone(rec)); },
    scanSubscribers: async () => [...subscribers.values()].map((s) => structuredClone(s)),
    getAlert: async (id) => structuredClone(alerts.get(id) ?? null),
    updateAlert: async (id, fields) => { alerts.set(id, { ...alerts.get(id)!, ...fields }); },
    findSharesByOwner: async (owner) => shares.filter((s) => s.owner === owner),
    getMemberEmail: async (sub) => members[sub] ?? null,
    sendEmail: async (to, c, headers) => {
      if (to.includes('bounce')) throw Object.assign(new Error('nope'), { name: 'MessageRejected' });
      sent.push({ to, ...c, headers });
    },
    invokeWorker: async (p) => { invoked.push(p); },
    randomToken: () => `secret${++n}`,
    now: () => new Date(clock),
    sleep: async (ms) => { clock += ms; },
    log: (m, d) => { logs.push(`${m} ${JSON.stringify(d ?? {})}`); },
    env: { siteUrl: 'https://site.test', oneClickUrl: 'https://oneclick.test', mailingAddress: 'PO Box 1, Troy NY' },
  };
  return { deps, subscribers, alerts, shares, sent, invoked, logs, advance: (ms: number) => { clock += ms; } };
}

const tokenFrom = (url: string) => decodeURIComponent(new URL(url.replace(/&amp;/g, '&')).searchParams.get('t')!);
const firstLink = (s: Sent, path: string) => {
  const m = s.text.match(new RegExp(`https://site\\.test${path}\\?t=[^\\s]+`));
  assert.ok(m, `no ${path} link in email`);
  return m[0];
};

test('sign-up needs a real email and a topic, and quietly ignores bots', async () => {
  const f = fakes();
  assert.equal((await core.subscribe(f.deps, { email: 'nope', topics: { scamAlerts: true } })).ok, false);
  assert.equal((await core.subscribe(f.deps, { email: 'a@b.com', topics: {} })).ok, false);
  assert.equal((await core.subscribe(f.deps, { email: 'a@b.com', topics: '{"scamAlerts":false}' })).ok, false);
  assert.deepEqual(await core.subscribe(f.deps, { email: 'a@b.com', topics: { scamAlerts: true }, website: 'spam.biz' }), { ok: true });
  assert.equal(f.sent.length, 0);
  assert.equal(f.subscribers.size, 0);
});

test('double opt-in: nothing is active until the link is used', async () => {
  const f = fakes();
  const r = await core.subscribe(f.deps, { email: ' Bob@Example.COM ', topics: JSON.stringify({ scamAlerts: true, newVideos: true }) });
  assert.deepEqual(r, { ok: true });
  assert.equal(f.sent.length, 1);
  assert.equal(f.sent[0].to, 'bob@example.com');
  assert.match(f.sent[0].subject, /confirm/i);
  assert.match(f.sent[0].text, /Scam alerts/);
  assert.match(f.sent[0].text, /New training videos/);
  assert.doesNotMatch(f.sent[0].text, /New training lessons/);
  const rec = [...f.subscribers.values()][0];
  assert.equal(rec.status, 'pending');
  assert.equal(rec.topics.scamAlerts, false);

  // An alert now does not reach them
  f.alerts.set('a1', { id: 'a1', title: 'T', summary: 'S', severity: 'warning', publishedOn: '2026-11-01' });
  await core.sendAlertToSubscribers(f.deps, 'a1');
  assert.equal(f.sent.length, 1);

  const link = firstLink(f.sent[0], '/subscribe/confirm');
  const confirmed = await core.confirmSubscription(f.deps, { token: tokenFrom(link) });
  assert.equal(confirmed.ok, true);
  const after = f.subscribers.get(rec.id)!;
  assert.equal(after.status, 'active');
  assert.deepEqual(after.topics, { scamAlerts: true, newTraining: false, newVideos: true });
  // Using the link again is fine
  assert.equal((await core.confirmSubscription(f.deps, { token: tokenFrom(link) })).ok, true);
});

test('confirmation emails are rate limited and the answer never reveals it', async () => {
  const f = fakes();
  for (let i = 0; i < 3; i++) assert.deepEqual(await core.subscribe(f.deps, { email: 'x@y.org', topics: { scamAlerts: true } }), { ok: true });
  assert.equal(f.sent.length, 1);
  for (let i = 0; i < 10; i++) {
    f.advance(11 * 60 * 1000);
    await core.subscribe(f.deps, { email: 'x@y.org', topics: { scamAlerts: true } });
  }
  assert.equal(f.sent.length, 5, 'at most 5 a day');
});

test('bad, tampered and expired links are refused', async () => {
  const f = fakes();
  await core.subscribe(f.deps, { email: 'x@y.org', topics: { scamAlerts: true } });
  const token = tokenFrom(firstLink(f.sent[0], '/subscribe/confirm'));
  for (const bad of ['', 'abc', `${token}x`, `${token.split('.')[0]}.wrong`, `${token}.extra`, 42]) {
    assert.equal((await core.confirmSubscription(f.deps, { token: bad })).ok, false, String(bad));
    assert.equal((await core.unsubscribe(f.deps, { token: bad })).ok, false);
  }
  f.advance(8 * 24 * 60 * 60 * 1000);
  const r = await core.confirmSubscription(f.deps, { token });
  assert.equal(r.ok, false);
  assert.equal((r as { code: string }).code, 'EXPIRED');
});

test('alerts go only to confirmed scam-alert subscribers, with one-click unsubscribe', async () => {
  const f = fakes();
  const add = (email: string, topics: Partial<core.Topics>, status: core.Subscriber['status'] = 'active') => {
    const id = core.subscriberId(email);
    f.subscribers.set(id, {
      id, email, status, topics: { scamAlerts: false, newTraining: false, newVideos: false, ...topics },
      family: { familyUpdates: true, cheers: true }, channels: ['email'], token: `tok-${id.slice(0, 6)}`,
      source: 'form', createdAt: '', updatedAt: '', __typename: 'Subscriber',
    });
  };
  add('yes1@x.com', { scamAlerts: true });
  add('yes2@x.com', { scamAlerts: true, newTraining: true });
  add('bounce@x.com', { scamAlerts: true });
  add('training@x.com', { newTraining: true });
  add('pending@x.com', { scamAlerts: true }, 'pending');
  add('gone@x.com', { scamAlerts: true }, 'unsubscribed');
  f.alerts.set('a1', { id: 'a1', title: 'Toll text scam', summary: 'Fake toll bills by text.', details: '- Don\'t tap the link\nCall the toll agency', severity: 'urgent', publishedOn: '2026-11-01', sourceName: 'FTC' });

  // Admin check
  assert.equal((await core.queueAlertEmail(f.deps, { sub: 'x', groups: [] }, { alertId: 'a1' })).ok, false);
  assert.equal((await core.queueAlertEmail(f.deps, { sub: 'x', groups: ['admin'] }, { alertId: 'zzz' })).ok, false);
  assert.equal((await core.queueAlertEmail(f.deps, { sub: 'x', groups: ['admin'] }, { alertId: 'a1' })).ok, true);
  assert.deepEqual(f.invoked, [{ kind: 'alert', alertId: 'a1' }]);
  assert.equal(f.alerts.get('a1')!.emailStatus, 'sending');
  assert.equal((await core.queueAlertEmail(f.deps, { sub: 'x', groups: ['admin'] }, { alertId: 'a1' })).ok, false, 'no double send');

  const result = await core.sendAlertToSubscribers(f.deps, 'a1');
  assert.deepEqual(result, { sent: 2, failed: 1 });
  assert.deepEqual(f.sent.map((s) => s.to).sort(), ['yes1@x.com', 'yes2@x.com']);
  const mail = f.sent[0];
  assert.equal(mail.subject, 'Urgent: Toll text scam');
  assert.match(mail.html, /<li[^>]*>Don&#39;t tap the link<\/li>/);
  assert.match(mail.text, /https:\/\/site\.test\/alerts\/a1/);
  assert.match(mail.text, /PO Box 1, Troy NY/);
  const lu = mail.headers!.find((h) => h.name === 'List-Unsubscribe')!.value;
  assert.match(lu, /^<https:\/\/oneclick\.test\?t=.+&s=scamAlerts>$/);
  assert.ok(mail.headers!.some((h) => h.name === 'List-Unsubscribe-Post' && h.value === 'List-Unsubscribe=One-Click'));
  assert.equal(f.alerts.get('a1')!.emailStatus, 'sent');
  assert.equal(f.alerts.get('a1')!.emailCount, 2);
  // Logs never contain addresses
  assert.ok(f.logs.every((l) => !l.includes('@')));

  // One-click POST unsubscribes from scam alerts only
  const url = new URL(lu.slice(1, -1));
  const res = await respond(f.deps, { requestContext: { http: { method: 'POST' } }, queryStringParameters: { t: url.searchParams.get('t')!, s: 's' + 'camAlerts' } });
  assert.equal(res.statusCode, 200);
  const yes2 = f.subscribers.get(core.subscriberId(mail.to))!;
  assert.equal(yes2.topics.scamAlerts, false);
  // A GET (link scanner, browser) doesn't change anything; it redirects to the page
  const get = await respond(f.deps, { requestContext: { http: { method: 'GET' } }, queryStringParameters: { t: 'whatever', s: 'all' } });
  assert.equal(get.statusCode, 302);
  assert.match(get.headers.Location!, /^https:\/\/site\.test\/email-preferences\?t=whatever&unsubscribe=all$/);
});

test('preferences page by link: read, change, unsubscribe from everything', async () => {
  const f = fakes();
  await core.subscribe(f.deps, { email: 'p@x.com', topics: { scamAlerts: true } });
  const token = tokenFrom(firstLink(f.sent[0], '/subscribe/confirm'));
  const got = await core.getPreferencesByToken(f.deps, { token }) as { ok: true; prefs: { email: string; status: string } };
  assert.equal(got.prefs.email, 'p•@x.com');
  assert.equal(got.prefs.status, 'pending');
  const upd = await core.updatePreferencesByToken(f.deps, { token, topics: { newTraining: true }, family: '{"cheers":false}' }) as { ok: true; prefs: Record<string, unknown> };
  assert.deepEqual(upd.prefs.topics, { scamAlerts: false, newTraining: true, newVideos: false });
  assert.equal(upd.prefs.status, 'active');
  const all = await core.unsubscribe(f.deps, { token, scope: 'all' }) as { ok: true; prefs: Record<string, unknown> };
  assert.equal(all.prefs.status, 'unsubscribed');
  assert.deepEqual(all.prefs.family, { familyUpdates: false, cheers: false });
});

test('members manage their own emails without a confirmation step', async () => {
  const f = fakes();
  assert.equal((await core.getMyPreferences(f.deps, null)).ok, false);
  const none = await core.getMyPreferences(f.deps, { sub: 'sub-mary' }) as { ok: true; prefs: unknown };
  assert.equal(none.prefs, null);
  const r = await core.updateMyPreferences(f.deps, { sub: 'sub-mary' }, { topics: { scamAlerts: true }, family: { cheers: true } }) as { ok: true; prefs: Record<string, unknown> };
  assert.equal(r.prefs.status, 'active');
  assert.equal(f.sent.length, 0);
  const rec = f.subscribers.get(core.subscriberId('mary@example.com'))!;
  assert.equal(rec.email, 'mary@example.com');
  assert.equal(rec.memberSub, 'sub-mary');
  assert.equal((await core.updateMyPreferences(f.deps, { sub: 'sub-unverified' }, { topics: { scamAlerts: true } })).ok, false);
  // The same address signed up on the form earlier keeps one record
  await core.subscribe(f.deps, { email: 'jane@example.com', topics: { newVideos: true } });
  await core.updateMyPreferences(f.deps, { sub: 'sub-jane' }, { topics: { scamAlerts: true } });
  const jane = f.subscribers.get(core.subscriberId('jane@example.com'))!;
  assert.equal(jane.status, 'active');
  assert.deepEqual(jane.topics, { scamAlerts: true, newTraining: false, newVideos: false });
});

test('announcements: admin only, site links only, right audience', async () => {
  const f = fakes();
  await core.updateMyPreferences(f.deps, { sub: 'sub-mary' }, { topics: { newTraining: true } });
  await core.updateMyPreferences(f.deps, { sub: 'sub-jane' }, { topics: { newVideos: true } });
  const admin = { sub: 'a', claims: { 'cognito:groups': ['admin'] } };
  assert.equal((await core.queueAnnouncement(f.deps, { sub: 'a' }, { topic: 'newTraining', title: 't', summary: 's' })).ok, false);
  assert.equal((await core.queueAnnouncement(f.deps, admin, { topic: 'scamAlerts', title: 't', summary: 's' })).ok, false);
  assert.equal((await core.queueAnnouncement(f.deps, admin, { topic: 'newTraining', title: 't', summary: 's', path: 'https://evil.example' })).ok, false);
  assert.equal((await core.queueAnnouncement(f.deps, admin, { topic: 'newTraining', title: 'New lesson', summary: 'About gift cards', path: '/learn/phone' })).ok, true);
  await core.sendAnnouncementToSubscribers(f.deps, f.invoked[0] as never);
  assert.deepEqual(f.sent.map((s) => s.to), ['mary@example.com']);
  assert.match(f.sent[0].text, /https:\/\/site\.test\/learn\/phone/);
  const stats = await core.subscriberStats(f.deps, admin) as { ok: true; stats: Record<string, number> };
  assert.deepEqual(stats.stats, { total: 2, active: 2, pending: 0, scamAlerts: 0, newTraining: 1, newVideos: 1 });
});

test('cheer emails: approved family only, opt-out respected, not too often', async () => {
  const f = fakes();
  f.shares.push({ id: 'share1', owner: 'sub-mary::sub-mary', displayName: 'Mary', viewers: ['sub-jane::sub-jane'], viewerNames: JSON.stringify({ 'sub-jane::sub-jane': { name: 'Jane', relationship: 'Daughter' } }) });
  const cheer = (owner: string, message = 'proud') => ({ owner, recipient: 'sub-mary::sub-mary', message, fromName: 'Visit evil.com' });
  assert.equal(await core.onCheerCreated(f.deps, cheer('sub-stranger::x')), 'not-approved');
  assert.equal(await core.onCheerCreated(f.deps, cheer('sub-jane::sub-jane')), 'sent');
  assert.equal(f.sent[0].to, 'mary@example.com');
  assert.equal(f.sent[0].subject, 'Jane sent you a cheer');
  assert.match(f.sent[0].text, /I'm so proud of you!/);
  assert.doesNotMatch(f.sent[0].text, /evil/);
  assert.equal(await core.onCheerCreated(f.deps, cheer('sub-jane::sub-jane', 'love')), 'too-soon');
  f.advance(3 * 60 * 60 * 1000);
  // Unsubscribe from cheer emails using the link in the first one
  const token = tokenFrom(f.sent[0].text.match(/https:\/\/site\.test\/email-preferences\?t=[^\s&]+/)![0]);
  await core.unsubscribe(f.deps, { token, scope: 'cheers' });
  assert.equal(await core.onCheerCreated(f.deps, cheer('sub-jane::sub-jane')), 'opted-out');
  // Family emails didn't sign Mary up for newsletters
  assert.deepEqual(f.subscribers.get(core.subscriberId('mary@example.com'))!.topics, { scamAlerts: false, newTraining: false, newVideos: false });
});

test('family hear about new badges and the certificate', async () => {
  const f = fakes();
  const share = (badges: string[], certified = false) => ({
    id: 'share1', owner: 'sub-mary::sub-mary', displayName: 'Mary', viewers: ['sub-jane::sub-jane', 'sub-gone::x'],
    summary: JSON.stringify({ badges, certified, certificateId: certified ? 'cert-9' : null }),
  });
  assert.equal(await core.onShareUpdated(f.deps, share(['first-step']), share(['first-step'])), 0);
  assert.equal(await core.onShareUpdated(f.deps, { id: 'share1', summary: '{}' }, share(['first-step'])), 0, 'first summary is not news');
  assert.equal(await core.onShareUpdated(f.deps, share(['first-step']), share(['first-step', 'lesson-email', 'mystery'])), 1);
  assert.equal(f.sent[0].to, 'jane@example.com');
  assert.equal(f.sent[0].subject, 'Mary earned the Phishing Spotter badge');
  assert.match(f.sent[0].text, /https:\/\/site\.test\/family\/view\/share1/);
  await core.onShareUpdated(f.deps, share(['first-step', 'lesson-email']), share(['first-step', 'lesson-email', 'scam-buster'], true));
  assert.equal(f.sent[1].subject, 'Mary earned their Scam Buster certificate!');
  assert.match(f.sent[1].text, /https:\/\/site\.test\/verify\/cert-9/);
});

test('API routing and stream handling', async () => {
  const f = fakes();
  const r = await route(f.deps, { info: { fieldName: 'subscribeToEmails' }, arguments: { email: 'r@x.com', topics: '{"scamAlerts":true}' }, identity: null });
  assert.deepEqual(r, { ok: true });
  assert.equal((await route(f.deps, { info: { fieldName: 'getSubscriberStats' }, identity: { sub: 'u', groups: null } })).ok, false);
  assert.equal((await route(f.deps, { info: { fieldName: 'nope' } })).ok, false);

  f.shares.push({ id: 's1', owner: 'sub-mary::sub-mary', viewers: ['sub-jane::sub-jane'], viewerNames: '{}' });
  const before = f.sent.length;
  await handleStream(f.deps, [
    { eventName: 'INSERT', eventSourceARN: 'arn:aws:dynamodb:us-east-1:1:table/Cheer-abc-NONE/stream/2026', dynamodb: { NewImage: marshall({ id: 'c1', owner: 'sub-jane::sub-jane', recipient: 'sub-mary::sub-mary', message: 'love' }) as never } },
    { eventName: 'INSERT', eventSourceARN: 'arn:aws:dynamodb:us-east-1:1:table/Other-abc/stream/2026', dynamodb: { NewImage: marshall({ id: 'x' }) as never } },
  ], { cheer: 'Cheer-abc-NONE', share: 'FamilyShare-abc-NONE' });
  assert.equal(f.sent.length, before + 1);
  assert.equal(f.sent.at(-1)!.subject, 'A family member sent you a cheer');
});
