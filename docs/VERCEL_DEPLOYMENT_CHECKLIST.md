# Sacred Spices Vercel Deployment Checklist

Use this checklist before every production deploy. Do not use demo credentials in production.

## 1. Required Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

```txt
DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_SITE_URL=
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

Optional but expected for full production behavior:

```txt
OPENAI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
RESEND_API_KEY=
SENDGRID_API_KEY=
```

## 2. Production Database Setup

1. Create a PostgreSQL database for production.
2. Copy the production connection string into `DATABASE_URL`.
3. Confirm the database allows SSL connections from Vercel.
4. Enable automated backups with the database provider.

## 3. Prisma Migration Deploy

Run against the production database:

```bash
npx prisma migrate deploy
```

Do not use `prisma migrate dev` against production.

## 4. Seed Admin Safely

Set:

```txt
SEED_ADMIN_EMAIL=owner@example.com
SEED_ADMIN_PASSWORD=unique-strong-14-plus-character-password
```

Password requirements:

- At least 14 characters
- Uppercase letter
- Lowercase letter
- Number
- Symbol

Then run:

```bash
npx prisma db seed
```

The seed hashes the password and creates/updates the user with role `ADMIN`. It does not print the password.

Verify in the production database:

```sql
SELECT email, role FROM "User" WHERE email = 'owner@example.com';
```

Expected role:

```txt
ADMIN
```

## 5. Razorpay

Set the Razorpay production keys:

```txt
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_WEBHOOK_SECRET=
```

Webhook URL:

```txt
https://YOUR_DOMAIN.com/api/razorpay/webhook
```

Enable at least:

- `payment.captured`
- `payment.failed`

## 6. Auth Secret Rotation

Generate a long random `AUTH_SECRET` before launch. Never use local/demo values.

Changing `AUTH_SECRET` logs out existing sessions, so rotate deliberately.

## 7. Demo Credential Removal

Before launch:

- Do not expose local demo credentials in public pages.
- Do not seed demo customer accounts in production.
- Use only `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` for the production admin.

## 8. Password Reset

Production password reset requires an email provider env var:

```txt
RESEND_API_KEY=
```

or:

```txt
SENDGRID_API_KEY=
```

Until email sending is wired to the selected provider, keep password reset tested in staging first.

## 9. Final Smoke Tests After Deploy

Run these manually on the production URL:

1. Customer registration creates a `CUSTOMER`, not `ADMIN`.
2. Customer login works.
3. Admin login works only at `/admin/login`.
4. Customer cannot access `/admin`.
5. Add product to cart.
6. Create normal order.
7. Complete Razorpay test/live payment in the correct environment.
8. Confirm order becomes `CONFIRMED` only after payment verification or valid webhook.
9. Confirm preorder order does not decrement stock.
10. Confirm order tracking works.
11. Confirm password reset request does not reveal whether an email exists.
12. Confirm product images load.
13. Confirm FSSAI wording says `FSSAI Registration: In Process` until the real number is issued.

## 10. Remaining Owner Checks

- Confirm FSSAI registration through official FoSCoS: https://foscos.fssai.gov.in
- Confirm support email and phone.
- Confirm refund/shipping policy with the real business process.
- Confirm legal business name and address.
- Confirm database backup schedule.
- Add error monitoring such as Sentry before public traffic.
