import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { LuBlocks } from "react-icons/lu";
import {
  EditIcon,
  DeleteIcon,
} from "../../../../common/components/Icons/Icons.jsx";

import Toast from "../../../../common/components/Popups/Toast";
import Alert from "../../../../common/components/Popups/Alert.jsx";
import DataTable from "../../../../common/components/DataTable/DataTable";
import axiosClientModule from "../../../../api/axiosClientModule";

const getArray = (response, keys = []) => {
  const candidates = [
    response,
    response?.data,
    response?.Data,
    response?.result,
    response?.Result,
    ...keys.flatMap((key) => [
      response?.[key],
      response?.data?.[key],
      response?.Data?.[key],
      response?.result?.[key],
      response?.Result?.[key],
    ]),
  ];

  return candidates.find(Array.isArray) || [];
};

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;

  if (data?.errors) {
    const messages = Object.values(data.errors).flat();
    if (messages.length) return messages.join(" ");
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

const getOrganizationId = (item) =>
  item?.rdhR0000IID ??
  item?.RDHR0000IID ??
  item?.organizationId ??
  item?.OrganizationId ??
  "";

const getOrganizationName = (item) =>
  item?.rdhR0000IName ??
  item?.RDHR0000IName ??
  item?.rdhR0000IIName ??
  item?.RDHR0000IIName ??
  item?.organizationName ??
  item?.OrganizationName ??
  "";

const getEntityId = (item) =>
  item?.rdhR0000IIID ??
  item?.RDHR0000IIID ??
  item?.entityId ??
  item?.EntityId ??
  "";

const getEntityName = (item) =>
  item?.rdhR0000IIName ??
  item?.RDHR0000IIName ??
  item?.entityName ??
  item?.EntityName ??
  "";

const getCellId = (item) =>
  item?.rdhR0000IIIID ??
  item?.RDHR0000IIIID ??
  item?.rdhR0000IIIId ??
  item?.RDHR0000IIIId ??
  item?.id ??
  item?.Id ??
  "";

const getEncryptedCellId = (item) =>
  item?.rdhR0000IVID_Encrypted ??
  item?.RDHR0000IVID_Encrypted ??
  item?.encryptedId ??
  item?.EncryptedId ??
  item?.encryptedID ??
  item?.EncryptedID ??
  item?.encryptedCellId ??
  item?.EncryptedCellId ??
  "";
const mapCell = (item, organizations, entities, index) => {
  const orgId = getOrganizationId(item);
  const entId = getEntityId(item);

  const organization = organizations.find(
    (entry) => String(getOrganizationId(entry)) === String(orgId)
  );

  const entity = entities.find(
    (entry) => String(getEntityId(entry)) === String(entId)
  );

  const cellId = getCellId(item);
  const encryptedId = getEncryptedCellId(item);

  return {
    ...item,
    id:
      cellId !== "" && cellId !== null && cellId !== undefined
        ? cellId
        : `cell-row-${index}`,
    encryptedId,
    rdhR0000IID: orgId,
    rdhR0000IIID: entId,
    organizationName:
      item?.organizationName ??
      item?.OrganizationName ??
      getOrganizationName(organization || {}),
    entityName:
      item?.entityName ??
      item?.EntityName ??
      getEntityName(entity || {}),
    rdhR0000IIIName:
      item?.rdhR0000IIIName ??
      item?.RDHR0000IIIName ??
      item?.cellName ??
      item?.CellName ??
      item?.lineName ??
      item?.LineName ??
      "",
    isDefault: item?.isDefault ?? item?.IsDefault ?? false,
  };
};

const getAllCellsApi = async () => {
  const response = await axiosClientModule.get("/Cell/GetAllCell");
  return response.data;
};

const deleteCellApi = async (encryptedId) => {
  const response = await axiosClientModule.patch(
    `/Cell/DeleteCell/${encodeURIComponent(encryptedId)}`
  );

  return response.data;
};

export default function CellList({
  cells: suppliedCells,
  loading: suppliedLoading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
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

  const fetchCells = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const requests = [];

      if (!Array.isArray(suppliedCells)) {
        requests.push(getAllCellsApi());
      }

      requests.push(
        axiosClientModule.get("/Organization/GetOrganisationList"),
        axiosClientModule.get("/Entity/GetEntityList")
      );

      const responses = await Promise.all(requests);

      let cellRecords = [];
      let orgResponse;
      let entityResponse;

      if (Array.isArray(suppliedCells)) {
        cellRecords = suppliedCells;
        orgResponse = responses[0].data;
        entityResponse = responses[1].data;
      } else {
        cellRecords = getArray(responses[0], [
          "cells",
          "cellList",
          "CellList",
          "cellsList",
        ]);

        orgResponse = responses[1].data;
        entityResponse = responses[2].data;
      }

      const organizations = getArray(orgResponse, [
        "organisations",
        "organizations",
        "organisationList",
        "organizationList",
        "OrganisationList",
        "OrganizationList",
      ]);

      const entities = getArray(entityResponse, [
        "entities",
        "entityList",
        "EntityList",
        "entitiesList",
      ]);

      console.log("Cell list API records:", cellRecords);
      console.log("First Cell API record:", cellRecords[0]);
      console.log(
        "Encrypted Cell IDs:",
        cellRecords.map((item) => ({
          cellName:
            item?.rdhR0000IIIName ??
            item?.RDHR0000IIIName ??
            item?.cellName ??
            item?.CellName ??
            "",
          encryptedId: getEncryptedCellId(item),
        }))
      );

      setRows(
        cellRecords.map((item, index) =>
          mapCell(item, organizations, entities, index)
        )
      );
    } catch (err) {
      console.error("Failed to fetch Cell records:", {
        status: err?.response?.status,
        responseData: err?.response?.data,
        requestUrl: err?.config?.url,
        requestMethod: err?.config?.method,
        message: err?.message,
      });

      setRows([]);
      setError(
        getErrorMessage(err, "Unable to load Cell records.")
      );
    } finally {
      setLoading(false);
    }
  }, [suppliedCells]);

  useEffect(() => {
    fetchCells();
  }, [fetchCells]);

  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd();
      return;
    }

    navigate("/admin/coresettings/cell/add", {
      state: {
        mode: "add",
        cell: null,
        encryptedId: null,
      },
    });
  }, [navigate, onAdd]);

  const handleEdit = useCallback(
    (item) => {
      const encryptedId = getEncryptedCellId(item);

      if (!encryptedId) {
        showToast(
          "Encrypted Cell ID is missing. Please check the GetAllCell API response.",
          "error",
          5000
        );

        console.error("Encrypted Cell ID is missing:", item);
        return;
      }

      const selectedCellData = {
        ...item,
        encryptedId,
      };

      if (onEdit) {
        onEdit(selectedCellData);
        return;
      }

      navigate("/admin/coresettings/cell/add", {
        state: {
          mode: "edit",
          isEdit: true,
          encryptedId,
          cell: selectedCellData,
        },
      });
    },
    [navigate, onEdit, showToast]
  );

  const handleDelete = useCallback(
    (item) => {
      const encryptedId = getEncryptedCellId(item);

      if (!encryptedId) {
        showToast(
          "Cannot delete this Cell because its encrypted ID is missing. Please check the GetAllCell API response.",
          "error",
          5000
        );

        console.error("Encrypted Cell ID is missing:", item);
        return;
      }

      setSelectedCell({
        ...item,
        encryptedId,
      });

      setShowDeletePopup(true);
    },
    [showToast]
  );

  const confirmDelete = useCallback(async () => {
    if (!selectedCell || isDeleting) return;

    const encryptedId = getEncryptedCellId(selectedCell);

    if (!encryptedId) {
      showToast(
        "Encrypted Cell ID is missing. Cannot delete this record.",
        "error",
        5000
      );
      return;
    }

    setIsDeleting(true);

    try {
      let response;

      if (onDelete) {
        response = await onDelete({
          ...selectedCell,
          encryptedId,
        });
      } else {
        response = await deleteCellApi(encryptedId);
      }

      setShowDeletePopup(false);
      setSelectedCell(null);

      showToast(
        response?.message ||
          response?.Message ||
          "Cell deleted successfully.",
        "success"
      );

      await fetchCells();
    } catch (err) {
      console.error("Failed to delete Cell:", {
        status: err?.response?.status,
        responseData: err?.response?.data,
        requestUrl: err?.config?.url,
        requestMethod: err?.config?.method,
        message: err?.message,
      });

      showToast(
        getErrorMessage(err, "Failed to delete Cell. Please try again."),
        "error",
        5000
      );
    } finally {
      setIsDeleting(false);
    }
  }, [
    selectedCell,
    isDeleting,
    onDelete,
    fetchCells,
    showToast,
  ]);

  const filters = useMemo(
    () => [
      {
        key: "organizationName",
        label: "Organization",
        options: [
          ...new Set(
            rows.map((item) => item.organizationName).filter(Boolean)
          ),
        ],
        placeholder: "All Organizations",
      },
      {
        key: "entityName",
        label: "Entity",
        options: [
          ...new Set(
            rows.map((item) => item.entityName).filter(Boolean)
          ),
        ],
        placeholder: "All Entities",
      },
    ],
    [rows]
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
            title={`Edit ${item.rdhR0000IIIName || "Cell"}`}
            aria-label={`Edit ${item.rdhR0000IIIName || "Cell"}`}
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
            title={`Delete ${item.rdhR0000IIIName || "Cell"}`}
            aria-label={`Delete ${item.rdhR0000IIIName || "Cell"}`}
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
      },
      {
        header: "Entity",
        key: "entityName",
        accessor: "entityName",
      },
      {
        header: "Cell",
        key: "rdhR0000IIIName",
        accessor: "rdhR0000IIIName",
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

      <div className="hrms-form-container">
        {error && (
          <div role="alert">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchCells}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <DataTable
          data={rows}
          columns={columns}
          title="Cell - List"
            subtitle="View and manage cell."
        titleIcon={<LuBlocks size={19} />}
          showTitle
          searchable
          searchPlaceholder="Search..."
          filterable
          filters={filters}
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
          fileName="cells"
          rowKey="id"
          loading={suppliedLoading ?? loading}
          emptyMessage="No Cell records found."
        />
      </div>

      <Alert
        isOpen={showDeletePopup}
        title="Delete Cell"
        message="Are you sure you want to delete"
        itemName={selectedCell?.rdhR0000IIIName || ""}
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (isDeleting) return;

          setShowDeletePopup(false);
          setSelectedCell(null);
        }}
      />
    </>
  );
}
