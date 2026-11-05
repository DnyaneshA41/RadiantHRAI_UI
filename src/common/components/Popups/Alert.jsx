import React from "react";
import "./Alert.css";

export default function ConfirmPopup({
  isOpen,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this record?",
  itemName = "",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="hrms-confirm-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel?.();
        }
      }}
    >
      <div
        className="hrms-confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="hrms-confirm-title"
        aria-describedby="hrms-confirm-message"
      >
        <div className="hrms-confirm-icon">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="m19 6-1 14H6L5 6" />
            <path d="M10 11v5M14 11v5" />
          </svg>
        </div>

        <h3
          id="hrms-confirm-title"
          className="hrms-confirm-title"
        >
          {title}
        </h3>

        <p
          id="hrms-confirm-message"
          className="hrms-confirm-message"
        >
          {message}
          {itemName && (
            <>
              {" "}
              <strong>{itemName}</strong>
            </>
          )}
        </p>

        <p className="hrms-confirm-note">
          This action may not be reversible.
        </p>

        <div className="hrms-confirm-actions">
          <button
            type="button"
            className="hrms-confirm-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="hrms-confirm-delete"
            onClick={onConfirm}
            disabled={loading}
            autoFocus
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
