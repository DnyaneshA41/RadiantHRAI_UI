import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { LuListOrdered  } from "react-icons/lu";
import {
  EditIcon,
  DeleteIcon,
} from "../../../../common/components/Icons/Icons.jsx";

import Toast from "../../../../common/components/Popups/Toast";
import Alert from "../../../../common/components/Popups/Alert.jsx";
import DataTable from "../../../../common/components/DataTable/DataTable";
import axiosClientModule from "../../../../api/axiosClientModule";

const getAllGradesApi = async () => {
  const response = await axiosClientModule.get(
    "/Grade/GetAllGrade"
  );

  return response.data;
};

const deleteGradeApi = async (encryptedId) => {
  const response = await axiosClientModule.patch(
    `/Grade/DeleteGrade/${encodeURIComponent(encryptedId)}`
  );

  return response.data;
};

const mapGrade = (item) => ({
  ...item,

  id:
    item.rdhR0000XVIIID ??
    item.RDHR0000XVIIID ??
    item.rdhR0000XVIID ??
    item.RDHR0000XVIID ??
    item.id ??
    item.Id ??
    "",

  encryptedId:
    item.encryptedId ??
    item.EncryptedId ??
    item.encryptedID ??
    item.rdhR0000XVIIID_Encrypted ??
    item.RDHR0000XVIIID_Encrypted ??
    item.rdhR0000XVIID_Encrypted ??
    item.RDHR0000XVIID_Encrypted ??
    item.rdhR0000XVIIEncryptedId ??
    item.RDHR0000XVIIEncryptedId ??
    "",

  rdhR0000XVIIName:
    item.rdhR0000XVIIName ??
    item.RDHR0000XVIIName ??
    item.gradeName ??
    item.GradeName ??
    "",

  rdhR0000XVIIDescription:
    item.rdhR0000XVIIDescription ??
    item.RDHR0000XVIIDescription ??
    item.gradeDescription ??
    item.GradeDescription ??
    "",
});

const extractGrades = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.Data,
    response?.result,
    response?.Result,
    response?.grades,
    response?.Grades,
    response?.data?.data,
    response?.data?.Data,
    response?.data?.result,
    response?.data?.Result,
    response?.result?.data,
    response?.Result?.Data,
  ];

  return candidates.find(Array.isArray) || [];
};

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (data?.errors) {
    const messages = Object.values(data.errors).flat();

    if (messages.length) {
      return messages.join(" ");
    }
  }

  return (
    data?.detail ||
    data?.message ||
    data?.Message ||
    data?.title ||
    error?.message ||
    fallback
  );
};

export default function GradeList({
  grades: suppliedGrades,
  loading: suppliedLoading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const [gradeRows, setGradeRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = useCallback(
    (message, type = "info", duration = 3000) => {
      setToast({
        id: Date.now(),
        message,
        type,
        duration,
      });
    },
    []
  );

  const handleToastClose = useCallback(() => {
    setToast(null);
  }, []);

  const gradeFilters = useMemo(
    () => [
      {
        key: "rdhR0000XVIIName",
        label: "Grade Name",
        options: [
          ...new Set(
            gradeRows
              .map((grade) => grade.rdhR0000XVIIName)
              .filter(Boolean)
          ),
        ],
        placeholder: "All Grade Names",
      },
    ],
    [gradeRows]
  );

  const fetchGrades = useCallback(async () => {
    if (Array.isArray(suppliedGrades)) {
      setGradeRows(suppliedGrades.map(mapGrade));
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getAllGradesApi();
      const records = extractGrades(response);

      setGradeRows(records.map(mapGrade));
    } catch (err) {
      console.error(
        "Failed to fetch grades:",
        err.response?.data || err.message
      );

      setGradeRows([]);
      setError(
        getErrorMessage(err, "Unable to load grades.")
      );
    } finally {
      setLoading(false);
    }
  }, [suppliedGrades]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd();
      return;
    }

    navigate("/admin/coresettings/grade/add", {
      state: {
        mode: "add",
        grade: null,
        encryptedId: null,
      },
    });
  }, [navigate, onAdd]);

  const handleEdit = useCallback(
    (item) => {
      const encryptedId = item.encryptedId;

      if (!encryptedId) {
        showToast(
          "Encrypted Grade ID is missing. Please check the GetAllGrade response.",
          "error",
          5000
        );

        console.error(
          "Encrypted Grade ID is missing:",
          item
        );

        return;
      }

      if (onEdit) {
        onEdit({
          ...item,
          encryptedId,
        });

        return;
      }

      navigate("/admin/coresettings/grade/add", {
        state: {
          mode: "edit",
          isEdit: true,
          encryptedId,
          grade: {
            ...item,
            encryptedId,
            rdhR0000XVIIName: item.rdhR0000XVIIName,
            rdhR0000XVIIDescription:
              item.rdhR0000XVIIDescription,
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
          "Cannot delete this Grade because its encrypted ID is missing.",
          "error",
          5000
        );

        console.error(
          "Encrypted Grade ID is missing:",
          item
        );

        return;
      }

      setSelectedGrade(item);
      setShowDeletePopup(true);
    },
    [showToast]
  );

  const confirmDelete = useCallback(async () => {
    if (!selectedGrade || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      if (onDelete) {
        await onDelete(selectedGrade);
      } else {
        await deleteGradeApi(selectedGrade.encryptedId);
      }

      setShowDeletePopup(false);
      setSelectedGrade(null);

      showToast(
        "Grade deleted successfully.",
        "success"
      );

      await fetchGrades();
    } catch (err) {
      console.error(
        "Failed to delete grade:",
        err.response?.data || err.message
      );

      showToast(
        getErrorMessage(
          err,
          "Failed to delete Grade. Please try again."
        ),
        "error",
        5000
      );
    } finally {
      setIsDeleting(false);
    }
  }, [
    selectedGrade,
    isDeleting,
    onDelete,
    fetchGrades,
    showToast,
  ]);

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
            title={`Edit ${item.rdhR0000XVIIName}`}
            aria-label={`Edit ${item.rdhR0000XVIIName}`}
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
            title={`Delete ${item.rdhR0000XVIIName}`}
            aria-label={`Delete ${item.rdhR0000XVIIName}`}
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
        header: "Grade Name",
        key: "rdhR0000XVIIName",
        accessor: "rdhR0000XVIIName",
      },
      {
        header: "Grade Description",
        key: "rdhR0000XVIIDescription",
        accessor: "rdhR0000XVIIDescription",
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
              onClick={fetchGrades}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <DataTable
          data={gradeRows}
          columns={columns}
          title="Grade - List"
            subtitle="View and manage grades."
        titleIcon={<LuListOrdered size={19} />}
          showTitle
          searchable
          searchPlaceholder="Search Grades..."
          filterable
          filters={gradeFilters}
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
          fileName="grades"
          rowKey="id"
          loading={suppliedLoading ?? loading}
          emptyMessage="No grades found."
          className="organization-entity-table"
        />
      </div>

      <Alert
        isOpen={showDeletePopup}
        title="Delete Grade"
        message="Are you sure you want to delete"
        itemName={selectedGrade?.rdhR0000XVIIName || ""}
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (isDeleting) return;

          setShowDeletePopup(false);
          setSelectedGrade(null);
        }}
      />
    </>
  );
}