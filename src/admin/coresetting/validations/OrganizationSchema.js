import { z } from "zod";

export const organizationSchema = z.object({
    organizationName: z
        .string()
        .trim()
        .min(3, "Organization name is required")
        .max(150, "Organization name cannot exceed 150 characters"),

    shortName: z
        .string()
        .trim()
        .min(1, "Short name is required")
        .max(50, "Short name cannot exceed 50 characters"),

    address: z
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

    emailId:z
  .string()
  .trim()
  .min(1, "Email ID is required")
  .refine(
    (val) => {
      if (!val) return true;
 
      return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(
        val
      );
    },
    {
      message: "Invalid Email ID",
    }
  ),

  website: z
    .string()
    .trim()
    .min(1, "Website is required")
    .url("Enter a valid website URL"),

   ownerName: z
    .string()
    .trim()
    .min(3, "Owner name cannot be less than 3 characters")
    .max(100, "Owner name cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),

industryType: z.string().trim().optional(),

gstNumber: z
  .string()
  .trim()
  .min(1, "GST number is required")
  .max(15, "GST number cannot exceed 15 characters")
  .refine(
    (val) => {
      return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(
        val.toUpperCase()
      );
    },
    {
      message: "Invalid GST number",
    }
  ),

pan: z
    .string()
    .trim()
    .min(1,"PAN is required")
    .refine(
      (val) =>
        !val ||
        /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(val.toUpperCase()),
      {
        message: "Invalid PAN number",
      }
    ),

cin: z
  .string()
  .trim()
  .min(1, "CIN is required")
  .max(21, "CIN cannot exceed 21 characters")
  .refine(
    (val) => {
      return /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(
        val.toUpperCase()
      );
    },
    {
      message: "Invalid CIN format",
    }
  ),

    establishedDate: z
        .string()
        .min(1, "Established date is required"),

    slogan: z
        .string()
        .trim()
        .max(250, "Slogan cannot exceed 250 characters")
        .or(z.literal("")),

    organizationLogo: z.any().nullable().optional(),

    organizationStamp: z.any().nullable().optional(),

    whatsappRequired: z.boolean(),

    aadhaarVerificationRequired: z.boolean(),

    twoFactorAuthenticationRequired: z.boolean(),

    notificationRequired: z.boolean(),

    notificationDays: z
        .coerce
        .number()
        .min(0, "Notification days cannot be negative")
        .optional(),
});