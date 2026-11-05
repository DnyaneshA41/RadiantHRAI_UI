import axiosClientModule from "../../../api/axiosClientModule";

const getErrorMessage = (error, fallback = "Something went wrong.") => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;

  if (data?.errors) {
    const messages = Object.values(data.errors).flat();
    if (messages.length) return messages.join(" ");
  }

  return (
    data?.message ||
    data?.Message ||
    data?.detail ||
    data?.title ||
    error?.message ||
    fallback
  );
};

const getAuditData = () => ({
  createdByUser:
    localStorage.getItem("employeeName") ||
    localStorage.getItem("employeeId") ||
    "",
  createdDate: new Date().toISOString(),
  sourceID: localStorage.getItem("sourceID") || "",
});

const buildStatePayload = (data) => ({
  isDeactivated: false,
  ...getAuditData(),
  stateName: String(data.stateName ?? "").trim(),
  stateCode: String(data.stateCode ?? "").trim(),
  isDefault: Boolean(data.isDefault),
  rdhR0000XId: Number(data.rdhR0000XId),
  ptApplicable: Boolean(data.ptApplicable),
  lwfApplicable: Boolean(data.lwfApplicable),
});

export const getAllStatesApi = async () => {
  const response = await axiosClientModule.get("/State/GetAllState");
  return response.data;
};


export const getAllCountriesApi = async () => {
  const response = await axiosClientModule.get(
    "/Country/GetCountryList"
  );

  return response.data;
};


export const createStateApi = async (data) => {
  const response = await axiosClientModule.post(
    "/State/CreateState",
    buildStatePayload(data)
  );

  return response.data;
};

export const updateStateApi = async (encryptedId, data) => {
  if (!encryptedId) {
    throw new Error(
      "Encrypted State ID is missing. Check the GetAllState response."
    );
  }

  const dto = buildStatePayload(data);

  const response = await axiosClientModule.patch(
    `/State/UpdateState/${encodeURIComponent(encryptedId)}`,
    {
      encryptedId,
      dto,
    }
  );

  return response.data;
};

export const deleteStateApi = async (encryptedId) => {
  if (!encryptedId) {
    throw new Error(
      "Encrypted State ID is missing. Check the GetAllState response."
    );
  }

  const response = await axiosClientModule.patch(
    `/State/DeleteState/${encodeURIComponent(encryptedId)}`
  );

  return response.data;
};

export { getErrorMessage };