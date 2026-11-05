import "./FormControls.css";

function FormCheckbox({
    label,
    name,
    checked,
    onChange,
    disabled = false,
}) {
    return (
        <label className="hrms-checkbox-wrapper">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />

            <span className="hrms-checkbox-box"></span>

            <span className="hrms-checkbox-label">
                {label}
            </span>
        </label>
    );
}

export default FormCheckbox;