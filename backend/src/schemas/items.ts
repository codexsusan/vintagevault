import { string, z } from "zod";

export const ItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  startingPrice: z
    .number()
    .positive("Starting price must be a positive number"),
  isPublished: z.boolean(),
  image: z.string(),
  auctionEndTime: z
    .string()
    .refine(
      (date) => new Date(date) >= new Date(),
      "Auction end date must be in the future"
    ),
});

export type ItemType = z.infer<typeof ItemSchema>;
