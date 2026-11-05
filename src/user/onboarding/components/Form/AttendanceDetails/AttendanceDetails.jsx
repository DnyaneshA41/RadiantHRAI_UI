import { useState } from "react";

import { FiUser, FiCalendar, FiEye } from "react-icons/fi";

import FormInput from "../../../../../common/components/Form/FormInput";
import FormSelect from "../../../../../common/components/Form/FormSelect";
import FormMultiSelect from "../../../../../common/components/Form/FormMultiSelect";
import FormCheckbox from "../../../../../common/components/Form/FormCheckbox";
import FormButton from "../../../../../common/components/Form/FormButton";
import FormToggleBtn from "../../../../../common/components/FormToggleBtn/FormToggleBtn";
import useSectionAnimation from "../../../../../common/hooks/useSectionAnimation";
import Toast from "../../../../../common/components/Popups/Toast";
import attendanceDetailsSchema from "../../../validations/attendanceDetailsSchema";
/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
  // Attendance Details
  shiftGroup: "",
  otApplicable: false,
  otWorkingDayAndCoff: false,
  flexibleShiftApplicable: false,
  monthlyShortHrsEnabled: false,
  monthlyShortHrs: "",
  publicHolidayEligible: false,
  lateMarkEnabled: false,
  lateMark: "",
  coffApplicable: false,
  weeklyOff1: "",
  weeklyOff2: [],
  personalGatepassSetting: "",
  leaveGroup: "",
  outdoorSetting: "",
  punchMissingSetting: "",
  salaryFullDay: false,
  singlePunchPresent: false,
  regularizationRequired: false,
  defaultAttendanceShow: false,
  checkinsSetting: [],
  shortIntervalSetting: "",
  allowTracking: false,
  perDayShiftHrs: "",

  // My Service Details
  loginId: "",
  roleAccessPolicy: "Admin",
  isActive: false,
};

/* =========================================================
   OPTIONS
========================================================= */

const optionsFrom = (values) =>
  values.map((value) => ({
    value,
    label: value,
  }));

const selectPlaceholder = "--Select--";

const yesNoOptions = optionsFrom(["Yes", "No"]);

const shiftGroupOptions = optionsFrom([
  "General Shift",
  "Morning Shift",
  "Evening Shift",
  "Night Shift",
]);

const shortHoursOptions = optionsFrom(["00:15", "00:30", "00:45", "01:00"]);

const settingOptions = optionsFrom(["Applicable", "Not Applicable"]);

const gatepassOptions = optionsFrom(["Applicable", "Not Applicable"]);

const leaveGroupOptions = optionsFrom([
  "General Leave",
  "Staff Leave",
  "Management Leave",
]);

const attendanceOptions = optionsFrom(["Yes", "No"]);

const intervalOptions = optionsFrom(["00:15", "00:30", "00:45", "01:00"]);

const securityQuestionOptions = optionsFrom([
  "What is your school name?",
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What is your birthplace?",
]);

const roleAccessOptions = optionsFrom(["Admin", "HR", "Manager", "Employee"]);

const weeklyOffOptions = ["Ist", "IInd", "IIIrd", "IVth", "Vth"];

/* =========================================================
   COMPONENT
========================================================= */

