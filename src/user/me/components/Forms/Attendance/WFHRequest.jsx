
import { useMemo, useState } from "react";
import { FiInfo, FiClock } from "react-icons/fi";

import FormOffcanvas from "../../../../../common/components/offcanvas/FormOffcanvas";
import FormMultiSelect from "../../../../../common/components/Form/FormMultiSelect";
import DynamicCalendar from "../../../../../common/components/calendar/DynamicCalendar";

import "./WFHRequest.css";

const INITIAL_FORM = {
  fromDate: "",
  toDate: "",
  workMode: "full",
  isHourly: false,
  fromTime: "",
  toTime: "",
  note: "",
  notify: [],
};

function getTimeDuration(fromTime, toTime) {
  if (!fromTime || !toTime) return 0;

  const [fromHours, fromMinutes] = fromTime.split(":").map(Number);
  const [toHours, toMinutes] = toTime.split(":").map(Number);

  const start = fromHours * 60 + fromMinutes;
  const end = toHours * 60 + toMinutes;

  return end > start ? end - start : 0;
}

function WFHRequest({ show, onClose, onSubmit, employeeOptions = [] }) {
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});

  // Calculate selected date range
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

  // Calculate hourly duration
  const hourlyMinutes = useMemo(
    () => getTimeDuration(formData.fromTime, formData.toTime),
    [formData.fromTime, formData.toTime]
  );

  const hourlyDuration = `${String(
    Math.floor(hourlyMinutes / 60)
  ).padStart(2, "0")}:${String(hourlyMinutes % 60).padStart(2, "0")}hrs`;

  // Use one day as the default display when dates have not yet been selected.
  const durationDays = totalDays > 0 ? totalDays : 1;

  // Calculate requested duration based on selected mode
  const requestedDuration = formData.isHourly
  ? `${hourlyDuration.replace("hrs", "")} hours`
  : formData.workMode === "full"
    ? `${durationDays} ${durationDays === 1 ? "day" : "days"}`
    : `${(durationDays * 0.5).toFixed(1)} day${
        durationDays * 0.5 === 1 ? "" : "s"
      }`;

  // Field validation
  const validateField = (name, value, currentData = formData) => {
    let error = "";

    if (name === "fromDate" && !value) {
      error = "Please select the from date";
    }

    if (name === "toDate") {
      if (!value) {
        error = "Please select the to date";
      } else if (currentData.fromDate && value < currentData.fromDate) {
        error = "To date cannot be before from date";
      }
    }

    if (name === "fromTime" || name === "toTime") {
      if (currentData.isHourly) {
        if (!value) {
          error = "Please select a time";
        } else if (
          currentData.fromTime &&
          currentData.toTime &&
          getTimeDuration(currentData.fromTime, currentData.toTime) <= 0
        ) {
          error = "To time must be after from time";
        }
      }
    }

    return error;
  };

  // Update field values and errors
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

      ...(name === "fromTime" || name === "toTime"
        ? {
            fromTime: validateField(
              "fromTime",
              updatedData.fromTime,
              updatedData
            ),
            toTime: validateField(
              "toTime",
              updatedData.toTime,
              updatedData
            ),
          }
        : {}),
    }));
  };

  const handleChange = (event) => {
    if (!event?.target) return;

    const { name, value, type, checked } = event.target;

    updateField(name, type === "checkbox" ? checked : value);
  };

  // Date change handler
  const handleDateChange = (event) => {
    if (!event?.target) return;

    const { name, value } = event.target;

    const updatedData = {
      ...formData,
      [name]: value,
    };

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

  // Validate form before submit
  const validateForm = () => {
    const nextErrors = {
      fromDate: validateField("fromDate", formData.fromDate),
      toDate: validateField("toDate", formData.toDate),
    };

    if (formData.isHourly) {
      nextErrors.fromTime = validateField(
        "fromTime",
        formData.fromTime
      );

      nextErrors.toTime = validateField(
        "toTime",
        formData.toTime
      );
    }

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setFormData({ ...INITIAL_FORM });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  // Submit request
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const newRequest = {
      id: Date.now(),
      type: "Work From Home",
      from: formData.fromDate,
      to: formData.toDate,
      duration: requestedDuration,
      workMode: formData.isHourly ? "Hourly" : formData.workMode,
      hours: formData.isHourly
        ? (hourlyMinutes / 60).toFixed(2)
        : null,
      fromTime: formData.isHourly ? formData.fromTime : null,
      toTime: formData.isHourly ? formData.toTime : null,
      reason: formData.note.trim() || "—",
      notify: formData.notify,
      status: "Pending",
    };

    onSubmit?.(newRequest);
    resetForm();
  };

  // Footer buttons
  const footer = (
    <div className="wfh-offcanvas-footer-actions">
      <button
        type="button"
        className="hrms-form-button hrms-form-button-secondary"
        onClick={handleClose}
      >
        Cancel
      </button>

      <button
        type="submit"
        form="wfh-request-form"
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
      title="Work From Home"
      width="480px"
      footer={footer}
    >
      <form
        id="wfh-request-form"
        className="wfh-request-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* DATE RANGE */}
        <div className="wfh-date-range-card">
          <div className="wfh-date-field">
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

          <span className="wfh-date-duration">
            {formData.workMode === "full"
              ? `${durationDays} ${
                  durationDays === 1 ? "day" : "days"
                }`
              : `${(durationDays * 0.5).toFixed(1)} day${
                  durationDays * 0.5 === 1 ? "" : "s"
                }`}
          </span>

          <div className="wfh-date-field wfh-date-field-right">
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

        {/* FULL DAY / HALF DAY */}
        <div className="wfh-mode-switch">
          {[
            { label: "Full Day", value: "full" },
            { label: "First Half", value: "first" },
            { label: "Second Half", value: "second" },
          ].map((mode) => (
            <button
              key={mode.value}
              type="button"
              className={
                !formData.isHourly && formData.workMode === mode.value
                  ? "active"
                  : ""
              }
              onClick={() => {
                setFormData((previous) => ({
                  ...previous,
                  isHourly: false,
                  workMode: mode.value,
                }));

                setErrors((previous) => ({
                  ...previous,
                  fromTime: "",
                  toTime: "",
                }));
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* REQUESTED DURATION */}
        <div className="wfh-duration-info">
          <FiClock size={16} />
          You are requesting for{" "}
          <strong>{requestedDuration}</strong> of work from home
        </div>

        {/* HOURLY REQUEST CHECKBOX */}
        <div className="wfh-hourly-row">
          <label className="wfh-hourly-checkbox">
            <input
              type="checkbox"
              name="isHourly"
              checked={formData.isHourly}
              onChange={(event) => {
                updateField("isHourly", event.target.checked);
              }}
            />

            <span>
              This is an hourly Work From Home (WFH) request
            </span>
          </label>

          <span
            className="wfh-info-icon"
            title="Submit a request for specific working hours"
          >
            <FiInfo size={18} />
          </span>
        </div>

        {/* SHIFT TIMINGS */}
        {formData.isHourly && (
          <>
            <div className="wfh-shift-info">
              Shift timings: Flexible Timings
            </div>

            <div className="wfh-timing-section">
              <label className="wfh-timing-label">Timing</label>

              <div className="wfh-timing-row">
                <input
                  type="time"
                  aria-label="From time"
                  value={formData.fromTime}
                  onChange={(event) =>
                    updateField("fromTime", event.target.value)
                  }
                />

                <span className="wfh-time-separator">-</span>

                <input
                  type="time"
                  aria-label="To time"
                  value={formData.toTime}
                  onChange={(event) =>
                    updateField("toTime", event.target.value)
                  }
                />

                <span className="wfh-time-duration">
                  {hourlyDuration}
                </span>
              </div>

              {(errors.fromTime || errors.toTime) && (
                <span className="wfh-field-error">
                  {errors.fromTime || errors.toTime}
                </span>
              )}
            </div>
          </>
        )}

        {/* NOTE */}
        <div className="wfh-form-group">
          <label htmlFor="wfhNote">Note</label>

          <textarea
            id="wfhNote"
            rows="3"
            placeholder="Enter reason for work from home"
            value={formData.note}
            onChange={(event) =>
              updateField("note", event.target.value)
            }
          />
        </div>

        {/* NOTIFY */}
        <div className="wfh-form-group wfh-notify-group">
          <FormMultiSelect
            label="Notify"
            name="notify"
            value={formData.notify}
            onChange={handleChange}
            options={employeeOptions}
            placeholder="Search employee"
          />
        </div>
      </form>
    </FormOffcanvas>
  );
}

export default WFHRequest;
