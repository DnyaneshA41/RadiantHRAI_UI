import { z } from "zod";

export const entitySchema = z.object({
  rdhR0000IID: z
    .union([z.string(), z.number()])
    .refine(
      (value) =>
        value !== "" &&
        value !== null &&
        value !== undefined &&
        Number(value) > 0,
      "Please select an organization"
    ),

  rdhR0000IIName: z
    .string()
    .trim()
    .min(1, "Entity name is required")
    .max(150, "Entity name cannot exceed 150 characters"),

  rdhR0000IIAddress: z
    .string()
    .trim()
    .min(1, "Address is required")
    .max(250, "Address cannot exceed 250 characters"),

  phoneNo: z
     .string()
    .trim()
    .min(1, "Phone number is required")
    .length(10, "Phone number must be 10 digits")
    .regex(/^[6-9][0-9]{9}$/, "Invalid phone number"),

  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .regex(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/,
      "Enter a valid email address"
    ),

  logo: z.any().nullable().optional(),

  stamp: z.any().nullable().optional(),

  isActive: z.boolean().default(true),
});