function AttendanceDetails({ onBackToList }) {
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(true);
  const [isServiceOpen, setIsServiceOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const attendanceBodyRef = useSectionAnimation(isAttendanceOpen);
  const serviceBodyRef = useSectionAnimation(isServiceOpen);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // Convert Zod issues into the field-error object used by the form controls.
  const getSchemaErrors = (data) => {
    const result = attendanceDetailsSchema.safeParse(data);
    if (result.success) return {};

    return result.error.issues.reduce((fieldErrors, issue) => {
      const fieldName = issue.path[0];
      if (fieldName && !fieldErrors[fieldName]) {
        fieldErrors[fieldName] = issue.message;
      }
      return fieldErrors;
    }, {});
  };

  const validateField = (name, _value, data = formData) => {
    const schemaErrors = getSchemaErrors(data);
    setErrors((previous) => {
      const nextErrors = { ...previous };
      if (schemaErrors[name]) nextErrors[name] = schemaErrors[name];
      else delete nextErrors[name];

      // Keep dependent fields in sync when their controlling values change.
      if (name === "lateMarkEnabled" || name === "lateMark") {
        if (schemaErrors.lateMark) nextErrors.lateMark = schemaErrors.lateMark;
        else delete nextErrors.lateMark;
      }
      if (name === "monthlyShortHrsEnabled" || name === "monthlyShortHrs") {
        if (schemaErrors.monthlyShortHrs)
          nextErrors.monthlyShortHrs = schemaErrors.monthlyShortHrs;
        else delete nextErrors.monthlyShortHrs;
      }
      if (name === "weeklyOff1" || name === "weeklyOff2") {
        if (schemaErrors.weeklyOff1)
          nextErrors.weeklyOff1 = schemaErrors.weeklyOff1;
        else delete nextErrors.weeklyOff1;
        if (schemaErrors.weeklyOff2)
          nextErrors.weeklyOff2 = schemaErrors.weeklyOff2;
        else delete nextErrors.weeklyOff2;
      }
      return nextErrors;
    });
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    let fieldValue = type === "checkbox" ? checked : value;

    // weeklyOff2 is an array in the schema because it is also used by the
    // Ist/IInd/IIIrd/IVth/Vth checkbox group. Normalize its dropdown value.
    if (name === "weeklyOff2") {
      fieldValue = !value || value === "NA" ? [] : [value];
    }

    const updatedFormData = { ...formData, [name]: fieldValue };

    // Clear dependent values whenever their controlling checkbox is unchecked.
    if (name === "lateMarkEnabled" && !fieldValue) {
      updatedFormData.lateMark = "";
    }

    if (name === "monthlyShortHrsEnabled" && !fieldValue) {
      updatedFormData.monthlyShortHrs = "";
    }

    setFormData(updatedFormData);

    validateField(name, fieldValue, updatedFormData);

    // Revalidate dependent fields and clear stale errors after a checkbox is unchecked.
    if (name === "lateMarkEnabled" || name === "lateMark") {
      validateField("lateMark", updatedFormData.lateMark, updatedFormData);
      if (name === "lateMarkEnabled" && !fieldValue) {
        setErrors((previous) => {
          const nextErrors = { ...previous };
          delete nextErrors.lateMark;
          return nextErrors;
        });
      }
    }

    if (name === "monthlyShortHrsEnabled" || name === "monthlyShortHrs") {
      validateField(
        "monthlyShortHrs",
        updatedFormData.monthlyShortHrs,
        updatedFormData,
      );
      if (name === "monthlyShortHrsEnabled" && !fieldValue) {
        setErrors((previous) => {
          const nextErrors = { ...previous };
          delete nextErrors.monthlyShortHrs;
          return nextErrors;
        });
      }
    }

    if (name === "weeklyOff1") {
      validateField("weeklyOff2", updatedFormData.weeklyOff2, updatedFormData);
    }
    if (name === "weeklyOff2") {
      validateField("weeklyOff1", updatedFormData.weeklyOff1, updatedFormData);
    }
  };

  /* =========================================================
     HANDLE WEEKLY OFF CHECKBOXES
  ========================================================= */

  const handleWeeklyOffChange = (day, checked) => {
    const updatedFormData = {
      ...formData,
      weeklyOff2: checked
        ? [
            ...(Array.isArray(formData.weeklyOff2) ? formData.weeklyOff2 : []),
            day,
          ]
        : (Array.isArray(formData.weeklyOff2)
            ? formData.weeklyOff2
            : []
          ).filter((item) => item !== day),
    };
    setFormData(updatedFormData);
    validateField("weeklyOff2", updatedFormData.weeklyOff2, updatedFormData);
  };

  /* =========================================================
     RESET FORM
  ========================================================= */

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setToast(null);
    setShowPassword(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = getSchemaErrors(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      if (
        Object.keys(validationErrors).some((field) =>
          ["loginId", "roleAccessPolicy"].includes(field),
        )
      ) {
        setIsServiceOpen(true);
      }
      if (
        Object.keys(validationErrors).some(
          (field) => !["loginId", "roleAccessPolicy"].includes(field),
        )
      ) {
        setIsAttendanceOpen(true);
      }

      setToast({
        id: Date.now(),
        message: "Please fix the validation errors before saving.",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setToast({
      id: Date.now(),
      message: "Attendance details validated successfully.",
      type: "success",
      duration: 3000,
    });

    // API integration can be added here later.
    console.log("Attendance Details:", formData);
  };

  /* =========================================================
     RESET FACIAL REGISTRATION
  ========================================================= */

  const handleResetFacialRegistration = () => {
    window.alert(
      "Facial registration reset will be connected to the API later.",
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}
      <div className="hrms-form-container attendance-details-page">
        <form
          className="attendance-details-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* =====================================================
            1. ATTENDANCE DETAILS
        ====================================================== */}

          <section className="hrms-form-section-card attendance-details-section">
            <div className="hrms-form-section-header">
              <div className="hrms-section-heading-group">
                <div className="hrms-form-section-icon">
                  <FiCalendar size={19} />
                </div>

                <div className="hrms-form-section-heading">
                  <h3 className="hrms-form-section-title">
                    Attendance Details
                  </h3>

                  <div className="employee-information">
                    <span>Mr.Krishna - TS012 (Software developer - UI/UX)</span>
                  </div>
                </div>
              </div>

              <FormToggleBtn
                isOpen={isAttendanceOpen}
                onClick={() => setIsAttendanceOpen((previous) => !previous)}
              />
            </div>

            <div
              ref={attendanceBodyRef}
              className={`hrms-form-section-collapse ${
                isAttendanceOpen ? "is-open" : ""
              }`}
            >
              <div className="hrms-form-section-body">
                <div className="hrms-form-row-3 attendance-details-grid">
                  <div className="hrms-form-group">
                    <FormSelect
                      label="Shift Group"
                      name="shiftGroup"
                      value={formData.shiftGroup}
                      onChange={handleChange}
                      options={shiftGroupOptions}
                      placeholder={selectPlaceholder}
                      required
                      error={errors.shiftGroup}
                    />
                  </div>

                  <div className="hrms-form-group attendance-late-mark-group">
                    <div className="attendance-late-mark-checkbox">
                      <FormCheckbox
                        label="Late Mark"
                        name="lateMarkEnabled"
                        checked={formData.lateMarkEnabled}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="attendance-late-mark-select">
                      <FormSelect
                        label=""
                        name="lateMark"
                        value={formData.lateMark}
                        onChange={handleChange}
                        options={optionsFrom([
                          "Yes",
                          "No",
                          "First Half",
                          "Second Half",
                        ])}
                        placeholder={selectPlaceholder}
                        disabled={!formData.lateMarkEnabled}
                        error={errors.lateMark}
                      />
                    </div>
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="I Weekly Off"
                      name="weeklyOff1"
                      value={formData.weeklyOff1}
                      onChange={handleChange}
                      options={optionsFrom([
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                      ])}
                      placeholder={selectPlaceholder}
                      required
                      error={errors.weeklyOff1}
                    />
                  </div>

                  <div className="hrms-form-group attendance-weekly-off-group">
                    <FormSelect
                      label="II Weekly Off"
                      name="weeklyOff2"
                      value={
                        Array.isArray(formData.weeklyOff2)
                          ? formData.weeklyOff2.find((item) =>
                              [
                                "NA",
                                "Sunday",
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday",
                                "Saturday",
                              ].includes(item),
                            ) || ""
                          : formData.weeklyOff2
                      }
                      onChange={handleChange}
                      options={optionsFrom([
                        "NA",
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                      ])}
                      placeholder={selectPlaceholder}
                      error={errors.weeklyOff2}
                    />

                    <div className="attendance-weekly-off-options d-flex gap-2 mt-2">
                      {weeklyOffOptions.map((day) => (
                        <FormCheckbox
                          key={day}
                          label={day}
                          name={`weeklyOff2-${day}`}
                          checked={formData.weeklyOff2.includes(day)}
                          onChange={(event) =>
                            handleWeeklyOffChange(day, event.target.checked)
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Personal Gatepass Setting"
                      name="personalGatepassSetting"
                      value={formData.personalGatepassSetting}
                      onChange={handleChange}
                      options={gatepassOptions}
                      placeholder={selectPlaceholder}
                      required
                      error={errors.personalGatepassSetting}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Leave Group"
                      name="leaveGroup"
                      value={formData.leaveGroup}
                      onChange={handleChange}
                      options={leaveGroupOptions}
                      placeholder={selectPlaceholder}
                      required
                      error={errors.leaveGroup}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Outdoor Setting"
                      name="outdoorSetting"
                      value={formData.outdoorSetting}
                      onChange={handleChange}
                      options={settingOptions}
                      placeholder={selectPlaceholder}
                      required
                      error={errors.outdoorSetting}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Punch Missing Setting"
                      name="punchMissingSetting"
                      value={formData.punchMissingSetting}
                      onChange={handleChange}
                      options={settingOptions}
                      placeholder={selectPlaceholder}
                      required
                      error={errors.punchMissingSetting}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormSelect
                      label="Short Interval Setting"
                      name="shortIntervalSetting"
                      value={formData.shortIntervalSetting}
                      onChange={handleChange}
                      options={intervalOptions}
                      placeholder={selectPlaceholder}
                    />
                  </div>

                  <div className="hrms-form-group">
                    <FormMultiSelect
                      label="Checkins Setting"
                      name="checkinsSetting"
                      value={formData.checkinsSetting}
                      onChange={handleChange}
                      options={[
                        { label: "kharadi", value: "kharadi" },
                        { label: "Other", value: "Other" },
                        { label: "Wagholi", value: "Wagholi" },
                      ]}
                      required
                      error={errors.checkinsSetting}
                    />
                  </div>
                  <div className="hrms-form-group">
                    <FormInput
                      label="Per Day Shift Hrs"
                      name="perDayShiftHrs"
                      type="number"
                      value={formData.perDayShiftHrs}
                      onChange={handleChange}
                      placeholder=""
                      error={errors.perDayShiftHrs}
                    />
                  </div>
                  <div className="hrms-form-group attendance-late-mark-group">
                    <div className="attendance-late-mark-checkbox">
                      <FormCheckbox
                        label="Monthly Short Hrs"
                        name="monthlyShortHrsEnabled"
                        checked={formData.monthlyShortHrsEnabled}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="attendance-monthly-short-hrs">
                      <FormInput
                        label=""
                        name="monthlyShortHrs"
                        type="number"
                        value={formData.monthlyShortHrs}
                        onChange={handleChange}
                        placeholder="Enter Monthly Short Hrs"
                        disabled={!formData.monthlyShortHrsEnabled}
                        error={errors.monthlyShortHrs}
                      />
                    </div>
                  </div>
                </div>
                <hr></hr>
                <div className="hrms-form-row-3">
                  <div className="hrms-form-group attendance-inline-checkbox">
                    <FormCheckbox
                      label="Allow Tracking"
                      name="allowTracking"
                      checked={formData.allowTracking}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="hrms-form-group attendance-inline-checkbox">
                    <FormCheckbox
                      label="OT Applicable"
                      name="otApplicable"
                      checked={formData.otApplicable}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hrms-form-group attendance-inline-checkbox">
                    <FormCheckbox
                      label="OT (Working Day) and COFF (Weekoff)"
                      name="otWorkingDayAndCoff"
                      checked={formData.otWorkingDayAndCoff}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hrms-form-group attendance-inline-checkbox">
                    <FormCheckbox
                      label="Flexible Shift Applicable"
                      name="flexibleShiftApplicable"
                      checked={formData.flexibleShiftApplicable}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hrms-form-group attendance-inline-checkbox">
                    <FormCheckbox
                      label="Public Holiday Eligible"
                      name="publicHolidayEligible"
                      checked={formData.publicHolidayEligible}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hrms-form-group attendance-inline-checkbox">
                    <FormCheckbox
                      label="Coff Applicable"
                      name="coffApplicable"
                      checked={formData.coffApplicable}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hrms-form-group attendance-inline-checkbox">
                    <FormCheckbox
                      label="Salary Full Day"
                      name="salaryFullDay"
                      checked={formData.salaryFullDay}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hrms-form-group attendance-inline-checkbox">
                    <FormCheckbox
                      label="Single Punch Present"
                      name="singlePunchPresent"
                      checked={formData.singlePunchPresent}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hrms-form-group attendance-inline-checkbox">
                    <FormCheckbox
                      label="Regularization Required"
                      name="regularizationRequired"
                      checked={formData.regularizationRequired}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hrms-form-group attendance-inline-checkbox">
                    <FormCheckbox
                      label="Default Attendance Show"
                      name="defaultAttendanceShow"
                      checked={formData.defaultAttendanceShow}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
            2. MY SERVICE DETAILS
        ====================================================== */}

          <section className="hrms-form-section-card attendance-service-section">
            <div className="hrms-form-section-header">
              <div className="hrms-section-heading-group">
                <div className="hrms-form-section-icon">
                  <FiUser size={19} />
                </div>

                <div className="hrms-form-section-heading">
                  <h3 className="hrms-form-section-title">Service Details</h3>

                  <p className="hrms-form-section-description">
                    Provide the employee's service details.
                  </p>
                </div>
              </div>

              <FormToggleBtn
                isOpen={isServiceOpen}
                onClick={() => setIsServiceOpen((previous) => !previous)}
              />
            </div>

            <div
              ref={serviceBodyRef}
              className={`hrms-form-section-collapse ${
                isServiceOpen ? "is-open" : ""
              }`}
            >
              <div className="hrms-form-section-body">
                <div className="hrms-form-row-3 mb-3">
                  {/* IS ACTIVE */}

                  <div className="hrms-form-group attendance-inline-checkbox">
                    <FormCheckbox
                      label="Is Active"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="hrms-form-row-3">
                  {/* LOGIN ID */}

                  <div className="hrms-form-group">
                    <FormInput
                      label="Login ID"
                      name="loginId"
                      value={formData.loginId}
                      onChange={handleChange}
                      placeholder="Enter Login ID"
                      required
                      error={errors.loginId}
                    />
                  </div>

                  {/* ROLE ACCESS POLICY */}

                  <div className="hrms-form-group">
                    <div
                      className={`d-flex gap-2 ${
                        errors.roleAccessPolicy
                          ? "align-items-center"
                          : "align-items-end"
                      }`}
                    >
                      <div className="flex-grow-1">
                        <FormSelect
                          label="Role Access Policy"
                          name="roleAccessPolicy"
                          value={formData.roleAccessPolicy}
                          onChange={handleChange}
                          options={roleAccessOptions}
                          placeholder={selectPlaceholder}
                          required
                          error={errors.roleAccessPolicy}
                        />
                      </div>

                      <button
                        type="button"
                        className="hrms-icon-button attendance-role-preview"
                        aria-label="Preview role access policy"
                        onClick={() =>
                          window.alert(
                            "Role access policy preview will be connected later.",
                          )
                        }
                      >
                        <FiEye size={19} />
                      </button>
                    </div>
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
    </>
  );
}

export default AttendanceDetails;
