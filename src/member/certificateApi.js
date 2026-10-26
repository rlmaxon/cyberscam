import { hasDataBackend } from '../amplifyConfig.js';

// Certificates: members create their own; anyone with the ID can verify one.

let memberClient;
let publicClient;
const memberApi = () =>
  (memberClient ??= import('aws-amplify/data').then(({ generateClient }) => generateClient({ authMode: 'userPool' })));
const publicApi = () =>
  (publicClient ??= import('aws-amplify/data').then(({ generateClient }) => generateClient({ authMode: 'apiKey' })));

const PUBLIC_FIELDS = ['id', 'displayName', 'completedOn', 'finalScore'];

export async function createCertificate({ displayName, finalScore }) {
  if (!hasDataBackend) throw new Error('Certificates are not available yet.');
  const completedOn = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in the member's time zone
  const { data, errors } = await (await memberApi()).models.Certificate.create({ displayName, completedOn, finalScore });
  if (errors?.length) throw new Error(errors[0].message);
  return data;
}

export async function getMyCertificate(id) {
  if (!hasDataBackend || !id) return null;
  const { data, errors } = await (await memberApi()).models.Certificate.get({ id }, { selectionSet: PUBLIC_FIELDS });
  if (errors?.length) throw new Error(errors[0].message);
  return data ?? null;
}

// Public lookup for the /verify page. Returns null when not found.
export async function verifyCertificate(id) {
  if (!hasDataBackend) throw new Error('Verification is not available yet.');
  const { data, errors } = await (await publicApi()).models.Certificate.get({ id }, { selectionSet: PUBLIC_FIELDS });
  if (errors?.length && !data) throw new Error(errors[0].message);
  return data ?? null;
}

export const verifyUrl = (id) => `${window.location.origin}/verify/${id}`;

export function formatDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
