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

export const useUpdateItem = () => {
  return useMutation({
    mutationKey: ["updateItem"],
    mutationFn: async (props: { id: string; data: Item }) => {
      return await itemService.updateItem(props);
    },
  });
};

export const useDeleteItem = () => {
  return useMutation({
    mutationKey: ["deleteItem"],
    mutationFn: async (id: string) => {
      return await itemService.deleteItem(id);
    },
  });
};
