import { defineFunction } from '@aws-amplify/backend';

// All three live with the data stack ("data" group) because they read its tables.
// Their environment variables (table names, user pool, site address) are added in
// amplify/backend.ts.

// GraphQL operations: sign-up, confirm, preferences, and admin requests.
export const mailerApi = defineFunction({
  name: 'mailer-api',
  entry: './api.ts',
  timeoutSeconds: 20,
  memoryMB: 512,
  runtime: 22,
  resourceGroupName: 'data',
});

// Background sending: alert and announcement emails, cheers, and family progress emails.
export const mailerWorker = defineFunction({
  name: 'mailer-worker',
  entry: './worker.ts',
  timeoutSeconds: 900,
  memoryMB: 512,
  runtime: 22,
  resourceGroupName: 'data',
});

// The one-click "Unsubscribe" link that Gmail, Yahoo and Apple Mail show.
export const mailerOneClick = defineFunction({
  name: 'mailer-one-click',
  entry: './oneClick.ts',
  timeoutSeconds: 10,
  memoryMB: 256,
  runtime: 22,
  resourceGroupName: 'data',
});
