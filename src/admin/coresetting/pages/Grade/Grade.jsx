import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiList } from "react-icons/fi";

import FormInput from "../../../../../src/common/components/Form/FormInput";
import FormButton from "../../../../common/components/Form/FormButton";
import Toast from "../../../../common/components/Popups/Toast";
import axiosClientModule from "../../../../api/axiosClientModule";

const initialFormData = {
  rdhR0000XVIIName: "",
  rdhR0000XVIIDescription: "",
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

const Grade = ({ onSave }) => {
  const location = useLocation();

  const employeeName = localStorage.getItem("employeeName") || "";
  const sourceID = localStorage.getItem("sourceID") || "";

  const isEdit =
    location.state?.mode === "edit" ||
    location.state?.isEdit === true;

  const selectedGrade = location.state?.grade || null;

  const encryptedId =
    location.state?.encryptedId ||
    selectedGrade?.encryptedId ||
    selectedGrade?.EncryptedId ||
    "";

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    setToast({ id: Date.now(), message, type, duration });
  }, []);

  const handleToastClose = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (isEdit && selectedGrade) {
      setFormData({
        rdhR0000XVIIName:
          selectedGrade.rdhR0000XVIIName ||
          selectedGrade.RDHR0000XVIIName ||
          selectedGrade.gradeName ||
          selectedGrade.GradeName ||
          "",
        rdhR0000XVIIDescription:
          selectedGrade.rdhR0000XVIIDescription ||
          selectedGrade.RDHR0000XVIIDescription ||
          selectedGrade.gradeDescription ||
          selectedGrade.GradeDescription ||
          "",
      });
    } else {
      setFormData(initialFormData);
    }

    setErrors({});
  }, [isEdit, selectedGrade]);

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

  const handleReset = () => {
    if (isSaving) return;

    if (isEdit && selectedGrade) {
      setFormData({
        rdhR0000XVIIName:
          selectedGrade.rdhR0000XVIIName ||
          selectedGrade.RDHR0000XVIIName ||
          selectedGrade.gradeName ||
          selectedGrade.GradeName ||
          "",
        rdhR0000XVIIDescription:
          selectedGrade.rdhR0000XVIIDescription ||
          selectedGrade.RDHR0000XVIIDescription ||
          selectedGrade.gradeDescription ||
          selectedGrade.GradeDescription ||
          "",
      });
    } else {
      setFormData(initialFormData);
    }

    setErrors({});
  };

  const validateForm = () => {
    const normalizedData = {
      rdhR0000XVIIName: formData.rdhR0000XVIIName.trim(),
      rdhR0000XVIIDescription: formData.rdhR0000XVIIDescription.trim(),
    };

    const validationErrors = {};

    if (!normalizedData.rdhR0000XVIIName) {
      validationErrors.rdhR0000XVIIName = "Grade Name is required.";
    } else if (normalizedData.rdhR0000XVIIName.length > 100) {
      validationErrors.rdhR0000XVIIName =
        "Grade Name cannot exceed 100 characters.";
    }

    if (normalizedData.rdhR0000XVIIDescription.length > 500) {
      validationErrors.rdhR0000XVIIDescription =
        "Grade Description cannot exceed 500 characters.";
    }

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
      showToast("Please correct the validation errors.", "error");
      return;
    }

    if (isEdit && !encryptedId) {
      showToast(
        "Encrypted Grade ID is missing. Please return to the list and try again.",
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
      rdhR0000XVIIName: validation.data.rdhR0000XVIIName,
      rdhR0000XVIIDescription:
        validation.data.rdhR0000XVIIDescription,
    };

    try {
      let response;

      if (isEdit) {
        const payload = {
          encryptedId,
          dto,
        };

        const result = await axiosClientModule.patch(
          `/Grade/UpdateGrade/${encodeURIComponent(encryptedId)}`,
          payload
        );

        response = result.data;
      } else {
        const result = await axiosClientModule.post(
          "/Grade/CreateGrade",
          dto
        );

        response = result.data;
      }

      showToast(
        response?.message ||
          response?.Message ||
          (isEdit
            ? "Grade updated successfully."
            : "Grade created successfully."),
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
        isEdit ? "Failed to update Grade:" : "Failed to create Grade:",
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
            ? "Failed to update Grade. Please try again."
            : "Failed to create Grade. Please try again."
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

      <div className="hrms-form-container grade-page">
        <form className="grade-form" onSubmit={handleSubmit} noValidate>
          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon">
                <FiList size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Grade Details
                </h3>

                <p className="hrms-form-section-description">
                  {isEdit
                    ? "Update the grade information below."
                    : "Enter the grade information below."}
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
                <div className="hrms-form-row-3">
              <div className="hrms-form-group ">
                <FormInput
                  label="Grade Name"
                  name="rdhR0000XVIIName"
                  value={formData.rdhR0000XVIIName}
                  onChange={handleChange}
                  placeholder="Enter Grade Name"
                  required
                  error={errors.rdhR0000XVIIName}
                  disabled={isSaving}
                />
              </div>

              <div className="hrms-form-group">
                <FormInput
                  label="Grade Description"
                  name="rdhR0000XVIIDescription"
                  value={formData.rdhR0000XVIIDescription}
                  onChange={handleChange}
                  placeholder="Enter Grade Description"
                  error={errors.rdhR0000XVIIDescription}
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

export default Grade;