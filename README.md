# Senior Cyber Secure

Free, friendly scam-safety training for seniors and the families who love them.
Live at https://www.seniorcybersecurityedu.com/.

## Stack

React 18, Vite 6, Tailwind CSS 3, React Router 7, lucide-react icons, and AWS Amplify:
Cognito sign-in plus an Amplify Gen 2 backend (AppSync + DynamoDB) for member profiles,
training progress, and certificates.
Hosted on AWS Amplify Hosting, which builds from `main` using `amplify.yml`. The build
deploys the backend first (`ampx pipeline-deploy`), then the site.

## Run it locally

```bash
npm ci
npm run dev      # http://localhost:5173
npm run build    # production build into dist/ (not committed)
```

Locally there's no `amplify_outputs.json`, so the site runs with sign-in only and profile
features show "coming soon". See `docs/auth-design.md`. One-time AWS setup for the
backend is in `docs/phase2-aws-setup.md`.

## Where things live

| Path | What it is |
|------|------------|
| `src/App.jsx` | Routes, sign-in state, and the signed-in member's profile |
| `src/pages/account/` | Sign-up, email verification, welcome, and profile pages |
| `src/member/` | Profile API calls, member context, plain-language sign-in errors |
| `amplify/` | Amplify Gen 2 backend: reuses the existing sign-in (`auth/`) and defines member data (`data/`) |
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
| `/lock-it-down` | Privacy and security settings guides | No |
| `/security-toolbox` | Recommended security products | No |
| `/signup`, `/verify-email` | Create a free account, confirm email | — |
| `/login`, `/forgot-password`, `/reset-password` | Member sign-in | — |
| `/welcome` | First-time setup (name, role, email alerts) | Yes |
| `/profile` | Edit profile and email alerts | Yes |
| `/dashboard` | Member dashboard | Yes |

## Hosting note: page URLs need a rewrite rule

The site uses real page URLs, so AWS Amplify must send any page address to
`index.html`. In the Amplify Console, open **Hosting → Rewrites and redirects** and add:

| Source address | Target address | Type |
|----------------|----------------|------|
| `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|jpeg\|js\|png\|txt\|svg\|woff\|woff2\|ttf\|map\|json\|webp\|pdf\|mp4\|vtt)$)([^.]+$)/>` | `/index.html` | `200 (Rewrite)` |

Without it, opening or refreshing a page such as `/emergency` directly shows a
"not found" error from Amplify.

## Roadmap

See `docs/site-rebuild-plan.md`.
