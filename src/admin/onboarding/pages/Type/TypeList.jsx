import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiList } from "react-icons/fi";

import { EditIcon, DeleteIcon } from "../../../../common/components/Icons/Icons.jsx";
import Toast from "../../../../common/components/Popups/Toast";
import Alert from "../../../../common/components/Popups/Alert.jsx";
import DataTable from "../../../../common/components/DataTable/DataTable";
import { getAllTypes, deleteType } from "../../services/TypeApi.js";
import { mapType, extractTypes, getApiErrorMessage } from "../../mappers/TypeMapper.js";

export default function TypeList({
  types: suppliedTypes,
  loading: suppliedLoading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();
  const [typeRows, setTypeRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    setToast({ id: Date.now(), message, type, duration });
  }, []);
  const handleToastClose = useCallback(() => setToast(null), []);

  const fetchTypes = useCallback(async () => {
    if (Array.isArray(suppliedTypes)) {
      setTypeRows(suppliedTypes.map(mapType));
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await getAllTypes();
      setTypeRows(extractTypes(response).map(mapType));
    } catch (err) {
      console.error("Failed to fetch types:", err.response?.data || err.message);
      setTypeRows([]);
      setError(getApiErrorMessage(err, "Unable to load types."));
    } finally {
      setLoading(false);
    }
  }, [suppliedTypes]);

  useEffect(() => { fetchTypes(); }, [fetchTypes]);

//   const handleAdd = useCallback(() => {
//     if (onAdd) return onAdd();
//     navigate("/admin/organization/type/add", {
//       state: { mode: "add", type: null, encryptedId: null },
//     });
//   }, [navigate, onAdd]);

const handleAdd = useCallback(() => {
  if (onAdd) {
    onAdd();
    return;
  }

  navigate("/admin/onboarding/type/add", {
    state: {
      mode: "add",
      isEdit: false,
      encryptedId: null,
      type: null,
    },
  });
}, [onAdd, navigate]);

  const handleEdit = useCallback((item) => {
    if (!item.encryptedId) {
      showToast("Encrypted Type ID is missing. Please check the GetAllType response.", "error", 5000);
      console.error("Encrypted Type ID is missing:", item);
      return;
    }

    if (onEdit) {
      onEdit({ ...item, encryptedId: item.encryptedId });
      return;
    }

    navigate("/admin/onboarding/type/add", {
      state: {
        mode: "edit",
        isEdit: true,
        encryptedId: item.encryptedId,
        type: { ...item, encryptedId: item.encryptedId },
      },
    });
  }, [navigate, onEdit, showToast]);

  const handleDelete = useCallback((item) => {
    if (!item.encryptedId) {
      showToast("Cannot delete this Type because its encrypted ID is missing.", "error", 5000);
      console.error("Encrypted Type ID is missing:", item);
      return;
    }
    setSelectedType(item);
    setShowDeletePopup(true);
  }, [showToast]);

  const confirmDelete = useCallback(async () => {
    if (!selectedType || isDeleting) return;
    setIsDeleting(true);
    try {
      const response = onDelete
        ? await onDelete(selectedType)
        : await deleteType(selectedType.encryptedId);

      setShowDeletePopup(false);
      setSelectedType(null);
      showToast(
        response?.message || response?.Message || "Type deleted successfully.",
        "success"
      );
      await fetchTypes();
    } catch (err) {
      console.error("Failed to delete Type:", err.response?.data || err.message);
      showToast(getApiErrorMessage(err, "Failed to delete Type. Please try again."), "error", 5000);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedType, isDeleting, onDelete, fetchTypes, showToast]);

  const typeFilters = useMemo(() => [{
    key: "rdhR0000XIXType",
    label: "Type",
    options: [...new Set(typeRows.map((item) => item.rdhR0000XIXType).filter(Boolean))],
    placeholder: "All Types",
  }], [typeRows]);

  const columns = useMemo(() => [
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
          title={`Edit ${item.rdhR0000XIXType}`}
          aria-label={`Edit ${item.rdhR0000XIXType}`}
          onClick={(event) => { event.stopPropagation(); handleEdit(item); }}
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
          title={`Delete ${item.rdhR0000XIXType}`}
          aria-label={`Delete ${item.rdhR0000XIXType}`}
          onClick={(event) => { event.stopPropagation(); handleDelete(item); }}
        >
          <DeleteIcon />
        </button>
      ),
    },
    { header: "Type", key: "rdhR0000XIXType", accessor: "rdhR0000XIXType" },
    // { header: "Status", key: "isDeactivated", accessor: "isDeactivated",
    //   render: (_, item) => item.isDeactivated ? "Deactivated" : "Active" },
  ], [handleEdit, handleDelete]);

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
            <button type="button" onClick={fetchTypes} disabled={loading}>Retry</button>
          </div>
        )}

        <DataTable
          data={typeRows}
          columns={columns}
          title="Type - List"
          subtitle="View and manage types."
          titleIcon={<FiList size={19} />}
          showTitle
          searchable
          searchPlaceholder="Search..."
          filterable
          filters={typeFilters}
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
          fileName="types"
          rowKey="id"
          loading={suppliedLoading ?? loading}
          emptyMessage="No types found."
          className="organization-entity-table"
        />
      </div>

      <Alert
        isOpen={showDeletePopup}
        title="Delete Type"
        message="Are you sure you want to delete"
        itemName={selectedType?.rdhR0000XIXType || ""}
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (isDeleting) return;
          setShowDeletePopup(false);
          setSelectedType(null);
        }}
      />
    </>
  );
}
