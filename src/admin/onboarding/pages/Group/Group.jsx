import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiList } from "react-icons/fi";

import FormInput from "../../../../../src/common/components/Form/FormInput";
import FormButton from "../../../../common/components/Form/FormButton";
import Toast from "../../../../common/components/Popups/Toast";

import {
  createGroup,
  updateGroup,
} from "../../services/GroupApi.js";

import {
  initialGroupFormData,
  mapGroupFormData,
  toGroupDto,
  getApiErrorMessage,
} from "../../mappers/GroupMapper.js";

const Group = ({ onSave }) => {
  const location = useLocation();

  const employeeName = localStorage.getItem("employeeName") || "";
  const sourceID = localStorage.getItem("sourceID") || "";

  const isEdit =
    location.state?.mode === "edit" ||
    location.state?.isEdit === true;

  const selectedGroup = location.state?.group || null;

  const encryptedId =
    location.state?.encryptedId ||
    selectedGroup?.encryptedId ||
    selectedGroup?.EncryptedId ||
    selectedGroup?.rdhR0000XVIIIID_Encrypted ||
    "";

  const [formData, setFormData] = useState(initialGroupFormData);
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
      isEdit && selectedGroup
        ? mapGroupFormData(selectedGroup)
        : { ...initialGroupFormData }
    );

    setErrors({});
  }, [isEdit, selectedGroup]);

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
      isEdit && selectedGroup
        ? mapGroupFormData(selectedGroup)
        : { ...initialGroupFormData }
    );

    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    const normalizedName = formData.rdhR0000XVIIIName.trim();

    if (!normalizedName) {
      setErrors({
        rdhR0000XVIIIName: "Group name is required.",
      });

      showToast("Please enter a Group Name.", "error");
      return;
    }

    if (isEdit && !encryptedId) {
      showToast(
        "Encrypted Group ID is missing. Please return to the list and try again.",
        "error",
        5000
      );
      return;
    }

    setIsSaving(true);

    const dto = toGroupDto(
      { rdhR0000XVIIIName: normalizedName },
      { employeeName, sourceID }
    );

    try {
      const response = isEdit
        ? await updateGroup(encryptedId, dto)
        : await createGroup(dto);

      showToast(
        response?.message ||
          response?.Message ||
          (isEdit
            ? "Group updated successfully."
            : "Group created successfully."),
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
          rdhR0000XVIIIName: normalizedName,
        });
      } else {
        setFormData({ ...initialGroupFormData });
      }

      setErrors({});
    } catch (error) {
      console.error(
        isEdit ? "Failed to update Group:" : "Failed to create Group:",
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
            ? "Failed to update Group. Please try again."
            : "Failed to create Group. Please try again."
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

      <div className="hrms-form-container group-page">
        <form
          className="group-form"
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
                  Group Details
                </h3>

                <p className="hrms-form-section-description">
                  {isEdit
                    ? "Update the group information below."
                    : "Enter the group information below."}
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormInput
                    label="Group Name"
                    name="rdhR0000XVIIIName"
                    value={formData.rdhR0000XVIIIName}
                    onChange={handleChange}
                    placeholder="Enter Group Name"
                    required
                    error={errors.rdhR0000XVIIIName}
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

export default Group;