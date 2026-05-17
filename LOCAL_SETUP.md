# Sacred Spices Local Setup

Use these steps to run and test the Sacred Spices app locally.

## Demo Credentials

Admin login (local development only):

Set these in your .env file:

SEED_ADMIN_EMAIL=your-admin@email.com
SEED_ADMIN_PASSWORD=your-strong-password

Then run:

npx prisma db seed
## Customer Account Test

1. Login at `/login` with the customer demo user.
2. Open `/account`.
3. Confirm profile, order history, saved addresses, wishlist, and subscription status sections render.
4. Empty states should appear if the demo database has no matching records.

## 1. Install Dependencies

```bash
npm install
```

On Windows PowerShell, if `npm` is blocked by execution policy, run:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' install
```

## 2. Configure PostgreSQL

Create a local PostgreSQL database named `sacred_spices`, then copy the environment template:

```bash
cp .env.example .env
```

Set `DATABASE_URL` in `.env`:

```txt
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sacred_spices?schema=public"
AUTH_SECRET="replace-with-a-long-random-local-secret"
OPENAI_API_KEY=""
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""
NEXT_PUBLIC_RAZORPAY_KEY_ID=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
SEED_ADMIN_EMAIL="admin@sacredspices.local"
SEED_ADMIN_PASSWORD="SacredAdmin123!"
SEED_CUSTOMER_PASSWORD="SacredCustomer123!"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## 3. Run Prisma Migrate

```bash
npm run prisma:migrate
```

## 4. Run Prisma Seed

```bash
npm run prisma:seed
```

This creates the demo users, coupon `SACRED10`, subscription demo data, and the launch product catalog.

## 5. Start Dev Server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## 6. Test Customer Login

1. Go to `http://localhost:3000/login`.
2. Login with `customer@sacredspices.local` and `SacredCustomer123!`.
3. Confirm checkout and cart flows remain accessible.

## 7. Test Admin Login

1. Go to `http://localhost:3000/admin/login`.
2. Login with `admin@sacredspices.local` and `SacredAdmin123!`.
3. Go to `http://localhost:3000/admin`.
4. Confirm product management, order management, and marketing generator load.

## 8. Test Cart

1. Open the homepage.
2. Add a product to cart from a product card.
3. Open `http://localhost:3000/checkout`.
4. Confirm the item appears in the order summary.

## 9. Test Checkout

1. Add at least one product to cart.
2. Go to `/checkout`.
3. Fill the delivery address.
4. Optionally apply coupon code `SACRED10`.
5. Click `Create order`.
6. Confirm a tracking link appears.

## 10. Test Order Tracking

1. After checkout, click the tracking link.
2. Or open `http://localhost:3000/orders/track`.
3. Enter the tracking code from the created order.
4. Confirm the order lifecycle renders as PLACED, CONFIRMED, PACKED, SHIPPED, DELIVERED, CANCELLED, or REFUNDED.

## 10a. Test Legal And Trust Pages

Open:

```txt
/about
/contact
/shipping-policy
/refund-policy
/privacy-policy
/terms
```

These pages are launch placeholders and should be legally reviewed before public launch.

## 11. Test Razorpay Checkout

1. Add Razorpay test keys to `.env`.
2. Restart `npm run dev`.
3. Login as `customer@sacredspices.local`.
4. Add a product to cart and go to `/checkout`.
5. Fill the address and choose `Pay securely with Razorpay`.
6. Use Razorpay test details in the modal.
7. Confirm the success page appears and the order status becomes `PAID`.

## 12. Test Cloudinary Uploads

1. Add Cloudinary credentials to `.env`.
2. Restart `npm run dev`.
3. Login as admin at `/admin/login`.
4. In `/admin`, upload a product image and save the product.
5. Login as customer and open `/community`.
6. Upload an image and submit a community story for moderation.
