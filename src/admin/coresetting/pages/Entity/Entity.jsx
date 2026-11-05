
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import FormInput from "../../../../../src/common/components/Form/FormInput";
import FormCheckbox from "../../../../../src/common/components/Form/FormCheckbox";
import FormButton from "../../../../../src/common/components/Form/FormButton";
import FormFileUpload from "../../../../../src/common/components/Form/FormFileUpload";
import FormSelect from "../../../../common/components/Form/FormSelect.jsx";
import ImageCropModal from "../../../../common/components/ImageCropModal/ImageCropModal.jsx";
import Toast from "../../../../common/components/Popups/Toast";

import {
  FiBriefcase,
  FiPhone,
  FiFileText,
} from "react-icons/fi";

import { getOrganisationListApi } from "../../services/OrganizationList.js";
import {
  createEntityApi,
  getEntityByIdApi,
  updateEntityApi,
} from "../../services/entityApi.js";

import { mapEntityToApi } from "../../mappers/EntityMapper.js";
import { entitySchema } from "../../validations/EntitySchema.js";

// =====================================================
// INITIAL FORM DATA
// =====================================================

const initialFormData = {
  isActive: true,
  rdhR0000IID: "",
  rdhR0000IIName: "",
  rdhR0000IIAddress: "",
  phoneNo: "",
  email: "",
  logo: null,
  stamp: null,
};

// =====================================================
// IMAGE PREVIEW HELPER
// Supports URLs and Base64 image strings.
// =====================================================

const getImagePreview = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const imageValue = value.trim();

  if (
    imageValue.startsWith("data:image/") ||
    imageValue.startsWith("blob:") ||
    imageValue.startsWith("http://") ||
    imageValue.startsWith("https://")
  ) {
    return imageValue;
  }

  return `data:image/png;base64,${imageValue}`;
};

// =====================================================
// EXTRACT ENTITY FROM API RESPONSE
// =====================================================

const extractEntity = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.Data,
    response?.result,
    response?.Result,
    response?.data?.data,
    response?.data?.Data,
    response?.data?.result,
    response?.data?.Result,
    response?.result?.data,
    response?.Result?.Data,
  ];

  return (
    candidates.find(
      (item) =>
        item &&
        !Array.isArray(item) &&
        typeof item === "object" &&
        (
          item.rdhR0000IIName !== undefined ||
          item.RDHR0000IIName !== undefined ||
          item.rdhR0000IIID !== undefined ||
          item.RDHR0000IIID !== undefined
        )
    ) || null
  );
};

// =====================================================
// ENTITY COMPONENT
// =====================================================

