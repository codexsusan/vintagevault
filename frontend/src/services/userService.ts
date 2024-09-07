import { AxiosError } from "axios";
import { apiService } from "./apiServices";
import { z } from "zod";
import { ApiResponse, ApiResponseSchema } from "@/types";
import { UpdateUserFormSchemaType } from "@/components/profile-page/PersonalDetails";

const GetMeResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
    bio: z.string(),
  }),
});

const GetUserBiddingHistoryResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(
    z.object({
      _id: z.string(),
      name: z.string(),
      description: z.string(),
      startingPrice: z.number(),
      currentPrice: z.number(),
      auctionEndTime: z.string(),
      image: z.string(),
      awarded: z.boolean(),
      status: z.string(),
      invoice: z
        .object({
          _id: z.string(),
          url: z.string(),
        })
        .nullable(),
      bids: z.array(
        z.object({
          _id: z.string(),
          amount: z.number(),
          timestamp: z.string(),
          isAutoBid: z.boolean(),
        })
      ),
    })
  ),
});

export type GetUserBiddingHistoryResponse = z.infer<
  typeof GetUserBiddingHistoryResponseSchema
>;

export type GetMeResponse = z.infer<typeof GetMeResponseSchema>;

export type UserBiddingHistoryQueryParams = {
  status: "all" | "in-progress" | "won" | "lost";
};

class UserService {
  async getMe(): Promise<GetMeResponse> {
    try {
      const response = await apiService.get<GetMeResponse>("user/me");
      const validatedData = GetMeResponseSchema.parse(response);
      return validatedData;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.message);
      }
      throw error;
    }
  }

  async updateUser(data: UpdateUserFormSchemaType): Promise<ApiResponse> {
    try {
      const response = await apiService.put<ApiResponse>(
        "user/update-info",
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

  async getUserBiddingHistory({
    status,
  }: UserBiddingHistoryQueryParams): Promise<GetUserBiddingHistoryResponse> {
    try {
      const baseUrl = "user/bidding-history";
      let finalUrl = baseUrl;
      if (status !== "all") {
        finalUrl = `${baseUrl}?status=${status}`;
      }
      const response = await apiService.get<GetUserBiddingHistoryResponse>(
        finalUrl
      );
      const validatedData = GetUserBiddingHistoryResponseSchema.parse(response);
      return validatedData;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.message);
      }
      throw error;
    }
  }
}

export const userService = new UserService();
