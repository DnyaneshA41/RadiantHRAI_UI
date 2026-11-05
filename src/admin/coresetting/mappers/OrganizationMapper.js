const getValue = (data, ...keys) => {
  for (const key of keys) {
    if (
      data?.[key] !== undefined &&
      data?.[key] !== null
    ) {
      return data[key];
    }
  }

  return undefined;
};

const toBoolean = (value) => {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    String(value).toLowerCase() === "true"
  );
};

const toDateInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).substring(0, 10);
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

// ============================================================
// FRONTEND -> API
// ============================================================

export const mapOrganizationToApi = (formData, existing = {}) => {
  const employeeName =
    localStorage.getItem("employeeName") || "";

  const sourceID =
    localStorage.getItem("sourceID") || "";

  const establishedDate = formData.establishedDate
    ? new Date(formData.establishedDate)
    : null;

  const validEstablishedDate =
    establishedDate &&
    !Number.isNaN(establishedDate.getTime())
      ? establishedDate.toISOString()
      : null;

  return {
    IsDeactivated: toBoolean(
      getValue(existing, "IsDeactivated", "isDeactivated") ?? false
    ),

    CreatedByUser:
      getValue(existing, "CreatedByUser", "createdByUser") ||
      employeeName,

    CreatedDate:
      getValue(existing, "CreatedDate", "createdDate") ||
      new Date().toISOString(),

    SourceID:
      getValue(existing, "SourceID", "sourceID") ||
      sourceID,

    RDHR0000IName:
      formData.organizationName?.trim() || "",

    ShortName:
      formData.shortName?.trim() || "",

    IsActive: toBoolean(
      getValue(existing, "IsActive", "isActive") ?? true
    ),

    IndustryType:
      formData.industryType || "",

    EstablishedDate: validEstablishedDate,

    NotificationDays:
      Number(formData.notificationDays) || 0,

    AddressLine1:
      formData.address?.trim() || "",

    State:
      getValue(existing, "State", "state") || "",

    Country:
      getValue(existing, "Country", "country") || "",

    PostalCode:
      getValue(existing, "PostalCode", "postalCode") || "",

    PhoneNumber:
      formData.phoneNo?.trim() || "",

    EmailAddress:
      formData.emailId?.trim() || "",

    Website:
      formData.website?.trim() || "",

    PAN:
      formData.pan?.trim() || "",

    GSTNumber:
      formData.gstNumber?.trim() || "",

    ServicNumber:
      getValue(existing, "ServicNumber", "servicNumber") || "",

    CIN:
      formData.cin?.trim() || "",

    ManagerName:
      formData.ownerName?.trim() || "",

    // The API service uploads these only when they are File objects.
    // Existing image URLs are retained in the form, not re-uploaded.
    RDHR0000ILogo:
      formData.organizationLogo instanceof File
        ? formData.organizationLogo
        : undefined,

    Stamp:
      formData.organizationStamp instanceof File
        ? formData.organizationStamp
        : undefined,

    Slogan:
      formData.slogan?.trim() || "",

    WhatsappRequired: Boolean(formData.whatsappRequired),

    AadhaarVerificationRequired: Boolean(
      formData.aadhaarVerificationRequired
    ),

    TwoFactorAuthenticationRequired: Boolean(
      formData.twoFactorAuthenticationRequired
    ),

    NotificationRequired: Boolean(
      formData.notificationRequired
    ),
  };
};

// ============================================================
// API -> FRONTEND
// Supports uppercase and lowercase API response properties.
// ============================================================

export const mapOrganizationFromApi = (data = {}) => ({
  organizationName:
    getValue(data, "RDHR0000IName", "rdhR0000IName", "organizationName") || "",

  shortName:
    getValue(data, "ShortName", "shortName") || "",

  address:
    getValue(data, "AddressLine1", "addressLine1", "address") || "",

  phoneNo:
    getValue(data, "PhoneNumber", "phoneNumber", "phoneNo") || "",

  emailId:
    getValue(data, "EmailAddress", "emailAddress", "emailId") || "",

  website:
    getValue(data, "Website", "website") || "",

  ownerName:
    getValue(data, "ManagerName", "managerName", "ownerName") || "",

  industryType:
    getValue(data, "IndustryType", "industryType") || "",

  gstNumber:
    getValue(data, "GSTNumber", "gstNumber") || "",

  pan:
    getValue(data, "PAN", "pan") || "",

  cin:
    getValue(data, "CIN", "cin") || "",

  establishedDate: toDateInput(
    getValue(data, "EstablishedDate", "establishedDate")
  ),

  slogan:
    getValue(data, "Slogan", "slogan") || "",

  organizationLogo:
    getValue(
      data,
      "RDHR0000ILogo",
      "rdhR0000ILogo",
      "organizationLogo",
      "logo"
    ) || null,

  organizationStamp:
    getValue(
      data,
      "Stamp",
      "stamp",
      "organizationStamp"
    ) || null,

 whatsappRequired: toBoolean(
  getValue(
    data,
    "WhatsappRequired",
    "WhatsAppRequired",
    "whatsappRequired",
    "whatsappIntegrate"
  )
),

aadhaarVerificationRequired: toBoolean(
  getValue(
    data,
    "AadhaarVerificationRequired",
    "aadhaarVerificationRequired",
    "AadhaarAuthenticationRequired",
    "AadhaarAuthentication"
  )
),

twoFactorAuthenticationRequired: toBoolean(
  getValue(
    data,
    "TwoFactorAuthenticationRequired",
    "twoFactorAuthenticationRequired"
  )
),

notificationRequired: toBoolean(
  getValue(
    data,
    "NotificationRequired",
    "notificationRequired"
  )
),

  notificationDays:
    getValue(data, "NotificationDays", "notificationDays") ?? 0,
});