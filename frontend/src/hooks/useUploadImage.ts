import { apiService } from "@/services/apiServices";
import { useMutation } from "@tanstack/react-query";
export type UploadImageResponse = {
  success: boolean;
  message: string;
  data: {
    url: string;
    key: string;
  };
}

export const useUploadImage = () => {
  return useMutation({
    mutationKey: ["uploadImage"],
    mutationFn: async (data: FormData) => {
        const response = await apiService.post<UploadImageResponse>(
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
