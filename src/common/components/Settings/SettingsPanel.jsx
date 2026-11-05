import { useEffect, useRef } from "react";
import {
  FiShield,
  FiSun,
  FiMoon,
  FiGlobe,
  FiChevronRight,
  FiCheck,
  FiX,
} from "react-icons/fi";

import "./SettingsPanel.css";

const SettingsPanel = ({ show, onClose, onAdminPanel, isAdmin = false }) => {
  const panelRef = useRef(null);

  /* =========================================================
       CLOSE ON OUTSIDE CLICK
    ========================================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        show &&
        panelRef.current &&
        !panelRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [show, onClose]);

  /* =========================================================
       CLOSE ON ESCAPE
    ========================================================= */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  /* =========================================================
       HIDE PANEL
    ========================================================= */

  if (!show) {
    return null;
  }

  return (
    <>
      <div className="settings-backdrop" onClick={onClose} />

      <div className="settings-panel" ref={panelRef}>
        {/* =====================================================
                HEADER
            ====================================================== */}

        <div className="settings-header">
          <h3>Settings</h3>

          <button
            type="button"
            className="settings-close-btn"
            onClick={onClose}
            aria-label="Close settings"
          >
            <FiX size={17} />
          </button>
        </div>

        {/* =====================================================
                SWITCH PANEL
            ====================================================== */}

      <button
    type="button"
    className="settings-workspace"
    onClick={() => onAdminPanel?.(isAdmin ? "user" : "admin")}
>
    <div className="settings-item-icon">
        <FiShield size={18} />
    </div>

    <div className="settings-item-content">
        <span className="settings-item-title">
            {isAdmin ? "Switch to User Panel" : "Switch to Admin Panel"}
        </span>

        <span className="settings-item-subtitle">
            Switch workspace
        </span>
    </div>

    <FiChevronRight className="settings-item-arrow" size={17} />
</button>

        <div className="settings-divider" />

        {/* =====================================================
                THEME
            ====================================================== */}

        <div className="settings-section">
          <div className="settings-section-title">Theme</div>

          <div className="settings-section-subtitle">
            Choose your appearance
          </div>

          <div className="settings-theme-options">
            {/* LIGHT */}

            <button type="button" className="settings-theme-option active">
              <div className="settings-theme-icon">
                <FiSun size={17} />
              </div>

              <span>Light</span>

              <FiCheck className="settings-theme-check" size={15} />
            </button>

            {/* DARK */}

            <button type="button" className="settings-theme-option">
              <div className="settings-theme-icon">
                <FiMoon size={17} />
              </div>

              <span>Dark</span>
            </button>
          </div>
        </div>

        <div className="settings-divider" />

        {/* =====================================================
                LANGUAGE
            ====================================================== */}

        <div className="settings-section settings-language-section">
          <div className="settings-section-title">Language</div>

          <div className="settings-section-subtitle">Choose your language</div>

          <button type="button" className="settings-language-option">
            <div className="settings-language-left">
              <div className="settings-language-icon">
                <FiGlobe size={17} />
              </div>

              <span>English</span>
            </div>

            <FiChevronRight size={17} />
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
