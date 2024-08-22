import { z } from "zod";
import { apiService } from "./apiServices";
import { AxiosError } from "axios";

export type PlaceBid = {
  itemId: string;
  amount: number;
  timestamp: string;
};

const PlaceBidResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  bid: z.object({
    _id: z.string(),
    itemId: z.string(),
    amount: z.number(),
    timestamp: z.string(),
  }),
});

export type PlaceBidResponse = z.infer<typeof PlaceBidResponseSchema>;

class BidService {
  async placeBid(data: PlaceBid): Promise<PlaceBidResponse> {
    try {
      const response = await apiService.post<PlaceBidResponse>("bids", data);

      const validatedData = PlaceBidResponseSchema.parse(response);
      return validatedData;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.message);
      }
      throw error;
    }
  }
}

export const bidService = new BidService();
