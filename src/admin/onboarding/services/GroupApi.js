// GroupApi.js

import coreSettingsClient from "../../../api/axiosClientModule";

const onboardingConfig = {
  module: "onboarding",
};

export const getAllGroups = async () => {
  const response = await coreSettingsClient.get(
    "/EmployeeGroup/GetEmployeeGroup",
    onboardingConfig
  );

  return response.data;
};

export const createGroup = async (dto) => {
  const response = await coreSettingsClient.post(
    "/EmployeeGroup/CreateEmployeeGroup",
    dto,
    onboardingConfig
  );

  return response.data;
};

export const updateGroup = async (encryptedId, dto) => {
  const response = await coreSettingsClient.patch(
    `/EmployeeGroup/UpdateEmployeeGroup/${encodeURIComponent(encryptedId)}`,
    {
      encryptedId,
      dto,
    },
    onboardingConfig
  );

  return response.data;
};

export const deleteGroup = async (encryptedId) => {
  const response = await coreSettingsClient.patch(
    `/EmployeeGroup/DeleteEmployeeGroup/${encodeURIComponent(encryptedId)}`,
    null,
    onboardingConfig
  );

  return response.data;
};