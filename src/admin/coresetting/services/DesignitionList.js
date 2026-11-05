
import axiosClientModule from "../../../../api/axiosClientModule";

// =====================================================
// GET ALL DESIGNATIONS
// GET /api/Designation/GetAllDesignation
// =====================================================

export const getAllDesignationsApi = async () => {
  const response = await axiosClientModule.get(
    "/Designation/GetAllDesignation"
  );

  return response.data;
};

// =====================================================
// UPDATE DESIGNATION
// PATCH /api/Designation/UpdateDesignation/{EncryptedId}
//
// Expected body:
// {
//   encryptedId: "...",
//   dto: {
//     isDeactivated: false,
//     createdByUser: "...",
//     createdDate: "...",
//     sourceID: "...",
//     rdhR0000XIIName: "...",
//     recruitmentApplicable: true,
//     minimumAge: 0,
//     maximumAge: 0,
//     minimumExperience: 0,
//     maximumExperience: 0,
//     minimumBudget: 0,
//     maximumBudget: 0,
//     referralBonus: 0,
//     referralLimit: 0
//   }
// }
// =====================================================

export const updateDesignationApi = async (encryptedId, dto) => {
  if (!encryptedId) {
    throw new Error("Encrypted Designation ID is missing.");
  }

  const response = await axiosClientModule.patch(
    `/Designation/UpdateDesignation/${encodeURIComponent(
      encryptedId
    )}`,
    {
      encryptedId,
      dto,
    }
  );

  return response.data;
};

// =====================================================
// DELETE DESIGNATION
// PATCH /api/Designation/DeleteDesignation/{EncryptedId}
// =====================================================

export const deleteDesignationApi = async (encryptedId) => {
  if (!encryptedId) {
    throw new Error("Encrypted Designation ID is missing.");
  }

  const response = await axiosClientModule.patch(
    `/Designation/DeleteDesignation/${encodeURIComponent(
      encryptedId
    )}`
  );

  return response.data;
};