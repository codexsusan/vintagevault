import { z } from "zod";

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;
