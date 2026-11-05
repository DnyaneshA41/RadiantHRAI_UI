
import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {LuListChecks} from "react-icons/lu"

import FormInput from "../../../../../src/common/components/Form/FormInput";
import FormCheckbox from "../../../../../src/common/components/Form/FormCheckbox";
import FormButton from "../../../../common/components/Form/FormButton";
import Toast from "../../../../common/components/Popups/Toast";
import axiosClientModule from "../../../../api/axiosClientModule";

import { FiBriefcase, FiList } from "react-icons/fi";
import { designationSchema, numericFields } from "../../validations/DesignitionSchema";

// =====================================================
// INITIAL FORM
// =====================================================

const initialFormData = {
  rdhR0000XIIName: "",
  recruitmentApplicable: false,
  minimumAge: 0,
  maximumAge: 0,
  minimumExperience: 0,
  maximumExperience: 0,
  minimumBudget: 0,
  maximumBudget: 0,
  referralBonus: 0,
  referralLimit: 0,
};

// =====================================================
// VALUE HELPERS
// =====================================================

const getValue = (record, ...keys) => {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null) {
      return record[key];
    }
  }

  return undefined;
};

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toBoolean = (value) =>
  value === true ||
  value === 1 ||
  String(value).toLowerCase() === "true";

// =====================================================
// MAP API RECORD TO FORM
// =====================================================

const mapDesignationToForm = (record) => {
  if (!record) return { ...initialFormData };

  return {
    rdhR0000XIIName:
      getValue(
        record,
        "rdhR0000XIIName",
        "RDHR0000XIIName",
        "designationName",
        "DesignationName"
      ) ?? "",

    recruitmentApplicable: toBoolean(
      getValue(record, "recruitmentApplicable", "RecruitmentApplicable")
    ),

    minimumAge: toNumber(
      getValue(record, "minimumAge", "MinimumAge")
    ),
    maximumAge: toNumber(
      getValue(record, "maximumAge", "MaximumAge")
    ),
    minimumExperience: toNumber(
      getValue(record, "minimumExperience", "MinimumExperience")
    ),
    maximumExperience: toNumber(
      getValue(record, "maximumExperience", "MaximumExperience")
    ),
    minimumBudget: toNumber(
      getValue(record, "minimumBudget", "MinimumBudget")
    ),
    maximumBudget: toNumber(
      getValue(record, "maximumBudget", "MaximumBudget")
    ),
    referralBonus: toNumber(
      getValue(record, "referralBonus", "ReferralBonus")
    ),
    referralLimit: toNumber(
      getValue(record, "referralLimit", "ReferralLimit")
    ),
  };
};

// =====================================================
// CREATE API
// =====================================================

const createDesignationApi = async (data) => {
  const payload = {
    isDeactivated: false,
    createdByUser: localStorage.getItem("employeeName") || "",
    createdDate: new Date().toISOString(),
    sourceID: localStorage.getItem("sourceID") || "",
    rdhR0000XIIName: data.rdhR0000XIIName.trim(),
    recruitmentApplicable: Boolean(data.recruitmentApplicable),
    ...Object.fromEntries(
      numericFields.map((field) => [field, toNumber(data[field])])
    ),
  };

  const response = await axiosClientModule.post(
    "/Designation/CreateDesignation",
    payload
  );

  return response.data;
};

// =====================================================
// UPDATE API
// =====================================================

const updateDesignationApi = async (encryptedId, data) => {
  if (!encryptedId) {
    throw new Error("Encrypted Designation ID is missing.");
  }

  const dto = {
    isDeactivated: false,
    createdByUser: localStorage.getItem("employeeName") || "",
    createdDate: new Date().toISOString(),
    sourceID: localStorage.getItem("sourceID") || "",
    rdhR0000XIIName: data.rdhR0000XIIName.trim(),
    recruitmentApplicable: Boolean(data.recruitmentApplicable),
    ...Object.fromEntries(
      numericFields.map((field) => [field, toNumber(data[field])])
    ),
  };

  const response = await axiosClientModule.patch(
    `/Designation/UpdateDesignation/${encodeURIComponent(encryptedId)}`,
    {
      encryptedId,
      dto,
    }
  );

  return response.data;
};

// =====================================================
// ERROR MESSAGE
// =====================================================

const getErrorMessage = (error) => {
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
    "Unable to save the designation. Please try again."
  );
};

// =====================================================
// COMPONENT
// =====================================================

