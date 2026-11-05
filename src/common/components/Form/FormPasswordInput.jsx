import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

import FormInput from "./FormInput";

function FormPasswordInput({
  label = "",
  name,
  type = "text",
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "Enter value",
  error = "",
  inputMode,
  numbersOnly = false,
}) {
  const [isVisible, setIsVisible] = useState(false);

  const hasLabel = Boolean(label && String(label).trim());

  const handleChange = (e) => {
    if (numbersOnly) {
      const numericValue = e.target.value.replace(/\D/g, "");

      onChange({
        ...e,
        target: {
          ...e.target,
          name,
          value: numericValue,
        },
      });

      return;
    }

    onChange(e);
  };

  return (
    <div
      className={`hrms-password-input-wrapper ${
        hasLabel ? "has-label" : "no-label"
      }`}
    >
      <FormInput
        label={label}
        name={name}
        value={value}
        onChange={handleChange}
        type={isVisible ? "text" : type}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        error={error}
        inputMode={numbersOnly ? "numeric" : inputMode}
      />

      <button
        type="button"
        className="hrms-password-toggle-btn"
        onClick={() => setIsVisible((prev) => !prev)}
        aria-label={isVisible ? "Hide value" : "Show value"}
        title={isVisible ? "Hide value" : "Show value"}
        disabled={disabled}
      >
        {isVisible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>
    </div>
  );
}

export default FormPasswordInput;
