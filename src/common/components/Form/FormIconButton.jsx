function FormIconButton({
    children,
    type = "button",
    onClick,
    title = "",
    disabled = false,
}) {
    return (
        <button
            type={type}
            className="hrms-icon-button"
            onClick={onClick}
            title={title}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export default FormIconButton;