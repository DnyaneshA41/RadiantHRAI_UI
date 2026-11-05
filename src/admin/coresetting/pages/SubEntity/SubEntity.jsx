
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import FormInput from "../../../../../src/common/components/Form/FormInput";
import FormSelect from "../../../../../src/common/components/Form/FormSelect";
import FormCheckbox from "../../../../../src/common/components/Form/FormCheckbox";
import FormButton from "../../../../../src/common/components/Form/FormButton";

import Toast from "../../../../common/components/Popups/Toast";
import axiosClientModule from "../../../../api/axiosClientModule";
import useAuthStore from "../../../../auth/store/authStore";

import { FiList } from "react-icons/fi";

import {
  createSubEntityApi,
  updateSubEntityApi,
} from "../../services/SubEntityApi";

// =====================================================
// EXTRACT API ARRAY
// =====================================================

const extractArray = (response) => {
  const body = response?.data;

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.Data)) return body.Data;
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body?.Result)) return body.Result;
  if (Array.isArray(body?.entities)) return body.entities;
  if (Array.isArray(body?.Entities)) return body.Entities;
  if (Array.isArray(body?.organizations)) return body.organizations;
  if (Array.isArray(body?.Organizations)) return body.Organizations;

  return [];
};

// =====================================================
// ORGANIZATION MAPPING
// =====================================================

const mapOrganization = (organization) => ({
  id:
    organization.rdhR0000IID ??
    organization.RDHR0000IID ??
    organization.organizationId ??
    organization.id ??
    "",

  name:
    organization.rdhR0000IName ??
    organization.RDHR0000IName ??
    organization.organizationName ??
    organization.name ??
    "",
});

// =====================================================
// ENTITY MAPPING
// =====================================================

const mapEntity = (entity) => ({
  id:
    entity.rdhR0000IIID ??
    entity.RDHR0000IIID ??
    entity.entityId ??
    entity.id ??
    "",

  organizationId:
    entity.rdhR0000IID ??
    entity.RDHR0000IID ??
    entity.organizationId ??
    "",

  name:
    entity.rdhR0000IIName ??
    entity.RDHR0000IIName ??
    entity.entityName ??
    entity.name ??
    "",
});

// =====================================================
// ERROR MESSAGE
// =====================================================

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;

  if (typeof data === "string") return data;

  if (data?.errors) {
    const messages = Object.values(data.errors).flat();

    if (messages.length) {
      return messages.join(" ");
    }
  }

  return (
    data?.message ||
    data?.Message ||
    data?.title ||
    fallback
  );
};

// =====================================================
// MAP EDIT RECORD
// =====================================================

const mapSubEntityToForm = (item) => ({
  organizationId: String(
    item?.rdhR0000IID ??
    item?.RDHR0000IID ??
    item?.organizationId ??
    ""
  ),

  entityId: String(
    item?.rdhR0000IIID ??
    item?.RDHR0000IIID ??
    item?.entityId ??
    ""
  ),

  subEntityName:
    item?.rdhR0000IIIName ??
    item?.RDHR0000IIIName ??
    item?.subEntityName ??
    item?.SubEntityName ??
    "",

  isDefault:
    item?.isDefault ??
    item?.IsDefault ??
    false,
});

// =====================================================
// SUB ENTITY FORM
// =====================================================

