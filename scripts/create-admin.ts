/**
 * Legacy helper intentionally kept only as a breadcrumb for older local notes.
 *
 * Production admin creation must use:
 *   npx prisma migrate deploy
 *   npx prisma db seed
 *
 * Required env vars:
 *   DATABASE_URL
 *   SEED_ADMIN_EMAIL
 *   SEED_ADMIN_PASSWORD
 *   AUTH_SECRET
 *   NEXT_PUBLIC_SITE_URL
 */

console.error("Legacy command. Use `npx prisma db seed` with SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD.");
process.exit(1);
