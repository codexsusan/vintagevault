import { Item } from "@/pages/admin/AddItem";
import { itemService, QueryParams } from "@/services/itemService";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useCreateItem = () => {
  return useMutation({
    mutationKey: ["createItem"],
    mutationFn: async (data: Item) => {
      return await itemService.createItem(data);
    },
  });
};

export const useGetItems = (queryParams: QueryParams) => {
  return useQuery({
    queryKey: ["getItems", queryParams],
    queryFn: async () => {
      return await itemService.getItems(queryParams);
    },
  });
};

export const useGetItemDetails = (id: string) => {
  return useQuery({
    queryKey: ["getItemDetails", id],
    queryFn: async () => {
      return await itemService.getItemDetails(id);
    },
  });
};
