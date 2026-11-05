
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  EditIcon,
  DeleteIcon,
} from "../../../../common/components/Icons/Icons.jsx";

import Toast from "../../../../common/components/Popups/Toast";
import Alert from "../../../../common/components/Popups/Alert.jsx";
import DataTable from "../../../../common/components/DataTable/DataTable";
import axiosClientModule from "../../../../api/axiosClientModule";

import { FiLayers } from "react-icons/fi";
const getAllDepartmentsApi = async () => {
  const response = await axiosClientModule.get(
    "/Department/GetAllDepartment"
  );

  return response.data;
};

// UPDATE DEPARTMENT
// PATCH /api/Department/UpdateDepartment/{EncryptedId}
const updateDepartmentApi = async (encryptedId, payload) => {
  const response = await axiosClientModule.patch(
    `/Department/UpdateDepartment/${encodeURIComponent(
      encryptedId
    )}`,
    payload
  );

  return response.data;
};

// DELETE DEPARTMENT
// PATCH /api/Department/DeleteDepartment/{EncryptedId}
const deleteDepartmentApi = async (encryptedId) => {
  const response = await axiosClientModule.patch(
    `/Department/DeleteDepartment/${encodeURIComponent(
      encryptedId
    )}`
  );

  return response.data;
};

// =====================================================
// MAP API DEPARTMENT TO TABLE ROW
// =====================================================

const mapDepartment = (item) => ({
  ...item,

  id:
    item.rdhR0000XIID ??
    item.RDHR0000XIID ??
    item.rdhR0000XIId ??
    item.RDHR0000XIId ??
    item.id ??
    "",

  encryptedId:
    item.rdhR0000XIID_Encrypted ??
    item.RDHR0000XIID_Encrypted ??
    item.rdhR0000XIEncryptedId ??
    item.RDHR0000XIEncryptedId ??
    item.encryptedId ??
    item.EncryptedId ??
    item.encryptedID ??
    "",

  departmentName:
    item.rdhR0000XIName ??
    item.RDHR0000XIName ??
    item.departmentName ??
    item.DepartmentName ??
    "",
});

// =====================================================
// EXTRACT DEPARTMENT ARRAY
// =====================================================

const extractDepartments = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.Data,
    response?.result,
    response?.Result,
    response?.departments,
    response?.Departments,
    response?.data?.data,
    response?.data?.Data,
    response?.data?.result,
    response?.data?.Result,
    response?.result?.data,
    response?.Result?.Data,
  ];

  return candidates.find(Array.isArray) || [];
};

// =====================================================
// GET ERROR MESSAGE
// =====================================================

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
    data?.message ||
    data?.Message ||
    data?.title ||
    fallback
  );
};

// =====================================================
// DEPARTMENT LIST
// =====================================================

