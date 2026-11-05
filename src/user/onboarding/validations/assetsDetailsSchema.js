import { z } from "zod";

const assetsDetailsSchema = z
  .object({
    asset: z.string().trim().min(1, "Asset is required."),

    assetTag: z.string().trim().min(1, "Asset tag is required."),

    issueDate: z.string().trim().min(1, "Issue date is required."),

    conditionRemark: z.string().optional(),

    requiredAlert: z.boolean(),

    alertDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.requiredAlert && !data.alertDate?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["alertDate"],
        message: "Alert date is required.",
      });
    }
  });

export default assetsDetailsSchema;