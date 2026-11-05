import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiList } from "react-icons/fi";

import FormInput from "../../../../../src/common/components/Form/FormInput";
import FormButton from "../../../../common/components/Form/FormButton";
import Toast from "../../../../common/components/Popups/Toast";
import { createType, updateType } from "../../services/TypeApi.js";
import {
  initialTypeFormData,
  mapTypeFormData,
  toTypeDto,
  getApiErrorMessage,
} from "../../mappers/TypeMapper.js";

const Type = ({ onSave }) => {
  const location = useLocation();
  const employeeName = localStorage.getItem("employeeName") || "";
  const sourceID = localStorage.getItem("sourceID") || "";

  const isEdit =
    location.state?.mode === "edit" ||
    location.state?.isEdit === true;
  const selectedType = location.state?.type || null;
  const encryptedId =
    location.state?.encryptedId ||
    selectedType?.encryptedId ||
    selectedType?.EncryptedId ||
    "";

  const [formData, setFormData] = useState(initialTypeFormData);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    setToast({ id: Date.now(), message, type, duration });
  }, []);

  const handleToastClose = useCallback(() => setToast(null), []);

  useEffect(() => {
    setFormData(isEdit && selectedType ? mapTypeFormData(selectedType) : initialTypeFormData);
    setErrors({});
  }, [isEdit, selectedType]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const handleReset = () => {
    if (!isSaving) {
      setFormData(isEdit && selectedType ? mapTypeFormData(selectedType) : initialTypeFormData);
      setErrors({});
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) return;

    const normalizedType = formData.rdhR0000XIXType.trim();
    if (!normalizedType) {
      setErrors({ rdhR0000XIXType: "Type is required." });
      showToast("Please enter a Type.", "error");
      return;
    }

    if (isEdit && !encryptedId) {
      showToast("Encrypted Type ID is missing. Please return to the list and try again.", "error", 5000);
      return;
    }

    setIsSaving(true);
    const dto = toTypeDto(
      { rdhR0000XIXType: normalizedType },
      { employeeName, sourceID }
    );

    try {
      const response = isEdit
        ? await updateType(encryptedId, dto)
        : await createType(dto);

      showToast(
        response?.message ||
          response?.Message ||
          (isEdit ? "Type updated successfully." : "Type created successfully."),
        "success"
      );

      if (typeof onSave === "function") {
        await onSave(response, isEdit ? { encryptedId, dto } : dto);
      }

      if (isEdit) {
        setFormData({ rdhR0000XIXType: normalizedType });
      } else {
        setFormData(initialTypeFormData);
      }
      setErrors({});
    } catch (error) {
      console.error(isEdit ? "Failed to update Type:" : "Failed to create Type:", {
        status: error?.response?.status,
        responseData: error?.response?.data,
        requestUrl: error?.config?.url,
        requestMethod: error?.config?.method,
      });
      showToast(
        getApiErrorMessage(
          error,
          isEdit ? "Failed to update Type. Please try again." : "Failed to create Type. Please try again."
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

      <div className="hrms-form-container type-page">
        <form className="type-form" onSubmit={handleSubmit} noValidate>
          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon"><FiList size={19} /></div>
              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">Type Details</h3>
                <p className="hrms-form-section-description">
                  {isEdit ? "Update the type information below." : "Enter the type information below."}
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormInput
                    label="Type"
                    name="rdhR0000XIXType"
                    value={formData.rdhR0000XIXType}
                    onChange={handleChange}
                    placeholder="Enter Type"
                    required
                    error={errors.rdhR0000XIXType}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hrms-form-section-footer">
            <FormButton type="button" variant="secondary" onClick={handleReset} disabled={isSaving}>
              Reset
            </FormButton>
            <FormButton type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Saving..." : isEdit ? "Update" : "Save"}
            </FormButton>
          </div>
        </form>
      </div>
    </>
  );
};

export default Type;
