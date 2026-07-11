# Kerumoni — Assamese Pickle E-Commerce

A production-style e-commerce platform for handmade Assamese pickles, built with
Next.js 16 (App Router), PostgreSQL (AWS RDS) via Prisma, Auth.js (email/password +
Google), Razorpay payments, and S3 image uploads.

## Features

- **Storefront** — landing page, shop grid, product detail with reviews & computed ratings
- **Auth** — email/password + Google OAuth; gated cart, checkout, account, reviews
- **Cart & checkout** — server-persisted cart, server-authoritative totals, ₹40 shipping under ₹500
- **Payments** — Razorpay checkout + HMAC signature verification (falls back to a simulated
  gateway automatically when Razorpay keys are absent, so you can test end-to-end immediately)
- **Orders** — order history with a 4-stage status tracker (Confirmed → Packaged → On the way → Delivered)
- **Admin** — role-gated dashboard: advance order status, create/edit products with S3 image
  upload, and payment KPIs

## Tech stack

Next.js 16 · TypeScript · Tailwind v4 · Prisma 6 · Auth.js v5 · Razorpay · AWS S3 · Zod

## Prerequisites you provide

| Value | Where it goes | Notes |
|---|---|---|
| AWS RDS Postgres URL | `DATABASE_URL` | append `?sslmode=require`; open the RDS security group to your IP |
| Google OAuth id/secret | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | redirect URI `http://localhost:3000/api/auth/callback/google` |
| Razorpay keys | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | test keys are fine |
| S3 bucket + IAM keys | `S3_BUCKET` / `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | bucket CORS must allow `PUT` from your origin |
| Admin seed login | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | seeds the ADMIN user |

`AUTH_SECRET` is pre-generated in `.env.local`. Optional bits (Google/Razorpay/S3) can be left
blank while you build — the app degrades gracefully (Google button errors only on click;
payments fall back to simulated; image upload falls back to a URL field).

## Setup

```bash
npm install                       # installs deps + generates Prisma client
# fill in .env.local (at minimum DATABASE_URL)
npm run db:migrate                # create tables (prisma migrate dev --name init)
npm run db:seed                   # admin + 4 pickles + sample reviews
npm run dev                       # http://localhost:3000
```

Useful scripts: `npm run db:studio` (inspect data), `npm run db:deploy` (apply migrations in prod),
`npm run build` / `npm start`.

## S3 bucket CORS (for admin uploads)

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

## End-to-end check

1. Browse `/shop` → open a product → sign in / register.
2. Add to cart → `/checkout` → pay (Razorpay test, or simulated if keys absent).
3. See the order in `/account` with a status tracker.
4. Sign in as the admin → `/admin` → advance the order status, create/edit a product
   (upload an image), and review payment KPIs.

## Deploy

- Host on Vercel; set every env var in project settings, with `AUTH_URL`/`NEXTAUTH_URL` = prod domain.
- Register the prod Google redirect URI, and add Razorpay live keys when going live.
- Run `prisma migrate deploy` in the release step.
- Use a pooled connection (RDS Proxy) for serverless to avoid connection exhaustion.

## Architecture notes

- Server Actions handle all mutations; `src/data/*` is a server-only read layer used by Server Components.
- Route Handlers exist only for Auth.js, the Razorpay verify webhook, and S3 presigning.
- Auth uses a split config: `auth.config.ts` (edge-safe, for middleware) + `auth.ts` (full, Prisma + Credentials).
- Order totals are always recomputed server-side; product ratings are computed from reviews, never stored.