const Entity = ({ onSave }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isEditMode = location.state?.mode === "edit";
  const encryptedId = location.state?.encryptedId;

  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    ...initialFormData,
  });

  const [errors, setErrors] = useState({});

  const [logoPreview, setLogoPreview] = useState("");
  const [stampPreview, setStampPreview] = useState("");

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [organizations, setOrganizations] = useState([]);
  const [organizationsLoading, setOrganizationsLoading] = useState(true);

  const [isLoadingEntity, setIsLoadingEntity] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const previewUrlsRef = useRef(new Set());

  // =====================================================
  // TOAST
  // =====================================================

  const showToast = useCallback(
    (message, type = "info", duration = 3000) => {
      setToast({
        id: Date.now(),
        message,
        type,
        duration,
      });
    },
    []
  );

  const handleToastClose = useCallback(() => {
    setToast(null);
  }, []);

  // =====================================================
  // LOAD ORGANIZATION DROPDOWN
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const fetchOrganizations = async () => {
      try {
        setOrganizationsLoading(true);

        const response = await getOrganisationListApi();

        const candidates = [
          response,
          response?.data,
          response?.result,
          response?.data?.data,
          response?.data?.result,
          response?.result?.data,
          response?.Data,
          response?.data?.Data,
          response?.Result,
        ];

        const list = candidates.find(Array.isArray) || [];

        const normalizedOrganizations = list
          .map((organization) => {
            const id =
              organization?.rdhR0000IID ??
              organization?.RDHR0000IID ??
              organization?.organizationId ??
              organization?.organisationId ??
              organization?.id;

            const name =
              organization?.rdhR0000IName ??
              organization?.RDHR0000IName ??
              organization?.organizationName ??
              organization?.organisationName ??
              organization?.name;

            return {
              ...organization,
              dropdownValue: id,
              dropdownLabel:
                typeof name === "string" ? name.trim() : "",
            };
          })
          .filter(
            (organization) =>
              organization.dropdownValue !== null &&
              organization.dropdownValue !== undefined &&
              String(organization.dropdownLabel).trim() !== ""
          );

        if (!isMounted) return;

        setOrganizations(normalizedOrganizations);

        setErrors((previous) => ({
          ...previous,
          organization: "",
        }));

        if (normalizedOrganizations.length === 0) {
          showToast(
            "No organizations are available. Please create an organization first.",
            "info",
            4000
          );
        }
      } catch (error) {
        console.error(
          "Failed to load organizations:",
          error.response?.data || error.message
        );

        if (!isMounted) return;

        setOrganizations([]);

        setErrors((previous) => ({
          ...previous,
          organization: "Failed to load organizations.",
        }));

        showToast(
          "Failed to load organizations. Please try again.",
          "error",
          4000
        );
      } finally {
        if (isMounted) {
          setOrganizationsLoading(false);
        }
      }
    };

    fetchOrganizations();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // =====================================================
  // GET ENTITY DETAILS WHEN EDIT IS CLICKED
  // =====================================================

  useEffect(() => {
    if (!isEditMode) {
      setFormData({ ...initialFormData });
      setLogoPreview("");
      setStampPreview("");
      return;
    }

    if (!encryptedId) {
      showToast(
        "Encrypted entity ID is missing. Please return to the entity list and try again.",
        "error",
        5000
      );
      return;
    }

    let cancelled = false;

    const fetchEntityDetails = async () => {
      setIsLoadingEntity(true);

      try {
        const response = await getEntityByIdApi(encryptedId);

        // console.log("GetEntityByID API response:", response);

        const entity = extractEntity(response);

        if (!entity) {
          // console.error(
          //   "Unable to identify entity in API response:",
          //   response
          // );

          throw new Error(
            "Entity details were not found in the API response. Check the response structure."
          );
        }

        if (cancelled) return;

        const organizationId =
          entity.rdhR0000IID ??
          entity.RDHR0000IID ??
          entity.organizationId ??
          entity.organisationId ??
          "";

        const entityName =
          entity.rdhR0000IIName ??
          entity.RDHR0000IIName ??
          entity.entityName ??
          "";

        const entityAddress =
          entity.rdhR0000IIAddress ??
          entity.RDHR0000IIAddress ??
          entity.address ??
          "";

        const phone =
          entity.phoneNo ??
          entity.PhoneNo ??
          "";

        const email =
          entity.email ??
          entity.Email ??
          "";

        const logo =
          entity.logo ??
          entity.Logo ??
          null;

        const stamp =
          entity.stamp ??
          entity.Stamp ??
          null;

        setFormData({
          isActive:
            entity.isActive ??
            entity.IsActive ??
            true,

          rdhR0000IID: organizationId,
          rdhR0000IIName: entityName,
          rdhR0000IIAddress: entityAddress,
          phoneNo: phone,
          email,
          logo,
          stamp,
        });

        setLogoPreview(getImagePreview(logo));
        setStampPreview(getImagePreview(stamp));

        setErrors({});

        showToast(
          "Entity details loaded successfully.",
          "success",
          2000
        );
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Failed to load entity details:",
          error.response?.data || error
        );

        showToast(
          error.response?.data?.message ||
            error.response?.data?.Message ||
            error.message ||
            "Failed to load entity details.",
          "error",
          5000
        );
      } finally {
        if (!cancelled) {
          setIsLoadingEntity(false);
        }
      }
    };

    fetchEntityDetails();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, encryptedId, showToast]);

  // =====================================================
  // CLEAN UP TEMPORARY IMAGE URLS
  // =====================================================

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      previewUrlsRef.current.clear();
    };
  }, []);

  // =====================================================
  // CREATE IMAGE PREVIEW URL
  // =====================================================

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

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((previous) => ({
      ...previous,
      [name]: fieldValue,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      ...(name === "rdhR0000IID" ? { organization: "" } : {}),
    }));
  };

  // =====================================================
  // IMAGE FILE SELECTION
  // =====================================================

  const handleFileChange = (file, fieldName) => {
    if (!file || !["logo", "stamp"].includes(fieldName)) {
      return;
    }

    if (
      !["image/png", "image/jpeg", "image/jpg"].includes(file.type)
    ) {
      setErrors((previous) => ({
        ...previous,
        [fieldName]: "Please select a PNG or JPEG image.",
      }));

      showToast("Please select a PNG or JPEG image.", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        [fieldName]: "Image size must not exceed 2 MB.",
      }));

      showToast("Image size must not exceed 2 MB.", "error");
      return;
    }

    if (selectedImage?.imageUrl) {
      revokePreviewUrl(selectedImage.imageUrl);
    }

    const imageUrl = createPreviewUrl(file);

    setSelectedImage({
      file,
      imageUrl,
      fieldName,
    });

    setCropModalOpen(true);

    setErrors((previous) => ({
      ...previous,
      [fieldName]: "",
      image: "",
    }));
  };

  // =====================================================
  // SAVE CROPPED IMAGE
  // =====================================================

  const handleCropSave = async ({ file, preview }) => {
    const fieldName = selectedImage?.fieldName;

    if (
      !fieldName ||
      !["logo", "stamp"].includes(fieldName) ||
      !(file instanceof File) ||
      !preview
    ) {
      showToast(
        "Unable to process the cropped image. Please try again.",
        "error"
      );

      throw new Error("Unable to process the cropped image.");
    }

    const oldPreview =
      fieldName === "logo" ? logoPreview : stampPreview;

    setFormData((previous) => ({
      ...previous,
      [fieldName]: file,
    }));

    if (fieldName === "logo") {
      setLogoPreview(preview);
    } else {
      setStampPreview(preview);
    }

    if (preview.startsWith("blob:")) {
      previewUrlsRef.current.add(preview);
    }

    if (oldPreview && oldPreview !== preview) {
      revokePreviewUrl(oldPreview);
    }

    if (selectedImage?.imageUrl) {
      revokePreviewUrl(selectedImage.imageUrl);
    }

    setCropModalOpen(false);
    setSelectedImage(null);

    setErrors((previous) => ({
      ...previous,
      [fieldName]: "",
      image: "",
    }));

    showToast(
      fieldName === "logo"
        ? "Entity logo cropped successfully."
        : "Entity stamp cropped successfully.",
      "success",
      2000
    );
  };

  // =====================================================
  // CANCEL IMAGE CROPPING
  // =====================================================

  const handleCropCancel = () => {
    if (selectedImage?.imageUrl) {
      revokePreviewUrl(selectedImage.imageUrl);
    }

    setCropModalOpen(false);
    setSelectedImage(null);
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const handleReset = () => {
    if (isSaving || isLoadingEntity) {
      return;
    }

    revokePreviewUrl(logoPreview);
    revokePreviewUrl(stampPreview);

    if (selectedImage?.imageUrl) {
      revokePreviewUrl(selectedImage.imageUrl);
    }

    setFormData({ ...initialFormData });
    setLogoPreview("");
    setStampPreview("");
    setErrors({});
    setCropModalOpen(false);
    setSelectedImage(null);
    setToast(null);

    // Return to the list when cancelling Edit mode.
    if (isEditMode) {
      navigate(-1);
    }
  };

  // =====================================================
  // SUBMIT FORM
  // NOTE: This currently uses the CREATE API.
  // Connect the actual update API before saving edits.
  // =====================================================


const handleSubmit = async (event) => {
  event.preventDefault();

  if (isSaving || isLoadingEntity) return;

  // Validate encrypted ID in edit mode
  if (isEditMode && !encryptedId) {
    showToast(
      "Encrypted entity ID is missing. Cannot update entity.",
      "error",
      4000
    );
    return;
  }

  // Prevent saving while image cropping is open
  if (cropModalOpen) {
    setErrors((previous) => ({
      ...previous,
      image: "Please finish or cancel image cropping before saving.",
    }));

    showToast(
      "Please finish or cancel image cropping before saving.",
      "warning",
      4000
    );
    return;
  }

  // Validate form fields
  const validationResult = entitySchema.safeParse(formData);

  if (!validationResult.success) {
    const validationErrors = {};

    validationResult.error.issues.forEach((issue) => {
      const fieldName = issue.path[0];

      if (fieldName && !validationErrors[fieldName]) {
        validationErrors[fieldName] = issue.message;
      }
    });

    setErrors(validationErrors);

    showToast(
      "Please fix the validation errors before saving.",
      "error",
      4000
    );

    return;
  }

  setErrors({});
  setIsSaving(true);

  try {
    const validatedData = validationResult.data;

    // Prepare API payload
    const payload = mapEntityToApi({
      ...validatedData,
      logo: validatedData.logo || null,
      stamp: validatedData.stamp || null,
    });

    let response;

    // CREATE OR UPDATE ENTITY
    if (isEditMode) {
      response = await updateEntityApi(encryptedId, payload);
    } else {
      response = await createEntityApi(payload);
    }

    // Extract API success message
    const successMessage =
      response?.message ||
      response?.Message ||
      response?.data?.message ||
      response?.data?.Message ||
      (isEditMode
        ? "Entity updated successfully."
        : "Entity created successfully.");

    // Display success toast
    showToast(successMessage, "success", 3000);

    // Notify parent component
    if (typeof onSave === "function") {
      await onSave(response, payload);
    }

    // Clean up temporary image URLs
    revokePreviewUrl(logoPreview);
    revokePreviewUrl(stampPreview);

    if (selectedImage?.imageUrl) {
      revokePreviewUrl(selectedImage.imageUrl);
    }

    setSelectedImage(null);
    setCropModalOpen(false);

    // Navigate after update or reset after create
    if (isEditMode) {
      navigate(-1);
    } else {
      setFormData({ ...initialFormData });
      setLogoPreview("");
      setStampPreview("");
      setErrors({});
    }
  } catch (error) {
    const errorData = error?.response?.data;

    console.error(
      `Failed to ${isEditMode ? "update" : "create"} entity:`,
      errorData || error
    );

    // Log backend validation details
    console.log(
      "DTO validation errors:",
      errorData?.errors?.Dto
    );

    console.log(
      "EncryptedId validation errors:",
      errorData?.errors?.EncryptedId
    );

    // Extract the most useful error message
    const validationMessages = errorData?.errors
      ? Object.values(errorData.errors)
          .flat()
          .filter(Boolean)
          .join(" ")
      : "";

    const errorMessage =
      (typeof errorData === "string" ? errorData : "") ||
      errorData?.message ||
      errorData?.Message ||
      errorData?.detail ||
      (validationMessages || "") ||
      errorData?.title ||
      error?.message ||
      (isEditMode
        ? "Failed to update entity. Please try again."
        : "Failed to create entity. Please try again.");

    // Display error toast
    showToast(errorMessage, "error", 5000);
  } finally {
    setIsSaving(false);
  }
};



  // =====================================================
  // ORGANIZATION DROPDOWN OPTIONS
  // =====================================================

  const organizationOptions = organizations.map((organization) => ({
    value: organization.dropdownValue,
    label: organization.dropdownLabel,
  }));

  // =====================================================
  // RENDER
  // =====================================================

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

      <div className="hrms-form-container entity-page">
        {isEditMode && isLoadingEntity && (
          <div className="text-center py-3" role="status">
            Loading entity details...
          </div>
        )}

        <form className="entity-form" onSubmit={handleSubmit}>
          {/* ENTITY DETAILS */}

          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon">
                <FiBriefcase size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Entity Details
                </h3>

                <p className="hrms-form-section-description">
                  Enter the basic information and address of the entity.
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormSelect
                    label="Organization"
                    name="rdhR0000IID"
                    value={formData.rdhR0000IID}
                    onChange={handleChange}
                    options={organizationOptions}
                    error={errors.rdhR0000IID}
                    disabled={
                      organizationsLoading ||
                      isSaving ||
                      isLoadingEntity
                    }
                    required
                  />

                  {!organizationsLoading &&
                    organizations.length === 0 &&
                    !errors.rdhR0000IID && (
                      <p className="entity-image-error">
                        No organizations found.
                      </p>
                    )}

                  {errors.organization && (
                    <p className="entity-image-error">
                      {errors.organization}
                    </p>
                  )}
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="Entity Name"
                    name="rdhR0000IIName"
                    value={formData.rdhR0000IIName}
                    onChange={handleChange}
                    placeholder="Enter Entity Name"
                    required
                    error={errors.rdhR0000IIName}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="Address"
                    name="rdhR0000IIAddress"
                    value={formData.rdhR0000IIAddress}
                    onChange={handleChange}
                    placeholder="Enter Entity Address"
                    required
                    error={errors.rdhR0000IIAddress}
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
                  Enter the entity's contact information.
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
                    onChange={(event) => {
                      const value = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      handleChange({
                        target: {
                          name: "phoneNo",
                          value,
                          type: "text",
                        },
                      });
                    }}
                    placeholder="Enter Phone No."
                    type="tel"
                    maxLength={10}
                    inputMode="numeric"
                    required
                    error={errors.phoneNo}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Email Address"
                    required
                    error={errors.email}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ENTITY BRANDING */}

          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon">
                <FiFileText size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Entity Branding
                </h3>

                <p className="hrms-form-section-description">
                  Upload an entity logo or official stamp if available.
                  Both fields are optional.
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormFileUpload
                    label="Entity Logo (Optional)"
                    name="logo"
                    value={formData.logo}
                    preview={logoPreview}
                    onFileSelect={(file) =>
                      handleFileChange(file, "logo")
                    }
                    accept="image/png,image/jpeg,image/jpg"
                  />

                  {errors.logo && (
                    <p className="entity-image-error">
                      {errors.logo}
                    </p>
                  )}
                </div>

                <div className="hrms-form-group">
                  <FormFileUpload
                    label="Entity Stamp (Optional)"
                    name="stamp"
                    value={formData.stamp}
                    preview={stampPreview}
                    onFileSelect={(file) =>
                      handleFileChange(file, "stamp")
                    }
                    accept="image/png,image/jpeg,image/jpg"
                  />

                  {errors.stamp && (
                    <p className="entity-image-error">
                      {errors.stamp}
                    </p>
                  )}
                </div>
              </div>

              {errors.image && (
                <p className="entity-image-error">
                  {errors.image}
                </p>
              )}
            </div>
          </div>

          {/* STATUS */}

          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon">
                <FiBriefcase size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Status
                </h3>

                <p className="hrms-form-section-description">
                  Enable or disable this entity.
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <FormCheckbox
                label="Active"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* FORM ACTIONS */}

          <div className="hrms-form-section-footer">
            <FormButton
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={isSaving || isLoadingEntity}
            >
              Cancel
            </FormButton>

            <FormButton
              type="submit"
              variant="primary"
              disabled={
                isSaving ||
                isLoadingEntity ||
                organizationsLoading
              }
            >
              {isLoadingEntity
                ? "Loading..."
                : isSaving
                  ? "Saving..."
                  : "Save"}
            </FormButton>
          </div>
        </form>
      </div>

      {/* IMAGE CROP MODAL */}

      <ImageCropModal
        isOpen={cropModalOpen}
        imageFile={selectedImage?.file}
        imageUrl={selectedImage?.imageUrl}
        fileName={
          selectedImage?.file?.name
            ? `${selectedImage.file.name.replace(/\.[^/.]+$/, "")}.png`
            : "entity-image.png"
        }
        title={
          selectedImage?.fieldName === "logo"
            ? "Crop Entity Logo"
            : "Crop Entity Stamp"
        }
        onSave={handleCropSave}
        onCancel={handleCropCancel}
      />
    </>
  );
};

export default Entity;
 