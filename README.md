
# Sacred Spices

Premium AI-first Indian D2C food brand for spices, masalas, pickles, chutneys, subscription boxes, community food stories, and AI-powered recommendations.

## 1. Complete Architecture

Sacred Spices is a Vercel-ready Next.js App Router application with a modular storefront, AI recommendation layer, ecommerce APIs, admin surfaces, and Prisma-backed PostgreSQL data model.

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, responsive premium UI.
- Backend: Next.js route handlers under `app/api`.
- Database: PostgreSQL through Prisma ORM.
- AI: OpenAI integration through `lib/ai.ts`, with safe fallback responses when `OPENAI_API_KEY` is absent.
- Payments: Razorpay order creation and signature verification placeholders under `app/api/razorpay`.
- Deployment: Vercel-ready with env-driven configuration.

## 2. Folder Structure

```txt
app/
  admin/                  Admin analytics and operations dashboard
  api/
    marketing/            AI marketing copy generation endpoint
    products/             Product catalog API
    razorpay/             Razorpay order creation and verification
    taste-guru/           AI Taste Guru endpoint
  checkout/               Cart, address, coupon, order creation
  community/              Sacred Kitchen Community
  login/                  Customer and admin login/register
  account/                Customer account hub
  orders/                 Order tracking pages
  products/[slug]/        Product detail page
  taste-guru/             Guided AI recommendation experience
components/               Reusable brand, layout, product, and AI UI
lib/                      Data, AI client, Prisma client, utilities
prisma/                   Schema and seed data
```

## 3. Database Schema

Implemented in `prisma/schema.prisma`:

- `User`
- `Customer`
- `Product`
- `Category`
- `Order`
- `OrderItem`
- `Cart`
- `CartItem`
- `Review`
- `Subscription`
- `Recipe`
- `GeneratedContent`
- `CommunityPost`
- `Wishlist`
- `WishlistItem`
- `Coupon`

The schema includes enums for user roles, order lifecycle, subscription status, and AI-generated content types.

## 4. API Structure

- `GET /api/products`: returns products from Prisma.
- `POST /api/products`: admin-protected product creation.
- `GET/PUT/DELETE /api/products/[id]`: product detail, update, and delete.
- `GET /api/categories`: category list for admin forms.
- `POST /api/taste-guru`: recommends database products, combos, and recipes, then saves recommendation history.
- `GET/POST /api/marketing`: generates and saves AI marketing content.
- `POST /api/razorpay/order`: creates a real Razorpay order when keys are configured, otherwise returns a safe placeholder.
- `POST /api/razorpay/verify`: verifies Razorpay payment signatures and marks orders paid.
- `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/me`: signed HTTP-only cookie authentication.
- `GET/POST/PATCH/DELETE /api/cart`: persistent cart by user or anonymous cart cookie.
- `GET/POST/DELETE /api/wishlist`: authenticated customer wishlist.
- `GET/POST /api/orders`: customer order history and cart-to-order creation.
- `GET /api/orders/[id]`: order tracking by order ID or tracking code.
- `GET /api/admin/orders`, `PATCH /api/admin/orders/[id]`: admin order filtering and status updates.
- `POST /api/uploads/images`: provider-neutral image upload placeholder architecture.

## 5. UI System

The visual system uses matte black, saffron, gold, ember, ivory, rose, and leaf tones. Typography pairs an elegant display serif with a modern body font. Components use restrained rounded corners, cinematic image treatment, warm lighting overlays, subtle spice particles, and clean product/admin surfaces.

Core reusable components:

- `BrandHeader`
- `Footer`
- `PageShell`
- `LegalPage`
- `Section`
- `ProductCard`
- `LandingExperience`
- `TasteGuru`
- `AuthForm`
- `CheckoutFlow`
- `AdminConsole`
- `OrderStatusView`

## 6. Phased Roadmap

### Phase 1: Premium Brand Foundation

