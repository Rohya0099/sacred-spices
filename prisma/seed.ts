import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();
const isProduction = process.env.NODE_ENV === "production";

function isStrongSeedPassword(password: string) {
  return (
    password.length >= 14 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function getSeedAdminEmail() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  if (email) return email;
  if (isProduction) throw new Error("SEED_ADMIN_EMAIL is required in production.");
  return "local-admin@sacredspices.dev";
}

function getSeedAdminPassword() {
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();
  if (!password && isProduction) throw new Error("SEED_ADMIN_PASSWORD is required in production.");
  const resolved = password || "LocalDevAdmin@12345";
  if (!isStrongSeedPassword(resolved)) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 14 characters and include uppercase, lowercase, number, and symbol.");
  }
  return resolved;
}

const productImage = "/images/products/sacred-garam-masala.jpg";
const mangoPickleImage = "/images/products/mango-pickle.jpg";
const lemonPickleImage = "/images/products/lemon-pickle.jpg";
const chaiImage = "/images/products/royal-chai-masala.jpg";
const giftImage = "/images/products/diwali-spice-gift-box.jpg";

const catalog = [
  {
    category: "masalas",
    name: "Sacred Garam Masala",
    slug: "sacred-garam-masala",
    description: "A signature all-purpose garam masala with roasted warmth, gentle sweetness, and a long aromatic finish.",
    emotionalStory: "Made for the last pinch before serving, the moment when a simple dal begins to smell like home.",
    ingredients: ["Coriander", "Cumin", "Black pepper", "Clove", "Cinnamon", "Green cardamom", "Bay leaf"],
    tasteProfile: ["Warm", "Layered", "Aromatic"],
    regionalInspiration: "North Indian family kitchens",
    cookingRecommendations: ["Dal tadka", "Aloo sabzi", "Paneer gravies", "Weeknight curries"],
    shelfLife: "Best before 9 months when stored airtight.",
    spiceLevel: 3,
    price: 449,
    inventory: 140,
    images: [productImage],
    badge: "Bestseller",
    isBestSeller: true,
    isFeatured: true
  },
  {
    category: "spice-blends",
    name: "Royal Chai Masala",
    slug: "royal-chai-masala",
    description: "A fragrant chai blend with cardamom brightness, ginger warmth, and a soft pepper finish.",
    emotionalStory: "For slow mornings, steel cups, rainy windows, and conversations that become family rituals.",
    ingredients: ["Green cardamom", "Dry ginger", "Black pepper", "Cinnamon", "Clove", "Nutmeg"],
    tasteProfile: ["Fragrant", "Warming", "Comforting"],
    regionalInspiration: "Indian chai stalls and home kitchens",
    cookingRecommendations: ["Milk chai", "Masala tea", "Chai desserts", "Festive beverages"],
    shelfLife: "Best before 9 months when stored airtight.",
    spiceLevel: 2,
    price: 399,
    inventory: 110,
    images: [chaiImage],
    badge: "New",
    isBestSeller: false,
    isFeatured: true
  },
  {
    category: "pickles",
    name: "Mango Pickle",
    slug: "mango-pickle",
    description: "A bold mango pickle with mustard bite, chilli heat, and the familiar tang of summer jars.",
    emotionalStory: "Inspired by sunlit terraces, ceramic bharanis, and the patient joy of pickle season.",
    ingredients: ["Raw mango", "Mustard", "Fenugreek", "Red chilli", "Turmeric", "Cold-pressed oil"],
    tasteProfile: ["Tangy", "Bold", "Nostalgic"],
    regionalInspiration: "Pan-Indian summer pickle traditions",
    cookingRecommendations: ["Curd rice", "Parathas", "Khichdi", "Dal chawal"],
    shelfLife: "Best before 12 months when stored airtight and dry.",
    spiceLevel: 4,
    price: 349,
    inventory: 95,
    images: [mangoPickleImage],
    badge: "Bestseller",
    isBestSeller: true,
    isFeatured: true
  },
  {
    category: "pickles",
    name: "Lemon Pickle",
    slug: "lemon-pickle",
    description: "A bright lemon pickle with citrus depth, mellow spice, and a slow aged tang.",
    emotionalStory: "A small spoonful that brings back train journeys, packed lunches, and food wrapped with care.",
    ingredients: ["Lemon", "Mustard", "Fenugreek", "Chilli", "Turmeric", "Rock salt"],
    tasteProfile: ["Citrusy", "Tangy", "Mellow"],
    regionalInspiration: "Gujarati and South Indian pickle memories",
    cookingRecommendations: ["Thepla", "Curd rice", "Upma", "Simple dal meals"],
    shelfLife: "Best before 12 months when stored airtight and dry.",
    spiceLevel: 3,
    price: 329,
    inventory: 90,
    images: [lemonPickleImage],
    badge: "New",
    isBestSeller: false,
    isFeatured: true
  },
  {
    category: "masalas",
    name: "Kitchen King Masala",
    slug: "kitchen-king-masala",
    description: "A rich everyday masala for sabzis and gravies with balanced heat, body, and restaurant-style aroma.",
    emotionalStory: "Designed for busy evenings when dinner still deserves the feeling of being made with attention.",
    ingredients: ["Coriander", "Cumin", "Turmeric", "Fennel", "Black pepper", "Dry mango", "Kasuri methi"],
    tasteProfile: ["Savory", "Balanced", "Full-bodied"],
    regionalInspiration: "Modern Indian home cooking",
    cookingRecommendations: ["Mixed veg", "Paneer", "Chole", "Creamy gravies"],
    shelfLife: "Best before 9 months when stored airtight.",
    spiceLevel: 3,
    price: 429,
    inventory: 130,
    images: [productImage],
    badge: "Bestseller",
    isBestSeller: true,
    isFeatured: true
  },
  {
    category: "regional-collections",
    name: "Kolhapuri Masala",
    slug: "kolhapuri-masala",
    description: "A fiery Maharashtrian blend with toasted coconut depth, chilli intensity, and earthy spice.",
    emotionalStory: "For meals that arrive with confidence, heat, and the memory of regional kitchens that do not whisper.",
    ingredients: ["Byadgi chilli", "Coconut", "Sesame", "Coriander", "Cumin", "Clove", "Black stone flower"],
    tasteProfile: ["Fiery", "Toasty", "Earthy"],
    regionalInspiration: "Kolhapur, Maharashtra",
    cookingRecommendations: ["Kolhapuri vegetables", "Misal", "Usal", "Bold curries"],
    shelfLife: "Best before 9 months when stored airtight.",
    spiceLevel: 5,
    price: 499,
    inventory: 70,
    images: [productImage],
    badge: "Limited Edition",
    isBestSeller: false,
    isFeatured: true
  },
  {
    category: "masalas",
    name: "Biryani Masala",
    slug: "biryani-masala",
    description: "A celebratory biryani masala with floral spice, warm aromatics, and a regal lingering finish.",
    emotionalStory: "Built for the heavy-lidded pot, the first opening of steam, and the hush before everyone serves themselves.",
    ingredients: ["Cinnamon", "Cardamom", "Clove", "Mace", "Nutmeg", "Shahi jeera", "Bay leaf"],
    tasteProfile: ["Floral", "Regal", "Deep"],
    regionalInspiration: "Hyderabadi and Lucknowi biryani traditions",
    cookingRecommendations: ["Vegetable biryani", "Dum rice", "Pulao", "Celebration gravies"],
    shelfLife: "Best before 9 months when stored airtight.",
    spiceLevel: 3,
    price: 549,
    inventory: 85,
    images: [productImage],
    badge: "Festival Special",
    isBestSeller: false,
    isFeatured: true
  },
  {
    category: "spice-blends",
    name: "Turmeric Powder",
    slug: "turmeric-powder",
    description: "A golden turmeric powder with earthy aroma, clean color, and everyday cooking versatility.",
    emotionalStory: "The quiet foundation of Indian kitchens, present in daily meals without asking for attention.",
    ingredients: ["Turmeric"],
    tasteProfile: ["Earthy", "Golden", "Gentle"],
    regionalInspiration: "Traditional Indian pantry staples",
    cookingRecommendations: ["Dal", "Sabzi", "Rice", "Marinades"],
    shelfLife: "Best before 12 months when stored airtight.",
    spiceLevel: 1,
    price: 249,
    inventory: 160,
    images: [productImage],
    badge: "New",
    isBestSeller: false,
    isFeatured: false
  },
  {
    category: "spice-blends",
    name: "Red Chilli Powder",
    slug: "red-chilli-powder",
    description: "A vivid chilli powder with balanced heat, rich color, and a clean roasted edge.",
    emotionalStory: "For the moment a curry deepens in color and the kitchen knows lunch is nearly ready.",
    ingredients: ["Sun-dried red chillies"],
    tasteProfile: ["Vivid", "Hot", "Clean"],
    regionalInspiration: "Indian chilli-growing regions",
    cookingRecommendations: ["Tadka", "Curries", "Pickles", "Marinades"],
    shelfLife: "Best before 12 months when stored airtight.",
    spiceLevel: 4,
    price: 279,
    inventory: 150,
    images: [productImage],
    badge: "Bestseller",
    isBestSeller: true,
    isFeatured: false
  },
  {
    category: "festival-boxes",
    name: "Diwali Spice Gift Box",
    slug: "diwali-spice-gift-box",
    description: "A premium festive box with signature masalas, chai spice, pickle accents, and gift-ready storytelling.",
    emotionalStory: "A box made for visiting homes, lighting lamps, sharing meals, and gifting flavor with memory.",
    ingredients: ["Sacred Garam Masala", "Royal Chai Masala", "Biryani Masala", "Mango Pickle"],
    tasteProfile: ["Celebratory", "Warm", "Giftable"],
    regionalInspiration: "Diwali gifting and Indian family gatherings",
    cookingRecommendations: ["Festive dinners", "Gift hampers", "Family celebrations", "Corporate gifting"],
    shelfLife: "Best before 9 months for spice blends and 12 months for pickles.",
    spiceLevel: 3,
    price: 1499,
    inventory: 40,
    images: [giftImage],
    badge: "Festival Special",
    isBestSeller: false,
    isFeatured: true
  }
];

