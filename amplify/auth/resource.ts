import { referenceAuth } from '@aws-amplify/backend';

/**
 * Reuse the EXISTING Cognito user pool, so current members keep their logins.
 * Amplify never modifies these resources; it only reads their settings.
 *
 * The identity pool and its two IAM roles are created once with
 * docs/phase2-aws-setup.md. Their IDs are passed in as Amplify environment
 * variables (set by that same script), so nothing account-specific is hardcoded
 * beyond the user pool, whose IDs are already public in src/aws-exports.js.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Run the setup in docs/phase2-aws-setup.md, ` +
        'which adds it to the Amplify app.',
    );
  }
  return value;
}

export const auth = referenceAuth({
  userPoolId: process.env.AUTH_USER_POOL_ID ?? 'us-east-1_If1TM2kBR',
  userPoolClientId: process.env.AUTH_USER_POOL_CLIENT_ID ?? '353vsdvae15qlk8mb6c346rm64',
  identityPoolId: required('AUTH_IDENTITY_POOL_ID'),
  authRoleArn: required('AUTH_AUTHENTICATED_ROLE_ARN'),
  unauthRoleArn: required('AUTH_UNAUTHENTICATED_ROLE_ARN'),
});
