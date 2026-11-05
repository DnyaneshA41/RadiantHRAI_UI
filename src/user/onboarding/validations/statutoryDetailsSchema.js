
import { z } from "zod";

/* =========================================================
   VALIDATION HELPERS
========================================================= */

const isValidDate = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
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

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateYearsAgo = (years) => {
  const date = getToday();
  date.setFullYear(date.getFullYear() - years);
  return date;
};

const isDateNotAfterToday = (value) => {
  if (!isValidDate(value)) return false;

  return value <= formatDate(getToday());
};

/*
  Standard PF formats:
  MH/BAN/6543210/003
  MHBAN6543210003

  Exception:
  More than 21 characters and starts with a letter.
*/
const isValidPfNumber = (value) => {
  const normalizedValue = value.trim().toUpperCase();

  if (!normalizedValue) return false;

  if (
    normalizedValue.length > 21 &&
    /^[A-Z]/.test(normalizedValue)
  ) {
    return true;
  }

  const pfRegex =
    /^[A-Z]{2,3}\/?[A-Z]{2,3}\/?[0-9]{7}\/?[0-9]{3}$/;

  return pfRegex.test(normalizedValue);
};

/* PF Share: 0–100 with up to 2 decimal places */
const isValidPfShare = (value) => {
  if (value === "") return false;

  const shareRegex =
    /^(100(\.0{1,2})?|[0-9]{1,2}(\.[0-9]{1,2})?)$/;

  if (!shareRegex.test(value)) return false;

  const numericValue = Number(value);

  return (
    Number.isFinite(numericValue) &&
    numericValue >= 0 &&
    numericValue <= 100
  );
};

const isOptionalValidPfShare = (value) => {
  if (value.trim() === "") return true;

  return isValidPfShare(value.trim());
};

/* =========================================================
   STATUTORY DETAILS SCHEMA
========================================================= */

