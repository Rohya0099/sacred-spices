# Sacred Spices Complete System Report

Generated from the current local codebase and local PostgreSQL database state.

Important audit note: the working tree currently contains partially added preorder code in `prisma/schema.prisma`, `app/api/orders/route.ts`, `components/add-to-cart-button.tsx`, `components/checkout-flow.tsx`, and `components/product-card.tsx`, but the local database and generated Prisma client do not include the `Order.isPreorder` column. This is a current launch-blocking mismatch.

## 1. Product Data

Source: live local PostgreSQL `Product` table joined with `Category`.

| Product | Slug | Price | Image URL | Category | Stock | Description | Tags |
|---|---:|---:|---|---|---:|---|---|
| Biryani Masala | `biryani-masala` | Rs. 549 | `https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85` | Masalas | 85 | A celebratory biryani masala with floral spice, warm aromatics, and a regal lingering finish. | Floral, Regal, Deep, Festival Special, spiceLevel:3 |
| Diwali Spice Gift Box | `diwali-spice-gift-box` | Rs. 1499 | `https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=85` | Festival Boxes | 40 | A premium festive box with signature masalas, chai spice, pickle accents, and gift-ready storytelling. | Celebratory, Warm, Giftable, Festival Special, spiceLevel:3 |
| Kitchen King Masala | `kitchen-king-masala` | Rs. 429 | `https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85` | Masalas | 130 | A rich everyday masala for sabzis and gravies with balanced heat, body, and restaurant-style aroma. | Savory, Balanced, Full-bodied, Bestseller, spiceLevel:3 |
| Kolhapuri Masala | `kolhapuri-masala` | Rs. 499 | `https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85` | Regional Collections | 70 | A fiery Maharashtrian blend with toasted coconut depth, chilli intensity, and earthy spice. | Fiery, Toasty, Earthy, Limited Edition, spiceLevel:5 |
| Lemon Pickle | `lemon-pickle` | Rs. 329 | `https://images.unsplash.com/photo-1604908177522-040a3a6a0ef7?auto=format&fit=crop&w=1200&q=85` | Pickles | 90 | A bright lemon pickle with citrus depth, mellow spice, and a slow aged tang. | Citrusy, Tangy, Mellow, New, spiceLevel:3 |
| Mango Pickle | `mango-pickle` | Rs. 349 | `/images/products/mango-pickle.jpg` | Pickles | 93 | A bold mango pickle with mustard bite, chilli heat, and the familiar tang of summer jars. | Tangy, Bold, Nostalgic, Bestseller, spiceLevel:4 |
| Red Chilli Powder | `red-chilli-powder` | Rs. 279 | `https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85` | Spice Blends | 150 | A vivid chilli powder with balanced heat, rich color, and a clean roasted edge. | Vivid, Hot, Clean, Bestseller, spiceLevel:4 |
| Royal Chai Masala | `royal-chai-masala` | Rs. 399 | `https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=1200&q=85` | Spice Blends | 109 | A fragrant chai blend with cardamom brightness, ginger warmth, and a soft pepper finish. | Fragrant, Warming, Comforting, New, spiceLevel:2 |
| Sacred Garam Masala | `sacred-garam-masala` | Rs. 449 | `https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85` | Masalas | 140 | A signature all-purpose garam masala with roasted warmth, gentle sweetness, and a long aromatic finish. | Warm, Layered, Aromatic, Bestseller, spiceLevel:3 |
| Turmeric Powder | `turmeric-powder` | Rs. 249 | `https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85` | Spice Blends | 160 | A golden turmeric powder with earthy aroma, clean color, and everyday cooking versatility. | Earthy, Golden, Gentle, New, spiceLevel:1 |

## 2. AI Taste Guru Current Logic

### User-facing UI

File: `components/taste-guru.tsx`

The visible `/taste-guru` page currently uses local static data from `lib/data.ts`, not database products.

It imports:

```ts
import { products } from "@/lib/data";
```

It does not call `POST /api/taste-guru`.

### Inputs

The UI has six button-based fields:

- `heat`: Gentle, Medium, Bold
- `mood`: Tangy, Smoky, Balanced
- `region`: North, South, Mixed
- `occasion`: Daily, Weekend, Festival
- `family`: 1-2, 3-4, 5+
- `dish`: Dal and sabzi, Rice and rasam, Grills and curries

### UI matching logic

The UI starts showing a recommendation after at least 3 answers.

Current logic:

- If `region === "South"`, recommend `products[1]` from `lib/data.ts`.
- Else if `occasion === "Festival"`, recommend `products[2]` from `lib/data.ts`.
- Else recommend `products[0]` from `lib/data.ts`.

