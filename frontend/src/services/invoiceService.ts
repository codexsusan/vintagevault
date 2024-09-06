import { AxiosError } from "axios";
import { apiService } from "./apiServices";
import { z } from "zod";

const GetItemInvoiceResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    itemId: z.string(),
    userId: z.string(),
    amount: z.number(),
    timestamp: z.string(),
    invoiceUrl: z.string(),
  }),
});

export type GetItemInvoiceResponse = z.infer<
  typeof GetItemInvoiceResponseSchema
>;

class InvoiceService {
  async getItemInvoice(id: string): Promise<GetItemInvoiceResponse> {
    try {
      const response = await apiService.get<GetItemInvoiceResponse>(
        `invoices/${id}`
      );

      console.log(response);
      const validatedData = GetItemInvoiceResponseSchema.parse(response);
      return validatedData;
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.message);
      }
      throw error;
    }
  }

  async downloadInvoice(invoiceId: string): Promise<Blob> {
    try {
      const response = await apiService.get<Blob>(`invoices/download/${invoiceId}`, {
        responseType: "blob",
      });

      return response;
    } catch (error) {
      console.error("Error downloading invoice:", error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data.message || "Failed to download invoice"
        );
      }
      throw error;
    }
  }
}

export const invoiceService = new InvoiceService();