export default function SubEntity({ onSave }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Logged-in user details
// Logged-in user details from localStorage
const employeeName =
  localStorage.getItem("employeeName") || "";

const sourceID =
  localStorage.getItem("sourceID") || "";

  // Edit mode navigation state
  const navigationState = location.state || {};

  const isEditMode = navigationState.mode === "edit";

  const encryptedId =
    navigationState.encryptedId ||
    navigationState.subEntity?.encryptedId ||
    navigationState.subEntity?.rdhR0000IIIID_Encrypted ||
    navigationState.subEntity?.RDHR0000IIIID_Encrypted ||
    "";

  const selectedSubEntity = navigationState.subEntity || null;

  // ===================================================
  // STATE
  // ===================================================

  const [organizations, setOrganizations] = useState([]);
  const [entities, setEntities] = useState([]);

  const [loadingOrganizations, setLoadingOrganizations] =
    useState(false);

  const [loadingEntities, setLoadingEntities] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    organizationId: "",
    entityId: "",
    subEntityName: "",
    isDefault: false,
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // ===================================================
  // TOAST HELPERS
  // ===================================================

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

  // ===================================================
  // FETCH ORGANIZATIONS
  // ===================================================

  const fetchOrganizations = useCallback(async () => {
    setLoadingOrganizations(true);

    try {
      const response = await axiosClientModule.get(
        "/Organization/GetOrganisationList"
      );

      const records = extractArray(response);

      setOrganizations(records.map(mapOrganization));
    } catch (err) {
      console.error(
        "Failed to fetch organizations:",
        err.response?.data || err.message
      );

      setOrganizations([]);

      showToast(
        getErrorMessage(
          err,
          "Unable to load organizations."
        ),
        "error",
        4000
      );
    } finally {
      setLoadingOrganizations(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // ===================================================
  // FETCH ENTITIES FOR SELECTED ORGANIZATION
  // ===================================================

  const fetchEntities = useCallback(
    async (organizationId, selectedEntityId = "") => {
      if (!organizationId) {
        setEntities([]);
        return;
      }

      setLoadingEntities(true);

      try {
        const response = await axiosClientModule.get(
          "/Entity/GetAllEntity"
        );

        const records = extractArray(response).map(mapEntity);

        const filteredEntities = records.filter(
          (entity) =>
            String(entity.organizationId) ===
            String(organizationId)
        );

        setEntities(filteredEntities);

        // Restore entity selection when loading edit data.
        if (selectedEntityId) {
          const entityExists = filteredEntities.some(
            (entity) =>
              String(entity.id) === String(selectedEntityId)
          );

          if (entityExists) {
            setFormData((previous) => ({
              ...previous,
              entityId: String(selectedEntityId),
            }));
          } else {
            setErrors((previous) => ({
              ...previous,
              entityId:
                "The saved entity was not found for this organization.",
            }));
          }
        }
      } catch (err) {
        console.error(
          "Failed to fetch entities:",
          err.response?.data || err.message
        );

        setEntities([]);

        showToast(
          getErrorMessage(
            err,
            "Unable to load entities."
          ),
          "error",
          4000
        );
      } finally {
        setLoadingEntities(false);
      }
    },
    [showToast]
  );

  // ===================================================
  // INITIALIZE EDIT FORM
  // ===================================================

  useEffect(() => {
    if (!isEditMode || !selectedSubEntity) return;

    const mapped = mapSubEntityToForm(selectedSubEntity);

    setFormData(mapped);

    if (mapped.organizationId) {
      fetchEntities(
        mapped.organizationId,
        mapped.entityId
      );
    }
  }, [
    isEditMode,
    selectedSubEntity,
    fetchEntities,
  ]);

  // ===================================================
  // HANDLE ORGANIZATION CHANGE
  // ===================================================

  const handleOrganizationChange = (event) => {
    const organizationId = event.target.value;

    setFormData((previous) => ({
      ...previous,
      organizationId,
      entityId: "",
    }));

    setEntities([]);

    setErrors((previous) => ({
      ...previous,
      organizationId: "",
      entityId: "",
    }));

    if (organizationId) {
      fetchEntities(organizationId);
    }
  };

  // ===================================================
  // HANDLE FIELD CHANGE
  // ===================================================

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    const fieldValue =
      type === "checkbox" ? checked : value;

    setFormData((previous) => ({
      ...previous,
      [name]: fieldValue,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // ===================================================
  // VALIDATION
  // ===================================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organizationId) {
      newErrors.organizationId =
        "Organization is required.";
    }

    if (!formData.entityId) {
      newErrors.entityId =
        "Entity Name is required.";
    }

    if (!formData.subEntityName.trim()) {
      newErrors.subEntityName =
        "Sub Entity Name is required.";
    } else if (formData.subEntityName.trim().length > 200) {
      newErrors.subEntityName =
        "Sub Entity Name cannot exceed 200 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ===================================================
  // RESET FORM
  // ===================================================

  const resetForm = () => {
    setFormData({
      organizationId: "",
      entityId: "",
      subEntityName: "",
      isDefault: false,
    });

    setEntities([]);
    setErrors({});
  };

  // ===================================================
  // SAVE SUB ENTITY
  // CREATE: POST /SubEntity/CreateSubEntity
  // UPDATE: PATCH /SubEntity/UpdateSubEntity/{EncryptedId}
  // ===================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!validateForm()) {
      showToast(
        "Please fill in all mandatory fields.",
        "error",
        3000
      );
      return;
    }

    const organizationId = Number(formData.organizationId);
    const entityId = Number(formData.entityId);

    if (
      !Number.isInteger(organizationId) ||
      organizationId <= 0
    ) {
      showToast(
        "Please select a valid organization.",
        "error"
      );
      return;
    }

    if (!Number.isInteger(entityId) || entityId <= 0) {
      showToast(
        "Please select a valid entity.",
        "error"
      );
      return;
    }

    if (isEditMode && !encryptedId) {
      showToast(
        "Encrypted Sub Entity ID is missing. Cannot update this record.",
        "error",
        4000
      );
      return;
    }

console.log("Employee name:", employeeName);
console.log("Source ID:", sourceID);

  const dto = {
  isDeactivated: false,
  createdByUser: employeeName,
  createdDate: new Date().toISOString(),
  sourceID: String(sourceID),
  rdhR0000IID: Number(organizationId),
  rdhR0000IIID: Number(entityId),
  rdhR0000IIIName: formData.subEntityName.trim(),
  isDefault: Boolean(formData.isDefault),
};

    setSaving(true);

 
try {
  let response;

  if (isEditMode) {
    response = await updateSubEntityApi(
      encryptedId,
      dto
    );
  } else {
    response = await createSubEntityApi(dto);
  }

  // Show success toast
  showToast(
    isEditMode
      ? "Sub Entity updated successfully."
      : "Sub Entity created successfully.",
    "success",
    3000
  );

  // Notify parent component if provided
  if (typeof onSave === "function") {
    onSave(response);
  }

  // Stay on the same page after update
  if (!isEditMode) {
    resetForm();
  }

} catch (err) {
  console.error(
    `Failed to ${isEditMode ? "update" : "create"} Sub Entity`,
    {
      status: err.response?.status,
      responseData: err.response?.data,
      responseHeaders: err.response?.headers,
      requestUrl: err.config?.url,
      requestMethod: err.config?.method,
      requestPayload: err.config?.data,
      fullError: err,
    }
  );

  const apiMessage =
    err.response?.data?.message ||
    err.response?.data?.Message ||
    err.response?.data?.title ||
    err.response?.data?.detail ||
    err.message ||
    `Failed to ${isEditMode ? "update" : "create"} Sub Entity.`;

  showToast(apiMessage, "error", 4000);

} finally {
  setSaving(false);
}

  };

  // ===================================================
  // CANCEL / LIST
  // ===================================================

  const handleList = () => {
    navigate("/admin/coresettings/subentity/list");
  };


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

      <div className="hrms-form-container organization-page">
        <form
          className="organization-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* FORM HEADER */}

          {/* <div className="form-header">
            <h2>
              Sub Entity - {isEditMode ? "Edit" : "Add"}
            </h2>
          </div> */}

          {/* SUB ENTITY DETAILS */}

          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon">
                              <FiList size={19} />
                            </div>
              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Sub Entity Details
                </h3>

                <p className="hrms-form-section-description">
                  Select the organization and entity, then provide the sub entity details.
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                {/* ORGANIZATION */}

                <div className="hrms-form-group">
                  <FormSelect
                    label="Organization"
                    name="organizationId"
                    value={formData.organizationId}
                    onChange={handleOrganizationChange}
                    required
                    disabled={
                      loadingOrganizations || saving
                    }
                    options={[
                    
                      ...organizations.map((organization) => ({
                        value: String(organization.id),
                        label: organization.name,
                      })),
                    ]}
                    error={errors.organizationId}
                  />
                </div>

                {/* ENTITY */}

                <div className="hrms-form-group">
                  <FormSelect
                    label="Entity Name"
                    name="entityId"
                    value={formData.entityId}
                    onChange={handleChange}
                    required
                    disabled={
                      !formData.organizationId ||
                      loadingEntities ||
                      saving
                    }
                    options={[
                  
                      ...entities.map((entity) => ({
                        value: String(entity.id),
                        label: entity.name,
                      })),
                    ]}
                    error={errors.entityId}
                  />
                </div>

                {/* SUB ENTITY NAME */}

                <div className="hrms-form-group">
                  <FormInput
                    label="Sub Entity Name"
                    name="subEntityName"
                    value={formData.subEntityName}
                    onChange={handleChange}
                    placeholder="Enter Sub Entity Name"
                    required
                    maxLength={200}
                    disabled={saving}
                    error={errors.subEntityName}
                  />
                </div>
              </div>

              {/* DEFAULT */}

              <div className="organization-checkbox-grid">
                <div className="organization-checkbox-field">
                  <FormCheckbox
                    label="Default"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FORM BUTTONS */}

          <div className="hrms-form-section-footer">
           

            <FormButton
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                  ? "Update"
                  : "Save"}
            </FormButton>

            <FormButton
              type="button"
              variant="secondary"
              onClick={handleList}
              disabled={saving}
            >
              List
            </FormButton>
          </div>
        </form>
      </div>
    </>
  );
}
