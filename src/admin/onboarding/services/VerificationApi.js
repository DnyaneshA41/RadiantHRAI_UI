// VerificationApi.js

import coreSettingsClient from "../../../api/axiosClientModule";

const onboardingConfig = {
  module: "onboarding",
};

export const getAllVerifications = async () => {
  const response = await coreSettingsClient.get(
    "/Verification/GetVerification",
    onboardingConfig
  );

  return response.data;
};

export const createVerification = async (dto) => {
  const response = await coreSettingsClient.post(
    "/Verification/CreateVerification",
    dto,
    onboardingConfig
  );

  return response.data;
};

export const updateVerification = async (encryptedId, dto) => {
  const response = await coreSettingsClient.patch(
    `/Verification/UpdateVerification/${encodeURIComponent(encryptedId)}`,
    {
      encryptedId,
      dto,
    },
    onboardingConfig
  );

  return response.data;
};

export const deleteVerification = async (encryptedId) => {
  const response = await coreSettingsClient.patch(
    `/Verification/DeleteVerification/${encodeURIComponent(encryptedId)}`,
    null,
    onboardingConfig
  );

  return response.data;
};