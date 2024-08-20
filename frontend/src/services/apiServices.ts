import { removeAuthToken } from "@/utils/token";
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const API_BASE_URL = "http://localhost:3500/api"; // Adjust this to your backend URL

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
    });

    this.api.interceptors.request.use(this.handleRequest);
    this.api.interceptors.response.use(this.handleResponse, this.handleError);
  }

  private handleRequest = (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  };

  private handleResponse = (response: AxiosResponse) => {
    return response.data;
  };

  private handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        const errorData = axiosError.response.data as { message?: string };
        if (errorData.message === "Invalid credentials") {
          // This is an invalid credentials error, throw a specific error
          throw new ApiError(401, "Invalid credentials");
        } else {
          // This is an unauthorized access error, handle as before
          removeAuthToken();
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  };

  public async get<T>(
    url: string,
    config?: { params?: Record<string, unknown> }
  ): Promise<T> {
    return this.api.get(url, config);
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>
  ): Promise<T> {
    return this.api.post(url, data, config);
  }

  public async put<T>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>
  ): Promise<T> {
    return this.api.put(url, data, config);
  }

  public async delete<T>(
    url: string,
    config?: Record<string, unknown>
  ): Promise<T> {
    return this.api.delete(url, config);
  }
}

export const apiService = new ApiService();
