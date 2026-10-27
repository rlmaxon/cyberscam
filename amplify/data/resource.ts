import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

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
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    // Used only for the public certificate check. The key is renewed on every deploy.
    apiKeyAuthorizationMode: { expiresInDays: 365 },
  },
});
