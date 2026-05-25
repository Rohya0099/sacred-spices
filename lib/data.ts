import { Flame, Gift, Heart, Leaf, Sparkles, Star } from "lucide-react";

export const categories = [
  "Masalas",
  "Pickles",
  "Chutneys",
  "Spice Blends",
  "Royal Collections",
  "Festival Boxes",
  "Regional Collections"
];

export const products = [
  {
    slug: "sacred-garam-masala",
    name: "Sacred Garam Masala",
    category: "Masalas",
    price: 549,
    image: "/images/products/sacred-garam-masala-1.png",
    taste: "Warm, layered, aromatic",
    spice: 3,
    region: "North Indian family kitchens",
    story:
      "Made for the last pinch before serving, the moment when a simple dal begins to smell like home.",
    badge: "Bestseller"
  },
  {
    slug: "royal-chai-masala",
    name: "Royal Chai Masala",
    category: "Spice Blends",
    price: 399,
    image: "/images/products/royal-chai-masala.jpg",
    taste: "Fragrant, warming, comforting",
    spice: 2,
    region: "Indian chai stalls and home kitchens",
    story:
      "For slow mornings, steel cups, rainy windows, and conversations that become family rituals.",
    badge: "New"
  },
  {
    slug: "mango-pickle",
    name: "Mango Pickle",
    category: "Pickles",
    price: 349,
    image: "/images/products/mango-pickle.jpg",
    taste: "Tangy, bold, nostalgic",
    spice: 4,
    region: "Pan-Indian summer pickle traditions",
    story:
      "Inspired by sunlit terraces, ceramic bharanis, and the patient joy of pickle season.",
    badge: "Bestseller"
  }
];

export const rituals = [
  { title: "Roasted With Patience", icon: Flame, copy: "Small-batch roasting preserves aroma without rushing the spice." },
  { title: "Blended For Emotion", icon: Heart, copy: "Every blend is designed around a meal moment, not a commodity shelf." },
  { title: "Rooted In Regions", icon: Leaf, copy: "Recipes honor Indian kitchens, regional preferences, and family traditions." }
];

export const adminMetrics = [
  { label: "Monthly revenue", value: "Rs. 8.4L", icon: Star },
  { label: "Repeat purchase", value: "41%", icon: Sparkles },
  { label: "Active subscriptions", value: "1,284", icon: Gift }
];

export const festivalCollections = ["Diwali Gifting", "Pongal Pantry", "Eid Dawat", "Navratri Satvik", "Wedding Favors"];
