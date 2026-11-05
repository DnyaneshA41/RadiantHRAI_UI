import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import FormInput from "../../../../../src/common/components/Form/FormInput";
import FormSelect from "../../../../../src/common/components/Form/FormSelect";
import FormCheckbox from "../../../../../src/common/components/Form/FormCheckbox";
import FormButton from "../../../../../src/common/components/Form/FormButton";
import FormFileUpload from "../../../../../src/common/components/Form/FormFileUpload";
import DynamicCalendar from "../../../../common/components/calendar/DynamicCalendar";

import { getCroppedImage } from "../../../../common/utils/getCroppedImage";
import Toast from "../../../../common/components/Popups/Toast";

import {
  FiBriefcase,
  FiList,
  FiPhone,
  FiFileText,
  FiSettings,
  FiX,
  FiRotateCcw,
} from "react-icons/fi";

import {
  mapOrganizationToApi,
  mapOrganizationFromApi,
} from "../../mappers/OrganizationMapper";

import {
  createOrganizationApi,
  updateOrganizationApi,
} from "../../../coresetting/services/organizationApi";

import { organizationSchema } from "../../validations/OrganizationSchema";
import "./Organization.css";

// ============================================================
// INITIAL FORM DATA
// ============================================================

const initialFormData = {
  organizationName: "",
  shortName: "",
  address: "",
  phoneNo: "",
  emailId: "",
  website: "",
  ownerName: "",
  industryType: "",
  gstNumber: "",
  pan: "",
  cin: "",
  establishedDate: "",
  slogan: "",
  organizationLogo: null,
  organizationStamp: null,
  whatsappRequired: false,
  aadhaarVerificationRequired: false,
  twoFactorAuthenticationRequired: false,
  notificationRequired: false,
  notificationDays: 0,
};

const EMPTY_ORGANIZATION = {};

const getEncryptedId = (organization = {}) =>
  organization.encryptedId ??
  organization.RDHR0000IID_Encrypted ??
  organization.rdhr0000IID_Encrypted ??
  organization.EncryptedId ??
  organization.encryptedID ??
  "";

// ============================================================
// ORGANIZATION COMPONENT
// ============================================================

