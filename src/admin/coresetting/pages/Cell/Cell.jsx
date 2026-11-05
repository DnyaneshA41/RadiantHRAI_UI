
import React, { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FiBriefcase } from "react-icons/fi";

import FormInput from "../../../../../src/common/components/Form/FormInput";
import FormSelect from "../../../../../src/common/components/Form/FormSelect";
import FormCheckbox from "../../../../../src/common/components/Form/FormCheckbox";
import FormButton from "../../../../common/components/Form/FormButton";
import Toast from "../../../../common/components/Popups/Toast";
import axiosClientModule from "../../../../api/axiosClientModule";

const initialFormData = {
  rdhR0000IID: "",
  rdhR0000IIID: "",
  rdhR0000IIIName: "",
  isDefault: false,
};

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
  if (Array.isArray(body?.organisationList)) return body.organisationList;
  if (Array.isArray(body?.OrganisationList)) return body.OrganisationList;
  if (Array.isArray(body?.entityList)) return body.entityList;
  if (Array.isArray(body?.EntityList)) return body.EntityList;

  return [];
};

const firstValue = (item, keys, fallback = "") => {
  for (const key of keys) {
    if (
      item?.[key] !== undefined &&
      item?.[key] !== null &&
      item?.[key] !== ""
    ) {
      return item[key];
    }
  }

  return fallback;
};

const mapOrganization = (organization) => ({
  ...organization,
  id: firstValue(organization, [
    "rdhR0000IID",
    "RDHR0000IID",
    "rdhR0000IId",
    "RDHR0000IId",
    "organizationId",
    "OrganizationId",
    "id",
    "Id",
  ]),
  name: firstValue(organization, [
    "rdhR0000IName",
    "RDHR0000IName",
    "organizationName",
    "OrganizationName",
    "name",
    "Name",
  ]),
});

const mapEntity = (entity) => ({
  ...entity,
  id: firstValue(entity, [
    "rdhR0000IIID",
    "RDHR0000IIID",
    "rdhR0000IIId",
    "RDHR0000IIId",
    "entityId",
    "EntityId",
    "id",
    "Id",
  ]),
  organizationId: firstValue(entity, [
    "rdhR0000IID",
    "RDHR0000IID",
    "rdhR0000IId",
    "RDHR0000IId",
    "organizationId",
    "OrganizationId",
  ]),
  name: firstValue(entity, [
    "rdhR0000IIName",
    "RDHR0000IIName",
    "entityName",
    "EntityName",
    "name",
    "Name",
  ]),
});

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;

  if (data?.errors) {
    const messages = Object.values(data.errors).flat();
    if (messages.length) return messages.join(" ");
  }

  return (
    data?.message ||
    data?.Message ||
    data?.title ||
    data?.detail ||
    error?.message ||
    fallback
  );
};

const mapCellToForm = (cell) => ({
  rdhR0000IID: String(
    firstValue(cell, [
      "rdhR0000IID",
      "RDHR0000IID",
      "organizationId",
      "OrganizationId",
    ])
  ),
  rdhR0000IIID: String(
    firstValue(cell, [
      "rdhR0000IIID",
      "RDHR0000IIID",
      "entityId",
      "EntityId",
    ])
  ),
  rdhR0000IIIName: firstValue(cell, [
    "rdhR0000IIIName",
    "RDHR0000IIIName",
  ]),
  isDefault: Boolean(cell?.isDefault ?? cell?.IsDefault ?? false),
});