- Landing page, product detail, Taste Guru UI, checkout placeholder, admin dashboard, community empty state.
- Prisma schema and seed data.
- SEO metadata, responsive UI, and honest trust language.

### Phase 2: Commerce Backbone

- Persist cart and wishlist.
- Product CRUD in admin.
- Inventory and order lifecycle management.
- Coupon validation and customer address book.

### Phase 3: Payments and Accounts

- Razorpay order creation, verification, and receipt flow.
- Authentication and role-based admin access.
- Order history and tracking UI.

### Phase 4: AI Systems

- Production Taste Guru recommendations.
- AI marketing workspace with saved generated content.
- Recipe generation and subscription personalization.

### Phase 5: Community and Growth

- Recipe/story/photo uploads.
- Moderation queue and approval workflow.
- Festival campaigns, regional landing pages, multilingual content.

### Phase 6: Future Expansion

- Tea blends, ayurvedic-style drinks without medical claims, brass kitchenware, gift boxes, export workflows, global shipping, and AI recipe video support.

## Setup

Local setup may use demo credentials for development only. Production deployments must use real operator accounts and rotated secrets.

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Open `http://localhost:3000`.

For exact local testing steps, see `LOCAL_SETUP.md`.
For production deployment and launch checks, see `DEPLOYMENT.md` and `PRODUCTION_CHECKLIST.md`.

## Local-Only Demo Credentials

Demo credentials are intentionally isolated in `LOCAL_SETUP.md` for local testing only. Do not copy them into production docs, customer-facing pages, deployment notes, or hosted environment descriptions.

## Environment

Required for full production behavior:

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
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
NEXT_PUBLIC_SITE_URL=
```

## Production Safety Warnings

- Never commit `.env` or production secrets.
- Never use demo credentials in production.
- Rotate `AUTH_SECRET`, database passwords, Razorpay keys, Cloudinary keys, and OpenAI keys before deployment.
- Keep `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `CLOUDINARY_API_SECRET`, and `AUTH_SECRET` server-only.
- Replace all placeholder business, legal, FSSAI, and support details before public launch.

## Notes

- The brand copy avoids fake medical claims, invented authority, fake reviews, and manipulative spirituality.
- Testimonials are intentionally represented as a verified post-launch section rather than fabricated reviews.
- OpenAI and Razorpay endpoints include safe fallbacks so local development works before credentials are added.
- Seeded demo accounts are documented only in `LOCAL_SETUP.md` and must be removed or rotated before production.
- Admin access is protected by role-based signed cookie sessions.
- Image uploads use authorized Cloudinary server-side uploads through `POST /api/uploads/images`.
- Customer accounts are created from public registration with a unique email address, password, and optional name/phone. The account area includes profile, recent orders, saved delivery addresses, wishlist, and subscription status.
- Legal/trust pages are included as launch placeholders and must be reviewed before public release.
- Email template placeholders live in `lib/email-templates.ts` for order confirmation, payment success, and shipping updates.
- Order tracking presents the customer lifecycle as PLACED, CONFIRMED, PACKED, SHIPPED, DELIVERED, CANCELLED, or REFUNDED.

## Razorpay Testing

1. Add Razorpay test keys to `.env`: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
2. Restart the dev server.
3. Login as the customer demo user.
4. Add a product to cart and open `/checkout`.
5. Fill the address and click `Pay securely with Razorpay`.
6. Complete Razorpay Checkout with Razorpay test payment details.
7. The app verifies the signature server-side and redirects to `/checkout/success?order=...`.
8. Configure Razorpay webhooks to post to `/api/razorpay/webhook` with `RAZORPAY_WEBHOOK_SECRET` for payment reconciliation.

## Cloudinary Testing

1. Add Cloudinary keys to `.env`: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
2. Restart the dev server.
3. Login at `/admin/login`.
4. Open `/admin`, upload a product image, then save the product.
5. For community uploads, login as a customer, open `/community`, upload an image, and submit a post for moderation.
