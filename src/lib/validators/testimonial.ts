import { z } from "zod";

export const testimonialSchema = z.object({
  userName: z.string().min(2, "Please enter your name"),
  rating: z.coerce.number().int().min(1, "Please pick a rating").max(5),
  text: z.string().min(3, "Please write your review"),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
