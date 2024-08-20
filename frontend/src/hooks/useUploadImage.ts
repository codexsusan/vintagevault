import { UploadResponse } from "@/pages/admin/AddItem";
import { apiService } from "@/services/apiServices";
import { useMutation } from "@tanstack/react-query";

export const useUploadImage = () => {
  return useMutation({
    mutationKey: ["uploadImage"],
    mutationFn: async (data: FormData) => {
        const response = await apiService.post<UploadResponse>(
          "images/single",
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response;
    },
  });
};
