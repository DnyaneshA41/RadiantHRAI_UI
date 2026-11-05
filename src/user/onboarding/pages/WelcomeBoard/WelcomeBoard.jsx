import React, { useMemo, useState } from "react";

import {
  FiUser,
  FiEdit3,
  FiCalendar,
  FiShield,
  FiFolder,
  FiFileText,
  FiBriefcase,
  FiArrowLeft,
  FiSave,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiCreditCard,
} from "react-icons/fi";

import DataTable from "../../../../common/components/DataTable/DataTable";

import EmployeeDetails from "../../components/Form/EmployeeDetails/EmployeeDetails";
import ReportingManager from "../../components/Form/ReportingManager/ReportingManager";
import AttendanceDetails from "../../components/Form/AttendanceDetails/AttendanceDetails";
import Statutory from "../../components/Form/Statutory/Statutory";

import "./WelcomeBoard.css";
import CTCDetails from "../../components/Form/CTCDetails/CTCDetails";
import EmployeeBank from "../../components/Form/EmployeeBank/EmployeeBank";
import AssetsDetails from "../../components/Form/AssetsDetails/AssetsDetails";

/* =========================================================
   SAMPLE EMPLOYEE DATA
========================================================= */

const INITIAL_EMPLOYEES = [
  {
    id: 1,
    empId: "EMP-1001",
    name: "Aayush Sharma",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    email: "aayush.sharma@techcorp.com",
    department: "IT",
    designation: "Sr. Frontend Developer",
    location: "Surat",
    employmentType: "Full-Time",
    status: "Active",
    progress: 4,
    joiningDate: "2022-03-15",
  },
  {
    id: 2,
    empId: "EMP-1002",
    name: "Priya Desai",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    email: "priya.desai@techcorp.com",
    department: "HR",
    designation: "HR Specialist",
    location: "Mumbai",
    employmentType: "Full-Time",
    status: "Active",
    progress: 5,
    joiningDate: "2021-08-10",
  },
  {
    id: 3,
    empId: "EMP-1003",
    name: "Rohit Verma",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    email: "rohit.verma@techcorp.com",
    department: "Design",
    designation: "Lead UI/UX Designer",
    location: "Pune",
    employmentType: "Full-Time",
    status: "On Leave",
    progress: 3,
    joiningDate: "2020-11-01",
  },
  {
    id: 4,
    empId: "EMP-1004",
    name: "Ananya Patel",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
    email: "ananya.patel@techcorp.com",
    department: "Product",
    designation: "Product Manager",
    location: "Bengaluru",
    employmentType: "Full-Time",
    status: "Active",
    progress: 7,
    joiningDate: "2019-05-22",
  },
  {
    id: 5,
    empId: "EMP-1005",
    name: "Karan Mehta",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    email: "karan.mehta@techcorp.com",
    department: "Sales",
    designation: "Sales Executive",
    location: "Delhi",
    employmentType: "Contract",
    status: "Inactive",
    progress: 2,
    joiningDate: "2023-01-15",
  },
  {
    id: 6,
    empId: "EMP-1006",
    name: "Neha Gupta",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    email: "neha.gupta@techcorp.com",
    department: "Finance",
    designation: "Financial Analyst",
    location: "Mumbai",
    employmentType: "Full-Time",
    status: "Active",
    progress: 6,
    joiningDate: "2022-09-01",
  },
  {
    id: 7,
    empId: "EMP-1007",
    name: "Vikram Singh",
    avatar:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150",
    email: "vikram.singh@techcorp.com",
    department: "IT",
    designation: "DevOps Engineer",
    location: "Surat",
    employmentType: "Part-Time",
    status: "Active",
    progress: 4,
    joiningDate: "2023-04-12",
  },
  {
    id: 8,
    empId: "EMP-1008",
    name: "Sneha Rao",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=150",
    email: "sneha.rao@techcorp.com",
    department: "Marketing",
    designation: "SEO Strategist",
    location: "Bengaluru",
    employmentType: "Full-Time",
    status: "Active",
    progress: 5,
    joiningDate: "2021-02-18",
  },
  {
    id: 9,
    empId: "EMP-1009",
    name: "Siddharth Joshi",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
    email: "siddharth.j@techcorp.com",
    department: "IT",
    designation: "Backend Developer",
    location: "Pune",
    employmentType: "Full-Time",
    status: "Inactive",
    progress: 3,
    joiningDate: "2020-07-30",
  },
  {
    id: 10,
    empId: "EMP-1010",
    name: "Pooja Bhatt",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    email: "pooja.bhatt@techcorp.com",
    department: "HR",
    designation: "Recruiter",
    location: "Delhi",
    employmentType: "Contract",
    status: "Active",
    progress: 7,
    joiningDate: "2023-06-05",
  },
  {
    id: 11,
    empId: "EMP-1011",
    name: "Manish Kumar",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
    email: "manish.k@techcorp.com",
    department: "Sales",
    designation: "Account Executive",
    location: "Surat",
    employmentType: "Full-Time",
    status: "Active",
    progress: 6,
    joiningDate: "2022-11-20",
  },
  {
    id: 12,
    empId: "EMP-1012",
    name: "Kavita Chawla",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150",
    email: "kavita.c@techcorp.com",
    department: "Design",
    designation: "Visual Designer",
    location: "Mumbai",
    employmentType: "Part-Time",
    status: "On Leave",
    progress: 4,
    joiningDate: "2023-02-14",
  },
];

