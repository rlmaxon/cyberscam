# Authentication Design

> Replaces the earlier Etsy-order design (email + Etsy order number, Express backend),
> which was never built. The site is now a free training site; see
> `docs/site-rebuild-plan.md` for the full roadmap.

## Current state (Phase 1)

- **Identity:** an Amazon Cognito user pool created by hand in the AWS Console
  (`us-east-1`), configured in `src/aws-exports.js`. See `docs/aws-setup-guide.md`.
- **Sign-in:** email + password through `aws-amplify/auth` (`signIn`).
- **First login:** members created in the console get a temporary password and are sent
  to a forced password-change screen (`confirmSignIn`).
- **Password reset:** `resetPassword` / `confirmResetPassword`, with codes sent by email.
- **Session:** Amplify stores Cognito tokens in the browser; `getCurrentUser()` restores
  the session on page load, so members stay signed in after a refresh.
- **Self-registration:** turned **off** on the pool. Members are added by hand.

### What needs a login

Only the member dashboard (`/dashboard`). Everything else is public: the home page,
Training Lab and quiz, Emergency Directory, Lock It Down guides, and Security Toolbox.
Emergency and safety information must never require an account.

Signed-out visitors who open `/dashboard` are sent to `/login` and returned to the
dashboard after signing in.

## Next (Phase 2)

- Turn on self sign-up for the **existing** pool. Do not create a new pool, or current
  members will lose access.
- Add sign-up and email-verification screens (`signUp` / `confirmSignUp`) in the same
  style as the current sign-in screens.
- Add profiles (display name; role of senior, family member, or caregiver; notification
  preferences) and stored training progress. These need a data backend: Amplify Gen 2
  (DynamoDB) using `referenceAuth` against the existing pool.
- Add a Cognito `admin` group for posting alerts and uploading videos.

## Security notes

- The user pool ID and app client ID in `aws-exports.js` are public identifiers for a
  browser app with no client secret. They are safe to commit.
- Error messages stay generic ("Invalid email or password") so they don't reveal
  whether an email is registered.
- Cognito enforces the password policy and throttles repeated sign-in attempts.
