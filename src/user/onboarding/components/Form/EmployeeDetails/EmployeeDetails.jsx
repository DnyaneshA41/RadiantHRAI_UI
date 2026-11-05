import { useState, useCallback } from "react";
import {
  FiUser,
  FiBriefcase,
  FiImage,
  FiInfo,
  FiSave,
  FiEye,
  FiArrowLeft,
} from "react-icons/fi";

import FormInput from "../../../../../common/components/Form/FormInput";
import FormSelect from "../../../../../common/components/Form/FormSelect";
import FormCheckbox from "../../../../../common/components/Form/FormCheckbox";
import FormButton from "../../../../../common/components/Form/FormButton";
import FormFileUpload from "../../../../../common/components/Form/FormFileUpload";
import DynamicCalendar from "../../../../../common/components/calendar/DynamicCalendar";
import FormToggleBtn from "../../../../../common/components/FormToggleBtn/FormToggleBtn";
import useSectionAnimation from "../../../../../common/hooks/useSectionAnimation";
import {
  employeeDetailsSchema,
  employeeDetailsBaseSchema,
  validateEmploymentDate,
} from "../../../validations/employeeDetailsSchema";
import Toast from "../../../../../common/components/Popups/Toast";

import "./EmployeeDetails.css";

const initialFormData = {
  organization: "",
  entity: "",
  employeeTitle: "Mr.",
  employeeName: "",
  employeeNo: "",
  employeeCardNo: "",
  subEntity: "",
  department: "",
  subDepartment: "",
  designation: "",
  level: "",
  workForce: "",
  group: "",
  organizationEmail: "",
  reportingManager: "",
  type: "",
  probationEndDate: "",
  traineeEndDate: "",
  grade: "Grade 1",
  leftEmployee: false,
  organizationMobileNo: "",
  joiningDate: "",
  confirmationDate: "",
  aadhaarNo: "",
  nameAsPerAadhaar: "",
  mobileAadhaarLink: true,
  panLinkWithAadhaar: true,
  pan: "",
  nameAsPerPan: "",
  primaryMobileNo: "",
  personalEmailId: "",
  emergencyNo: "",
  whatsAppNo: "",
  gender: "",
  birthDate: "",
  civilStatus: "",
  bloodGroup: "",
  religion: "",
  caste: "",
  physicalDisability: "",
  physicalDisabilityType: "",
  passportNo: "",
  passportExpiryDate: "",
  drivingLicenceNo: "",
  drivingLicenceExpiryDate: "",
  signature: null,
  photo: null,
  assignIdCard: "Staff",
  leftEmployee: false,
  employeeLeftDate: "",
};

const optionsFrom = (values) =>
  values.map((value) => ({
    value,
    label: value,
  }));

const organizationOptions = optionsFrom(["Organization A", "Organization B"]);

const entityOptions = optionsFrom(["Entity A", "Entity B"]);

const departmentOptions = optionsFrom([
  "Administration",
  "Finance",
  "Human Resources",
  "IT",
  "Operations",
]);

const designationOptions = optionsFrom([
  "Executive",
  "Manager",
  "Assistant Manager",
  "Developer",
  "Analyst",
]);