/* =========================================================
   TABLE COLUMNS
   IMPORTANT:
   DataTable uses "header", not "label".
========================================================= */

const EMPLOYEE_COLUMNS = [
  {
    header: "Employee",
    key: "name",
    width: "230px",
    render: (_, employee) => (
      <div
        className="employee-id-cell"
        style={{ display: "flex", alignItems: "center", gap: "12px" }}
      >
        {employee.avatar ? (
          <img
            src={employee.avatar}
            alt={employee.name}
            className="emp-avatar"
          />
        ) : (
          <div className="emp-avatar emp-avatar-placeholder">
            {employee.name?.charAt(0)?.toUpperCase()}
          </div>
        )}
        <div
          className="employee-name-cell"
          style={{ display: "flex", flexDirection: "column", gap: "3px" }}
        >
          <span className="employee-name">{employee.name}</span>
          <span className="employee-id-text">{employee.empId}</span>
        </div>
      </div>
    ),
  },

  {
    header: "Department",
    key: "department",
    width: "110px",
  },

  {
    header: "Designation",
    key: "designation",
    width: "170px",
  },

  {
    header: "Location",
    key: "location",
    width: "110px",
  },

  {
    header: "Employment Type",
    key: "employmentType",
    width: "135px",
  },

  {
    header: "Status",
    key: "status",
    width: "105px",
    render: (_, employee) => {
      const status = employee.status;
      const statusClass =
        status === "Active"
          ? "employee-status-active"
          : status === "Inactive"
            ? "employee-status-inactive"
            : "employee-status-leave";

      return (
        <span className={`employee-status ${statusClass}`}>
          <span className="employee-status-dot" />
          {status}
        </span>
      );
    },
  },

  {
    header: "Progress",
    key: "progress",
    width: "150px",
    render: (_, employee) => {
      const totalSteps = 7;
      const completedSteps = Math.max(
        0,
        Math.min(totalSteps, Number(employee.progress) || 0),
      );

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            minWidth: "110px",
          }}
        >
          <span style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
            {completedSteps} of {totalSteps}
          </span>
          <div
            aria-label={`${completedSteps} of ${totalSteps} steps completed`}
            style={{ display: "flex", alignItems: "center", gap: "3px" }}
          >
            {Array.from({ length: totalSteps }, (_, index) => (
              <span
                key={index}
                style={{
                  display: "inline-block",
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  backgroundColor:
                    index < completedSteps ? "#2f80ed" : "transparent",
                  border: `1px solid ${index < completedSteps ? "#2f80ed" : "#2f80ed"}`,
                  boxSizing: "border-box",
                }}
              />
            ))}
          </div>
        </div>
      );
    },
  },
];

/* =========================================================
   FILTERS
========================================================= */

const EMPLOYEE_FILTERS = [
  {
    key: "department",
    label: "Department",

    options: ["IT", "HR", "Design", "Product", "Sales", "Finance", "Marketing"],

    placeholder: "All Departments",
  },

  {
    key: "location",
    label: "Location",

    options: ["Surat", "Mumbai", "Pune", "Bengaluru", "Delhi"],

    placeholder: "All Locations",
  },

  {
    key: "employmentType",
    label: "Employment Type",

    options: ["Full-Time", "Part-Time", "Contract"],

    placeholder: "All Types",
  },

  {
    key: "status",
    label: "Status",

    options: ["Active", "Inactive", "On Leave"],

    placeholder: "All Status",
  },
];

/* =========================================================
   EMPLOYEE DETAILS MENU
========================================================= */

const DETAIL_MENUS = [
  {
    id: "personal",
    label: "Personal",
    icon: FiUser,
  },
  {
    id: "reporting-manager",
    label: "Reporting Manager",
    icon: FiUsers,
  },
  {
    id: "attendance-details",
    label: "Attendance",
    icon: FiCalendar,
  },
  {
    id: "statutory",
    label: "Statutory",
    icon: FiShield,
  },
  {
    id: "ctc",
    label: "CTC",
    icon: FiDollarSign,
  },
  {
    id: "bank",
    label: "Bank",
    icon: FiCreditCard,
  },
  {
    id: "assets-details",
    label: "Assets",
    icon: FiBriefcase,
  },
];


/* =========================================================
   FORM CONTENT
========================================================= */

function EmployeeFormContent({ employee, activeMenu, onBackToList }) {
  switch (activeMenu) {
    case "personal":
      return (
        <EmployeeDetails employee={employee} onBackToList={onBackToList} />
      );

    case "reporting-manager":
      return (
        <ReportingManager employee={employee} onBackToList={onBackToList} />
      );

    case "attendance-details":
      return <AttendanceDetails employee={employee} onBackToList={onBackToList} />;

    case "statutory":
      return <Statutory employee={employee} onBackToList={onBackToList} />;

    case "ctc":
      return <CTCDetails employee={employee} onBackToList={onBackToList} />;

    case "bank":
      return <EmployeeBank employee={employee} onBackToList={onBackToList}/>;

    case "assets-details":
      return <AssetsDetails employee={employee} onBackToList={onBackToList}/>;

    default:
      return null;
  }
}

