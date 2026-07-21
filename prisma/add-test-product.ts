import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// TEMPORARY ₹1 product for live card/UPI payment testing.
// Remove with: npx tsx prisma/add-test-product.ts --remove
const TEST_ID = "test-1rupee";

async function main() {
  if (process.argv.includes("--remove")) {
    await prisma.cartItem.deleteMany({ where: { productId: TEST_ID } });
    await prisma.review.deleteMany({ where: { productId: TEST_ID } });
    await prisma.product.deleteMany({ where: { id: TEST_ID } });
    console.log("✔ Removed test product:", TEST_ID);
    return;
  }

  const data = {
    id: TEST_ID,
    name: "TEST Pickle — ₹1 (payment test)",
    assameseName: "পৰীক্ষা আচাৰ",
    originalPrice: 1,
    discountPercent: 0,
    price: 1,
    weight: "50g",
    spiceLevel: "MILD" as const,
    toneColor: "#6a7b3f",
    description: "Temporary ₹1 item to test card & UPI payments. Safe to delete after testing.",
    longDescription:
      "This is a temporary product priced at ₹1, added only to run a real end-to-end payment test (card and UPI). It is not a real product — remove it once testing is done.",
    imageUrl: "/products/garlic.png",
    stock: 999,
  };

  await prisma.product.upsert({ where: { id: TEST_ID }, update: data, create: data });
  console.log("✔ Test product ready: '" + data.name + "' (id: " + TEST_ID + ", price ₹1)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