const premiumDetails: Record<string, {
  price?: number;
  weight: string;
  packageType: string;
  storageInstructions: string;
  spiceLevelLabel: string;
  bestWith: string[];
  servesApprox: string;
  handcraftedNotes: string;
}> = {
  "sacred-garam-masala": {
    price: 549,
    weight: "500g",
    packageType: "Premium Pouch",
    storageInstructions: "Store airtight in a cool, dry place away from direct sunlight.",
    spiceLevelLabel: "Medium",
    bestWith: ["Dal", "Aloo sabzi", "Paneer gravies", "Daily curries"],
    servesApprox: "Approx. 80-100 home servings.",
    handcraftedNotes: "Slow-roasted in small batches for deeper aroma and a rounded finish."
  },
  "royal-chai-masala": {
    price: 399,
    weight: "250g",
    packageType: "Premium Pouch",
    storageInstructions: "Keep sealed after opening to preserve cardamom and ginger aroma.",
    spiceLevelLabel: "Mild",
    bestWith: ["Milk chai", "Masala tea", "Chai desserts"],
    servesApprox: "Approx. 80-100 cups of chai.",
    handcraftedNotes: "Blended for slow evenings, warm conversations, and a fragrant cup."
  },
  "mango-pickle": {
    price: 399,
    weight: "1kg",
    packageType: "Glass Jar",
    storageInstructions: "Use a clean, dry spoon. Keep oil layer intact and store away from moisture.",
    spiceLevelLabel: "Spicy",
    bestWith: ["Curd rice", "Parathas", "Khichdi", "Dal chawal"],
    servesApprox: "Approx. 35-45 meal accompaniments.",
    handcraftedNotes: "Handcrafted in small pickle batches; oil level may naturally vary."
  },
  "lemon-pickle": {
    price: 349,
    weight: "1kg",
    packageType: "Glass Jar",
    storageInstructions: "Use a clean, dry spoon. Store sealed after every use.",
    spiceLevelLabel: "Medium",
    bestWith: ["Thepla", "Curd rice", "Upma", "Simple dal meals"],
    servesApprox: "Approx. 35-45 meal accompaniments.",
    handcraftedNotes: "Aged in small batches for mellow citrus tang and balanced spice."
  },
  "kitchen-king-masala": {
    price: 429,
    weight: "500g",
    packageType: "Premium Pouch",
    storageInstructions: "Store airtight in a cool, dry place after opening.",
    spiceLevelLabel: "Medium",
    bestWith: ["Mixed veg", "Paneer", "Chole", "Creamy gravies"],
    servesApprox: "Approx. 70-90 home servings.",
    handcraftedNotes: "Prepared in small batches for reliable everyday aroma."
  },
  "kolhapuri-masala": {
    price: 499,
    weight: "500g",
    packageType: "Premium Pouch",
    storageInstructions: "Keep sealed and away from heat to protect chilli aroma.",
    spiceLevelLabel: "Spicy",
    bestWith: ["Misal", "Usal", "Kolhapuri vegetables", "Bold curries"],
    servesApprox: "Approx. 60-75 home servings.",
    handcraftedNotes: "Bold, fiery and slow-roasted for regional depth."
  },
  "biryani-masala": {
    price: 549,
    weight: "500g",
    packageType: "Premium Pouch",
    storageInstructions: "Store airtight so floral spices stay bright.",
    spiceLevelLabel: "Medium",
    bestWith: ["Vegetable biryani", "Dum rice", "Pulao", "Celebration gravies"],
    servesApprox: "Approx. 45-60 biryani portions.",
    handcraftedNotes: "Layered in small batches for celebration meals and dum cooking."
  },
  "turmeric-powder": {
    price: 249,
    weight: "1kg",
    packageType: "Premium Pouch",
    storageInstructions: "Store dry and airtight to preserve color and aroma.",
    spiceLevelLabel: "Mild",
    bestWith: ["Dal", "Sabzi", "Rice", "Marinades"],
    servesApprox: "Approx. 150+ daily cooking uses.",
    handcraftedNotes: "Packed in small batches for clean color and everyday freshness."
  },
  "red-chilli-powder": {
    price: 499,
    weight: "1kg",
    packageType: "Premium Pouch",
    storageInstructions: "Keep sealed and dry to protect color and heat.",
    spiceLevelLabel: "Spicy",
    bestWith: ["Tadka", "Curries", "Pickles", "Marinades"],
    servesApprox: "Approx. 150+ daily cooking uses.",
    handcraftedNotes: "Ground and packed in small batches for vivid color and steady heat."
  },
  "diwali-spice-gift-box": {
    price: 1499,
    weight: "Gift box",
    packageType: "Luxury Gift Box",
    storageInstructions: "Store each included product as directed on its pack.",
    spiceLevelLabel: "Medium",
    bestWith: ["Festive dinners", "Gift hampers", "Family celebrations", "Corporate gifting"],
    servesApprox: "Gift-ready assortment for family celebrations.",
    handcraftedNotes: "Packed as a festive small-batch assortment for premium gifting."
  }
};

