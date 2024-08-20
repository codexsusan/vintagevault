import { z } from "zod";

export const BidSchema = z.object({
  itemId: z.string(),
  amount: z.number().positive("Bid amount must be a positive number"),
  timestamp: z.date(),
});

export type BidType = z.infer<typeof BidSchema>;
