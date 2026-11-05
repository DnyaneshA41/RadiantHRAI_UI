import React, { useMemo, useState } from "react";
import FormSelect from "../../../common/components/Form/FormSelect";
import FormOffcanvas from "../../../common/components/offcanvas/FormOffcanvas";
import {
  DashboardCard,
  DashboardCardGrid,
} from "../../../common/components/Card/DashboardCards";
import {
  FiUsers,
  FiUser,
  FiGrid,
  FiShield,
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiChevronRight,
  FiEdit2,
  FiTrash2,
  FiBriefcase,
  FiDollarSign,
  FiCalendar,
  FiBarChart2,
  FiBookOpen,
  FiFileText,
  FiSettings,
  FiLayout,
  FiCheckCircle,
  FiX,
  FiInfo,
  FiLock,
  FiUserCheck,
} from "react-icons/fi";

import "./roleNaccess.css";

// =====================================================
// SAMPLE DATA
// =====================================================

const initialRoles = [
  {
    id: 1,
    name: "Super Admin",
    description: "Full system access with all permissions",
    users: 5,
    status: "Active",
  },
  {
    id: 2,
    name: "HR Manager",
    description: "HR module access with limited admin rights",
    users: 8,
    status: "Active",
  },
  {
    id: 3,
    name: "Payroll Executive",
    description: "Payroll module access",
    users: 6,
    status: "Active",
  },
  {
    id: 4,
    name: "Team Lead",
    description: "Team management and basic HR access",
    users: 10,
    status: "Active",
  },
  {
    id: 5,
    name: "Employee",
    description: "Self-service access and limited view rights",
    users: 18,
    status: "Active",
  },
  {
    id: 6,
    name: "Recruiter",
    description: "Recruitment module access",
    users: 3,
    status: "Active",
  },
  {
    id: 7,
    name: "Finance Manager",
    description: "Finance and payroll reports access",
    users: 2,
    status: "Active",
  },
  {
    id: 8,
    name: "IT Support",
    description: "System configuration and support access",
    users: 1,
    status: "Active",
  },
];

const moduleData = [
  {
    id: 1,
    name: "Dashboard",
    icon: FiLayout,
    description: "View and access dashboard and reports",
    permissions: [
      "View Dashboard",
      "View My Reports",
      "Export Reports",
      "Access Analytics",
    ],
    subModules: [
      "Employee Summary",
      "Attendance Overview",
      "Leave Balance",
      "Payroll Summary",
    ],
  },
  {
    id: 2,
    name: "Profile Management",
    icon: FiUser,
    description: "Manage employee profile information",
    permissions: [
      "View Profile",
      "Edit Profile",
      "Update Personal Details",
      "Upload Documents",
    ],
    subModules: ["Personal Information", "Address Details", "Bank Details"],
  },
  {
    id: 3,
    name: "Leave Management",
    icon: FiCalendar,
    description: "Manage employee leave requests",
    permissions: ["View Leave", "Apply Leave", "Approve Leave", "Cancel Leave"],
    subModules: ["Leave Application", "Leave Approval", "Leave Balance"],
  },
  {
    id: 4,
    name: "Attendance",
    icon: FiCheckCircle,
    description: "Manage employee attendance",
    permissions: ["View Attendance", "Mark Attendance", "Edit Attendance"],
    subModules: ["Daily Attendance", "Attendance Reports"],
  },
  {
    id: 5,
    name: "Payroll",
    icon: FiDollarSign,
    description: "Manage salary and payroll",
    permissions: ["View Payroll", "Process Payroll", "Approve Payroll"],
    subModules: ["Salary Structure", "Payslip", "Payroll Processing"],
  },
  {
    id: 6,
    name: "Performance",
    icon: FiBarChart2,
    description: "Manage employee performance",
    permissions: ["View Performance", "Create Reviews", "Approve Reviews"],
    subModules: ["Performance Reviews", "Appraisals"],
  },
  {
    id: 7,
    name: "Learning & Development",
    icon: FiBookOpen,
    description: "Manage employee learning",
    permissions: ["View Courses", "Assign Courses", "Manage Training"],
    subModules: ["Training Programs", "Employee Courses"],
  },
  {
    id: 8,
    name: "Reports",
    icon: FiFileText,
    description: "Access HR reports",
    permissions: ["View Reports", "Export Reports"],
    subModules: ["Employee Reports", "Attendance Reports"],
  },
];

