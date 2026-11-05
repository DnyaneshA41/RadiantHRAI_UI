import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { LuGlobe } from "react-icons/lu";

import {
  EditIcon,
  DeleteIcon,
} from "../../../../common/components/Icons/Icons.jsx";

import Toast from "../../../../common/components/Popups/Toast";
import Alert from "../../../../common/components/Popups/Alert.jsx";
import DataTable from "../../../../common/components/DataTable/DataTable";
import axiosClientModule from "../../../../api/axiosClientModule";

const getAllCountriesApi = async () => {
  const response = await axiosClientModule.get(
    "/Country/GetAllCountrys"
  );

  return response.data;
};

const deleteCountryApi = async (encryptedId) => {
  const response = await axiosClientModule.patch(
    `/Country/DeleteCountry/${encodeURIComponent(encryptedId)}`
  );

  return response.data;
};

const mapCountry = (item) => ({
  ...item,

  id:
    item.rdhR0000XID ??
    item.RDHR0000XID ??
    item.rdhR0000XId ??
    item.RDHR0000XId ??
    item.id ??
    item.Id ??
    "",

  encryptedId:
    item.encryptedId ??
    item.EncryptedId ??
    item.encryptedID ??
    item.rdhR0000XID_Encrypted ??
    item.RDHR0000XID_Encrypted ??
    item.rdhR0000XEncryptedId ??
    item.RDHR0000XEncryptedId ??
    "",

  rdhR0000XName:
    item.rdhR0000XName ??
    item.RDHR0000XName ??
    item.countryName ??
    item.CountryName ??
    "",

  currencyName:
    item.currencyName ??
    item.CurrencyName ??
    "",

  shortName:
    item.shortName ??
    item.ShortName ??
    "",

  currencyNotation:
    item.currencyNotation ??
    item.CurrencyNotation ??
    "",

  nationality:
    item.nationality ??
    item.Nationality ??
    "",

  isDefault:
    item.isDefault ??
    item.IsDefault ??
    false,
});

const extractCountries = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.Data,
    response?.result,
    response?.Result,
    response?.countries,
    response?.Countries,
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

export default function CountryList({
  countries: suppliedCountries,
  loading: suppliedLoading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const [countryRows, setCountryRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
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

  const countryFilters = useMemo(
    () => [
      {
        key: "rdhR0000XName",
        label: "Country",
        options: [
          ...new Set(
            countryRows
              .map((country) => country.rdhR0000XName)
              .filter(Boolean)
          ),
        ],
        placeholder: "All Countries",
      },
      {
        key: "currencyName",
        label: "Currency",
        options: [
          ...new Set(
            countryRows
              .map((country) => country.currencyName)
              .filter(Boolean)
          ),
        ],
        placeholder: "All Currencies",
      },
    ],
    [countryRows]
  );

  const fetchCountries = useCallback(async () => {
    if (Array.isArray(suppliedCountries)) {
      setCountryRows(suppliedCountries.map(mapCountry));
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getAllCountriesApi();
      const records = extractCountries(response);

      setCountryRows(records.map(mapCountry));
    } catch (err) {
      console.error(
        "Failed to fetch countries:",
        err.response?.data || err.message
      );

      setCountryRows([]);

      setError(
        getErrorMessage(err, "Unable to load countries.")
      );
    } finally {
      setLoading(false);
    }
  }, [suppliedCountries]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd();
      return;
    }

    navigate("/admin/coresettings/country/add", {
      state: {
        mode: "add",
        country: null,
        encryptedId: null,
      },
    });
  }, [navigate, onAdd]);

  const handleEdit = useCallback(
    (item) => {
      const encryptedId = item.encryptedId;

      if (!encryptedId) {
        showToast(
          "Encrypted Country ID is missing. Please check the GetAllCountrys response.",
          "error",
          5000
        );

        console.error(
          "Encrypted Country ID is missing:",
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

      navigate("/admin/coresettings/country/add", {
        state: {
          mode: "edit",
          isEdit: true,
          encryptedId,
          country: {
            ...item,
            encryptedId,
            rdhR0000XName: item.rdhR0000XName,
            currencyName: item.currencyName,
            shortName: item.shortName,
            currencyNotation: item.currencyNotation,
            nationality: item.nationality,
            isDefault: item.isDefault,
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
          "Cannot delete this Country because its encrypted ID is missing.",
          "error",
          5000
        );

        console.error(
          "Encrypted Country ID is missing:",
          item
        );

        return;
      }

      setSelectedCountry(item);
      setShowDeletePopup(true);
    },
    [showToast]
  );

  const confirmDelete = useCallback(async () => {
    if (!selectedCountry || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      let response;

      if (onDelete) {
        response = await onDelete(selectedCountry);
      } else {
        response = await deleteCountryApi(
          selectedCountry.encryptedId
        );
      }

      setShowDeletePopup(false);
      setSelectedCountry(null);

      showToast(
        response?.message ||
          response?.Message ||
          "Country deleted successfully.",
        "success"
      );

      await fetchCountries();
    } catch (err) {
      console.error(
        "Failed to delete country:",
        err.response?.data || err.message
      );

      showToast(
        getErrorMessage(
          err,
          "Failed to delete Country. Please try again."
        ),
        "error",
        5000
      );
    } finally {
      setIsDeleting(false);
    }
  }, [
    selectedCountry,
    isDeleting,
    onDelete,
    fetchCountries,
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
            title={`Edit ${item.rdhR0000XName}`}
            aria-label={`Edit ${item.rdhR0000XName}`}
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
            title={`Delete ${item.rdhR0000XName}`}
            aria-label={`Delete ${item.rdhR0000XName}`}
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
        header: "Country",
        key: "rdhR0000XName",
        accessor: "rdhR0000XName",
      },
      {
        header: "Currency",
        key: "currencyName",
        accessor: "currencyName",
      },
      {
        header: "Short",
        key: "shortName",
        accessor: "shortName",
      },
      {
        header: "Notation",
        key: "currencyNotation",
        accessor: "currencyNotation",
      },
      {
        header: "Nationality",
        key: "nationality",
        accessor: "nationality",
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
              onClick={fetchCountries}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <DataTable
          data={countryRows}
          columns={columns}
          title="Country - List"
            subtitle="View and manage countries."
        titleIcon={<LuGlobe size={19} />}
          showTitle
          searchable
          searchPlaceholder="Search..."
          filterable
          filters={countryFilters}
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
          fileName="countries"
          rowKey="id"
          loading={suppliedLoading ?? loading}
          emptyMessage="No countries found."
          className="organization-entity-table"
        />
      </div>

      <Alert
        isOpen={showDeletePopup}
        title="Delete Country"
        message="Are you sure you want to delete"
        itemName={selectedCountry?.rdhR0000XName || ""}
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (isDeleting) return;

          setShowDeletePopup(false);
          setSelectedCountry(null);
        }}
      />
    </>
  );
}