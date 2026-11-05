
import { useEffect } from "react";
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from "react-icons/fi";
import "./Toast.css";

const toastIcons = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  warning: FiAlertTriangle,
  info: FiInfo,
};

const Toast = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    if (!message || duration <= 0) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const Icon = toastIcons[type] || FiInfo;

  return (
    <div
      className={`hrms-toast hrms-toast-${type}`}
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      <Icon className="hrms-toast-icon" size={19} />

      <span className="hrms-toast-message">{message}</span>

      <button
        type="button"
        className="hrms-toast-close"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        <FiX size={16} />
      </button>

      {duration > 0 && (
        <div
          className="hrms-toast-timer"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
};

export default Toast;