export default function Cell({ onSave }) {
  const location = useLocation();

  const employeeName = localStorage.getItem("employeeName") || "";
  const sourceID = localStorage.getItem("sourceID") || "";

  const navigationState = location.state || {};
  const isEditMode =
    navigationState.mode === "edit" ||
    navigationState.isEdit === true;

  const selectedCell = navigationState.cell || null;

  const encryptedId =
    navigationState.encryptedId ||
    selectedCell?.encryptedId ||
    selectedCell?.EncryptedId ||
    selectedCell?.rdhR0000IIIID_Encrypted ||
    selectedCell?.RDHR0000IIIID_Encrypted ||
    "";

  const [organizations, setOrganizations] = useState([]);
  const [entities, setEntities] = useState([]);

  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({ ...initialFormData });
  const [errors, setErrors] = useState({});
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

  const fetchOrganizations = useCallback(async () => {
    setLoadingOrganizations(true);

    try {
      const response = await axiosClientModule.get(
        "/Organization/GetOrganisationList"
      );

      const records = extractArray(response).map(mapOrganization);

      setOrganizations(records);
    } catch (error) {
      console.error(
        "Failed to fetch organizations:",
        error.response?.data || error.message
      );

      setOrganizations([]);

      showToast(
        getErrorMessage(error, "Unable to load organizations."),
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

        const filteredRecords = records.filter(
          (entity) =>
            String(entity.organizationId) === String(organizationId)
        );

        setEntities(filteredRecords);

        if (selectedEntityId) {
          const matchingEntity = filteredRecords.find(
            (entity) => String(entity.id) === String(selectedEntityId)
          );

          if (matchingEntity) {
            setFormData((previous) => ({
              ...previous,
              rdhR0000IIID: String(matchingEntity.id),
            }));

            setErrors((previous) => ({
              ...previous,
              rdhR0000IIID: "",
            }));
          } else {
            setErrors((previous) => ({
              ...previous,
              rdhR0000IIID:
                "The saved entity was not found for this organization.",
            }));
          }
        }
      } catch (error) {
        console.error(
          "Failed to fetch entities:",
          error.response?.data || error.message
        );

        setEntities([]);

        showToast(
          getErrorMessage(error, "Unable to load entities."),
          "error",
          4000
        );
      } finally {
        setLoadingEntities(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (!isEditMode || !selectedCell) {
      setFormData({ ...initialFormData });
      setErrors({});
      return;
    }

    const mappedCell = mapCellToForm(selectedCell);

    setFormData(mappedCell);
    setErrors({});

    if (mappedCell.rdhR0000IID) {
      fetchEntities(
        mappedCell.rdhR0000IID,
        mappedCell.rdhR0000IIID
      );
    }
  }, [isEditMode, selectedCell, fetchEntities]);

  const handleOrganizationChange = (event) => {
    const organizationId = event.target.value;

    setFormData((previous) => ({
      ...previous,
      rdhR0000IID: organizationId,
      rdhR0000IIID: "",
    }));

    setEntities([]);

    setErrors((previous) => ({
      ...previous,
      rdhR0000IID: "",
      rdhR0000IIID: "",
    }));

    if (organizationId) {
      fetchEntities(organizationId);
    }
  };

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rdhR0000IID) {
      newErrors.rdhR0000IID = "Organization is required.";
    }

    if (!formData.rdhR0000IIID) {
      newErrors.rdhR0000IIID = "Entity is required.";
    }

    if (!formData.rdhR0000IIIName.trim()) {
      newErrors.rdhR0000IIIName = "Line Name is required.";
    } else if (formData.rdhR0000IIIName.trim().length > 200) {
      newErrors.rdhR0000IIIName =
        "Line Name cannot exceed 200 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    if (saving) return;

    if (isEditMode && selectedCell) {
      const mappedCell = mapCellToForm(selectedCell);
      setFormData(mappedCell);

      if (mappedCell.rdhR0000IID) {
        fetchEntities(
          mappedCell.rdhR0000IID,
          mappedCell.rdhR0000IIID
        );
      } else {
        setEntities([]);
      }
    } else {
      setFormData({ ...initialFormData });
      setEntities([]);
    }

    setErrors({});
  };

  const handleSubmit = async (event) => {
    console.log("Update form submitted");
console.log("Edit mode:", isEditMode);
console.log("Encrypted ID:", encryptedId);
console.log("Form data:", formData);
    event.preventDefault();

    if (saving) return;

    if (!validateForm()) {
      showToast("Please fill in all mandatory fields.", "error");
      return;
    }

    const organizationId = Number(formData.rdhR0000IID);
    const entityId = Number(formData.rdhR0000IIID);

    if (!Number.isInteger(organizationId) || organizationId <= 0) {
      showToast("Please select a valid organization.", "error");
      return;
    }

    if (!Number.isInteger(entityId) || entityId <= 0) {
      showToast("Please select a valid entity.", "error");
      return;
    }

    if (isEditMode && !encryptedId) {
      showToast(
        "Encrypted Cell ID is missing. Cannot update this record.",
        "error",
        4000
      );
      return;
    }

    const dto = {
      isDeactivated: false,
      createdByUser: employeeName,
      createdDate: new Date().toISOString(),
      sourceID: String(sourceID),
      rdhR0000IID: organizationId,
      rdhR0000IIID: entityId,
      rdhR0000IIIName: formData.rdhR0000IIIName.trim(),
      isDefault: Boolean(formData.isDefault),
    };

    setSaving(true);

    try {
      let response;
      console.log("Calling UpdateCell API");
console.log(
  "URL:",
  `/Cell/UpdateCell/${encodeURIComponent(encryptedId)}`
);
console.log("DTO:", dto);
      if (isEditMode) {
        const result = await axiosClientModule.patch(
          `/Cell/UpdateCell/${encodeURIComponent(encryptedId)}`,
          {
            encryptedId,
            dto,
          }
        );

        response = result.data;
      } else {
        const result = await axiosClientModule.post(
          "/Cell/CreateCell",
          dto
        );

        response = result.data;
      }

      showToast(
        response?.message ||
          response?.Message ||
          (isEditMode
            ? "Line Master updated successfully."
            : "Line Master created successfully."),
        "success"
      );

      if (typeof onSave === "function") {
        await onSave(response, isEditMode ? { encryptedId, dto } : dto);
      }

      if (isEditMode) {
        setFormData((previous) => ({
          ...previous,
          rdhR0000IIIName: dto.rdhR0000IIIName,
        }));
      } else {
        setFormData({ ...initialFormData });
        setEntities([]);
        setErrors({});
      }
    } catch (error) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} Cell:`,
        {
          status: error.response?.status,
          responseData: error.response?.data,
          requestUrl: error.config?.url,
          requestMethod: error.config?.method,
          requestPayload: error.config?.data,
          fullError: error,
        }
      );

      showToast(
        getErrorMessage(
          error,
          isEditMode
            ? "Failed to update Line Master. Please try again."
            : "Failed to create Line Master. Please try again."
        ),
        "error",
        5000
      );
    } finally {
      setSaving(false);
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

      <div className="hrms-form-container cell-page">
        <form
          className="cell-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="hrms-form-section-card">
            <div className="hrms-form-section-header">
              <div className="hrms-form-section-icon">
                <FiBriefcase size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Cell - Details
                </h3>

                <p className="hrms-form-section-description">
                  {isEditMode
                    ? "Update the cell information below."
                    : "Enter the cell information below."}
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormSelect
                    label="Organization"
                    name="rdhR0000IID"
                    value={formData.rdhR0000IID}
                    onChange={handleOrganizationChange}
                    required
                    disabled={loadingOrganizations || saving}
                    options={organizations.map((organization) => ({
                      value: String(organization.id),
                      label: organization.name,
                    }))}
                    error={errors.rdhR0000IID}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormSelect
                    label="Entity"
                    name="rdhR0000IIID"
                    value={formData.rdhR0000IIID}
                    onChange={handleChange}
                    required
                    disabled={
                      !formData.rdhR0000IID ||
                      loadingEntities ||
                      saving
                    }
                    options={entities.map((entity) => ({
                      value: String(entity.id),
                      label: entity.name,
                    }))}
                    error={errors.rdhR0000IIID}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="Cell Name"
                    name="rdhR0000IIIName"
                    value={formData.rdhR0000IIIName}
                    onChange={handleChange}
                    placeholder="Enter Cell Name"
                    required
                    maxLength={200}
                    disabled={saving}
                    error={errors.rdhR0000IIIName}
                  />
                </div>
              </div>

              <div className="organization-checkbox-grid">
                <div className="organization-checkbox-field">
                  <FormCheckbox
                    label="Default"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleDefaultChange}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hrms-form-section-footer">
            <FormButton
              type="button"
              variant="secondary"
              onClick={resetForm}
              disabled={saving}
            >
              Reset
            </FormButton>

            <FormButton
              type="submit"
              variant="primary"
              disabled={saving || loadingOrganizations}
            >
              {saving
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                  ? "Update"
                  : "Save"}
            </FormButton>
          </div>
        </form>
      </div>
    </>
  );
}
