import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./FormControls.css";

function FormSelect({
  label,
  name,
  value,
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

  const selectedOption = options.find(
    (option) => String(option.value) === String(value),
  );

  // Filter options based on search text.
  const filteredOptions = options.filter((option) =>
    String(option.label ?? "")
      .toLowerCase()
      .includes(searchText.trim().toLowerCase()),
  );

  /* =========================================================
     CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedInsideWrapper = wrapperRef.current?.contains(event.target);

      const clickedInsideDropdown = dropdownRef.current?.contains(event.target);

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
     FOCUS SEARCH WHEN DROPDOWN OPENS
  ========================================================= */

  useEffect(() => {
    if (!isOpen) return;

    const focusSearch = () => {
      searchInputRef.current?.focus();
    };

    // Wait for the portal dropdown to render.
    const frameId = requestAnimationFrame(focusSearch);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isOpen]);

  /* =========================================================
   POSITION DROPDOWN USING VIEWPORT COORDINATES
   ACCOUNT FOR HEADER AND MODULE NAV HEIGHT VARIABLES
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

      // Get navigation heights from CSS variables.
      const rootStyles = getComputedStyle(document.documentElement);

      const headerHeight = parseFloat(
        rootStyles.getPropertyValue("--rh-header-height"),
      );

      const moduleNavHeight = parseFloat(
        rootStyles.getPropertyValue("--rh-module-nav-height"),
      );

      // Reserve space for the header and module navigation.
      const usableTop = headerHeight + moduleNavHeight + viewportPadding;

      const usableBottom = viewportHeight - viewportPadding;

      // Calculate available space above and below the select.
      const spaceBelow = Math.max(0, usableBottom - rect.bottom);

      const spaceAbove = Math.max(0, rect.top - usableTop);

      // Limit the dropdown's maximum height.
      const dropdownContentHeight = Math.min(dropdown.scrollHeight, 280);

      // Open above if the space below is insufficient
      // and there is more room above the select.
      const placeAbove =
        spaceBelow < dropdownContentHeight && spaceAbove > spaceBelow;

      const availableSpace = placeAbove ? spaceAbove : spaceBelow;

      const maxHeight = Math.min(280, availableSpace);

      // Prevent the dropdown from extending outside
      // the horizontal viewport boundaries.
      let left = rect.left;

      if (left + rect.width > viewportWidth - viewportPadding) {
        left = viewportWidth - rect.width - viewportPadding;
      }

      left = Math.max(viewportPadding, left);

      // Calculate the actual dropdown height.
      const dropdownHeight = Math.min(dropdown.scrollHeight, maxHeight);

      // Calculate the final vertical position.
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

    // Initial position when dropdown opens.
    updateDropdownPosition();

    // Recalculate when the viewport or page scroll changes.
    window.addEventListener("resize", updateDropdownPosition);

    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);

      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen, options.length, searchText]);

  /* =========================================================
     OPEN / CLOSE DROPDOWN
  ========================================================= */

  const toggleDropdown = () => {
    if (disabled) return;

    setIsOpen((prev) => {
      if (prev) {
        setSearchText("");
        return false;
      }

      setSearchText("");
      return true;
    });
  };

  /* =========================================================
     SELECT OPTION
  ========================================================= */

  const handleSelect = (option) => {
  // Do not allow disabled options to be selected.
  if (disabled || option.disabled) return;

  onChange?.({
    target: {
      name,
      value: option.value,
    },
  });

  setIsOpen(false);
  setSearchText("");

  buttonRef.current?.focus();
};

  /* =========================================================
     SELECT PLACEHOLDER
  ========================================================= */

  const handlePlaceholderSelect = () => {
    onChange?.({
      target: {
        name,
        value: "",
      },
    });

    setIsOpen(false);
    setSearchText("");

    buttonRef.current?.focus();
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
      toggleDropdown();
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

    // Prevent Enter from triggering a form submission.
    if (event.key === "Enter") {
      event.preventDefault();

      // Select the only matching option when exactly one exists.
      if (filteredOptions.length === 1) {
        handleSelect(filteredOptions[0]);
      }
    }

    // Keep arrow keys available for text editing/navigation.
    if (event.key === "ArrowDown" && filteredOptions.length > 0) {
      event.preventDefault();

      const firstOption = dropdownRef.current?.querySelector(
        '[data-option-index="0"]',
      );

      firstOption?.focus();
    }
  };

  const handleOptionKeyDown = (event, option) => {
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

    const index = Number(event.currentTarget.dataset.optionIndex);

    if (index === 0) {
      searchInputRef.current?.focus();
    } else {
      dropdownRef.current
        ?.querySelector(`[data-option-index="${index - 1}"]`)
        ?.focus();
    }
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();

    const index = Number(event.currentTarget.dataset.optionIndex);

    dropdownRef.current
      ?.querySelector(`[data-option-index="${index + 1}"]`)
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
          aria-label={label || name || "Select an option"}
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

          {/* PLACEHOLDER OPTION */}

          {placeholder && (
            <div
              key={`placeholder-${name}`}
              className={`hrms-select-option ${!value ? "is-selected" : ""}`}
              role="option"
              aria-selected={!value}
              tabIndex={0}
              data-option-index="placeholder"
              onClick={handlePlaceholderSelect}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handlePlaceholderSelect();
                }

                if (event.key === "ArrowDown") {
                  event.preventDefault();

                  dropdownRef.current
                    ?.querySelector('[data-option-index="0"]')
                    ?.focus();
                }

                if (event.key === "Escape") {
                  setIsOpen(false);
                  setSearchText("");
                  buttonRef.current?.focus();
                }
              }}
            >
              <span>{placeholder}</span>

              {!value && <span className="hrms-option-check">✓</span>}
            </div>
          )}

          {/* FILTERED OPTIONS */}

          {filteredOptions.length > 0 ? (
  filteredOptions.map((option, index) => {
    const isSelected = String(option.value) === String(value);
    const isOptionDisabled = disabled || Boolean(option.disabled);

    return (
      <div
        key={option.value}
        className={`hrms-select-option ${
          isSelected ? "is-selected" : ""
        } ${isOptionDisabled ? "is-disabled" : ""}`}
        role="option"
        aria-selected={isSelected}
        aria-disabled={isOptionDisabled}
        tabIndex={isOptionDisabled ? -1 : 0}
        data-option-index={index}
        onClick={() => {
          if (!isOptionDisabled) {
            handleSelect(option);
          }
        }}
        onKeyDown={(event) => handleOptionKeyDown(event, option)}
      >
        <span>{option.label}</span>

        {isSelected && <span className="hrms-option-check">✓</span>}
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
      {/* LABEL */}

      {label && (
        <label className="hrms-form-label" htmlFor={name}>
          {label}

          {required && <span className="hrms-required">*</span>}
        </label>
      )}

      {/* CUSTOM SELECT */}

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
          className={`hrms-custom-select ${disabled ? "is-disabled" : ""}`}
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
              selectedOption ? "hrms-select-value" : "hrms-select-placeholder"
            }
          >
            {selectedOption ? selectedOption.label : placeholder}
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
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>
      </div>

      {/* PORTAL DROPDOWN */}

      {dropdown}

      {/* ERROR */}

      {error && <span className="hrms-form-error">{error}</span>}
    </div>
  );
}

export default FormSelect;
