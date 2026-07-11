import { z } from "zod";

export const spiceLevelSchema = z.enum(["MILD", "MEDIUM", "HOT", "FIERY"]);

export const productSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    assameseName: z.string().min(1, "Assamese name is required"),
    originalPrice: z.coerce.number().positive("Original price must be positive"),
    price: z.coerce.number().int().positive("Selling price must be positive"),
    weight: z.string().min(1, "Weight is required"),
    spiceLevel: spiceLevelSchema,
    description: z.string().min(5, "Add a short description"),
    longDescription: z.string().min(5, "Add a longer description"),
    imageUrl: z.string().min(1, "An image is required"),
    stock: z.coerce.number().int().min(0),
    toneColor: z
      .string()
      .regex(/^#([0-9a-fA-F]{6})$/, "Must be a hex color")
      .optional(),
  })
  .refine((d) => d.price <= d.originalPrice, {
    message: "Selling price can't exceed the MRP",
    path: ["price"],
  });

export type ProductInput = z.infer<typeof productSchema>;
