import type { Cart, CartItem, Category, Order, OrderItem, Product, User, Wishlist, WishlistItem } from "@prisma/client";
import { resolveProductImage, resolveProductImages } from "@/lib/product-images";

export function serializeProduct(product: Product & { category?: Category | null }) {
  const category = product.category?.name ?? null;
  return {
    ...product,
    primaryImage: resolveProductImage({
      name: product.name,
      slug: product.slug,
      category,
      primaryImage: product.primaryImage,
      images: product.images
    }),
    images: resolveProductImages({
      name: product.name,
      slug: product.slug,
      category,
      primaryImage: product.primaryImage,
      images: product.images
    }),
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null
  };
}

export function serializeCart(cart: Cart & { items: Array<CartItem & { product: Product & { category?: Category | null } }> }) {
  return {
    id: cart.id,
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: serializeProduct(item.product),
      lineTotal: Number(item.product.price) * item.quantity
    })),
    total: cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
  };
}

export function serializeWishlist(wishlist: Wishlist & { items: Array<WishlistItem & { product: Product & { category?: Category | null } }> }) {
  return {
    id: wishlist.id,
    items: wishlist.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: serializeProduct(item.product)
    }))
  };
}

export function serializeOrder(order: Order & { items: Array<OrderItem & { product: Product }> }) {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shipping: Number(order.shipping),
    total: Number(order.total),
    couponCode: order.couponCode,
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId,
    trackingCode: order.trackingCode,
    isPreorder: order.isPreorder,
    address: order.address,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      product: serializeProduct(item.product)
    }))
  };
}

export function serializeAdminOrder(order: Order & { user?: User | null; items: Array<OrderItem & { product: Product }> }) {
  return {
    ...serializeOrder(order),
    adminNote: order.adminNote,
    user: order.user
      ? {
          id: order.user.id,
          email: order.user.email,
          name: order.user.name,
          phone: order.user.phone,
          role: order.user.role
        }
      : null
  };
}

export function serializePublicOrder(order: Order & { items: Array<OrderItem & { product: Product }> }) {
  return {
    id: order.id,
    status: order.status,
    trackingCode: order.trackingCode,
    total: Number(order.total),
    isPreorder: order.isPreorder,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        name: item.product.name,
        slug: item.product.slug
      }
    }))
  };
}