const statutoryDetailsSchema = z
  .object({
    /* CTC DETAILS */

    orgBank: z
      .string()
      .trim()
      .min(1, "Organization bank is required"),

    salaryMode: z
      .string()
      .trim()
      .min(1, "Salary mode is required"),

    groupName: z
      .string()
      .trim()
      .min(1, "Group name is required"),

    bonusGroup: z.string(),

    /* PT DETAILS */

    ptCodeEnabled: z.boolean(),
    ptCode: z.string(),
    ptMaster: z.string(),

    /* LWF DETAILS */

    lwfCodeEnabled: z.boolean(),
    lwfCode: z.string(),
    lwfMaster: z.string(),

    /* ESIC DETAILS */

    esicCodeEnabled: z.boolean(),
    esicCode: z.string(),

    esicNo: z
      .string()
      .max(17, "ESIC no cannot exceed 17 digits"),

    // Compatibility with the MVC checkbox, if used.
    esicIsLinkWithEsic: z.boolean().optional(),

    // React checkbox used to enable Old ESIC No fields.
    oldEsicNoEnabled: z.boolean().optional(),

    oldEsicNo: z
      .string()
      .max(17, "Old ESIC no cannot exceed 17 digits"),

    esicClosingDate: z.string(),

    /* GRATUITY DETAILS */

    gratuityEnabled: z.boolean(),
    gratuityNo: z.string(),

    /* PF DETAILS */

    pfCodeEnabled: z.boolean(),
    pfCode: z.string(),
    pfLimit: z.string(),

    pfWagesEnabled: z.boolean(),
    pfWages: z.string(),

    pfNo: z
      .string()
      .max(25, "PF no cannot exceed 25 characters"),

    oldUanNo: z.boolean(),
    linkWithPfCode: z.boolean(),

    uanNo: z
      .string()
      .refine(
        (value) => value.length === 0 || value.length === 12,
        "UAN no must be exactly 12 digits"
      ),

    /* NOMINEE 1 */

    relationWithNominee1: z.string(),
    nominee1Name: z.string(),
    nominee1Dob: z.string(),
    nominee1PfShare: z.string(),
    nominee1Address: z.string(),
    nominee1Guardian: z.string(),

    /* NOMINEE 2 */

    relationWithNominee2: z.string(),
    nominee2Name: z.string(),
    nominee2Dob: z.string(),
    nominee2PfShare: z.string(),
    nominee2Address: z.string(),
    nominee2Guardian: z.string(),

    /* PREVIOUS EMPLOYMENT */

    earlierPfMember: z.boolean(),
    earlierPensionMember: z.boolean(),

    previousPfNo: z
      .string()
      .max(25, "Previous PF no cannot exceed 25 characters"),

    pfExitDate: z.string(),

    schemeCertificateNo: z.string(),
    ppoNumber: z.string(),
  })
  .superRefine((data, ctx) => {
    const addError = (field, message) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message,
      });
    };

    /* =====================================================
       PT VALIDATION
    ===================================================== */

    if (data.ptCodeEnabled && !data.ptCode.trim()) {
      addError("ptCode", "PT code is required");
    }

    if (data.ptCodeEnabled && !data.ptMaster.trim()) {
      addError("ptMaster", "PT master is required");
    }

    /* =====================================================
       LWF VALIDATION
    ===================================================== */

    if (data.lwfCodeEnabled && !data.lwfCode.trim()) {
      addError("lwfCode", "LWF code is required");
    }

    if (data.lwfCodeEnabled && !data.lwfMaster.trim()) {
      addError("lwfMaster", "LWF master is required");
    }

    /* =====================================================
       ESIC VALIDATION
    ===================================================== */

    if (data.esicCodeEnabled) {
      if (!data.esicCode.trim()) {
        addError("esicCode", "ESIC code is required");
      }

      if (!data.esicNo.trim()) {
        addError("esicNo", "ESIC no is required");
      }
    }

    const oldEsicEnabled =
      data.oldEsicNoEnabled || data.esicIsLinkWithEsic;

    if (oldEsicEnabled) {
      if (!data.oldEsicNo.trim()) {
        addError("oldEsicNo", "Old ESIC no is required");
      }
    }

    if (
      data.esicClosingDate &&
      !isValidDate(data.esicClosingDate)
    ) {
      addError(
        "esicClosingDate",
        "Enter a valid ESIC closing date"
      );
    }

    /* =====================================================
       GRATUITY VALIDATION
    ===================================================== */

    if (data.gratuityEnabled) {
      const gratuityNo = data.gratuityNo.trim();

      if (!gratuityNo) {
        addError("gratuityNo", "Gratuity no is required");
      } else if (!/^[a-zA-Z0-9 ]{5,20}$/.test(gratuityNo)) {
        addError(
          "gratuityNo",
          "Gratuity no must be 5–20 characters using letters, numbers or spaces"
        );
      }
    }

    /* =====================================================
       PF VALIDATION
    ===================================================== */

    if (data.pfCodeEnabled) {
      if (!data.pfCode.trim()) {
        addError("pfCode", "PF code is required");
      }

      if (!data.pfLimit.trim()) {
        addError("pfLimit", "PF limit is required");
      }

      if (!data.pfWages.trim()) {
        addError("pfWages", "PF wages is required");
      }

      /* PF NUMBER */

      if (!data.pfNo.trim()) {
        addError("pfNo", "PF no is required");
      } else if (!isValidPfNumber(data.pfNo)) {
        addError(
          "pfNo",
          "Invalid PF no. Example: MH/BAN/6543210/003 or MHBAN6543210003"
        );
      }

      /* UAN */

      if (!data.uanNo.trim()) {
        addError("uanNo", "UAN no is required");
      } else if (!/^\d{12}$/.test(data.uanNo)) {
        addError("uanNo", "UAN no must be exactly 12 digits");
      }

      /* NOMINEE 1 RELATION */

      if (!data.relationWithNominee1.trim()) {
        addError(
          "relationWithNominee1",
          "Relation with nominee 1 is required"
        );
      }

      /* NOMINEE 1 NAME */

      if (!data.nominee1Name.trim()) {
        addError("nominee1Name", "Nominee 1 name is required");
      } else if (!/^[a-zA-Z ]+$/.test(data.nominee1Name.trim())) {
        addError(
          "nominee1Name",
          "Nominee 1 name must contain letters and spaces only"
        );
      }

      
/* NOMINEE DOB VALIDATION  */

// Nominee 1 DOB is required
const nominee1Dob = data.nominee1Dob;

if (!nominee1Dob || !nominee1Dob.trim()) {
  addError(
    "nominee1Dob",
    "Nominee 1 date of birth is required"
  );
} else if (!isValidDate(nominee1Dob)) {
  addError(
    "nominee1Dob",
    "Enter a valid nominee 1 date of birth"
  );
} else if (!isDateNotAfterToday(nominee1Dob)) {
  addError(
    "nominee1Dob",
    "Nominee 1 date of birth cannot be in the future"
  );
} else if (nominee1Dob > formatDate(getDateYearsAgo(18))) {
  addError(
    "nominee1Dob",
    "Nominee 1 must be at least 18 years old"
  );
}

// Nominee 2 DOB is optional
const nominee2Dob = data.nominee2Dob;

if (nominee2Dob && nominee2Dob.trim()) {
  if (!isValidDate(nominee2Dob)) {
    addError(
      "nominee2Dob",
      "Enter a valid nominee 2 date of birth"
    );
  } else if (!isDateNotAfterToday(nominee2Dob)) {
    addError(
      "nominee2Dob",
      "Nominee 2 date of birth cannot be in the future"
    );
  } else if (nominee2Dob > formatDate(getDateYearsAgo(18))) {
    addError(
      "nominee2Dob",
      "Nominee 2 must be at least 18 years old"
    );
  }
}


      /* NOMINEE 1 PF SHARE */

      if (!data.nominee1PfShare.trim()) {
        addError("nominee1PfShare", "PF share % is required");
      } else if (!isValidPfShare(data.nominee1PfShare.trim())) {
        addError(
          "nominee1PfShare",
          "Enter a valid PF share between 0 and 100, with up to 2 decimal places"
        );
      }

      /* NOMINEE 1 ADDRESS */

      if (!data.nominee1Address.trim()) {
        addError("nominee1Address", "Nominee 1 address is required");
      }

      /* NOMINEE 2 PF SHARE IS OPTIONAL */

      if (!isOptionalValidPfShare(data.nominee2PfShare)) {
        addError(
          "nominee2PfShare",
          "Enter a valid PF share between 0 and 100, with up to 2 decimal places"
        );
      }

      /* NOMINEE SHARE TOTAL CANNOT EXCEED 100% */

      if (
        isValidPfShare(data.nominee1PfShare.trim()) &&
        isOptionalValidPfShare(data.nominee2PfShare)
      ) {
        const share1 = Number(data.nominee1PfShare);

        const share2 =
          data.nominee2PfShare.trim() === ""
            ? 0
            : Number(data.nominee2PfShare);

        if (share1 + share2 > 100) {
          addError(
            "nominee2PfShare",
            `Nominee 1 and nominee 2 shares cannot exceed 100%. Total: ${(share1 + share2).toFixed(2)}%`
          );
        }
      }

      /* NOMINEE RELATION COMPARISON */

      if (
        data.relationWithNominee1 &&
        data.relationWithNominee2 &&
        data.relationWithNominee1 === data.relationWithNominee2
      ) {
        addError(
          "relationWithNominee2",
          "Relation with nominee 1 and nominee 2 cannot be the same"
        );
      }
    }

    /* =====================================================
       PREVIOUS PF NUMBER
    ===================================================== */

    if (data.previousPfNo.trim()) {
      if (!isValidPfNumber(data.previousPfNo)) {
        addError(
          "previousPfNo",
          "Invalid previous PF no. Example: MH/BAN/6543210/003 or MHBAN6543210003"
        );
      }
    }

    /* =====================================================
       PF EXIT DATE
    ===================================================== */

    if (data.pfExitDate && !isValidDate(data.pfExitDate)) {
      addError("pfExitDate", "Enter a valid PF exit date");
    }
  });

export default statutoryDetailsSchema;