export default function DepartmentList({
  departments: suppliedDepartments,
  loading: suppliedLoading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const [departmentRows, setDepartmentRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 const DepartmentFilters = useMemo(
    () => [

       {
        key: "departmentName",
        label: "Department Name",
        options: [
          ...new Set(
            departmentRows
              .map((org) => org.departmentName)
              .filter(Boolean)
          ),
        ],
        placeholder: "All Department Names",
      },

     
     
    ],
    [departmentRows]
  );

  const [toast, setToast] = useState(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ===================================================
  // TOAST HELPERS
  // ===================================================

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

  // ===================================================
  // FETCH DEPARTMENTS
  // ===================================================

  const fetchDepartments = useCallback(async () => {
    if (Array.isArray(suppliedDepartments)) {
      setDepartmentRows(suppliedDepartments.map(mapDepartment));
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getAllDepartmentsApi();
      const records = extractDepartments(response);

      setDepartmentRows(records.map(mapDepartment));
    } catch (err) {
      console.error(
        "Failed to fetch departments:",
        err.response?.data || err.message
      );

      setDepartmentRows([]);

      setError(
        getErrorMessage(err, "Unable to load departments.")
      );
    } finally {
      setLoading(false);
    }
  }, [suppliedDepartments]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // ===================================================
  // ADD DEPARTMENT
  // ===================================================

  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd();
      return;
    }

    navigate("/admin/coresettings/department/add", {
      state: {
        mode: "add",
        department: null,
        encryptedId: null,
      },
    });
  }, [navigate, onAdd]);

  // ===================================================
  // EDIT DEPARTMENT
  // ===================================================

  const handleEdit = useCallback(
    (item) => {
      const encryptedId = item.encryptedId;

      if (!encryptedId) {
        showToast(
          "Encrypted Department ID is missing.",
          "error",
          4000
        );

        console.error(
          "Encrypted Department ID is missing:",
          item
        );

        return;
      }

      // Preserve the callback behavior if the parent manages editing.
      if (onEdit) {
        onEdit({
          ...item,
          encryptedId,
        });

        return;
      }

      // Navigate to the same form used for adding a department.
      // The form reads this state and populates its input.
      navigate("/admin/coresettings/department/add", {
        state: {
          mode: "edit",
          isEdit: true,
          encryptedId,
          department: {
            ...item,
            rdhR0000XIName: item.rdhR0000XIName || item.departmentName || "",
            departmentName: item.departmentName || "",
          },
        },
      });
    },
    [navigate, onEdit, showToast]
  );

  // ===================================================
  // OPEN DELETE CONFIRMATION
  // ===================================================

  const handleDelete = useCallback(
    (item) => {
      if (!item.encryptedId) {
        showToast(
          "Cannot delete this Department because its encrypted ID is missing.",
          "error",
          4000
        );

        console.error(
          "Encrypted Department ID is missing:",
          item
        );

        return;
      }

      setSelectedDepartment(item);
      setShowDeletePopup(true);
    },
    [showToast]
  );

  // ===================================================
  // CONFIRM DELETE
  // ===================================================

  const confirmDelete = useCallback(async () => {
    if (!selectedDepartment || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      if (onDelete) {
        await onDelete(selectedDepartment);
      } else {
        await deleteDepartmentApi(
          selectedDepartment.encryptedId
        );
      }

      setShowDeletePopup(false);
      setSelectedDepartment(null);

      showToast(
        "Department deleted successfully.",
        "success"
      );

      await fetchDepartments();
    } catch (err) {
      console.error(
        "Failed to delete department:",
        err.response?.data || err.message
      );

      showToast(
        getErrorMessage(
          err,
          "Failed to delete Department. Please try again."
        ),
        "error",
        4000
      );
    } finally {
      setIsDeleting(false);
    }
  }, [
    selectedDepartment,
    isDeleting,
    onDelete,
    fetchDepartments,
    showToast,
  ]);

  // ===================================================
  // TABLE COLUMNS
  // ===================================================

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
            title={`Edit ${item.departmentName}`}
            aria-label={`Edit ${item.departmentName}`}
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
            title={`Delete ${item.departmentName}`}
            aria-label={`Delete ${item.departmentName}`}
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
        header: "Department",
        key: "departmentName",
        accessor: "departmentName",
      },
    ],
    [handleEdit, handleDelete]
  );

  // ===================================================
  // RENDER
  // ===================================================

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
              onClick={fetchDepartments}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <DataTable
          data={departmentRows}
          columns={columns}
          title="Department - List"
            subtitle="View and manage departments."
        titleIcon={<FiLayers size={19} />}
          showTitle
          searchable
          searchPlaceholder="Search..."
          filterable={true}
          filters={DepartmentFilters}
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
          fileName="departments"
          rowKey="id"
          loading={suppliedLoading ?? loading}
          emptyMessage="No departments found."
          className="organization-entity-table"
        />
      </div>

      {/* DELETE CONFIRMATION POPUP */}

      <Alert
        isOpen={showDeletePopup}
        title="Delete Department"
        message="Are you sure you want to delete"
        itemName={selectedDepartment?.departmentName || ""}
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (isDeleting) return;

          setShowDeletePopup(false);
          setSelectedDepartment(null);
        }}
      />
    </>
  );
}

export { updateDepartmentApi };
