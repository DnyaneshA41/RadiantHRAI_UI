// QualificationMapper.js

export const initialQualificationFormData = {
  rdhR0000XXVIName: "",
  rdhR0000XXVID: "0",
};

export const mapQualification = (item = {}) => ({
  ...item,

  id:
    item.rdhR0000XXVIID ??
    item.RDHR0000XXVIID ??
    item.id ??
    item.Id ??
    "",

  encryptedId:
    item.rdhR0000XXVIID_Encrypted ??
    item.RDHR0000XXVIID_Encrypted ??
    item.encryptedId ??
    item.EncryptedId ??
    item.encryptedID ??
    "",

  rdhR0000XXVIName:
    item.rdhR0000XXVIName ??
    item.RDHR0000XXVIName ??
    "",

  rdhR0000XXVID:
    item.rdhR0000XXVID ??
    item.RDHR0000XXVID ??
    0,

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

export const extractQualifications = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.Data,
    response?.result,
    response?.Result,
    response?.qualifications,
    response?.Qualifications,
    response?.data?.data,
    response?.data?.Data,
    response?.data?.result,
    response?.data?.Result,
    response?.result?.data,
    response?.Result?.Data,
  ];

  return candidates.find(Array.isArray) || [];
};

export const mapQualificationFormData = (item = {}) => {
  const qualification = mapQualification(item);

  return {
    rdhR0000XXVIName: qualification.rdhR0000XXVIName,
    rdhR0000XXVID: String(qualification.rdhR0000XXVID ?? 0),
  };
};

export const toQualificationDto = (
  { rdhR0000XXVIName, rdhR0000XXVID },
  { employeeName = "", sourceID = "" } = {},
  existingQualification = null
) => ({
  isDeactivated: existingQualification?.isDeactivated ?? false,
  createdByUser: employeeName,
  sourceID: String(sourceID),
  rdhR0000XXVID: Number(rdhR0000XXVID),
  rdhR0000XXVIName: String(rdhR0000XXVIName ?? "").trim(),
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