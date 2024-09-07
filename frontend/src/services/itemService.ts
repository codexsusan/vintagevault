import { Item } from "@/pages/admin/AddItem";
import { z } from "zod";
import { apiService } from "./apiServices";
import { AxiosError } from "axios";
import { ApiResponse, ApiResponseSchema } from "@/types";
import { combineDateAndTime } from "@/utils/dateandtime";

const GetItemsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
  items: z.array(
    z.object({
      _id: z.string(),
      name: z.string(),
      adminId: z.string(),
      description: z.string(),
      startingPrice: z.number(),
      currentPrice: z.number(),
      image: z.string(),
      auctionEndTime: z.string(),
    })
  ),
});

const GetItemDetailsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  item: z.object({
    _id: z.string(),
    name: z.string(),
    adminId: z.string(),
    description: z.string(),
    startingPrice: z.number(),
    currentPrice: z.number(),
    image: z.string(),
    imageKey: z.string(),
    auctionEndTime: z.string(),
    bids: z.array(z.string()),
    awarded: z.boolean(),
    user: z
      .object({
        _id: z.string(),
        name: z.string(),
        isWinner: z.boolean(),
      })
      .optional(),
  }),
});

const GetItemBiddingHistoryResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(
    z.object({
      _id: z.string(),
      itemId: z.string(),
      amount: z.number(),
      timestamp: z.string(),
      isAutoBid: z.boolean(),
      user: z.object({
        _id: z.string(),
        name: z.string(),
        email: z.string(),
      }),
    })
  ),
});

export type QueryParams = {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};



export type GetItemsResponse = z.infer<typeof GetItemsResponseSchema>;

export type GetItemDetailsResponse = z.infer<
  typeof GetItemDetailsResponseSchema
>;

export type GetItemBiddingHistoryResponse = z.infer<
  typeof GetItemBiddingHistoryResponseSchema
>;



class ItemService {
  async createItem(data: Item): Promise<ApiResponse> {
    try {
      const combinedEndTime = combineDateAndTime(
        data.auctionEndTime.date,
        data.auctionEndTime.time
      );

      const updatedData = {
        ...data,
        auctionEndTime: combinedEndTime,
      };

      const response = await apiService.post<ApiResponse>("items", updatedData);
      const validatedData = ApiResponseSchema.parse(response);
      return validatedData;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.message);
      }
      throw error;
    }
  }

  async getItems(queryParams: QueryParams): Promise<GetItemsResponse> {
    try {
      const response = await apiService.get<GetItemsResponse>("items", {
        params: queryParams,
      });
      const validatedData = GetItemsResponseSchema.parse(response);
      return validatedData;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.message);
      }
      throw error;
    }
  }

  async getItemDetails(id: string): Promise<GetItemDetailsResponse> {
    try {
      const response = await apiService.get<GetItemDetailsResponse>(
        `items/${id}`
      );
      const validatedData = GetItemDetailsResponseSchema.parse(response);
      return validatedData;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.message);
      }
      throw error;
    }
  }

  async updateItem({
    id,
    data,
  }: {
    id: string;
    data: Item;
  }): Promise<ApiResponse> {
    try {
      const combinedEndTime = combineDateAndTime(
        data.auctionEndTime.date,
        data.auctionEndTime.time
      );

      const updatedData = {
        ...data,
        auctionEndTime: combinedEndTime,
      };
      const response = await apiService.put<ApiResponse>(
        `items/${id}`,
        updatedData
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

  async getItemBiddingHistory(id: string): Promise<GetItemBiddingHistoryResponse> {
    try {
      const response = await apiService.get<GetItemBiddingHistoryResponse>(
        `items/${id}/bidding-history`
      );
      const validatedData = GetItemBiddingHistoryResponseSchema.parse(response);
      return validatedData;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.message);
      }
      throw error;
    }
  }

  async deleteItem(id: string): Promise<ApiResponse> {
    try {
      const response = await apiService.delete<ApiResponse>(`items/${id}`);
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

export const itemService = new ItemService();
