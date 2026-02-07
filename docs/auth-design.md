# Parent Protection Kit - Authentication Design

## Overview

This document outlines the authentication system design for verifying Etsy "Parent Protection Kit" purchasers and granting them access to the member-only companion website.

## Current State

- 100% frontend React app (Vite + Tailwind), no backend
- Login accepts email + Etsy order number with no real validation
- Session state is in-memory React state, lost on page refresh
- No database, no API, no persistent user storage

## Authentication Flow

### First-Time Activation (Email + Etsy Order #)

```
User enters email + Etsy order number
        |
        v
Backend checks verified_orders table
        |
        +--> No match: "Order not found" error
        |
        +--> Match found, already activated: "Account exists, log in with password"
        |
        +--> Match found, not activated:
                |
                v
        Prompt user to set a password
                |
                v
        Hash password (bcrypt), store in users table
        Mark account as activated
        Create session, redirect to dashboard
```

### Returning User Login (Email + Password)

```
User enters email + password
        |
        v
Backend checks users table
        |
        +--> No match or wrong password: "Invalid credentials" (generic message)
        |
        +--> Match: Create session, redirect to dashboard
```

### Password Reset

```
User clicks "Forgot Password"
        |
        v
Enter email address
        |
        v
Backend generates time-limited reset token (1 hour expiry)
Sends reset link via email
        |
        v
User clicks link, enters new password
        |
        v
Backend validates token, updates password hash
```

## Order Verification Strategy

Etsy does not provide a public API for third parties to verify orders against customer emails. Two options:

### Option A: Pre-loaded Order Registry (Recommended)

- Export orders from Etsy as CSV or enter manually
- Import into `verified_orders` table with email + order number
- At login, check submitted credentials against this table

### Option B: Etsy Open API v3 Integration (Future)

- Authenticate as shop owner via Etsy OAuth
- Query `GET /v3/application/shops/{shop_id}/receipts` to match orders
- Requires API key approval, rate limit management, ongoing maintenance

**Recommendation:** Start with Option A for simplicity and reliability.

## Database Schema

### `verified_orders`

| Column             | Type      | Notes                          |
|--------------------|-----------|--------------------------------|
| id                 | UUID/INT  | Primary key                    |
| email              | VARCHAR   | Buyer's email (from Etsy)      |
| etsy_order_number  | VARCHAR   | Etsy receipt/order ID           |
| imported_at        | TIMESTAMP | When the order was imported     |

### `users`

| Column          | Type      | Notes                              |
|-----------------|-----------|------------------------------------|
| id              | UUID/INT  | Primary key                        |
| email           | VARCHAR   | Unique, from verified_orders       |
| password_hash   | VARCHAR   | bcrypt hash                        |
| display_name    | VARCHAR   | Optional                           |
| order_id        | FK        | References verified_orders.id      |
| activated_at    | TIMESTAMP | NULL until first password set      |
| created_at      | TIMESTAMP | Auto-generated                     |

### `sessions`

| Column     | Type      | Notes                        |
|------------|-----------|------------------------------|
| id         | UUID      | Primary key / session token  |
| user_id    | FK        | References users.id          |
| expires_at | TIMESTAMP | Session expiry               |
| created_at | TIMESTAMP | Auto-generated               |

## API Endpoints

| Method | Path                   | Purpose                              |
|--------|------------------------|--------------------------------------|
| POST   | /api/auth/verify-order | Check email + order # against DB     |
| POST   | /api/auth/activate     | Set password on first login          |
| POST   | /api/auth/login        | Email + password login               |
| POST   | /api/auth/logout       | Invalidate session                   |
| GET    | /api/auth/me           | Return current user (session check)  |
| POST   | /api/auth/forgot       | Request password reset email         |
| POST   | /api/auth/reset        | Reset password with token            |

## Security Requirements

- **Password hashing:** bcrypt (cost factor 12) or argon2
- **Password policy:** Minimum 8 characters
- **Rate limiting:** Max 5 login attempts per 15 minutes per IP
- **Sessions:** HTTP-only, Secure, SameSite cookies (not localStorage)
- **HTTPS:** Required in production
- **CSRF protection:** Token-based if using cookies
- **Generic error messages:** "Invalid credentials" — never reveal if email exists

## Frontend Changes

1. **Two-phase login form:**
   - Phase 1 (new users): Email + Etsy Order # -> "Set Password" screen
   - Phase 2 (returning users): Email + Password -> normal login
   - Toggle between "I'm a new member" / "I already have an account"
2. **Session persistence:** On app load, call `GET /api/auth/me` to restore state
3. **Auth context/provider:** Replace `isLoggedIn` state with React context
4. **Password reset page:** Linked from login form
5. **Loading/error states:** Proper feedback during API calls

## Edge Cases & Considerations

| Concern                     | Decision Needed                                                     |
|-----------------------------|---------------------------------------------------------------------|
| Multiple kits, same email   | One account per email, multiple orders can be linked                |
| Gift purchases              | Buyer email != recipient; need gift activation or transfer flow     |
| Order number format         | Etsy orders are numeric; validate format on input                   |
| Account sharing             | 1 order = 1 account; reject duplicate activations per order         |
| Refunds/cancellations       | Consider deactivating account on refund                             |
| Data retention & privacy    | Privacy policy required; consider GDPR for EU customers             |
| Brute force on order #s     | Rate limiting + optional CAPTCHA                                    |
| Admin tooling               | Need admin page/script to import orders and manage users            |

## Tech Stack Recommendations

### Backend Options (pick one)

| Option          | Pros                              | Cons                          |
|-----------------|-----------------------------------|-------------------------------|
| Express + Node  | Same JS ecosystem as frontend     | More to build yourself        |
| Supabase        | Managed DB + auth, fast to ship   | Less control, vendor lock-in  |
| Next.js (migrate)| API routes built-in, SSR benefits | Requires Vite->Next migration |

### Database Options

| Option      | Pros                        | Cons                       |
|-------------|-----------------------------|----------------------------|
| PostgreSQL  | Robust, widely supported    | Needs hosting              |
| SQLite      | Simplest, file-based        | Not great for production   |
| Supabase DB | Managed Postgres, free tier | Vendor dependency          |

### Email Service (for password reset)

- Resend, SendGrid, or AWS SES

### Hosting

- Frontend: Vercel, Netlify, or Cloudflare Pages (static)
- Backend: Railway, Render, Fly.io, or a VPS

## Implementation Order

1. Stand up backend server (Express + PostgreSQL or Supabase)
2. Create database tables (`verified_orders`, `users`, `sessions`)
3. Build order verification + account activation endpoints
4. Build email + password login endpoint
5. Add session management with HTTP-only cookies
6. Update React frontend with two-phase login and auth context
7. Add password reset flow via email
8. Build admin order import (CSV upload or manual entry)
9. Deploy backend, update frontend deployment
10. Write privacy policy
