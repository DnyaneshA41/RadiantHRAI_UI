
import { z } from "zod";

const requiredText = (label) =>
  z.string().trim().min(1, `${label} is required`);

export const attendanceDetailsBaseSchema = z.object({
  // Attendance Details
  shiftGroup: requiredText("Shift group"),

  otApplicable: z.boolean().optional(),
  otWorkingDayAndCoff: z.boolean().optional(),
  flexibleShiftApplicable: z.boolean().optional(),

  monthlyShortHrsEnabled: z.boolean().optional(),
  monthlyShortHrs: z.string().optional(),

  publicHolidayEligible: z.boolean().optional(),

  lateMarkEnabled: z.boolean().optional(),
  lateMark: z.string().optional(),

  coffApplicable: z.boolean().optional(),

  // Weekly Off Settings
  weeklyOff1: requiredText("I weekly off"),
  weeklyOff2: z.array(z.string()).optional(),

  // Attendance Settings
  personalGatepassSetting: requiredText(
    "Personal gatepass setting"
  ),
  leaveGroup: requiredText("Leave group"),
  outdoorSetting: requiredText("Outdoor setting"),
  punchMissingSetting: requiredText("Punch missing setting"),

  salaryFullDay: z.boolean().optional(),
  singlePunchPresent: z.boolean().optional(),
  regularizationRequired: z.boolean().optional(),
  defaultAttendanceShow: z.boolean().optional(),

  checkinsSetting: z
  .array(z.string())
  .min(1, "Checkins setting is required"),
  
  shortIntervalSetting: z.string().optional(),
  allowTracking: z.boolean().optional(),

  // Per Day Shift Hrs: optional, but if entered must be > 0
  perDayShiftHrs: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value?.trim()) return true;

        const hours = Number(value);

        return Number.isFinite(hours) && hours > 0;
      },
      "Per day shift hrs must be greater than 0"
    ),

  // Service Access
  loginId: requiredText("Login ID"),
  roleAccessPolicy: requiredText("Role access policy"),

  isActive: z.boolean().optional(),
});

export const attendanceDetailsSchema =
  attendanceDetailsBaseSchema.superRefine((data, ctx) => {
    // Prevent II Weekly Off from matching I Weekly Off
    const secondWeekOffs = data.weeklyOff2 ?? [];
    const firstWeekOff = data.weeklyOff1?.trim();

    if (
      firstWeekOff &&
      secondWeekOffs.some(
        (day) => day.trim() === firstWeekOff
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["weeklyOff2"],
        message:
          "II weekly off cannot be the same as I weekly off",
      });
    }

    // Late Mark: required only when enabled
if (data.lateMarkEnabled && !data.lateMark?.trim()) {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ["lateMark"],
    message: "Late mark is required",
  });
}

    // Monthly Short Hrs: required and must be > 0 when enabled
    if (data.monthlyShortHrsEnabled) {
      const value = data.monthlyShortHrs?.trim() ?? "";

      if (!value) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["monthlyShortHrs"],
          message: "Monthly short hrs is required",
        });
      } else {
        const hours = Number(value);

        if (!Number.isFinite(hours) || hours <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["monthlyShortHrs"],
            message:
              "Monthly short hrs must be greater than 0",
          });
        }
      }
    }
  });

export default attendanceDetailsSchema;
