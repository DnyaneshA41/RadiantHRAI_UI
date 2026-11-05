import "./FormControls.css";

function FormInput({
  label,
  name,
  value,
  onChange,
  onBlur,
  onKeyDown,
  placeholder = "",
  type = "text",
  required = false,
  disabled = false,
  error = "",
  rightIcon = null,
  ...props
}) {
  // Prevent leading spaces while typing
  const handleKeyDown = (e) => {
    if (
      e.key === " " &&
      (!e.currentTarget.value || e.currentTarget.selectionStart === 0)
    ) {
      e.preventDefault();
      return;
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // Remove leading/trailing spaces when leaving the field
  const handleBlur = (e) => {
    const trimmedValue = e.target.value.trim();

    if (trimmedValue !== e.target.value) {
      onChange({
        ...e,
        target: {
          ...e.target,
          name,
          value: trimmedValue,
        },
      });
    }

    if (onBlur) {
      onBlur({
        ...e,
        target: {
          ...e.target,
          name,
          value: trimmedValue,
        },
      });
    }
  };

  return (
    <div className="hrms-form-group">
      {label && (
        <label className="hrms-form-label" htmlFor={name}>
          {label}
          {required && <span className="hrms-required">*</span>}
        </label>
      )}

      <div className="hrms-input-wrapper">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onWheel={(event) => {
            if (type === "number") {
              event.currentTarget.blur();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`hrms-form-control ${
            error ? "hrms-form-control-error" : ""
          }`}
          {...props}
        />

        {rightIcon && <div className="hrms-input-right-icon">{rightIcon}</div>}
      </div>

      {error && <span className="hrms-form-error">{error}</span>}
    </div>
  );
}

export default FormInput;
