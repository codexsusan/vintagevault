import { LoginData, RegisterData } from "@/hooks/useAuth";
import { setAuthToken, setUserRole } from "@/utils/storage";
import { z } from "zod";
import { ApiError, apiService } from "./apiServices";
import { ApiResponse, ApiResponseSchema } from "@/types";

const loginResponseSchema = z.object({
  message: z.string(),
  success: z.boolean(),
  token: z.string().optional(),
  userType: z.string(),
});


export type LoginResponse = z.infer<typeof loginResponseSchema>;

class AuthService {
  async login(data: LoginData): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>("auth/login", data);
      const validatedData = loginResponseSchema.parse(response);

      // Storing in local storage
      setAuthToken(validatedData.token!);
      setUserRole(validatedData.userType);

      return validatedData;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw new Error("Invalid username or password");
      }
      throw error;
    }
  }

  async register(data: RegisterData): Promise<ApiResponse> {
    try {
      const response = await apiService.post<ApiResponse>("auth/register", data);
      const validatedData = ApiResponseSchema.parse(response);
      return validatedData;
    }
    catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw new Error("Invalid username or password");
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
