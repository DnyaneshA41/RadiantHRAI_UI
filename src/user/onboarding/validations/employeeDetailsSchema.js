import { z } from "zod";

/* =====================================================
   COMMON VALIDATION HELPERS
===================================================== */

const optionalText = (label, max = 100) =>
  z
    .string()
    .trim()
    .max(max, `${label} must not exceed ${max} characters`);

const requiredText = (label, min = 1, max = 100) =>
  z
    .string()
    .trim()
    .min(min, `${label} is required`)
    .max(max, `${label} must not exceed ${max} characters`);

const optionalEmail = (label) =>
  z
    .string()
    .trim()
    .refine(
      (value) =>
        !value ||
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(
          value
        ),
      `Enter a valid ${label}`
    );

const optionalMobile = (label) =>
  z
    .string()
    .trim()
    .refine(
      (value) => !value || /^\d+$/.test(value),
      `${label} must contain only numbers`
    )
    .refine(
      (value) => !value || value.length === 10,
      `${label} must be 10 digits`
    )
    .refine(
      (value) => !value || /^[6-9]\d{9}$/.test(value),
      `Invalid ${label}`
    );

const requiredMobile = (label) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .regex(/^\d+$/, "Only numbers are allowed")
    .length(10, `${label} must be 10 digits`)
    .regex(/^[6-9]\d{9}$/, `Invalid ${label}`);

/* =====================================================
   DATE VALIDATION HELPERS
   Expected storage format: yyyy-mm-dd
===================================================== */

const isValidDate = (value) => {
  if (!value) return true;

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const optionalDate = (label) =>
  z
    .string()
    .refine(
      (value) => isValidDate(value),
      `Enter a valid ${label}`
    );

const requiredDate = (label) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine(
      (value) => isValidDate(value),
      `Enter a valid ${label}`
    );

const optionalPersonName = (label) =>
  z
    .string()
    .trim()
    .refine(
      (value) => !value || value.length >= 3,
      `${label} must be at least 3 characters`
    )
    .refine(
      (value) => !value || /^[A-Za-z ]+$/.test(value),
      `${label} must contain only alphabets`
    );

/* =====================================================
   EMPLOYEE DETAILS - BASE SCHEMA
   Used for individual field validation
===================================================== */

export const employeeDetailsBaseSchema = z.object({
  // Organization & employment details

  organization: requiredText("Organization"),
  entity: requiredText("Entity"),
  employeeTitle: requiredText("Salutation"),

  employeeName: z
    .string()
    .trim()
    .min(1, "Employee name is required")
    .refine(
      (value) => value.length >= 3,
      "Employee name must be at least 3 characters"
    )
    .refine(
      (value) => !value || /^[A-Za-z ]+$/.test(value),
      "Employee name must contain only alphabets"
    ),

  employeeNo: requiredText("Employee no", 1, 30),
  employeeCardNo: requiredText("Employee card no", 1, 30),
  subEntity: requiredText("Sub entity"),
  department: requiredText("Department"),

  subDepartment: optionalText("Sub department"),
  designation: requiredText("Designation"),
  level: optionalText("Level"),
  workForce: optionalText("Workforce"),
  group: optionalText("Group"),

  organizationEmail: optionalEmail("Organization email"),
  reportingManager: optionalText("Reporting manager"),
  type: optionalText("Type"),

  probationEndDate: optionalDate("Probation end date"),
  traineeEndDate: optionalDate("Trainee end date"),

  grade: requiredText("Grade"),
  leftEmployee: z.boolean(),

  organizationMobileNo: optionalMobile("Organization mobile number"),

  joiningDate: requiredDate("Joining date"),
  confirmationDate: optionalDate("Confirmation date"),
  employeeLeftDate: optionalDate("Employee left date"),

  // Personal details

  aadhaarNo: z
    .string()
    .trim()
    .min(1, "Aadhaar number is required")
    .regex(/^\d+$/, "Only numbers are allowed")
    .length(12, "Aadhaar number must be 12 digits"),

  nameAsPerAadhaar: optionalPersonName("Name as per Aadhaar"),

  mobileAadhaarLink: z.boolean(),
  panLinkWithAadhaar: z.boolean(),

  pan: z
    .string()
    .trim()
    .min(1, "PAN is required")
    .refine(
      (value) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.toUpperCase()),
      "Enter a valid PAN"
    )
    .transform((value) => value.toUpperCase()),

  nameAsPerPan: optionalPersonName("Name as per PAN"),

  primaryMobileNo: requiredMobile("Primary mobile no"),
  personalEmailId: optionalEmail("Email ID"),
  emergencyNo: requiredMobile("Emergency no"),
  whatsAppNo: optionalMobile("WhatsApp no"),

  gender: requiredText("Gender"),

  birthDate: requiredDate("Date of birth").refine(
    (value) => {
      if (!isValidDate(value) || !value) return false;

      const [year, month, day] = value.split("-").map(Number);
      const dob = new Date(year, month - 1, day);
      const today = new Date();

      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }

      return age >= 18;
    },
    "Employee must be at least 18 years old"
  ),

  civilStatus: optionalText("Civil status"),
  bloodGroup: optionalText("Blood group"),
  religion: optionalText("Religion"),
  caste: optionalText("Caste"),

  physicalDisability: optionalText("Physical disability"),
  physicalDisabilityType: optionalText("Physical disability type"),

  passportNo: z
    .string()
    .trim()
    .min(1, "Passport no is required")
    .refine(
      (value) => /^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]{6,12}$/i.test(value),
      "Enter a valid passport no (6–12 characters, with letters and numbers)"
    ),

  passportExpiryDate: optionalDate("Passport expiry date"),

  drivingLicenceNo: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^(?=.*[0-9])[A-Z0-9]{6,16}$/i.test(value),
      "Enter a valid driving licence number (6–16 characters)"
    ),

  drivingLicenceExpiryDate: optionalDate("Driving licence expiry date"),

  signature: z.any().nullable().optional(),
  photo: z.any().nullable().optional(),

  assignIdCard: optionalText("Assign ID card"),
});

