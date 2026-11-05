import { useState } from "react";

import { FiShield, FiEye } from "react-icons/fi";

import FormInput from "../../../../../common/components/Form/FormInput";
import FormSelect from "../../../../../common/components/Form/FormSelect";
import FormCheckbox from "../../../../../common/components/Form/FormCheckbox";
import FormButton from "../../../../../common/components/Form/FormButton";
import FormToggleBtn from "../../../../../common/components/FormToggleBtn/FormToggleBtn";
import useSectionAnimation from "../../../../../common/hooks/useSectionAnimation";
import DynamicCalendar from "../../../../../common/components/calendar/DynamicCalendar";

import statutoryDetailsSchema from "../../../validations/statutoryDetailsSchema";
/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
  // CTC Details
  orgBank: "",
  salaryMode: "",
  groupName: "",
  bonusGroup: "",

  // PT Details
  ptCodeEnabled: false,
  ptCode: "",
  ptMaster: "",

  // LWF Details
  lwfCodeEnabled: false,
  lwfCode: "",
  lwfMaster: "",

  // ESIC Details
  esicCodeEnabled: false,
  esicCode: "",
  esicNo: "",
  oldEsicNoEnabled: false,
  oldEsicNo: "",
  esicClosingDate: "",

  // Gratuity
  gratuityEnabled: false,
  gratuityNo: "",

  // PF Details
  pfCodeEnabled: false,
  pfCode: "",
  pfLimit: "",
  pfWagesEnabled: false,
  pfWages: "",
  pfNo: "",
  oldUanNo: false,
  linkWithPfCode: false,
  uanNo: "",

  // Nominee 1
  relationWithNominee1: "",
  nominee1Name: "",
  nominee1Dob: "",
  nominee1PfShare: "",
  nominee1Address: "",
  nominee1Guardian: "",

  // Nominee 2
  relationWithNominee2: "",
  nominee2Name: "",
  nominee2Dob: "",
  nominee2PfShare: "",
  nominee2Address: "",
  nominee2Guardian: "",

  // Previous Employment
  earlierPfMember: false,
  earlierPensionMember: false,
  previousPfNo: "",
  pfExitDate: "",
  schemeCertificateNo: "",
  ppoNumber: "",
};

/* =========================================================
   OPTIONS
========================================================= */

const optionsFrom = (values) =>
  values.map((value) => ({
    value,
    label: value,
  }));

const orgBankOptions = optionsFrom(["HDFC", "ICICI", "IDFC"]);
const salaryModeOptions = optionsFrom(["Bank", "Cash", "Cheque"]);
const groupNameOptions = optionsFrom(["Staff", "Daily Basis"]);
const bonusGroupOptions = optionsFrom([]);

const ptCodeOptions = optionsFrom(["Female", "Male"]);

const lwfCodeOptions = optionsFrom(["LWFCODE"]);

const genderOptions = optionsFrom(["Male", "Female", "Other"]);

const pfCodeOptions = optionsFrom(["PUPUN35806000"]);

const pfWagesOptions = optionsFrom(["Staff"]);

const pfLimitOptions = optionsFrom(["Applicable", "Not Applicable"]);

const relationOptions = optionsFrom([ "Father", "Mother", "Spouse", "Son", "Daughter", "Brother", "Sister", "Other", ]);

/* =========================================================
   COMPONENT
========================================================= */

function StatutoryDetails({ onBackToList }) {
  const [isStatutoryOpen, setIsStatutoryOpen] = useState(true);

  const statutoryBodyRef = useSectionAnimation(isStatutoryOpen);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
const [hasSubmitted, setHasSubmitted] = useState(false);

  /* =========================================================
     HANDLE INPUT CHANGES
  ========================================================= */

  /* =========================================================
   VALIDATION HELPERS
========================================================= */

const getValidationErrors = (data) => {
  const result = statutoryDetailsSchema.safeParse(data);
  const nextErrors = {};

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0];

      if (field && !nextErrors[field]) {
        nextErrors[field] = issue.message;
      }
    });
  }

  return nextErrors;
};

const validateForm = (data = formData) => {
  const nextErrors = getValidationErrors(data);

  setErrors(nextErrors);

  return Object.keys(nextErrors).length === 0;
};

/* =========================================================
   HANDLE INPUT CHANGES
========================================================= */



