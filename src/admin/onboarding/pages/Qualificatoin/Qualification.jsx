import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useLocation } from "react-router-dom";
import { FiList } from "react-icons/fi";

import FormInput from "../../../../../src/common/components/Form/FormInput";
import FormSelect from "../../../../../src/common/components/Form/FormSelect";
import FormButton from "../../../../common/components/Form/FormButton";
import Toast from "../../../../common/components/Popups/Toast";

import {
  createQualification,
  updateQualification,
  getQualificationCategoryList,
} from "../../services/QualificationApi.js";

import {
  initialQualificationFormData,
  mapQualificationFormData,
  toQualificationDto,
  getApiErrorMessage,
} from "../../mappers/QualificationMapper.js";

const Qualification = ({ onSave }) => {
  const location = useLocation();

  const employeeName = localStorage.getItem("employeeName") || "";
  const sourceID = localStorage.getItem("sourceID") || "";

  const isEdit =
    location.state?.mode === "edit" ||
    location.state?.isEdit === true;

  const selectedQualification =
    location.state?.qualification || null;

  const encryptedId =
    location.state?.encryptedId ||
    selectedQualification?.encryptedId ||
    selectedQualification?.EncryptedId ||
    selectedQualification?.rdhR0000XXVIID_Encrypted ||
    "";

  const [formData, setFormData] = useState({
    ...initialQualificationFormData,
  });

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
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

  // Load qualification categories from the API.
  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      setIsLoadingCategories(true);

      try {
        const response = await getQualificationCategoryList();

        const categoryList = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.Data)
              ? response.Data
              : [];

        const mappedCategories = categoryList
          .filter(
            (item) =>
              item?.RDHR0000XXVID !== null &&
              item?.RDHR0000XXVID !== undefined
          )
          .map((item) => ({
            value: String(item.RDHR0000XXVID),
            label: item.RDHR0000XXVName || "",
          }));

        if (isMounted) {
          setCategories(mappedCategories);

          if (mappedCategories.length === 0) {
            showToast(
              "No qualification categories were found.",
              "warning",
              4000
            );
          }
        }
      } catch (error) {
        console.error(
          "Failed to load qualification categories:",
          error?.response?.data || error
        );

        if (isMounted) {
          setCategories([]);
          showToast(
            getApiErrorMessage(
              error,
              "Failed to load qualification categories."
            ),
            "error",
            5000
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // Populate the form when adding or editing a qualification.
  useEffect(() => {
    setFormData(
      isEdit && selectedQualification
        ? mapQualificationFormData(selectedQualification)
        : { ...initialQualificationFormData }
    );

    setErrors({});
  }, [isEdit, selectedQualification]);

  const handleChange = (eventOrValue) => {
    // Supports components that return either a normal event or a value.
    const name = eventOrValue?.target?.name;
    const value = eventOrValue?.target
      ? eventOrValue.target.value
      : eventOrValue;

    if (!name) {
      return;
    }

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
      isEdit && selectedQualification
        ? mapQualificationFormData(selectedQualification)
        : { ...initialQualificationFormData }
    );

    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    const normalizedName = String(
      formData.rdhR0000XXVIName || ""
    ).trim();

    const categoryId = String(
      formData.rdhR0000XXVID ?? ""
    ).trim();

    const nextErrors = {};

    if (!normalizedName) {
      nextErrors.rdhR0000XXVIName =
        "Qualification Name is required.";
    }

    if (
      !categoryId ||
      !Number.isInteger(Number(categoryId)) ||
      Number(categoryId) <= 0 ||
      !categories.some((category) => category.value === categoryId)
    ) {
      nextErrors.rdhR0000XXVID =
        "Please select a valid qualification category.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);

      showToast(
        "Please correct the highlighted fields.",
        "error"
      );

      return;
    }

    if (isEdit && !encryptedId) {
      showToast(
        "Encrypted Qualification ID is missing. Please return to the list and try again.",
        "error",
        5000
      );

      return;
    }

    setIsSaving(true);

    const dto = toQualificationDto(
      {
        rdhR0000XXVIName: normalizedName,
        rdhR0000XXVID: categoryId,
      },
      { employeeName, sourceID },
      isEdit ? selectedQualification : null
    );

    try {
      const response = isEdit
        ? await updateQualification(encryptedId, dto)
        : await createQualification(dto);

      const successMessage =
        response?.message ||
        response?.Message ||
        response?.data?.message ||
        response?.data?.Message ||
        (isEdit
          ? "Qualification updated successfully."
          : "Qualification created successfully.");

      showToast(successMessage, "success", 3000);

      if (typeof onSave === "function") {
        await onSave(
          response,
          isEdit ? { encryptedId, dto } : dto
        );
      }

      if (isEdit) {
        setFormData((previous) => ({
          ...previous,
          rdhR0000XXVIName: normalizedName,
          rdhR0000XXVID: categoryId,
        }));
      } else {
        setFormData({ ...initialQualificationFormData });
      }

      setErrors({});
    } catch (error) {
      console.error(
        isEdit
          ? "Failed to update Qualification:"
          : "Failed to create Qualification:",
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
            ? "Failed to update Qualification. Please try again."
            : "Failed to create Qualification. Please try again."
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

      <div className="hrms-form-container qualification-page">
        <form
          className="qualification-form"
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
                  Qualification Details
                </h3>

                <p className="hrms-form-section-description">
                  {isEdit
                    ? "Update the qualification information below."
                    : "Enter the qualification information below."}
                </p>
              </div>
            </div>

            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormInput
                    label="Qualification Name"
                    name="rdhR0000XXVIName"
                    value={formData.rdhR0000XXVIName || ""}
                    onChange={handleChange}
                    placeholder="Enter Qualification Name"
                    required
                    error={errors.rdhR0000XXVIName}
                    disabled={isSaving}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormSelect
                    label="Category"
                    name="rdhR0000XXVID"
                    value={String(formData.rdhR0000XXVID ?? "")}
                    onChange={handleChange}
                    options={categories}
                    placeholder={
                      isLoadingCategories
                        ? "Loading categories..."
                        : "Select Category"
                    }
                    required
                    error={errors.rdhR0000XXVID}
                    disabled={isSaving || isLoadingCategories}
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
              disabled={isSaving || isLoadingCategories}
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

export default Qualification;
