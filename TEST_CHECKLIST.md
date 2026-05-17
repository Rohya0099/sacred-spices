# Sacred Spices Test Checklist

Use this checklist after `npm run prisma:migrate`, `npm run prisma:seed`, and `npm run dev`.

- [ ] Homepage test: hero loads, featured products render, CTA links work, no visual overlap on desktop.
- [ ] Homepage trust section test: FSSAI placeholder, secure payments, Made in India, sourcing, packaging, and support cards render.
- [ ] Product page test: open `/products/sacred-garam-masala`, gallery loads, taste profile/spice level/story are visible.
- [ ] AI Taste Guru test: answer at least three questions and confirm recommendations appear.
- [ ] Cart test: add a product from homepage/product card, open checkout, item appears in summary.
- [ ] Checkout test: fill address, create order, coupon `SACRED10` does not break order creation.
- [ ] Order tracking test: open generated tracking link or use `/orders/track`, status timeline renders.
- [ ] Customer account test: login as customer, open `/account`, and verify profile, orders, addresses, wishlist, and subscription status.
- [ ] Legal pages test: open `/about`, `/contact`, `/shipping-policy`, `/refund-policy`, `/privacy-policy`, and `/terms`.
- [ ] Admin login test: login at `/admin/login` with admin demo credentials and verify `/admin` is accessible.
- [ ] Admin logout test: logout from admin session and confirm `/admin` redirects to `/admin/login`.
- [ ] Customer auth test: register, login, logout, and confirm cart/account require a customer session.
- [ ] Product CRUD test: create a product, edit price/inventory/badge, then delete the test product.
- [ ] Order status update test: create an order, open admin, filter status, update order status, verify tracking page changes.
- [ ] Marketing generator test: generate content, copy it, download it, and confirm no fake medical claims are produced.
- [ ] Razorpay test: checkout opens Razorpay modal, verifies payment, and redirects to success.
- [ ] Razorpay failure test: dismissed or failed payment marks the order `FAILED`.
- [ ] Razorpay webhook test: send a signed test webhook and confirm duplicate events are ignored safely.
- [ ] Cloudinary product upload test: admin can upload product image and preview it.
- [ ] Cloudinary community upload test: customer can attach an image to a community post.
- [ ] Auth hardening test: weak registration password is rejected and logout works.
- [ ] Mobile responsive test: check homepage, product page, account, checkout, login, legal pages, and admin at mobile width.
