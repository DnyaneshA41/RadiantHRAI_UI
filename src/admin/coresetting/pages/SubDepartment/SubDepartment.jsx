
import React, {
  useState,
  useCallback,
  useEffect,
} from "react";
import { useLocation } from "react-router-dom";
import { FiLayers } from "react-icons/fi";

import FormInput from "../../../../../src/common/components/Form/FormInput";
import FormSelect from "../../../../common/components/Form/FormSelect.jsx";
import FormButton from "../../../../common/components/Form/FormButton";
import Toast from "../../../../common/components/Popups/Toast";

import {
  createSubDepartmentApi,
  updateSubDepartmentApi,
  getDepartmentListApi,
} from "../../services/SubDepartmentApi.js";

// =====================================================
// INITIAL FORM DATA
// =====================================================

const initialFormData = {
  rdhR0000XVName: "",
  rdhR0000XIId: "",
};

// =====================================================
// ERROR MESSAGE HELPER
// =====================================================

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

// =====================================================
// EXTRACT ARRAY FROM API RESPONSE
// =====================================================

const extractArray = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.Data,
    response?.result,
    response?.Result,
    response?.departments,
    response?.Departments,
    response?.departmentList,
    response?.DepartmentList,
    response?.data?.data,
    response?.data?.Data,
    response?.data?.result,
    response?.data?.Result,
    response?.result?.data,
    response?.Result?.Data,
  ];

  return candidates.find(Array.isArray) || [];
};

// =====================================================
// DEPARTMENT FIELD HELPERS
// =====================================================

const getDepartmentId = (item) =>
  item?.rdhR0000XIID ??
  item?.RDHR0000XIID ??
  item?.rdhR0000XIId ??
  item?.RDHR0000XIId ??
  item?.departmentId ??
  item?.DepartmentId ??
  item?.id ??
  item?.Id ??
  "";

const getDepartmentName = (item) =>
  item?.rdhR0000XIName ??
  item?.RDHR0000XIName ??
  item?.rdhR0000XIIN ??
  item?.departmentName ??
  item?.DepartmentName ??
  item?.name ??
  item?.Name ??
  "";

// =====================================================
// SUBDEPARTMENT COMPONENT
// =====================================================

