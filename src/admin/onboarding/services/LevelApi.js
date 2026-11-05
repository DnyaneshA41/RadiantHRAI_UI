// LevelApi.js

import coreSettingsClient from "../../../api/axiosClientModule";

const onboardingConfig = {
  module: "onboarding",
};

export const getAllLevels = async () => {
  const response = await coreSettingsClient.get(
    "/Level/GetAllLevel",
    onboardingConfig
  );

  return response.data;
};

export const createLevel = async (dto) => {
  const response = await coreSettingsClient.post(
    "/Level/CreateLevel",
    dto,
    onboardingConfig
  );

  return response.data;
};

export const updateLevel = async (encryptedId, dto) => {
  const response = await coreSettingsClient.patch(
    `/Level/UpdateLevel/${encodeURIComponent(encryptedId)}`,
    {
      encryptedId,
      dto,
    },
    onboardingConfig
  );

  return response.data;
};

export const deleteLevel = async (encryptedId) => {
  const response = await coreSettingsClient.patch(
    `/Level/DeleteLevel/${encodeURIComponent(encryptedId)}`,
    null,
    onboardingConfig
  );

  return response.data;
};