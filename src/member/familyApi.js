import { hasDataBackend } from '../amplifyConfig.js';
import { listAll } from './listAll.js';

// Family Circle: a learner shares a short progress summary with family members they approve.
//
// How joining works:
// 1. The learner creates an invite link (FamilyInvite) and sends it to a family member.
// 2. The family member opens it, signs in, and sends a request (FamilyRequest, kind "join").
// 3. The learner sees the request and taps Allow. Their app adds the family member to the
//    share's `viewers` list. Nobody sees anything until this step.
//
// Member IDs in `owner`, `viewers`, `approver` and `recipient` are always copied from an
// `owner` field the server filled in, never typed or built by the app, so they can't be faked.

let clientPromise;
const api = () =>
  (clientPromise ??= import('aws-amplify/data').then(({ generateClient }) => generateClient({ authMode: 'userPool' })));

const INVITE_DAYS = 7;

const parse = (v) => {
  if (v == null) return null;
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return null; }
  }
  return v;
};

const check = ({ data, errors }) => {
  if (errors?.length) throw new Error(errors[0].message);
  return data;
};

// The server stores member IDs as "<sub>::<username>" (or occasionally just one part).
export const isMe = (ownerValue, sub) =>
  !!ownerValue && !!sub && (ownerValue === sub || ownerValue.startsWith(`${sub}::`));

async function currentSub() {
  const { getCurrentUser } = await import('aws-amplify/auth');
  return (await getCurrentUser()).userId;
}

export const shareFromRecord = (r) => r && ({
  ...r,
  summary: parse(r.summary) ?? {},
  viewers: (r.viewers ?? []).filter(Boolean),
  viewerNames: parse(r.viewerNames) ?? {},
});

export const isExpired = (invite, at = new Date()) => !invite?.expiresAt || new Date(invite.expiresAt) < at;

// Everything the Family Circle pages need, in one go.
export async function loadFamily() {
  if (!hasDataBackend) return null;
  const client = await api();
  const sub = await currentSub();
  const [shares, requests, cheers, invites] = await Promise.all([
    listAll(client.models.FamilyShare),
    listAll(client.models.FamilyRequest),
    listAll(client.models.Cheer),
    listAll(client.models.FamilyInvite),
  ]);
  const all = shares.map(shareFromRecord);
  const mine = all.filter((s) => isMe(s.owner, sub)).sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
  let myShare = mine[0] ?? null;
  const byNewest = (a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '');

  const incoming = requests.filter((r) => !isMe(r.owner, sub) && isMe(r.approver, sub));
  const outgoing = requests.filter((r) => isMe(r.owner, sub));
  const myInvites = invites.filter((i) => isMe(i.owner, sub)).sort(byNewest);

  // Tidy up automatically: apply "stop following" requests, and drop join requests that
  // didn't come from one of this learner's own invite links.
  const myInviteIds = new Set(myInvites.map((i) => i.id));
  const joinRequests = [];
  for (const r of incoming) {
    if (r.kind === 'leave') {
      if (myShare && myShare.viewers.includes(r.owner)) {
        try { myShare = await removeViewer(myShare, r.owner); } catch { continue; }
      }
      await deleteRequest(r.id).catch(() => {});
    } else if (!myInviteIds.has(r.inviteId) || !requestMatchesInvite(r, myInvites)) {
      await deleteRequest(r.id).catch(() => {});
    } else if (myShare?.viewers.includes(r.owner)) {
      await deleteRequest(r.id).catch(() => {}); // already following
    } else {
      joinRequests.push(r);
    }
  }

  // Cheers are only shown from people the learner has approved.
  const viewers = new Set(myShare?.viewers ?? []);
  const received = cheers.filter((c) => isMe(c.recipient, sub) && !isMe(c.owner, sub));
  const goodCheers = received.filter((c) => viewers.has(c.owner)).sort(byNewest);
  for (const c of received) if (!viewers.has(c.owner)) await deleteCheer(c.id).catch(() => {});

  const leaving = new Set(outgoing.filter((r) => r.kind === 'leave').map((r) => r.shareId));
  return {
    sub,
    myShare,
    myInvites,
    joinRequests: joinRequests.sort(byNewest),
    cheers: goodCheers,
    following: all.filter((s) => !isMe(s.owner, sub) && !leaving.has(s.id))
      .sort((a, b) => a.displayName.localeCompare(b.displayName)),
    pendingJoins: outgoing.filter((r) => r.kind === 'join').sort(byNewest),
  };
}

