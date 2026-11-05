
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { FiLayers } from "react-icons/fi";

import {
  EditIcon,
  DeleteIcon,
} from "../../../../common/components/Icons/Icons.jsx";

import Toast from "../../../../common/components/Popups/Toast";
import Alert from "../../../../common/components/Popups/Alert.jsx";
import DataTable from "../../../../common/components/DataTable/DataTable";

import {
  getAllSubDepartmentsApi,
  deleteSubDepartmentApi,
  getDepartmentListApi,
} from "../../services/SubDepartmentApi.js";

// =====================================================
// EXTRACT ARRAY FROM API RESPONSE
// =====================================================

const extractArray = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.Data,
    response?.result,
    response?.Result,
    response?.subDepartments,
    response?.SubDepartments,
    response?.subDepartmentList,
    response?.SubDepartmentList,
    response?.departments,
    response?.Departments,
    response?.departmentList,
    response?.DepartmentList,
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
// GET DEPARTMENT ID
// =====================================================

const getDepartmentId = (item) =>
  item?.rdhR0000XIID ??
  item?.RDHR0000XIID ??
  item?.rdhR0000XIId ??
  item?.RDHR0000XIId ??
  item?.departmentId ??
  item?.DepartmentId ??
  item?.departmentID ??
  item?.DepartmentID ??
  item?.id ??
  item?.Id ??
  "";

// =====================================================
// GET DEPARTMENT NAME
// =====================================================

const getDepartmentName = (item) =>
  item?.rdhR0000XIName ??
  item?.RDHR0000XIName ??
  item?.rdhR0000XIIN ??
  item?.rdhR0000XIName1 ??
  item?.departmentName ??
  item?.DepartmentName ??
  item?.name ??
  item?.Name ??
  "";

// =====================================================
// MAP API SUBDEPARTMENT TO TABLE ROW
// =====================================================

const mapSubDepartment = (item) => {
  const departmentId =
    getDepartmentId(item) ||
    getDepartmentId(item?.department) ||
    getDepartmentId(item?.Department) ||
    "";

  const nestedDepartment =
    item?.department || item?.Department || {};

  const departmentName =
    getDepartmentName(item) ||
    getDepartmentName(nestedDepartment) ||
    item?.rdhR0000XIName ||
    "";

  return {
    ...item,

    id:
      item?.rdhR0000XVID ??
      item?.RDHR0000XVID ??
      item?.rdhR0000XVIID ??
      item?.RDHR0000XVIID ??
      item?.rdhR0000XVId ??
      item?.RDHR0000XVId ??
      item?.id ??
      item?.Id ??
      "",

    encryptedId:
      item?.rdhR0000XVID_Encrypted ??
      item?.RDHR0000XVID_Encrypted ??
      item?.rdhR0000XVEncryptedId ??
      item?.RDHR0000XVEncryptedId ??
      item?.encryptedId ??
      item?.EncryptedId ??
      item?.encryptedID ??
      "",

    subDepartmentName:
      item?.rdhR0000XVName ??
      item?.RDHR0000XVName ??
      item?.subDepartmentName ??
      item?.SubDepartmentName ??
      "",

    departmentId,
    departmentName,
  };
};

