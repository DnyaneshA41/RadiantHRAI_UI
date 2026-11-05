
import { z } from "zod";

export const numericFields = [
  "minimumAge",
  "maximumAge",
  "minimumExperience",
  "maximumExperience",
  "minimumBudget",
  "maximumBudget",
  "referralBonus",
  "referralLimit",
];

const numberField = (label) =>
  z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined
        ? Number.NaN
        : Number(value),
    z
      .number({
        invalid_type_error: `${label} must be a valid number.`,
      })
      .finite(`${label} must be a valid number.`)
      .min(0, `${label} cannot be negative.`)
  );

const baseSchema = z.object({
  rdhR0000XIIName: z
    .string()
    .trim()
    .min(1, "Designation Name is required."),

  recruitmentApplicable: z.boolean(),

  minimumAge: numberField("Minimum Age"),
  maximumAge: numberField("Maximum Age"),
  minimumExperience: numberField("Minimum Experience"),
  maximumExperience: numberField("Maximum Experience"),
  minimumBudget: numberField("Minimum Budget"),
  maximumBudget: numberField("Maximum Budget"),
  referralBonus: numberField("Referral Bonus"),
  referralLimit: numberField("Referral Limit"),
});

export const designationSchema = baseSchema.superRefine(
  (data, ctx) => {
    // Skip ALL eligibility field validations when unchecked.
    if (!data.recruitmentApplicable) return;

    // Minimum age must be at least 18.
    if (data.minimumAge < 18) {
      ctx.addIssue({
        code: "custom",
        path: ["minimumAge"],
        message: "Minimum Age cannot be less than 18.",
      });
    }

    const comparisons = [
      {
        minimum: "minimumAge",
        maximum: "maximumAge",
        label: "Age",
      },
      {
        minimum: "minimumExperience",
        maximum: "maximumExperience",
        label: "Experience",
      },
      {
        minimum: "minimumBudget",
        maximum: "maximumBudget",
        label: "Budget",
      },
    ];

    comparisons.forEach(({ minimum, maximum, label }) => {
      if (
        Number.isFinite(data[minimum]) &&
        Number.isFinite(data[maximum]) &&
        data[minimum] > data[maximum]
      ) {
        ctx.addIssue({
          code: "custom",
          path: [maximum],
          message: `Maximum ${label} cannot be less than Minimum ${label}.`,
        });
      }
    });
  }
);
