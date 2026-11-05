
import coreSettingsClient from "../../../api/axiosClientModule";

export const createDepartmentApi = async (data) => {
  const payload = {
    isDeactivated: false,
    createdByUser: data.createdByUser || "",
    createdDate: data.createdDate || new Date().toISOString(),
    sourceID: data.sourceID || "",
    rdhR0000XIName: data.rdhR0000XIName?.trim() || "",
  };

  const response = await coreSettingsClient.post(
    "/Department/CreateDepartment",
    payload
  );

  return response.data;
};