// =====================================================
// GET ERROR MESSAGE
// =====================================================

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;

  if (data?.errors) {
    const messages = Object.values(data.errors).flat();

    if (messages.length) return messages.join(" ");
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

// =====================================================
// SUBDEPARTMENT LIST
// =====================================================

export default function SubDepartmentList({
  subDepartments: suppliedSubDepartments,
  loading: suppliedLoading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const [subDepartmentRows, setSubDepartmentRows] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [showDeletePopup, setShowDeletePopup] =
    useState(false);

  const [selectedSubDepartment, setSelectedSubDepartment] =
    useState(null);

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
  // FETCH SUBDEPARTMENTS AND DEPARTMENTS
  // ===================================================

  const fetchSubDepartments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [subDepartmentResponse, departmentResponse] =
        await Promise.all([
          Array.isArray(suppliedSubDepartments)
            ? Promise.resolve(suppliedSubDepartments)
            : getAllSubDepartmentsApi(),

          getDepartmentListApi(),
        ]);

      const subDepartmentRecords = Array.isArray(
        subDepartmentResponse
      )
        ? subDepartmentResponse
        : extractArray(subDepartmentResponse);

      const departmentRecords =
        extractArray(departmentResponse);

      // Build a lookup: department ID -> department name.
      const departmentMap = new Map();

      departmentRecords.forEach((department) => {
        const id = getDepartmentId(department);
        const name = getDepartmentName(department);

        if (
          id !== "" &&
          id !== null &&
          id !== undefined &&
          String(name).trim() !== ""
        ) {
          departmentMap.set(
            String(id).trim(),
            String(name).trim()
          );
        }
      });

      // Resolve each subdepartment's parent department.
      const mappedRows = subDepartmentRecords.map(
        (item) => {
          const row = mapSubDepartment(item);

          const departmentId = String(
            row.departmentId ?? ""
          ).trim();

          const nestedDepartment =
            item?.department ||
            item?.Department ||
            {};

          const departmentName =
            row.departmentName ||
            departmentMap.get(departmentId) ||
            getDepartmentName(nestedDepartment) ||
            "";

          return {
            ...row,
            departmentName,
          };
        }
      );

      console.log(
        "Subdepartment API response:",
        subDepartmentResponse
      );

      console.log(
        "Department lookup:",
        Array.from(departmentMap.entries())
      );

      console.log(
        "Mapped subdepartment rows:",
        mappedRows
      );

      setSubDepartmentRows(mappedRows);
    } catch (err) {
      console.error(
        "Failed to fetch subdepartments or departments:",
        err?.response?.data || err?.message
      );

      setSubDepartmentRows([]);

      setError(
        getErrorMessage(
          err,
          "Unable to load subdepartments."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [suppliedSubDepartments]);

  useEffect(() => {
    fetchSubDepartments();
  }, [fetchSubDepartments]);

  // ===================================================
  // FILTERS
  // ===================================================

  const subDepartmentFilters = useMemo(
    () => [
      {
        key: "subDepartmentName",
        label: "Subdepartment Name",
        options: [
          ...new Set(
            subDepartmentRows
              .map((item) => item.subDepartmentName)
              .filter(Boolean)
          ),
        ],
        placeholder: "All Subdepartments",
      },
      {
        key: "departmentName",
        label: "Department",
        options: [
          ...new Set(
            subDepartmentRows
              .map((item) => item.departmentName)
              .filter(Boolean)
          ),
        ],
        placeholder: "All Departments",
      },
    ],
    [subDepartmentRows]
  );

  // ===================================================
  // ADD SUBDEPARTMENT
  // ===================================================

  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd();
      return;
    }

    navigate("/admin/coresettings/subdepartment/add", {
      state: {
        mode: "add",
        subDepartment: null,
        encryptedId: null,
      },
    });
  }, [navigate, onAdd]);

  // ===================================================
  // EDIT SUBDEPARTMENT
  // ===================================================

  const handleEdit = useCallback(
    (item) => {
      if (!item.encryptedId) {
        showToast(
          "Encrypted Subdepartment ID is missing.",
          "error",
          4000
        );

        console.error(
          "Encrypted Subdepartment ID is missing:",
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

      navigate("/admin/coresettings/subdepartment/add", {
        state: {
          mode: "edit",
          isEdit: true,
          encryptedId: item.encryptedId,

          subDepartment: {
            ...item,

            rdhR0000XVName:
              item.rdhR0000XVName ||
              item.subDepartmentName ||
              "",

            rdhR0000XIId:
              item.rdhR0000XIId ??
              item.rdhR0000XIID ??
              item.departmentId ??
              "",
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
          "Cannot delete this subdepartment because its encrypted ID is missing.",
          "error",
          4000
        );

        console.error(
          "Encrypted Subdepartment ID is missing:",
          item
        );

        return;
      }

      setSelectedSubDepartment(item);
      setShowDeletePopup(true);
    },
    [showToast]
  );

  // ===================================================
  // CONFIRM DELETE
  // ===================================================

  const confirmDelete = useCallback(async () => {
    if (!selectedSubDepartment || isDeleting) return;

    setIsDeleting(true);

    try {
      if (onDelete) {
        await onDelete(selectedSubDepartment);
      } else {
        await deleteSubDepartmentApi(
          selectedSubDepartment.encryptedId
        );
      }

      setShowDeletePopup(false);
      setSelectedSubDepartment(null);

      showToast(
        "Sub-Department deleted successfully.",
        "success"
      );

      await fetchSubDepartments();
    } catch (err) {
      console.error(
        "Failed to delete subdepartment:",
        err?.response?.data || err?.message
      );

      showToast(
        getErrorMessage(
          err,
          "Failed to delete subdepartment. Please try again."
        ),
        "error",
        4000
      );
    } finally {
      setIsDeleting(false);
    }
  }, [
    selectedSubDepartment,
    isDeleting,
    onDelete,
    fetchSubDepartments,
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
            title={`Edit ${item.subDepartmentName}`}
            aria-label={`Edit ${item.subDepartmentName}`}
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
            title={`Delete ${item.subDepartmentName}`}
            aria-label={`Delete ${item.subDepartmentName}`}
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
        header: "Subdepartment",
        key: "subDepartmentName",
        accessor: "subDepartmentName",
      },

      {
        header: "Department",
        key: "departmentName",
        accessor: "departmentName",
        render: (_, item) =>
          item.departmentName || "—",
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
              onClick={fetchSubDepartments}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <DataTable
          data={subDepartmentRows}
          columns={columns}
          title="Sub-Department - List"
          subtitle="View and manage sub departments."
          titleIcon={<FiLayers size={19} />}
          showTitle
          searchable
          searchPlaceholder="Search..."
          filterable
          filters={subDepartmentFilters}
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
          fileName="subdepartments"
          rowKey="id"
          loading={suppliedLoading ?? loading}
          emptyMessage="No subdepartments found."
          className="organization-entity-table"
        />
      </div>

      <Alert
        isOpen={showDeletePopup}
        title="Delete Subdepartment"
        message="Are you sure you want to delete"
        itemName={
          selectedSubDepartment?.subDepartmentName || ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (isDeleting) return;

          setShowDeletePopup(false);
          setSelectedSubDepartment(null);
        }}
      />
    </>
  );
}