const Designation = ({
  editData: suppliedEditData = null,
  onSave,
  onUpdate,
}) => {
  const location = useLocation();
  const routeState = location.state || {};

  const editData = suppliedEditData || routeState.designation || null;

  const encryptedId =
    routeState.encryptedId ||
    getValue(
      editData,
      "encryptedId",
      "EncryptedId",
      "encryptedID",
      "EncryptedID",
      "rdhR0000XIIID_Encrypted",
      "RDHR0000XIIID_Encrypted",
      "rdhR0000XIIEncryptedId",
      "RDHR0000XIIEncryptedId"
    );

  const isEditMode =
    Boolean(editData) &&
    (routeState.mode === "edit" ||
      routeState.isEdit === true ||
      Boolean(suppliedEditData));

  const [formData, setFormData] = useState(() =>
    mapDesignationToForm(editData)
  );
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(mapDesignationToForm(editData));
    setErrors({});
  }, [editData]);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    setToast({ id: Date.now(), message, type, duration });
  }, []);

  const handleToastClose = useCallback(() => {
    setToast(null);
  }, []);

  // ===================================================
  // CHANGE HANDLER
  // ===================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // ===================================================
  // RESET
  // ===================================================

  const handleReset = () => {
    if (isSaving) return;

    setFormData(
      isEditMode ? mapDesignationToForm(editData) : { ...initialFormData }
    );
    setErrors({});
  };

  // ===================================================
  // ZOD VALIDATION
  // ===================================================

  const validateForm = () => {
    const result = designationSchema.safeParse(formData);

    if (result.success) {
      setErrors({});
      return true;
    }

    const nextErrors = {};

    result.error.issues.forEach((issue) => {
      const fieldName = issue.path[0];

      if (fieldName && !nextErrors[fieldName]) {
        nextErrors[fieldName] = issue.message;
      }
    });

    setErrors(nextErrors);
    return false;
  };

  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    if (!validateForm()) {
      showToast("Please correct the highlighted fields.", "error");
      return;
    }

    const payload = {
      ...formData,
      rdhR0000XIIName: String(formData.rdhR0000XIIName).trim(),
      recruitmentApplicable: Boolean(formData.recruitmentApplicable),
      ...Object.fromEntries(
        numericFields.map((field) => [field, toNumber(formData[field])])
      ),
    };

    setIsSaving(true);

    try {
      if (isEditMode) {
        if (typeof onUpdate === "function") {
          await onUpdate(editData, payload);
        } else {
          await updateDesignationApi(encryptedId, payload);
        }

        showToast("Designation updated successfully.", "success");
      } else {
        if (typeof onSave === "function") {
          await onSave(payload);
        } else {
          await createDesignationApi(payload);
        }

        showToast("Designation created successfully.", "success");
        setFormData({ ...initialFormData });
      }

      setErrors({});
    } catch (error) {
      console.error("Failed to save designation:", error);
      showToast(getErrorMessage(error), "error", 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // ===================================================
  // FIELDS
  // ===================================================

  const eligibilityFields = [
    { name: "minimumAge", label: "Minimum Age", min: 18 },
    { name: "maximumAge", label: "Maximum Age", min: 0 },
    { name: "minimumExperience", label: "Minimum Experience", min: 0 },
    { name: "maximumExperience", label: "Maximum Experience", min: 0 },
    { name: "minimumBudget", label: "Minimum Budget", min: 0 },
    { name: "maximumBudget", label: "Maximum Budget", min: 0 },
    { name: "referralBonus", label: "Referral Bonus", min: 0 },
    { name: "referralLimit", label: "Referral Limit", min: 0 },
  ];

  // ===================================================
  // RENDER
  // ===================================================

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

      <div className="hrms-form-container designation-page">
        <form onSubmit={handleSubmit} noValidate>
          {/* DESIGNATION DETAILS */}
          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon">
                <FiList size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Designation Details
                </h3>

                <p className="hrms-form-section-description">
                  Enter the designation information and eligibility criteria.
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormInput
                    label="Designation Name"
                    name="rdhR0000XIIName"
                    value={formData.rdhR0000XIIName}
                    onChange={handleChange}
                    placeholder="Enter Designation Name"
                    required
                    error={errors.rdhR0000XIIName}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ELIGIBILITY CRITERIA */}
          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon">
                <LuListChecks size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Eligibility Criteria
                </h3>

                <p className="hrms-form-section-description">
                  Enable this option to configure eligibility requirements.
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-group">
                <FormCheckbox
                  label="Eligibility Criteria Applicable?"
                  name="recruitmentApplicable"
                  checked={formData.recruitmentApplicable}
                  onChange={handleChange}
                  disabled={isSaving}
                />
              </div>

              <div className="hrms-form-row-3">
                {eligibilityFields.map((field) => (
                  <div className="hrms-form-group" key={field.name}>
                    <FormInput
                      label={field.label}
                      name={field.name}
                      type="number"
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder="0"
                      min={field.min}
                      disabled={
                        isSaving || !formData.recruitmentApplicable
                      }
                      error={errors[field.name]}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="hrms-form-section-footer">
            <FormButton
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={isSaving}
            >
              Cancel
            </FormButton>

            <FormButton
              type="submit"
              variant="primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : isEditMode ? "Update" : "Save"}
            </FormButton>
          </div>
        </form>
      </div>
    </>
  );
};

export default Designation;
