import { useState, useRef } from "react";
import { FiBriefcase } from "react-icons/fi";

import FormInput from "../../../../../common/components/Form/FormInput";
import FormSelect from "../../../../../common/components/Form/FormSelect";
import FormCheckbox from "../../../../../common/components/Form/FormCheckbox";
import FormButton from "../../../../../common/components/Form/FormButton";
import FormToggleBtn from "../../../../../common/components/FormToggleBtn/FormToggleBtn";
import DynamicCalendar from "../../../../../common/components/calendar/DynamicCalendar";

import assetsDetailsSchema from "../../../validations/assetsDetailsSchema";

function AssetsDetails({ employee, onBackToList, onSave }) {
  const [isAssetsDetailsOpen, setIsAssetsDetailsOpen] = useState(true);

  const assetsDetailsBodyRef = useRef(null);

  const [formData, setFormData] = useState({
    asset: "",
    assetTag: "",
    issueDate: "",
    conditionRemark: "",
    requiredAlert: false,
    alertDate: "",
  });

  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const assetOptions = [
    { label: "Laptop", value: "Laptop" },
    { label: "Desktop", value: "Desktop" },
    { label: "Mobile", value: "Mobile" },
    { label: "Monitor", value: "Monitor" },
    { label: "Keyboard", value: "Keyboard" },
    { label: "Mouse", value: "Mouse" },
    { label: "Other", value: "Other" },
  ];

  const employeeName = employee?.name || "Mr.Tiger";
  const employeeId = employee?.empId || "223443397";
  const employeeDesignation =
    employee?.designation || "Sr.Developer - Back office";

  // Validate the complete form using the schema.
  const validateForm = (data) => {
    const result = assetsDetailsSchema.safeParse(data);
    const newErrors = {};

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (!newErrors[field]) {
          newErrors[field] = issue.message;
        }
      });
    }

    return newErrors;
  };

  // Validate changed fields and their dependencies.
  const validateChangedFields = (updatedData, changedField) => {
    const validationErrors = validateForm(updatedData);

    const fieldsToValidate = [changedField];

    if (changedField === "requiredAlert") {
      fieldsToValidate.push("alertDate");
    }

    setErrors((previousErrors) => {
      const updatedErrors = { ...previousErrors };

      fieldsToValidate.forEach((field) => {
        if (validationErrors[field]) {
          updatedErrors[field] = validationErrors[field];
        } else {
          delete updatedErrors[field];
        }
      });

      // Once Save is clicked, keep all errors updated.
      if (hasSubmitted) {
        return validationErrors;
      }

      return updatedErrors;
    });
  };

  // Handle regular inputs and calendar fields.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const updatedValue = type === "checkbox" ? checked : value;

    const updatedData = {
      ...formData,
      [name]: updatedValue,
    };

    setFormData(updatedData);
    validateChangedFields(updatedData, name);
  };

  // Handle asset selection and generate the asset tag.
  const handleAssetChange = (eventOrValue) => {
    const value =
      eventOrValue?.target?.value !== undefined
        ? eventOrValue.target.value
        : eventOrValue;

    const updatedData = {
      ...formData,
      asset: value || "",
      assetTag: value
        ? `AST-${String(value)
            .toUpperCase()
            .trim()
            .replace(/\s+/g, "-")}-001`
        : "",
    };

    setFormData(updatedData);

    const validationErrors = validateForm(updatedData);

    setErrors((previousErrors) => {
      const updatedErrors = { ...previousErrors };

      ["asset", "assetTag"].forEach((field) => {
        if (validationErrors[field]) {
          updatedErrors[field] = validationErrors[field];
        } else {
          delete updatedErrors[field];
        }
      });

      if (hasSubmitted) {
        return validationErrors;
      }

      return updatedErrors;
    });
  };

  // Handle Required Alert checkbox.
  const handleRequiredAlertChange = (eventOrValue) => {
    const checked =
      typeof eventOrValue === "boolean"
        ? eventOrValue
        : eventOrValue?.target?.type === "checkbox"
          ? eventOrValue.target.checked
          : eventOrValue?.target?.value === "true";

    const updatedData = {
      ...formData,
      requiredAlert: checked,
      alertDate: checked ? formData.alertDate : "",
    };

    setFormData(updatedData);
    validateChangedFields(updatedData, "requiredAlert");
  };

  // Validate all fields when Save is clicked.
  const handleSubmit = (e) => {
    e.preventDefault();

    setHasSubmitted(true);

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (onSave) {
      onSave(formData);
    } else {
      console.log("Assets Details:", formData);
    }
  };

  return (
    <div className="hrms-form-container assets-details-page">
      <form onSubmit={handleSubmit} noValidate>
        <div className="hrms-form-section-card">
          {/* SECTION HEADER */}
          <div className="hrms-form-section-header">
            <div className="hrms-section-heading-group">
              <div className="hrms-form-section-icon">
                <FiBriefcase size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Assets Details
                </h3>

                <div className="employee-information">
                  <span>
                    {employeeName} - {employeeId} (
                    {employeeDesignation})
                  </span>
                </div>
              </div>
            </div>

            <FormToggleBtn
              isOpen={isAssetsDetailsOpen}
              onClick={() =>
                setIsAssetsDetailsOpen((prev) => !prev)
              }
            />
          </div>

          {/* COLLAPSIBLE CONTENT */}
          <div
            ref={assetsDetailsBodyRef}
            className={`hrms-form-section-collapse ${
              isAssetsDetailsOpen ? "is-open" : ""
            }`}
          >
            <div className="hrms-form-section-body">
              <div className="hrms-form-row-3">
                {/* ASSET */}
                <div className="hrms-form-group">
                  <FormSelect
                    label="Asset"
                    name="asset"
                    value={formData.asset}
                    onChange={handleAssetChange}
                    options={assetOptions}
                    required
                    error={errors.asset}
                  />
                </div>

                {/* ASSET TAG */}
                <div className="hrms-form-group">
                  <FormInput
                    label="Asset Tag"
                    name="assetTag"
                    value={formData.assetTag}
                    onChange={handleChange}
                    placeholder="Enter Asset Tag"
                    required
                    disabled
                    error={errors.assetTag}
                  />
                </div>

                {/* ISSUE DATE */}
                <div className="hrms-form-group">
                  <DynamicCalendar
                    label="Issue Date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleChange}
                    mode="dd-mm-yyyy"
                    placeholder="dd/mm/yyyy"
                    required
                    error={errors.issueDate}
                  />
                </div>

                {/* CONDITION REMARK */}
                <div className="hrms-form-group">
                  <FormInput
                    label="Condition Remark"
                    name="conditionRemark"
                    value={formData.conditionRemark}
                    onChange={handleChange}
                    placeholder="Enter Condition Remark"
                    error={errors.conditionRemark}
                  />
                </div>

                {/* REQUIRED ALERT */}
                <div className="hrms-form-group">
                  <FormCheckbox
                    label="Required Alert"
                    name="requiredAlert"
                    checked={formData.requiredAlert}
                    onChange={handleRequiredAlertChange}
                  />
                  <DynamicCalendar
                    label=""
                    name="alertDate"
                    value={formData.alertDate}
                    onChange={handleChange}
                    mode="dd-mm-yyyy"
                    placeholder="dd/mm/yyyy"
                    disabled={!formData.requiredAlert}
                    required={formData.requiredAlert}
                    error={
                      formData.requiredAlert
                        ? errors.alertDate
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="hrms-form-footer">
          <FormButton
            type="button"
            variant="secondary"
            onClick={onBackToList}
          >
            List
          </FormButton>

          <FormButton type="submit" variant="primary">
            Save
          </FormButton>
        </div>
      </form>
    </div>
  );
}

export default AssetsDetails;
