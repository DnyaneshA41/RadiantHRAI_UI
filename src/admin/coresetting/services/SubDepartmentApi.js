
import axiosClientModule from "../../../api/axiosClientModule";

// =====================================================
// CREATE SUBDEPARTMENT
// POST /api/SubDepartment/CreateSubDepartment
// =====================================================

export const createSubDepartmentApi = async (payload) => {
  const response = await axiosClientModule.post(
    "/SubDepartment/CreateSubDepartment",
    payload
  );

  return response.data;
};

// =====================================================
// GET ALL SUBDEPARTMENTS
// GET /api/SubDepartment/GetAllSubDepartment
// =====================================================

export const getAllSubDepartmentsApi = async () => {
  const response = await axiosClientModule.get(
    "/SubDepartment/GetAllSubDepartment"
  );

  return response.data;
};

// =====================================================
// UPDATE SUBDEPARTMENT
// PATCH /api/SubDepartment/UpdateSubDepartment/{EncryptedId}
//
// Request body:
// {
//   encryptedId: "...",
//   dto: { ... }
// }
// =====================================================

export const updateSubDepartmentApi = async (
  encryptedId,
  payload
) => {
  const response = await axiosClientModule.patch(
    `/SubDepartment/UpdateSubDepartment/${encodeURIComponent(
      encryptedId
    )}`,
    {
      encryptedId,
      dto: payload,
    }
  );

  return response.data;
};

// =====================================================
// DELETE SUBDEPARTMENT
// PATCH /api/SubDepartment/DeleteSubDepartment/{EncryptedId}
// =====================================================

export const deleteSubDepartmentApi = async (encryptedId) => {
  const response = await axiosClientModule.patch(
    `/SubDepartment/DeleteSubDepartment/${encodeURIComponent(
      encryptedId
    )}`
  );

  return response.data;
};

// =====================================================
// GET DEPARTMENT DROPDOWN
// GET /api/Department/GetDepartmentList
// =====================================================

export const getDepartmentListApi = async () => {
  const response = await axiosClientModule.get(
    "/Department/GetDepartmentList"
  );

  return response.data;
};
