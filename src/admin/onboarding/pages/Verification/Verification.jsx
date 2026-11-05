
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useLocation } from "react-router-dom";
import { FiList } from "react-icons/fi";

import FormCheckbox from "../../../../../src/common/components/Form/FormCheckbox";
import FormInput from "../../../../../src/common/components/Form/FormInput";
import FormButton from "../../../../common/components/Form/FormButton";
import Toast from "../../../../common/components/Popups/Toast";

import {
  createVerification,
  updateVerification,
} from "../../services/VerificationApi.js";

import {
  initialVerificationFormData,
  mapVerificationFormData,
  toVerificationDto,
  getApiErrorMessage,
} from "../../mappers/VerificationMapper.js";

const Verification = ({ onSave }) => {
  const location = useLocation();

  const employeeName = localStorage.getItem("employeeName") || "";
  const sourceID = localStorage.getItem("sourceID") || "";

  const isEdit =
    location.state?.mode === "edit" ||
    location.state?.isEdit === true;

  const selectedVerification =
    location.state?.verification || null;

  const encryptedId =
    location.state?.encryptedId ||
    selectedVerification?.encryptedId ||
    selectedVerification?.EncryptedId ||
    selectedVerification?.rdhR0000IXID_Encrypted ||
    "";

  const [formData, setFormData] = useState({
    ...initialVerificationFormData,
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

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

  useEffect(() => {
    setFormData(
      isEdit && selectedVerification
        ? mapVerificationFormData(selectedVerification)
        : { ...initialVerificationFormData }
    );

    setErrors({});
  }, [isEdit, selectedVerification]);

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

  // Supports FormCheckbox implementations that return
  // either the original event or the checked Boolean.
  const handleMandatoryChange = (valueOrEvent) => {
    const checked =
      typeof valueOrEvent === "boolean"
        ? valueOrEvent
        : Boolean(valueOrEvent?.target?.checked);

    setFormData((previous) => ({
      ...previous,
      isMandatory: checked,
    }));
  };

  const handleReset = () => {
    if (isSaving) return;

    setFormData(
      isEdit && selectedVerification
        ? mapVerificationFormData(selectedVerification)
        : { ...initialVerificationFormData }
    );

    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    const normalizedName = formData.verificationName.trim();

    if (!normalizedName) {
      setErrors({
        verificationName: "Verification Name is required.",
      });

      showToast(
        "Please enter a Verification Name.",
        "error"
      );

      return;
    }

    if (isEdit && !encryptedId) {
      showToast(
        "Encrypted Verification ID is missing. Please return to the list and try again.",
        "error",
        5000
      );

      return;
    }

    setIsSaving(true);

    const dto = toVerificationDto(
      {
        verificationName: normalizedName,
        isMandatory: Boolean(formData.isMandatory),
      },
      {
        employeeName,
        sourceID,
      },
      isEdit ? selectedVerification : null
    );

    try {
      const response = isEdit
        ? await updateVerification(encryptedId, dto)
        : await createVerification(dto);

      showToast(
        response?.message ||
          response?.Message ||
          (isEdit
            ? "Verification updated successfully."
            : "Verification created successfully."),
        "success"
      );

      if (typeof onSave === "function") {
        await onSave(
          response,
          isEdit ? { encryptedId, dto } : dto
        );
      }

      if (isEdit) {
        setFormData({
          verificationName: normalizedName,
          isMandatory: Boolean(formData.isMandatory),
        });
      } else {
        setFormData({
          ...initialVerificationFormData,
        });
      }

      setErrors({});
    } catch (error) {
      console.error(
        isEdit
          ? "Failed to update Verification:"
          : "Failed to create Verification:",
        {
          status: error?.response?.status,
          responseData: error?.response?.data,
          requestUrl: error?.config?.url,
          requestMethod: error?.config?.method,
        }
      );

      showToast(
        getApiErrorMessage(
          error,
          isEdit
            ? "Failed to update Verification. Please try again."
            : "Failed to create Verification. Please try again."
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

      <div className="hrms-form-container verification-page">
        <form
          className="verification-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon">
                <FiList size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Verification Details
                </h3>

                <p className="hrms-form-section-description">
                  {isEdit
                    ? "Update the verification information below."
                    : "Enter the verification information below."}
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormInput
                    label="Verification Name"
                    name="verificationName"
                    value={formData.verificationName}
                    onChange={handleChange}
                    placeholder="Enter Verification Name"
                    required
                    error={errors.verificationName}
                    disabled={isSaving}
                  />
                </div>

                <div className="hrms-form-group d-flex mt-4">
                  <FormCheckbox
                    label="Mandatory"
                    name="isMandatory"
                    checked={formData.isMandatory}
                    onChange={handleMandatoryChange}
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
              {isSaving
                ? "Saving..."
                : isEdit
                  ? "Update"
                  : "Save"}
            </FormButton>
          </div>
        </form>
      </div>
    </>
  );
};

export default Verification;