// A request is valid if it was sent while its invite link was still good.
function requestMatchesInvite(request, invites) {
  const invite = invites.find((i) => i.id === request.inviteId);
  if (!invite) return false;
  const sent = request.createdAt ? new Date(request.createdAt) : new Date();
  return !isExpired(invite, sent);
}

// ---- Learner side ----

export async function createShare(displayName, summary) {
  const client = await api();
  return shareFromRecord(check(await client.models.FamilyShare.create({
    displayName, summary: JSON.stringify(summary ?? {}), viewers: [], viewerNames: JSON.stringify({}),
  })));
}

export async function updateShare(share, fields) {
  const client = await api();
  const input = { id: share.id };
  if ('displayName' in fields) input.displayName = fields.displayName;
  if ('summary' in fields) input.summary = JSON.stringify(fields.summary ?? {});
  if ('viewers' in fields) input.viewers = fields.viewers;
  if ('viewerNames' in fields) input.viewerNames = JSON.stringify(fields.viewerNames ?? {});
  return shareFromRecord(check(await client.models.FamilyShare.update(input)));
}

export async function createInvite(inviterName) {
  const client = await api();
  const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  return check(await client.models.FamilyInvite.create({ inviterName, expiresAt }));
}

export async function approveRequest(share, request) {
  const viewers = share.viewers.includes(request.owner) ? share.viewers : [...share.viewers, request.owner];
  const viewerNames = { ...share.viewerNames, [request.owner]: { name: request.requesterName, relationship: request.relationship ?? '' } };
  const updated = await updateShare(share, { viewers, viewerNames });
  await deleteRequest(request.id).catch(() => {});
  return updated;
}

export async function removeViewer(share, viewerId) {
  const viewerNames = { ...share.viewerNames };
  delete viewerNames[viewerId];
  return updateShare(share, { viewers: share.viewers.filter((v) => v !== viewerId), viewerNames });
}

// Stop sharing with everyone: removes the summary and every invite link.
export async function stopSharing(share, invites) {
  const client = await api();
  await Promise.all((invites ?? []).map((i) => client.models.FamilyInvite.delete({ id: i.id }).catch(() => {})));
  if (share) check(await client.models.FamilyShare.delete({ id: share.id }));
}

export async function deleteRequest(id) {
  const client = await api();
  check(await client.models.FamilyRequest.delete({ id }));
}

export async function deleteCheer(id) {
  const client = await api();
  check(await client.models.Cheer.delete({ id }));
}

// ---- Family member side ----

export async function getInvite(id) {
  if (!hasDataBackend) throw new Error('Family Circle is not available yet.');
  const client = await api();
  const { data, errors } = await client.models.FamilyInvite.get({ id });
  if (errors?.length && !data) throw new Error(errors[0].message);
  return data ?? null;
}

export async function sendJoinRequest(invite, { requesterName, relationship }) {
  const client = await api();
  return check(await client.models.FamilyRequest.create({
    kind: 'join', inviteId: invite.id, approver: invite.owner, requesterName, relationship: relationship || null,
    inviterName: invite.inviterName,
  }));
}

export async function cancelJoinRequest(id) {
  return deleteRequest(id);
}

export async function getShare(id) {
  if (!hasDataBackend) throw new Error('Family Circle is not available yet.');
  const client = await api();
  const { data, errors } = await client.models.FamilyShare.get({ id });
  if (errors?.length && !data) throw new Error(errors[0].message);
  return shareFromRecord(data ?? null);
}

// Ask to stop following. The learner's app removes you the next time they open the site;
// until then, this site hides them from your list.
export async function leaveShare(share, requesterName) {
  const client = await api();
  return check(await client.models.FamilyRequest.create({
    kind: 'leave', shareId: share.id, approver: share.owner, requesterName,
  }));
}

export async function sendCheer(share, messageKey, fromName) {
  const client = await api();
  return check(await client.models.Cheer.create({ message: messageKey, fromName, recipient: share.owner }));
}

export const inviteUrl = (id) => `${window.location.origin}/family/join/${id}`;
