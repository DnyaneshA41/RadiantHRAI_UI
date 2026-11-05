
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
import Alert from "../../../../common/components/Popups/Alert.jsx"
import DataTable from "../../../../common/components/DataTable/DataTable";
import axiosClientModule from "../../../../api/axiosClientModule";
import { LuBuilding } from "react-icons/lu";

import {
  deleteSubEntityApi,
} from "../../services/SubEntityApi";

// =====================================================
// MAP API SUB ENTITY TO TABLE ROW
// =====================================================


const mapSubEntity = (item) => ({
  ...item,

  id:
    item.rdhR0000IIIID ??
    item.RDHR0000IIIID ??
    item.RDHR0000IIIId ??
    item.subEntityId ??
    item.id ??
    "",

  encryptedId:
    item.rdhR0000IIIID_Encrypted ??
    item.RDHR0000IIIID_Encrypted ??
    item.encryptedId ??
    item.EncryptedId ??
    "",

  organizationId:
    item.rdhR0000IID ??
    item.RDHR0000IID ??
    item.organizationId ??
    item.OrganizationId ??
    "",

  organizationName:
    item.rdhR0000IName ??
    item.RDHR0000IName ??
    item.RDHR0000IIName ??
    item.organizationName ??
    item.OrganizationName ??
    item.organisationName ??
    item.OrganisationName ??
    item.orgName ??
    item.OrgName ??
    item.organization?.name ??
    item.Organization?.Name ??
    item.organisation?.name ??
    "",

  entityId:
    item.rdhR0000IIID ??
    item.RDHR0000IIID ??
    item.entityId ??
    item.EntityId ??
    "",

  entityName:
    item.rdhR0000IIName ??
    item.RDHR0000IIName ??
    item.entityName ??
    item.EntityName ??
    item.industryName ??
    item.IndustryName ??
    item.entity?.name ??
    item.Entity?.Name ??
    "",

  subEntityName:
    item.rdhR0000IIIName ??
    item.RDHR0000IIIName ??
    item.subEntityName ??
    item.SubEntityName ??
    "",

  isDefault:
    item.isDefault ??
    item.IsDefault ??
    false,
});


// =====================================================
// EXTRACT SUB ENTITY ARRAY
// =====================================================

const extractSubEntities = (response) => {
  const body = response?.data;

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.Data)) return body.Data;
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body?.Result)) return body.Result;
  if (Array.isArray(body?.subEntities)) return body.subEntities;
  if (Array.isArray(body?.SubEntities)) return body.SubEntities;

  return [];
};

// =====================================================
// GET ERROR MESSAGE
// =====================================================

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;

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
    data?.title ||
    fallback
  );
};

// =====================================================
// SUB ENTITY LIST
// =====================================================

