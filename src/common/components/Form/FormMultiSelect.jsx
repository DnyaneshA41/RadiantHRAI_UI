
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./FormControls.css";

function FormMultiSelect({
  label,
  name,
  value = [],
  onChange,
  options = [],
  placeholder = "--Select--",
  required = false,
  disabled = false,
  error = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState({});

  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Always work with an array of selected values.
  const selectedValues = Array.isArray(value) ? value : [];

  const selectedOptions = options.filter((option) =>
    selectedValues.some(
      (selectedValue) =>
        String(selectedValue) === String(option.value),
    ),
  );

  const selectedLabels = selectedOptions
    .map((option) => option.label)
    .join(", ");

  // Search options by label.
  const filteredOptions = options.filter((option) =>
    String(option.label ?? "")
      .toLowerCase()
      .includes(searchText.trim().toLowerCase()),
  );

  /* =========================================================
     CLOSE WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedInsideWrapper =
        wrapperRef.current?.contains(event.target);

      const clickedInsideDropdown =
        dropdownRef.current?.contains(event.target);

      if (!clickedInsideWrapper && !clickedInsideDropdown) {
        setIsOpen(false);
        setSearchText("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* =========================================================
     FOCUS SEARCH WHEN OPENED
  ========================================================= */

  useEffect(() => {
    if (!isOpen) return;

    const frameId = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frameId);
  }, [isOpen]);

  /* =========================================================
     POSITION DROPDOWN ABOVE OR BELOW THE FIELD
  ========================================================= */

  useEffect(() => {
    if (!isOpen) return;

    const updateDropdownPosition = () => {
      const button = buttonRef.current;
      const dropdown = dropdownRef.current;

      if (!button || !dropdown) return;

      const rect = button.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const viewportPadding = 8;

      const rootStyles = getComputedStyle(document.documentElement);

      const headerHeight =
        parseFloat(
          rootStyles.getPropertyValue("--rh-header-height"),
        ) || 0;

      const moduleNavHeight =
        parseFloat(
          rootStyles.getPropertyValue("--rh-module-nav-height"),
        ) || 0;

      const usableTop =
        headerHeight + moduleNavHeight + viewportPadding;

      const usableBottom = viewportHeight - viewportPadding;

      const spaceBelow = Math.max(
        0,
        usableBottom - rect.bottom,
      );

      const spaceAbove = Math.max(
        0,
        rect.top - usableTop,
      );

      const placeAbove =
        spaceBelow < 240 && spaceAbove > spaceBelow;

      const availableSpace = placeAbove
        ? spaceAbove
        : spaceBelow;

      const maxHeight = Math.max(
        0,
        Math.min(280, availableSpace),
      );

      let left = rect.left;

      if (left + rect.width > viewportWidth - viewportPadding) {
        left = viewportWidth - rect.width - viewportPadding;
      }

      left = Math.max(viewportPadding, left);

      const dropdownHeight = Math.min(
        dropdown.scrollHeight,
        maxHeight,
      );

      const top = placeAbove
        ? Math.max(usableTop, rect.top - dropdownHeight)
        : rect.bottom;

      setDropdownStyle({
  position: "fixed",
  top,
  left,
  width: rect.width,
  maxHeight,
  overflowY: "auto",
  zIndex: 9999999,
  backgroundColor: "#ffffff",
  visibility: "visible",
  pointerEvents: "auto",
});
    };

    updateDropdownPosition();

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen, options.length, searchText, selectedValues.length]);

  /* =========================================================
     OPEN / CLOSE DROPDOWN
  ========================================================= */

  const toggleDropdown = () => {
    if (disabled) return;

    setIsOpen((previous) => {
      if (previous) {
        setSearchText("");
        return false;
      }

      setSearchText("");
      return true;
    });
  };

  /* =========================================================
     SELECT / DESELECT OPTION
  ========================================================= */

  const handleSelect = (option) => {
    if (disabled || option.disabled) return;

    const isSelected = selectedValues.some(
      (selectedValue) =>
        String(selectedValue) === String(option.value),
    );

    const nextValues = isSelected
      ? selectedValues.filter(
          (selectedValue) =>
            String(selectedValue) !== String(option.value),
        )
      : [...selectedValues, option.value];

    onChange?.({
      target: {
        name,
        value: nextValues,
      },
    });

    // Keep the dropdown open to allow multiple selections.
    searchInputRef.current?.focus();
  };

  /* =========================================================
     KEYBOARD SUPPORT
  ========================================================= */

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      setIsOpen(false);
      setSearchText("");
      buttonRef.current?.focus();
      return;
    }

    if (
      event.key === "Enter" ||
      event.key === " " ||
      event.key === "ArrowDown"
    ) {
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
        setSearchText("");
      } else {
        searchInputRef.current?.focus();
      }
    }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      setIsOpen(false);
      setSearchText("");
      buttonRef.current?.focus();
      return;
    }

    // Prevent Enter from submitting the surrounding form.
    if (event.key === "Enter") {
      event.preventDefault();

      if (filteredOptions.length === 1) {
        handleSelect(filteredOptions[0]);
      }
    }

    if (event.key === "ArrowDown" && filteredOptions.length > 0) {
      event.preventDefault();

      dropdownRef.current
        ?.querySelector('[data-option-index="0"]')
        ?.focus();
    }
  };

  const handleOptionKeyDown = (event, option, index) => {
    if (option.disabled) {
      event.preventDefault();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(option);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      setSearchText("");
      buttonRef.current?.focus();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (index === 0) {
        searchInputRef.current?.focus();
      } else {
        dropdownRef.current
          ?.querySelector(
            `[data-option-index="${index - 1}"]`,
          )
          ?.focus();
      }
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      dropdownRef.current
        ?.querySelector(
          `[data-option-index="${index + 1}"]`,
        )
        ?.focus();
    }
  };

  /* =========================================================
     DROPDOWN CONTENT
  ========================================================= */

  const dropdown = isOpen
    ? createPortal(
        <div
          ref={dropdownRef}
          id={`${name}-dropdown`}
          className="hrms-select-dropdown"
          role="listbox"
          aria-label={label || name || "Select options"}
          aria-multiselectable="true"
          style={dropdownStyle}
        >
          {/* SEARCH FIELD */}

          <div className="hrms-select-search-wrapper">
            <svg
              className="hrms-select-search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              ref={searchInputRef}
              type="text"
              className="hrms-select-search-input"
              placeholder={`Search ${label || "options"}...`}
              value={searchText}
              autoComplete="off"
              aria-label={`Search ${label || "options"}`}
              onChange={(event) => setSearchText(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              onClick={(event) => event.stopPropagation()}
            />

            {searchText && (
              <button
                type="button"
                className="hrms-select-search-clear"
                aria-label="Clear search"
                onClick={() => {
                  setSearchText("");
                  searchInputRef.current?.focus();
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* FILTERED OPTIONS */}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const isSelected = selectedValues.some(
                (selectedValue) =>
                  String(selectedValue) === String(option.value),
              );

              const isOptionDisabled =
                disabled || Boolean(option.disabled);

              return (
                <div
                  key={option.value}
                  className={`hrms-select-option ${
                    isSelected ? "is-selected" : ""
                  } ${
                    isOptionDisabled ? "is-disabled" : ""
                  }`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={isOptionDisabled}
                  tabIndex={isOptionDisabled ? -1 : 0}
                  data-option-index={index}
                  onClick={() => handleSelect(option)}
                  onKeyDown={(event) =>
                    handleOptionKeyDown(event, option, index)
                  }
                >
                  <span>{option.label}</span>

                  {isSelected && (
                    <span className="hrms-option-check">✓</span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="hrms-select-no-results" role="status">
              No matching options found
            </div>
          )}
        </div>,
        document.body,
      )
    : null;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="hrms-form-group">
      {label && (
        <label className="hrms-form-label" htmlFor={name}>
          {label}
          {required && <span className="hrms-required">*</span>}
        </label>
      )}

      <div
        ref={wrapperRef}
        className={`hrms-custom-select-wrapper ${
          isOpen ? "is-open" : ""
        } ${error ? "has-error" : ""}`}
      >
        <button
          ref={buttonRef}
          type="button"
          id={name}
          name={name}
          className={`hrms-custom-select ${
            disabled ? "is-disabled" : ""
          }`}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? `${name}-dropdown` : undefined}
          aria-invalid={Boolean(error)}
        >
          <span
            className={
              selectedOptions.length
                ? "hrms-select-value"
                : "hrms-select-placeholder"
            }
          >
            {selectedOptions.length ? selectedLabels : placeholder}
          </span>

          <span className="hrms-select-arrow">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>
      </div>

      {dropdown}

      {error && <span className="hrms-form-error">{error}</span>}
    </div>
  );
}

export default FormMultiSelect;
