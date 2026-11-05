// GroupMapper.js

export const initialGroupFormData = {
  rdhR0000XVIIIName: "",
};

export const mapGroup = (item = {}) => ({
  ...item,

  id:
    item.RDHR0000XVIIIID ??
 "",

  encryptedId:
    item.rdhR0000XVIIIID_Encrypted ??
    item.RDHR0000XVIIIID_Encrypted ??
    item.encryptedId ??
    item.EncryptedId ??
    item.encryptedID ??
    item.rdhR0000XVIIID_Encrypted ??
    item.employeeGroupID_Encrypted ??
    item.EmployeeGroupID_Encrypted ??
    item.groupID_Encrypted ??
    item.GroupID_Encrypted ??
    "",

  rdhR0000XVIIIName:
    item.rdhR0000XVIIIName ??
    item.RDHR0000XVIIIName ??
    item.employeeGroupName ??
    item.EmployeeGroupName ??
    item.groupName ??
    item.GroupName ??
    item.name ??
    item.Name ??
    "",

  isDeactivated:
    item.isDeactivated ??
    item.IsDeactivated ??
    false,

  createdByUser:
    item.createdByUser ??
    item.CreatedByUser ??
    "",

  sourceID:
    item.sourceID ??
    item.SourceID ??
    "",
});

export const extractGroups = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.Data,
    response?.result,
    response?.Result,
    response?.groups,
    response?.Groups,
    response?.employeeGroups,
    response?.EmployeeGroups,
    response?.data?.data,
    response?.data?.Data,
    response?.data?.result,
    response?.data?.Result,
    response?.result?.data,
    response?.Result?.Data,
  ];

  return candidates.find(Array.isArray) || [];
};

export const mapGroupFormData = (item = {}) => {
  const group = mapGroup(item);

  return {
    rdhR0000XVIIIName: group.rdhR0000XVIIIName,
  };
};

export const toGroupDto = (
  { rdhR0000XVIIIName },
  { employeeName = "", sourceID = "" } = {}
) => ({
  isDeactivated: false,
  createdByUser: employeeName,
  sourceID: String(sourceID),
  rdhR0000XVIIIName: String(
    rdhR0000XVIIIName ?? ""
  ).trim(),
});

export const getApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;

  if (data?.errors) {
    const messages = Object.values(data.errors).flat();

    if (messages.length) return messages.join(" ");
  }

  return (
    data?.detail ||
    data?.message ||
    data?.Message ||
    data?.title ||
    error?.message ||
    fallback
  );
};