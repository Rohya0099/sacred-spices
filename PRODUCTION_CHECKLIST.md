# Production Checklist

## Customer Flows

- Homepage trust sections display correctly on desktop and mobile.
- Customer can register, login, logout, open account area, and see empty states.
- Product page loads, add-to-cart requires customer authentication, and checkout creates an order.
- Order tracking shows PLACED, CONFIRMED, PACKED, SHIPPED, DELIVERED, CANCELLED, and REFUNDED states.
- Wishlist appears in the customer account area.
- Subscription status appears in the customer account area.

## Admin Flows

- Admin login is separate from customer login.
- Admin can create, edit, delete eligible products, update inventory, and upload Cloudinary images.
- Admin can filter orders and move confirmed orders through the fulfillment lifecycle.
- Admin cannot fulfill placed, cancelled, or refunded orders.

## Payments And Uploads

- Razorpay checkout opens with public key only.
- Payment verification happens server-side.
- Webhook secret is configured and duplicate webhooks are handled.
- Cloudinary uploads validate type, size, and authorization.

## Compliance And Trust

- Legal pages are reviewed by counsel.
- FSSAI placeholder is replaced with verified registration details.
- Refund and shipping policy timelines match actual operations.
- Contact page uses real support channels.

## Operations

- Database backups are enabled.
- Error monitoring is enabled.
- Rate limiting is backed by shared storage before high traffic.
- Secrets are rotated before production launch.
- Demo users are removed or locked down.
