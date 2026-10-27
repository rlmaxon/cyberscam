import { hasDataBackend } from '../amplifyConfig.js';
import { findFirst } from './listAll.js';

// Thin wrapper around the member-profile API. Every call is made as the signed-in
// member, and the backend only ever returns that member's own profile.

// The data library is loaded only when a signed-in member needs it, so visitors
// who never sign in don't download it.
let clientPromise;
const api = () =>
  (clientPromise ??= import('aws-amplify/data').then(({ generateClient }) => generateClient({ authMode: 'userPool' })));

export const ROLES = [
  { value: 'senior', label: "I'm learning for myself", description: 'I want to spot and stop scams.' },
  { value: 'family', label: "I'm helping a parent or relative", description: 'I want to help someone I love stay safe.' },
  { value: 'caregiver', label: "I'm a caregiver", description: 'I support older adults at home or at work.' },
];

export async function loadMyProfile() {
  if (!hasDataBackend) return null;
  return findFirst((await api()).models.UserProfile);
}

export async function saveMyProfile(existing, fields) {
  if (!hasDataBackend) throw new Error('Profiles are not available yet.');
  const client = await api();
  const call = existing
    ? client.models.UserProfile.update({ id: existing.id, ...fields })
    : client.models.UserProfile.create(fields);
  const { data, errors } = await call;
  if (errors?.length) throw new Error(errors[0].message);
  return data;
}