It also returns fixed supporting copy:

- Recipe:
  - `Rice and rasam` -> `Pepper rasam with ghee rice`
  - otherwise -> `Slow tadka dal with warm phulka`
- Combo:
  - `family === "5+"` -> `Family Ritual Combo`
  - otherwise -> `Starter Spice Ritual`
- Subscription:
  - `occasion === "Festival"` -> `Festival Memory Box`
  - otherwise -> `Sacred Monthly Box`

### API route logic

File: `app/api/taste-guru/route.ts`

The API route currently fetches real database products:

```ts
prisma.product.findMany({
  include: { category: true },
  orderBy: [{ isBestSeller: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }]
})
```

It scores products using:

- `spiceLevel` vs `heat`
- text matching against product name, description, emotional story, taste profile, regional inspiration, cooking recommendations, and category
- tangy/smoky/balanced keyword matching
- north/south/mixed region matching
- occasion matching
- family-size matching
- dish matching
- small boosts for `isBestSeller` and `isFeatured`

It returns:

- `source: "catalog-match"`
- `exact`
- `recommendations`
- `historyId`

Each recommendation contains:

- serialized product
- reason
- score
- `isPreorderAvailable`

It also writes a `GeneratedContent` history row.

### Current limitations and bugs

- HIGH: User-facing `TasteGuru` component does not call the API route, so customers see static mock-style recommendations instead of real database matches.
- HIGH: The API route references preorder availability, but preorder is not database-ready in the local DB.
- MEDIUM: API scoring is deterministic keyword matching, not OpenAI-powered or semantic matching.
- MEDIUM: UI output does not show product image, price, reason, View Product, Add to Cart, or Pre-order buttons.
- LOW: The UI displays combo/subscription names that are not actual product records.

## 3. Order & Payment Flow

### Flow summary

1. Customer clicks Add to Cart or Buy Now.
2. `components/add-to-cart-button.tsx` posts to `POST /api/cart`.
3. If unauthenticated, API returns 401 and UI redirects to `/login?next=...`.
4. Cart data is stored through `Cart` and `CartItem`.
5. Customer opens `/checkout`.
6. `components/checkout-flow.tsx` fetches `GET /api/cart`.
7. Customer submits delivery address.
8. `POST /api/orders` creates an `Order` from cart items.
9. Checkout calls `POST /api/razorpay/order`.
10. Razorpay order is created using `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
11. Razorpay Checkout opens in the browser.
12. On payment handler callback, app calls `POST /api/razorpay/verify`.
13. App verifies signature server-side.
14. On success, `markOrderPaid` updates order to `CONFIRMED`.
15. On failure, order is marked `CANCELLED`.

### Actual database Order columns

Source: local PostgreSQL information schema.

- `id`
- `userId`
- `status`
- `subtotal`
- `discount`
- `shipping`
- `total`
- `couponCode`
- `razorpayOrderId`
- `razorpayPaymentId`
- `trackingCode`
- `address`
- `createdAt`
- `updatedAt`

Important: the database does not currently contain `isPreorder`.

### Prisma schema Order fields

Source: `prisma/schema.prisma`.

- `id`
- `userId`
- `user`
- `status`
- `subtotal`
- `discount`
- `shipping`
- `total`
- `couponCode`
- `razorpayOrderId`
- `razorpayPaymentId`
- `trackingCode`
- `isPreorder`
- `address`
- `items`
- `createdAt`
- `updatedAt`

Important: the schema file includes `isPreorder`, but the database and generated Prisma client do not.

### Status values used

Enum in `prisma/schema.prisma`:

- `PLACED`
- `CONFIRMED`
- `PACKED`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`
- `REFUNDED`

Admin UI uses the same statuses.

### Payment verification

File: `app/api/razorpay/verify/route.ts`

The app verifies Razorpay payment signatures with:

```ts
createHmac("sha256", RAZORPAY_KEY_SECRET)
  .update(`${razorpayOrderId}|${razorpayPaymentId}`)
  .digest("hex")
```

It compares using `timingSafeEqual`.

### Success behavior

File: `lib/orders.ts`

`markOrderPaid`:

- finds the order by local order ID or Razorpay order ID
- checks inventory
- decrements inventory
- clears cart items for logged-in user
- updates status to `CONFIRMED`
- stores `razorpayOrderId`
- stores `razorpayPaymentId`

### Failure behavior

Files:

- `app/api/razorpay/verify/route.ts`
- `app/api/razorpay/fail/route.ts`
- `app/api/razorpay/webhook/route.ts`

