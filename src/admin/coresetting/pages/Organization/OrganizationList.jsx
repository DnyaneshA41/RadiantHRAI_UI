import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { LuBuilding2 } from "react-icons/lu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import DataTable from "../../../../common/components/DataTable/DataTable";
import axiosClientModule from "../../../../api/axiosClientModule";

import { deleteOrganizationApi } from "../../../coresetting/services/organizationApi";

// =====================================================
// BOOLEAN STATUS
// =====================================================

const BooleanStatus = ({ value }) => {
  const enabled =
    value === true ||
    value === 1 ||
    value === "1" ||
    String(value).toLowerCase() === "true";

  return (
    <span
      className={`org-list-status ${
        enabled
          ? "org-list-status-enabled"
          : "org-list-status-disabled"
      }`}
    >
      <span className="org-list-status-dot" />
      {enabled ? "Yes" : "No"}
    </span>
  );
};

// =====================================================
// GET ENCRYPTED ID
// =====================================================

const getEncryptedId = (organization = {}) =>
  organization.RDHR0000IID_Encrypted ??
  organization.rdhr0000IID_Encrypted ??
  organization.EncryptedId ??
  organization.encryptedID ??
  organization.encryptedId ??
  "";

// =====================================================
// MAP API RECORD TO TABLE DATA
// Retain the original record for the edit form.
// =====================================================

const mapOrganization = (organization = {}) => ({
  id:
    organization.RDHR0000IID ??
    organization.rdhr0000IID ??
    organization.rdhR0000IID ??
    organization.id,

  encryptedId: getEncryptedId(organization),

  organizationName:
    organization.RDHR0000IName ??
    organization.rdhR0000IName ??
    organization.rdhrR0000IName ??
    organization.organizationName ??
    "",

  shortName:
    organization.ShortName ??
    organization.shortName ??
    "",

  whatsappIntegrate:
    organization.WhatsappRequired ??
    organization.WhatsAppRequired ??
    organization.WhatsappIntegrate ??
    organization.whatsappRequired ??
    organization.whatsappIntegrate ??
    false,

  aadhaarAuthentication:
    organization.AadhaarVerificationRequired ??
    organization.AadhaarAuthenticationRequired ??
    organization.AadhaarAuthentication ??
    organization.aadhaarVerificationRequired ??
    organization.aadhaarAuthentication ??
    false,

  twoFactorAuthenticationRequired:
    organization.TwoFactorAuthenticationRequired ??
    organization.twoFactorAuthenticationRequired ??
    false,

  notification:
    organization.NotificationRequired ??
    organization.notificationRequired ??
    organization.notification ??
    false,

  isActive:
    organization.IsActive ??
    organization.isActive ??
    false,

  isDeactivated:
    organization.IsDeactivated ??
    organization.isDeactivated ??
    false,

  industryType:
    organization.IndustryType ??
    organization.industryType ??
    "",

  establishedDate:
    organization.EstablishedDate ??
    organization.establishedDate ??
    null,

  phoneNumber:
    organization.PhoneNumber ??
    organization.phoneNumber ??
    "",

  emailAddress:
    organization.EmailAddress ??
    organization.emailAddress ??
    "",

  website:
    organization.Website ??
    organization.website ??
    "",

  addressLine1:
    organization.AddressLine1 ??
    organization.addressLine1 ??
    "",

  state:
    organization.State ??
    organization.state ??
    "",

  country:
    organization.Country ??
    organization.country ??
    "",

  postalCode:
    organization.PostalCode ??
    organization.postalCode ??
    "",

  pan:
    organization.PAN ??
    organization.pan ??
    "",

  gstNumber:
    organization.GSTNumber ??
    organization.gstNumber ??
    "",

  cin:
    organization.CIN ??
    organization.cin ??
    "",

  managerName:
    organization.ManagerName ??
    organization.managerName ??
    "",

  notificationDays:
    organization.NotificationDays ??
    organization.notificationDays ??
    0,

  logo:
    organization.RDHR0000ILogo ??
    organization.rdhR0000ILogo ??
    organization.logo ??
    null,

  stamp:
    organization.Stamp ??
    organization.stamp ??
    null,

  slogan:
    organization.Slogan ??
    organization.slogan ??
    "",

  createdByUser:
    organization.CreatedByUser ??
    organization.createdByUser ??
    "",

  createdDate:
    organization.CreatedDate ??
    organization.createdDate ??
    null,

  sourceID:
    organization.SourceID ??
    organization.sourceID ??
    "",

  // Critical: the form needs the complete original API record.
  raw: organization,
});

// =====================================================
// EXTRACT API ARRAY
// =====================================================

const extractOrganizations = (response) => {
  const body = response?.data;

  if (Array.isArray(body)) return body;

  const candidates = [
    body?.data,
    body?.Data,
    body?.result,
    body?.Result,
    body?.organizations,
    body?.Organizations,
    body?.data?.data,
    body?.data?.Data,
    body?.result?.data,
    body?.Result?.Data,
  ];

  return candidates.find(Array.isArray) || [];
};

// =====================================================
// ORGANIZATION LIST
// =====================================================