const handleChange = (event) => {
  const { name, value, type, checked, files } = event.target;

  const newValue =
    type === "checkbox"
      ? checked
      : type === "file"
        ? files?.[0] || null
        : value;

  setFormData((prev) => {
    const updatedData = {
      ...prev,
      [name]: newValue,
    };

    const dependentFields = {
      ptCodeEnabled: ["ptCode", "ptMaster"],
      lwfCodeEnabled: ["lwfCode", "lwfMaster"],
      esicCodeEnabled: ["esicCode", "esicNo"],
      oldEsicNoEnabled: ["oldEsicNo", "esicClosingDate"],
      gratuityEnabled: ["gratuityNo"],
      pfCodeEnabled: [
        "pfCode",
        "pfLimit",
        "pfWagesEnabled",
        "pfWages",
        "pfNo",
        "oldUanNo",
        "linkWithPfCode",
        "uanNo",
        "relationWithNominee1",
        "nominee1Name",
        "nominee1Dob",
        "nominee1PfShare",
        "nominee1Address",
        "nominee1Guardian",
        "relationWithNominee2",
        "nominee2Name",
        "nominee2Dob",
        "nominee2PfShare",
        "nominee2Address",
        "nominee2Guardian",
      ],
      pfWagesEnabled: ["pfWages"],
    };

    const clearedFields =
      type === "checkbox" && !checked
        ? dependentFields[name] || []
        : [];

    clearedFields.forEach((field) => {
      updatedData[field] =
        typeof initialFormData[field] === "boolean" ? false : "";
    });

    // Revalidate after the state change, so errors update immediately.
    const nextErrors = getValidationErrors(updatedData);

    // Remove errors for fields cleared by unchecking a checkbox.
    clearedFields.forEach((field) => {
      delete nextErrors[field];
    });

    setErrors((prevErrors) => {
      // Before the user first submits, don't show new errors for untouched fields.
      if (!hasSubmitted) {
        const mergedErrors = { ...prevErrors };

        // Update the changed field's error.
        if (nextErrors[name]) {
          mergedErrors[name] = nextErrors[name];
        } else {
          delete mergedErrors[name];
        }

        // Update errors for cleared fields.
        clearedFields.forEach((field) => {
          delete mergedErrors[field];
        });

        // Update related errors when PF share values change.
        if (
          ["nominee1PfShare", "nominee2PfShare"].includes(name) ||
          name === "pfCodeEnabled"
        ) {
          ["nominee1PfShare", "nominee2PfShare"].forEach((field) => {
            if (nextErrors[field]) {
              mergedErrors[field] = nextErrors[field];
            } else {
              delete mergedErrors[field];
            }
          });
        }

        return mergedErrors;
      }

      // After submission, keep all validation errors in sync.
      return nextErrors;
    });

    return updatedData;
  });
};


/* =========================================================
   RESET FORM
========================================================= */

const handleReset = () => {
  setFormData({ ...initialFormData });
  setErrors({});
  setHasSubmitted(false);
};

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="hrms-form-container statutory-details-page">
      <form
  className="statutory-details-form"
  onSubmit={(event) => {
    event.preventDefault();

    setHasSubmitted(true);

    if (!validateForm()) {
      setIsStatutoryOpen(true);
      return;
    }

    // API integration can be added here later.
    console.log("Statutory Details:", formData);
  }}
