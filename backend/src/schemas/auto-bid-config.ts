import { z } from "zod";

export const AutoBidConfigSchema = z.object({
  maxBidAmount: z
    .number()
    .positive("Maximum bid amount must be a positive number"),
  bidAlertPercentage: z
    .number()
    .min(0, "Alert percentage must be between 0 and 100")
    .max(100, "Alert percentage must be between 0 and 100"),
  activeBids: z.array(z.string()),
});

export type AutoBidConfigType = z.infer<typeof AutoBidConfigSchema>;
