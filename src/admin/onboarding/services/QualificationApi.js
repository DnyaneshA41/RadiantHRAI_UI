// QualificationApi.js

import coreSettingsClient from "../../../api/axiosClientModule";

const onboardingConfig = {
  module: "onboarding",
};

export const getAllQualifications = async () => {
  const response = await coreSettingsClient.get(
    "/Qualification/GetQualification",
    onboardingConfig
  );

  return response.data;
};

export const getQualificationCategoryList = async () => {
  const response = await coreSettingsClient.get(
    "/Qualification/GetQualificationCategoryList",
    onboardingConfig
  );

  return response.data;
};

export const createQualification = async (dto) => {
  const response = await coreSettingsClient.post(
    "/Qualification/CreateQualification",
    dto,
    onboardingConfig
  );

  return response.data;
};

export const updateQualification = async (encryptedId, dto) => {
  const response = await coreSettingsClient.patch(
    `/Qualification/UpdateQualification/${encodeURIComponent(encryptedId)}`,
    {
      encryptedId,
      dto,
    },
    onboardingConfig
  );

  return response.data;
};

export const deleteQualification = async (encryptedId) => {
  const response = await coreSettingsClient.patch(
    `/Qualification/DeleteQualification/${encodeURIComponent(encryptedId)}`,
    null,
    onboardingConfig
  );

  return response.data;
};