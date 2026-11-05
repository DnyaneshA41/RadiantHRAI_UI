export const mapDepartmentToApi = (data) => ({
  isDeactivated: false,
  createdByUser: data.createdByUser || "",
  createdDate: new Date().toISOString(),
  sourceID: data.sourceID || "",
  rdhR0000XIName: data.rdhR0000XIName.trim(),
});