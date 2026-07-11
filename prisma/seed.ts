import { PrismaClient, type SpiceLevel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedProduct = {
  id: string;
  name: string;
  assameseName: string;
  price: number;
  weight: string;
  spiceLevel: SpiceLevel;
  toneColor: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  stock: number;
  reviews: { userName: string; rating: number; text: string }[];
};

const products: SeedProduct[] = [
  {
    id: "garlic",
    name: "Garlic Pickle",
    assameseName: "ৰসুনৰ আচাৰ",
    price: 200,
    weight: "200g",
    spiceLevel: "MEDIUM",
    toneColor: "#c98a2a",
    description: "Whole garlic cloves in cold-pressed mustard oil with red chilli and hand-ground spice.",
    longDescription:
      "Whole garlic cloves slow-cured in cold-pressed mustard oil with salt, red chilli, turmeric and fenugreek. Mellow, sticky and deeply savoury — it lifts dal, rice and parathas alike. No preservatives added.",
    imageUrl: "/products/garlic.png",
    stock: 40,
    reviews: [
      {
        userName: "Ananya Das",
        rating: 5,
        text: "Tastes exactly like my grandmother made in Nagaon. The oil, the spice — perfect.",
      },
      {
        userName: "Rahul Mehta",
        rating: 4,
        text: "Lovely garlic flavour, not too spicy. Great with rice.",
      },
    ],
  },
  {
    id: "amla",
    name: "Amla Pickle",
    assameseName: "আমলাখি আচাৰ",
    price: 200,
    weight: "200g",
    spiceLevel: "MILD",
    toneColor: "#6a7b3f",
    description: "Whole Indian gooseberries in mustard oil and gentle spice — tangy and rich in vitamin C.",
    longDescription:
      "Whole amla (Indian gooseberry) softened and folded into a mild, tangy masala with cold-pressed mustard oil, turmeric and fenugreek. Bright, healthy and gentle on the palate — an everyday favourite. No preservatives added.",
    imageUrl: "/products/amla.png",
    stock: 50,
    reviews: [
      {
        userName: "Meghna R",
        rating: 5,
        text: "Tangy and healthy. I have a spoon every morning.",
      },
      { userName: "Kaushik Dutta", rating: 4, text: "Lovely balance of sour and spice. Not overpowering." },
    ],
  },
  {
    id: "chicken",
    name: "Chicken Pickle",
    assameseName: "মুৰ্গী মাংস আচাৰ",
    price: 350,
    weight: "200g",
    spiceLevel: "HOT",
    toneColor: "#7a2f1e",
    description: "Tender boneless chicken slow-cooked in mustard oil and roasted spices. 100% natural.",
    longDescription:
      "Boneless chicken slow-cooked with cold-pressed mustard oil and hand-roasted spices until dark, glossy and intensely savoury. A protein-rich pickle that eats like a meal on its own. 100% natural, no preservatives.",
    imageUrl: "/products/chicken.png",
    stock: 20,
    reviews: [
      {
        userName: "Priyanka Bora",
        rating: 5,
        text: "Absolutely addictive. The chicken is tender and the heat is spot on.",
      },
      { userName: "Sameer Khan", rating: 5, text: "Best chicken pickle I've had, ships fresh." },
    ],
  },
  {
    id: "mango",
    name: "Mango Chilli Pickle",
    assameseName: "আম জলকীয়া আচাৰ",
    price: 220,
    weight: "200g",
    spiceLevel: "HOT",
    toneColor: "#c76a28",
    description: "Raw mango and red chilli in mustard oil — tangy, hot and vibrant. 100% natural.",
    longDescription:
      "Sun-ripened raw mango cubes tossed with red chilli, mustard and a hand-ground spice blend in cold-pressed mustard oil. Tangy, punchy and vibrant — the perfect kick alongside rice and rotis. 100% natural, no preservatives.",
    imageUrl: "/products/mango-chilli.png",
    stock: 35,
    reviews: [
      {
        userName: "Priyanka Bora",
        rating: 5,
        text: "The mango-chilli combo is addictive. Perfect tang and heat.",
      },
      { userName: "Sameer Khan", rating: 4, text: "Fresh and zingy, tastes properly homemade." },
    ],
  },
  {
    id: "ghost",
    name: "Ghost Pepper Pickle",
    assameseName: "ভোট জলকীয়া আচাৰ",
    price: 260,
    weight: "200g",
    spiceLevel: "FIERY",
    toneColor: "#9d2f22",
    description: "Bhut jolokia (ghost pepper) slow-cooked into a fiery mustard-oil pickle. 100% natural.",
    longDescription:
      "Assam's legendary bhut jolokia (ghost pepper) slow-cooked into a thick, fiery pickle with mustard oil and roasted spices. Extreme heat with real flavour — a little goes a very long way. 100% natural, no preservatives.",
    imageUrl: "/products/ghost-pepper.png",
    stock: 25,
    reviews: [
      {
        userName: "Deep Saikia",
        rating: 5,
        text: "Properly fiery! Exactly the bhut jolokia burn I wanted.",
      },
      { userName: "Ritu Kalita", rating: 4, text: "Intense heat but you can still taste the pickle. Handle with care." },
    ],
  },
];

async function main() {
  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@kerumoni.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", passwordHash },
    create: {
      name: "Kerumoni Admin",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      authProvider: "CREDENTIALS",
    },
  });
  console.log(`✔ Admin ready: ${adminEmail}`);

  // Products + reviews (idempotent)
  for (const p of products) {
    const { reviews, ...data } = p;
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: data.name,
        assameseName: data.assameseName,
        price: data.price,
        weight: data.weight,
        spiceLevel: data.spiceLevel,
        toneColor: data.toneColor,
        description: data.description,
        longDescription: data.longDescription,
        imageUrl: data.imageUrl,
        stock: data.stock,
      },
      create: data,
    });

    // Reset reviews so ratings stay deterministic across re-seeds
    await prisma.review.deleteMany({ where: { productId: p.id } });
    if (reviews.length) {
      await prisma.review.createMany({
        data: reviews.map((r) => ({ ...r, productId: p.id })),
      });
    }
    console.log(`✔ Product ready: ${p.name}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
