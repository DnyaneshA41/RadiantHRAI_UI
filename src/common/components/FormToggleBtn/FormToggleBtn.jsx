import React from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import "./FormToggleBtn.css";

function FormToggleButton({ isOpen, onClick }) {
  return (
    <button
      type="button"
      className="hrms-section-toggle-btn"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={isOpen ? "Collapse section" : "Expand section"}
    >
      {isOpen ? <FiChevronUp /> : <FiChevronDown />}
    </button>
  );
}

export default FormToggleButton;