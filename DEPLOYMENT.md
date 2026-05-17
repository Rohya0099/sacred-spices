# Sacred Spices Deployment Guide

This guide prepares the existing Sacred Spices app for Vercel deployment with PostgreSQL, Prisma, Razorpay webhooks, provider-neutral email templates, and production admin access.

## 1. Vercel Setup

1. Create a new Vercel project from this repository.
2. Set the framework preset to `Next.js`.
3. Keep the build command as `npm run build`.
4. Keep the install command as `npm install`.
5. Add all production environment variables in Vercel Project Settings before the first production deploy.
6. Set `NEXT_PUBLIC_SITE_URL` to the final production URL, for example `https://sacredspices.in`.
7. Deploy once only after the PostgreSQL database URL and secrets are present.

## 2. PostgreSQL Database Setup

Use a managed PostgreSQL provider such as Vercel Postgres, Neon, Supabase, Railway, or Render.

1. Create a production PostgreSQL database.
2. Copy the pooled application connection string into `DATABASE_URL`.
3. Confirm SSL is enabled if your provider requires it.
4. Enable automated backups before launch.
5. Keep production, preview, and local databases separate.

## 3. Environment Variables

```txt
DATABASE_URL=
OPENAI_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
AUTH_SECRET=
NEXT_PUBLIC_SITE_URL=
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

Server-only secrets: `DATABASE_URL`, `OPENAI_API_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `CLOUDINARY_API_SECRET`, `AUTH_SECRET`, and `SEED_ADMIN_PASSWORD`.

Browser-safe variables: only values prefixed with `NEXT_PUBLIC_`.

## 4. Prisma Migration Deployment

Local development can use:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Production must use:

```bash
npm run prisma:generate
npx prisma migrate deploy
```

Migration notes:

- The production lifecycle enum is `PLACED`, `CONFIRMED`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`, and `REFUNDED`.
- The migration `20260511180000_order_status_lifecycle_only` maps old `PENDING` orders to `PLACED`, old `PAID` orders to `CONFIRMED`, and old `FAILED` orders to `CANCELLED`.
- Do not run `prisma migrate dev` against production.
- Take or confirm a database backup before `prisma migrate deploy`.
- Run migrations before the first production traffic is allowed through the deployment.

## 5. Production Seed Strategy

Production admin creation uses Prisma seed only:

```bash
npx prisma db seed
```

Production seed requirements:

1. Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.
2. Do not seed demo customer credentials into the live store.
3. Seed only verified catalog categories/products when launch inventory is final.
4. Prefer admin product management for live inventory updates after launch.
5. Run it once against a backed-up database and audit the records afterward.

## 6. Safe Admin Creation

Create or rotate a production admin with:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Required environment variables:

```txt
DATABASE_URL=
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
AUTH_SECRET=
NEXT_PUBLIC_SITE_URL=
```

The seed upserts one admin user, hashes the password, sets role `ADMIN`, and refuses weak admin passwords.

## 7. Razorpay Webhook Setup

Configure Razorpay Dashboard webhook URL:

```txt
https://your-domain.com/api/razorpay/webhook
```

Recommended events:

- `payment.captured`
- `payment.failed`

Behavior:

- The endpoint verifies `x-razorpay-signature` with `RAZORPAY_WEBHOOK_SECRET`.
- Each webhook event is logged in `PaymentWebhookEvent`.
- Duplicate event IDs are ignored safely.
- `payment.captured` updates the order to `CONFIRMED`.
- `payment.failed` updates unpaid orders to `CANCELLED`.

## 8. Email Receipt Placeholder

Email copy is provider-neutral in `lib/email-templates.ts`:

- `orderConfirmationTemplate`
- `paymentSuccessTemplate`
- `shippingUpdateTemplate`

Connect Resend, SendGrid, Amazon SES, or another provider later by adding a small mailer module that calls these templates. Do not put provider API keys in client code.

## 9. Post-Deploy Testing

After deploying:

1. Open the homepage and confirm trust blocks render: FSSAI placeholder, secure payments, authentic sourcing, small-batch quality, customer support, and made in India.
2. Register a customer account and open `/account`.
3. Add a product to cart and create an order.
4. Confirm the order starts as `PLACED`.
5. Complete a Razorpay test payment and confirm the order becomes `CONFIRMED`.
6. Send a duplicate Razorpay webhook and confirm it returns success without changing the order twice.
7. Move an order through `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`, and `REFUNDED` from admin where appropriate.
8. Visit About, Contact, Shipping Policy, Return/Refund Policy, Privacy Policy, Terms & Conditions, and the FSSAI placeholder section/page.
9. Test Cloudinary image uploads from admin and community flows.
10. Run a mobile viewport pass for homepage, product detail, checkout, account, admin, tracking, and legal pages.

## Launch Commands

```bash
npm install
npm run prisma:generate
npm exec prisma migrate deploy
npm run build
```

## Remaining Launch Replacements

- Verified FSSAI number and license display.
- Registered business address.
- Support email and phone.
- Legal company name and GST number if applicable.
- Real shipping, refund, cancellation, and replacement timelines.
- Production email provider integration.
- Error monitoring, uptime checks, and database backup alerts.
