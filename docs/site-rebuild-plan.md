You are working in my GitHub repo rlmaxon/cyberscam, live on AWS Amplify Hosting at
https://www.seniorcybersecurityedu.com/. BUILD ON THE EXISTING CODE — extend and fix what is
already there; do not rebuild working features from scratch. Read the whole repo first.

## Current state (audited Oct 2026 — verify, then build on it)
Stack: React 18 + Vite 5 + Tailwind 3 + lucide-react + aws-amplify v6. Nearly all UI is in
src/App.jsx (~2,600 lines). Navigation is a `currentPage` useState switch (no router).
Amplify Hosting builds the frontend only (amplify.yml); there is no backend code in the repo.

Already WORKING — keep and extend:
- Cognito auth (hand-created pool configured in src/aws-exports.js, us-east-1): email +
  password login, forced new-password on first login, forgot/reset password, and session
  restore on refresh via getCurrentUser(). Self-registration is DISABLED on the pool (I
  create members by hand, per docs/aws-setup-guide.md).
- Training Lab: 4 categories (email, text, marketplace, pop-up) with 26 examples loaded from
  public/training-data/*.json (schema: id, title, type, difficulty, isScam, sender, subject,
  body, redFlags, explanation, howToSpot). Includes legitimate examples, a difficulty filter,
  a detail view with expandable red flags / explanation / "How to Protect Yourself", and
  print styles.
- Quiz engine: 12 questions in quiz.json, category filter, instant explanation after each
  answer, results with a 70% pass mark, per-question review mode, and printable results.
- Emergency Directory (config.emergency: reporting / credit / government, with tap-to-call
  numbers) and a 5-step "If you think you've been scammed" box.
- "Lock It Down" Resource Center: manufacturer how-to links for Windows, Mac, iPhone,
  Android, Chrome, Safari, and Firefox (hardcoded in App.jsx).
- Security Toolbox (affiliate marketplace): 4 categories × 3 products from config.products,
  with an affiliate disclosure already on the page.
- Landing page: stats section, "Wall of Deception" (6 scam cards), and feature cards.
- Senior-friendly basics: 18px body text, visible focus outlines, Source Sans 3.

Present but FAKE, BROKEN, or WRONG — fix:
- Member Dashboard module progress is hardcoded (every user sees modules 1–2 "completed"),
  and its 6 module names don't match the Training Lab categories.
- Dashboard "Downloadable Materials" and "Latest Scam Alerts" buttons do nothing.
- Footer "Privacy Policy", "Affiliate Disclosure", and "Terms of Service" do nothing.
- PROTECTED_PAGES puts Emergency, Resources, Marketplace, and Training behind login.
  Emergency help must never require a login.
- Etsy / "Parent Protection Kit" / "Kit Companion" / "Already a Member?" / "Members-Only"
  copy is throughout: config.store, landing CTAs, nav subtitle, footer, dashboard header,
  index.html title and meta, docs/auth-design.md.
- Marketplace links are plain vendor homepages (no affiliate IDs); prices and star ratings
  are hardcoded and will go stale; links lack rel="sponsored".
- Landing stats cite FBI IC3 2024 — verify every figure against the latest published
  report and cite sources on the page. Remove unsourced or irrelevant ones ("every 39
  seconds", "72% of organizations").
- The "Wall of Deception" duplicates scam examples in JSX; pull them from the JSON instead.
- The quiz uses a blocking window.confirm() on exit; replace it with an in-page dialog.
- Many labels use text-xs / text-sm (12–14px), which is too small for seniors.

Repo hygiene:
- dist/ is committed and stale (built Feb 2026, before Cognito). Amplify builds from
  source, so remove dist/ and gitignore it.
- public/hero-banner.jpg.png (1.4 MB) is unused — delete it.
- .cpanel.yml is unused (hosting is Amplify) — delete it.
- vite.config.js hardcodes server.host 192.168.68.72 — remove it.
- vite.config.js base './' will break deep links once routing is added — change it to '/'.
- PR #10 (claude/add-member-login-nNc4l) is open with no changes left — close it and
  delete stale branches.
- docs/auth-design.md describes an Etsy-order Express backend that was never built —
  replace it.
- There is no root README, lint config, or tests.

## Goal
Turn this from an Etsy kit companion into a free, standalone scam-awareness and training
site for senior citizens. The MARKETING DRAW is the adult children of seniors
("Protect Mom and Dad from scams"); the TRAINING EXPERIENCE is built for the seniors
themselves. Affiliate links fund the site, so the marketplace stays.

## Name and positioning
- Remove "Parent Protection Kit" everywhere. Keep "Senior Cyber Secure" with a plain
  tagline, e.g. "Free scam-safety training for seniors and the families who love them."
  Offer me 2–3 tagline options.
- A first-time visitor should understand within 5 seconds what the site is, who it's for,
  and what to do next ("Start free training" / "Sign up your parent").

## Accessibility (seniors)
- Minimum 16px for any text and 18px for body text; add a text-size toggle.
- High contrast; tap targets ≥48px; plain language (≤8th-grade reading level).
- No time limits; one task per screen; clear "Back" / "Next" buttons.
- Target WCAG 2.2 AA.

## Requirements

1. Remove Etsy, open up public pages, and add routing (do this first)
   - Delete config.store and all Etsy CTAs. Rewrite kit/member copy to fit a free site.
   - Make Home, Emergency Directory, Lock It Down, Security Toolbox, Scam Alerts, and the
     Training Lab example browser public. Require login only for saving progress, tests
     toward the certificate, the dashboard, family features, and profile.
   - Add React Router with real URLs (e.g. /training/email/:exampleId, /emergency,
     /verify/:certId). Add the Amplify Hosting SPA rewrite rule.
   - Split App.jsx into pages/ and components/, preserving the current visual design.
     Move the Lock It Down links into config or JSON like the other content.

2. Accounts — extend the EXISTING Cognito pool, don't replace it
   - Turn on self sign-up for the existing user pool (tell me the exact console change, or
     do it in code if the backend is moved to Amplify Gen 2 using `referenceAuth` against
     the existing pool). Do NOT create a new user pool — existing members must keep working.
   - Add sign-up and email-verification screens using signUp / confirmSignUp, reusing the
     style of the existing login, forced-password, and reset screens.
   - Profile: display name, role (senior / family member / caregiver), and notification
     preferences.
   - For data storage (profiles, progress, badges, family links, subscribers, alerts),
     add a backend: Amplify Gen 2 (Data/DynamoDB, Storage/S3, Functions) referencing
     the existing auth. Update amplify.yml to deploy the backend.

3. Turn the Training Lab into a simple, linear learning path
   - Keep the existing example browser, detail view, and print support. Wrap them in a
     guided path: "Your Training: Step 3 of 8," with one big "Continue" button and
     completed / current / locked states. Replace the hardcoded dashboard module list
     with real progress.
   - 8 modules. The existing JSON maps to modules 1, 2, 4, and 6; add new JSON files in
     the SAME schema for the rest:
     (1) Phishing Email [email-scams.json]
     (2) Text Message Scams [text-scams.json]
     (3) Phone and Voice Scams, including AI voice cloning / "grandparent" scams [new]
     (4) Tech-Support Pop-ups [popup-scams.json]
     (5) Government Impersonation (IRS / SSA / Medicare) [new]
     (6) Online Marketplace [marketplace-scams.json]
     (7) Romance Scams [new]
     (8) Investment and Crypto [new]
   - Each module follows the same pattern:
       Learn (short lesson — add a lesson JSON per module)
       → Spot the Red Flags (the existing examples, plus a "Scam or Legit?" guess
         before the reveal)
       → What To Do (checklist)
       → Quick Check (test).
   - Add 2–4 examples to each existing category so every module has at least 6
     (include legitimate ones).
   - Save progress per user so a senior can stop and resume on any device. Show
     "Welcome back — pick up where you left off."

4. Tests and certificate — reuse the existing quiz engine
   - Generalize TrainingLabQuiz into module tests (5–10 questions each) and a final exam.
     Add questions to quiz.json (category = module key). Make the pass mark a config
     value (default 80%; the current quiz uses 70%). Retakes are unlimited, there's no
     timer, and the existing explanation and review features stay.
   - The final exam unlocks once all 8 modules are passed.
   - Certificate: a PDF with name, date, and a unique ID; a public page at
     /verify/:certId; and a "Share with family" button.

5. Engagement (encouraging, never competitive)
   - "Scam Shield": a dashboard shield with 8 segments that fill in as modules are
     passed.
   - Badges: one per module (e.g., "Phishing Spotter," "Phone Scam Stopper") and
     milestone badges: "First Step," "Halfway There," "Scam Buster" (certificate
     earned), and "Sharp Eye" (100% on a test). Show a short celebration screen when
     one is earned.
   - Scam of the Week: a 2-minute "Scam or Legit?" challenge with a gentle weekly streak
     (no guilt messaging) that links to the latest alert.
   - Family Safety Plan: a checklist a parent and child complete together (family code
     word, bank fraud numbers on the fridge, two-factor login on email, and so on). It
     earns a "Family Safe" badge for both. Build on the existing "Family Action Plan"
     feature-card idea.
   - No leaderboards, countdown timers, or ranking.

6. Family link
   - A family member invites a parent by email. After the parent accepts, the family
     member sees the parent's progress read-only: the shield, badges, current module,
     scores, and certificate.
   - Family members can send preset "cheers" that show on the parent's dashboard and
     arrive by email. Family members get an email when the parent earns a badge or the
     certificate.
   - Either side can unlink. A family member can link to multiple parents.

7. Affiliate marketplace (revenue) — extend the existing Security Toolbox
   - Keep config.products. Add an affiliateUrl field per product (falling back to the
     current url) so I can paste program links once I'm approved (e.g., Amazon Associates,
     Norton, NordVPN, Bitdefender, or Aura).
   - Remove hardcoded prices and ratings, or label them "as of <date>".
   - Add rel="sponsored noopener" to affiliate links.
   - Keep the existing disclosure, and add it to any other page with affiliate links. Make
     the footer "Affiliate Disclosure" link a real page.
   - Add a "Recommended tools" box at the end of relevant modules — never inside a lesson
     or test.
   - Track outbound affiliate clicks (product and page only, no personal data).

8. Downloadable materials
   - Make the dead "Downloadable Materials" dashboard card work: printable PDFs per
     module (red-flag wallet card, what-to-do checklist), building on the existing print
     styles.

9. Training video placeholder
   - A Videos page, plus a video slot in each module that shows a "Video coming soon"
     card when empty.
   - Admin-only upload (Cognito "admin" group) to S3 with title, description, module, and
     a required captions file (.vtt).

10. Scam-help chatbot placeholder
   - An "Ask about a scam" page and a floating help button with a chat UI, wired to a
     stub POST /api/chat that returns a canned reply, so I can plug in an LLM later
     without changing the UI.
   - Always show the emergency banner: "If you sent money or shared passwords, call your
     bank now." Link to the existing Emergency Directory and to reportfraud.ftc.gov,
     ic3.gov, and the AARP Fraud Watch Helpline (877-908-3360).
   - Warn users not to type card numbers or passwords. Don't log personal information.

11. Alerts and notifications (email now, SMS later)
   - Make the dead "Latest Scam Alerts" card work: a public Scam Alerts page and an admin
     form to post an alert (title, summary, severity, date).
   - A sign-up form (no account needed) for Scam Alerts, New Training Material, and New
     Videos. Email goes through Amazon SES — reuse the SES domain identity from
     docs/aws-setup-guide.md Part 3 — with double opt-in, one-click unsubscribe, and a
     preference center for logged-in users.
   - SMS placeholder: a disabled "Text alerts — coming soon" option. Collect no phone
     numbers. Design the subscriber model so a channel can be added later.

12. Legal pages and SEO
   - Privacy Policy, Terms, and Affiliate Disclosure pages, wired to the existing footer
     links.
   - Per-page titles and meta descriptions, Open Graph tags (shared links should look good
     on Facebook), and sitemap.xml.

13. Hygiene
   - Do the repo cleanup listed above.
   - Add a root README (setup, content editing, deploy). Note that editing training JSON
     now requires a commit and redeploy, since Amplify Hosting has no server file editing
     — fix the training-data README to match.
   - Add ESLint and a basic smoke test (build + key routes render).
   - Check every external link in config and the Resource Center (some Apple support URLs
     look outdated) and report the dead ones.

## How to work
- First, read the whole repo and confirm or correct the "Current state" above. Then give
  me a phased plan. Each phase is its own branch and pull request:
  (1) cleanup + Etsy/name removal + public pages + routing + App.jsx split
      (no visual or behavior regressions)
  (2) self sign-up on the existing Cognito pool + profiles + Gen 2 backend
  (3) learning path + new module content + tests + certificate
  (4) badges, Scam Shield, Scam of the Week, Family Safety Plan, family link
  (5) email alerts + SMS placeholder + Scam Alerts page
  (6) affiliate upgrades + downloadable materials
  (7) video and chatbot placeholders + admin pages + legal/SEO
- Don't push to main. Open a pull request per phase with a summary, screenshots, and
  test steps.
- Before depending on any AWS change (Cognito self sign-up, admin group, SES production
  access, S3 bucket, Gen 2 backend), list it and wait for my OK.
- Ask before deleting any existing training content or changing the site name.
