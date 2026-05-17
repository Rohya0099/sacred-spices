ALTER TABLE "Product" ADD COLUMN "primaryImage" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "weight" TEXT NOT NULL DEFAULT '250g';
ALTER TABLE "Product" ADD COLUMN "packageType" TEXT NOT NULL DEFAULT 'Premium Pouch';
ALTER TABLE "Product" ADD COLUMN "storageInstructions" TEXT NOT NULL DEFAULT 'Store in a cool, dry place. Use a clean, dry spoon.';
ALTER TABLE "Product" ADD COLUMN "spiceLevelLabel" TEXT NOT NULL DEFAULT 'Medium';
ALTER TABLE "Product" ADD COLUMN "bestWith" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Product" ADD COLUMN "servesApprox" TEXT NOT NULL DEFAULT 'Serves family meals depending on usage.';
ALTER TABLE "Product" ADD COLUMN "handcraftedNotes" TEXT NOT NULL DEFAULT 'Prepared in small batches for freshness and aroma.';
