import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import "./FormOffcanvas.css";

function FormOffcanvas({
  show,
  onClose,
  title,
  children,
  footer,
  width = "50vw",
}) {
  useEffect(() => {
    if (!show) return;

    document.body.classList.add("hrms-offcanvas-open");

    return () => {
      document.body.classList.remove("hrms-offcanvas-open");
    };
  }, [show]);

  if (!show) return null;

  return (
    <>
      <div
        className="hrms-offcanvas-overlay"
        onClick={onClose}
      />

      <aside
        className="hrms-offcanvas"
        style={{ width }}
      >
        <div className="hrms-offcanvas-header">
          <div className="hrms-offcanvas-title">
            {title}
          </div>

          <button
            type="button"
            className="hrms-offcanvas-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX size={21} />
          </button>
        </div>

        <div className="hrms-offcanvas-body">
          {children}
        </div>

        {footer && (
          <div className="hrms-offcanvas-footer">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}

export default FormOffcanvas;