import axiosClientModule from "../../../api/axiosClientModule";
// =====================================================
// GET ALL DEPARTMENTS
// GET /api/Department/GetAllDepartment
// =====================================================

const getAllDepartmentsApi = async () => {
  const response = await axiosClientModule.get(
    "/Department/GetAllDepartment"
  );

  return response.data;
};

// =====================================================
// DELETE DEPARTMENT
// PATCH /api/Department/DeleteDepartment/{EncryptedId}
// =====================================================

const deleteDepartmentApi = async (encryptedId) => {
  const response = await axiosClientModule.patch(
    `/Department/DeleteDepartment/${encodeURIComponent(encryptedId)}`
  );

  return response.data;
};

// =====================================================
// UPDATE DEPARTMENT
// PATCH /api/Department/UpdateDepartment/{EncryptedId}
// =====================================================


export const updateDepartmentApi = async (encryptedId, payload) => {
  if (!encryptedId) {
    throw new Error("Encrypted Department ID is missing.");
  }

  const response = await axiosClientModule.patch(
    `/Department/UpdateDepartment/${encodeURIComponent(encryptedId)}`,
    {
      encryptedId: encryptedId,
      dto: {
        isDeactivated: payload.isDeactivated ?? false,
        createdByUser: payload.createdByUser,
        createdDate: payload.createdDate,
        sourceID: payload.sourceID,
        rdhR0000XIName: payload.rdhR0000XIName,
      },
    }
  );

  return response.data;
};

export {
  getAllDepartmentsApi,
  deleteDepartmentApi,
 
};