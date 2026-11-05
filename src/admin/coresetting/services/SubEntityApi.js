
import axiosClientModule from "../../../api/axiosClientModule";

// =====================================================
// CREATE SUB ENTITY
// POST /api/SubEntity/CreateSubEntity
// =====================================================


export const createSubEntityApi = async (payload) => {
  try {
    console.log("Create Sub Entity payload:", payload);

    const response = await axiosClientModule.post(
      "/SubEntity/CreateSubEntity",
      payload
    );

    console.log("Create Sub Entity response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Create Sub Entity API error:", {
      status: error.response?.status,
      data: error.response?.data,
      payload,
      url: error.config?.url,
      method: error.config?.method,
    });

    throw error;
  }
};


// =====================================================
// DELETE SUB ENTITY
// PATCH /api/SubEntity/DeleteSubEntity/{EncryptedId}
// =====================================================

export const deleteSubEntityApi = async (encryptedId) => {
  const response = await axiosClientModule.patch(
    `/SubEntity/DeleteSubEntity/${encodeURIComponent(encryptedId)}`
  );

  return response.data;
};

// =====================================================
// UPDATE SUB ENTITY
// PATCH /api/SubEntity/UpdateSubEntity/{EncryptedId}
// =====================================================

export const updateSubEntityApi = async (
  encryptedId,
  dto
) => {
  const response = await axiosClientModule.patch(
    `/SubEntity/UpdateSubEntity/${encodeURIComponent(encryptedId)}`,
    {
      encryptedId,
      dto,
    }
  );

  return response.data;
};