const SubDepartment = ({ onSave }) => {
  const location = useLocation();

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

  const selectedSubDepartment =
    location.state?.subDepartment || null;

  const encryptedId =
    location.state?.encryptedId ||
    selectedSubDepartment?.encryptedId ||
    selectedSubDepartment?.EncryptedId ||
    "";

  // =====================================================
  // STATE
  // =====================================================

  const [formData, setFormData] = useState({
    ...initialFormData,
  });

  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] =
    useState(true);
  const [toast, setToast] = useState(null);

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
  // FETCH DEPARTMENTS
  // GET /Department/GetDepartmentList
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const fetchDepartments = async () => {
      setIsLoadingDepartments(true);

      try {
        const response = await getDepartmentListApi();
        const records = extractArray(response);

        const normalizedDepartments = records
          .map((item) => ({
            ...item,
            departmentId: getDepartmentId(item),
            departmentName: getDepartmentName(item),
          }))
          .filter(
            (item) =>
              item.departmentId !== "" &&
              item.departmentId !== null &&
              item.departmentId !== undefined &&
              String(item.departmentName).trim() !== ""
          );

        if (isMounted) {
          setDepartments(normalizedDepartments);
        }
      } catch (error) {
        console.error(
          "Failed to load departments:",
          error?.response?.data || error?.message
        );

        if (isMounted) {
          setDepartments([]);

          setErrors((previous) => ({
            ...previous,
            departmentLoad: getErrorMessage(
              error,
              "Unable to load departments."
            ),
          }));

          showToast(
            getErrorMessage(
              error,
              "Unable to load departments."
            ),
            "error",
            4000
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingDepartments(false);
        }
      }
    };

    fetchDepartments();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // =====================================================
  // DEPARTMENT DROPDOWN OPTIONS
  // =====================================================

  const departmentOptions = departments.map(
    (department) => ({
      value: String(department.departmentId),
      label: String(department.departmentName).trim(),
    })
  );

  // =====================================================
  // POPULATE FORM FOR EDIT
  // =====================================================

  useEffect(() => {
    if (isEdit && selectedSubDepartment) {
      setFormData({
        rdhR0000XVName:
          selectedSubDepartment.rdhR0000XVName ??
          selectedSubDepartment.RDHR0000XVName ??
          selectedSubDepartment.subDepartmentName ??
          selectedSubDepartment.SubDepartmentName ??
          "",

        rdhR0000XIId: String(
          selectedSubDepartment.rdhR0000XIId ??
          selectedSubDepartment.RDHR0000XIId ??
          selectedSubDepartment.rdhR0000XIID ??
          selectedSubDepartment.RDHR0000XIID ??
          selectedSubDepartment.departmentId ??
          selectedSubDepartment.DepartmentId ??
          ""
        ),
      });
    } else {
      setFormData({ ...initialFormData });
    }

    setErrors({});
  }, [isEdit, selectedSubDepartment]);

  // =====================================================
  // HANDLE INPUT CHANGE
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
      ...(name === "rdhR0000XIId"
        ? { departmentLoad: "" }
        : {}),
    }));
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const handleReset = () => {
    if (isSaving) return;

    if (isEdit && selectedSubDepartment) {
      setFormData({
        rdhR0000XVName:
          selectedSubDepartment.rdhR0000XVName ??
          selectedSubDepartment.RDHR0000XVName ??
          selectedSubDepartment.subDepartmentName ??
          selectedSubDepartment.SubDepartmentName ??
          "",

        rdhR0000XIId: String(
          selectedSubDepartment.rdhR0000XIId ??
          selectedSubDepartment.RDHR0000XIId ??
          selectedSubDepartment.rdhR0000XIID ??
          selectedSubDepartment.RDHR0000XIID ??
          selectedSubDepartment.departmentId ??
          selectedSubDepartment.DepartmentId ??
          ""
        ),
      });
    } else {
      setFormData({ ...initialFormData });
    }

    setErrors({});
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    const validationErrors = {};

    const subDepartmentName =
      formData.rdhR0000XVName.trim();

    if (!subDepartmentName) {
      validationErrors.rdhR0000XVName =
        "Subdepartment Name is required.";
    } else if (subDepartmentName.length > 100) {
      validationErrors.rdhR0000XVName =
        "Subdepartment Name cannot exceed 100 characters.";
    }

    if (!formData.rdhR0000XIId) {
      validationErrors.rdhR0000XIId =
        "Please select a Department.";
    } else if (
      !departments.some(
        (department) =>
          String(department.departmentId) ===
          String(formData.rdhR0000XIId)
      )
    ) {
      validationErrors.rdhR0000XIId =
        "Please select a valid Department.";
    }

    if (errors.departmentLoad) {
      validationErrors.departmentLoad =
        errors.departmentLoad;
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  // =====================================================
  // CREATE / UPDATE SUBDEPARTMENT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    if (isLoadingDepartments) {
      showToast(
        "Please wait while departments are loading.",
        "warning",
        3000
      );
      return;
    }

    if (isEdit && !encryptedId) {
      showToast(
        "Encrypted Subdepartment ID is missing. Please return to the list and try again.",
        "error",
        5000
      );
      return;
    }

    if (!validateForm()) {
      showToast(
        "Please complete the required fields correctly.",
        "error",
        3000
      );
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        isDeactivated: false,
        createdByUser: employeeName,
        createdDate: new Date().toISOString(),
        sourceID: String(sourceID),
        rdhR0000XVName:
          formData.rdhR0000XVName.trim(),
        rdhR0000XIId: Number(formData.rdhR0000XIId),
      };

      console.log(
        isEdit
          ? "Subdepartment update payload:"
          : "Subdepartment create payload:",
        payload
      );

      const response = isEdit
        ? await updateSubDepartmentApi(
            encryptedId,
            payload
          )
        : await createSubDepartmentApi(payload);

      showToast(
        response?.message ||
          response?.Message ||
          (isEdit
            ? "Subdepartment updated successfully."
            : "Subdepartment created successfully."),
        "success",
        3000
      );

      if (typeof onSave === "function") {
        await onSave(response, payload);
      }

      if (isEdit) {
        setFormData({
          rdhR0000XVName: payload.rdhR0000XVName,
          rdhR0000XIId: String(payload.rdhR0000XIId),
        });
      } else {
        setFormData({ ...initialFormData });
        setErrors({});
      }
    } catch (error) {
      console.error(
        isEdit
          ? "Failed to update subdepartment:"
          : "Failed to create subdepartment:",
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
            ? "Failed to update subdepartment. Please try again."
            : "Failed to create subdepartment. Please try again."
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
                <FiLayers size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Sub-Department Details
                </h3>

                <p className="hrms-form-section-description">
                  {isEdit
                    ? "Update the subdepartment information below."
                    : "Enter the subdepartment information below."}
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
  {/* DEPARTMENT DROPDOWN */}

                <div className="hrms-form-group">
                  <FormSelect
                    label="Department"
                    name="rdhR0000XIId"
                    value={formData.rdhR0000XIId}
                    onChange={handleChange}
                    options={departmentOptions}
                    error={errors.rdhR0000XIId}
                    disabled={
                      isLoadingDepartments || isSaving
                    }
                    required
                  />

                  {!isLoadingDepartments &&
                    departments.length === 0 &&
                    !errors.rdhR0000XIId && (
                      <p className="entity-image-error">
                        No departments found.
                      </p>
                    )}

                  {errors.departmentLoad && (
                    <p
                      className="entity-image-error"
                      role="alert"
                    >
                      {errors.departmentLoad}
                    </p>
                  )}
                </div>

                {/* SUBDEPARTMENT NAME */}

                <div className="hrms-form-group">
                  <FormInput
                    label="Sub-Department Name"
                    name="rdhR0000XVName"
                    value={formData.rdhR0000XVName}
                    onChange={handleChange}
                    placeholder="Enter Subdepartment Name"
                    required
                    error={errors.rdhR0000XVName}
                    disabled={isSaving}
                  />
                </div>

              
              </div>
            </div>
          </div>

          {/* FORM ACTIONS */}

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
              disabled={isSaving || isLoadingDepartments}
            >
              {isLoadingDepartments
                ? "Loading Departments..."
                : isSaving
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

export default SubDepartment;
