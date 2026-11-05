
export const initialTypeFormData = {
  rdhR0000XIXType: "",
};

export const mapType = (item = {}) => ({
  ...item,

  id:
    item.rdhR0000XIXTypeID ??
    item.RDHR0000XIXTypeID ??
    item.rdhR0000XIXTypeId ??
    item.RDHR0000XIXTypeId ??
    item.typeID ??
    item.TypeID ??
    item.id ??
    item.Id ??
    "",

  encryptedId:
   item.rdhR0000XIXID_Encrypted ??
    item.encryptedId ??
    item.EncryptedId ??
    item.encryptedID ??
    item.rdhR0000XIXTypeID_Encrypted ??
    item.RDHR0000XIXTypeID_Encrypted ??
    item.rdhR0000XIXTypeEncryptedId ??
    item.RDHR0000XIXTypeEncryptedId ??
    "",

  rdhR0000XIXType:
    item.rdhR0000XIXType ??
    item.RDHR0000XIXType ??
    item.type ??
    item.Type ??
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

export const extractTypes = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.Data,
    response?.result,
    response?.Result,
    response?.types,
    response?.Types,
    response?.data?.data,
    response?.data?.Data,
    response?.data?.result,
    response?.data?.Result,
    response?.result?.data,
    response?.Result?.Data,
  ];

  return candidates.find(Array.isArray) || [];
};

export const mapTypeFormData = (item = {}) => {
  const type = mapType(item);

  return {
    rdhR0000XIXType: type.rdhR0000XIXType,
  };
};

export const toTypeDto = (
  { rdhR0000XIXType },
  { employeeName = "", sourceID = "" } = {}
) => ({
  isDeactivated: false,
  createdByUser: employeeName,
  createdDate: new Date().toISOString(),
  sourceID: String(sourceID),
  rdhR0000XIXType: String(
    rdhR0000XIXType ?? ""
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