>
        {/* =====================================================
            STATUTORY DETAILS
        ====================================================== */}

        <section className="hrms-form-section-card">
          <div className="hrms-form-section-header">
            <div className="hrms-section-heading-group">
              <div className="hrms-form-section-icon">
                <FiShield size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">Statutory Details</h3>

                <div className="employee-information">
                  <span>Mr.Krishna - TS012 (Software developer - UI/UX)</span>
                </div>
              </div>
            </div>

            <FormToggleBtn
              isOpen={isStatutoryOpen}
              onClick={() => setIsStatutoryOpen((previous) => !previous)}
            />
          </div>

          <div
            ref={statutoryBodyRef}
            className={`hrms-form-section-collapse ${
              isStatutoryOpen ? "is-open" : ""
            }`}
          >
            <div className="hrms-form-section-body">
              {/* PT, LWF AND ESIC DETAILS */}
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormSelect
                    label="Organization Bank"
                    name="orgBank"
                    value={formData.orgBank}
                    onChange={handleChange}
                    options={orgBankOptions}
                    required
                    error={errors.orgBank}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormSelect
                    label="Salary Mode"
                    name="salaryMode"
                    value={formData.salaryMode}
                    onChange={handleChange}
                    options={salaryModeOptions}
                    required
                    error={errors.salaryMode}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormSelect
                    label="Group Name"
                    name="groupName"
                    value={formData.groupName}
                    onChange={handleChange}
                    options={groupNameOptions}
                    required
                    error={errors.groupName}
                  />
                </div>
                <div className="hrms-form-group">
                  <div className="d-flex gap-2 align-items-end">
                    <div className="flex-grow-1">
                    <FormSelect
                      label="Bonus Group"
                      name="bonusGroup"
                      value={formData.bonusGroup}
                      onChange={handleChange}
                      options={bonusGroupOptions}
                    />
                  </div>

                  <button
                    type="button"
                    className="hrms-icon-button"
                    aria-label="Preview bonus group"
                    onClick={() =>
                      window.alert(
                        "Bonus group preview will be connected later.",
                      )
                    }
                  >
                    <FiEye size={19} />
                  </button>
                  </div>
                  
                </div>

                <div className="hrms-form-group">
                  <FormCheckbox
                    label="PT Code"
                    name="ptCodeEnabled"
                    checked={formData.ptCodeEnabled}
                    onChange={handleChange}
                    
                  />

                  <FormSelect
                    label=""
                    name="ptCode"
                    value={formData.ptCode}
                    onChange={handleChange}
                    options={ptCodeOptions}
                    disabled={!formData.ptCodeEnabled}
                    error={errors.ptCode}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormSelect
                    label="PT MASTER"
                    name="ptMaster"
                    value={formData.ptMaster}
                    onChange={handleChange}
                    options={genderOptions}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormCheckbox
                    label="LWF Code"
                    name="lwfCodeEnabled"
                    checked={formData.lwfCodeEnabled}
                    onChange={handleChange}
                  />

                  <FormSelect
                    label=""
                    name="lwfCode"
                    value={formData.lwfCode}
                    onChange={handleChange}
                    options={lwfCodeOptions}
                    disabled={!formData.lwfCodeEnabled}
                    error={errors.lwfCode}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormSelect
                    label="LWF MASTER"
                    name="lwfMaster"
                    value={formData.lwfMaster}
                    onChange={handleChange}
                    options={genderOptions}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormCheckbox
                    label="ESIC Code"
                    name="esicCodeEnabled"
                    checked={formData.esicCodeEnabled}
                    onChange={handleChange}
                  />

                  <FormSelect
                    label=""
                    name="esicCode"
                    value={formData.esicCode}
                    onChange={handleChange}
                    options={optionsFrom(["3300131530000999"])}
                    disabled={!formData.esicCodeEnabled}
                    error={errors.esicCode}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="ESIC No"
                    name="esicNo"
                    type="number"
                    value={formData.esicNo}
                    onChange={handleChange}
                    placeholder="Enter ESIC No"
                    disabled={!formData.esicCodeEnabled}
                    error={errors.esicNo}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormCheckbox
                    label="Old ESIC No"
                    name="oldEsicNoEnabled"
                    checked={formData.oldEsicNoEnabled}
                    onChange={handleChange}
                  />
                  <FormInput
                    label=""
                    name="oldEsicNo"
                    type="number"
                    value={formData.oldEsicNo}
                    onChange={handleChange}
                    disabled={!formData.oldEsicNoEnabled}
                    placeholder="Enter Old ESIC No"
                    error={errors.oldEsicNo}
                  />
                </div>

                <div className="hrms-form-group">
                  <DynamicCalendar
                    mode="dd-mm-yyyy"
                    label="ESIC Closing Date"
                    name="esicClosingDate"
                    value={formData.esicClosingDate}
                    onChange={handleChange}
                    disabled={!formData.oldEsicNoEnabled}
                    placeholder="dd/mm/yyyy"
                    error={errors.esicClosingDate}
                  />
                </div>

                {/* GRATUITY AND PF */}

                <div className="hrms-form-group">
                  <FormCheckbox
                    label="Gratuity"
                    name="gratuityEnabled"
                    checked={formData.gratuityEnabled}
                    onChange={handleChange}
                  />

                  <FormInput
                    label=""
                    name="gratuityNo"
                    value={formData.gratuityNo}
                    onChange={handleChange}
                    placeholder="Enter Gratuity No"
                    disabled={!formData.gratuityEnabled}
                    error={errors.gratuityNo}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormCheckbox
                    label="PF Code"
                    name="pfCodeEnabled"
                    checked={formData.pfCodeEnabled}
                    onChange={handleChange}
                  />

                  <FormSelect
                    label=""
                    name="pfCode"
                    value={formData.pfCode}
                    onChange={handleChange}
                    options={pfCodeOptions}
                    disabled={!formData.pfCodeEnabled}
                    error={errors.pfCode}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormSelect
                    label="PF Limit"
                    name="pfLimit"
                    value={formData.pfLimit}
                    onChange={handleChange}
                    options={pfLimitOptions}
                    disabled={!formData.pfCodeEnabled}
                    error={errors.pfLimit}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormSelect
                    label="PF Wages"
                    name="pfWages"
                    value={formData.pfWages}
                    onChange={handleChange}
                    options={pfWagesOptions}
                    disabled={!formData.pfCodeEnabled}
                    error={errors.pfWages}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="PF No"
                    name="pfNo"
                    value={formData.pfNo}
                    onChange={handleChange}
                    placeholder="Enter PF No"
                    disabled={!formData.pfCodeEnabled}
                    error={errors.pfNo}
                  />
                </div>

                <div className="hrms-form-group d-flex justify-content-md-around justify-content-between">
                  <FormCheckbox
                    label="Old UAN No"
                    name="oldUanNo"
                    checked={formData.oldUanNo}
                    onChange={handleChange}
                  />

                  <FormCheckbox
                    label="Link With PF Code"
                    name="linkWithPfCode"
                    checked={formData.linkWithPfCode}
                    onChange={handleChange}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="UAN No"
                    name="uanNo"
                    type="number"
                    value={formData.uanNo}
                    onChange={handleChange}
                    placeholder="Enter UAN No"
                    disabled={!formData.pfCodeEnabled}
                    error={errors.uanNo}
                  />
                </div>
              </div>
              <hr></hr>
              {/* NOMINEE 1 */}
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormSelect
                    label="Relation with Nominee 1"
                    name="relationWithNominee1"
                    value={formData.relationWithNominee1}
                    onChange={handleChange}
                    options={relationOptions}
                    disabled={!formData.pfCodeEnabled}
                    error={errors.relationWithNominee1}

                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="Nominee 1 Name"
                    name="nominee1Name"
                    value={formData.nominee1Name}
                    onChange={handleChange}
                    placeholder="Enter Nominee Name"
                    disabled={!formData.pfCodeEnabled}
                    error={errors.nominee1Name}
                  />
                </div>

                <div className="hrms-form-group">
                  <DynamicCalendar
                    mode="dd-mm-yyyy"
                    label="Date Of Birth"
                    name="nominee1Dob"
                    value={formData.nominee1Dob}
                    onChange={handleChange}
                    placeholder="dd/mm/yyyy"
                    disabled={!formData.pfCodeEnabled}
                    error={errors.nominee1Dob}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="Address"
                    name="nominee1Address"
                    value={formData.nominee1Address}
                    onChange={handleChange}
                    placeholder="Enter Address"
                    disabled={!formData.pfCodeEnabled}
                    error={errors.nominee1Address}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="PF Share %"
                    name="nominee1PfShare"
                    value={formData.nominee1PfShare}
                    onChange={handleChange}
                    placeholder="Enter PF Share"
                    type="number"
                    disabled={!formData.pfCodeEnabled}
                    error={errors.nominee1PfShare}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="Guardian"
                    name="nominee1Guardian"
                    value={formData.nominee1Guardian}
                    onChange={handleChange}
                    placeholder="Enter Guardian Name"
                    disabled={!formData.pfCodeEnabled}
                  />
                </div>
              </div>
              <hr></hr>
              {/* NOMINEE 2 */}
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormSelect
                    label="Relation with Nominee 2"
                    name="relationWithNominee2"
                    value={formData.relationWithNominee2}
                    onChange={handleChange}
                    options={relationOptions}
                    disabled={!formData.pfCodeEnabled}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="Nominee 2 Name"
                    name="nominee2Name"
                    value={formData.nominee2Name}
                    onChange={handleChange}
                    placeholder="Enter Nominee Name"
                    disabled={!formData.pfCodeEnabled}
                  />
                </div>

                <div className="hrms-form-group">
                  <DynamicCalendar
                    mode="dd-mm-yyyy"
                    label="Date Of Birth"
                    name="nominee2Dob"
                    value={formData.nominee2Dob}
                    onChange={handleChange}
                    placeholder="dd/mm/yyyy"
                    disabled={!formData.pfCodeEnabled}
                    error={errors.nominee2Dob}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="Address"
                    name="nominee2Address"
                    value={formData.nominee2Address}
                    onChange={handleChange}
                    placeholder="Enter Address"
                    disabled={!formData.pfCodeEnabled}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="PF Share %"
                    name="nominee2PfShare"
                    value={formData.nominee2PfShare}
                    onChange={handleChange}
                    placeholder="Enter PF Share"
                    type="number"
                    disabled={!formData.pfCodeEnabled}
                    error={errors.nominee2PfShare}
                  />
                </div>

                <div className="hrms-form-group">
                  <FormInput
                    label="Guardian"
                    name="nominee2Guardian"
                    value={formData.nominee2Guardian}
                    onChange={handleChange}
                    placeholder="Enter Guardian Name"
                    disabled={!formData.pfCodeEnabled}
                  />
                </div>
              </div>
              <hr></hr>
              {/* PREVIOUS EMPLOYMENT */}
              <div className="hrms-form-group mb-3">
                <FormCheckbox
                  label="Whether Earlier A Member Of The Employees Provident Funds Schemes, 1952?"
                  name="earlierPfMember"
                  checked={formData.earlierPfMember}
                  onChange={handleChange}
                />
              </div>
              <div className="hrms-form-group mb-3">
                <FormCheckbox
                  label="Whether Earlier A Member Of The Employees Pension Funds Schemes, 1995?"
                  name="earlierPensionMember"
                  checked={formData.earlierPensionMember}
                  onChange={handleChange}
                />
              </div>
              <div className="hrms-form-row-3">
                <div className="hrms-form-group">
                  <FormInput
                    label="Previous PF No"
                    name="previousPfNo"
                    value={formData.previousPfNo}
                    onChange={handleChange}
                    placeholder="Enter Previous PF No"
                    error={errors.previousPfNo}
                  />
                </div>

                <div className="hrms-form-group">
                  <DynamicCalendar
                    mode="dd-mm-yyyy"
                    label="PF Exit Date"
                    name="pfExitDate"
                    value={formData.pfExitDate}
                    onChange={handleChange}
                    placeholder="dd/mm/yyyy"
                    error={errors.pfExitDate}
                  />
                </div>
              </div>
              <hr></hr>
              {/* SCHEME CERTIFICATE & PENSION PAYMENT ORDER */}
              <div className="d-flex flex-column flex-md-row gap-2 mt-3">
                {/* SCHEME CERTIFICATE CARD */}

                <div className="hrms-form-section-card mb-0">
                  <div className="hrms-form-section-header">
                    <div className="hrms-form-section-heading">
                      <h3 className="hrms-form-section-title">
                        A) Scheme Certificate
                      </h3>
                    </div>
                  </div>

                  <div className="hrms-form-section-body">
                    <p>If Scheme Certificate Issued for Previous Employment</p>

                    <div className="hrms-form-group">
                      <FormInput
                        label="Then Scheme Certificate Number"
                        name="schemeCertificateNo"
                        value={formData.schemeCertificateNo}
                        onChange={handleChange}
                        placeholder="Enter PF Certificate No"
                        error={errors.schemeCertificateNo}
                      />
                    </div>
                  </div>
                </div>

                {/* PENSION PAYMENT ORDER CARD */}

                <div className="hrms-form-section-card">
                  <div className="hrms-form-section-header">
                    <div className="hrms-form-section-heading">
                      <h3 className="hrms-form-section-title">
                        B) Pension Payment Order (PPO)
                      </h3>
                    </div>
                  </div>

                  <div className="hrms-form-section-body">
                    <p>
                      If Pension Payment Order (PPO) Issued for Previous
                      Employment
                    </p>

                    <div className="hrms-form-group">
                      <FormInput
                        label="Previous Employment PPO Number"
                        name="ppoNumber"
                        value={formData.ppoNumber}
                        onChange={handleChange}
                        placeholder="Enter PF PPO"
                        error={errors.ppoNumber}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FORM FOOTER */}

        <div className="hrms-form-section-footer">
          <FormButton
            type="button"
            variant="secondary"
            onClick={onBackToList}
            aria-label="Back to list"
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

export default StatutoryDetails;
