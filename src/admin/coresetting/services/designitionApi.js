
import coreSettingsClient from "../../../api/axiosClientModule";

// =====================================================
// CREATE DESIGNATION
// POST /api/Designation/CreateDesignation
// =====================================================

export const createDesignationApi = async (data) => {
  const payload = {
    isDeactivated: false,
    createdByUser: data.createdByUser || "",
    createdDate: data.createdDate || new Date().toISOString(),
    sourceID: data.sourceID || "",

    rdhR0000XIIName:
      data.rdhR0000XIIName?.trim() || "",

    recruitmentApplicable:
      data.recruitmentApplicable ?? false,

    minimumAge: Number(data.minimumAge ?? 0),
    maximumAge: Number(data.maximumAge ?? 0),

    minimumExperience: Number(
      data.minimumExperience ?? 0
    ),
    maximumExperience: Number(
      data.maximumExperience ?? 0
    ),

    minimumBudget: Number(data.minimumBudget ?? 0),
    maximumBudget: Number(data.maximumBudget ?? 0),

    referralBonus: Number(data.referralBonus ?? 0),
    referralLimit: Number(data.referralLimit ?? 0),
  };

  const response = await coreSettingsClient.post(
    "/Designation/CreateDesignation",
    payload
  );

  return response.data;
};
