import { z } from "zod";

export const departmentSchema = z.object({
  rdhR0000XIName: z
    .string()
    .trim()
    .min(1, "Department Name is required")
    .max(100, "Department Name cannot exceed 100 characters"),
});