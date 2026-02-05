import { z } from "zod";

export const TechnicalSupportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Query message is required"),
});

export type TechnicalSupportValues = z.infer<
  typeof TechnicalSupportSchema
>;