export default function SubEntityList({
  subEntities: suppliedSubEntities,
  loading: suppliedLoading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const [subEntityRows, setSubEntityRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const SubEntityFilters = useMemo(
      () => [
  
         {
          key: "organizationName",
          label: "Organization Name",
          options: [
            ...new Set(
              subEntityRows
                .map((org) => org.organizationName)
                .filter(Boolean)
            ),
          ],
          placeholder: "All Organization Names",
        },
  
        {
          key: "entityName",
          label: "Entity",
          options: [
            ...new Set(
              subEntityRows
                .map((entity) => entity.entityName)
                .filter(Boolean)
            ),
          ],
          placeholder: "All Entities",
        },
        {
          key: "subEntityName",
          label: "Sub Entity",
          options: [
            ...new Set(
              subEntityRows
                .map((entity) => entity.subEntityName)
                .filter(Boolean)
            ),
          ],
          placeholder: "All Sub Entities",
        },
       
      ],
      [subEntityRows]
    );

  const [toast, setToast] = useState(null);
const [showDeletePopup, setShowDeletePopup] = useState(false);
const [selectedSubEntity, setSelectedSubEntity] = useState(null);
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
  // FETCH SUB ENTITY DATA
  // GET /api/SubEntity/GetAllSubEntity
  // ===================================================

  const fetchSubEntities = useCallback(async () => {
    if (Array.isArray(suppliedSubEntities)) {
      setSubEntityRows(
        suppliedSubEntities.map(mapSubEntity)
      );

      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axiosClientModule.get(
        "/SubEntity/GetAllSubEntity"
      );

      const records = extractSubEntities(response);

      setSubEntityRows(records.map(mapSubEntity));
    } catch (err) {
      console.error(
        "Failed to fetch sub entities:",
        err.response?.data || err.message
      );

      setSubEntityRows([]);

      setError(
        getErrorMessage(
          err,
          "Unable to load sub entities."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [suppliedSubEntities]);

  useEffect(() => {
    fetchSubEntities();
  }, [fetchSubEntities]);

  // ===================================================
  // ADD SUB ENTITY
  // ===================================================

  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd();
      return;
    }

    navigate("/admin/coresettings/subentity/add");
  }, [onAdd, navigate]);

  // ===================================================
  // EDIT SUB ENTITY
  // ===================================================

  const handleEdit = useCallback(
    (item) => {
      const encryptedId =
        item.encryptedId ||
        item.rdhR0000IIIID_Encrypted ||
        item.RDHR0000IIIID_Encrypted ||
        item.EncryptedId;

      if (!encryptedId) {
        showToast(
          "Encrypted Sub Entity ID is missing.",
          "error",
          4000
        );

        console.error(
          "Encrypted Sub Entity ID is missing:",
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

      navigate("/admin/coresettings/subentity/add", {
        state: {
          mode: "edit",
          encryptedId,
          subEntity: item,
        },
      });
    },
    [navigate, onEdit, showToast]
  );

  // ===================================================
  // DELETE SUB ENTITY
  // PATCH /api/SubEntity/DeleteSubEntity/{EncryptedId}
  // ===================================================

// ===================================================
// OPEN DELETE CONFIRMATION POPUP
// ===================================================

const handleDelete = useCallback(
  (item) => {
    const encryptedId =
      item.encryptedId ||
      item.rdhR0000IIIID_Encrypted ||
      item.RDHR0000IIIID_Encrypted ||
      item.EncryptedId;

    if (!encryptedId) {
      showToast(
        "Cannot delete this Sub Entity because its encrypted ID is missing.",
        "error",
        4000
      );

      console.error(
        "Encrypted Sub Entity ID is missing:",
        item
      );

      return;
    }

    setSelectedSubEntity({
      ...item,
      encryptedId,
    });

    setShowDeletePopup(true);
  },
  [showToast]
);

// ===================================================
// CONFIRM DELETE SUB ENTITY
// ===================================================

const confirmDelete = useCallback(async () => {
  if (!selectedSubEntity || isDeleting) return;

  setIsDeleting(true);

  try {
    if (onDelete) {
      await onDelete(selectedSubEntity);
    } else {
      await deleteSubEntityApi(
        selectedSubEntity.encryptedId
      );
    }

    setShowDeletePopup(false);
    setSelectedSubEntity(null);

    showToast(
      "Sub Entity deleted successfully.",
      "success",
      3000
    );

    await fetchSubEntities();
  } catch (err) {
    console.error(
      "Failed to delete Sub Entity:",
      err.response?.data || err.message
    );

    showToast(
      getErrorMessage(
        err,
        "Failed to delete Sub Entity. Please try again."
      ),
      "error",
      4000
    );
  } finally {
    setIsDeleting(false);
  }
}, [
  selectedSubEntity,
  isDeleting,
  onDelete,
  fetchSubEntities,
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
            title={`Edit ${item.subEntityName}`}
            aria-label={`Edit ${item.subEntityName}`}
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
            title={`Delete ${item.subEntityName}`}
            aria-label={`Delete ${item.subEntityName}`}
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
        header: "Organization",
        key: "organizationName",
        accessor: "organizationName",
        width: "350px",
      },

      {
        header: "Entity",
        key: "entityName",
        accessor: "entityName",
        width: "220px",
      },

      {
        header: "Sub Entity",
        key: "subEntityName",
        accessor: "subEntityName",
        width: "250px",
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
              onClick={fetchSubEntities}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <DataTable
          data={subEntityRows}
          columns={columns}
          title="Sub Entity - List"
            subtitle="View and manage sub entities."
        titleIcon={<LuBuilding size={19} />}
          showTitle
          searchable
          searchPlaceholder="Search..."
          filterable={true}
          filters={SubEntityFilters}
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
          fileName="sub-entities"
          rowKey="id"
          loading={suppliedLoading ?? loading}
          emptyMessage="No sub entities found."
          className="organization-entity-table"
        />


      </div>

      {/* DELETE CONFIRMATION POPUP */}

<Alert
  isOpen={showDeletePopup}
  title="Delete Sub Entity"
  message="Are you sure you want to delete"
  itemName={selectedSubEntity?.subEntityName || ""}
  confirmText="Delete"
  cancelText="Cancel"
  loading={isDeleting}
  onConfirm={confirmDelete}
  onCancel={() => {
    if (isDeleting) return;

    setShowDeletePopup(false);
    setSelectedSubEntity(null);
  }}
/>
    </>
  );
}
