# Authentication Design

> Replaces the earlier Etsy-order design (email + Etsy order number, Express backend),
> which was never built. The site is now a free training site; see
> `docs/site-rebuild-plan.md` for the full roadmap.

## Current state (Phase 2)

- **Identity:** an Amazon Cognito user pool created by hand in the AWS Console
  (`us-east-1`), configured in `src/aws-exports.js`. See `docs/aws-setup-guide.md`.
- **Sign-in:** email + password through `aws-amplify/auth` (`signIn`).
- **First login:** members created in the console get a temporary password and are sent
  to a forced password-change screen (`confirmSignIn`).
- **Password reset:** `resetPassword` / `confirmResetPassword`, with codes sent by email.
- **Session:** Amplify stores Cognito tokens in the browser; `getCurrentUser()` restores
  the session on page load, so members stay signed in after a refresh.
- **Self-registration:** turned **on** (see `docs/phase2-aws-setup.md`). Visitors create
  an account at `/signup` (`signUp`), confirm their email with a 6-digit code at
  `/verify-email` (`confirmSignUp`, `resendSignUpCode`), and are signed in automatically
  (`autoSignIn`). Signing in with an unconfirmed email sends a fresh code and goes to
  that step. Console-created members still work as before.
- **Profiles:** after the first sign-in, members fill in a short Welcome step
  (`/welcome`): name, role (senior, family member, caregiver), and email alert choices.
  They can change these later at `/profile`. Profiles are stored through the Amplify Gen 2
  data API (`amplify/data/resource.ts`) with **owner-only** access: each member can only
  read and change their own record.
- **Backend link:** `amplify/auth/resource.ts` uses `referenceAuth` to reuse the existing
  user pool plus an identity pool and two IAM roles created by the Phase 2 setup script.
  Amplify never modifies these; it only reads them.

### What needs a login

The member dashboard, Welcome step, and profile (`/dashboard`, `/welcome`, `/profile`).
Everything else is public: the home page,
Training Lab and quiz, Emergency Directory, Lock It Down guides, and Security Toolbox.
Emergency and safety information must never require an account.

Signed-out visitors who open `/dashboard` are sent to `/login` and returned to the
dashboard after signing in.

## Without the backend

`src/amplifyConfig.js` uses `amplify_outputs.json` (generated during the Amplify build)
when it exists. Otherwise it falls back to `src/aws-exports.js`, which covers sign-in only.
In that case sign-up still works, the Welcome step is skipped, and the profile page
says settings are coming soon. Local development (`npm run dev`) runs this way.

## Next

- Training progress, badges, and family links (Phases 3–4) become new models in
  `amplify/data/resource.ts`.
- A Cognito `admin` group for posting alerts and uploading videos (Phase 7).
- Switch Cognito email to Amazon SES before promoting the site (about 50 emails a day otherwise).

## Security notes

- The user pool ID and app client ID in `aws-exports.js` are public identifiers for a
  browser app with no client secret. They are safe to commit.
- Error messages stay generic ("Invalid email or password") so they don't reveal
  whether an email is registered.
- Cognito enforces the password policy and throttles repeated sign-in attempts.
