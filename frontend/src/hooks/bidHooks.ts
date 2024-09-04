import { bidService, PlaceBid } from "@/services/bidServices";
import { useMutation } from "@tanstack/react-query";

export const usePlaceBid = () => {
  return useMutation({
    mutationKey: ["placeBid"],
    mutationFn: async (data: PlaceBid) => {
      return await bidService.placeBid(data);
    },
  });
};


