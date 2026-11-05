
import { z } from "zod";

/* =========================================================
   VALIDATION HELPERS
========================================================= */

const requiredText = (field) =>
  z.string().trim().min(1, `${field} is required`);

const optionalText = z.string().optional().default("");

const ifscCodeSchema = (required = false) =>
  z.string().trim().superRefine((value, ctx) => {
    if (!value && !required) return;

    if (!value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "IFSC code is required",
      });
      return;
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid IFSC Code",
      });
    }
  });

const accountNumberSchema = (required = false) =>
  z.string().trim().superRefine((value, ctx) => {
    if (!value && !required) return;

    if (!value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Account number is required",
      });
      return;
    }

    if (!/^\d+$/.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Account number must contain only digits",
      });
      return;
    }

    if (value.length < 9 || value.length > 18) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Account number must be between 9 and 18 digits",
      });
    }
  });

const pinCodeSchema = z.string().trim().superRefine((value, ctx) => {
  if (!value) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Pin code is required",
    });
    return;
  }

  if (!/^[1-9]\d{5}$/.test(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter a valid 6 digit Pin Code",
    });
  }
});

/* =========================================================
   BANK DETAILS SCHEMA
========================================================= */

const salaryBankSchema = z.object({
  ifscCode: ifscCodeSchema(true),

  bankName: requiredText("Bank name"),

  accountNo: accountNumberSchema(true),
});

const personalBankSchema = z.object({
  ifscCode: ifscCodeSchema(false),

  bankName: z.string().trim(),

  accountNo: accountNumberSchema(false),
});

/* =========================================================
   ADDRESS DETAILS SCHEMA
========================================================= */

const permanentAddressSchema = z.object({
  pinCode: pinCodeSchema,

  postOffice: requiredText("Post office"),

  state: requiredText("State"),

  city: requiredText("City"),

  district: requiredText("District"),

  address: requiredText("Address"),

  taluka: requiredText("Taluka"),
});

const presentAddressSchema = z.object({
  pinCode: z.string().trim(),

  postOffice: z.string().trim(),

  state: z.string().trim(),

  city: z.string().trim(),

  district: z.string().trim(),

  address: z.string().trim(),

  taluka: z.string().trim(),
});

/* =========================================================
   EMPLOYEE BANK FORM SCHEMA
========================================================= */

export const employeeBankSchema = z
  .object({
    salaryBank: salaryBankSchema,

    personalBank: personalBankSchema,

    permanentAddress: permanentAddressSchema,

    presentAddress: presentAddressSchema,

    sameBank: z.boolean().optional().default(false),

    sameAddress: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    /* =====================================================
       PERSONAL BANK VALIDATION
       Validate fields when entered, unless Same as Above
       is selected.
    ===================================================== */

    if (!data.sameBank) {
      const personal = data.personalBank;

      if (
        personal.ifscCode.trim() &&
        !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(personal.ifscCode.trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["personalBank", "ifscCode"],
          message: "Enter a valid IFSC Code",
        });
      }

      if (
        personal.accountNo.trim() &&
        !/^\d{9,18}$/.test(personal.accountNo.trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["personalBank", "accountNo"],
          message:
            "Account number must contain 9 to 18 digits",
        });
      }
    }

    /* =====================================================
       PRESENT ADDRESS VALIDATION
       Optional unless Same as Above is not selected and
       the user starts entering the present address.
    ===================================================== */

    if (!data.sameAddress) {
      const present = data.presentAddress;

      const fields = [
        ["pinCode", "Pin code"],
        ["postOffice", "Post office"],
        ["state", "State"],
        ["city", "City"],
        ["district", "District"],
        ["address", "Address"],
      ];

      const hasPresentAddress = fields.some(([field]) =>
        present[field]?.trim()
      );

      if (hasPresentAddress) {
        if (!present.pinCode.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["presentAddress", "pinCode"],
            message: "Pin code is required",
          });
        } else if (!/^[1-9]\d{5}$/.test(present.pinCode.trim())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["presentAddress", "pinCode"],
            message: "Enter a valid 6 digit Pin Code",
          });
        }

        fields.slice(1).forEach(([field, label]) => {
          if (!present[field]?.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["presentAddress", field],
              message: `${label} is required`,
            });
          }
        });
      }
    }
  });

export default employeeBankSchema;
