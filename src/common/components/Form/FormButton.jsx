import "./FormControls.css";

function FormButton({
    children,
    type = "button",
    variant = "primary",
    onClick,
    disabled = false,
}) {
    return (
        <button
            type={type}
            className={`hrms-form-button hrms-form-button-${variant}`}
            onClick={onClick}
            disabled={disabled}
        >
            <span>{children}</span>
        </button>
    );
}

export default FormButton;