
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { EditIcon, DeleteIcon } from "../../../../common/components/Icons/Icons.jsx";
import Toast from "../../../../common/components/Popups/Toast";
import DataTable from "../../../../common/components/DataTable/DataTable";
import axiosClientModule from "../../../../api/axiosClientModule";
import { LuBuilding  } from "react-icons/lu";

import { deleteEntityApi } from "../../services/entityApi";

// =====================================================
// MAP API ENTITY TO TABLE ROW
// =====================================================

const mapEntity = (entity) => ({
  ...entity,

  id:
    entity.rdhR0000IIID ??
    entity.RDHR0000IIID ??
    entity.id,

  encryptedId:
    entity.rdhR0000IIID_Encrypted ??
    entity.RDHR0000IIID_Encrypted ??
    entity.encryptedId ??
    "",

  organizationId:
    entity.rdhR0000IID ??
    entity.RDHR0000IID ??
    entity.organizationId ??
    "",

  organizationName:
    entity.rdhR0000IName ??
    entity.RDHR0000IName ??
    entity.organizationName ??
    "",

  entityName:
    entity.rdhR0000IIName ??
    entity.RDHR0000IIName ??
    entity.entityName ??
    "",

  address:
    entity.rdhR0000IIAddress ??
    entity.RDHR0000IIAddress ??
    entity.address ??
    "",
});

// =====================================================
// EXTRACT ENTITY ARRAY
// =====================================================

const extractEntities = (response) => {
  const body = response?.data;

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.Data)) return body.Data;
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body?.Result)) return body.Result;
  if (Array.isArray(body?.entities)) return body.entities;
  if (Array.isArray(body?.Entities)) return body.Entities;

  return [];
};

// =====================================================
// ORGANIZATION ENTITY LIST
// =====================================================

export default function OrganizationEntityList({
  entities: suppliedEntities,
  loading: suppliedLoading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const [entityRows, setEntityRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const EntityFilters = useMemo(
    () => [

       {
        key: "organizationName",
        label: "Organization Name",
        options: [
          ...new Set(
            entityRows
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
            entityRows
              .map((entity) => entity.entityName)
              .filter(Boolean)
          ),
        ],
        placeholder: "All Entities",
      },
     
    ],
    [entityRows]
  );
  // Toast state
  const [toast, setToast] = useState(null);

  // =====================================================
  // TOAST HELPERS
  // =====================================================

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

  // =====================================================
  // FETCH ENTITY DATA
  // =====================================================

  const fetchEntities = useCallback(async () => {
    if (Array.isArray(suppliedEntities)) {
      setEntityRows(suppliedEntities.map(mapEntity));
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axiosClientModule.get(
        "/Entity/GetAllEntity"
      );

      const records = extractEntities(response);

      setEntityRows(records.map(mapEntity));
    } catch (err) {
      console.error(
        "Failed to fetch organization entities:",
        err.response?.data || err.message
      );

      setEntityRows([]);

      setError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Unable to load organization entities."
      );
    } finally {
      setLoading(false);
    }
  }, [suppliedEntities]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  // =====================================================
  // ADD ENTITY
  // =====================================================

  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd();
      return;
    }

    navigate("/admin/coresettings/entity/add");
  }, [onAdd, navigate]);

  // =====================================================
  // EDIT ENTITY
  // =====================================================

const handleEdit = (entity) => {
  const encryptedId =
    entity.encryptedId ||
    entity.rdhR0000IIID_Encrypted ||
    entity.RDHR0000IIID_Encrypted;

  if (!encryptedId) {
    showToast("Encrypted entity ID is missing.", "error", 4000);
    return;
  }

  navigate("/admin/coresettings/entity/add", {
    state: {
      mode: "edit",
      encryptedId,
    },
  });
};

  // =====================================================
  // DELETE ENTITY
  // PATCH /api/Entity/DeleteEntity/{EncryptedId}
  // =====================================================

  const handleDelete = useCallback(
    async (entity) => {
      const encryptedId =
        entity.encryptedId ||
        entity.rdhR0000IIID_Encrypted ||
        entity.RDHR0000IIID_Encrypted;

      if (!encryptedId) {
        showToast(
          "Cannot delete this entity because its encrypted ID is missing.",
          "error",
          4000
        );

        console.error(
          "Encrypted entity ID is missing:",
          entity
        );

        return;
      }

      try {
        // Use the parent's handler if one was provided.
        // Otherwise, call this component's delete API.
        if (onDelete) {
          await onDelete(entity);
        } else {
          await deleteEntityApi(encryptedId);
        }

        showToast(
          "Entity deleted successfully.",
          "success",
          3000
        );

        // Refresh local rows or reload the API list.
        await fetchEntities();
      } catch (err) {
        console.error(
          "Failed to delete entity:",
          err.response?.data || err.message
        );

        showToast(
          err.response?.data?.message ||
            err.response?.data?.Message ||
            "Failed to delete entity. Please try again.",
          "error",
          4000
        );
      }
    },
    [onDelete, fetchEntities, showToast]
  );

  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const columns = useMemo(
    () => [
      {
        header: "Edit",
        key: "edit",
        width: "90px",
        sortable: false,
        searchable: false,
        exportable: false,

        render: (_, entity) => (
          <button
            type="button"
            className="icon-btn"
            title={`Edit ${entity.entityName}`}
            aria-label={`Edit ${entity.entityName}`}
            onClick={(event) => {
              event.stopPropagation();
              handleEdit(entity);
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

        render: (_, entity) => (
          <button
            type="button"
            className="delete-icon"
            title={`Delete ${entity.entityName}`}
            aria-label={`Delete ${entity.entityName}`}
            onClick={(event) => {
              event.stopPropagation();
              handleDelete(entity);
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
        header: "Address",
        key: "address",
        accessor: "address",
        width: "400px",
      },
    ],
    [handleEdit, handleDelete]
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {/* CUSTOM TOAST */}
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
              onClick={fetchEntities}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <DataTable
          data={entityRows}
          columns={columns}
          title="Entity - List"
            subtitle="View and manage entities."
                  titleIcon={<LuBuilding size={19} />}
          showTitle
          searchable
          searchPlaceholder="Search..."
          filterable={true}
          filters={EntityFilters}
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
          fileName="organization-entities"
          rowKey="id"
          loading={suppliedLoading ?? loading}
          emptyMessage="No organization entities found."
          className="organization-entity-table"
        />
      </div>
    </>
  );
}
