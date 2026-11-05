
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

import { FiAward  } from "react-icons/fi";
import { size } from "zod";
// =====================================================
// API FUNCTIONS
// =====================================================

const getAllDesignationsApi = async () => {
  const response = await axiosClientModule.get(
    "/Designation/GetAllDesignation"
  );

  return response.data;
};

const updateDesignationApi = async (encryptedId, dto) => {
  if (!encryptedId) {
    throw new Error("Encrypted Designation ID is missing.");
  }

  const response = await axiosClientModule.patch(
    `/Designation/UpdateDesignation/${encodeURIComponent(encryptedId)}`,
    {
      encryptedId,
      dto,
    }
  );

  return response.data;
};

const deleteDesignationApi = async (encryptedId) => {
  if (!encryptedId) {
    throw new Error("Encrypted Designation ID is missing.");
  }

  const response = await axiosClientModule.patch(
    `/Designation/DeleteDesignation/${encodeURIComponent(encryptedId)}`
  );

  return response.data;
};

// =====================================================
// NORMALIZE RESPONSE
// =====================================================

const firstValue = (item, keys, fallback = "") => {
  for (const key of keys) {
    if (
      item?.[key] !== undefined &&
      item?.[key] !== null &&
      item?.[key] !== ""
    ) {
      return item[key];
    }
  }

  return fallback;
};

const mapDesignation = (item) => ({
  ...item,

  id: firstValue(item, [
    "rdhR0000XIIID",
    "RDHR0000XIIID",
    "rdhR0000XIIId",
    "RDHR0000XIIId",
    "id",
    "Id",
  ]),

  encryptedId: firstValue(item, [
    "encryptedId",
    "EncryptedId",
    "encryptedID",
    "EncryptedID",
    "rdhR0000XIIID_Encrypted",
    "RDHR0000XIIID_Encrypted",
    "rdhR0000XIIEncryptedId",
    "RDHR0000XIIEncryptedId",
  ]),

  designationName: firstValue(item, [
    "rdhR0000XIIName",
    "RDHR0000XIIName",
    "designationName",
    "DesignationName",
  ]),
});

const extractDesignations = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.Data,
    response?.result,
    response?.Result,
    response?.designations,
    response?.Designations,
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

  if (typeof data === "string") return data;

  if (data?.errors) {
    const messages = Object.values(data.errors).flat();

    if (messages.length) {
      return messages.join(" ");
    }
  }

  return (
    data?.message ||
    data?.Message ||
    data?.detail ||
    data?.title ||
    error?.message ||
    fallback
  );
};

// =====================================================
// DESIGNATION LIST
// =====================================================

export default function DesignationList({
  designations: suppliedDesignations,
  loading: suppliedLoading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const [designationRows, setDesignationRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

   const DesignationFilters = useMemo(
      () => [
  
         {
          key: "designationName",
          label: "Designation Name",
          options: [
            ...new Set(
              designationRows
                .map((org) => org.designationName)
                .filter(Boolean)
            ),
          ],
          placeholder: "All Designation Names",
        },
  
       
       
      ],
      [designationRows]
    );

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
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

  // ===================================================
  // FETCH DESIGNATIONS
  // ===================================================

  const fetchDesignations = useCallback(async () => {
    if (Array.isArray(suppliedDesignations)) {
      setDesignationRows(suppliedDesignations.map(mapDesignation));
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getAllDesignationsApi();
      const records = extractDesignations(response);

      setDesignationRows(records.map(mapDesignation));
    } catch (err) {
      console.error("Failed to fetch designations:", err);

      setDesignationRows([]);
      setError(
        getErrorMessage(err, "Unable to load designations.")
      );
    } finally {
      setLoading(false);
    }
  }, [suppliedDesignations]);

  useEffect(() => {
    fetchDesignations();
  }, [fetchDesignations]);

  // ===================================================
  // ADD
  // ===================================================

  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd();
      return;
    }

    navigate("/admin/coresettings/designation/add", {
      state: {
        mode: "add",
        isEdit: false,
        designation: null,
        encryptedId: null,
      },
    });
  }, [navigate, onAdd]);

  // ===================================================
  // EDIT
  // ===================================================

  const handleEdit = useCallback(
    (row) => {
      const encryptedId = row.encryptedId;

      if (!encryptedId) {
        console.error("Missing encrypted ID:", row);

        showToast(
          "Encrypted Designation ID is missing. Check the GET API response.",
          "error",
          4000
        );
        return;
      }

      // Keep the complete original API record, including
      // eligibility fields and the encrypted ID.
      const designation = {
        ...row,
        encryptedId,
        rdhR0000XIIName:
          row.rdhR0000XIIName ??
          row.RDHR0000XIIName ??
          row.designationName ??
          row.DesignationName ??
          "",
      };

      if (onEdit) {
        onEdit(designation);
        return;
      }

      navigate("/admin/coresettings/designation/add", {
        state: {
          mode: "edit",
          isEdit: true,
          encryptedId,
          designation,
        },
      });
    },
    [navigate, onEdit, showToast]
  );

  // ===================================================
  // DELETE
  // ===================================================

  const handleDelete = useCallback(
    (row) => {
      if (!row.encryptedId) {
        showToast(
          "Encrypted Designation ID is missing.",
          "error",
          4000
        );
        return;
      }

      setSelectedDesignation(row);
      setShowDeletePopup(true);
    },
    [showToast]
  );

  const confirmDelete = useCallback(async () => {
    if (!selectedDesignation || isDeleting) return;

    setIsDeleting(true);

    try {
      if (onDelete) {
        await onDelete(selectedDesignation);
      } else {
        await deleteDesignationApi(
          selectedDesignation.encryptedId
        );
      }

      setShowDeletePopup(false);
      setSelectedDesignation(null);

      showToast("Designation deleted successfully.", "success");

      await fetchDesignations();
    } catch (err) {
      console.error("Failed to delete designation:", err);

      showToast(
        getErrorMessage(
          err,
          "Failed to delete Designation. Please try again."
        ),
        "error",
        4000
      );
    } finally {
      setIsDeleting(false);
    }
  }, [
    selectedDesignation,
    isDeleting,
    onDelete,
    fetchDesignations,
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
        render: (_, row) => (
          <button
            type="button"
            className="icon-btn"
            title={`Edit ${row.designationName}`}
            aria-label={`Edit ${row.designationName}`}
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
        width: "100px",
        sortable: false,
        searchable: false,
        exportable: false,
        render: (_, row) => (
          <button
            type="button"
            className="delete-icon"
            title={`Delete ${row.designationName}`}
            aria-label={`Delete ${row.designationName}`}
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
        header: "Designation Name",
        key: "designationName",
        accessor: "designationName",
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
              onClick={fetchDesignations}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <DataTable
          data={designationRows}
          columns={columns}
          title="Designation - List"
          subtitle="View and manage designations"
          titleIcon={<FiAward size={19} />}
          showTitle
          searchable
          searchPlaceholder="Search..."
          filterable={true}
          filters={DesignationFilters}
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
          fileName="designations"
          rowKey="id"
          loading={suppliedLoading ?? loading}
          emptyMessage="No designations found."
          className="organization-entity-table"
        />
      </div>

      <Alert
        isOpen={showDeletePopup}
        title="Delete Designation"
        message="Are you sure you want to delete"
        itemName={selectedDesignation?.designationName || ""}
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (isDeleting) return;

          setShowDeletePopup(false);
          setSelectedDesignation(null);
        }}
      />
    </>
  );
}

export {
  getAllDesignationsApi,
  updateDesignationApi,
  deleteDesignationApi,
};
