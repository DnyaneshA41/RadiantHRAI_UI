
import React, { useState, useCallback,useEffect,} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiList } from "react-icons/fi";
import {LuListChecks} from "react-icons/lu"

import FormInput from "../../../../../src/common/components/Form/FormInput";
import FormButton from "../../../../common/components/Form/FormButton";
import Toast from "../../../../common/components/Popups/Toast";

import { createDepartmentApi } from "../../services/departmentApi";
import { mapDepartmentToApi } from "../../mappers/DepartmentMapper";
import { departmentSchema } from "../../validations/DepartmentSchema";

import { updateDepartmentApi } from "../../services/DepartmentList.js";

const initialFormData = {
  rdhR0000XIName: "",
};

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (data?.errors) {
    const messages = Object.values(data.errors).flat();

    if (messages.length) {
      return messages.join(" ");
    }
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

const Department = ({ onSave }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const employeeName =
    localStorage.getItem("employeeName") || "";

  const sourceID =
    localStorage.getItem("sourceID") || "";

  // =====================================================
  // EDIT MODE
  // =====================================================

  const isEdit =
    location.state?.mode === "edit" ||
    location.state?.isEdit === true;

  const selectedDepartment =
    location.state?.department || null;

  const encryptedId =
    location.state?.encryptedId ||
    selectedDepartment?.encryptedId ||
    "";

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // =====================================================
  // POPULATE FORM FOR EDIT
  // =====================================================

  useEffect(() => {
    if (isEdit && selectedDepartment) {
      setFormData({
        rdhR0000XIName:
          selectedDepartment.rdhR0000XIName ||
          selectedDepartment.RDHR0000XIName ||
          selectedDepartment.departmentName ||
          selectedDepartment.DepartmentName ||
          "",
      });
    } else {
      setFormData(initialFormData);
    }

    setErrors({});
  }, [isEdit, selectedDepartment]);

  // =====================================================
  // TOAST HELPERS
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
  // HANDLE FIELD CHANGE
  // =====================================================

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

  // =====================================================
  // CANCEL / RESET
  // =====================================================

  const handleReset = () => {
    if (isSaving) return;

    if (isEdit && selectedDepartment) {
      setFormData({
        rdhR0000XIName:
          selectedDepartment.rdhR0000XIName ||
          selectedDepartment.RDHR0000XIName ||
          selectedDepartment.departmentName ||
          selectedDepartment.DepartmentName ||
          "",
      });
    } else {
      setFormData(initialFormData);
    }

    setErrors({});
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    const normalizedData = {
      ...formData,
      rdhR0000XIName:
        formData.rdhR0000XIName.trim(),
    };

    const result =
      departmentSchema.safeParse(normalizedData);

    if (!result.success) {
      const validationErrors = {};

      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];

        if (
          fieldName &&
          !validationErrors[fieldName]
        ) {
          validationErrors[fieldName] = issue.message;
        }
      });

      setErrors(validationErrors);

      return {
        success: false,
        data: null,
      };
    }

    setErrors({});

    return {
      success: true,
      data: result.data,
    };
  };

  // =====================================================
  // SAVE DEPARTMENT
  // CREATE: POST /Department/CreateDepartment
  // UPDATE: PATCH /Department/UpdateDepartment/{EncryptedId}
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    const validation = validateForm();

    if (!validation.success) {
      showToast(
        "Please enter a valid Department Name.",
        "error",
        3000
      );

      return;
    }

    if (isEdit && !encryptedId) {
      showToast(
        "Encrypted Department ID is missing. Please return to the list and try again.",
        "error",
        5000
      );

      return;
    }

    setIsSaving(true);

    try {
      const departmentData = {
        ...validation.data,
        isDeactivated: false,
        createdByUser: employeeName,
        createdDate: new Date().toISOString(),
        sourceID: String(sourceID),
      };

      const payload = mapDepartmentToApi(departmentData);

      console.log(
        isEdit
          ? "Department update payload:"
          : "Department create payload:",
        payload
      );

      let response;

      if (isEdit) {
        // Use the existing encrypted ID for the update request.
        response = await updateDepartmentApi(
          encryptedId,
          payload
        );
      } else {
        response = await createDepartmentApi(payload);
      }

      
      showToast(
        response?.message ||
          response?.Message ||
          (isEdit
            ? "Department updated successfully."
            : "Department created successfully."),
        "success",
        3000
      );

      if (typeof onSave === "function") {
        await onSave(response, payload);
      }

      if (isEdit) {
        // Stay on this page so the update toast remains visible.
        setFormData({
          rdhR0000XIName:
            validation.data.rdhR0000XIName,
        });
      } else {
        setFormData(initialFormData);
        setErrors({});
      }

    } catch (error) {
      console.error(
        isEdit
          ? "Failed to update Department:"
          : "Failed to create Department:",
        {
          status: error?.response?.status,
          responseData: error?.response?.data,
          requestUrl: error?.config?.url,
          requestMethod: error?.config?.method,
          requestPayload: error?.config?.data,
          fullError: error,
        }
      );

      showToast(
        getErrorMessage(
          error,
          isEdit
            ? "Failed to update Department. Please try again."
            : "Failed to create Department. Please try again."
        ),
        "error",
        5000
      );
    } finally {
      setIsSaving(false);
    }
  };

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

      <div className="hrms-form-container department-page">
        <form
          className="department-form"
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
                  Department Details
                </h3>

                <p className="hrms-form-section-description">
                  {isEdit
                    ? "Update the department information below."
                    : "Enter the department information below."}
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-group">
                <FormInput
                  label="Department Name"
                  name="rdhR0000XIName"
                  value={formData.rdhR0000XIName}
                  onChange={handleChange}
                  placeholder="Enter Department Name"
                  required
                  error={errors.rdhR0000XIName}
                  disabled={isSaving}
                />
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
              Cancel
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

export default Department;
