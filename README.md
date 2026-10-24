# Senior Cyber Secure

Free, friendly scam-safety training for seniors and the families who love them.
Live at https://www.seniorcybersecurityedu.com/.

## Stack

React 18, Vite 5, Tailwind CSS 3, React Router 6, lucide-react icons, and AWS Amplify
(Cognito sign-in). Hosted on AWS Amplify Hosting, which builds from `main` using
`amplify.yml`.

## Run it locally

```bash
npm ci
npm run dev      # http://localhost:5173
npm run build    # production build into dist/ (not committed)
```

## Where things live

| Path | What it is |
|------|------------|
| `src/App.jsx` | Routes and sign-in state |
| `src/routes.js` | Page URLs (`PATHS`) and which pages need a login |
| `src/pages/` | One file per page; the Training Lab is in `src/pages/training/` |
| `src/components/` | Navigation, footer, and shared cards |
| `src/config.json` | Site text, contact email, Security Toolbox products, Lock It Down links, emergency numbers |
| `public/training-data/` | Scam examples and quiz questions (see its README) |
| `docs/` | AWS setup guide, auth design, and the site rebuild plan |

## Pages

| URL | Page | Login needed? |
|-----|------|---------------|
| `/` | Home | No |
| `/training` | Training Lab (plus `/training/quiz`, `/training/:category`, `/training/:category/:exampleId`) | No |
| `/emergency` | Emergency Directory | No |
| `/lock-it-down` | Privacy and security settings guides | No |
| `/security-toolbox` | Recommended security products | No |
| `/login`, `/forgot-password`, `/reset-password` | Member sign-in | — |
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