/* =====================================================
   EMPLOYMENT DATE COMPARISON
===================================================== */

const employmentDateFields = {
  probationEndDate: "Probation end date",
  traineeEndDate: "Trainee end date",
  confirmationDate: "Confirmation date",
  employeeLeftDate: "Employee left date",
};

export const validateEmploymentDate = (
  fieldName,
  value,
  formData
) => {
  const label = employmentDateFields[fieldName];

  if (
    !label ||
    !value ||
    !formData?.joiningDate ||
    !isValidDate(value) ||
    !isValidDate(formData.joiningDate)
  ) {
    return "";
  }

  if (value < formData.joiningDate) {
    return `${label} cannot be before Joining date`;
  }

  return "";
};

/* =====================================================
   COMPLETE SCHEMA
   Includes conditional and cross-field validation
===================================================== */

export const employeeDetailsSchema =
  employeeDetailsBaseSchema.superRefine((data, context) => {
    // Employee left date is required when Left Employee is checked
    if (data.leftEmployee && !data.employeeLeftDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["employeeLeftDate"],
        message: "Employee left date is required",
      });
    }

    // Employment dates cannot be before Joining date
    Object.entries(employmentDateFields).forEach(
      ([fieldName, label]) => {
        const dateValue = data[fieldName];

        // Employee left date is checked only for employees marked as left
        if (fieldName === "employeeLeftDate" && !data.leftEmployee) {
          return;
        }

        if (
          data.joiningDate &&
          dateValue &&
          isValidDate(data.joiningDate) &&
          isValidDate(dateValue) &&
          dateValue < data.joiningDate
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [fieldName],
            message: `${label} cannot be before Joining date`,
          });
        }
      }
    );
  });
