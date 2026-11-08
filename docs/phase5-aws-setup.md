# Phase 5 AWS Setup: Scam Alert Emails (one time)

Phase 5 adds the Scam Alerts page, email sign-up, and the site admin page. The page and
the starter alerts work as soon as the pull request is merged. **Sending email needs the
steps below first.** Until they're done, sign-ups are saved but confirmation emails fail.

| Step | Where | Time |
|------|-------|------|
| 1. Check (or set up) the SES domain identity | SES console + your DNS | 5 min, then up to a day for DNS |
| 2. Request SES production access | SES console | 5 min, then about a day for AWS to reply |
| 3. Create the `admin` group and add yourself | CloudShell | 2 min |
| 4. Optional settings | Amplify console | 2 min |
| 5. Merge the pull request and test | GitHub, then the site | 15 min |

Nothing here changes existing members' logins or data. Do all of this in **US East
(N. Virginia)**.

---

## 1. SES domain identity

1. Open **Amazon SES → Configuration → Identities**.
2. Look for `seniorcybersecurityedu.com`.
   - **Status "Verified"**: you're done with this step. (It may have been set up for
     Part 3 of `docs/aws-setup-guide.md`.)
   - **Not listed**: click **Create identity → Domain**, enter `seniorcybersecurityedu.com`,
     leave **Easy DKIM** (RSA 2048) on, and create it. Add the three `CNAME` records it shows
     wherever your domain's DNS is managed (Route 53 or GoDaddy). Verification usually takes
     15–30 minutes.
3. Recommended: add a DMARC record so Gmail and Yahoo trust the mail. Add a `TXT` record:
   - Name: `_dmarc`
   - Value: `v=DMARC1; p=none; rua=mailto:YOUR-ADDRESS`
   (`p=none` only monitors. It doesn't block anything.)
4. Check **Configuration → Suppression list**: it should suppress **bounces and
   complaints**. That's the default for new accounts, and it keeps bad addresses from
   hurting your sending reputation.

## 2. Request production access

New SES accounts are in the "sandbox": they can only send to addresses you've verified.

1. Open **SES → Account dashboard → Request production access**.
2. Mail type: **Marketing**. (Scam alerts are newsletter-style. Confirmation emails are
   transactional, but one request covers both.)
3. Website URL: `https://www.seniorcybersecurityedu.com`
4. Use case description (edit as you like):

   > Senior Cyber Secure is a free scam-awareness site for older adults. People sign up on
   > our site for scam alerts and new-lesson notices. Every sign-up is confirmed by double
   > opt-in. Every email has a one-click unsubscribe (List-Unsubscribe and
   > List-Unsubscribe-Post) and a preferences link. Bounces and complaints are handled by
   > the SES account suppression list. We expect a few hundred emails a week at first.

**To test before approval:** in **Identities → Create identity → Email address**, verify
your own address. In the sandbox you can then send to it.

## 3. Create the `admin` group and add yourself

Open CloudShell (the **>_** icon, region US East (N. Virginia)). Replace the email with
the one you sign in with, then paste and run:

```bash
POOL_ID=us-east-1_If1TM2kBR
ME=you@example.com   # the email you sign in to the site with

aws cognito-idp create-group --user-pool-id $POOL_ID --group-name admin \
  --description "Site admins: post scam alerts and email subscribers" 2>/dev/null \
  || echo "admin group already exists"
aws cognito-idp admin-add-user-to-group --user-pool-id $POOL_ID --group-name admin --username "$ME"
aws cognito-idp admin-list-groups-for-user --user-pool-id $POOL_ID --username "$ME" \
  --query "Groups[].GroupName"
```

The last command should print `["admin"]`. These commands only add a group. They don't
change any other user pool settings.

**Sign out of the site and sign back in** afterward. Group membership is read at sign-in.
Then **Site Admin** appears under Quick Resources on your dashboard (and in the phone menu).

## 4. Optional settings (Amplify environment variables)

In **Amplify → your app → Hosting → Environment variables**, you can add:

| Variable | What it does | Default |
|----------|--------------|---------|
| `MAILING_ADDRESS` | A postal address shown at the bottom of every email. Recommended: US anti-spam law (CAN-SPAM) expects one on commercial email. A PO box is fine. | none |
| `MAIL_REPLY_TO` | Where replies go, like your contact address | none (replies to noreply) |
| `MAIL_FROM` | The sender | `Senior Cyber Secure <noreply@seniorcybersecurityedu.com>` |
| `SITE_URL` | Address used in email links | `https://www.seniorcybersecurityedu.com` |

Changing these takes effect on the next deploy.

## 5. Merge and test

Merge the pull request. The build adds two tables (`ScamAlert`, `Subscriber`) and three
Lambda functions (`mailer-api`, `mailer-worker`, `mailer-one-click`).

Then test:

1. **Sign-up:** sign out, open `/subscribe`, and enter your email. You should get
   "Please confirm your email for Senior Cyber Secure" from
   `noreply@seniorcybersecurityedu.com`. Tap the button, then **Yes, send me these emails**.
2. **Admin:** sign in, open **Site Admin**, and post a test alert with **Email it to
   scam-alert subscribers now** ticked. You should get the alert email within a minute.
   Then delete the test alert.
3. **Unsubscribe:** in that email, use **Stop scam alert emails** at the bottom. In Gmail,
   the **Unsubscribe** link next to the sender's name should also work.
4. **Profile:** on **My Profile**, change your email choices and save.

### If emails don't arrive

- Open **CloudWatch → Log groups** and look for `mailer-api` or `mailer-worker`. Errors show
  the AWS error name (addresses are never logged).
  - `MessageRejected` / "Email address is not verified": SES is still in the sandbox
    (step 2), or the domain isn't verified (step 1).
  - `AccessDenied`: let me know. The functions' permissions need a look.
- Check your spam folder. Adding DMARC (step 1.3) helps.

### Undo

Reverting the pull request removes the Scam Alerts pages and the email functions.
**It can also delete the `ScamAlert` and `Subscriber` tables and their data.** Export the
subscriber list first if you want to keep it.

## Costs

At this site's size, nearly free: SES charges about $0.10 per 1,000 emails, and the
Lambda functions and tables stay within or near the AWS free tier.
