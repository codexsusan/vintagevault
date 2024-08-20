import { authService } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";

export type LoginData = {
  username: string;
  password: string;
};

export const useLogin = () => {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (credentials: LoginData) => {
      return await authService.login(credentials);
    },
  });
};
