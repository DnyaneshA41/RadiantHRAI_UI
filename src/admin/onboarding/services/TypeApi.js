import coreSettingsClient from "../../../api/axiosClientModule";

const onboardingConfig = {
  module: "onboarding",
};

export const getAllTypes = async () => {
  const response = await coreSettingsClient.get(
    "/Type/GetAllType",
    onboardingConfig
  );

  return response.data;
};

export const createType = async (dto) => {
  const response = await coreSettingsClient.post(
    "/Type/CreateType",
    dto,
    onboardingConfig
  );

  return response.data;
};

export const updateType = async (encryptedId, dto) => {
  const response = await coreSettingsClient.patch(
    `/Type/UpdateType/${encodeURIComponent(encryptedId)}`,
    { encryptedId, dto },
    onboardingConfig
  );

  return response.data;
};

export const deleteType = async (encryptedId) => {
  const response = await coreSettingsClient.patch(
    `/Type/DeleteType/${encodeURIComponent(encryptedId)}`,
    null,
    onboardingConfig
  );

  return response.data;
};