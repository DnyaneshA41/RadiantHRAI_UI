
import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";

import FormInput from "../../../../../src/common/components/Form/FormInput";
import FormSelect from "../../../../../src/common/components/Form/FormSelect";
import FormCheckbox from "../../../../../src/common/components/Form/FormCheckbox";
import FormButton from "../../../../common/components/Form/FormButton";
import Toast from "../../../../common/components/Popups/Toast";

import {
  createStateApi,
  updateStateApi,
  getAllCountriesApi,
  getErrorMessage,
} from "../../services/StateApi";

import {
  mapStateToForm,
  extractArray,
  toBoolean,
} from "../../mappers/StateMapper";

const initialFormData = {
  stateName: "",
  stateCode: "",
  rdhR0000XId: "",
  isDefault: false,
  ptApplicable: false,
  lwfApplicable: false,
};

const getValue = (record, ...keys) => {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null) {
      return record[key];
    }
  }

  return undefined;
};

const State = ({
  editData: suppliedEditData = null,
  onSave,
  onUpdate,
}) => {
  const location = useLocation();
  const routeState = location.state || {};

  const editData = suppliedEditData || routeState.state || null;

  // Encrypted State ID used for update and delete operations.
  const encryptedId =
    routeState.encryptedId ||
    getValue(
      editData,
      "rdhR0000CCXXIID_Encrypted",
      "RDHR0000CCXXIID_Encrypted",
      "encryptedId",
      "EncryptedId",
      "encryptedID",
      "EncryptedID"
    );

  const isEditMode =
    Boolean(editData) &&
    (
      routeState.mode === "edit" ||
      routeState.isEdit === true ||
      Boolean(suppliedEditData)
    );

  const [formData, setFormData] = useState(() =>
    editData ? mapStateToForm(editData) : { ...initialFormData }
  );

  const [countries, setCountries] = useState([]);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);

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

  // Populate the form when opening an existing state for editing.
  useEffect(() => {
    setFormData(
      editData
        ? mapStateToForm(editData)
        : { ...initialFormData }
    );

    setErrors({});
  }, [editData]);

  // Load countries from GET /api/Country/GetCountryList.
  useEffect(() => {
    let active = true;

    const fetchCountries = async () => {
      setIsLoadingCountries(true);

      try {
        const response = await getAllCountriesApi();

        if (!active) return;

        const records = extractArray(response);

        const countryOptions = records
          .map((country) => {
            const countryId = getValue(
              country,
              "RDHR0000XID",
              "rdhR0000XID",
              "RDHR0000XId",
              "rdhR0000XId"
            );

            const countryName = getValue(
              country,
              "RDHR0000XName",
              "rdhR0000XName"
            );

            return {
              value:
                countryId !== undefined && countryId !== null
                  ? String(countryId)
                  : "",
              label: countryName ?? "Unnamed country",
            };
          })
          .filter((country) => country.value !== "");

        setCountries(countryOptions);
      } catch (error) {
        console.error("Failed to load countries:", error);

        if (active) {
          showToast(
            getErrorMessage(error, "Unable to load countries."),
            "error",
            4000
          );
        }
      } finally {
        if (active) {
          setIsLoadingCountries(false);
        }
      }
    };

    fetchCountries();

    return () => {
      active = false;
    };
  }, [showToast]);

  // Handle text inputs, dropdowns, and checkboxes.
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

  const handleReset = () => {
    if (isSaving) return;

    setFormData(
      isEditMode
        ? mapStateToForm(editData)
        : { ...initialFormData }
    );

    setErrors({});
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.stateName.trim()) {
      nextErrors.stateName = "State name is required.";
    }

    if (!formData.stateCode.trim()) {
      nextErrors.stateCode = "State code is required.";
    }

    if (!formData.rdhR0000XId) {
      nextErrors.rdhR0000XId = "Please select a country.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    if (!validateForm()) {
      showToast("Please correct the highlighted fields.", "error");
      return;
    }

    if (isEditMode && !encryptedId) {
      showToast(
        "Encrypted State ID is missing. Unable to update state.",
        "error",
        4000
      );
      return;
    }

    const payload = {
      ...formData,
      stateName: formData.stateName.trim(),
      stateCode: formData.stateCode.trim(),
      rdhR0000XId: Number(formData.rdhR0000XId),
      isDefault: toBoolean(formData.isDefault),
      ptApplicable: toBoolean(formData.ptApplicable),
      lwfApplicable: toBoolean(formData.lwfApplicable),
    };

    setIsSaving(true);

    try {
      if (isEditMode) {
        if (typeof onUpdate === "function") {
          await onUpdate(editData, payload);
        } else {
          await updateStateApi(encryptedId, payload);
        }

        showToast("State updated successfully.", "success");
      } else {
        if (typeof onSave === "function") {
          await onSave(payload);
        } else {
          await createStateApi(payload);
        }

        showToast("State created successfully.", "success");
        setFormData({ ...initialFormData });
      }

      setErrors({});
    } catch (error) {
      console.error("Failed to save state:", error);

      showToast(
        getErrorMessage(error, "Unable to save the state."),
        "error",
        4000
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}

      <div className="hrms-form-container state-page">
        <form onSubmit={handleSubmit} noValidate>
          {/* State Details */}
          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon">
                <FiMapPin size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  State Details
                </h3>

                <p className="hrms-form-section-description">
                  Enter the state information and applicable settings.
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormInput
                    label="State Name"
                    name="stateName"
                    value={formData.stateName}
                    onChange={handleChange}
                    placeholder="Enter state name"
                    required
                    error={errors.stateName}
                    disabled={isSaving}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="State Code"
                    name="stateCode"
                    value={formData.stateCode}
                    onChange={handleChange}
                    placeholder="Enter state code"
                    required
                    error={errors.stateCode}
                    disabled={isSaving}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormSelect
                    label="Country"
                    name="rdhR0000XId"
                    value={String(formData.rdhR0000XId ?? "")}
                    onChange={handleChange}
                    options={countries}
                    placeholder={
                      isLoadingCountries
                        ? "Loading countries..."
                        : "Select country"
                    }
                    required
                    error={errors.rdhR0000XId}
                    disabled={isSaving || isLoadingCountries}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* State Configuration */}
          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  State Configuration
                </h3>

                <p className="hrms-form-section-description">
                  Configure the default state and applicable taxes.
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormCheckbox
                    label="Default State"
                    name="isDefault"
                    checked={toBoolean(formData.isDefault)}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormCheckbox
                    label="Professional Tax Applicable"
                    name="ptApplicable"
                    checked={toBoolean(formData.ptApplicable)}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormCheckbox
                    label="Labour Welfare Fund Applicable"
                    name="lwfApplicable"
                    checked={toBoolean(formData.lwfApplicable)}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
              disabled={isSaving || isLoadingCountries}
            >
              {isSaving
                ? "Saving..."
                : isEditMode
                  ? "Update"
                  : "Save"}
            </FormButton>
          </div>
        </form>
      </div>
    </>
  );
};

export default State;
