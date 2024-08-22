import { Item } from "@/pages/admin/AddItem";
import { z } from "zod";
import { apiService } from "./apiServices";
import { AxiosError } from "axios";

const CreateItemResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

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
    auctionEndTime: z.string(),
  }),
});

export type QueryParams = {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

export type CreateItemResponse = z.infer<typeof CreateItemResponseSchema>;

export type GetItemsResponse = z.infer<typeof GetItemsResponseSchema>;

export type GetItemDetailsResponse = z.infer<
  typeof GetItemDetailsResponseSchema
>;

class ItemService {
  async createItem(data: Item): Promise<CreateItemResponse> {
    try {
      const { auctionEndTime, ...otherValues } = data;
      const [hours, minutes] = auctionEndTime.time.split(":").map(Number);
      const combinedDateTime = new Date(auctionEndTime.date);
      combinedDateTime.setHours(hours, minutes);

      const updatedData = {
        ...otherValues,
        auctionEndTime: combinedDateTime,
      };

      const response = await apiService.post<CreateItemResponse>(
        "items",
        updatedData
      );
      const validatedData = CreateItemResponseSchema.parse(response);
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
}

export const itemService = new ItemService();
