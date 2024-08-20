import { z } from "zod";

export const AuctionSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  userId: z.string(),
  auctionStart: z
    .date()
    .refine(
      (date) => date >= new Date(),
      "Auction start date must be in the future"
    ),
  auctionEnd: z
    .date()
    .refine(
      (date) => date >= new Date(),
      "Auction end date must be in the future"
    ),
});


export type AuctionType = z.infer<typeof AuctionSchema>;