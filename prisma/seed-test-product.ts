import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seeds (or refreshes) the admin-only ₹5 "Live Payment Test Pickle".
 * Hidden from the public storefront and ships free — used to place a real,
 * cheap order against live Razorpay to confirm the payment flow works.
 *
 * Run:  npx tsx prisma/seed-test-product.ts
 */
const TEST_PRODUCT = {
  name: "Live Payment Test Pickle",
  assameseName: "পৰীক্ষা আচাৰ",
  originalPrice: 5,
  price: 5,
  discountPercent: 0,
  weight: "50g",
  spiceLevel: "MILD" as const,
  toneColor: "#b5482a",
  description: "Internal ₹5 test product for verifying live payments. Not visible to customers.",
  longDescription:
    "Admin-only test pickle for placing a real ₹5 order to confirm the live Razorpay flow end to end. Hidden from the shop and homepage, and ships free.",
  imageUrl: "/products/garlic.png",
  stock: 999,
  adminOnly: true,
  freeShipping: true,
};

async function main() {
  const existing = await prisma.product.findFirst({ where: { name: TEST_PRODUCT.name } });

  if (existing) {
    await prisma.product.update({ where: { id: existing.id }, data: TEST_PRODUCT });
    console.log(`Updated existing test pickle (${existing.id}).`);
  } else {
    const created = await prisma.product.create({ data: TEST_PRODUCT });
    console.log(`Created test pickle (${created.id}).`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
