import { z } from "zod";

export const AutoBidConfigSchema = z.object({
  maxBidAmount: z
    .number()
    .min(0.01, "Maximum bid amount must be greater than 0"),
  bidAlertPercentage: z
    .number()
    .min(1, "Percentage must be between 1 and 100")
    .max(100, "Percentage must be between 1 and 100"),
  itemId: z.string(),
});

export type AutoBidConfigType = z.infer<typeof AutoBidConfigSchema>;
