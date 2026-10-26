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
