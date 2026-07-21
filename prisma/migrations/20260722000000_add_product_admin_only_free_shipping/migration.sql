-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "adminOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "freeShipping" BOOLEAN NOT NULL DEFAULT false;