function localProductImages(slug: string) {
  if (slug === "kitchen-king-masala") return ["/images/products/kitchen-king-masala.jpg"];
  if (slug === "sacred-garam-masala") return ["/images/products/sacred-garam-masala-1.png"];
  return [`/images/products/${slug}.jpg`, `/images/products/${slug}-1.jpg`, `/images/products/${slug}-2.jpg`];
}

async function main() {
  const categories = [
    ["Masalas", "masalas"],
    ["Pickles", "pickles"],
    ["Chutneys", "chutneys"],
    ["Spice Blends", "spice-blends"],
    ["Royal Collections", "royal-collections"],
    ["Festival Boxes", "festival-boxes"],
    ["Regional Collections", "regional-collections"]
  ];

  for (const [name, slug] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name, description: `${name} crafted for premium Indian kitchens.` },
      create: {
        name,
        slug,
        description: `${name} crafted for premium Indian kitchens.`
      }
    });
  }

  const categoryMap = new Map((await prisma.category.findMany()).map((category) => [category.slug, category.id]));

  for (const product of catalog) {
    const categoryId = categoryMap.get(product.category);
    if (!categoryId) throw new Error(`Missing category ${product.category}`);
    const { category, ...productData } = product;
    const details = premiumDetails[product.slug];
    const images = localProductImages(product.slug);

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        categoryId,
        ...productData,
        ...details,
        price: details?.price ?? productData.price,
        primaryImage: images[0],
        images
      },
      create: {
        ...productData,
        ...details,
        price: details?.price ?? productData.price,
        primaryImage: images[0],
        images,
        categoryId
      }
    });
  }

  const adminEmail = getSeedAdminEmail();
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      passwordHash: hashPassword(getSeedAdminPassword())
    },
    create: {
      email: adminEmail,
      name: "Sacred Spices Admin",
      role: "ADMIN",
      passwordHash: hashPassword(getSeedAdminPassword())
    }
  });

  let customer = null;
  if (!isProduction) {
    customer = await prisma.user.upsert({
      where: { email: "customer@sacredspices.local" },
      update: {
        passwordHash: hashPassword(process.env.SEED_CUSTOMER_PASSWORD ?? "SacredCustomer123!")
      },
      create: {
        email: "customer@sacredspices.local",
        name: "Demo Customer",
        role: "CUSTOMER",
        passwordHash: hashPassword(process.env.SEED_CUSTOMER_PASSWORD ?? "SacredCustomer123!"),
        customer: {
          create: {
            tasteProfile: {
              heat: "Medium",
              region: "Mixed",
              occasion: "Daily"
            }
          }
        }
      }
    });
  }

  await prisma.generatedContent.create({
    data: {
      userId: admin.id,
      type: "PRODUCT_STORY",
      prompt: "Launch story for Sacred Spices",
      output: "Every spice has a story, and every home deserves blends chosen with care."
    }
  });

  await prisma.coupon.upsert({
    where: { code: "SACRED10" },
    update: { percentOff: 10, isActive: true },
    create: {
      code: "SACRED10",
      description: "Demo launch coupon for testing checkout logic.",
      percentOff: 10
    }
  });

  if (customer) {
    await prisma.subscription.upsert({
      where: { id: "demo-sacred-monthly-box" },
      update: {},
      create: {
        id: "demo-sacred-monthly-box",
        userId: customer.id,
        spicePreference: "Balanced",
        familySize: "3-4",
        region: "Mixed",
        spicyLevel: 3
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
