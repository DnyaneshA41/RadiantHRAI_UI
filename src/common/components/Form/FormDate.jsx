import "./FormControls.css";

function FormDate({
    label,
    name,
    value,
    onChange,
    required = false,
    disabled = false,
    readOnly = false,
    error = "",
    min,
    max,
}) {
    return (
        <div className="hrms-form-group">
            {label && (
                <label className="hrms-form-label" htmlFor={name}>
                    {label}

                    {required && (
                        <span className="hrms-required">*</span>
                    )}
                </label>
            )}

            <input
                id={name}
                name={name}
                type="date"
                value={value}
                onChange={onChange}
                disabled={disabled}
                readOnly={readOnly}
                min={min}
                max={max}
                className={`hrms-form-control hrms-date-control ${
                    error ? "hrms-form-control-error" : ""
                }`}
            />

            {error && (
                <span className="hrms-form-error">
                    {error}
                </span>
            )}
        </div>
    );
}

export default FormDate;