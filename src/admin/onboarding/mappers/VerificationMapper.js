// VerificationMapper.js

export const initialVerificationFormData = {
  verificationName: "",
  isMandatory: false,
};

export const mapVerification = (item = {}) => ({
  ...item,

  id:
    item.rdhR0000IXID ??
    item.RDHR0000IXID ??
    item.id ??
    item.Id ??
    "",

  encryptedId:
    item.rdhR0000IXID_Encrypted ??
    item.RDHR0000IXID_Encrypted ??
    item.encryptedId ??
    item.EncryptedId ??
    item.encryptedID ??
    "",

  verificationName:
    item.verificationName ??
    item.VerificationName ??
    "",

  isMandatory:
    item.isMandatory ??
    item.IsMandatory ??
    false,

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

export const extractVerifications = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.Data,
    response?.result,
    response?.Result,
    response?.verifications,
    response?.Verifications,
    response?.data?.data,
    response?.data?.Data,
    response?.data?.result,
    response?.data?.Result,
    response?.result?.data,
    response?.Result?.Data,
  ];

  return candidates.find(Array.isArray) || [];
};

export const mapVerificationFormData = (item = {}) => {
  const verification = mapVerification(item);

  return {
    verificationName: verification.verificationName,
    isMandatory: verification.isMandatory,
  };
};

export const toVerificationDto = (
  { verificationName, isMandatory },
  { employeeName = "", sourceID = "" } = {},
  existingVerification = null
) => ({
  isDeactivated: existingVerification?.isDeactivated ?? false,
  createdByUser: employeeName,
  sourceID: String(sourceID),
  verificationName: String(verificationName ?? "").trim(),
  isMandatory: Boolean(isMandatory),
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