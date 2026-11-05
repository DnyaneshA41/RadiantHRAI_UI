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
  getAllQualifications,
  deleteQualification,
  getQualificationCategoryList,
} from "../../services/QualificationApi.js";

import {
  mapQualification,
  extractQualifications,
  getApiErrorMessage,
} from "../../mappers/QualificationMapper.js";

export default function QualificationList({
  qualifications: suppliedQualifications,
  loading: suppliedLoading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const [qualificationRows, setQualificationRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedQualification, setSelectedQualification] =
    useState(null);
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

  // Load qualification categories for displaying category names.
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);

    try {
      const response = await getQualificationCategoryList();

      const categoryList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.Data)
            ? response.Data
            : [];

      setCategories(
        categoryList
          .filter(
            (item) =>
              item?.RDHR0000XXVID !== null &&
              item?.RDHR0000XXVID !== undefined
          )
          .map((item) => ({
            id: String(item.RDHR0000XXVID),
            name: item.RDHR0000XXVName || "",
          }))
      );
    } catch (err) {
      console.error(
        "Failed to fetch qualification categories:",
        err.response?.data || err.message
      );

      setCategories([]);

      showToast(
        getApiErrorMessage(
          err,
          "Unable to load qualification categories."
        ),
        "error",
        5000
      );
    } finally {
      setCategoriesLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch qualification records.
  const fetchQualifications = useCallback(async () => {
    if (Array.isArray(suppliedQualifications)) {
      setQualificationRows(
        suppliedQualifications.map(mapQualification)
      );
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getAllQualifications();

      setQualificationRows(
        extractQualifications(response).map(mapQualification)
      );
    } catch (err) {
      console.error(
        "Failed to fetch qualifications:",
        err.response?.data || err.message
      );

      setQualificationRows([]);

      setError(
        getApiErrorMessage(
          err,
          "Unable to load qualifications."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [suppliedQualifications]);

  useEffect(() => {
    fetchQualifications();
  }, [fetchQualifications]);

  // Map category IDs to category names without changing the original IDs.
  const categoryMap = useMemo(() => {
    return new Map(
      categories.map((category) => [
        category.id,
        category.name,
      ])
    );
  }, [categories]);

  const displayRows = useMemo(() => {
    return qualificationRows.map((item) => {
      const categoryId = String(
        item.rdhR0000XXVID ?? ""
      );

      return {
        ...item,
        categoryName:
          categoryMap.get(categoryId) ||
          item.categoryName ||
          "—",
      };
    });
  }, [qualificationRows, categoryMap]);

  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd();
      return;
    }

    navigate("/admin/onboarding/qualification/add", {
      state: {
        mode: "add",
        isEdit: false,
        encryptedId: null,
        qualification: null,
      },
    });
  }, [onAdd, navigate]);

  const handleEdit = useCallback(
    (item) => {
      if (!item.encryptedId) {
        showToast(
          "Encrypted Qualification ID is missing. Please check the GetQualification response.",
          "error",
          5000
        );

        console.error(
          "Encrypted Qualification ID is missing:",
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

      navigate("/admin/onboarding/qualification/add", {
        state: {
          mode: "edit",
          isEdit: true,
          encryptedId: item.encryptedId,
          qualification: {
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
          "Cannot delete this Qualification because its encrypted ID is missing.",
          "error",
          5000
        );

        console.error(
          "Encrypted Qualification ID is missing:",
          item
        );

        return;
      }

      setSelectedQualification(item);
      setShowDeletePopup(true);
    },
    [showToast]
  );

  const confirmDelete = useCallback(async () => {
    if (!selectedQualification || isDeleting) return;

    setIsDeleting(true);

    try {
      const response = onDelete
        ? await onDelete(selectedQualification)
        : await deleteQualification(
            selectedQualification.encryptedId
          );

      setShowDeletePopup(false);
      setSelectedQualification(null);

      showToast(
        response?.message ||
          response?.Message ||
          response?.data?.message ||
          response?.data?.Message ||
          "Qualification deleted successfully.",
        "success"
      );

      await fetchQualifications();
    } catch (err) {
      console.error(
        "Failed to delete Qualification:",
        err.response?.data || err.message
      );

      showToast(
        getApiErrorMessage(
          err,
          "Failed to delete Qualification. Please try again."
        ),
        "error",
        5000
      );
    } finally {
      setIsDeleting(false);
    }
  }, [
    selectedQualification,
    isDeleting,
    onDelete,
    fetchQualifications,
    showToast,
  ]);

  const qualificationFilters = useMemo(
    () => [
      {
        key: "rdhR0000XXVIName",
        label: "Qualification Name",
        options: [
          ...new Set(
            displayRows
              .map((item) => item.rdhR0000XXVIName)
              .filter(Boolean)
          ),
        ],
        placeholder: "All Qualifications",
      },
      {
        key: "categoryName",
        label: "Category",
        options: [
          ...new Set(
            displayRows
              .map((item) => item.categoryName)
              .filter((name) => name && name !== "—")
          ),
        ],
        placeholder: "All Categories",
      },
    ],
    [displayRows]
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
            title={`Edit ${item.rdhR0000XXVIName}`}
            aria-label={`Edit ${item.rdhR0000XXVIName}`}
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
            title={`Delete ${item.rdhR0000XXVIName}`}
            aria-label={`Delete ${item.rdhR0000XXVIName}`}
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
        header: "Qualification Name",
        key: "rdhR0000XXVIName",
        accessor: "rdhR0000XXVIName",
      },
      {
        header: "Category",
        key: "categoryName",
        accessor: "categoryName",
        render: (_, item) => item.categoryName || "—",
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
              onClick={fetchQualifications}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <DataTable
          data={displayRows}
          columns={columns}
          title="Qualification - List"
          subtitle="View and manage qualifications."
          titleIcon={<FiList size={19} />}
          showTitle
          searchable
          searchPlaceholder="Search..."
          filterable
          filters={qualificationFilters}
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
          fileName="qualifications"
          rowKey="id"
          loading={
            (suppliedLoading ?? loading) ||
            categoriesLoading
          }
          emptyMessage="No qualifications found."
          className="organization-entity-table"
        />
      </div>

      <Alert
        isOpen={showDeletePopup}
        title="Delete Qualification"
        message="Are you sure you want to delete"
        itemName={
          selectedQualification?.rdhR0000XXVIName || ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (isDeleting) return;

          setShowDeletePopup(false);
          setSelectedQualification(null);
        }}
      />
    </>
  );
}
