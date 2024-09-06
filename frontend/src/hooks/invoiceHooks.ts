import { invoiceService } from "@/services/invoiceService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useGetItemInvoice = (itemId: string, hasWonBid: boolean) => {
  return useQuery({
    queryKey: ["getItemInvoice"],
    queryFn: async () => {
      return await invoiceService.getItemInvoice(itemId);
    },
    enabled: hasWonBid,
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return false;
      }
      // Retry for other errors
      return failureCount < 3;
    },
  });
};


export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const blob = await invoiceService.downloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};