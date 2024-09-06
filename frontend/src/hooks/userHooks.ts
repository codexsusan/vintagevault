import { UpdateUserFormSchemaType } from "@/components/profile-page/PersonalDetails";
import { userService } from "@/services/userService";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      return await userService.getMe();
    },
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationKey: ["updateUser"],
    mutationFn: async (data: UpdateUserFormSchemaType) => {
      return await userService.updateUser(data);
    },
  });
};

export const useGetUserBiddingHistory = () => {
  return useQuery({
    queryKey: ["getUserBiddingHistory"],
    queryFn: async () => {
      return await userService.getUserBiddingHistory();
    },
  });
};
