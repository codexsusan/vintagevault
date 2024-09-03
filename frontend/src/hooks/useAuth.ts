import { authService } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
}

export const useLogin = () => {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (credentials: LoginData) => {
      return await authService.login(credentials);
    },
  });
};


export const useRegister = () => {
  return useMutation({
    mutationKey: ["register"],
    mutationFn: async (credentials: RegisterData) => {
      return await authService.register(credentials);
    },
  });
};