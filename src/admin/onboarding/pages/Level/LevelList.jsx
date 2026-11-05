// LevelList.jsx

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
  getAllLevels,
  deleteLevel,
} from "../../services/LevelApi.js";

import {
  mapLevel,
  extractLevels,
  getApiErrorMessage,
} from "../../mappers/LevelMapper.js";

export default function LevelList({
  levels: suppliedLevels,
  loading: suppliedLoading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const [levelRows, setLevelRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = useCallback(
    (message, type = "info", duration = 3000) => {
      setToast({ id: Date.now(), message, type, duration });
    },
    []
  );

  const handleToastClose = useCallback(() => setToast(null), []);

  const fetchLevels = useCallback(async () => {
    if (Array.isArray(suppliedLevels)) {
      setLevelRows(suppliedLevels.map(mapLevel));
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getAllLevels();

      setLevelRows(extractLevels(response).map(mapLevel));
    } catch (err) {
      console.error(
        "Failed to fetch levels:",
        err.response?.data || err.message
      );

      setLevelRows([]);

      setError(
        getApiErrorMessage(err, "Unable to load levels.")
      );
    } finally {
      setLoading(false);
    }
  }, [suppliedLevels]);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd();
      return;
    }

    navigate("/admin/onboarding/level/add", {
      state: {
        mode: "add",
        isEdit: false,
        encryptedId: null,
        level: null,
      },
    });
  }, [onAdd, navigate]);

  const handleEdit = useCallback(
    (item) => {
      if (!item.encryptedId) {
        showToast(
          "Encrypted Level ID is missing. Please check the GetAllLevel response.",
          "error",
          5000
        );

        console.error("Encrypted Level ID is missing:", item);
        return;
      }

      if (onEdit) {
        onEdit({
          ...item,
          encryptedId: item.encryptedId,
        });

        return;
      }

      navigate("/admin/onboarding/level/add", {
        state: {
          mode: "edit",
          isEdit: true,
          encryptedId: item.encryptedId,
          level: {
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
          "Cannot delete this Level because its encrypted ID is missing.",
          "error",
          5000
        );

        console.error("Encrypted Level ID is missing:", item);
        return;
      }

      setSelectedLevel(item);
      setShowDeletePopup(true);
    },
    [showToast]
  );

  const confirmDelete = useCallback(async () => {
    if (!selectedLevel || isDeleting) return;

    setIsDeleting(true);

    try {
      const response = onDelete
        ? await onDelete(selectedLevel)
        : await deleteLevel(selectedLevel.encryptedId);

      setShowDeletePopup(false);
      setSelectedLevel(null);

      showToast(
        response?.message ||
          response?.Message ||
          "Level deleted successfully.",
        "success"
      );

      await fetchLevels();
    } catch (err) {
      console.error(
        "Failed to delete Level:",
        err.response?.data || err.message
      );

      showToast(
        getApiErrorMessage(
          err,
          "Failed to delete Level. Please try again."
        ),
        "error",
        5000
      );
    } finally {
      setIsDeleting(false);
    }
  }, [
    selectedLevel,
    isDeleting,
    onDelete,
    fetchLevels,
    showToast,
  ]);

  const levelFilters = useMemo(
    () => [
      {
        key: "rdhR0000XVIName",
        label: "Level Name",
        options: [
          ...new Set(
            levelRows
              .map((item) => item.rdhR0000XVIName)
              .filter(Boolean)
          ),
        ],
        placeholder: "All Levels",
      },
    ],
    [levelRows]
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
            title={`Edit ${item.rdhR0000XVIName}`}
            aria-label={`Edit ${item.rdhR0000XVIName}`}
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
            title={`Delete ${item.rdhR0000XVIName}`}
            aria-label={`Delete ${item.rdhR0000XVIName}`}
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
        header: "Level Name",
        key: "rdhR0000XVIName",
        accessor: "rdhR0000XVIName",
      },
      {
        header: "Description",
        key: "description",
        accessor: "description",
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
              onClick={fetchLevels}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <DataTable
          data={levelRows}
          columns={columns}
          title="Level - List"
          subtitle="View and manage levels."
          titleIcon={<FiList size={19} />}
          showTitle
          searchable
          searchPlaceholder="Search..."
          filterable
          filters={levelFilters}
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
          fileName="levels"
          rowKey="id"
          loading={suppliedLoading ?? loading}
          emptyMessage="No levels found."
          className="organization-entity-table"
        />
      </div>

      <Alert
        isOpen={showDeletePopup}
        title="Delete Level"
        message="Are you sure you want to delete"
        itemName={selectedLevel?.rdhR0000XVIName || ""}
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (isDeleting) return;

          setShowDeletePopup(false);
          setSelectedLevel(null);
        }}
      />
    </>
  );
}