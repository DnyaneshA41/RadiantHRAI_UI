// Level.jsx

import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiList } from "react-icons/fi";

import FormInput from "../../../../../src/common/components/Form/FormInput";
import FormButton from "../../../../common/components/Form/FormButton";
import Toast from "../../../../common/components/Popups/Toast";

import {
  createLevel,
  updateLevel,
} from "../../services/LevelApi.js";

import {
  initialLevelFormData,
  mapLevelFormData,
  toLevelDto,
  getApiErrorMessage,
} from "../../mappers/LevelMapper.js";

const Level = ({ onSave }) => {
  const location = useLocation();

  const employeeName = localStorage.getItem("employeeName") || "";
  const sourceID = localStorage.getItem("sourceID") || "";

  const isEdit =
    location.state?.mode === "edit" ||
    location.state?.isEdit === true;

  const selectedLevel = location.state?.level || null;

  const encryptedId =
    location.state?.encryptedId ||
    selectedLevel?.encryptedId ||
    selectedLevel?.EncryptedId ||
    selectedLevel?.rdhR0000XVIID_Encrypted ||
    "";

  const [formData, setFormData] = useState(initialLevelFormData);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    (message, type = "info", duration = 3000) => {
      setToast({ id: Date.now(), message, type, duration });
    },
    []
  );

  const handleToastClose = useCallback(() => setToast(null), []);

  useEffect(() => {
    setFormData(
      isEdit && selectedLevel
        ? mapLevelFormData(selectedLevel)
        : { ...initialLevelFormData }
    );

    setErrors({});
  }, [isEdit, selectedLevel]);

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

    setFormData(
      isEdit && selectedLevel
        ? mapLevelFormData(selectedLevel)
        : { ...initialLevelFormData }
    );

    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    const normalizedName = formData.rdhR0000XVIName.trim();
    const normalizedDescription = formData.description.trim();

    const validationErrors = {};

    if (!normalizedName) {
      validationErrors.rdhR0000XVIName = "Level Name is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("Please enter the required Level Name.", "error");
      return;
    }

    if (isEdit && !encryptedId) {
      showToast(
        "Encrypted Level ID is missing. Please return to the list and try again.",
        "error",
        5000
      );
      return;
    }

    setIsSaving(true);

    const dto = toLevelDto(
      {
        rdhR0000XVIName: normalizedName,
        description: normalizedDescription,
      },
      { employeeName, sourceID },
      isEdit ? selectedLevel : null
    );

    try {
      const response = isEdit
        ? await updateLevel(encryptedId, dto)
        : await createLevel(dto);

      showToast(
        response?.message ||
          response?.Message ||
          (isEdit
            ? "Level updated successfully."
            : "Level created successfully."),
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
          rdhR0000XVIName: normalizedName,
          description: normalizedDescription,
        });
      } else {
        setFormData({ ...initialLevelFormData });
      }

      setErrors({});
    } catch (error) {
      console.error(
        isEdit ? "Failed to update Level:" : "Failed to create Level:",
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
            ? "Failed to update Level. Please try again."
            : "Failed to create Level. Please try again."
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

      <div className="hrms-form-container level-page">
        <form
          className="level-form"
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
                  Level Details
                </h3>

                <p className="hrms-form-section-description">
                  {isEdit
                    ? "Update the level information below."
                    : "Enter the level information below."}
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
  <div className="hrms-form-row-3">
    <div className="hrms-form-group">
      <FormInput
        label="Level Name"
        name="rdhR0000XVIName"
        value={formData.rdhR0000XVIName}
        onChange={handleChange}
        placeholder="Enter Level Name"
        required
        error={errors.rdhR0000XVIName}
        disabled={isSaving}
      />
    </div>

    <div className="hrms-form-group">
      <FormInput
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Enter Description"
        error={errors.description}
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

export default Level;