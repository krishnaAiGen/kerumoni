# Kerumoni — Assamese Pickle E-Commerce

A production-style e-commerce platform for handmade Assamese pickles, built with
Next.js 16 (App Router), PostgreSQL (Firebase / Cloud SQL) via Prisma, Auth.js
(email/password + Google), and Razorpay payments.

## Features

- **Storefront** — landing page, shop grid, product detail with reviews & computed ratings
- **Auth** — email/password + Google OAuth; gated cart, checkout, account, reviews
- **Cart & checkout** — server-persisted cart, server-authoritative totals, ₹40 shipping under ₹500
- **Payments** — Razorpay checkout + HMAC signature verification (falls back to a simulated
  gateway automatically when Razorpay keys are absent, so you can test end-to-end immediately)
- **Orders** — order history with a 4-stage status tracker (Confirmed → Packaged → On the way → Delivered)
- **Admin** — role-gated dashboard: advance order status, create/edit products (image via URL /
  `/public` path), and payment KPIs
- **No DB? No problem** — with `DATABASE_URL` empty the storefront runs on a built-in static
  catalog, so the site is browsable with zero infrastructure.

## Tech stack

Next.js 16 · TypeScript · Tailwind v4 · Prisma 6 · Auth.js v5 · Razorpay · Zod

## Prerequisites you provide

| Value | Where it goes | Notes |
|---|---|---|
| Postgres URL (Firebase/Cloud SQL) | `DATABASE_URL` | append `?sslmode=require`; enable public IP + a DB user, or use the Cloud SQL connector |
| Google OAuth id/secret | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | redirect URI `http://localhost:3000/api/auth/callback/google` |
| Razorpay keys | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | test keys are fine |
| Admin seed login | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | seeds the ADMIN user |

`AUTH_SECRET` is pre-generated in `.env.local`. Optional bits (Google/Razorpay) can be left blank
while you build — the app degrades gracefully (Google button errors only on click; payments fall
back to a simulated gateway).

## Database — Firebase / Cloud SQL for PostgreSQL

Firebase Data Connect provisions a **Cloud SQL for PostgreSQL** instance. Prisma connects to it
like any Postgres database:

1. In Google Cloud / Firebase, enable **Public IP** on the Cloud SQL instance (or set up the Cloud
   SQL Auth Proxy) and create a database user + password.
2. Add your machine's IP to the instance's **Authorized networks** (for local dev).
3. Build the connection string and put it in `DATABASE_URL`:
   `postgresql://USER:PASSWORD@PUBLIC_IP:5432/DBNAME?sslmode=require`
4. Product images are served from `/public` or entered as URLs in the admin — no object storage needed.

## Setup

```bash
npm install                       # installs deps + generates Prisma client
# fill in .env.local (at minimum DATABASE_URL)
npm run db:migrate                # create tables (prisma migrate dev --name init)
npm run db:seed                   # admin + 5 pickles + sample reviews
npm run dev                       # http://localhost:3000
```

Useful scripts: `npm run db:studio` (inspect data), `npm run db:deploy` (apply migrations in prod),
`npm run build` / `npm start`.

## End-to-end check

1. Browse `/shop` → open a product → sign in / register.
2. Add to cart → `/checkout` → pay (Razorpay test, or simulated if keys absent).
3. See the order in `/account` with a status tracker.
4. Sign in as the admin → `/admin` → advance the order status, create/edit a product, and
   review payment KPIs.

## Deploy

- Host on Vercel; set every env var in project settings, with `AUTH_URL`/`NEXTAUTH_URL` = prod domain.
- Register the prod Google redirect URI, and add Razorpay live keys when going live.
- Run `prisma migrate deploy` in the release step.
- For serverless, use a pooled connection to Cloud SQL (Cloud SQL connector / a pooler) to avoid
  connection exhaustion.

## Architecture notes

- Server Actions handle all mutations; `src/data/*` is a server-only read layer used by Server Components.
- Route Handlers exist only for Auth.js and the Razorpay verify callback.
- Auth uses a split config: `auth.config.ts` (edge-safe, for middleware) + `auth.ts` (full, Prisma + Credentials).
- Order totals are always recomputed server-side; product ratings are computed from reviews, never stored.
