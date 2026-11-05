
import { z } from "zod";

/* =====================================================
   DATE VALIDATION HELPERS
===================================================== */

// Accepts yyyy-mm-dd, dd-mm-yyyy, and dd/mm/yyyy.
const isValidDate = (value) => {
  if (!value || typeof value !== "string") return false;

  let year;
  let month;
  let day;

  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    [year, month, day] = value.split("-").map(Number);
  }
  // dd-mm-yyyy or dd/mm/yyyy
  else if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(value)) {
    [day, month, year] = value.split(/[-/]/).map(Number);
  } else {
    return false;
  }

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

// Convert a valid date to yyyy-mm-dd for comparisons.
const normalizeDate = (value) => {
  if (!isValidDate(value)) return "";

  // Already yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // dd-mm-yyyy or dd/mm/yyyy
  const [day, month, year] = value.split(/[-/]/);

  return `${year}-${month}-${day}`;
};

/* =====================================================
   INCREMENT HISTORY SCHEMA
===================================================== */

export const incrementHistorySchema = z
  .object({
    incrementType: z
      .string()
      .trim()
      .min(1, "Increment type is required"),

    hikeMethod: z.enum(
      ["% hike", "Flat amount", "Target CTC"],
      { message: "Please select a hike method" }
    ),

    hikePercentage: z.string(),
    flatAmount: z.string(),
    targetCTC: z.string(),

    effectiveFrom: z
      .string()
      .min(1, "Effective from date is required")
      .refine(
        isValidDate,
        "Please select a valid effective date"
      ),

    arrearsFrom: z
      .string()
      .refine(
        (value) => value === "" || isValidDate(value),
        "Please enter a valid arrears date"
      ),

    reason: z
      .string()
      .trim()
      .min(1, "Reason / justification is required"),

    approver: z
      .string()
      .trim()
      .min(1, "Approver is required"),
  })
  .superRefine((data, ctx) => {
    // Percentage hike validation
    if (
      data.hikeMethod === "% hike" &&
      (
        !data.hikePercentage.trim() ||
        !Number.isFinite(Number(data.hikePercentage)) ||
        Number(data.hikePercentage) <= 0
      )
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["hikePercentage"],
        message: "Hike percentage must be greater than 0",
      });
    }

    // Flat amount validation
    if (
      data.hikeMethod === "Flat amount" &&
      (
        !data.flatAmount.trim() ||
        !Number.isFinite(Number(data.flatAmount)) ||
        Number(data.flatAmount) <= 0
      )
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["flatAmount"],
        message: "Hike amount must be greater than 0",
      });
    }

    // Target CTC validation
    if (
      data.hikeMethod === "Target CTC" &&
      (
        !data.targetCTC.trim() ||
        !Number.isFinite(Number(data.targetCTC)) ||
        Number(data.targetCTC) <= 0
      )
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["targetCTC"],
        message: "Target CTC must be greater than 0",
      });
    }

    // Compare dates only when both are valid.
    const arrearsDate = normalizeDate(data.arrearsFrom);
    const effectiveDate = normalizeDate(data.effectiveFrom);

    if (
      data.arrearsFrom &&
      arrearsDate &&
      effectiveDate &&
      arrearsDate > effectiveDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["arrearsFrom"],
        message:
          "Arrears date cannot be later than the effective date",
      });
    }
  });

/* =====================================================
   VALIDATE COMPLETE FORM
===================================================== */

export const validateIncrementForm = (formData) => {
  const result = incrementHistorySchema.safeParse(formData);

  if (result.success) {
    return {};
  }

  return result.error.issues.reduce((errors, issue) => {
    const field = issue.path[0];

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }

    return errors;
  }, {});
};

/* =====================================================
   VALIDATE SINGLE FIELD
===================================================== */

export const validateIncrementField = (name, formData) => {
  return validateIncrementForm(formData)[name] || "";
};
