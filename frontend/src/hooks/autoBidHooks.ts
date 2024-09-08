import { AutoBidConfig, autoBidService } from "@/services/autoBidService";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useConfigureAutoBid = () => {
  return useMutation({
    mutationKey: ["configureAutoBid"],
    mutationFn: async (data: AutoBidConfig) => {
      return await autoBidService.configureAutoBid(data);
    },
  });
};

export const useGetAutoBidConfig = () => {
  return useQuery({
    queryKey: ["getAutoBidConfig"],
    queryFn: async () => {
      return await autoBidService.getAutoBidConfig();
    },
  });
};

export const useToggleAutoBid = () => {
  return useMutation({
    mutationKey: ["toggleAutoBid"],
    mutationFn: async (itemId: string) => {
      return await autoBidService.toggleAutoBid(itemId);
    },
  });
};

export const useToggleActivateAutoBid = () => {
  return useMutation({
    mutationKey: ["toggleActivateAutoBid"],
    mutationFn: async () => {
      return await autoBidService.toggleActivateAutoBid();
    },
  });
};
