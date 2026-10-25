import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Member data. Every record is owner-only: a signed-in member can read and
 * change their own profile and nobody else's. Progress, badges, and family
 * links arrive in later phases as additional models here.
 */
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
      // Set automatically to the member's ID; members can't hand a profile to someone else
      owner: a.string().authorization((allow) => [allow.owner().to(['read', 'delete'])]),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
