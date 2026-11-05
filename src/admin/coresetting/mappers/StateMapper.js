// stateMapper.js

const firstValue = (item, keys, fallback = "") => {
  for (const key of keys) {
    if (
      item?.[key] !== undefined &&
      item?.[key] !== null &&
      item?.[key] !== ""
    ) {
      return item[key];
    }
  }

  return fallback;
};

export const toBoolean = (value) =>
  value === true ||
  value === 1 ||
  String(value).toLowerCase() === "true";

export const mapState = (item = {}) => ({
  ...item,

  id: firstValue(item, [
    "rdhR0000XID",
    "RDHR0000XID",
    "rdhR0000XId",
    "RDHR0000XId",
    "id",
    "Id",
  ]),

  encryptedId: firstValue(item, [
    "rdhR0000CCXXIID_Encrypted",
    "rdhR0000XID_Encrypted",
    "RDHR0000XID_Encrypted",
    "encryptedId",
    "EncryptedId",
    "encryptedID",
    "EncryptedID",
  ]),

  stateName: firstValue(item, [
    "stateName",
    "StateName",
  ]),

  stateCode: firstValue(item, [
    "stateCode",
    "StateCode",
  ]),

  countryId: firstValue(item, [
    "rdhR0000XId",
    "RDHR0000XId",
    "rdhR0000XID",
    "RDHR0000XID",
  ], 0),

  isDefault: toBoolean(
    firstValue(item, ["isDefault", "IsDefault"], false)
  ),

  ptApplicable: toBoolean(
    firstValue(item, ["ptApplicable", "PtApplicable"], false)
  ),

  lwfApplicable: toBoolean(
    firstValue(item, ["lwfApplicable", "LwfApplicable"], false)
  ),

  isDeactivated: toBoolean(
    firstValue(item, ["isDeactivated", "IsDeactivated"], false)
  ),
});

export const mapStateToForm = (record = {}) => ({
  stateName: record.stateName ?? "",
  stateCode: record.stateCode ?? "",
  rdhR0000XId: record.countryId ?? record.rdhR0000XId ?? "",
  isDefault: toBoolean(record.isDefault),
  ptApplicable: toBoolean(record.ptApplicable),
  lwfApplicable: toBoolean(record.lwfApplicable),
});

export const extractArray = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.Data,
    response?.result,
    response?.Result,
    response?.states,
    response?.States,
    response?.data?.data,
    response?.data?.Data,
    response?.result?.data,
    response?.Result?.Data,
  ];

  return candidates.find(Array.isArray) || [];
};