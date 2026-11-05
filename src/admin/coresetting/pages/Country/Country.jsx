import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiList } from "react-icons/fi";

import FormInput from "../../../../../src/common/components/Form/FormInput";
import FormCheckbox from "../../../../../src/common/components/Form/FormCheckbox";
import FormButton from "../../../../common/components/Form/FormButton";
import Toast from "../../../../common/components/Popups/Toast";
import axiosClientModule from "../../../../api/axiosClientModule";

const initialFormData = {
  rdhR0000XName: "",
  currencyName: "",
  shortName: "",
  currencyNotation: "",
  nationality: "",
  isDefault: false,
};

const getErrorMessage = (error, fallback) => {
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

const Country = ({ onSave }) => {
  const location = useLocation();

  const employeeName = localStorage.getItem("employeeName") || "";
  const sourceID = localStorage.getItem("sourceID") || "";

  const isEdit =
    location.state?.mode === "edit" ||
    location.state?.isEdit === true;

  const selectedCountry = location.state?.country || null;

  const encryptedId =
    location.state?.encryptedId ||
    selectedCountry?.encryptedId ||
    selectedCountry?.EncryptedId ||
    "";

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    (message, type = "info", duration = 3000) => {
      setToast({ id: Date.now(), message, type, duration });
    },
    []
  );

  const handleToastClose = useCallback(() => {
    setToast(null);
  }, []);

  const getCountryFormData = useCallback((country) => ({
    rdhR0000XName:
      country?.rdhR0000XName ??
      country?.RDHR0000XName ??
      country?.countryName ??
      country?.CountryName ??
      "",
    currencyName:
      country?.currencyName ??
      country?.CurrencyName ??
      "",
    shortName:
      country?.shortName ??
      country?.ShortName ??
      "",
    currencyNotation:
      country?.currencyNotation ??
      country?.CurrencyNotation ??
      "",
    nationality:
      country?.nationality ??
      country?.Nationality ??
      "",
    isDefault:
      country?.isDefault ??
      country?.IsDefault ??
      false,
  }), []);

  useEffect(() => {
    if (isEdit && selectedCountry) {
      setFormData(getCountryFormData(selectedCountry));
    } else {
      setFormData(initialFormData);
    }

    setErrors({});
  }, [isEdit, selectedCountry, getCountryFormData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleDefaultChange = (value) => {
    const checked =
      typeof value === "boolean"
        ? value
        : value?.target?.checked ?? false;

    setFormData((previous) => ({
      ...previous,
      isDefault: checked,
    }));
  };

  const handleReset = () => {
    if (isSaving) return;

    setFormData(
      isEdit && selectedCountry
        ? getCountryFormData(selectedCountry)
        : initialFormData
    );

    setErrors({});
  };

  const validateForm = () => {
    const normalizedData = {
      rdhR0000XName: formData.rdhR0000XName.trim(),
      currencyName: formData.currencyName.trim(),
      shortName: formData.shortName.trim(),
      currencyNotation: formData.currencyNotation.trim(),
      nationality: formData.nationality.trim(),
      isDefault: Boolean(formData.isDefault),
    };

    const validationErrors = {};

    const requiredFields = [
      ["rdhR0000XName", "Country"],
      ["currencyName", "Currency"],
      ["shortName", "Short Name"],
      ["currencyNotation", "Currency Notation"],
      ["nationality", "Nationality"],
    ];

    requiredFields.forEach(([field, label]) => {
      if (!normalizedData[field]) {
        validationErrors[field] = `${label} is required.`;
      }
    });

    setErrors(validationErrors);

    return {
      success: Object.keys(validationErrors).length === 0,
      data: normalizedData,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    const validation = validateForm();

    if (!validation.success) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    if (isEdit && !encryptedId) {
      showToast(
        "Encrypted Country ID is missing. Please return to the list and try again.",
        "error",
        5000
      );
      return;
    }

    setIsSaving(true);

    const dto = {
      isDeactivated: false,
      createdByUser: employeeName,
      createdDate: new Date().toISOString(),
      sourceID: String(sourceID),
      rdhR0000XName: validation.data.rdhR0000XName,
      currencyName: validation.data.currencyName,
      shortName: validation.data.shortName,
      currencyNotation: validation.data.currencyNotation,
      nationality: validation.data.nationality,
      isDefault: validation.data.isDefault,
    };

    try {
      let response;

      if (isEdit) {
        const payload = {
          encryptedId,
          dto,
        };

        const result = await axiosClientModule.patch(
          `/Country/UpdateCountry/${encodeURIComponent(encryptedId)}`,
          payload
        );

        response = result.data;
      } else {
        const result = await axiosClientModule.post(
          "/Country/CreateCountry",
          dto
        );

        response = result.data;
      }

      showToast(
        response?.message ||
          response?.Message ||
          (isEdit
            ? "Country updated successfully."
            : "Country created successfully."),
        "success"
      );

      if (typeof onSave === "function") {
        await onSave(response, isEdit ? { encryptedId, dto } : dto);
      }

      if (isEdit) {
        setFormData(validation.data);
      } else {
        setFormData(initialFormData);
        setErrors({});
      }
    } catch (error) {
      console.error(
        isEdit ? "Failed to update Country:" : "Failed to create Country:",
        {
          status: error?.response?.status,
          responseData: error?.response?.data,
          requestUrl: error?.config?.url,
          requestMethod: error?.config?.method,
        }
      );

      showToast(
        getErrorMessage(
          error,
          isEdit
            ? "Failed to update Country. Please try again."
            : "Failed to create Country. Please try again."
        ),
        "error",
        5000
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
          onClose={handleToastClose}
        />
      )}

      <div className="hrms-form-container country-page">
        <form className="country-form" onSubmit={handleSubmit} noValidate>
          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon">
                <FiList size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Country Details
                </h3>

                <p className="hrms-form-section-description">
                  {isEdit
                    ? "Update the country information below."
                    : "Enter the country information below."}
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormInput
                    label="Country"
                    name="rdhR0000XName"
                    value={formData.rdhR0000XName}
                    onChange={handleChange}
                    placeholder="Enter Country"
                    required
                    error={errors.rdhR0000XName}
                    disabled={isSaving}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="Currency"
                    name="currencyName"
                    value={formData.currencyName}
                    onChange={handleChange}
                    placeholder="Enter Currency"
                    required
                    error={errors.currencyName}
                    disabled={isSaving}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="Short Name"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleChange}
                    placeholder="Enter Short Name"
                    required
                    error={errors.shortName}
                    disabled={isSaving}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="Currency Notation"
                    name="currencyNotation"
                    value={formData.currencyNotation}
                    onChange={handleChange}
                    placeholder="Enter Currency Notation"
                    required
                    error={errors.currencyNotation}
                    disabled={isSaving}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="Nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    placeholder="Enter Nationality"
                    required
                    error={errors.nationality}
                    disabled={isSaving}
                  />
                </div>

                <div className="hrms-form-group country-default-group d-flex">
                  <FormCheckbox
                    label="Default"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleDefaultChange}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hrms-form-section-footer">
            <FormButton
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={isSaving}
            >
              Reset
            </FormButton>

            <FormButton
              type="submit"
              variant="primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : isEdit ? "Update" : "Save"}
            </FormButton>
          </div>
        </form>
      </div>
    </>
  );
};

export default Country;