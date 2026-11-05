import React, { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiX, FiCalendar } from "react-icons/fi";
import FormInput from "../../../common/components/Form/FormInput";
import "./DynamicCalendar.css";

/* =========================================================
   CONSTANTS
========================================================= */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Dec",
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/* =========================================================
   HELPERS
========================================================= */

const pad = (value) => String(value).padStart(2, "0");

const normalizeDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]) - 1;
      const day = Number(match[3]);

      const date = new Date(year, month, day);

      // Reject invalid calendar dates such as 2026-02-31.
      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month ||
        date.getDate() !== day
      ) {
        return null;
      }

      return date;
    }

    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
      );
    }
  }

  return null;
};

const getToday = () => {
  const today = new Date();

  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

const isSameDate = (date1, date2) => {
  if (!date1 || !date2) {
    return false;
  }

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isBeforeDate = (date1, date2) => {
  if (!date1 || !date2) {
    return false;
  }

  return date1.getTime() < date2.getTime();
};

const isAfterDate = (date1, date2) => {
  if (!date1 || !date2) {
    return false;
  }

  return date1.getTime() > date2.getTime();
};

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const formatApiDate = (date) => {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date, mode) => {
  if (!date) {
    return "";
  }

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  switch (mode) {
    case "year":
      return String(year);

    case "month":
      return MONTHS[date.getMonth()];

    case "month-year":
      return `${MONTHS[date.getMonth()]} ${year}`;

    case "date-month":
      return `${day} ${MONTHS[date.getMonth()]}`;

    case "mm-dd-yyyy":
      return `${month}/${day}/${year}`;

    case "dd-mm-yyyy":
    default:
      return `${day}/${month}/${year}`;
  }
};

const getInitialDate = (value) => {
  return normalizeDate(value) || getToday();
};

/* =========================================================
   COMPONENT
========================================================= */

const DynamicCalendar = ({
  mode = "dd-mm-yyyy",
  name = "",
  value = "",
  onChange = () => {},
  minDate = null,
  maxDate = null,
  placeholder = "Select date",
  disabled = false,
  required = false,
  label = "",
  error = "",
  clearable = true,
  showToday = true,
  className = "",
}) => {
  /* =====================================================
     REFS
  ===================================================== */

  const calendarRef = useRef(null);

  /* =====================================================
     NORMALIZED VALUES
  ===================================================== */

  const normalizedValue = normalizeDate(value);
  const normalizedMinDate = normalizeDate(minDate);
  const normalizedMaxDate = normalizeDate(maxDate);

  /* =====================================================
     STATE
  ===================================================== */

  const [open, setOpen] = useState(false);
  const [opensUp, setOpensUp] = useState(false);
  const [viewDate, setViewDate] = useState(getInitialDate(value));

  const [calendarView, setCalendarView] = useState("date");

  /* =====================================================
     CALENDAR POSITION
  ===================================================== */

  /* =========================================================
   CALENDAR POSITION
   ACCOUNT FOR HEADER AND MODULE NAV CSS VARIABLES
========================================================= */

  const updateCalendarPosition = () => {
    const wrapper = calendarRef.current;
    if (!wrapper) return;

    const popup = wrapper.querySelector(".dc-popup");
    if (!popup) return;

    const rect = wrapper.getBoundingClientRect();
    const padding = 8;
    const gap = 4;

    // Read fixed header and module navigation heights.
    const rootStyles = getComputedStyle(document.documentElement);

    const headerHeight =
      parseFloat(rootStyles.getPropertyValue("--rh-header-height")) || 0;

    const moduleNavHeight =
      parseFloat(rootStyles.getPropertyValue("--rh-module-nav-height")) || 0;

    // Visible viewport boundaries.
    const usableTop = headerHeight + moduleNavHeight + padding;
    const usableBottom = window.innerHeight - padding;

    // Space available above and below the input.
    const spaceBelow = Math.max(0, usableBottom - rect.bottom - gap);

    const spaceAbove = Math.max(0, rect.top - usableTop - gap);

    // Measure natural popup height without constraining it.
    const popupHeight = popup.scrollHeight;

    // Open upward only when the popup doesn't fit below
    // and there is more usable space above.
    const placeAbove = spaceBelow < popupHeight && spaceAbove > spaceBelow;

    setOpensUp(placeAbove);
  };

  /* =====================================================
     SYNC VIEW WITH VALUE
  ===================================================== */

  useEffect(() => {
    if (normalizedValue) {
      setViewDate(normalizedValue);
    }
  }, [value]);

  /* =====================================================
     RESET VIEW WHEN OPENING
  ===================================================== */

  useEffect(() => {
    if (open) {
      setCalendarView("date");

      if (normalizedValue) {
        setViewDate(normalizedValue);
      }
    }
  }, [open]);

  /* =====================================================
     MEASURE POPUP AFTER RENDER
  ===================================================== */

  useEffect(() => {
    if (!open) return undefined;

    let frameId;

    const updatePosition = () => {
      cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        updateCalendarPosition();
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      cancelAnimationFrame(frameId);
    };
  }, [open, calendarView, mode]);

  /*
   * Recalculate if the popup content changes height,
   * such as when switching between date, month and year.
   */
  useEffect(() => {
    if (!open || !calendarRef.current) {
      return undefined;
    }

    const popup = calendarRef.current.querySelector(".dc-popup");

    if (!popup || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      updateCalendarPosition();
    });

    observer.observe(popup);

    return () => {
      observer.disconnect();
    };
  }, [open, calendarView, mode]);

  /* =====================================================
     CLICK OUTSIDE
  ===================================================== */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setOpen(false);
        setCalendarView("date");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* =====================================================
     DATE VALIDATION
  ===================================================== */

  const isDateDisabled = (date) => {
    if (!date) {
      return true;
    }

    if (normalizedMinDate && isBeforeDate(date, normalizedMinDate)) {
      return true;
    }

    if (normalizedMaxDate && isAfterDate(date, normalizedMaxDate)) {
      return true;
    }

    return false;
  };

  /* =====================================================
     MONTH VALIDATION
  ===================================================== */

  const isMonthDisabled = (year, month) => {
    const firstDay = new Date(year, month, 1);

    const lastDay = new Date(year, month, getDaysInMonth(year, month));

    if (normalizedMinDate && isBeforeDate(lastDay, normalizedMinDate)) {
      return true;
    }

    if (normalizedMaxDate && isAfterDate(firstDay, normalizedMaxDate)) {
      return true;
    }

    return false;
  };

  /* =====================================================
     YEAR VALIDATION
  ===================================================== */

  const isYearDisabled = (year) => {
    if (normalizedMinDate && year < normalizedMinDate.getFullYear()) {
      return true;
    }

    if (normalizedMaxDate && year > normalizedMaxDate.getFullYear()) {
      return true;
    }

    return false;
  };

  /* =====================================================
     TRIGGER CHANGE
  ===================================================== */

  const triggerChange = (date) => {
    const formattedValue = date ? formatApiDate(date) : "";

    onChange({
      target: {
        name,
        value: formattedValue,
        type: "text",
        checked: false,
      },
    });
  };

  /* =====================================================
     INPUT CLICK
  ===================================================== */

  const handleInputClick = () => {
    if (disabled || open) return;

    setCalendarView("date");

    if (normalizedValue) {
      setViewDate(normalizedValue);
    }

    setOpen(true);
  };

  /* =====================================================
     HEADER MONTH CLICK
  ===================================================== */

  const handleMonthHeaderClick = () => {
    setCalendarView("month");
  };

  /* =====================================================
     HEADER YEAR CLICK
  ===================================================== */

  const handleYearHeaderClick = () => {
    setCalendarView("year");
  };

  /* =====================================================
     DATE SELECT
  ===================================================== */

  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) {
      return;
    }

    setViewDate(date);
    triggerChange(date);

    if (
      mode === "dd-mm-yyyy" ||
      mode === "mm-dd-yyyy" ||
      mode === "date-month"
    ) {
      setOpen(false);
      setCalendarView("date");
    }
  };

  /* =====================================================
     MONTH SELECT
  ===================================================== */

  const handleMonthSelect = (monthIndex) => {
    const year = viewDate.getFullYear();

    if (isMonthDisabled(year, monthIndex)) {
      return;
    }

    const selectedDate = new Date(year, monthIndex, 1);

    setViewDate(selectedDate);

    if (mode === "month" || mode === "month-year") {
      triggerChange(selectedDate);
      setOpen(false);
      setCalendarView("date");
      return;
    }

    setCalendarView("date");
  };

  /* =====================================================
     YEAR SELECT
  ===================================================== */

  const handleYearSelect = (year) => {
    if (isYearDisabled(year)) {
      return;
    }

    const month = viewDate.getMonth();
    const selectedDate = new Date(year, month, 1);

    if (mode === "year") {
      const yearDate = new Date(year, 0, 1);

      triggerChange(yearDate);
      setViewDate(yearDate);
      setOpen(false);
      setCalendarView("date");
      return;
    }

    if (mode === "month-year") {
      if (!isMonthDisabled(year, month)) {
        triggerChange(selectedDate);
        setViewDate(selectedDate);
      }

      return;
    }

    setViewDate(selectedDate);
    setCalendarView("month");
  };

  /* =====================================================
     CLEAR
  ===================================================== */

  const handleClear = (event) => {
    event?.stopPropagation();

    triggerChange(null);
    setViewDate(getToday());
    setCalendarView("date");
    setOpen(false);
  };

  /* =====================================================
     TODAY
  ===================================================== */

  const handleToday = () => {
    const today = getToday();

    if (isDateDisabled(today)) {
      return;
    }

    setViewDate(today);
    triggerChange(today);
    setCalendarView("date");

    if (
      mode === "dd-mm-yyyy" ||
      mode === "mm-dd-yyyy" ||
      mode === "date-month"
    ) {
      setOpen(false);
    }
  };

  /* =====================================================
     MONTH NAVIGATION
  ===================================================== */

  const previousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  /* =====================================================
     YEAR NAVIGATION
  ===================================================== */

  const previousYear = () => {
    if (calendarView === "year") {
      setViewDate(
        new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1),
      );
      return;
    }

    setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
  };

  const nextYear = () => {
    if (calendarView === "year") {
      setViewDate(
        new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1),
      );
      return;
    }

    setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
  };

  /* =====================================================
     CALENDAR DAYS
  ===================================================== */

  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = getDaysInMonth(year, month);
    const previousMonthDays = getDaysInMonth(year, month - 1);

    const days = [];

    for (let index = firstDay - 1; index >= 0; index--) {
      const day = previousMonthDays - index;

      days.push({
        date: new Date(year, month - 1, day),
        currentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        currentMonth: true,
      });
    }

    const remaining = 42 - days.length;

    for (let day = 1; day <= remaining; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        currentMonth: false,
      });
    }

    return days;
  };

  /* =====================================================
     YEAR GRID
  ===================================================== */

  const generateYears = () => {
    const currentYear = viewDate.getFullYear();
    const startYear = Math.floor(currentYear / 12) * 12;

    return Array.from({ length: 12 }, (_, index) => startYear + index);
  };

  /* =====================================================
     RENDER CALENDAR HEADER
  ===================================================== */

  const renderCalendarHeader = () => {
    return (
      <div className="dc-calendar-header">
        <button
          type="button"
          className="dc-nav-button"
          onClick={previousMonth}
          aria-label="Previous month"
        >
          <FiChevronLeft />
        </button>

        <div className="dc-header-title">
          <button
            type="button"
            className="dc-header-month"
            onClick={handleMonthHeaderClick}
            aria-label="Select month"
          >
            {MONTHS[viewDate.getMonth()]}
          </button>

          <button
            type="button"
            className="dc-header-year"
            onClick={handleYearHeaderClick}
            aria-label="Select year"
          >
            {viewDate.getFullYear()}
          </button>
        </div>

        <button
          type="button"
          className="dc-nav-button"
          onClick={nextMonth}
          aria-label="Next month"
        >
          <FiChevronRight />
        </button>
      </div>
    );
  };

  /* =====================================================
     RENDER DAYS
  ===================================================== */

  const renderDays = () => {
    const days = generateCalendarDays();

    return (
      <div className="dc-calendar-body">
        <div className="dc-weekdays">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="dc-weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="dc-days-grid">
          {days.map((item, index) => {
            const { date, currentMonth } = item;

            const selected =
              normalizedValue && isSameDate(date, normalizedValue);

            const today = isSameDate(date, getToday());
            const dateDisabled = isDateDisabled(date);

            return (
              <button
                key={`${date.getTime()}-${index}`}
                type="button"
                disabled={dateDisabled}
                className={[
                  "dc-day",
                  !currentMonth ? "dc-other-month" : "",
                  selected ? "dc-selected" : "",
                  today ? "dc-today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleDateSelect(date)}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  /* =====================================================
     RENDER YEAR VIEW
  ===================================================== */

  const renderYearView = () => {
    const years = generateYears();
    const firstYear = years[0];
    const lastYear = years[years.length - 1];

    return (
      <>
        <div className="dc-calendar-header">
          <button
            type="button"
            className="dc-nav-button"
            onClick={previousYear}
            aria-label="Previous years"
          >
            <FiChevronLeft />
          </button>

          <div className="dc-header-title">
            <span>{firstYear}</span>
            <span>-</span>
            <span>{lastYear}</span>
          </div>

          <button
            type="button"
            className="dc-nav-button"
            onClick={nextYear}
            aria-label="Next years"
          >
            <FiChevronRight />
          </button>
        </div>

        <div className="dc-year-grid">
          {years.map((year) => {
            const selected = normalizedValue?.getFullYear() === year;
            const disabledYear = isYearDisabled(year);

            return (
              <button
                key={year}
                type="button"
                disabled={disabledYear}
                className={["dc-year-item", selected ? "dc-selected" : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleYearSelect(year)}
              >
                {year}
              </button>
            );
          })}
        </div>
      </>
    );
  };

  /* =====================================================
     RENDER MONTH VIEW
  ===================================================== */

  const renderMonthView = () => {
    const year = viewDate.getFullYear();

    return (
      <>
        <div className="dc-calendar-header">
          <button
            type="button"
            className="dc-nav-button"
            onClick={previousYear}
            aria-label="Previous year"
          >
            <FiChevronLeft />
          </button>

          <button
            type="button"
            className="dc-header-year dc-month-view-year"
            onClick={handleYearHeaderClick}
            aria-label="Select year"
          >
            {year}
          </button>

          <button
            type="button"
            className="dc-nav-button"
            onClick={nextYear}
            aria-label="Next year"
          >
            <FiChevronRight />
          </button>
        </div>

        <div className="dc-month-grid">
          {MONTHS.map((month, index) => {
            const selected =
              normalizedValue?.getMonth() === index &&
              normalizedValue?.getFullYear() === year;

            const monthDisabled = isMonthDisabled(year, index);

            return (
              <button
                key={month}
                type="button"
                disabled={monthDisabled}
                className={["dc-month-item", selected ? "dc-selected" : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleMonthSelect(index)}
              >
                <span className="dc-month-short">{SHORT_MONTHS[index]}</span>
              </button>
            );
          })}
        </div>
      </>
    );
  };

  /* =====================================================
     RENDER MONTH-YEAR VIEW
  ===================================================== */

  const renderMonthYearView = () => {
    const year = viewDate.getFullYear();

    return (
      <>
        <div className="dc-calendar-header">
          <button
            type="button"
            className="dc-nav-button"
            onClick={previousYear}
            aria-label="Previous year"
          >
            <FiChevronLeft />
          </button>

          <button
            type="button"
            className="dc-header-year"
            onClick={handleYearHeaderClick}
            aria-label="Select year"
          >
            {year}
          </button>

          <button
            type="button"
            className="dc-nav-button"
            onClick={nextYear}
            aria-label="Next year"
          >
            <FiChevronRight />
          </button>
        </div>

        <div className="dc-month-grid">
          {MONTHS.map((month, index) => {
            const selected =
              normalizedValue?.getMonth() === index &&
              normalizedValue?.getFullYear() === year;

            const monthDisabled = isMonthDisabled(year, index);

            return (
              <button
                key={month}
                type="button"
                disabled={monthDisabled}
                className={["dc-month-item", selected ? "dc-selected" : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleMonthSelect(index)}
              >
                <span className="dc-month-short">{SHORT_MONTHS[index]}</span>

                <span>{month}</span>
              </button>
            );
          })}
        </div>
      </>
    );
  };

  /* =====================================================
     RENDER CALENDAR CONTENT
  ===================================================== */

  const renderCalendarContent = () => {
    if (mode !== "year" && mode !== "month" && mode !== "month-year") {
      if (calendarView === "year") {
        return renderYearView();
      }

      if (calendarView === "month") {
        return renderMonthView();
      }
    }

    switch (mode) {
      case "year":
        return renderYearView();

      case "month":
        return renderMonthView();

      case "month-year":
        return renderMonthYearView();

      case "date-month":
      case "dd-mm-yyyy":
      case "mm-dd-yyyy":
      default:
        return (
          <>
            {renderCalendarHeader()}
            {renderDays()}
          </>
        );
    }
  };

  /* =====================================================
     DISPLAY VALUE
  ===================================================== */

  const displayValue = normalizedValue
    ? formatDisplayDate(normalizedValue, mode)
    : "";

  /* =====================================================
     COMPONENT UI
  ===================================================== */

  return (
    <div
      ref={calendarRef}
      className={[
        "dynamic-calendar",
        open ? "is-open" : "",
        opensUp ? "opens-up" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={`dc-input-container ${
    label ? "has-label" : "no-label"
  }`} >
        <FormInput
          label={label}
          name={name}
          value={displayValue}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          error={error}
          readOnly
          onClick={handleInputClick}
          autoComplete="off"
        />

        <button
          type="button"
          className="dc-calendar-trigger"
          onClick={handleInputClick}
          disabled={disabled}
          aria-label="Open calendar"
          aria-expanded={open}
        >
          <FiCalendar />
        </button>
      </div>

      {/* =================================================
          CALENDAR POPUP
      ================================================== */}

      {open && !disabled && (
        <div className="dc-popup">
          <div className="dc-popup-inner">
            {renderCalendarContent()}

            {/* =================================================
                FOOTER
            ================================================== */}

            <div className="dc-footer">
              <div className="dc-footer-actions">
                {showToday && (
                  <button
                    type="button"
                    className="dc-today-button"
                    onClick={handleToday}
                  >
                    Today
                  </button>
                )}

                {clearable && normalizedValue && (
                  <button
                    type="button"
                    className="dc-clear-button"
                    onClick={handleClear}
                  >
                    <FiX />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className="dc-footer-value">
                {normalizedValue
                  ? formatDisplayDate(normalizedValue, mode)
                  : "No date selected"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicCalendar;
