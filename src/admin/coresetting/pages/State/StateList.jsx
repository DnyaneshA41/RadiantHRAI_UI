// statelist.jsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";

import {
  EditIcon,
  DeleteIcon,
} from "../../../../common/components/Icons/Icons.jsx";

import Toast from "../../../../common/components/Popups/Toast";
import Alert from "../../../../common/components/Popups/Alert.jsx";
import DataTable from "../../../../common/components/DataTable/DataTable";
import axiosClientModule from "../../../../api/axiosClientModule";

import {
  getAllStatesApi,
  deleteStateApi,
  getErrorMessage,
} from "../../services/StateApi.js";

import { mapState, extractArray } from "../../mappers/StateMapper.js";

export default function StateList({
  states: suppliedStates,
  loading: suppliedLoading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const [stateRows, setStateRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    setToast({ id: Date.now(), message, type, duration });
  }, []);

  const stateFilters = useMemo(
    () => [
      {
        key: "stateName",
        label: "State Name",
        options: [
          ...new Set(stateRows.map((item) => item.stateName).filter(Boolean)),
        ],
        placeholder: "All State Names",
      },
      {
        key: "stateCode",
        label: "State Code",
        options: [
          ...new Set(stateRows.map((item) => item.stateCode).filter(Boolean)),
        ],
        placeholder: "All State Codes",
      },
    ],
    [stateRows]
  );

  const fetchStates = useCallback(async () => {
    if (Array.isArray(suppliedStates)) {
      setStateRows(suppliedStates.map(mapState));
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getAllStatesApi();
      setStateRows(extractArray(response).map(mapState));
    } catch (err) {
      console.error("Failed to fetch states:", err);
      setStateRows([]);
      setError(getErrorMessage(err, "Unable to load states."));
    } finally {
      setLoading(false);
    }
  }, [suppliedStates]);

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd();
      return;
    }

    navigate("/admin/coresettings/state/add", {
      state: {
        mode: "add",
        isEdit: false,
        state: null,
        encryptedId: null,
      },
    });
  }, [navigate, onAdd]);

  const handleEdit = useCallback(
    (row) => {
      if (!row.encryptedId) {
        showToast(
          "Encrypted State ID is missing. Check the GetAllState response.",
          "error",
          4000
        );
        console.error("Missing encrypted State ID:", row);
        return;
      }

      if (onEdit) {
        onEdit(row);
        return;
      }

      navigate("/admin/coresettings/state/add", {
        state: {
          mode: "edit",
          isEdit: true,
          encryptedId: row.encryptedId,
          state: row,
        },
      });
    },
    [navigate, onEdit, showToast]
  );

  const handleDelete = useCallback(
    (row) => {
      if (!row.encryptedId) {
        showToast(
          "Encrypted State ID is missing. Check the GetAllState response.",
          "error",
          4000
        );
        return;
      }

      setSelectedState(row);
      setShowDeletePopup(true);
    },
    [showToast]
  );

  const confirmDelete = useCallback(async () => {
    if (!selectedState || isDeleting) return;

    setIsDeleting(true);

    try {
      if (onDelete) {
        await onDelete(selectedState);
      } else {
        await deleteStateApi(selectedState.encryptedId);
      }

      setShowDeletePopup(false);
      setSelectedState(null);

      showToast("State deleted successfully.", "success");

      await fetchStates();
    } catch (err) {
      console.error("Failed to delete state:", err);

      showToast(
        getErrorMessage(err, "Failed to delete state. Please try again."),
        "error",
        4000
      );
    } finally {
      setIsDeleting(false);
    }
  }, [selectedState, isDeleting, onDelete, fetchStates, showToast]);

  const columns = useMemo(
    () => [
      {
        header: "Edit",
        key: "edit",
        width: "80px",
        sortable: false,
        searchable: false,
        exportable: false,
        render: (_, row) => (
          <button
            type="button"
            className="icon-btn"
            title={`Edit ${row.stateName}`}
            aria-label={`Edit ${row.stateName}`}
            onClick={(event) => {
              event.stopPropagation();
              handleEdit(row);
            }}
          >
            <EditIcon />
          </button>
        ),
      },
      {
        header: "Delete",
        key: "delete",
        width: "90px",
        sortable: false,
        searchable: false,
        exportable: false,
        render: (_, row) => (
          <button
            type="button"
            className="delete-icon"
            title={`Delete ${row.stateName}`}
            aria-label={`Delete ${row.stateName}`}
            onClick={(event) => {
              event.stopPropagation();
              handleDelete(row);
            }}
          >
            <DeleteIcon />
          </button>
        ),
      },
      {
        header: "State Name",
        key: "stateName",
        accessor: "stateName",
      },
      {
        header: "State Code",
        key: "stateCode",
        accessor: "stateCode",
      },
      {
        header: "Default",
        key: "isDefault",
        accessor: "isDefault",
        render: (_, row) => (row.isDefault ? "Yes" : "No"),
      },
      {
        header: "PT Applicable",
        key: "ptApplicable",
        accessor: "ptApplicable",
        render: (_, row) => (row.ptApplicable ? "Yes" : "No"),
      },
      {
        header: "LWF Applicable",
        key: "lwfApplicable",
        accessor: "lwfApplicable",
        render: (_, row) => (row.lwfApplicable ? "Yes" : "No"),
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
          onClose={() => setToast(null)}
        />
      )}

      <div className="hrms-form-container organization-entity-list-page">
        {error && (
          <div className="org-entity-error" role="alert">
            <span>{error}</span>

            <button
              type="button"
              onClick={fetchStates}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <DataTable
          data={stateRows}
          columns={columns}
          title="State - List"
          subtitle="View and manage states"
          titleIcon={<FiMapPin size={19} />}
          showTitle
          searchable
          searchPlaceholder="Search states..."
          filterable
          filters={stateFilters}
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
          fileName="states"
          rowKey="id"
          loading={suppliedLoading ?? loading}
          emptyMessage="No states found."
          className="organization-entity-table"
        />
      </div>

      <Alert
        isOpen={showDeletePopup}
        title="Delete State"
        message="Are you sure you want to delete"
        itemName={selectedState?.stateName || ""}
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (isDeleting) return;

          setShowDeletePopup(false);
          setSelectedState(null);
        }}
      />
    </>
  );
}

export {
  getAllStatesApi,
  deleteStateApi,
};