import { useState, useRef } from "react";
import { FiMapPin, FiSearch, FiCreditCard } from "react-icons/fi";

import FormInput from "../../../../../common/components/Form/FormInput";
import FormButton from "../../../../../common/components/Form/FormButton";
import FormToggleBtn from "../../../../../common/components/FormToggleBtn/FormToggleBtn";
import FormPasswordInput from "../../../../../common/components/Form/FormPasswordInput";
import employeeBankSchema from "../../../validations/employeeBankSchema";

function EmployeeBank({ employee, onBackToList, onSave }) {
  /* =========================================================
     SECTION TOGGLE STATES
  ========================================================= */

  const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(true);
  const [isAddressOpen, setIsAddressOpen] = useState(true);

  const bankDetailsBodyRef = useRef(null);
  const addressBodyRef = useRef(null);

  /* =========================================================
     INITIAL FORM DATA
  ========================================================= */

  const initialBankData = {
    ifscCode: "",
    bankName: "",
    accountNo: "",
  };

  const initialAddressData = {
    pinCode: "",
    postOffice: "",
    state: "",
    city: "",
    district: "",
    address: "",
    taluka: "",
  };

  const [salaryBank, setSalaryBank] = useState({
    ...initialBankData,
  });

  const [personalBank, setPersonalBank] = useState({
    ...initialBankData,
  });

  const [permanentAddress, setPermanentAddress] = useState({
    ...initialAddressData,
  });

  const [presentAddress, setPresentAddress] = useState({
    ...initialAddressData,
  });

  /* =========================================================
     SAME AS ABOVE STATES
  ========================================================= */

  const [sameBank, setSameBank] = useState(false);
  const [sameAddress, setSameAddress] = useState(false);

  /* =========================================================
     VALIDATION ERRORS
  ========================================================= */

  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  /* =========================================================
     BUILD FORM DATA
  ========================================================= */

  const buildFormData = (overrides = {}) => ({
    salaryBank,
    personalBank,
    permanentAddress,
    presentAddress,
    sameBank,
    sameAddress,
    ...overrides,
  });

  /* =========================================================
     VALIDATE FORM DATA
  ========================================================= */

  const getValidationErrors = (formData) => {
    const result = employeeBankSchema.safeParse(formData);
    const validationErrors = {};

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const errorKey = issue.path.join(".");

        if (!validationErrors[errorKey]) {
          validationErrors[errorKey] = issue.message;
        }
      });
    }

    return {
      isValid: result.success,
      data: result.success ? result.data : null,
      errors: validationErrors,
    };
  };

  /* =========================================================
     REAL-TIME FIELD VALIDATION
  ========================================================= */

  const validateChangedField = (section, field, formData) => {
    const validation = getValidationErrors(formData);
    const errorKey = `${section}.${field}`;
    const fieldError = validation.errors[errorKey];

    setErrors((prev) => {
      // Once Save has been attempted, keep every field's
      // validation state updated as the user corrects fields.
      if (hasSubmitted) {
        return validation.errors;
      }

      const updatedErrors = { ...prev };

      if (fieldError) {
        updatedErrors[errorKey] = fieldError;
      } else {
        delete updatedErrors[errorKey];
      }

      return updatedErrors;
    });
  };

  /* =========================================================
     CLEAR SECTION ERRORS
  ========================================================= */

  const clearSectionErrors = (section) => {
    setErrors((prev) => {
      const updatedErrors = { ...prev };

      Object.keys(updatedErrors).forEach((key) => {
        if (key.startsWith(`${section}.`)) {
          delete updatedErrors[key];
        }
      });

      return updatedErrors;
    });
  };

  /* =========================================================
     EMPLOYEE INFORMATION
  ========================================================= */

  const employeeName = employee?.name || "Mr.Tiger";
  const employeeNo = employee?.empId || "223443397";
  const employeeDesignation =
    employee?.designation || "Sr.Developer - Back office";

  const employeeInformation = `${
    employee?.title ? `${employee.title} ` : ""
  }${employeeName} - ${employeeNo} (${employeeDesignation})`;

  /* =========================================================
     HANDLE BANK FIELD CHANGES
  ========================================================= */

  const handleBankChange = (section, name, value) => {
    const errorSection = section === "salary" ? "salaryBank" : "personalBank";

    let nextSalaryBank = salaryBank;
    let nextPersonalBank = personalBank;

    if (section === "salary") {
      nextSalaryBank = {
        ...salaryBank,
        [name]: value,
      };

      setSalaryBank(nextSalaryBank);

      if (sameBank) {
        nextPersonalBank = {
          ...personalBank,
          [name]: value,
        };

        setPersonalBank(nextPersonalBank);
      }
    } else {
      nextPersonalBank = {
        ...personalBank,
        [name]: value,
      };

      setPersonalBank(nextPersonalBank);
    }

    const formData = buildFormData({
      salaryBank: nextSalaryBank,
      personalBank: nextPersonalBank,
    });

    validateChangedField(errorSection, name, formData);

    if (section === "salary" && sameBank) {
      validateChangedField("personalBank", name, formData);
    }
  };

  /* =========================================================
     HANDLE ADDRESS FIELD CHANGES
  ========================================================= */

  const handleAddressChange = (section, name, value) => {
    const errorSection =
      section === "permanent" ? "permanentAddress" : "presentAddress";

    let nextPermanentAddress = permanentAddress;
    let nextPresentAddress = presentAddress;

    if (section === "permanent") {
      nextPermanentAddress = {
        ...permanentAddress,
        [name]: value,
      };

      setPermanentAddress(nextPermanentAddress);

      if (sameAddress) {
        nextPresentAddress = {
          ...presentAddress,
          [name]: value,
        };

        setPresentAddress(nextPresentAddress);
      }
    } else {
      nextPresentAddress = {
        ...presentAddress,
        [name]: value,
      };

      setPresentAddress(nextPresentAddress);
    }

    const formData = buildFormData({
      permanentAddress: nextPermanentAddress,
      presentAddress: nextPresentAddress,
    });

    validateChangedField(errorSection, name, formData);

    if (section === "permanent" && sameAddress) {
      validateChangedField("presentAddress", name, formData);
    }
  };

  /* =========================================================
     SAME AS ABOVE HANDLERS
  ========================================================= */

  const handleSameBank = (checked) => {
    setSameBank(checked);

    if (checked) {
      const copiedPersonalBank = { ...salaryBank };

      setPersonalBank(copiedPersonalBank);

      const formData = buildFormData({
        personalBank: copiedPersonalBank,
        sameBank: true,
      });

      const validation = getValidationErrors(formData);

      setErrors((prev) => {
        if (hasSubmitted) {
          return validation.errors;
        }

        const updatedErrors = { ...prev };

        Object.keys(updatedErrors).forEach((key) => {
          if (key.startsWith("personalBank.")) {
            delete updatedErrors[key];
          }
        });

        return updatedErrors;
      });
    }
  };

  const handleSameAddress = (checked) => {
    setSameAddress(checked);

    if (checked) {
      const copiedPresentAddress = { ...permanentAddress };

      setPresentAddress(copiedPresentAddress);

      const formData = buildFormData({
        presentAddress: copiedPresentAddress,
        sameAddress: true,
      });

      const validation = getValidationErrors(formData);

      setErrors((prev) => {
        if (hasSubmitted) {
          return validation.errors;
        }

        const updatedErrors = { ...prev };

        Object.keys(updatedErrors).forEach((key) => {
          if (key.startsWith("presentAddress.")) {
            delete updatedErrors[key];
          }
        });

        return updatedErrors;
      });
    }
  };

  /* =========================================================
     REUSABLE BANK FIELDS
  ========================================================= */

  const renderBankFields = (data, section, isPersonal = false) => {
    const schemaSection = isPersonal ? "personalBank" : "salaryBank";

    const change = (name, value) => {
      handleBankChange(section, name, value);
    };

    return (
      <div className="hrms-form-row-3">
        {/* IFSC CODE */}
        <div className="hrms-form-group">
          <div
            className={`d-flex gap-2 ${
              errors[`${schemaSection}.ifscCode`]
                ? "align-items-center"
                : "align-items-end"
            }`}
          >
            <div className="flex-grow-1">
              <FormInput
                label="IFSC Code"
                name={`${section}-ifscCode`}
                value={data.ifscCode}
                onChange={(e) =>
                  change("ifscCode", e.target.value.toUpperCase())
                }
                required={!isPersonal}
                placeholder="Enter IFSC Code"
                error={errors[`${schemaSection}.ifscCode`]}
              />
            </div>

            <button
              type="button"
              className="hrms-icon-button"
              aria-label="Search IFSC code"
              title="Search IFSC code"
              onClick={() => {
                // Connect your IFSC lookup API here.
              }}
            >
              <FiSearch size={17} />
            </button>
          </div>
        </div>

        {/* BANK NAME */}
        <div className="hrms-form-group">
          <FormInput
            label="Bank Name"
            name={`${section}-bankName`}
            value={data.bankName}
            onChange={(e) => change("bankName", e.target.value)}
            required={!isPersonal}
            placeholder="Enter Bank Name"
            error={errors[`${schemaSection}.bankName`]}
          />
        </div>

        {/* ACCOUNT NUMBER */}
        <div className="hrms-form-group">
          <FormPasswordInput
            label="Account No"
            name={`${section}-accountNo`}
            type="text"
            numbersOnly
            value={data.accountNo}
            onChange={(e) => change("accountNo", e.target.value)}
            required={!isPersonal}
            placeholder="Enter Account Number"
            error={errors[`${schemaSection}.accountNo`]}
          />
        </div>
      </div>
    );
  };

  /* =========================================================
     REUSABLE ADDRESS FIELDS
  ========================================================= */

  const renderAddressFields = (data, section, isPresent = false) => {
    const schemaSection = isPresent ? "presentAddress" : "permanentAddress";

    const change = (name, value) => {
      handleAddressChange(section, name, value);
    };

    return (
      <div className="hrms-form-row-3">
        {/* PIN CODE */}
        <div className="hrms-form-group">
          <div
            className={`d-flex gap-2 ${
              errors[`${schemaSection}.pinCode`]
                ? "align-items-center"
                : "align-items-end"
            }`}
          >
            <div className="flex-grow-1">
              <FormInput
                label="Pin Code"
                name={`${section}-pinCode`}
                type="number"
                value={data.pinCode}
                onChange={(e) => change("pinCode", e.target.value)}
                required={!isPresent}
                placeholder="Enter Pin Code"
                error={errors[`${schemaSection}.pinCode`]}
              />
            </div>

            <button
              type="button"
              className="hrms-icon-button"
              aria-label="Search pin code"
              title="Search pin code"
              onClick={() => {
                // Connect your Pin Code lookup API here.
              }}
            >
              <FiSearch size={17} />
            </button>
          </div>
        </div>

        {/* POST OFFICE */}
        <div className="hrms-form-group">
          <FormInput
            label="Post Office"
            name={`${section}-postOffice`}
            value={data.postOffice}
            onChange={(e) => change("postOffice", e.target.value)}
            required={!isPresent}
            placeholder="Enter Post Office"
            error={errors[`${schemaSection}.postOffice`]}
          />
        </div>

        {/* STATE */}
        <div className="hrms-form-group">
          <FormInput
            label="State"
            name={`${section}-state`}
            value={data.state}
            onChange={(e) => change("state", e.target.value)}
            required={!isPresent}
            placeholder="Enter State"
            error={errors[`${schemaSection}.state`]}
          />
        </div>

        {/* CITY */}
        <div className="hrms-form-group">
          <FormInput
            label="City"
            name={`${section}-city`}
            value={data.city}
            onChange={(e) => change("city", e.target.value)}
            required={!isPresent}
            placeholder="Enter City"
            error={errors[`${schemaSection}.city`]}
          />
        </div>

        {/* DISTRICT */}
        <div className="hrms-form-group">
          <FormInput
            label="District"
            name={`${section}-district`}
            value={data.district}
            onChange={(e) => change("district", e.target.value)}
            required={!isPresent}
            placeholder="Enter District"
            error={errors[`${schemaSection}.district`]}
          />
        </div>

        {/* ADDRESS */}
        <div className="hrms-form-group">
          <FormInput
            label="Address"
            name={`${section}-address`}
            value={data.address}
            onChange={(e) => change("address", e.target.value)}
            required={!isPresent}
            placeholder="Enter Address"
            error={errors[`${schemaSection}.address`]}
          />
        </div>

        {/* TALUKA */}
        <div className="hrms-form-group">
          <FormInput
            label="Taluka"
            name={`${section}-taluka`}
            value={data.taluka}
            onChange={(e) => change("taluka", e.target.value)}
            placeholder="Enter Taluka"
            required={!isPresent}
            error={errors[`${schemaSection}.taluka`]}
          />
        </div>
      </div>
    );
  };

  /* =========================================================
     VALIDATE AND SAVE FORM
  ========================================================= */

  const handleSave = (event) => {
    event.preventDefault();

    setHasSubmitted(true);

    const validation = getValidationErrors(buildFormData());

    setErrors(validation.errors);

    if (!validation.isValid) {
      const errorKeys = Object.keys(validation.errors);

      const hasBankErrors = errorKeys.some(
        (key) =>
          key.startsWith("salaryBank.") || key.startsWith("personalBank."),
      );

      const hasAddressErrors = errorKeys.some(
        (key) =>
          key.startsWith("permanentAddress.") ||
          key.startsWith("presentAddress."),
      );

      if (hasBankErrors) setIsBankDetailsOpen(true);
      if (hasAddressErrors) setIsAddressOpen(true);

      return;
    }

    if (onSave) {
      onSave(validation.data);
    } else {
      console.log("Employee Bank Details:", validation.data);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <form className="hrms-form-container" onSubmit={handleSave} noValidate>
      {/* =====================================================
          1. BANK DETAILS
      ===================================================== */}

      <div className="hrms-form-section-card">
        <div className="hrms-form-section-header">
          <div className="hrms-section-heading-group">
            <div className="hrms-form-section-icon">
              <FiCreditCard size={19} />
            </div>

            <div className="hrms-form-section-heading">
              <h3 className="hrms-form-section-title">1. Bank Details</h3>

              <div className="employee-information">
                <span>{employeeInformation}</span>
              </div>
            </div>
          </div>

          <FormToggleBtn
            isOpen={isBankDetailsOpen}
            onClick={() => setIsBankDetailsOpen((prev) => !prev)}
          />
        </div>

        <div
          ref={bankDetailsBodyRef}
          className={`hrms-form-section-collapse ${
            isBankDetailsOpen ? "is-open" : ""
          }`}
        >
          <div className="hrms-form-section-body">
            {/* SALARY BANK DETAILS */}
            <section className="mb-4">
              <h3 className="hrms-form-section-title mb-3">Salary</h3>

              {renderBankFields(salaryBank, "salary")}
            </section>

            <hr />

            {/* PERSONAL BANK DETAILS */}
            <section>
              <div className="d-flex justify-content-between mb-3">
                <h3 className="hrms-form-section-title">Personal</h3>

                <FormButton
                  type="button"
                  variant="primary"
                  onClick={() => handleSameBank(!sameBank)}
                >
                  Same as Above
                </FormButton>
              </div>

              {renderBankFields(personalBank, "personal", true)}
            </section>
          </div>
        </div>
      </div>

      {/* =====================================================
          2. ADDRESS DETAILS
      ===================================================== */}

      <div className="hrms-form-section-card">
        <div className="hrms-form-section-header">
          <div className="hrms-section-heading-group">
            <div className="hrms-form-section-icon">
              <FiMapPin size={19} />
            </div>

            <div className="hrms-form-section-heading">
              <h3 className="hrms-form-section-title">2. Address Details</h3>

              <div className="employee-information">
                <span>{employeeInformation}</span>
              </div>
            </div>
          </div>

          <FormToggleBtn
            isOpen={isAddressOpen}
            onClick={() => setIsAddressOpen((prev) => !prev)}
          />
        </div>

        <div
          ref={addressBodyRef}
          className={`hrms-form-section-collapse ${
            isAddressOpen ? "is-open" : ""
          }`}
        >
          <div className="hrms-form-section-body">
            {/* PERMANENT ADDRESS */}
            <section className="mb-4">
              <h3 className="hrms-form-section-title mb-3">
                Permanent Address
              </h3>

              {renderAddressFields(permanentAddress, "permanent")}
            </section>

            <hr />

            {/* PRESENT ADDRESS */}
            <section>
              <div className="d-flex justify-content-between mb-3">
                <h3 className="hrms-form-section-title">Present Address</h3>

                <FormButton
                  type="button"
                  variant="primary"
                  onClick={() => handleSameAddress(!sameAddress)}
                >
                  Same as Above
                </FormButton>
              </div>

              {renderAddressFields(presentAddress, "present", true)}
            </section>
          </div>
        </div>
      </div>

      {/* =====================================================
          FOOTER BUTTONS
      ===================================================== */}

      <div className="hrms-form-section-footer">
        <FormButton type="button" variant="secondary" onClick={onBackToList}>
          List
        </FormButton>

        <FormButton type="submit" variant="primary">
          Save
        </FormButton>
      </div>
    </form>
  );
}

export default EmployeeBank;
