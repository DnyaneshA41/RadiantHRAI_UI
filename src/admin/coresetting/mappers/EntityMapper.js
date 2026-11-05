

export const mapEntityToApi = (formData) => {
  const createdByUser =
    localStorage.getItem("employeeName") || "";

  const sourceID =
    localStorage.getItem("sourceID") || "";

  return {
    isDeactivated: false,

    createdByUser,
    sourceID,

    isActive: Boolean(formData.isActive),

    rdhR0000IID: Number(formData.rdhR0000IID) || 0,

    rdhR0000IIName:
      formData.rdhR0000IIName?.trim() || "",

    rdhR0000IIAddress:
      formData.rdhR0000IIAddress?.trim() || "",

    phoneNo:
      formData.phoneNo?.trim() || "",

    email:
      formData.email?.trim() || "",

    logo:
      formData.logo instanceof File
        ? formData.logo
        : typeof formData.logo === "string"
          ? formData.logo
          : "",

    stamp:
      formData.stamp instanceof File
        ? formData.stamp
        : typeof formData.stamp === "string"
          ? formData.stamp
          : "",
  };
};



export const mapEntityFromApi = (data) => ({
  rdhR0000IID: data?.rdhR0000IID ?? "",
  rdhR0000IIName: data?.rdhR0000IIName || "",
  rdhR0000IIAddress: data?.rdhR0000IIAddress || "",
  phoneNo: data?.phoneNo || "",
  email: data?.email || "",
  logo: data?.logo || null,
  stamp: data?.stamp || null,
  isActive: data?.isActive ?? true,
});