function EmployeeDetails({ onBackToList }) {
  const [isEmpDetailsOpen, setIsEmpDetailsOpen] = useState(true);
  const [isPerDetailsOpen, setIsPerDetailsOpen] = useState(true);

  const empDetailsBodyRef = useSectionAnimation(isEmpDetailsOpen);
  const perDetailsBodyRef = useSectionAnimation(isPerDetailsOpen);

  const [formData, setFormData] = useState(initialFormData);
  const [signaturePreview, setSignaturePreview] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");

  const [toast, setToast] = useState(null);

  const handleToastClose = useCallback(() => {
    setToast(null);
  }, []);

  
const [errors, setErrors] = useState({});
const [submitted, setSubmitted] = useState(false);

// ========================================
// VALIDATE FIELD
// ========================================
const validateField = (name, value, updatedFormData = formData) => {
  // Employee Left Date is required only when Left Employee is checked
  if (name === "employeeLeftDate") {
    if (!updatedFormData.leftEmployee) {
      setErrors((previous) => ({
        ...previous,
        employeeLeftDate: "",
      }));
      return;
    }

    if (!value) {
      setErrors((previous) => ({
        ...previous,
        employeeLeftDate: "Employee left date is required",
      }));
      return;
    }
  }

  const fieldSchema = employeeDetailsBaseSchema.shape[name];

  if (!fieldSchema) return;

  // Step 1: Run normal Zod field validation
  const result = fieldSchema.safeParse(value);

  let errorMessage = result.success
    ? ""
    : result.error.issues[0]?.message || "Invalid value";

  // Step 2: Check employment dates against Joining Date
  // ADDITION: This is where validateEmploymentDate is used.
  const dateError = validateEmploymentDate(
    name,
    value,
    updatedFormData
  );

  if (dateError) {
    errorMessage = dateError;
  }

  // Step 3: Update the field's error message
  setErrors((previous) => ({
    ...previous,
    [name]: errorMessage,
  }));
};

// ========================================
// HANDLE CHANGE
// ========================================
const handleChange = (event) => {
  const { name, value, type, checked, files } = event.target;

  let fieldValue =
    type === "checkbox"
      ? checked
      : type === "file"
        ? files?.[0] || null
        : value;

  // Name fields: allow only alphabets and spaces
  const nameFields = [
    "employeeName",
    "nameAsPerAadhaar",
    "nameAsPerPan",
  ];

  if (nameFields.includes(name)) {
    fieldValue = value.replace(/[^A-Za-z ]/g, "");
  }

  // PAN: automatically convert to uppercase
  if (name === "pan") {
    fieldValue = value.toUpperCase();
  }

  // Mobile number fields: allow only digits, maximum 10
  const mobileFields = [
    "organizationMobileNo",
    "primaryMobileNo",
    "emergencyNo",
    "whatsAppNo",
  ];

  if (mobileFields.includes(name)) {
    fieldValue = value.replace(/\D/g, "").slice(0, 10);
  }

  // Aadhaar number: only digits, maximum 12
  if (name === "aadhaarNo") {
    fieldValue = value.replace(/\D/g, "").slice(0, 12);
  }

  // Create updated form data
  const updatedFormData = {
    ...formData,
    [name]: fieldValue,
  };

  setFormData(updatedFormData);

  // Validate the changed field immediately
  validateField(name, fieldValue, updatedFormData);

  // When Joining Date changes, revalidate all dependent dates
  if (name === "joiningDate") {
  [
    "probationEndDate",
    "traineeEndDate",
    "confirmationDate",
    "employeeLeftDate", 
  ].forEach((fieldName) => {
    validateField(
      fieldName,
      updatedFormData[fieldName],
      updatedFormData
    );
  });
}

  // Handle Left Employee checkbox
  if (name === "leftEmployee") {
    if (fieldValue) {
      validateField(
        "employeeLeftDate",
        updatedFormData.employeeLeftDate,
        updatedFormData
      );
    } else {
      setErrors((previous) => ({
        ...previous,
        employeeLeftDate: "",
      }));
    }
  }
};


  const handleUpload = (event) => {
    const { name, value, files } = event.target;
    const file = files?.[0] || value || null;

    setFormData((previous) => ({
      ...previous,
      [name]: file,
    }));

    if (file && typeof file === "object") {
      const preview = URL.createObjectURL(file);

      if (name === "signature") {
        setSignaturePreview(preview);
      }

      if (name === "photo") {
        setPhotoPreview(preview);
      }
    }

    if (submitted) {
      validateField(name, file);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setSignaturePreview("");
    setPhotoPreview("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    const result = employeeDetailsSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};

      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];

        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });

      setErrors(fieldErrors);

      const personalFields = [
        "aadhaarNo",
        "nameAsPerAadhaar",
        "mobileAadhaarLink",
        "pan",
        "nameAsPerPan",
        "panLinkWithAadhaar",
        "primaryMobileNo",
        "personalEmailId",
        "emergencyNo",
        "whatsAppNo",
        "gender",
        "birthDate",
        "civilStatus",
        "bloodGroup",
        "religion",
        "caste",
        "physicalDisability",
        "physicalDisabilityType",
        "passportNo",
        "passportExpiryDate",
        "drivingLicenceNo",
        "drivingLicenceExpiryDate",
        "signature",
        "photo",
        "assignIdCard",
      ];

      const hasPersonalErrors = Object.keys(fieldErrors).some((field) =>
        personalFields.includes(field),
      );

      const hasEmploymentErrors = Object.keys(fieldErrors).some(
        (field) => !personalFields.includes(field),
      );

      if (hasEmploymentErrors) {
        setIsEmpDetailsOpen(true);
      }

      if (hasPersonalErrors) {
        setIsPerDetailsOpen(true);
      }

      setToast({
        id: Date.now(),
        message: "Please fix the validation errors before saving.",
        type: "error",
        duration: 3000,
      });

      return;
    }

    setErrors({});

    setToast({
      id: Date.now(),
      message: "Employee details validated successfully.",
      type: "success",
      duration: 3000,
    });

    console.log("Validated Employee Details:", result.data);
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
      <div className="hrms-form-container employee-details-page">
        <form
          className="employee-details-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* 1. ORGANIZATION & EMPLOYMENT DETAILS */}
          <section className="hrms-form-section-card employee-employment-section">
            <div className="hrms-form-section-header">
              <div className="hrms-section-heading-group">
                <div className="hrms-form-section-icon">
                  <FiBriefcase size={19} />
                </div>

                <div className="hrms-form-section-heading">
                  <h3 className="hrms-form-section-title">
                    1. Organization &amp; Employment Details
                  </h3>

                  <div className="employee-information">
                    {/* <FiUser size={15} /> */}

                    <span>Mr.Krishna - TS012 (Software developer - UI/UX)</span>
                  </div>
                </div>
              </div>

              <FormToggleBtn
                isOpen={isEmpDetailsOpen}
                onClick={() => setIsEmpDetailsOpen((prev) => !prev)}
              />
            </div>

            <div
              ref={empDetailsBodyRef}
              className={`hrms-form-section-collapse ${
                isEmpDetailsOpen ? "is-open" : ""
              }`}
            >
              <div className="hrms-form-section-body">
                <div className="hrms-form-row-3 employee-employment-grid">
                  <div className="hrms-form-group">
                    <FormSelect
                      label="Organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      options={organizationOptions}
                      required
                      error={errors.organization}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Entity"
                      name="entity"
                      value={formData.entity}
                      onChange={handleChange}
                      options={entityOptions}
                      required
                      error={errors.entity}
                    />
                  </div>

                  <div className="hrms-form-group employee-name-field">
                    <label className="hrms-form-label">
                      Employee Name
                      <span className="hrms-required">*</span>
                    </label>

                    <div className="employee-name-control">
                      <FormSelect
                        label=""
                        name="employeeTitle"
                        value={formData.employeeTitle}
                        onChange={handleChange}
                        options={optionsFrom(["Mr.", "Mrs.", "Ms.", "Dr."])}
                        placeholder=""
                      />

                      <FormInput
                        label=""
                        name="employeeName"
                        value={formData.employeeName}
                        onChange={handleChange}
                        placeholder="Enter Employee Name"
                        required
                        error={errors.employeeName}
                      />
                    </div>
                  </div>

                  <div className="hrms-form-group">
                    <FormInput
                      label="Employee No"
                      name="employeeNo"
                      value={formData.employeeNo}
                      onChange={handleChange}
                      placeholder="Enter Employee No."
                      required
                      error={errors.employeeNo}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormInput
                      label="Employee Card No"
                      name="employeeCardNo"
                      value={formData.employeeCardNo}
                      onChange={handleChange}
                      placeholder="Enter Employee Card No."
                      required
                      error={errors.employeeCardNo}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Sub Entity"
                      name="subEntity"
                      value={formData.subEntity}
                      onChange={handleChange}
                      options={entityOptions}
                      required
                      error={errors.subEntity}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      options={departmentOptions}
                      required
                      error={errors.department}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Sub Department"
                      name="subDepartment"
                      value={formData.subDepartment}
                      onChange={handleChange}
                      options={departmentOptions}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      options={designationOptions}
                      required
                      error={errors.designation}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Level"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      options={optionsFrom(["Level 1", "Level 2", "Level 3"])}
                    />
                  </div>
                  <div className="hrms-form-group">
                    <FormSelect
                      label="Group"
                      name="group"
                      value={formData.group}
                      onChange={handleChange}
                      options={optionsFrom(["Group A", "Group B"])}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      options={optionsFrom([
                        "Grade 1",
                        "Grade 2",
                        "Grade 3",
                        "Grade 4",
                      ])}
                      required
                      error={errors.grade}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Workforce"
                      name="workForce"
                      value={formData.workForce}
                      onChange={handleChange}
                      options={optionsFrom([
                        "Permanent",
                        "Contract",
                        "Trainee",
                      ])}
                    />
                  </div>
                  <div className="hrms-form-group">
                    <FormSelect
                      label="Type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      options={optionsFrom([
                        "Employee",
                        "Trainee",
                        "Consultant",
                      ])}
                    />
                  </div>
                  <div className="hrms-form-group">
                    <FormInput
                      label="Organization Mobile No"
                      name="organizationMobileNo"
                      value={formData.organizationMobileNo}
                      onChange={handleChange}
                      placeholder="Enter Mobile No."
                      type="tel"
                      error={errors.organizationMobileNo}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormInput
                      label="Organization Email"
                      name="organizationEmail"
                      value={formData.organizationEmail}
                      onChange={handleChange}
                      placeholder="Enter Email ID"
                      type="email"
                      error={errors.organizationEmail}
                    />
                  </div>
                  <div className="hrms-form-group">
                    <DynamicCalendar
                      mode="dd-mm-yyyy"
                      label="Joining Date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      placeholder="dd/mm/yyyy"
                      required
                      error={errors.joiningDate}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <DynamicCalendar
                      mode="dd-mm-yyyy"
                      label="Probation End Date"
                      name="probationEndDate"
                      value={formData.probationEndDate}
                      onChange={handleChange}
                      placeholder="dd/mm/yyyy"
                    />
                  </div>

                  <div className="hrms-form-group">
                    <DynamicCalendar
                      mode="dd-mm-yyyy"
                      label="Trainee End Date"
                      name="traineeEndDate"
                      value={formData.traineeEndDate}
                      onChange={handleChange}
                      placeholder="dd/mm/yyyy"
                    />
                  </div>

                  <div className="hrms-form-group">
                    <DynamicCalendar
                      mode="dd-mm-yyyy"
                      label="Confirmation Date"
                      name="confirmationDate"
                      value={formData.confirmationDate}
                      onChange={handleChange}
                      placeholder="dd/mm/yyyy"
                      error={errors.confirmationDate}
                    />
                  </div>
                  <div className="hrms-form-group">
                    <FormSelect
                      label="Reporting Manager"
                      name="reportingManager"
                      value={formData.reportingManager}
                      onChange={handleChange}
                      options={optionsFrom(["Manager A", "Manager B"])}
                    />
                  </div>

                  <div className="hrms-form-group employee-left-checkbox">
                    <FormCheckbox
                      label="Left Employee"
                      name="leftEmployee"
                      checked={formData.leftEmployee}
                      onChange={handleChange}
                    />

                    {formData.leftEmployee && (
                      <div className="employee-left-date-field">
                        <DynamicCalendar
                          mode="dd-mm-yyyy"
                          label=""
                          name="employeeLeftDate"
                          value={formData.employeeLeftDate}
                          onChange={handleChange}
                          placeholder="dd/mm/yyyy"
                          required
                          error={errors.employeeLeftDate}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. PERSONAL DETAILS */}
          <section className="hrms-form-section-card employee-personal-section">
            <div className="hrms-form-section-header">
              <div className="hrms-section-heading-group">
                <div className="hrms-form-section-icon">
                  <FiUser size={19} />
                </div>

                <div className="hrms-form-section-heading">
                  <h3 className="hrms-form-section-title">
                    2. Personal Details
                  </h3>

                  <p className="hrms-form-section-description">
                    Provide the employee's personal and identification
                    information.
                  </p>
                </div>
              </div>

              <FormToggleBtn
                isOpen={isPerDetailsOpen}
                onClick={() => setIsPerDetailsOpen((prev) => !prev)}
              />
            </div>

            <div
              ref={perDetailsBodyRef}
              className={`hrms-form-section-collapse ${
                isPerDetailsOpen ? "is-open" : ""
              }`}
            >
              <div className="hrms-form-section-body">
                <div className="hrms-form-row-3">
                  <div className="hrms-form-group">
                    <FormInput
                      label="Aadhaar No."
                      name="aadhaarNo"
                      value={formData.aadhaarNo}
                      onChange={handleChange}
                      placeholder="Enter Aadhaar No."
                      required
                      error={errors.aadhaarNo}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormInput
                      label="Name As Per Aadhaar"
                      name="nameAsPerAadhaar"
                      value={formData.nameAsPerAadhaar}
                      onChange={handleChange}
                      placeholder="Enter Name"
                    />
                  </div>

                  <div className="hrms-form-group employee-inline-checkbox d-flex">
                    <FormCheckbox
                      label="Mobile-Aadhaar Link?"
                      name="mobileAadhaarLink"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormInput
                      label="PAN"
                      name="pan"
                      value={formData.pan}
                      onChange={handleChange}
                      placeholder="Enter PAN No."
                      required
                      error={errors.pan}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormInput
                      label="Name As Per PAN"
                      name="nameAsPerPan"
                      value={formData.nameAsPerPan}
                      onChange={handleChange}
                      placeholder="Enter Name"
                    />
                  </div>

                  <div className="hrms-form-group employee-inline-checkbox d-flex">
                    <FormCheckbox
                      label="PAN Link with Aadhaar?"
                      name="panLinkWithAadhaar"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormInput
                      label="Primary Mobile No"
                      name="primaryMobileNo"
                      value={formData.primaryMobileNo}
                      onChange={handleChange}
                      placeholder="Enter Mobile No."
                      type="tel"
                      required
                      error={errors.primaryMobileNo}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormInput
                      label="Personal Email ID"
                      name="personalEmailId"
                      value={formData.personalEmailId}
                      onChange={handleChange}
                      placeholder="Enter Email ID"
                      type="email"
                      error={errors.personalEmailId}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormInput
                      label="Emergency No."
                      name="emergencyNo"
                      value={formData.emergencyNo}
                      onChange={handleChange}
                      placeholder="Enter Emergency No."
                      type="tel"
                      required
                      error={errors.emergencyNo}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormInput
                      label="WhatsApp No."
                      name="whatsAppNo"
                      value={formData.whatsAppNo}
                      onChange={handleChange}
                      placeholder="Enter WhatsApp No."
                      type="tel"
                      error={errors.whatsAppNo}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      options={optionsFrom(["Male", "Female", "Other"])}
                      required
                      error={errors.gender}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <DynamicCalendar
                      mode="dd-mm-yyyy"
                      label="Birth Date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      placeholder="dd/mm/yyyy"
                      required
                      error={errors.birthDate}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Civil Status"
                      name="civilStatus"
                      value={formData.civilStatus}
                      onChange={handleChange}
                      options={optionsFrom([
                        "Single",
                        "Married",
                        "Divorced",
                        "Widowed",
                      ])}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Blood Group"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      options={optionsFrom([
                        "A+",
                        "A-",
                        "B+",
                        "B-",
                        "AB+",
                        "AB-",
                        "O+",
                        "O-",
                      ])}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Religion"
                      name="religion"
                      value={formData.religion}
                      onChange={handleChange}
                      options={optionsFrom([
                        "Hindu",
                        "Muslim",
                        "Christian",
                        "Sikh",
                        "Buddhist",
                        "Jain",
                        "Other",
                      ])}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Caste"
                      name="caste"
                      value={formData.caste}
                      onChange={handleChange}
                      options={optionsFrom([
                        "General",
                        "SC",
                        "ST",
                        "OBC",
                        "Other",
                      ])}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Physical Disability"
                      name="physicalDisability"
                      value={formData.physicalDisability}
                      onChange={handleChange}
                      options={optionsFrom(["Yes", "No"])}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Physical Disability Type"
                      name="physicalDisabilityType"
                      value={formData.physicalDisabilityType}
                      onChange={handleChange}
                      options={optionsFrom([
                        "Locomotor",
                        "Visual",
                        "Hearing",
                        "Other",
                      ])}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormInput
                      label="Passport No."
                      name="passportNo"
                      value={formData.passportNo}
                      onChange={handleChange}
                      placeholder="Enter Passport No."
                      required
                      error={errors.passportNo}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <DynamicCalendar
                      mode="dd-mm-yyyy"
                      label="Passport Expiry Date"
                      name="passportExpiryDate"
                      value={formData.passportExpiryDate}
                      onChange={handleChange}
                      placeholder="dd/mm/yyyy"
                      error={errors.passportExpiryDate}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormInput
                      label="Driving Licence No."
                      name="drivingLicenceNo"
                      value={formData.drivingLicenceNo}
                      onChange={handleChange}
                      placeholder="Enter Driving Licence No."
                      error={errors.drivingLicenceNo}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <DynamicCalendar
                      mode="dd-mm-yyyy"
                      label="Driving Licence Expiry Date"
                      name="drivingLicenceExpiryDate"
                      value={formData.drivingLicenceExpiryDate}
                      onChange={handleChange}
                      placeholder="dd/mm/yyyy"
                      error={errors.drivingLicenceExpiryDate}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormFileUpload
                      label="Signature"
                      name="signature"
                      value={formData.signature}
                      preview={signaturePreview}
                      onChange={handleUpload}
                      accept="image/png,image/jpeg,image/jpg"
                      error={errors.signature}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormFileUpload
                      label="Photo"
                      name="photo"
                      value={formData.photo}
                      preview={photoPreview}
                      onChange={handleUpload}
                      accept="image/png,image/jpeg,image/jpg"
                      error={errors.photo}
                    />
                  </div>

                  <div className="hrms-form-group d-flex gap-2 align-items-end">
                    <div className="flex-grow-1">
                      <FormSelect
                        label="Assign ID Card"
                        name="assignIdCard"
                        value={formData.assignIdCard}
                        onChange={handleChange}
                        options={optionsFrom(["Staff", "Employee", "Visitor"])}
                      />
                    </div>

                    <button
                      type="button"
                      className="hrms-icon-button employee-preview-button"
                      aria-label="Preview ID card"
                      onClick={() =>
                        window.alert("ID card preview will be connected later.")
                      }
                    >
                      <FiEye />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
                    FORM FOOTER
                ====================================================== */}

          <div className="hrms-form-section-footer">
            <FormButton
              type="button"
              variant="secondary"
              onClick={onBackToList}
              aria-label="Back to Employee List"
            >
              List
            </FormButton>

            <FormButton type="submit" variant="primary">
              Save
            </FormButton>
          </div>
        </form>
      </div>
    </>
  );
}

export default EmployeeDetails;