Failure paths mark unpaid orders as `CANCELLED`.

### Webhook behavior

File: `app/api/razorpay/webhook/route.ts`

- Verifies `x-razorpay-signature`.
- Creates `PaymentWebhookEvent`.
- Ignores duplicate webhook events by catching Prisma `P2002`.
- `payment.captured` calls `markOrderPaid`.
- `payment.failed` marks not-confirmed orders as `CANCELLED`.

## 4. Preorder Readiness

### Current support

Current state is inconsistent:

- `prisma/schema.prisma` contains `Order.isPreorder Boolean @default(false)`.
- Migration file exists: `prisma/migrations/20260513010000_add_preorder_flag/migration.sql`.
- Local database does not contain `Order.isPreorder`.
- Generated Prisma client does not contain `Order.isPreorder`.
- `app/api/orders/route.ts` currently tries to write `isPreorder`.
- `components/add-to-cart-button.tsx`, `components/checkout-flow.tsx`, and `components/product-card.tsx` contain preorder UI/path code.

### Can preorder be added safely?

Yes, but the current partial implementation must be completed or reverted before launch.

### Safe insertion points

- Schema: `Order.isPreorder Boolean @default(false)` is the safer option than adding a `PREORDER` status because it does not disturb the fulfillment lifecycle.
- API: `POST /api/orders` can accept `isPreorder`.
- Payment: existing Razorpay flow can remain unchanged.
- Success: `markOrderPaid` can keep setting status to `CONFIRMED`.
- Inventory: preorder orders should skip immediate inventory decrement or use a separate reserved/preorder quantity strategy.
- UI: Product cards/product detail can link to `/checkout?preorder=slug`.

### Minimal required changes to make preorder real

1. Apply migration `20260513010000_add_preorder_flag`.
2. Run `npm run prisma:generate`.
3. Ensure `markOrderPaid` handles `order.isPreorder` safely.
4. Add preorder display in admin/order tracking.
5. Confirm checkout creates normal orders when no preorder query exists.
6. Run full build and checkout test.

## 5. UI & Product Page System

### Product listing

File: `app/products/page.tsx`

- Fetches products from Prisma where `inventory > 0`.
- Includes category.
- Sorts by bestseller, featured, newest.
- Falls back to static `lib/data.ts` products if DB fetch fails.
- Renders `ProductCard`.

### Product card

File: `components/product-card.tsx`

Current structure:

- fixed image area: `h-64`
- `ProductImage` with fallback behavior
- category badge
- optional product badge
- product name
- taste profile
- price
- spice-level flames
- short story
- buttons:
  - Add to cart
  - Buy now
  - Pre-order Now

Important: Pre-order button exists in code, but the backend/db are not fully ready.

### Product detail page

File: `app/products/[slug]/page.tsx`

Structure:

- Fetch product from Prisma by slug.
- Falls back to static product data.
- Main image and three duplicate thumbnails.
- Product category and badge.
- Product name.
- Emotional story.
- Price.
- Spice level.
- Add to Cart and Buy Now buttons.
- Info cards:
  - Taste profile
  - Regional inspiration
  - Cooking recommendations
  - Shelf life
  - Ingredients
  - Reviews placeholder
- Related products from static `lib/data.ts`, not database.

### Animation state

Existing animation:

- `framer-motion` is used on the homepage hero in `components/landing-experience.tsx`.
- Product cards have hover image scale.
- CSS contains particle/steam-style animation classes used mainly in landing sections.

Not present:

- No `ProductExperienceHero` component.
- No product-type-specific cinematic animation for pickles, masalas, chai masala, or gift boxes.
- No floating product hero, oil shine, spice dust, steam, spoon visual, or gift-box unboxing animation on product detail pages.

### Ease of adding cinematic experience

Moderate.

The product detail page already centralizes product rendering in one file and has enough product metadata to branch by category/name. A reusable `ProductExperienceHero` could be inserted above or in place of the existing image grid without changing checkout/cart/payment logic.

## 6. Admin Capabilities

### Admin access

Admin is protected by signed HTTP-only cookie auth and role check through `requireAdmin`.

### Product CRUD

Files:

- `app/api/products/route.ts`
- `app/api/products/[id]/route.ts`
- `components/admin-console.tsx`

Admin can:

- list products
- create product
- edit product
- delete product if it has no order history
- update inventory
- edit category, slug, description, emotional story, ingredients, taste profile, regional inspiration, cooking recommendations, shelf life, spice level, price, images, badge, featured, bestseller

Delete behavior:

