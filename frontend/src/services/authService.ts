import { LoginData } from "@/hooks/useAuth";
import { setAuthToken } from "@/utils/token";
import { z } from "zod";
import { ApiError, apiService } from "./apiServices";

const loginResponseSchema = z.object({
  token: z.string(),
  role: z.string(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

class AuthService {
  async login(data: LoginData): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>("auth/login", data);
      const validatedData = loginResponseSchema.parse(response);

      // Storing token in local storage
      setAuthToken(validatedData.token);

      return validatedData;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw new Error("Invalid username or password");
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
