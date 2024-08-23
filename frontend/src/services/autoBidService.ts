import { ApiResponse, ApiResponseSchema } from "@/types";
import { AxiosError } from "axios";
import { z } from "zod";
import { apiService } from "./apiServices";

const GetAutoBidConfigResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    userId: z.string(),
    maxBidAmount: z.number(),
    bidAlertPercentage: z.number(),
    activeBids: z.array(
      z.object({
        itemId: z.string(),
        allocatedAmount: z.number(),
      })
    ),
    totalReservedAmount: z.number(),
    availableFunds: z.number(),
    status: z.enum(["active", "paused"]),
  }),
});

export type GetAutoBidConfigResponse = z.infer<
  typeof GetAutoBidConfigResponseSchema
>;

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

export type AutoBidConfig = z.infer<typeof AutoBidConfigSchema>;

class AutoBidService {
  async configureAutoBid(data: AutoBidConfig): Promise<ApiResponse> {
    try {
      const response = await apiService.post<ApiResponse>(
        "auto-bid/config",
        data
      );
      const validatedData = ApiResponseSchema.parse(response);
      return validatedData;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.message);
      }
      throw error;
    }
  }

  async getAutoBidConfig() {
    try {
      const response = await apiService.get<GetAutoBidConfigResponse>(
        "auto-bid/config"
      );
      console.log(response);
      const validatedData = GetAutoBidConfigResponseSchema.parse(response);
      return validatedData;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.message);
      }
      throw error;
    }
  }

  async toggleAutoBid(itemId: string): Promise<ApiResponse> {
    try {
      const response = await apiService.post<ApiResponse>(
        `auto-bid/toggle/${itemId}`
      );
      const validatedData = ApiResponseSchema.parse(response);
      return validatedData;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.message);
      }
      throw error;
    }
  }
}

export const autoBidService = new AutoBidService();