- product deletion is blocked if an `OrderItem` exists for that product
- recommendation is to set inventory to 0 instead

### Order management

Files:

- `app/api/admin/orders/route.ts`
- `app/api/admin/orders/[id]/route.ts`
- `components/admin-console.tsx`

Admin can:

- fetch all orders
- filter by status
- change order status

Status transition guard:

- Admin cannot move `PLACED`, `CANCELLED`, or `REFUNDED` directly into fulfillment statuses.
- Fulfillment-ready statuses are `CONFIRMED`, `PACKED`, and `SHIPPED`.

### Image upload

Files:

- `app/api/uploads/images/route.ts`
- `lib/cloudinary.ts`
- `components/image-upload.tsx`

Capabilities:

- Product image uploads require admin.
- Community image uploads require authenticated customer.
- Allowed types: JPG, PNG, WEBP, GIF.
- Max size: 5 MB.
- Upload provider: Cloudinary server-side upload.

### AI marketing

Admin console includes AI marketing generator using `/api/marketing`.

## 7. Critical Issues Before Launch

### HIGH

1. Prisma schema/database/client mismatch for preorder.
   - Schema and code reference `Order.isPreorder`.
   - Local database does not have the column.
   - Generated Prisma client does not have the field.
   - Current `POST /api/orders` includes `isPreorder` in create data, which can break order creation until migration/generate are completed or code is reverted.

2. AI Taste Guru UI does not use real DB products.
   - API route has DB matching logic.
   - Customer-facing component still uses static `lib/data.ts`.

3. Lemon Pickle still uses broken Unsplash image URL.
   - Current DB image: `https://images.unsplash.com/photo-1604908177522-040a3a6a0ef7?...`
   - This URL previously caused 404/timeouts.

4. Production business/legal placeholders remain.
   - FSSAI, registered business address, support email/phone, GST if applicable, shipping/refund details need real values.

5. Demo credentials still exist in local docs/UI.
   - Login form displays demo credentials.
   - Must be removed or hidden before public launch.

6. Rate limiting is in-memory.
   - `lib/security.ts` uses a process-local `Map`.
   - This is not production-grade on Vercel/serverless or multi-instance deployment.

### MEDIUM

1. Product detail related products are static.
   - Related products come from `lib/data.ts`, not database.

2. Product images are mostly repeated generic Unsplash URLs.
   - Many products share the same image.
   - This weakens premium ecommerce trust.

3. Checkout has Razorpay integration but no email receipt sending.
   - Templates exist in `lib/email-templates.ts`.
   - No provider integration sends them.

4. Admin order status transitions are basic.
   - No shipment tracking number field.
   - No status history/audit log.

5. Wishlist/account/subscription are present but lightweight.
   - Subscription is seeded/demo-style, not billing-backed.

6. Webhook event logging exists, but payment reconciliation is minimal.
   - No alerting or admin visibility for failed webhook processing.

### LOW

1. Product detail thumbnails duplicate the same image three times.
2. Reviews are placeholder text only.
3. Product page has no product-type-specific animation.
4. `README.md` claims safe Razorpay placeholder behavior, but current Razorpay order route requires real keys and creates a real Razorpay order.
5. Some UI text in admin output contains encoding artifact `Â·`.

## 8. Launch Readiness Score

### Technical readiness: 68%

Reason:

- Core Next.js, Prisma, auth, cart, checkout, Razorpay verification, admin CRUD, and product catalog exist.
- Blocking issue: schema/database/client mismatch around preorder.
- AI Taste Guru API and UI are disconnected.
- Production rate limiting and monitoring are not ready.

### Business readiness: 52%

Reason:

- Product catalog exists with prices and stock.
- Legal/trust pages exist as placeholders.
- FSSAI/license, business address, real support details, refund/shipping promises, GST if applicable, and email operations still need real launch values.

### UX readiness: 64%

Reason:

- Premium black/gold visual direction is present.
- Product listing, product detail, cart, checkout, auth, account, admin exist.
- Taste Guru output is not yet product-card-quality.
- Product images are inconsistent.
- Product detail lacks cinematic conversion layer and real related-products logic.

## Final Launch Notes

Before deploying publicly, the highest-value next checks are:

1. Resolve preorder mismatch: either complete migration/generate/build or remove partial preorder code.
2. Make customer-facing Taste Guru call `POST /api/taste-guru`.
3. Replace broken/generic product images.
4. Remove demo credential display from public UI.
5. Replace all business/legal/FSSAI placeholders.
6. Configure production Razorpay, Cloudinary, database backups, logging, and monitoring.
