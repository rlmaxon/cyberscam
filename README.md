# Senior Cyber Secure

Free, friendly scam-safety training for seniors and the families who love them.
Live at https://www.seniorcybersecurityedu.com/.

## Stack

React 18, Vite 6, Tailwind CSS 3, React Router 7, lucide-react icons, and AWS Amplify:
Cognito sign-in plus an Amplify Gen 2 backend (AppSync + DynamoDB) for member profiles,
training progress, certificates, Family Circle, Scam Alerts, and email subscriptions.
Email goes out through Amazon SES from three small Lambda functions
(`amplify/functions/mailer/`).
Hosted on AWS Amplify Hosting, which builds from `main` using `amplify.yml`. The build
deploys the backend first (`ampx pipeline-deploy`), then the site.

## Run it locally

```bash
npm ci
npm run dev      # http://localhost:5173
npm run build    # production build into dist/ (not committed)
npm run test:mailer        # tests for the email logic (no AWS needed)
npm run typecheck:backend  # type-check the amplify/ folder
```

Locally there's no `amplify_outputs.json`, so the site runs with sign-in only and profile
features show "coming soon". See `docs/auth-design.md`. One-time AWS setup for the
backend is in `docs/phase2-aws-setup.md`; email setup (SES and the admin group) is in
`docs/phase5-aws-setup.md`.

## Where things live

| Path | What it is |
|------|------------|
| `src/App.jsx` | Routes, sign-in state, and the signed-in member's profile |
| `src/pages/account/` | Sign-up, email verification, welcome, and profile pages |
| `src/member/` | Profile API calls, member context, plain-language sign-in errors |
| `amplify/` | Amplify Gen 2 backend: reuses the existing sign-in (`auth/`) and defines member data (`data/`) |
| `amplify/functions/mailer/` | Email sign-up, confirmation, unsubscribe, alert and family emails (logic in `core.ts`, templates in `emails.ts`) |
| `src/alerts/` | Scam Alerts and email API calls |
| `src/pages/alerts/`, `src/pages/admin/` | Scam Alerts, email sign-up, confirm and preference pages; site admin page |
| `src/routes.js` | Page URLs (`PATHS`) and which pages need a login |
| `src/pages/` | One file per page; the Training Lab is in `src/pages/training/` |
| `src/components/` | Navigation, footer, and shared cards |
| `src/config.json` | Site text, contact email, Security Toolbox products, Lock It Down links, emergency numbers |
| `public/training-data/` | Lessons (`modules.json`), scam examples, quiz and final exam questions (see its README) |
| `src/pages/learn/` | Learning path, lesson steps, final exam, certificate |
| `src/training/` | Content loading, progress rules, example labels, certificate PDF |
| `docs/` | AWS setup guide, auth design, and the site rebuild plan |

## Pages

| URL | Page | Login needed? |
|-----|------|---------------|
| `/` | Home | No |
| `/learn` | The learning path: 8 lessons, progress, "continue" button | No (guests save on their device) |
| `/learn/:lesson/:step` | One lesson: `learn` → `practice` → `actions` → `check` | No |
| `/learn/final-exam` | Final exam (unlocks after all 8 lessons) | Yes |
| `/certificate` | Create, download, print, and share the certificate | Yes |
| `/verify/:id` | Public certificate check | No |
| `/training` | Scam Example Library (plus `/training/quiz`, `/training/:topic`, `/training/:topic/:exampleId`) | No |
| `/emergency` | Emergency Directory | No |
| `/alerts`, `/alerts/:id` | Scam Alerts (starter alerts plus ones posted on `/admin`) | No |
| `/subscribe` | Email sign-up (double opt-in) | No |
| `/subscribe/confirm` | Confirmation link from the sign-up email | No |
| `/email-preferences` | Change or stop emails, from the link in any email (`/unsubscribe` redirects here) | No |
| `/admin` | Post alerts, email subscribers, announce new training, product click counts (Cognito `admin` group) | Yes, admins |
| `/downloads` | Printable wallet cards and checklists for every lesson (PDF) | No |
| `/affiliate-disclosure` | Affiliate Disclosure | No |
| `/lock-it-down` | Privacy and security settings guides | No |
| `/security-toolbox` | Recommended security products (affiliate links) | No |
| `/signup`, `/verify-email` | Create a free account, confirm email | — |
| `/login`, `/forgot-password`, `/reset-password` | Member sign-in | — |
| `/welcome` | First-time setup (name, role, email alerts) | Yes |
| `/profile` | Edit profile, email alerts, and Family Circle emails | Yes |
| `/dashboard` | Member dashboard | Yes |

## Hosting note: page URLs need a rewrite rule

The site uses real page URLs, so AWS Amplify must send any page address to
`index.html`. In the Amplify Console, open **Hosting → Rewrites and redirects** and add:

| Source address | Target address | Type |
|----------------|----------------|------|
| `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|jpeg\|js\|png\|txt\|svg\|woff\|woff2\|ttf\|map\|json\|webp\|pdf\|mp4\|vtt)$)([^.]+$)/>` | `/index.html` | `200 (Rewrite)` |

Without it, opening or refreshing a page such as `/emergency` directly shows a
"not found" error from Amplify.

## Scam Alerts and email

- **Starter alerts** are in `public/training-data/alerts.json` (edit with a commit).
  Alerts posted on `/admin` are stored in the database and appear above them.
- **Sign-up** needs no account. Nothing is sent until the person taps the link in the
  confirmation email. Confirmation emails are limited to one every 10 minutes and five a
  day per address, and the form gives the same answer either way.
- **Members** choose their emails on `/profile`. Their email is already verified, so
  there's no confirmation step.
- **Every email** has a "change which emails you get" link and an unsubscribe link, plus
  the one-click `List-Unsubscribe` header that Gmail, Yahoo and Apple Mail use.
- **Family Circle emails:** a learner gets an email when approved family send a cheer
  (at most one every two hours), and family get an email when the person they follow earns
  a badge or the certificate. Both are on by default and can be turned off.
- **Text messages** are shown as "coming soon". No phone numbers are collected. Each
  subscriber record has a `channels` list (`["email"]`) so texts can be added later.
- Sending is paced at about 8 emails a second. One send can reach roughly 7,000 people
  within the 15-minute Lambda limit; past that, the worker will need batching.

## Affiliate links and printables

- **Affiliate links:** paste tracking links into `affiliateUrl` in `src/config.json`.
  `docs/affiliate-setup.md` has the details. Product links are marked
  `rel="sponsored noopener"`, and clicks are counted by product and page only
  (`AffiliateClickDaily`, written by the AppSync resolver `amplify/data/recordAffiliateClick.js`).
- **Printables:** wallet cards and checklists are built in the browser from
  `modules.json` (`card.redFlags`, `card.rule`, `card.say`, `actions`, `sayThis`) by
  `src/training/printables.js`. Editing a lesson's text updates its PDFs.

## Roadmap

See `docs/site-rebuild-plan.md`.
