import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { mailerApi } from '../functions/mailer/resource';

/**
 * Member data.
 * - UserProfile and TrainingProgress are owner-only: a signed-in member can read and
 *   change their own records and nobody else's.
 * - Certificate is created by its owner and can be looked up publicly by its ID, so
 *   anyone with the link can confirm it (the /verify page). Only a single record by
 *   exact ID can be fetched publicly; certificates can't be listed or searched.
 * The `owner` field on each model can't be changed, so records can't be handed to
 * someone else, and it is never shown publicly.
 */
const lockedOwner = () =>
  a.string().authorization((allow) => [allow.owner().to(['read', 'delete'])]);

const schema = a.schema({
  MemberRole: a.enum(['senior', 'family', 'caregiver']),

  UserProfile: a
    .model({
      displayName: a.string().required(),
      role: a.ref('MemberRole').required(),
      // Email alert preferences (Phase 5 sends the emails; SMS comes later)
      notifyScamAlerts: a.boolean().default(true),
      notifyNewTraining: a.boolean().default(false),
      notifyNewVideos: a.boolean().default(false),
      // Since Phase 5 the email choices that count live in Subscriber (one record per email
      // address, kept by the mailer). These three only seed it for older accounts.
      owner: lockedOwner(),
    })
    .authorization((allow) => [allow.owner()]),

  // One record per member. `modules` maps a module key to its step progress, e.g.
  // { "email": { "learn": true, "practice": true, "actions": true, "bestScore": 83, "passed": true, "passedAt": "..." } }
  TrainingProgress: a
    .model({
      modules: a.json(),
      finalExam: a.json(),
      lastModuleKey: a.string(),
      certificateId: a.string(),
      // { weekly: { [weekId]: { correct, at } }, familyPlan: { [itemKey]: true }, badgesSeen: [badgeId] }
      extras: a.json(),
      owner: lockedOwner(),
    })
    .authorization((allow) => [allow.owner()]),

  Certificate: a
    .model({
      displayName: a.string().required(),
      completedOn: a.date().required(),
      finalScore: a.integer().required(),
      owner: lockedOwner(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'delete']),
      allow.publicApiKey().to(['get']),
    ]),

  // ---- Family Circle ----
  // A learner can let family members follow their progress. Nothing is shared until the
  // learner sends an invite link AND approves each person who asks to join.
  //
  // The `owner` fields below are filled in by the server with the signed-in member's ID
  // and can't be set to anyone else. The app reads them to know who an invite or request
  // really came from, so nobody can pretend to be someone else. None of these models
  // allow `update` by the owner of a request, invite or cheer, so owners can't be swapped.

  // One per learner who shares. Holds a short summary (lessons passed, badges, last
  // active) and never any quiz answers, email address, or Family Safety Plan details.
  // `viewers` lists the members the learner approved; they can read it, nothing more.
  FamilyShare: a
    .model({
      displayName: a.string().required(),
      summary: a.json(),
      viewers: a.string().array(),
      // { [viewerId]: { name, relationship } } so the learner can see who's following
      viewerNames: a.json(),
      // Viewers can read who owns the share (to send cheers), but no one can change it.
      owner: a.string().authorization((allow) => [
        allow.owner().to(['read', 'delete']),
        allow.ownersDefinedIn('viewers').to(['read']),
      ]),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.ownersDefinedIn('viewers').to(['read']),
    ]),

  // An invite link the learner sends to family. Anyone signed in who has the link can
  // look it up by its exact ID (it can't be listed or searched). Using it only creates a
  // request; the learner still has to approve it.
  FamilyInvite: a
    .model({
      inviterName: a.string().required(),
      expiresAt: a.datetime().required(),
      owner: a.string(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'delete']),
      allow.authenticated().to(['get']),
    ]),

  FamilyRequestKind: a.enum(['join', 'leave']),

  // "Please let me follow your progress" (join), or "I'd like to stop following" (leave).
  // Readable by the person who sent it and the learner it's addressed to (`approver`).
  FamilyRequest: a
    .model({
      kind: a.ref('FamilyRequestKind').required(),
      inviteId: a.id(),
      shareId: a.id(),
      requesterName: a.string().required(),
      relationship: a.string(),
      // Shown only to the person who sent the request ("Waiting for Mary to say yes")
      inviterName: a.string(),
      approver: a.string().required(),
      owner: a.string(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'delete']),
      allow.ownerDefinedIn('approver').to(['read', 'delete']),
    ]),

  // A short, preset note of encouragement from a family member. Only preset messages
  // are offered (no free text), so cheers can't be used to send anything unkind.
  Cheer: a
    .model({
      message: a.string().required(),
      fromName: a.string().required(),
      recipient: a.string().required(),
      owner: a.string(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'delete']),
      allow.ownerDefinedIn('recipient').to(['read', 'delete']),
    ]),

  // ---- Scam Alerts and email (Phase 5) ----

  ScamAlertSeverity: a.enum(['info', 'warning', 'urgent']),

  // Posted by admins on /admin. Anyone can read them on /alerts.
  ScamAlert: a
    .model({
      title: a.string().required(),
      summary: a.string().required(),
      // "What to do", one point per line
      details: a.string(),
      severity: a.ref('ScamAlertSeverity').required(),
      publishedOn: a.date().required(),
      sourceName: a.string(),
      sourceUrl: a.url(),
      // Set by the mailer: 'sending' | 'sent'
      emailStatus: a.string(),
      emailedAt: a.datetime(),
      emailCount: a.integer(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.authenticated().to(['read']),
      allow.group('admin'),
    ]),

  // One record per email address, written only by the mailer functions (never by the app).
  // Admins can read the list; everyone else changes their choices through the operations
  // below, which check the secret link token or the member's sign-in.
  // `channels` is ['email'] for now; text messages can be added as another channel later.
  Subscriber: a
    .model({
      email: a.string().required(),
      status: a.string().required(),
      topics: a.json(),
      family: a.json(),
      channels: a.string().array(),
      source: a.string(),
      confirmedAt: a.datetime(),
      unsubscribedAt: a.datetime(),
    })
    .authorization((allow) => [allow.group('admin').to(['read'])]),

  // Public: the sign-up form and the links in emails. `website` is a hidden bot trap.
  subscribeToEmails: a
    .mutation()
    .arguments({ email: a.string().required(), topics: a.json().required(), website: a.string() })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()])
    .handler(a.handler.function(mailerApi)),
  confirmEmailSubscription: a
    .mutation()
    .arguments({ token: a.string().required() })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()])
    .handler(a.handler.function(mailerApi)),
  getEmailPreferences: a
    .query()
    .arguments({ token: a.string().required() })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()])
    .handler(a.handler.function(mailerApi)),
  updateEmailPreferences: a
    .mutation()
    .arguments({ token: a.string().required(), topics: a.json(), family: a.json() })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()])
    .handler(a.handler.function(mailerApi)),
  unsubscribeEmail: a
    .mutation()
    .arguments({ token: a.string().required(), scope: a.string() })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()])
    .handler(a.handler.function(mailerApi)),

  // Signed-in members: their own email choices (uses their verified account email).
  getMyEmailPreferences: a
    .query()
    .returns(a.json())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(mailerApi)),
  updateMyEmailPreferences: a
    .mutation()
    .arguments({ topics: a.json(), family: a.json() })
    .returns(a.json())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(mailerApi)),

  // Admins only (checked again inside the function).
  emailScamAlert: a
    .mutation()
    .arguments({ alertId: a.id().required() })
    .returns(a.json())
    .authorization((allow) => [allow.group('admin')])
    .handler(a.handler.function(mailerApi)),
  sendEmailAnnouncement: a
    .mutation()
    .arguments({ topic: a.string().required(), title: a.string().required(), summary: a.string().required(), path: a.string() })
    .returns(a.json())
    .authorization((allow) => [allow.group('admin')])
    .handler(a.handler.function(mailerApi)),
  getSubscriberStats: a
    .query()
    .returns(a.json())
    .authorization((allow) => [allow.group('admin')])
    .handler(a.handler.function(mailerApi)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    // Used for the public certificate check, Scam Alerts, and the email sign-up form.
    apiKeyAuthorizationMode: { expiresInDays: 365 },
  },
});
