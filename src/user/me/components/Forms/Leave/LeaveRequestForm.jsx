
import { useMemo, useState } from "react";
import { FiClock } from "react-icons/fi";

import FormOffcanvas from "../../../../../common/components/offcanvas/FormOffcanvas";
import FormInput from "../../../../../common/components/Form/FormInput";
import FormSelect from "../../../../../common/components/Form/FormSelect";
import FormMultiSelect from "../../../../../common/components/Form/FormMultiSelect";
import DynamicCalendar from "../../../../../common/components/calendar/DynamicCalendar";


const INITIAL_FORM = {
  fromDate: "",
  toDate: "",
  leaveType: "Casual Leave",
  leaveMode: "full",
  customHours: "4",
  fromTime: "11:00",
  note: "",
  notify: [],
};

const optionsFrom = (values) =>
  values.map((value) => ({
    value,
    label: value,
  }));

function LeaveRequestForm({
  show,
  onClose,
  onSubmit,
  leaveTypes = [],
}) {
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});

  // TOTAL DAYS
  const totalDays = useMemo(() => {
    if (!formData.fromDate || !formData.toDate) return 0;

    const from = new Date(`${formData.fromDate}T00:00:00`);
    const to = new Date(`${formData.toDate}T00:00:00`);

    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(to.getTime()) ||
      to < from
    ) {
      return 0;
    }

    return Math.floor((to - from) / 86400000) + 1;
  }, [formData.fromDate, formData.toDate]);

  // REQUESTED DURATION
  const requestedDuration =
    formData.leaveMode === "custom"
      ? `${formData.customHours || 0} hours`
      : `${totalDays} ${totalDays === 1 ? "day" : "days"}`;

  // LEAVE TYPE OPTIONS
  const leaveTypeOptions = leaveTypes.map((leave) => ({
    value: leave.name,
    label: `${leave.name} - ${leave.balance} ${leave.unit} available`,
  }));

  // NOTIFY OPTIONS
  const notifyOptions = optionsFrom([
    "Reporting Manager",
    "HR",
    "Admin",
  ]);

  // VALIDATION
  const validateField = (name, value, currentData = formData) => {
    let error = "";

    if (name === "fromDate" && !value) {
      error = "Please select the from date";
    }

    if (name === "toDate") {
      if (!value) {
        error = "Please select the to date";
      } else if (
        currentData.fromDate &&
        value < currentData.fromDate
      ) {
        error = "To date cannot be before from date";
      }
    }

    if (name === "leaveType" && !value) {
      error = "Please select leave type";
    }

    if (
      name === "customHours" &&
      currentData.leaveMode === "custom"
    ) {
      const hours = Number(value);

      if (!value || Number.isNaN(hours) || hours <= 0) {
        error = "Enter valid leave hours";
      } else if (hours > 24) {
        error = "Hours cannot exceed 24";
      }
    }

    return error;
  };

  // UPDATE FIELD
  const updateField = (name, value) => {
    const updatedData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedData);

    setErrors((previous) => ({
      ...previous,
      [name]: validateField(name, value, updatedData),

      ...(name === "fromDate"
        ? {
            toDate: validateField(
              "toDate",
              updatedData.toDate,
              updatedData
            ),
          }
        : {}),
    }));
  };

  // COMMON INPUT CHANGE
  const handleChange = (event) => {
    if (!event?.target) return;

    const { name, value, type, checked } = event.target;

    updateField(
      name,
      type === "checkbox" ? checked : value
    );
  };

  // DATE CHANGE
  const handleDateChange = (event) => {
    if (!event?.target) return;

    const { name, value } = event.target;

    const updatedData = {
      ...formData,
      [name]: value,
    };

    // Automatically set To Date when From Date is selected.
    if (name === "fromDate" && !updatedData.toDate && value) {
      updatedData.toDate = value;
    }

    setFormData(updatedData);

    setErrors((previous) => ({
      ...previous,
      [name]: validateField(name, value, updatedData),

      ...(name === "fromDate"
        ? {
            toDate: validateField(
              "toDate",
              updatedData.toDate,
              updatedData
            ),
          }
        : {}),
    }));
  };

  // FORM VALIDATION
  const validateForm = () => {
    const nextErrors = {};

    ["fromDate", "toDate", "leaveType"].forEach((field) => {
      const error = validateField(field, formData[field]);

      if (error) {
        nextErrors[field] = error;
      }
    });

    if (formData.leaveMode === "custom") {
      const error = validateField(
        "customHours",
        formData.customHours
      );

      if (error) {
        nextErrors.customHours = error;
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  // RESET FORM
  const resetForm = () => {
    setFormData({ ...INITIAL_FORM });
    setErrors({});
  };

  // CLOSE FORM
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // SUBMIT FORM
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const newRequest = {
      id: Date.now(),
      type: formData.leaveType,
      from: formData.fromDate,
      to: formData.toDate,
      duration: requestedDuration,
      reason: formData.note.trim() || "—",
      notify: formData.notify,
      status: "Pending",
    };

    onSubmit(newRequest);
    resetForm();
  };

  // OFFCANVAS FOOTER
  const leaveFooter = (
    <div className="leave-offcanvas-footer-actions">
      <button
        type="button"
        className="hrms-form-button hrms-form-button-secondary"
        onClick={handleClose}
      >
        Cancel
      </button>

      <button
        type="submit"
        form="leave-request-form"
        className="hrms-form-button hrms-form-button-primary"
      >
        Request
      </button>
    </div>
  );

  return (
    <FormOffcanvas
      show={show}
      onClose={handleClose}
      title="Leave Request"
      width="480px"
      footer={leaveFooter}
    >
      <form
        id="leave-request-form"
        className="leave-request-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* DATE RANGE */}
        <div className="leave-date-range-card">
          <div className="leave-date-field">
            <DynamicCalendar
              label="From"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleDateChange}
              mode="dd-mm-yyyy"
              placeholder="dd/mm/yyyy"
              error={errors.fromDate}
            />
          </div>

          <span className="leave-date-duration">
            {totalDays} {totalDays === 1 ? "day" : "days"}
          </span>

          <div className="leave-date-field leave-date-field-right">
            <DynamicCalendar
              label="To"
              name="toDate"
              value={formData.toDate}
              onChange={handleDateChange}
              mode="dd-mm-yyyy"
              placeholder="dd/mm/yyyy"
              min={formData.fromDate || undefined}
              error={errors.toDate}
            />
          </div>
        </div>

        {/* LEAVE TYPE */}
        <div className="leave-form-group">
          <FormSelect
            label="Select type of leave you want to apply"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            options={leaveTypeOptions}
            placeholder="--Select--"
            required
            error={errors.leaveType}
          />
        </div>

        {/* FULL DAY / CUSTOM */}
        <div className="leave-mode-switch">
          <button
            type="button"
            className={
              formData.leaveMode === "full" ? "active" : ""
            }
            onClick={() => {
              updateField("leaveMode", "full");

              setErrors((previous) => ({
                ...previous,
                customHours: "",
              }));
            }}
          >
            Full day
          </button>

          <button
            type="button"
            className={
              formData.leaveMode === "custom" ? "active" : ""
            }
            onClick={() => {
              updateField("leaveMode", "custom");
            }}
          >
            Custom
          </button>
        </div>

        {/* CUSTOM HOURS */}
        {formData.leaveMode === "custom" && (
          <>
            <div className="leave-custom-hours">
              <div className="leave-custom-hours-input">
                <FormInput
                  label="Hours"
                  name="customHours"
                  type="number"
                  value={formData.customHours}
                  onChange={handleChange}
                  placeholder="Enter hours"
                  error={errors.customHours}
                />
              </div>

              <span>hrs from</span>

              <input
                type="time"
                value={formData.fromTime}
                onChange={(event) =>
                  updateField("fromTime", event.target.value)
                }
              />
            </div>

            <div className="leave-duration-info">
              <FiClock size={16} />
              You are requesting for{" "}
              <strong>{requestedDuration}</strong> of leave
            </div>
          </>
        )}

        {/* NOTE */}
        <div className="leave-form-group">
          <label htmlFor="leaveNote">Note</label>

          <textarea
            id="leaveNote"
            rows="3"
            placeholder="Enter reason for leave"
            value={formData.note}
            onChange={(event) =>
              updateField("note", event.target.value)
            }
          />
        </div>

        {/* NOTIFY MULTISELECT */}
        <div className="leave-form-group">
          <FormMultiSelect
            label="Notify"
            name="notify"
            value={formData.notify}
            onChange={handleChange}
            options={notifyOptions}
            placeholder="Select people to notify"
          />
        </div>
      </form>
    </FormOffcanvas>
  );
}

export default LeaveRequestForm;
