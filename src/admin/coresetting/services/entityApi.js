
import coreSettingsClient from "../../../api/axiosClientModule";

// GET ENTITY DETAILS BY ENCRYPTED ID
export const getEntityByIdApi = async (encryptedId) => {
  const response = await coreSettingsClient.get(
    `/Entity/GetEntityByID/${encodeURIComponent(encryptedId)}`
  );

  return response.data;
};
//update entity

export const updateEntityApi = async (encryptedId, payload) => {
  const dto = payload?.dto ?? payload;
  const formData = new FormData();

  formData.append("EncryptedId", encryptedId);
  formData.append(
    "Dto.RDHR0000IIID_Encrypted",
    dto.rdhR0000IIID_Encrypted ?? encryptedId
  );

  formData.append("Dto.IsDeactivated", String(dto.isDeactivated ?? false));
  formData.append("Dto.CreatedByUser", dto.createdByUser ?? "");
  formData.append("Dto.SourceID", String(dto.sourceID ?? ""));
  formData.append("Dto.IsActive", String(dto.isActive ?? true));
  formData.append("Dto.RDHR0000IID", String(dto.rdhR0000IID ?? ""));
  formData.append("Dto.RDHR0000IIName", dto.rdhR0000IIName ?? "");
  formData.append("Dto.RDHR0000IIAddress", dto.rdhR0000IIAddress ?? "");
  formData.append("Dto.PhoneNo", dto.phoneNo ?? "");
  formData.append("Dto.Email", dto.email ?? "");

  if (dto.logo instanceof File) {
    formData.append("Dto.Logo", dto.logo);
  }

  if (dto.stamp instanceof File) {
    formData.append("Dto.Stamp", dto.stamp);
  }

  return (
    await coreSettingsClient.patch(
      `/Entity/UpdateEntity/${encodeURIComponent(encryptedId)}`,
      formData
    )
  ).data;
};




 // DELETE ENTITY
export const deleteEntityApi = async (encryptedId) => {
  const response = await coreSettingsClient.patch(
    `/Entity/DeleteEntity/${encodeURIComponent(encryptedId)}`
  );

  return response.data;
};


// CREATE ENTITY
export const createEntityApi = async (data) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (value instanceof File) {
      formData.append(key, value, value.name);
    } else {
      formData.append(key, String(value));
    }
  });

  const response = await coreSettingsClient.post(
    "/Entity/CreateEntity",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