const initialEmployees = [
  {
    id: 1,
    name: "Rahul Sharma",
    employeeCode: "EMP001",
    department: "Human Resources",
  },
  { id: 2, name: "Priya Patel", employeeCode: "EMP002", department: "Finance" },
  { id: 3, name: "Amit Kumar", employeeCode: "EMP003", department: "IT" },
  {
    id: 4,
    name: "Sneha Desai",
    employeeCode: "EMP004",
    department: "Human Resources",
  },
  {
    id: 5,
    name: "Rohit Verma",
    employeeCode: "EMP005",
    department: "Operations",
  },
  { id: 6, name: "Neha Joshi", employeeCode: "EMP006", department: "Finance" },
  { id: 7, name: "Vikas Singh", employeeCode: "EMP007", department: "IT" },
  {
    id: 8,
    name: "Anjali Mehta",
    employeeCode: "EMP008",
    department: "Recruitment",
  },
  {
    id: 9,
    name: "Karan Shah",
    employeeCode: "EMP009",
    department: "Operations",
  },
  {
    id: 10,
    name: "Pooja Nair",
    employeeCode: "EMP010",
    department: "Human Resources",
  },
];

const initialAccess = {
  1: {
    permissions: ["View Dashboard", "View My Reports"],
    subModules: ["Employee Summary", "Attendance Overview", "Leave Balance"],
  },
  2: {
    permissions: ["View Profile"],
    subModules: ["Personal Information"],
  },
  3: {
    permissions: ["View Leave"],
    subModules: ["Leave Application"],
  },
  4: {
    permissions: ["View Attendance"],
    subModules: ["Daily Attendance"],
  },
  5: {
    permissions: ["View Payroll"],
    subModules: ["Payslip"],
  },
  6: {
    permissions: ["View Performance"],
    subModules: ["Performance Reviews"],
  },
  7: {
    permissions: ["View Courses"],
    subModules: ["Employee Courses"],
  },
  8: {
    permissions: ["View Reports"],
    subModules: ["Employee Reports"],
  },
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const RoleAccess = () => {
  const [roles, setRoles] = useState(initialRoles);
  const [employees] = useState(initialEmployees);

  const [selectedRoleId, setSelectedRoleId] = useState(5);
  const [activeTab, setActiveTab] = useState("modules");

  const [searchRole, setSearchRole] = useState("");
  const [searchEmployee, setSearchEmployee] = useState("");

  const [selectedModule, setSelectedModule] = useState(1);

  const [moduleAccess, setModuleAccess] = useState({
    5: initialAccess,
  });

  const [rolePermissions, setRolePermissions] = useState({
    5: {
      readWrite: true,
      owner: false,
    },
  });

  const [assignedUsers, setAssignedUsers] = useState({
    5: [1, 2, 4, 5, 7, 9],
  });

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
  });

  // =================================================
  // SELECTED ROLE
  // =================================================

  const selectedRole = roles.find((role) => role.id === selectedRoleId);

  const currentAccess = moduleAccess[selectedRoleId] || {};

  const currentPermissions = rolePermissions[selectedRoleId] || {
    readWrite: false,
    owner: false,
  };

  const currentAssignedUsers = assignedUsers[selectedRoleId] || [];

  // =================================================
  // FILTER ROLES
  // =================================================

  const filteredRoles = useMemo(() => {
    return roles.filter((role) =>
      role.name.toLowerCase().includes(searchRole.toLowerCase()),
    );
  }, [roles, searchRole]);

  // =================================================
  // FILTER EMPLOYEES
  // =================================================

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) =>
      `${employee.name} ${employee.employeeCode} ${employee.department}`
        .toLowerCase()
        .includes(searchEmployee.toLowerCase()),
    );
  }, [employees, searchEmployee]);

  // =================================================
  // DASHBOARD STATISTICS
  // =================================================

  const totalUsers = employees.length;

  const assignedCount = Object.values(assignedUsers).reduce(
    (total, users) => total + users.length,
    0,
  );

  const activeModules = Object.values(currentAccess).filter(
    (module) => module.permissions?.length > 0 || module.subModules?.length > 0,
  ).length;

  const totalPermissions = Object.values(currentAccess).reduce(
    (total, module) =>
      total +
      (module.permissions?.length || 0) +
      (module.subModules?.length || 0),
    0,
  );

  // =================================================
  // ROLE MODAL
  // =================================================

  const openCreateRole = () => {
    setEditingRole(null);

    setRoleForm({
      name: "",
      description: "",
    });

    setShowRoleModal(true);
  };

  const openEditRole = () => {
    if (!selectedRole) return;

    setEditingRole(selectedRole);

    setRoleForm({
      name: selectedRole.name,
      description: selectedRole.description,
    });

    setShowRoleModal(true);
  };

  const saveRole = (e) => {
    e.preventDefault();

    if (!roleForm.name.trim()) return;

    if (editingRole) {
      setRoles((prev) =>
        prev.map((role) =>
          role.id === editingRole.id
            ? {
                ...role,
                name: roleForm.name.trim(),
                description: roleForm.description.trim(),
              }
            : role,
        ),
      );
    } else {
      const newRole = {
        id: Date.now(),
        name: roleForm.name.trim(),
        description: roleForm.description.trim(),
        users: 0,
        status: "Active",
      };

      setRoles((prev) => [...prev, newRole]);
      setSelectedRoleId(newRole.id);
      setModuleAccess((prev) => ({
        ...prev,
        [newRole.id]: {},
      }));
      setRolePermissions((prev) => ({
        ...prev,
        [newRole.id]: {
          readWrite: false,
          owner: false,
        },
      }));
      setAssignedUsers((prev) => ({
        ...prev,
        [newRole.id]: [],
      }));
    }

    setShowRoleModal(false);
  };

  const deleteRole = () => {
    if (!selectedRole) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedRole.name}?`,
    );

    if (!confirmed) return;

    const remainingRoles = roles.filter((role) => role.id !== selectedRoleId);

    setRoles(remainingRoles);

    if (remainingRoles.length > 0) {
      setSelectedRoleId(remainingRoles[0].id);
    }
  };

  // =================================================
  // MODULE ACCESS
  // =================================================

  const toggleModulePermission = (moduleId, permission) => {
    setModuleAccess((prev) => {
      const roleData = prev[selectedRoleId] || {};
      const moduleData = roleData[moduleId] || {
        permissions: [],
        subModules: [],
      };

      const existing = moduleData.permissions || [];

      const updated = existing.includes(permission)
        ? existing.filter((item) => item !== permission)
        : [...existing, permission];

      return {
        ...prev,
        [selectedRoleId]: {
          ...roleData,
          [moduleId]: {
            ...moduleData,
            permissions: updated,
          },
        },
      };
    });
  };

  const toggleSubModule = (moduleId, subModule) => {
    setModuleAccess((prev) => {
      const roleData = prev[selectedRoleId] || {};
      const moduleData = roleData[moduleId] || {
        permissions: [],
        subModules: [],
      };

      const existing = moduleData.subModules || [];

      const updated = existing.includes(subModule)
        ? existing.filter((item) => item !== subModule)
        : [...existing, subModule];

      return {
        ...prev,
        [selectedRoleId]: {
          ...roleData,
          [moduleId]: {
            ...moduleData,
            subModules: updated,
          },
        },
      };
    });
  };

  const toggleAllModuleAccess = (moduleId, checked) => {
    const module = moduleData.find((item) => item.id === moduleId);

    if (!module) return;

    setModuleAccess((prev) => {
      const roleData = prev[selectedRoleId] || {};

      return {
        ...prev,
        [selectedRoleId]: {
          ...roleData,
          [moduleId]: {
            permissions: checked ? [...module.permissions] : [],
            subModules: checked ? [...module.subModules] : [],
          },
        },
      };
    });
  };

  // =================================================
  // ROLE PERMISSIONS
  // =================================================

  const toggleRolePermission = (key) => {
    setRolePermissions((prev) => ({
      ...prev,
      [selectedRoleId]: {
        ...(prev[selectedRoleId] || {
          readWrite: false,
          owner: false,
        }),
        [key]: !currentPermissions[key],
      },
    }));
  };

  // =================================================
  // USER ASSIGNMENT
  // =================================================

  const toggleEmployee = (employeeId) => {
    setAssignedUsers((prev) => {
      const existing = prev[selectedRoleId] || [];

      const updated = existing.includes(employeeId)
        ? existing.filter((id) => id !== employeeId)
        : [...existing, employeeId];

      return {
        ...prev,
        [selectedRoleId]: updated,
      };
    });

    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== selectedRoleId) return role;

        const existing = assignedUsers[selectedRoleId] || [];

        return {
          ...role,
          users: existing.includes(employeeId)
            ? Math.max(0, role.users - 1)
            : role.users + 1,
        };
      }),
    );
  };

  const selectAllEmployees = () => {
    const visibleIds = filteredEmployees.map((employee) => employee.id);

    const allSelected = visibleIds.every((id) =>
      currentAssignedUsers.includes(id),
    );

    setAssignedUsers((prev) => {
      const existing = prev[selectedRoleId] || [];

      const updated = allSelected
        ? existing.filter((id) => !visibleIds.includes(id))
        : [...new Set([...existing, ...visibleIds])];

      return {
        ...prev,
        [selectedRoleId]: updated,
      };
    });

    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== selectedRoleId) return role;

        const existing = assignedUsers[selectedRoleId] || [];
        const updated = allSelected
          ? existing.filter((id) => !visibleIds.includes(id))
          : [...new Set([...existing, ...visibleIds])];

        return {
          ...role,
          users: updated.length,
        };
      }),
    );
  };

  // =================================================
  // MODULE SELECTION
  // =================================================

  const activeModule = moduleData.find(
    (module) => module.id === selectedModule,
  );

  const activeModuleAccess = currentAccess[selectedModule] || {
    permissions: [],
    subModules: [],
  };

  const moduleSelectedCount =
    (activeModuleAccess.permissions?.length || 0) +
    (activeModuleAccess.subModules?.length || 0);

  const moduleTotalCount =
    (activeModule?.permissions.length || 0) +
    (activeModule?.subModules.length || 0);

  // =================================================
  // RENDER
  // =================================================

  return (
    <div className="role-access-page">
      {/* =========================================
                HEADER
            ========================================= */}

      <div className="ra-page-header">
        <div>
          <h2>Role and Access</h2>

          <p>
            Create roles, assign module access and manage permissions with ease.
          </p>
        </div>

        <button className="ra-primary-btn" onClick={openCreateRole}>
          <FiPlus />
          Create New Role
        </button>
      </div>

      {/* =========================================
                DASHBOARD STATISTICS
            ========================================= */}

      <div className="ra-stats-grid">
        <DashboardCardGrid>
          <DashboardCard
            title="Total Roles"
            value={roles.length}
            growth="Role management"
            icon={FiUsers}
            color="blue"
          />

          <DashboardCard
            title="Total Users Assigned"
            value={totalUsers}
            growth={`${assignedCount} role assignments`}
            icon={FiUserCheck}
            color="green"
          />

          <DashboardCard
            title="Modules"
            value={moduleData.length}
            growth="All Active"
            icon={FiGrid}
            color="purple"
          />

          <DashboardCard
            title="Permissions"
            value={totalPermissions}
            growth={`Across ${activeModules} modules`}
            icon={FiShield}
            color="orange"
          />
        </DashboardCardGrid>
      </div>

      {/* =========================================
                MAIN CONTENT
            ========================================= */}

      <div className="ra-main-layout">
        {/* =====================================
                    LEFT: ROLE LIST
                ===================================== */}

        <aside className="ra-roles-panel">
          <div className="ra-panel-heading">
            <h3>Roles</h3>
          </div>

          <div className="ra-role-filters">
            <div className="ra-search-box">
              <FiSearch />

              <input
                type="text"
                placeholder="Search roles..."
                value={searchRole}
                onChange={(e) => setSearchRole(e.target.value)}
              />
            </div>

            <FormSelect defaultValue="all">
              <option value="all">All Roles</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </FormSelect>
          </div>

          <div className="ra-role-list">
            {filteredRoles.map((role) => (
              <button
                key={role.id}
                className={`ra-role-item ${
                  selectedRoleId === role.id ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedRoleId(role.id);
                  setSelectedModule(1);
                  setActiveTab("modules");
                }}
              >
                <div className="ra-role-icon">
                  {role.id === 1 ? (
                    <FiShield />
                  ) : role.id === 5 ? (
                    <FiUser />
                  ) : (
                    <FiUsers />
                  )}
                </div>

                <div className="ra-role-info">
                  <strong>{role.name}</strong>
                  <span>{role.description}</span>
                </div>

                <div className="ra-role-meta">
                  <small>{role.users} users</small>
                  <span className="ra-status">{role.status}</span>
                </div>

                <FiChevronRight className="ra-role-arrow" />
              </button>
            ))}

            {filteredRoles.length === 0 && (
              <div className="ra-empty-state">No roles found.</div>
            )}
          </div>
        </aside>

        {/* =====================================
                    RIGHT: ROLE DETAILS
                ===================================== */}

        <main className="ra-details-panel">
          {selectedRole ? (
            <>
              {/* ROLE INFORMATION */}

              <div className="ra-role-details-header">
                <div className="ra-selected-role">
                  <div className="ra-selected-role-icon">
                    <FiUser />
                  </div>

                  <div>
                    <h3>{selectedRole.name}</h3>
                    <p>{selectedRole.description}</p>
                  </div>
                </div>

                <div className="ra-role-actions">
                  <button className="ra-outline-btn" onClick={openEditRole}>
                    <FiEdit2 />
                    Edit Role
                  </button>

                  <button className="ra-delete-btn" onClick={deleteRole}>
                    <FiTrash2 />
                    Delete Role
                  </button>
                </div>
              </div>

              {/* ROLE SUMMARY */}

              <div className="ra-role-summary">
                <div>
                  <span>Role Name</span>
                  <strong>{selectedRole.name}</strong>
                </div>

                <div>
                  <span>Description</span>
                  <strong>{selectedRole.description}</strong>
                </div>

                <div>
                  <span>Users Assigned</span>
                  <strong>{currentAssignedUsers.length}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    <span className="ra-status">{selectedRole.status}</span>
                  </strong>
                </div>
              </div>

              {/* TABS */}

              <div className="ra-tabs">
                <button
                  className={activeTab === "modules" ? "active" : ""}
                  onClick={() => setActiveTab("modules")}
                >
                  <FiGrid />
                  Module Access
                </button>

                <button
                  className={activeTab === "permissions" ? "active" : ""}
                  onClick={() => setActiveTab("permissions")}
                >
                  <FiShield />
                  Permissions
                </button>

                <button
                  className={activeTab === "users" ? "active" : ""}
                  onClick={() => setActiveTab("users")}
                >
                  <FiUsers />
                  User Assignment
                  <span className="ra-tab-count">
                    {currentAssignedUsers.length}
                  </span>
                </button>
              </div>

              {/* =================================
                                TAB 1: MODULE ACCESS
                            ================================= */}

              {activeTab === "modules" && (
                <div className="ra-module-layout">
                  <div className="ra-module-sidebar">
                    {moduleData.map((module) => {
                      const Icon = module.icon;

                      const access = currentAccess[module.id] || {
                        permissions: [],
                        subModules: [],
                      };

                      const count =
                        access.permissions.length + access.subModules.length;

                      const total =
                        module.permissions.length + module.subModules.length;

                      return (
                        <button
                          key={module.id}
                          className={`ra-module-item ${
                            selectedModule === module.id ? "active" : ""
                          }`}
                          onClick={() => setSelectedModule(module.id)}
                        >
                          <Icon />

                          <span>{module.name}</span>

                          <small>
                            {count}/{total}
                          </small>
                        </button>
                      );
                    })}
                  </div>

                  {/* MODULE SETTINGS */}

                  <div className="ra-module-settings">
                    {activeModule && (
                      <>
                        <div className="ra-module-title">
                          <div className="ra-module-title-info">
                            <div className="ra-module-title-icon">
                              {React.createElement(activeModule.icon)}
                            </div>

                            <div>
                              <h4>{activeModule.name}</h4>
                              <p>{activeModule.description}</p>
                            </div>
                          </div>

                          <label className="ra-switch">
                            <input
                              type="checkbox"
                              checked={moduleSelectedCount === moduleTotalCount}
                              onChange={(e) =>
                                toggleAllModuleAccess(
                                  selectedModule,
                                  e.target.checked,
                                )
                              }
                            />
                            <span></span>
                          </label>
                        </div>

                        {/* PERMISSIONS */}

                        <div className="ra-module-section">
                          <h5>Permissions</h5>

                          <div className="ra-checkbox-list">
                            {activeModule.permissions.map((permission) => (
                              <label
                                className="ra-checkbox-row"
                                key={permission}
                              >
                                <input
                                  type="checkbox"
                                  checked={activeModuleAccess.permissions.includes(
                                    permission,
                                  )}
                                  onChange={() =>
                                    toggleModulePermission(
                                      selectedModule,
                                      permission,
                                    )
                                  }
                                />

                                <span className="ra-custom-check"></span>

                                <span>{permission}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* SUBMODULES */}

                        <div className="ra-module-section">
                          <h5>Sub Modules</h5>

                          <div className="ra-checkbox-list">
                            {activeModule.subModules.map((subModule) => (
                              <label
                                className="ra-checkbox-row"
                                key={subModule}
                              >
                                <input
                                  type="checkbox"
                                  checked={activeModuleAccess.subModules.includes(
                                    subModule,
                                  )}
                                  onChange={() =>
                                    toggleSubModule(selectedModule, subModule)
                                  }
                                />

                                <span className="ra-custom-check"></span>

                                <span>{subModule}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="ra-info-message">
                          <FiInfo />
                          Changes will be applied to all users assigned to this
                          role after saving.
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* =================================
                                TAB 2: PERMISSIONS
                            ================================= */}

              {activeTab === "permissions" && (
                <div className="ra-tab-content">
                  <div className="ra-tab-heading">
                    <div>
                      <h4>Role Permissions</h4>
                      <p>Configure the access level for this role.</p>
                    </div>
                  </div>

                  <div className="ra-permission-cards">
                    <div className="ra-permission-card">
                      <div className="ra-permission-icon blue">
                        <FiLock />
                      </div>

                      <div className="ra-permission-info">
                        <h4>Read and Write</h4>
                        <p>
                          Allow users to view and modify records within their
                          permitted modules.
                        </p>
                      </div>

                      <label className="ra-checkbox-row ra-permission-checkbox">
                        <input
                          type="checkbox"
                          checked={currentPermissions.readWrite}
                          onChange={() => toggleRolePermission("readWrite")}
                        />
                        <span className="ra-custom-check"></span>
                      </label>
                    </div>

                    <div className="ra-permission-card">
                      <div className="ra-permission-icon purple">
                        <FiShield />
                      </div>

                      <div className="ra-permission-info">
                        <h4>Owner</h4>
                        <p>
                          Grant ownership-level access and control over assigned
                          records.
                        </p>
                      </div>

                      <label className="ra-checkbox-row ra-permission-checkbox">
                        <input
                          type="checkbox"
                          checked={currentPermissions.owner}
                          onChange={() => toggleRolePermission("owner")}
                        />
                        <span className="ra-custom-check"></span>
                      </label>
                    </div>
                  </div>

                  <div className="ra-info-message">
                    <FiInfo />
                    These permissions apply to the selected role.
                  </div>
                </div>
              )}

              {/* =================================
                                TAB 3: USER ASSIGNMENT
                            ================================= */}

              {activeTab === "users" && (
                <div className="ra-tab-content">
                  <div className="ra-tab-heading">
                    <div>
                      <h4>Assign Employees</h4>
                      <p>
                        Select employees who should be assigned to the{" "}
                        {selectedRole.name} role.
                      </p>
                    </div>

                    <span className="ra-assigned-badge">
                      {currentAssignedUsers.length} Assigned
                    </span>
                  </div>

                  <div className="ra-user-toolbar">
                    <div className="ra-search-box">
                      <FiSearch />

                      <input
                        type="text"
                        placeholder="Search employees by name, code or department..."
                        value={searchEmployee}
                        onChange={(e) => setSearchEmployee(e.target.value)}
                      />

                      {searchEmployee && (
                        <button
                          onClick={() => setSearchEmployee("")}
                          aria-label="Clear employee search"
                        >
                          <FiX />
                        </button>
                      )}
                    </div>

                    <button
                      className="ra-outline-btn"
                      onClick={selectAllEmployees}
                    >
                      Select All
                    </button>
                  </div>

                  <div className="ra-employee-list">
                    <div className="ra-employee-list-header">
                      <span>Employee</span>
                      <span>Department</span>
                      <span>Assignment</span>
                    </div>

                    {filteredEmployees.map((employee) => {
                      const isAssigned = currentAssignedUsers.includes(
                        employee.id,
                      );

                      return (
                        <label
                          key={employee.id}
                          className={`ra-employee-row ${
                            isAssigned ? "assigned" : ""
                          }`}
                        >
                          <div className="ra-employee-name">
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={() => toggleEmployee(employee.id)}
                            />

                            <span className="ra-custom-check"></span>

                            <div className="ra-avatar">
                              {employee.name
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")}
                            </div>

                            <div>
                              <strong>{employee.name}</strong>
                              <small>{employee.employeeCode}</small>
                            </div>
                          </div>

                          <span className="ra-employee-department">
                            {employee.department}
                          </span>

                          <span
                            className={`ra-assignment-status ${
                              isAssigned ? "assigned" : ""
                            }`}
                          >
                            {isAssigned ? "Assigned" : "Not Assigned"}
                          </span>
                        </label>
                      );
                    })}

                    {filteredEmployees.length === 0 && (
                      <div className="ra-empty-state">No employees found.</div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="ra-empty-state">
              Select a role to manage its access.
            </div>
          )}

          {/* FOOTER */}

          {selectedRole && (
            <div className="ra-details-footer">
              <span>
                <FiInfo />
                Remember to save your changes.
              </span>

              <button
                className="ra-primary-btn"
                onClick={() =>
                  alert(
                    "UI changes are ready. Connect the save API to persist them.",
                  )
                }
              >
                Save Changes
              </button>
            </div>
          )}
        </main>
      </div>

      {/* =========================================
                CREATE / EDIT ROLE OFFCANVAS
            ========================================= */}

      <FormOffcanvas
        show={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title={editingRole ? "Edit Role" : "Create New Role"}
        width="520px"
        footer={
          <>
            <button
              type="button"
              className="ra-cancel-btn"
              onClick={() => setShowRoleModal(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              form="ra-role-form"
              className="ra-primary-btn"
            >
              {editingRole ? "Update Role" : "Create Role"}
            </button>
          </>
        }
      >
        <form id="ra-role-form" onSubmit={saveRole}>
          <div className="ra-form-group">
            <label>
              Role Name <span>*</span>
            </label>

            <input
              type="text"
              placeholder="Enter role name"
              value={roleForm.name}
              onChange={(e) =>
                setRoleForm({
                  ...roleForm,
                  name: e.target.value,
                })
              }
              required
              autoFocus
            />
          </div>

          <div className="ra-form-group">
            <label>Description</label>

            <textarea
              placeholder="Enter role description"
              rows="4"
              value={roleForm.description}
              onChange={(e) =>
                setRoleForm({
                  ...roleForm,
                  description: e.target.value,
                })
              }
            />
          </div>
        </form>
      </FormOffcanvas>
    </div>
  );
};

export default RoleAccess;
