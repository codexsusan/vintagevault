import { removeAuthToken } from "@/utils/storage";
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  ResponseType,
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
          // This is an unauthorized access error
          removeAuthToken();
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  };

  public async request<T>(
    method: "get" | "post" | "put" | "delete",
    url: string,
    config?: {
      params?: Record<string, unknown>;
      data?: unknown;
      responseType?: ResponseType;
    }
  ): Promise<T> {
    return this.api.request({
      method,
      url,
      ...config,
    });
  }

  public async get<T>(
    url: string,
    config?: {
      params?: Record<string, unknown>;
      responseType?: ResponseType;
    }
  ): Promise<T> {
    return this.request("get", url, config);
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: { responseType?: ResponseType }
  ): Promise<T> {
    return this.request("post", url, { ...config, data });
  }

  public async put<T>(
    url: string,
    data?: unknown,
    config?: { responseType?: ResponseType }
  ): Promise<T> {
    return this.request("put", url, { ...config, data });
  }

  public async delete<T>(
    url: string,
    config?: { responseType?: ResponseType }
  ): Promise<T> {
    return this.request("delete", url, config);
  }
}

export const apiService = new ApiService();
