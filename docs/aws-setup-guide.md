# AWS Setup Guide — Senior Cyber Secure Member Backend

This guide walks you through every AWS step to go live with member logins,
forced password change on first login, and self-service password reset.

---

## Architecture Overview

```
Your Browser ──► AWS Amplify Hosting (seniorcybersecurityedu.com)
                       │
                       ▼
               Amazon Cognito User Pool
               (handles all login / auth)
                       │
                       ▼
               Amazon SES (sends password-reset emails)
```

No server to maintain. No database to manage. AWS handles all of it.

---

## Part 1 — Create a Cognito User Pool

### Step 1.1 — Open Cognito in AWS Console

1. Sign in to the [AWS Console](https://console.aws.amazon.com)
2. In the search bar at the top, type **Cognito** and click it
3. Click **"Create user pool"**

### Step 1.2 — Configure sign-in options

| Setting | Value |
|---------|-------|
| Sign-in options | ✅ Email |
| User name requirements | leave unchecked |

Click **Next**.

### Step 1.3 — Configure security requirements

| Setting | Value |
|---------|-------|
| Password policy mode | Cognito defaults (or Custom) |
| Minimum password length | **8** |
| Password requirements | ✅ Uppercase, ✅ Lowercase, ✅ Numbers |
| Multi-factor authentication | **No MFA** (or Optional — your choice) |
| User account recovery | ✅ Enable self-service account recovery |
| Delivery method for recovery | **Email only** |

Click **Next**.

### Step 1.4 — Configure sign-up experience

| Setting | Value |
|---------|-------|
| Self-registration | **Disabled** ← important! You add users manually |
| Attribute verification | ✅ Send email message, verify email address |
| Required attributes | `email` |
| Custom attributes | Add `phone_number` (optional but recommended) |

Click **Next**.

### Step 1.5 — Configure message delivery

| Setting | Value |
|---------|-------|
| Email provider | **Send email with Cognito** (for testing) |

> **For production:** After verifying your domain in SES, come back and change
> this to "Send email with Amazon SES" and select your verified identity.
> This ensures password-reset emails come from `noreply@seniorcybersecurityedu.com`
> instead of a generic Cognito address.

Click **Next**.

### Step 1.6 — Integrate your app

| Setting | Value |
|---------|-------|
| User pool name | `seniorcybersecure-prod` |
| Hosted authentication pages | **Do NOT enable** (we use our own login UI) |
| Initial app client | Public client |
| App client name | `seniorcybersecure-web` |
| Client secret | **Don't generate a client secret** |

Click **Next**, review, then **Create user pool**.

### Step 1.7 — Copy your IDs

After creation, you'll land on the User Pool detail page.

1. Copy the **User pool ID** — looks like `us-east-1_AbCdEfGhI`
2. Click **App clients** in the left sidebar
3. Copy the **Client ID** — looks like `1a2b3c4d5e6f7g8h9i0j`

Open `src/aws-exports.js` in your project and paste them in:

```js
userPoolId: 'us-east-1_AbCdEfGhI',       // ← paste here
userPoolClientId: '1a2b3c4d5e6f7g8h9i0j', // ← paste here
region: 'us-east-1',                       // ← your region
```

---

## Part 2 — Add Members (Manual Process)

You add each member through the AWS Console. They receive a welcome email
with a temporary password and are forced to change it on first login.

### Adding a new member

1. Go to **Cognito → User pools → seniorcybersecure-prod**
2. Click the **Users** tab
3. Click **Create user**

| Field | Value |
|-------|-------|
| Invitation message | ✅ Send an email invitation |
| Email address | Member's email |
| Email address verified | ✅ Mark as verified |
| Temporary password | Set one (or let Cognito generate it) |
| Phone number | Member's phone (optional attribute) |

4. Click **Create user**

The member receives an email with their temporary password. On first login,
the site automatically shows the "Create Your Password" screen.

### What the member sees

1. **Email arrives** with subject: "Your temporary password"
2. Member goes to `seniorcybersecurityedu.com` and clicks "Member Login"
3. Enters email + temporary password
4. **Automatically prompted**: "Create Your Password" — sets their permanent password
5. Lands on Member Dashboard with full access to all protected sections

### Disabling a member

1. Click the member's username in the Users list
2. Click **Disable user** — they immediately lose access

---

## Part 3 — Set Up Amazon SES (for professional email)

This makes password-reset emails come from `noreply@seniorcybersecurityedu.com`.

### Step 3.1 — Verify your domain

1. Go to **Amazon SES** in the AWS Console
2. Click **Verified identities → Create identity**
3. Select **Domain**, enter `seniorcybersecurityedu.com`
4. AWS gives you DNS records — add them to your domain registrar (GoDaddy)
5. Wait for verification (usually 15–30 minutes)

### Step 3.2 — Request production access

SES starts in sandbox mode (can only send to verified emails). To send to anyone:

1. In SES, click **Account dashboard**
2. Click **Request production access**
3. Fill out the form explaining your use case (member email notifications)
4. Usually approved within 24 hours

### Step 3.3 — Connect SES to Cognito

1. Go back to **Cognito → Your user pool → Messaging**
2. Change **Email provider** to **Amazon SES**
3. Select your verified SES identity
4. Set **FROM email**: `noreply@seniorcybersecurityedu.com`
5. Set **FROM name**: `Senior Cyber Secure`
6. Save changes

### Custom email templates (optional but recommended)

In Cognito → Messaging → Email templates, customize:

- **Invitation template** (welcome email with temp password):
  ```
  Subject: Welcome to Senior Cyber Secure — Your Login Details

  Hello,

  Your member account for seniorcybersecurityedu.com has been created.

  Email: {username}
  Temporary Password: {####}

  Visit the website and click "Member Login" to get started.
  You'll be asked to create a permanent password on your first login.

  Questions? Reply to this email.

  — The Senior Cyber Secure Team
  ```

- **Password reset template**:
  ```
  Subject: Senior Cyber Secure — Your Password Reset Code

  Your password reset verification code is: {####}

  This code expires in 1 hour. If you didn't request this, ignore this email.

  — The Senior Cyber Secure Team
  ```

---

## Part 4 — Deploy to AWS Amplify Hosting

### Step 4.1 — Connect your repository

1. Go to **AWS Amplify** in the AWS Console
2. Click **New app → Host web app**
3. Choose **GitHub** and authorize AWS
4. Select your repository (`cyberscam` or whatever it's named)
5. Select branch: **master** (or main)

### Step 4.2 — Build settings

Amplify detects the `amplify.yml` file automatically. Confirm the settings:

```yaml
Build command:  npm run build
Build output:   dist
```

### Step 4.3 — Environment variables (optional)

If you ever move Cognito config out of the source file:

| Key | Value |
|-----|-------|
| `VITE_USER_POOL_ID` | your pool ID |
| `VITE_USER_POOL_CLIENT_ID` | your client ID |

### Step 4.4 — Add your custom domain

1. In Amplify, click **Domain management**
2. Click **Add domain**
3. Enter `seniorcybersecurityedu.com`
4. Follow the DNS instructions to point your GoDaddy domain to Amplify
5. Amplify automatically provisions an SSL certificate

> **Note:** You'll update your GoDaddy DNS to point to Amplify, then remove
> the old `.cpanel.yml` deployment. Once DNS propagates, your site is live on Amplify.

---

## Part 5 — Go-Live Checklist

- [ ] Cognito User Pool created
- [ ] `src/aws-exports.js` updated with real Pool ID and Client ID
- [ ] Code committed and pushed to GitHub
- [ ] Amplify app connected to GitHub repo
- [ ] Custom domain configured in Amplify
- [ ] Domain DNS updated at GoDaddy to point to Amplify
- [ ] SES domain verified
- [ ] SES production access approved
- [ ] Cognito messaging updated to use SES
- [ ] Custom email templates set
- [ ] Test member created and login flow verified end-to-end
- [ ] Password reset flow tested

---

## Quick Reference — AWS Region

Use a single region for everything (Cognito, SES, Amplify). Recommended: **us-east-1** (N. Virginia).

If your members are primarily in another region, you can choose us-west-2 (Oregon) instead,
but consistency matters — whatever region you pick, use it for all three services.

---

## Support

- AWS Cognito docs: https://docs.aws.amazon.com/cognito/
- AWS Amplify Hosting docs: https://docs.aws.amazon.com/amplify/latest/userguide/
- AWS SES docs: https://docs.aws.amazon.com/ses/