const Organization = ({
  onSave,
  organization: suppliedOrganization,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeState = location.state || {};

  const selectedOrganization =
    suppliedOrganization ??
    routeState.rawOrganization ??
    routeState.organization ??
    null;

  const originalApiRecord = useMemo(() => {
    if (!selectedOrganization) {
      return EMPTY_ORGANIZATION;
    }

    return selectedOrganization.raw ?? selectedOrganization;
  }, [selectedOrganization]);

  const editingId =
    getEncryptedId(selectedOrganization || {}) ||
    routeState.encryptedId ||
    "";

  const isEditMode = Boolean(
    routeState.mode === "edit" || editingId
  );

  // ============================================================
  // MAP SELECTED ORGANIZATION TO FORM
  // ============================================================

  const getInitialValues = useCallback(() => {
    if (!selectedOrganization) {
      return { ...initialFormData };
    }

    return {
      ...initialFormData,
      ...mapOrganizationFromApi(originalApiRecord),
    };
  }, [selectedOrganization, originalApiRecord]);

  // ============================================================
  // STATE
  // ============================================================

  const [formData, setFormData] = useState(() => getInitialValues());

  const [logoPreview, setLogoPreview] = useState(() => {
    const logo = getInitialValues().organizationLogo;
    return typeof logo === "string" ? logo : "";
  });

  const [stampPreview, setStampPreview] = useState(() => {
    const stamp = getInitialValues().organizationStamp;
    return typeof stamp === "string" ? stamp : "";
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [crop, setCrop] = useState({
    unit: "%",
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });

  const [completedCrop, setCompletedCrop] = useState(null);
  const [cropSaving, setCropSaving] = useState(false);

  const imageRef = useRef(null);
  const previewUrlsRef = useRef(new Set());

  // ============================================================
  // TOAST
  // ============================================================

  const handleToastClose = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((message, type = "error") => {
    setToast({
      id: Date.now(),
      message,
      type,
      duration: 3500,
    });
  }, []);

  // ============================================================
  // LOAD EDIT VALUES
  //
  // This effect runs when the selected organization changes.
  // It does NOT run after every input change.
  // ============================================================

  useEffect(() => {
    const values = getInitialValues();

    setFormData(values);
    setErrors({});

    setLogoPreview(
      typeof values.organizationLogo === "string"
        ? values.organizationLogo
        : ""
    );

    setStampPreview(
      typeof values.organizationStamp === "string"
        ? values.organizationStamp
        : ""
    );
  }, [getInitialValues]);

  // ============================================================
  // CLEAN UP PREVIEW URLS
  // ============================================================

  const createPreviewUrl = (file) => {
    const url = URL.createObjectURL(file);
    previewUrlsRef.current.add(url);
    return url;
  };

  const revokePreviewUrl = (url) => {
    if (url && previewUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      previewUrlsRef.current.delete(url);
    }
  };

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      previewUrlsRef.current.clear();
    };
  }, []);

  // ============================================================
  // INDUSTRY OPTIONS
  // ============================================================

  const industryOptions = [
    { value: "IT", label: "IT / Software" },
    { value: "BFSI", label: "BFSI" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Manufacturing", label: "Manufacturing" },
    { value: "Education", label: "Education" },
    { value: "Retail", label: "Retail" },
    { value: "Other", label: "Other" },
  ];

  // ============================================================
  // VALIDATE ONE FIELD
  // ============================================================

  const validateField = (name, value) => {
    const fieldSchema = organizationSchema.shape[name];

    if (!fieldSchema) return;

    const result = fieldSchema.safeParse(value);

    setErrors((previous) => ({
      ...previous,
      [name]: result.success
        ? ""
        : result.error.issues[0]?.message || "",
    }));
  };

  // ============================================================
  // UPDATE FORM STATE
  //
  // Supports:
  // 1. onChange(event)
  // 2. onChange(value, fieldName)
  // 3. Custom event-like objects
  // ============================================================

  const handleFieldValue = (name, value) => {
    if (!name) return;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    validateField(name, value);
  };

  const handleChange = (eventOrValue, fieldName) => {
    if (
      eventOrValue &&
      typeof eventOrValue === "object" &&
      eventOrValue.target
    ) {
      const target = eventOrValue.target;

      const name = target.name || fieldName;

      const value =
        target.type === "checkbox"
          ? target.checked
          : target.value;

      handleFieldValue(name, value);
      return;
    }

    handleFieldValue(fieldName, eventOrValue);
  };

  // ============================================================
  // SELECT CHANGE
  //
  // Supports either an event or a direct selected value.
  // ============================================================

  const handleSelectChange = (valueOrEvent, fieldName) => {
    if (
      valueOrEvent &&
      typeof valueOrEvent === "object" &&
      valueOrEvent.target
    ) {
      handleChange(valueOrEvent);
      return;
    }

    // Some custom selects return { value, label }.
    if (
      valueOrEvent &&
      typeof valueOrEvent === "object" &&
      "value" in valueOrEvent
    ) {
      handleFieldValue(fieldName, valueOrEvent.value);
      return;
    }

    handleFieldValue(fieldName, valueOrEvent ?? "");
  };

  // ============================================================
  // DATE CHANGE
  // ============================================================

  const handleDateChange = (valueOrEvent) => {
    if (
      valueOrEvent &&
      typeof valueOrEvent === "object" &&
      valueOrEvent.target
    ) {
      handleChange(valueOrEvent);
      return;
    }

    let value = valueOrEvent ?? "";

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");

      value = `${year}-${month}-${day}`;
    }

    handleFieldValue("establishedDate", value);
  };

  // ============================================================
  // PHONE CHANGE
  // ============================================================

  const handlePhoneChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    handleFieldValue("phoneNo", value);
  };

  // ============================================================
  // PAN CHANGE
  // ============================================================

  const handlePanChange = (event) => {
    const value = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10);

    handleFieldValue("pan", value);
  };

  // ============================================================
  // IMAGE FILE SELECTION
  // ============================================================

  const handleFileChange = (event) => {
    const target = event?.target;

    if (!target) return;

    const fieldName = target.name;
    const file = target.files?.[0];

    if (
      !file ||
      !["organizationLogo", "organizationStamp"].includes(fieldName)
    ) {
      return;
    }

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        [fieldName]: "Please select a PNG or JPEG image.",
      }));

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        [fieldName]: "Image size must not exceed 2 MB.",
      }));

      return;
    }

    setSelectedImage({
      file,
      imageUrl: createPreviewUrl(file),
      fieldName,
    });

    setCrop({
      unit: "%",
      x: 10,
      y: 10,
      width: 80,
      height: 80,
    });

    setCompletedCrop(null);
    setCropSaving(false);
    setCropModalOpen(true);

    setErrors((previous) => ({
      ...previous,
      [fieldName]: "",
    }));
  };

  // ============================================================
  // IMAGE LOAD
  // ============================================================

  const handleCropImageLoad = (event) => {
    imageRef.current = event.currentTarget;
  };

  // ============================================================
  // SAVE CROPPED IMAGE
  // ============================================================

  const handleCropSave = async () => {
    const fieldName = selectedImage?.fieldName;

    if (
      !selectedImage ||
      !imageRef.current ||
      !completedCrop ||
      completedCrop.width <= 0 ||
      completedCrop.height <= 0
    ) {
      setErrors((previous) => ({
        ...previous,
        [fieldName || "organizationLogo"]:
          "Please select a valid crop area.",
      }));

      return;
    }

    setCropSaving(true);

    try {
      const originalName = selectedImage.file.name.replace(
        /\.[^/.]+$/,
        ""
      );

      const image = imageRef.current;

      if (!image.complete || !image.naturalWidth || !image.naturalHeight) {
        throw new Error("Image has not loaded completely.");
      }

      const { file, preview } = await getCroppedImage(
        image,
        completedCrop,
        `${originalName}.png`
      );

      setFormData((previous) => ({
        ...previous,
        [fieldName]: file,
      }));

      if (fieldName === "organizationLogo") {
        revokePreviewUrl(logoPreview);
        setLogoPreview(preview);
      } else {
        revokePreviewUrl(stampPreview);
        setStampPreview(preview);
      }

      previewUrlsRef.current.add(preview);

      revokePreviewUrl(selectedImage.imageUrl);

      setSelectedImage(null);
      setCropModalOpen(false);
      setCompletedCrop(null);

      setErrors((previous) => ({
        ...previous,
        [fieldName]: "",
      }));
    } catch (error) {
      console.error("Image cropping failed:", error);

      setErrors((previous) => ({
        ...previous,
        [fieldName]:
          "Unable to crop this image. Please try again.",
      }));
    } finally {
      setCropSaving(false);
    }
  };

  // ============================================================
  // CANCEL CROPPING
  // ============================================================

  const handleCropCancel = () => {
    revokePreviewUrl(selectedImage?.imageUrl);

    setSelectedImage(null);
    setCropModalOpen(false);
    setCompletedCrop(null);
    setCropSaving(false);
  };

  // ============================================================
  // RESET FORM
  // ============================================================

  const handleReset = () => {
    revokePreviewUrl(logoPreview);
    revokePreviewUrl(stampPreview);
    revokePreviewUrl(selectedImage?.imageUrl);

    const values = getInitialValues();

    setFormData(values);

    setLogoPreview(
      typeof values.organizationLogo === "string"
        ? values.organizationLogo
        : ""
    );

    setStampPreview(
      typeof values.organizationStamp === "string"
        ? values.organizationStamp
        : ""
    );

    setErrors({});
    setSelectedImage(null);
    setCropModalOpen(false);
    setCompletedCrop(null);
    setCropSaving(false);
  };

  // ============================================================
  // SUBMIT: CREATE OR UPDATE
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    const result = organizationSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};

      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];

        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });

      setErrors(fieldErrors);

      showToast(
        "Please fix the validation errors before saving."
      );

      return;
    }

    if (isEditMode && !editingId) {
      showToast(
        "The encrypted organization ID is missing. Reopen Edit from the organization list."
      );

      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const payload = mapOrganizationToApi(
        result.data,
        originalApiRecord
      );

      let response;

      if (isEditMode) {
        response = await updateOrganizationApi(
          editingId,
          payload
        );
      } else {
        response = await createOrganizationApi(payload);
      }

      showToast(
        isEditMode
          ? "Organization updated successfully."
          : "Organization created successfully.",
        "success"
      );

   if (typeof onSave === "function") {
  onSave(response);
}

// Do not navigate or reset the form after updating.
// The user stays on the current organization edit page.
if (!isEditMode) {
  handleReset();
}
    } catch (error) {
      console.error(
        "Organization save failed:",
        error.response?.data || error
      );

      showToast(
        error.response?.data?.message ||
          error.response?.data?.Message ||
          error.message ||
          `Unable to ${isEditMode ? "update" : "create"} organization.`
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // REUSABLE INPUT
  //
  // Avoid passing a second onChange that overrides the common
  // handler. Special inputs use their own explicit handlers.
  // ============================================================

  const renderInput = (
    label,
    name,
    placeholder,
    options = {}
  ) => (
    <div className="hrms-form-group">
      <FormInput
        label={label}
        name={name}
        value={formData[name] ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        error={errors[name]}
        {...options}
      />
    </div>
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={handleToastClose}
        />
      )}

      <div className="hrms-form-container organization-page">
        <form
          className="organization-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* ORGANIZATION DETAILS */}

          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon">
                <FiList size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Organization Details
                </h3>

                <p className="hrms-form-section-description">
                  Provide the basic information of the organization.
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                {renderInput(
                  "Organization Name",
                  "organizationName",
                  "Enter Organization Name",
                  { required: true }
                )}

                {renderInput(
                  "Short Name",
                  "shortName",
                  "Enter Short Name",
                  { required: true }
                )}

                {renderInput(
                  "Owner Name",
                  "ownerName",
                  "Enter Owner Name"
                )}

                {renderInput(
                  "Address",
                  "address",
                  "Enter Organization Address"
                )}

                <div className="hrms-form-group">
                  <FormSelect
                    label="Industry Type"
                    name="industryType"
                    value={formData.industryType}
                    onChange={(valueOrEvent) =>
                      handleSelectChange(
                        valueOrEvent,
                        "industryType"
                      )
                    }
                    options={industryOptions}
                  />
                </div>

                <div className="hrms-form-group">
                  <DynamicCalendar
                    mode="dd-mm-yyyy"
                    label="Established Date"
                    name="establishedDate"
                    value={formData.establishedDate}
                    onChange={handleDateChange}
                    placeholder="Select Established Date"
                    required
                    error={errors.establishedDate}
                    maxDate={new Date()}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CONTACT DETAILS */}

          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon">
                <FiPhone size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Contact Details
                </h3>

                <p className="hrms-form-section-description">
                  Provide the organization's contact information.
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormInput
                    label="Phone No."
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handlePhoneChange}
                    placeholder="Enter Phone No."
                    type="tel"
                    maxLength={10}
                    inputMode="numeric"
                    required
                    error={errors.phoneNo}
                  />
                </div>

                {renderInput(
                  "Email ID",
                  "emailId",
                  "Enter Email ID",
                  {
                    type: "email",
                    required: true,
                  }
                )}

                {renderInput(
                  "Website",
                  "website",
                  "Enter Website",
                  {
                    type: "url",
                    required: true,
                  }
                )}
              </div>
            </div>
          </div>

          {/* REGISTRATION DETAILS */}

          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon">
                <FiFileText size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Registration Details
                </h3>

                <p className="hrms-form-section-description">
                  Provide statutory and registration details.
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                {renderInput(
                  "GST Number",
                  "gstNumber",
                  "Enter GST Number",
                  {
                    required: true,
                    maxLength: 15,
                  }
                )}

                <div className="hrms-form-group">
                  <FormInput
                    label="PAN"
                    name="pan"
                    value={formData.pan}
                    onChange={handlePanChange}
                    placeholder="Enter PAN"
                    maxLength={10}
                    required
                    error={errors.pan}
                  />
                </div>

                {renderInput(
                  "CIN",
                  "cin",
                  "Enter CIN",
                  {
                    required: true,
                    maxLength: 21,
                  }
                )}

                {renderInput(
                  "Slogan",
                  "slogan",
                  "Enter Organization Slogan"
                )}
              </div>
            </div>
          </div>

          {/* ORGANIZATION BRANDING */}

          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon">
                <FiBriefcase size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Organization Branding
                </h3>

                <p className="hrms-form-section-description">
                  Upload and crop the organization logo and official stamp.
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormFileUpload
                    label="Organization Logo"
                    name="organizationLogo"
                    value={formData.organizationLogo}
                    preview={logoPreview}
                    onFileSelect={(file) => {
                      if (!file) return;

                      handleFileChange({
                        target: {
                          name: "organizationLogo",
                          files: [file],
                        },
                      });
                    }}
                    accept="image/png,image/jpeg,image/jpg"
                  />

                  {errors.organizationLogo && (
                    <p className="organization-image-error">
                      {errors.organizationLogo}
                    </p>
                  )}
                </div>

                <div className="hrms-form-group">
                  <FormFileUpload
                    label="Organization Stamp"
                    name="organizationStamp"
                    value={formData.organizationStamp}
                    preview={stampPreview}
                    onFileSelect={(file) => {
                      if (!file) return;

                      handleFileChange({
                        target: {
                          name: "organizationStamp",
                          files: [file],
                        },
                      });
                    }}
                    accept="image/png,image/jpeg,image/jpg"
                  />

                  {errors.organizationStamp && (
                    <p className="organization-image-error">
                      {errors.organizationStamp}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* FORM ACTIONS */}

          <div className="hrms-form-section-footer">
            <FormButton
              type="button"
              variant="secondary"
              onClick={() => {
                if (isEditMode) {
                  navigate(-1);
                } else {
                  handleReset();
                }
              }}
              disabled={saving}
            >
              Cancel
            </FormButton>

            <FormButton
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : isEditMode
                  ? "Update"
                  : "Save"}
            </FormButton>
          </div>
        </form>
      </div>

      {/* IMAGE CROPPING MODAL */}

      {cropModalOpen && selectedImage && (
        <div
          className="organization-crop-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCropCancel();
            }
          }}
        >
          <div
            className="organization-crop-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="organization-crop-title"
          >
            <div className="organization-crop-header">
              <div>
                <h3 id="organization-crop-title">
                  Crop{" "}
                  {selectedImage.fieldName === "organizationLogo"
                    ? "Organization Logo"
                    : "Organization Stamp"}
                </h3>

                <p>
                  Adjust the crop area before saving your image.
                </p>
              </div>

              <button
                type="button"
                className="organization-crop-close"
                onClick={handleCropCancel}
                disabled={cropSaving}
                aria-label="Close crop modal"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="organization-crop-body">
              <div className="organization-crop-instructions">
                Drag the image crop handles to select the required area.
              </div>

              <div className="organization-crop-image-container">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(_, pixelCrop) => {
                    setCompletedCrop(pixelCrop);
                  }}
                  minWidth={20}
                  minHeight={20}
                  keepSelection
                >
                  <img
                    ref={imageRef}
                    src={selectedImage.imageUrl}
                    alt="Image to crop"
                    onLoad={handleCropImageLoad}
                    className="organization-crop-image"
                  />
                </ReactCrop>
              </div>

              <div className="organization-crop-file-info">
                <span>Selected file</span>

                <span title={selectedImage.file.name}>
                  {selectedImage.file.name}
                </span>
              </div>
            </div>

            <div className="organization-crop-footer">
              <button
                type="button"
                className="organization-crop-reset"
                onClick={() => {
                  setCrop({
                    unit: "%",
                    x: 10,
                    y: 10,
                    width: 80,
                    height: 80,
                  });

                  setCompletedCrop(null);
                }}
                disabled={cropSaving}
              >
                <FiRotateCcw size={15} />
                Reset Crop
              </button>

              <div className="organization-crop-actions">
                <button
                  type="button"
                  className="organization-crop-cancel"
                  onClick={handleCropCancel}
                  disabled={cropSaving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="organization-crop-save"
                  onClick={handleCropSave}
                  disabled={
                    cropSaving ||
                    !completedCrop ||
                    completedCrop.width <= 0 ||
                    completedCrop.height <= 0
                  }
                >
                  {cropSaving ? "Cropping..." : "Crop & Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Organization;  