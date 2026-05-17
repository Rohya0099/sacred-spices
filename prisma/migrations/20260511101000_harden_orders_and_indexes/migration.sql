-- Payment replay protection and common lookup indexes.
CREATE UNIQUE INDEX "Order_razorpayOrderId_key" ON "Order"("razorpayOrderId");
CREATE UNIQUE INDEX "Order_razorpayPaymentId_key" ON "Order"("razorpayPaymentId");
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX "GeneratedContent_userId_createdAt_idx" ON "GeneratedContent"("userId", "createdAt");
CREATE INDEX "GeneratedContent_type_createdAt_idx" ON "GeneratedContent"("type", "createdAt");
CREATE INDEX "CommunityPost_isApproved_createdAt_idx" ON "CommunityPost"("isApproved", "createdAt");
CREATE INDEX "CommunityPost_userId_createdAt_idx" ON "CommunityPost"("userId", "createdAt");