export default function OrganizationList({
  organizations: suppliedOrganizations,
  loading: suppliedLoading,
  onAdd,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const [organizationRows, setOrganizationRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // FETCH ORGANIZATIONS
  // =====================================================

  const fetchOrganizations = useCallback(async () => {
    if (Array.isArray(suppliedOrganizations)) {
      setOrganizationRows(suppliedOrganizations.map(mapOrganization));
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axiosClientModule.get(
        "/Organization/GetAllOrganization"
      );

      const records = extractOrganizations(response);

      setOrganizationRows(records.map(mapOrganization));
    } catch (err) {
      console.error(
        "Failed to fetch organizations:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Unable to load organizations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [suppliedOrganizations]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // =====================================================
  // FILTERS
  // =====================================================

  const organizationFilters = useMemo(
    () => [
      {
        key: "organizationName",
        label: "Organization",
        options: [
          ...new Set(
            organizationRows
              .map((org) => org.organizationName)
              .filter(Boolean)
          ),
        ],
        placeholder: "All Organizations",
      },
      {
        key: "shortName",
        label: "Short Name",
        options: [
          ...new Set(
            organizationRows
              .map((org) => org.shortName)
              .filter(Boolean)
          ),
        ],
        placeholder: "All Short Names",
      },
    ],
    [organizationRows]
  );

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (organization) => {
    if (typeof onEdit === "function") {
      onEdit({
        ...organization,
        mode: "edit",
        rawOrganization: organization.raw,
      });
      return;
    }

    navigate("/admin/coresettings/organization/add", {
      state: {
        mode: "edit",
        organizationId: organization.id,
        encryptedId: organization.encryptedId,
        organization,
        rawOrganization: organization.raw,
      },
    });
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (organization) => {
    const encryptedId = organization.encryptedId;

    if (!encryptedId) {
      setError(
        "Cannot delete this organization because its encrypted ID is missing."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${organization.organizationName}"?`
    );

    if (!confirmed) return;

    setDeletingId(encryptedId);
    setError("");

    try {
      const response = await deleteOrganizationApi(encryptedId);

      // Update the local list after the API succeeds.
      setOrganizationRows((previous) =>
        previous.filter(
          (item) => item.encryptedId !== encryptedId
        )
      );

      if (typeof onDelete === "function") {
        onDelete(organization, response);
      }

      // A parent-controlled list is refreshed by its owner.
      // An internally fetched list already has the local deletion.
    } catch (err) {
      console.error(
        "Failed to delete organization:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Unable to delete the organization. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // ADD
  // =====================================================

  const handleAdd = () => {
    if (typeof onAdd === "function") {
      onAdd();
      return;
    }

    navigate("/admin/coresettings/organization/add", {
      state: { mode: "create" },
    });
  };

  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const columns = useMemo(
    () => [
      {
        header: "Edit",
        key: "edit",
        width: "75px",
        sortable: false,
        searchable: false,
        exportable: false,

        render: (_, organization) => (
          <button
            type="button"
            className="edit-icon"
            title={`Edit ${organization.organizationName}`}
            aria-label={`Edit ${organization.organizationName}`}
            onClick={(event) => {
              event.stopPropagation();
              handleEdit(organization);
            }}
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
        ),
      },

      // {
      //   header: "Delete",
      //   key: "delete",
      //   width: "85px",
      //   sortable: false,
      //   searchable: false,
      //   exportable: false,

      //   render: (_, organization) => (
      //     <button
      //       type="button"
      //       className="edit-icon"
      //       title={`Delete ${organization.organizationName}`}
      //       aria-label={`Delete ${organization.organizationName}`}
      //       disabled={
      //         !organization.encryptedId ||
      //         deletingId === organization.encryptedId
      //       }
      //       onClick={(event) => {
      //         event.stopPropagation();
      //         handleDelete(organization);
      //       }}
      //     >
      //       {deletingId === organization.encryptedId
      //         ? "..."
      //         : <FiTrash2 />}
      //     </button>
      //   ),
      // },

      {
        header: "Organization",
        key: "organizationName",
        accessor: "organizationName",
        width: "260px",
      },

      {
        header: "Short Name",
        key: "shortName",
        accessor: "shortName",
        width: "130px",
      },

      {
        header: "Whatsapp Integrate",
        key: "whatsappIntegrate",
        accessor: "whatsappIntegrate",
        width: "180px",
        render: (value) => <BooleanStatus value={value} />,
        exportValue: (organization) =>
          organization.whatsappIntegrate ? "Yes" : "No",
      },

      {
        header: "Aadhaar Authentication",
        key: "aadhaarAuthentication",
        accessor: "aadhaarAuthentication",
        width: "210px",
        render: (value) => <BooleanStatus value={value} />,
        exportValue: (organization) =>
          organization.aadhaarAuthentication ? "Yes" : "No",
      },

      {
        header: "Notification",
        key: "notification",
        accessor: "notification",
        width: "140px",
        render: (value) => <BooleanStatus value={value} />,
        exportValue: (organization) =>
          organization.notification ? "Yes" : "No",
      },
    ],
    [deletingId]
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="hrms-form-container organization-list-page">
      {error && (
        <div className="org-list-error" role="alert">
          <span>{error}</span>

          <button
            type="button"
            onClick={fetchOrganizations}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      )}

      <DataTable
        data={organizationRows}
        columns={columns}
        title="Organization"
        subtitle="View and manage organizations."
        titleIcon={<LuBuilding2 size={19} />}
        showTitle
        searchable
        searchPlaceholder="Search by organization, short name..."
        filterable
        filters={organizationFilters}
        showAddButton
        addLabel="Add Organization"
        onAdd={handleAdd}
        pageSizeOptions={[10, 25, 50, 100]}
        defaultPageSize={10}
        enableExport
        enableCopy
        enableCsv
        enableExcel
        enablePdf
        enablePrint
        fileName="organizations"
        rowKey="id"
        loading={suppliedLoading ?? loading}
        emptyMessage="No organizations found."
        className="organization-list-table"
      />
    </div>
  );
}