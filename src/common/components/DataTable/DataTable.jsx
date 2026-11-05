import React, { useEffect, useMemo, useRef, useState } from "react";

import "./DataTable.css";

import Filter from "../Filter/Filter";

/* =========================================================
   ICONS
========================================================= */

const IconSearch = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const IconPlus = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconDownload = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconChevronDown = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconChevronUp = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const IconChevronLeft = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconChevronRight = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconRotateCcw = ({ size = 15, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const IconMoreVertical = ({ size = 17, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const IconEye = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEdit = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const IconTrash = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const IconCopy = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconFile = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const IconPrinter = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

/* =========================================================
   HELPERS
========================================================= */

const getNestedValue = (object, path) => {
  if (!path) return "";

  return path
    .split(".")
    .reduce(
      (current, key) =>
        current !== null && current !== undefined ? current[key] : "",
      object,
    );
};

const getColumnValue = (row, column) => {
  if (typeof column.accessor === "function") {
    return column.accessor(row);
  }

  return getNestedValue(row, column.accessor || column.key);
};

const getColumnHeader = (column) =>
  column.header || column.label || column.key || "";

/* =========================================================
   DATA TABLE
========================================================= */

export default function DataTable({
  data = [],
  columns = [],

  /* Header */
  title = "",
  subtitle = "",
  titleIcon = null,
  showTitle = true,
  showAddButton = false,
  addLabel = "Add",
  onAdd,

  /* Search */
  search = "",
  searchable = true,
  searchPlaceholder = "Search by name, ID, email...",

  /* Filters */
  filters = [],
  filterable = true,

  /* Pagination */
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 10,

  /* Actions */
  onView,
  onEdit,
  onDelete,
  renderActions,

  /* Export */
  enableExport = true,
  enableCopy = true,
  enableCsv = true,
  enableExcel = true,
  enablePdf = true,
  enablePrint = true,
  fileName = "data",

  /* Other */
  emptyMessage = "No records found.",
  loading = false,
  rowKey = "id",
  className = "",
  tableClassName = "",
  onRowClick,
}) {
  /* =======================================================
     STATE
  ======================================================= */

  const [rows, setRows] = useState(Array.isArray(data) ? data : []);

  const [searchValue, setSearchValue] = useState(search || "");

  const [activeFilters, setActiveFilters] = useState({});

  const [pageSize, setPageSize] = useState(defaultPageSize);

  const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [activeActionMenu, setActiveActionMenu] = useState(null);

  const [actionPosition, setActionPosition] = useState(null);

  const [showExportMenu, setShowExportMenu] = useState(false);

  const [notification, setNotification] = useState("");

  /* Refs used to detect outside clicks */
  const actionButtonRefs = useRef({});
  const exportMenuRef = useRef(null);

  /* =======================================================
     SYNC DATA
  ======================================================= */

  useEffect(() => {
    setRows(Array.isArray(data) ? data : []);
  }, [data]);

  useEffect(() => {
    setSearchValue(search || "");
  }, [search]);

  /* =======================================================
     NOTIFICATION
  ======================================================= */

  const showNotification = (message) => {
    setNotification(message);

    window.setTimeout(() => {
      setNotification("");
    }, 2500);
  };

  /* =======================================================
     FILTER OPTIONS
  ======================================================= */

  const getFilterOptions = (filter) => {
    if (typeof filter.getOptions === "function") {
      return filter.getOptions(rows);
    }

    if (Array.isArray(filter.options)) {
      return filter.options;
    }

    return [];
  };

  /* =======================================================
     FILTER DATA
  ======================================================= */

  const filteredRows = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !query ||
        columns.some((column) => {
          if (column.searchable === false) {
            return false;
          }

          const value = getColumnValue(row, column);

          return String(value ?? "")
            .toLowerCase()
            .includes(query);
        });

      if (!matchesSearch) {
        return false;
      }

      return filters.every((filter) => {
        const selectedValue = activeFilters[filter.key];

        if (selectedValue === undefined || selectedValue === "") {
          return true;
        }

        const value =
          typeof filter.accessor === "function"
            ? filter.accessor(row)
            : getNestedValue(row, filter.accessor || filter.key);

        return String(value ?? "") === String(selectedValue);
      });
    });
  }, [rows, columns, searchValue, filters, activeFilters]);

  /* =======================================================
     SORT
  ======================================================= */

  const sortedRows = useMemo(() => {
    const result = [...filteredRows];

    if (!sortConfig.key) {
      return result;
    }

    const column = columns.find(
      (item) => (item.key || item.accessor) === sortConfig.key,
    );

    if (!column) {
      return result;
    }

    result.sort((a, b) => {
      const valueA = String(getColumnValue(a, column) ?? "").toLowerCase();

      const valueB = String(getColumnValue(b, column) ?? "").toLowerCase();

      if (valueA < valueB) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }

      return 0;
    });

    return result;
  }, [filteredRows, sortConfig, columns]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalRecords = sortedRows.length;

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const safePage = Math.min(currentPage, totalPages);

  const startIndex = totalRecords === 0 ? 0 : (safePage - 1) * pageSize;

  const endIndex =
    totalRecords === 0 ? 0 : Math.min(startIndex + pageSize, totalRecords);

  const currentRecords = sortedRows.slice(startIndex, endIndex);

  /* =======================================================
     RESET PAGE WHEN FILTER CHANGES
  ======================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, activeFilters, pageSize]);

  /* =======================================================
     SORT HANDLER
  ======================================================= */

  const handleSort = (column) => {
    const key = column.sortKey || column.key || column.accessor;

    if (!key || typeof key !== "string") {
      return;
    }

    setSortConfig((previous) => ({
      key,
      direction:
        previous.key === key && previous.direction === "asc" ? "desc" : "asc",
    }));
  };

  /* =======================================================
     FILTER HANDLER
  ======================================================= */

  const handleFilterChange = (filterKey, value) => {
    setActiveFilters((previous) => ({
      ...previous,
      [filterKey]: value || "",
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(activeFilters).some(
    (value) => value !== undefined && value !== "",
  );

  /* =======================================================
     ACTION MENU
  ======================================================= */

  const closeActionMenu = () => {
    setActiveActionMenu(null);
    setActionPosition(null);
  };

  const openActionMenu = (row, event) => {
    event.stopPropagation();

    const button = actionButtonRefs.current[row[rowKey]];

    if (!button) {
      return;
    }

    /* Toggle the current action menu */
    if (activeActionMenu === row[rowKey]) {
      closeActionMenu();
      return;
    }

    const rect = button.getBoundingClientRect();

    const menuWidth = 150;
    const menuHeight = 120;

    let left = rect.right - menuWidth;
    let top = rect.bottom + 5;

    if (left < 8) {
      left = 8;
    }

    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }

    if (top + menuHeight > window.innerHeight - 8) {
      top = rect.top - menuHeight - 5;
    }

    setActionPosition({
      top,
      left,
    });

    setActiveActionMenu(row[rowKey]);

    /* Opening an action menu closes the export menu */
    setShowExportMenu(false);
  };

  /* =======================================================
     CLICK OUTSIDE / ESCAPE — UPDATED
  ======================================================= */

  useEffect(() => {
    const handleDocumentMouseDown = (event) => {
      const target = event.target;

      /*
       * EXPORT MENU:
       * Close only when the click is outside the export wrapper.
       *
       * Capture phase ensures this still works even when a
       * parent or child uses event.stopPropagation().
       */
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(target)
      ) {
        setShowExportMenu(false);
      }

      /*
       * ACTION MENU:
       * Keep it open when clicking inside the popup or on an
       * action trigger. Close it for clicks elsewhere.
       */
      const clickedActionPopup =
        target instanceof Element && target.closest(".action-popup");

      const clickedActionTrigger =
        target instanceof Element && target.closest(".action-trigger");

      if (!clickedActionPopup && !clickedActionTrigger) {
        closeActionMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeActionMenu();
        setShowExportMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleDocumentMouseDown,
      true,
    );

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleDocumentMouseDown,
        true,
      );

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = (row) => {
    setRows((previous) =>
      previous.filter((item) => item[rowKey] !== row[rowKey]),
    );

    onDelete?.(row);

    closeActionMenu();

    showNotification(`${row.name || "Record"} deleted successfully.`);
  };

  /* =======================================================
     EXPORT DATA
  ======================================================= */

  const getExportValue = (row, column) => {
    if (typeof column.exportValue === "function") {
      return column.exportValue(row);
    }

    const value = getColumnValue(row, column);

    return value ?? "";
  };

  const exportColumns = columns.filter(
    (column) => column.exportable !== false,
  );

  /* =======================================================
     COPY
  ======================================================= */

  const copyTable = async () => {
    const headerLine = exportColumns.map(getColumnHeader).join("\t");

    const bodyLines = sortedRows.map((row) =>
      exportColumns
        .map((column) => String(getExportValue(row, column)))
        .join("\t"),
    );

    try {
      await navigator.clipboard.writeText(
        [headerLine, ...bodyLines].join("\n"),
      );

      showNotification("Table copied successfully.");
    } catch {
      showNotification("Unable to copy table.");
    }

    setShowExportMenu(false);
  };

  /* =======================================================
     CSV
  ======================================================= */

  const downloadCSV = () => {
    const headers = exportColumns
      .map((column) => `"${String(getColumnHeader(column)).replace(/"/g, '""')}"`)
      .join(",");

    const lines = sortedRows.map((row) =>
      exportColumns
        .map((column) => {
          const value = getExportValue(row, column);

          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(","),
    );

    const blob = new Blob([[headers, ...lines].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${fileName}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showNotification("CSV downloaded successfully.");

    setShowExportMenu(false);
  };

  /* =======================================================
     EXCEL
  ======================================================= */

  const downloadExcel = () => {
    const headerHtml = exportColumns
      .map((column) => `<th>${getColumnHeader(column)}</th>`)
      .join("");

    const bodyHtml = sortedRows
      .map(
        (row) =>
          `<tr>${exportColumns
            .map((column) => `<td>${String(getExportValue(row, column))}</td>`)
            .join("")}</tr>`,
      )
      .join("");

    const html = `
      <table border="1">
        <thead>
          <tr>${headerHtml}</tr>
        </thead>
        <tbody>
          ${bodyHtml}
        </tbody>
      </table>
    `;

    const blob = new Blob([html], {
      type: "application/vnd.ms-excel",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${fileName}.xls`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showNotification("Excel downloaded successfully.");

    setShowExportMenu(false);
  };

  /* =======================================================
     PRINT / PDF
  ======================================================= */

  const printTable = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setShowExportMenu(false);
      showNotification("Please allow pop-ups to print this table.");
      return;
    }

    const headerHtml = exportColumns
      .map((column) => `<th>${getColumnHeader(column)}</th>`)
      .join("");

    const bodyHtml = sortedRows
      .map(
        (row) =>
          `<tr>${exportColumns
            .map((column) => `<td>${String(getExportValue(row, column))}</td>`)
            .join("")}</tr>`,
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title || "Data"}</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 30px;
              font-family: Arial, Helvetica, sans-serif;
              color: #334155;
            }

            h2 {
              margin: 0 0 18px;
              color: #023e7d;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              border: 1px solid #dfe5ec;
              padding: 8px 10px;
              font-size: 12px;
              text-align: left;
            }

            th {
              background: #f5f8fb;
              color: #475569;
              font-weight: 700;
            }
          </style>
        </head>

        <body>
          <h2>${title || "Data"}</h2>

          <table>
            <thead>
              <tr>${headerHtml}</tr>
            </thead>

            <tbody>${bodyHtml}</tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    window.setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);

    setShowExportMenu(false);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={`datatable-directory ${className}`}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      {notification && (
        <div className="data-table-notification">{notification}</div>
      )}

      <div className="datatable-card">
        {/* =================================================
            HEADER
        ================================================= */}

        {showTitle && (
          <div className="datatable-card-header">
            <div className="datatable-card-header-left">
              {titleIcon && (
                <div className="employee-title-icon">{titleIcon}</div>
              )}

              <div className="employee-title-content">
                {title && <h2>{title}</h2>}

                {subtitle && <p>{subtitle}</p>}
              </div>
            </div>

            <div className="datatable-card-header-right">
              {searchable && (
                <div className="employee-search">
                  <IconSearch size={15} />

                  <input
                    type="text"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder={searchPlaceholder}
                    aria-label="Search"
                  />
                </div>
              )}

              {showAddButton && (
                <button
                  type="button"
                  className="employee-add-button"
                  onClick={() => onAdd?.()}
                >
                  <IconPlus size={15} />
                  <span>{addLabel}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* =================================================
            TABLE CONTROLS
        ================================================= */}

        <div className="data-table-controls">
      

          <div className="employee-page-size">
            <span>Show</span>

            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            <span>entries</span>
          </div>

          {/* CENTER - FILTERS */}

          {filterable && filters.length > 0 && (
            <div className="employee-filters">
              {filters.map((filter) => (
                <div className="filter-box" key={filter.key}>
                  <Filter
                    options={getFilterOptions(filter)}
                    value={activeFilters[filter.key] || ""}
                    onChange={(value) => handleFilterChange(filter.key, value)}
                    placeholder={filter.placeholder || filter.label || "Select"}
                  />
                </div>
              ))}

              {hasActiveFilters && (
                <button
                  type="button"
                  className="clear-filter-button"
                  onClick={clearAllFilters}
                >
                  <IconRotateCcw size={14} />
                  <span>Clear all</span>
                </button>
              )}
            </div>
          )}

          {/* RIGHT - EXPORT */}

          {enableExport && (
            <div
              className="export-dropdown-wrapper"
              ref={exportMenuRef}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="data-export-button"
                aria-expanded={showExportMenu}
                onClick={() => {
                  setShowExportMenu((previous) => !previous);
                  closeActionMenu();
                }}
              >
                <IconDownload size={14} />

                <span>Export</span>

                {showExportMenu ? (
                  <IconChevronUp size={12} />
                ) : (
                  <IconChevronDown size={12} />
                )}
              </button>

              {showExportMenu && (
                <div className="export-menu">
                  {enableCopy && (
                    <button type="button" onClick={copyTable}>
                      <IconCopy />
                      Copy
                    </button>
                  )}

                  {enableCsv && (
                    <button type="button" onClick={downloadCSV}>
                      <IconFile />
                      CSV
                    </button>
                  )}

                  {enableExcel && (
                    <button type="button" onClick={downloadExcel}>
                      <IconDownload />
                      Excel
                    </button>
                  )}

                  {enablePdf && (
                    <button type="button" onClick={printTable}>
                      <IconFile />
                      PDF
                    </button>
                  )}

                  {enablePrint && (
                    <button type="button" onClick={printTable}>
                      <IconPrinter />
                      Print
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="data-table-wrapper">
          <table className={`data-table ${tableClassName}`}>
            <thead>
              <tr>
                {columns.map((column) => {
                  const columnKey = column.key || column.accessor;

                  const sortKey =
                    column.sortKey ||
                    (typeof columnKey === "string" ? columnKey : null);

                  const isSorted = sortConfig.key === sortKey;

                  return (
                    <th
                      key={columnKey || getColumnHeader(column)}
                      style={{
                        width: column.width,
                      }}
                      onClick={() => handleSort(column)}
                      className={column.headerClassName || ""}
                    >
                      <div className="table-header-content">
                        <span>{getColumnHeader(column)}</span>

                        {column.sortable !== false && sortKey && (
                          <span className="table-sort-icon">
                            {isSorted && sortConfig.direction === "asc" ? (
                              <IconChevronUp size={11} />
                            ) : (
                              <IconChevronDown size={11} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}

                {(onView || onEdit || onDelete || renderActions) && (
                  <th className="actions-header">Actions</th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="data-table-state">
                    Loading...
                  </td>
                </tr>
              ) : currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="data-table-state">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                currentRecords.map((row, rowIndex) => {
                  const id = row[rowKey] ?? rowIndex;

                  return (
                    <tr
                      key={id}
                      onClick={() => onRowClick?.(row)}
                      className={onRowClick ? "data-table-clickable-row" : ""}
                    >
                      {columns.map((column) => {
                        const value = getColumnValue(row, column);

                        return (
                          <td
                            key={column.key || column.accessor}
                            className={column.cellClassName || ""}
                          >
                            {column.render
                              ? column.render(value, row, rowIndex)
                              : value}
                          </td>
                        );
                      })}

                      {(onView || onEdit || onDelete || renderActions) && (
                        <td className="action-cell">
                          <button
                            type="button"
                            ref={(element) => {
                              actionButtonRefs.current[id] = element;
                            }}
                            className="action-trigger"
                            aria-label="Open row actions"
                            aria-expanded={activeActionMenu === id}
                            onClick={(event) => openActionMenu(row, event)}
                          >
                            <IconMoreVertical size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
            FOOTER / PAGINATION
        ================================================= */}

        <div className="datatable-pagination">
          <div className="pagination-info">
            Showing <strong>{totalRecords === 0 ? 0 : startIndex + 1}</strong>{" "}
            to <strong>{endIndex}</strong> of <strong>{totalRecords}</strong>{" "}
            entries
          </div>

          <nav>
            <ul className="pagination-list">
              <li className={safePage === 1 ? "disabled" : ""}>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={safePage === 1}
                >
                  <IconChevronLeft size={12} />
                  Prev
                </button>
              </li>

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => index + 1,
              ).map((pageNumber) => (
                <li
                  key={pageNumber}
                  className={safePage === pageNumber ? "active" : ""}
                >
                  <button
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                </li>
              ))}

              <li className={safePage === totalPages ? "disabled" : ""}>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={safePage === totalPages}
                >
                  Next
                  <IconChevronRight size={12} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* =================================================
          ACTION POPUP
      ================================================= */}

      {activeActionMenu !== null && actionPosition && (
        <div
          className="action-popup"
          style={{
            top: `${actionPosition.top}px`,
            left: `${actionPosition.left}px`,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          {renderActions ? (
            renderActions(
              rows.find((row) => row[rowKey] === activeActionMenu),
              closeActionMenu,
            )
          ) : (
            <>
              {onView && (
                <button
                  type="button"
                  className="action-item"
                  onClick={() => {
                    const row = rows.find(
                      (item) => item[rowKey] === activeActionMenu,
                    );

                    closeActionMenu();
                    onView(row);
                  }}
                >
                  <IconEye />
                  View Details
                </button>
              )}

              {onEdit && (
                <button
                  type="button"
                  className="action-item"
                  onClick={() => {
                    const row = rows.find(
                      (item) => item[rowKey] === activeActionMenu,
                    );

                    closeActionMenu();
                    onEdit(row);
                  }}
                >
                  <IconEdit />
                  Edit Record
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  className="action-item action-item-danger"
                  onClick={() => {
                    const row = rows.find(
                      (item) => item[rowKey] === activeActionMenu,
                    );

                    if (row) {
                      handleDelete(row);
                    }
                  }}
                >
                  <IconTrash />
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}