/* =========================================================
   EMPLOYEE MENU
========================================================= */

function EmployeeMenu({ activeMenu, onMenuChange, expanded, onToggle }) {
  return (
    <aside
      className={`wb-employee-menu ${expanded ? "expanded" : "collapsed"}`}
    >
      <button
        type="button"
        className="wb-menu-expand-button"
        onClick={onToggle}
        title={expanded ? "Collapse menu" : "Expand menu"}
      >
        {expanded ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
      </button>

      <div className="wb-menu-heading">Details</div>

      <div className="wb-menu-list">
        {DETAIL_MENUS.map((menu) => {
          const Icon = menu.icon;

          return (
            <button
              type="button"
              key={menu.id}
              className={`wb-menu-item ${
                activeMenu === menu.id ? "active" : ""
              }`}
              onClick={() => onMenuChange(menu.id)}
            >
              <span className="wb-menu-item-icon">
                <Icon size={16} />
              </span>

              <span className="wb-menu-item-label">{menu.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function WelcomeBoard() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [activeMenu, setActiveMenu] = useState(null);

  const [menuExpanded, setMenuExpanded] = useState(false);

  /* =======================================================
     VIEW DETAILS
  ======================================================= */

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);

    setActiveMenu(null);

    setMenuExpanded(false);
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);

    setActiveMenu("update");

    setMenuExpanded(false);
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDeleteEmployee = (employee) => {
    console.log("Delete employee:", employee);
  };

  /* =======================================================
     ADD
  ======================================================= */

  const handleAddEmployee = () => {
    alert("Add Employee form will be connected here.");
  };

  /* =======================================================
     MENU
  ======================================================= */

  const handleMenuChange = (menuId) => {
    setActiveMenu(menuId);
  };

  /* =======================================================
     BACK
  ======================================================= */

  const handleBackToList = () => {
    setSelectedEmployee(null);

    setActiveMenu(null);

    setMenuExpanded(false);
  };

  /* =======================================================
     TABLE PROPS
  ======================================================= */

  const tableProps = {
    data: INITIAL_EMPLOYEES,

    columns: EMPLOYEE_COLUMNS,

    title: "Employees",

    subtitle: "View and manage all employees in your organization.",

    // Keep Back inside the DataTable's existing header when viewing details.
    titleIcon: selectedEmployee ? (
      <button
        type="button"
        className="wb-inline-back-button"
        onClick={handleBackToList}
        title="Back to Employee List"
        aria-label="Back to Employee List"
      >
        <FiArrowLeft size={17} />
      </button>
    ) : (
      <FiUsers size={19} />
    ),

    showTitle: true,

    searchable: true,

    searchPlaceholder: "Search by name, ID, email...",

    filterable: true,

    filters: EMPLOYEE_FILTERS,

    pageSizeOptions: [10, 25, 50, 100],

    defaultPageSize: 10,

    fileName: "employees",

    showAddButton: true,

    addLabel: "Add",

    enableExport: true,

    enableCopy: true,

    enableCsv: true,

    enableExcel: true,

    enablePdf: true,

    enablePrint: true,

    onAdd: handleAddEmployee,

    onView: handleViewDetails,

    onEdit: handleEditEmployee,

    onDelete: handleDeleteEmployee,
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="hrms-form-container welcomeboard-page">
      {/* ===================================================
          STATE 1
          FULL EMPLOYEE TABLE
      =================================================== */}

      {!selectedEmployee && (
        <div className="welcomeboard-full-table">
          <DataTable {...tableProps} />
        </div>
      )}

      {/* ===================================================
          STATE 2 / STATE 3

          MAIN CONTENT + EMPLOYEE MENU
      =================================================== */}

      {selectedEmployee && (
        <div
          className={`welcomeboard-details-layout ${
            menuExpanded ? "menu-is-expanded" : "menu-is-collapsed"
          }`}
        >
          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <section className="wb-main-section">
            {/* =================================================
                DATA TABLE
            ================================================= */}

            {!activeMenu && (
              <div className="wb-table-inside-section">
                <DataTable {...tableProps} />
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            {activeMenu && (
              <div className="wb-form-section">
                <EmployeeFormContent
                  employee={selectedEmployee}
                  activeMenu={activeMenu}
                  onBackToList={handleBackToList}
                />
              </div>
            )}
          </section>

          {/* =================================================
              EMPLOYEE MENU
          ================================================= */}

          <EmployeeMenu
            activeMenu={activeMenu}
            onMenuChange={handleMenuChange}
            expanded={menuExpanded}
            onToggle={() => setMenuExpanded((previous) => !previous)}
          />
        </div>
      )}
    </div>
  );
}

export default WelcomeBoard;
