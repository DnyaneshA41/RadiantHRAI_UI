// LevelMapper.js

export const initialLevelFormData = {
  rdhR0000XVIName: "",
  description: "",
};

export const mapLevel = (item = {}) => ({
  ...item,

  id:
    item.rdhR0000XVIID ??
    item.RDHR0000XVIID ??
    item.rdhR0000XVILevelID ??
    item.RDHR0000XVILevelID ??
    item.levelID ??
    item.LevelID ??
    item.id ??
    item.Id ??
    "",

  encryptedId:
    item.rdhR0000XVIID_Encrypted ??
    item.RDHR0000XVIID_Encrypted ??
    item.encryptedId ??
    item.EncryptedId ??
    item.encryptedID ??
    item.rdhR0000XVILevelID_Encrypted ??
    item.RDHR0000XVILevelID_Encrypted ??
    item.levelID_Encrypted ??
    item.LevelID_Encrypted ??
    "",

  rdhR0000XVIName:
    item.rdhR0000XVIName ??
    item.RDHR0000XVIName ??
    item.levelName ??
    item.LevelName ??
    item.name ??
    item.Name ??
    "",

  description:
    item.description ??
    item.Description ??
    "",

  isDeactivated:
    item.isDeactivated ??
    item.IsDeactivated ??
    false,

  createdByUser:
    item.createdByUser ??
    item.CreatedByUser ??
    "",

  createdDate:
    item.createdDate ??
    item.CreatedDate ??
    "",

  sourceID:
    item.sourceID ??
    item.SourceID ??
    "",
});

export const extractLevels = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.Data,
    response?.result,
    response?.Result,
    response?.levels,
    response?.Levels,
    response?.data?.data,
    response?.data?.Data,
    response?.data?.result,
    response?.data?.Result,
    response?.result?.data,
    response?.Result?.Data,
  ];

  return candidates.find(Array.isArray) || [];
};

export const mapLevelFormData = (item = {}) => {
  const level = mapLevel(item);

  return {
    rdhR0000XVIName: level.rdhR0000XVIName,
    description: level.description,
  };
};

export const toLevelDto = (
  { rdhR0000XVIName, description },
  { employeeName = "", sourceID = "" } = {},
  existingLevel = null
) => ({
  isDeactivated: existingLevel?.isDeactivated ?? false,
  createdByUser: employeeName,
  createdDate: existingLevel?.createdDate || new Date().toISOString(),
  sourceID: String(sourceID),

  rdhR0000XVIName: String(
    rdhR0000XVIName ?? ""
  ).trim(),

  description: String(
    description ?? ""
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