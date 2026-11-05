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
  getAllGroups,
  deleteGroup,
} from "../../services/GroupApi.js";

import {
  mapGroup,
  extractGroups,
  getApiErrorMessage,
} from "../../mappers/GroupMapper.js";

export default function GroupList({
  groups: suppliedGroups,
  loading: suppliedLoading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const [groupRows, setGroupRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = useCallback(
    (message, type = "info", duration = 3000) => {
      setToast({ id: Date.now(), message, type, duration });
    },
    []
  );

  const handleToastClose = useCallback(() => setToast(null), []);

  const fetchGroups = useCallback(async () => {
    if (Array.isArray(suppliedGroups)) {
      setGroupRows(suppliedGroups.map(mapGroup));
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getAllGroups();

      setGroupRows(extractGroups(response).map(mapGroup));
    } catch (err) {
      console.error(
        "Failed to fetch groups:",
        err.response?.data || err.message
      );

      setGroupRows([]);

      setError(
        getApiErrorMessage(err, "Unable to load groups.")
      );
    } finally {
      setLoading(false);
    }
  }, [suppliedGroups]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd();
      return;
    }

    navigate("/admin/onboarding/group/add", {
      state: {
        mode: "add",
        isEdit: false,
        encryptedId: null,
        group: null,
      },
    });
  }, [onAdd, navigate]);

  const handleEdit = useCallback(
    (item) => {
      if (!item.encryptedId) {
        showToast(
          "Encrypted Group ID is missing. Please check the GetEmployeeGroup response.",
          "error",
          5000
        );

        console.error("Encrypted Group ID is missing:", item);
        return;
      }

      if (onEdit) {
        onEdit({
          ...item,
          encryptedId: item.encryptedId,
        });

        return;
      }

      navigate("/admin/onboarding/group/add", {
        state: {
          mode: "edit",
          isEdit: true,
          encryptedId: item.encryptedId,
          group: {
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
          "Cannot delete this Group because its encrypted ID is missing.",
          "error",
          5000
        );

        console.error("Encrypted Group ID is missing:", item);
        return;
      }

      setSelectedGroup(item);
      setShowDeletePopup(true);
    },
    [showToast]
  );

  const confirmDelete = useCallback(async () => {
    if (!selectedGroup || isDeleting) return;

    setIsDeleting(true);

    try {
      const response = onDelete
        ? await onDelete(selectedGroup)
        : await deleteGroup(selectedGroup.encryptedId);

      setShowDeletePopup(false);
      setSelectedGroup(null);

      showToast(
        response?.message ||
          response?.Message ||
          "Group deleted successfully.",
        "success"
      );

      await fetchGroups();
    } catch (err) {
      console.error(
        "Failed to delete Group:",
        err.response?.data || err.message
      );

      showToast(
        getApiErrorMessage(
          err,
          "Failed to delete Group. Please try again."
        ),
        "error",
        5000
      );
    } finally {
      setIsDeleting(false);
    }
  }, [
    selectedGroup,
    isDeleting,
    onDelete,
    fetchGroups,
    showToast,
  ]);

  const groupFilters = useMemo(
    () => [
      {
        key: "rdhR0000XVIIIName",
        label: "Group Name",
        options: [
          ...new Set(
            groupRows
              .map((item) => item.rdhR0000XVIIIName)
              .filter(Boolean)
          ),
        ],
        placeholder: "All Groups",
      },
    ],
    [groupRows]
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
            title={`Edit ${item.rdhR0000XVIIIName}`}
            aria-label={`Edit ${item.rdhR0000XVIIIName}`}
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
            title={`Delete ${item.rdhR0000XVIIIName}`}
            aria-label={`Delete ${item.rdhR0000XVIIIName}`}
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
        header: "Group Name",
        key: "rdhR0000XVIIIName",
        accessor: "rdhR0000XVIIIName",
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
              onClick={fetchGroups}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <DataTable
          data={groupRows}
          columns={columns}
          title="Group - List"
          subtitle="View and manage employee groups."
          titleIcon={<FiList size={19} />}
          showTitle
          searchable
          searchPlaceholder="Search..."
          filterable
          filters={groupFilters}
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
          fileName="employee-groups"
          rowKey="id"
          loading={suppliedLoading ?? loading}
          emptyMessage="No groups found."
          className="organization-entity-table"
        />
      </div>

      <Alert
        isOpen={showDeletePopup}
        title="Delete Group"
        message="Are you sure you want to delete"
        itemName={selectedGroup?.rdhR0000XVIIIName || ""}
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (isDeleting) return;

          setShowDeletePopup(false);
          setSelectedGroup(null);
        }}
      />
    </>
  );
}