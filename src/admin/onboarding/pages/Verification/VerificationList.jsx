// VerificationList.jsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { FiList } from "react-icons/fi";

import {
  EditIcon,
  DeleteIcon,
} from "../../../../common/components/Icons/Icons.jsx";

import Toast from "../../../../common/components/Popups/Toast";
import Alert from "../../../../common/components/Popups/Alert.jsx";
import DataTable from "../../../../common/components/DataTable/DataTable";

import {
  getAllVerifications,
  deleteVerification,
} from "../../services/VerificationApi.js";

import {
  mapVerification,
  extractVerifications,
  getApiErrorMessage,
} from "../../mappers/VerificationMapper.js";

export default function VerificationList({
  verifications: suppliedVerifications,
  loading: suppliedLoading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const [verificationRows, setVerificationRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = useCallback(
    (message, type = "info", duration = 3000) => {
      setToast({ id: Date.now(), message, type, duration });
    },
    []
  );

  const handleToastClose = useCallback(() => {
    setToast(null);
  }, []);

  const fetchVerifications = useCallback(async () => {
    if (Array.isArray(suppliedVerifications)) {
      setVerificationRows(suppliedVerifications.map(mapVerification));
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getAllVerifications();

      setVerificationRows(
        extractVerifications(response).map(mapVerification)
      );
    } catch (err) {
      console.error(
        "Failed to fetch verifications:",
        err.response?.data || err.message
      );

      setVerificationRows([]);

      setError(
        getApiErrorMessage(
          err,
          "Unable to load verifications."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [suppliedVerifications]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd();
      return;
    }

    navigate("/admin/onboarding/verification/add", {
      state: {
        mode: "add",
        isEdit: false,
        encryptedId: null,
        verification: null,
      },
    });
  }, [onAdd, navigate]);

  const handleEdit = useCallback(
    (item) => {
      if (!item.encryptedId) {
        showToast(
          "Encrypted Verification ID is missing. Please check the GetVerification response.",
          "error",
          5000
        );

        console.error(
          "Encrypted Verification ID is missing:",
          item
        );

        return;
      }

      if (onEdit) {
        onEdit({
          ...item,
          encryptedId: item.encryptedId,
        });

        return;
      }

      navigate("/admin/onboarding/verification/add", {
        state: {
          mode: "edit",
          isEdit: true,
          encryptedId: item.encryptedId,
          verification: {
            ...item,
            encryptedId: item.encryptedId,
          },
        },
      });
    },
    [navigate, onEdit, showToast]
  );

  const handleDelete = useCallback(
    (item) => {
      if (!item.encryptedId) {
        showToast(
          "Cannot delete this Verification because its encrypted ID is missing.",
          "error",
          5000
        );

        console.error(
          "Encrypted Verification ID is missing:",
          item
        );

        return;
      }

      setSelectedVerification(item);
      setShowDeletePopup(true);
    },
    [showToast]
  );

  const confirmDelete = useCallback(async () => {
    if (!selectedVerification || isDeleting) return;

    setIsDeleting(true);

    try {
      const response = onDelete
        ? await onDelete(selectedVerification)
        : await deleteVerification(
            selectedVerification.encryptedId
          );

      setShowDeletePopup(false);
      setSelectedVerification(null);

      showToast(
        response?.message ||
          response?.Message ||
          "Verification deleted successfully.",
        "success"
      );

      await fetchVerifications();
    } catch (err) {
      console.error(
        "Failed to delete Verification:",
        err.response?.data || err.message
      );

      showToast(
        getApiErrorMessage(
          err,
          "Failed to delete Verification. Please try again."
        ),
        "error",
        5000
      );
    } finally {
      setIsDeleting(false);
    }
  }, [
    selectedVerification,
    isDeleting,
    onDelete,
    fetchVerifications,
    showToast,
  ]);

  const verificationFilters = useMemo(
    () => [
      {
        key: "verificationName",
        label: "Verification Name",
        options: [
          ...new Set(
            verificationRows
              .map((item) => item.verificationName)
              .filter(Boolean)
          ),
        ],
        placeholder: "All Verifications",
      },
    
    ],
    [verificationRows]
  );

  const columns = useMemo(
    () => [
      {
        header: "Edit",
        key: "edit",
        width: "90px",
        sortable: false,
        searchable: false,
        exportable: false,

        render: (_, item) => (
          <button
            type="button"
            className="icon-btn"
            title={`Edit ${item.verificationName}`}
            aria-label={`Edit ${item.verificationName}`}
            onClick={(event) => {
              event.stopPropagation();
              handleEdit(item);
            }}
          >
            <EditIcon />
          </button>
        ),
      },
      {
        header: "Delete",
        key: "delete",
        width: "100px",
        sortable: false,
        searchable: false,
        exportable: false,

        render: (_, item) => (
          <button
            type="button"
            className="delete-icon"
            title={`Delete ${item.verificationName}`}
            aria-label={`Delete ${item.verificationName}`}
            onClick={(event) => {
              event.stopPropagation();
              handleDelete(item);
            }}
          >
            <DeleteIcon />
          </button>
        ),
      },
      {
        header: "Verification Name",
        key: "verificationName",
        accessor: "verificationName",
      },
      {
        header: "Mandatory",
        key: "isMandatory",
        accessor: "isMandatory",
        render: (_, item) => (
          <span>
            {item.isMandatory ? "Yes" : "No"}
          </span>
        ),
      },
    ],
    [handleEdit, handleDelete]
  );

  return (
    <>
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={handleToastClose}
        />
      )}

      <div className="hrms-form-container organization-entity-list-page">
        {error && (
          <div className="org-entity-error" role="alert">
            <span>{error}</span>

            <button
              type="button"
              onClick={fetchVerifications}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <DataTable
          data={verificationRows}
          columns={columns}
          title="Verification - List"
          subtitle="View and manage employee verifications."
          titleIcon={<FiList size={19} />}
          showTitle
          searchable
          searchPlaceholder="Search..."
          filterable
          filters={verificationFilters}
          showAddButton
          addLabel="Add"
          onAdd={handleAdd}
          pageSizeOptions={[10, 25, 50, 100]}
          defaultPageSize={10}
          enableExport
          enableCopy
          enableCsv
          enableExcel
          enablePdf
          enablePrint
          fileName="verifications"
          rowKey="id"
          loading={suppliedLoading ?? loading}
          emptyMessage="No verifications found."
          className="organization-entity-table"
        />
      </div>

      <Alert
        isOpen={showDeletePopup}
        title="Delete Verification"
        message="Are you sure you want to delete"
        itemName={selectedVerification?.verificationName || ""}
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (isDeleting) return;

          setShowDeletePopup(false);
          setSelectedVerification(null);
        }}
      />
    </>
  );
}