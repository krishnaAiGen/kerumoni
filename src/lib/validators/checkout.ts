import { z } from "zod";

export const deliverySchema = z.object({
  customerName: z.string().min(2, "Full name is required"),
  phone: z.string().regex(/^\d{10}$/, "Enter a 10-digit phone number"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  paymentMethod: z.enum(["UPI", "CARD", "NETBANKING"]),
});

export type DeliveryInput = z.infer<typeof deliverySchema>;

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().min(2, "Write a short review"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
