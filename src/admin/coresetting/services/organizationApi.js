import coreSettingsClient from "../../../api/axiosClientModule";

const buildOrganizationFormData = (data = {}) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    // Existing image URLs are not uploaded as files again.
    // Only newly selected files should be sent to the API.
    if (
      ["RDHR0000ILogo", "Stamp"].includes(key) &&
      !(value instanceof File)
    ) {
      return;
    }

    if (value instanceof File) {
      formData.append(key, value, value.name);
      return;
    }

    if (typeof value === "boolean") {
      formData.append(key, value ? "true" : "false");
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

const multipartConfig = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

// CREATE ORGANIZATION
export const createOrganizationApi = async (data) => {
  const formData = buildOrganizationFormData(data);

  const response = await coreSettingsClient.post(
    "/Organization/CreateOrganization",
    formData,
    multipartConfig
  );

  return response.data;
};

// UPDATE ORGANIZATION
// PATCH /api/Organization/UpdateOrganization/{encryptedId}
export const updateOrganizationApi = async (encryptedId, data) => {
  if (!encryptedId) {
    throw new Error(
      "Organization encrypted ID is missing. Cannot update organization."
    );
  }

  const formData = buildOrganizationFormData(data);

  const response = await coreSettingsClient.patch(
    `/Organization/UpdateOrganization/${encodeURIComponent(encryptedId)}`,
    formData,
    multipartConfig
  );

  return response.data;
};

// DELETE ORGANIZATION
// PATCH /api/Organization/DeleteOrganization/{EncryptedId}
export const deleteOrganizationApi = async (encryptedId) => {
  if (!encryptedId) {
    throw new Error(
      "Organization encrypted ID is missing. Cannot delete organization."
    );
  }

  const response = await coreSettingsClient.patch(
    `/Organization/DeleteOrganization/${encodeURIComponent(encryptedId)}`
  );

  return response.data;
};