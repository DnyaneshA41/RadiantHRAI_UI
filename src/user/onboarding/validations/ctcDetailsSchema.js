import { z } from "zod";

export const ctcDetailsSchema = z.object({
  annualCTC: z
    .string()
    .trim()
    .min(1, "Annual CTC is required")
    .refine(
      (value) => Number.isFinite(Number(value)),
      "Annual CTC must be a valid number",
    )
    .refine(
      (value) => Number(value) > 0,
      "Annual CTC must be greater than 0",
    ),

  monthlyCTC: z
    .string()
    .trim()
    .min(1, "Monthly CTC is required")
    .refine(
      (value) => Number.isFinite(Number(value)),
      "Monthly CTC must be a valid number",
    )
    .refine(
      (value) => Number(value) > 0,
      "Monthly CTC must be greater than 0",
    ),

  effectiveFrom: z
    .string()
    .min(1, "Effective from date is required")
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      "Please enter a valid effective date",
    ),

  payCycle: z
    .string()
    .trim()
    .min(1, "Pay cycle is required"),
});

export const validateCTCField = (name, value, formData = {}) => {
  const result = ctcDetailsSchema.safeParse({
    ...formData,
    [name]: value,
  });

  if (result.success) return "";

  const fieldError = result.error.issues.find(
    (issue) => issue.path[0] === name,
  );

  return fieldError?.message || "";
};

export const validateCTCForm = (formData) => {
  const result = ctcDetailsSchema.safeParse(formData);

  if (result.success) return {};

  return result.error.issues.reduce((errors, issue) => {
    const fieldName = issue.path[0];

    if (fieldName && !errors[fieldName]) {
      errors[fieldName] = issue.message;
    }

    return errors;
  }, {});
};

export const isCTCFormValid = (formData) => {
  return ctcDetailsSchema.safeParse(formData).success;
};