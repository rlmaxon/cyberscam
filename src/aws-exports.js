/**
 * AWS Amplify / Cognito Configuration
 *
 * SETUP INSTRUCTIONS:
 * After creating your Cognito User Pool in the AWS Console, replace the
 * placeholder values below with your actual values.
 *
 * Where to find these values:
 *   - USER_POOL_ID:  AWS Console → Cognito → User Pools → [your pool] → User pool ID
 *   - USER_POOL_CLIENT_ID: AWS Console → Cognito → User Pools → [your pool] → App clients → Client ID
 *   - REGION: The AWS region you created the pool in (e.g., us-east-1)
 *
 * See docs/aws-setup-guide.md for step-by-step instructions.
 */

const awsExports = {
  Auth: {
    Cognito: {
      // ⚠️ REPLACE these placeholder values after creating your Cognito User Pool
      userPoolId: 'us-east-1_If1TM2kBR',           // e.g., us-east-1_AbCdEfGhI
      userPoolClientId: '353vsdvae15qlk8mb6c346rm64', // e.g., 1a2b3c4d5e6f7g8h9i0j1k2l
      region: 'us-east-1',                           // e.g., us-east-1, us-west-2
      loginWith: {
        email: true,
      },
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false,
      },
    },
  },
};

export default awsExports;
