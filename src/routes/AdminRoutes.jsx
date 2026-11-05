import { Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layout/admin/AdminLayout";

//core settings
import OnboardingDashboard from "../admin/onboarding/pages/Dashboard/OnboardingDashboard.jsx";
import CoreSettingsDashboard from "../admin/coresetting/pages/Dashboard/CoreSettingsDashboard.jsx";

import Organization from "../admin/coresetting/pages/Organization/Organization";
import OrganizationList from "../admin/coresetting/pages/Organization/OrganizationList";

import Entity from "../admin/coresetting/pages/Entity/Entity";
import EntityList from "../admin/coresetting/pages/Entity/EntityList";

import SubEntity from "../admin/coresetting/pages/SubEntity/SubEntity";
import SubEntityList from "../admin/coresetting/pages/SubEntity/SubEntityList";

import Department from "../admin/coresetting/pages/Department/Department";
import DepartmentList from "../admin/coresetting/pages/Department/DepartmentList";

import Designation from "../admin/coresetting/pages/Designition/Designition";
import DesignationList from "../admin/coresetting/pages/Designition/DesignitionList";

import Grade from "../admin/coresetting/pages/Grade/Grade";
import GradeList from "../admin/coresetting/pages/Grade/GradeList";

import State from "../admin/coresetting/pages/State/State";
import StateList from "../admin/coresetting/pages/State/StateList";

import Country from "../admin/coresetting/pages/Country/Country";
import CountryList from "../admin/coresetting/pages/Country/CountryList";

import SubDepartment from "../admin/coresetting/pages/SubDepartment/SubDepartment";
import SubDepartmentList from "../admin/coresetting/pages/SubDepartment/SubDepartmentList";

import Cell from "../admin/coresetting/pages/Cell/Cell";
import CellList from "../admin/coresetting/pages/Cell/CellList.jsx";

// Onboarding

import Type from "../admin/onboarding/pages/Type/Type.jsx";
import TypeList from "../admin/onboarding/pages/Type/TypeList.jsx";

import Group from "../admin/onboarding/pages/Group/Group.jsx";
import GroupList from "../admin/onboarding/pages/Group/GroupList.jsx";

import Level from "../admin/onboarding/pages/Level/Level.jsx";
import LevelList from "../admin/onboarding/pages/Level/LevelList.jsx";

import Verification from "../admin/onboarding/pages/Verification/Verification.jsx";
import VerificationList from "../admin/onboarding/pages/Verification/VerificationList.jsx";

import Qualification from "../admin/onboarding/pages/Qualificatoin/Qualification.jsx";
import QualificationList from "../admin/onboarding/pages/Qualificatoin/QualificationList.jsx";

//authorization

import RoleAccess from "../admin/authorization/pages/roleNaccess.jsx";

// =====================================================
// ADMIN PAGES
// =====================================================

const AdminDashboard = () => (
  <div>
    <h1>Admin Dashboard</h1>
    <p>Admin dashboard page</p>
  </div>
);

const AdminEmployees = () => (
  <div>
    <h1>Employee Management</h1>
    <p>Employee management page</p>
  </div>
);

const AdminEmployeeList = () => (
  <div>
    <h1>Employees</h1>
    <p>Employees page</p>
  </div>
);

const AdminNewJoiners = () => (
  <div>
    <h1>New Joiners</h1>
    <p>New joiners page</p>
  </div>
);

const AdminExitEmployees = () => (
  <div>
    <h1>Exit Employees</h1>
    <p>Exit employees page</p>
  </div>
);

const AdminGrade = () => (
  <div>
    <h1>Grade</h1>
    <p>Designation configuration page</p>
  </div>
);

// ATTENDANCE

const AdminAttendance = () => (
  <div>
    <h1>Attendance</h1>
    <p>Attendance administration page</p>
  </div>
);

const AdminDailyAttendance = () => (
  <div>
    <h1>Daily Attendance</h1>
    <p>Daily attendance page</p>
  </div>
);

const AdminRegularization = () => (
  <div>
    <h1>Regularization</h1>
    <p>Attendance regularization page</p>
  </div>
);

const AdminShift = () => (
  <div>
    <h1>Shift</h1>
    <p>Shift management page</p>
  </div>
);

// LEAVE

const AdminLeave = () => (
  <div>
    <h1>Leave</h1>
    <p>Leave administration page</p>
  </div>
);

const AdminLeaveTypes = () => (
  <div>
    <h1>Leave Types</h1>
    <p>Leave types page</p>
  </div>
);

const AdminLeavePolicy = () => (
  <div>
    <h1>Leave Policy</h1>
    <p>Leave policy page</p>
  </div>
);

const AdminLeaveApprovals = () => (
  <div>
    <h1>Approvals</h1>
    <p>Leave approvals page</p>
  </div>
);

const AdminHoliday = () => (
  <div>
    <h1>Holiday</h1>
    <p>Holiday management page</p>
  </div>
);

// PAYROLL

const AdminPayroll = () => (
  <div>
    <h1>Payroll</h1>
    <p>Payroll administration page</p>
  </div>
);

const AdminSalary = () => (
  <div>
    <h1>Salary</h1>
    <p>Salary management page</p>
  </div>
);

const AdminPayrollProcess = () => (
  <div>
    <h1>Payroll Process</h1>
    <p>Payroll process page</p>
  </div>
);

const AdminPayslip = () => (
  <div>
    <h1>Payslip</h1>
    <p>Payslip management page</p>
  </div>
);

// REPORTS

const AdminReports = () => (
  <div>
    <h1>Reports</h1>
    <p>Reports page</p>
  </div>
);

const AdminEmployeeReports = () => (
  <div>
    <h1>Employee Reports</h1>
    <p>Employee reports page</p>
  </div>
);

const AdminAttendanceReports = () => (
  <div>
    <h1>Attendance Reports</h1>
    <p>Attendance reports page</p>
  </div>
);

const AdminLeaveReports = () => (
  <div>
    <h1>Leave Reports</h1>
    <p>Leave reports page</p>
  </div>
);

const AdminPayrollReports = () => (
  <div>
    <h1>Payroll Reports</h1>
    <p>Payroll reports page</p>
  </div>
);

// SYSTEM CONFIGURATION

const AdminSystemConfiguration = () => (
  <div>
    <h1>System Configuration</h1>
    <p>System configuration page</p>
  </div>
);

const AdminGeneral = () => (
  <div>
    <h1>General</h1>
    <p>General configuration page</p>
  </div>
);

const AdminUserManagement = () => (
  <div>
    <h1>User Management</h1>
    <p>User management page</p>
  </div>
);

const AdminRolesPermissions = () => (
  <div>
    <h1>Role & Permission</h1>
    <p>Role and permission page</p>
  </div>
);

// =====================================================
// ADMIN ROUTES
// =====================================================

const AdminRoutes = (
  <Route
    element={
      <ProtectedRoute allowedRoles={["Admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    }
  >
    {/* DASHBOARD */}

    <Route path="/admin" element={<CoreSettingsDashboard />} />

    {/* Onboarding */}
    <Route path="/admin/onboarding/dashboard" element={<OnboardingDashboard />} />
    <Route path="/admin/onboarding/type" element={<TypeList />} />
    <Route path="/admin/onboarding/type/add" element={<Type />} />

    <Route path="/admin/onboarding/group" element={<GroupList />} />
    <Route path="/admin/onboarding/group/add" element={<Group />} />

    <Route path="/admin/onboarding/level" element={<LevelList />} />
    <Route path="/admin/onboarding/level/add" element={<Level />} />

    <Route
      path="/admin/onboarding/verification"
      element={<VerificationList />}
    />
    <Route
      path="/admin/onboarding/verification/add"
      element={<Verification />}
    />

    <Route
      path="/admin/onboarding/qualification"
      element={<QualificationList />}
    />
    <Route
      path="/admin/onboarding/qualification/add"
      element={<Qualification />}
    />

    <Route path="/admin/employees/list" element={<AdminEmployeeList />} />

    {/* ORGANIZATION */}
    <Route
      path="/admin/coresettings/dashboard"
      element={<CoreSettingsDashboard />}
    />
    <Route
      path="/admin/coresettings/organization"
      element={<OrganizationList />}
    />
    <Route
      path="/admin/coresettings/organization/add"
      element={<Organization />}
    />

    <Route path="/admin/coresettings/entity" element={<EntityList />} />
    <Route path="/admin/coresettings/entity/add" element={<Entity />} />

    <Route path="/admin/coresettings/sub-entity" element={<SubEntityList />} />
    <Route path="/admin/coresettings/subentity/add" element={<SubEntity />} />

    <Route path="/admin/coresettings/department" element={<DepartmentList />} />
    <Route path="/admin/coresettings/department/add" element={<Department />} />

    <Route
      path="/admin/coresettings/designation"
      element={<DesignationList />}
    />
    <Route
      path="/admin/coresettings/designation/add"
      element={<Designation />}
    />

    <Route path="/admin/coresettings/grade" element={<GradeList />} />
    <Route path="/admin/coresettings/grade/add" element={<Grade />} />

    <Route path="/admin/coresettings/state" element={<StateList />} />
    <Route path="/admin/coresettings/state/add" element={<State />} />

    <Route path="/admin/coresettings/country" element={<CountryList />} />
    <Route path="/admin/coresettings/country/add" element={<Country />} />

    <Route
      path="/admin/coresettings/sub-department"
      element={<SubDepartmentList />}
    />
    <Route
      path="/admin/coresettings/subdepartment/add"
      element={<SubDepartment />}
    />

    <Route path="/admin/coresettings/cell" element={<CellList />} />
    <Route path="/admin/coresettings/cell/add" element={<Cell />} />

    <Route
    path="/admin/authorization/dashboard"
    element={<div>Authorization Dashboard</div>}
/>
    <Route path="/admin/authorization/roleNaccess" element={<RoleAccess />} />

    {/* ATTENDANCE */}

    <Route path="/admin/attendance" element={<AdminAttendance />} />

    <Route path="/admin/attendance/daily" element={<AdminDailyAttendance />} />

    <Route
      path="/admin/attendance/regularization"
      element={<AdminRegularization />}
    />

    <Route path="/admin/attendance/shift" element={<AdminShift />} />

    {/* LEAVE */}

    <Route path="/admin/leave" element={<AdminLeave />} />

    <Route path="/admin/leave/types" element={<AdminLeaveTypes />} />

    <Route path="/admin/leave/policy" element={<AdminLeavePolicy />} />

    <Route path="/admin/leave/approvals" element={<AdminLeaveApprovals />} />

    <Route path="/admin/leave/holiday" element={<AdminHoliday />} />

    {/* PAYROLL */}

    <Route path="/admin/payroll" element={<AdminPayroll />} />

    <Route path="/admin/payroll/salary" element={<AdminSalary />} />

    <Route path="/admin/payroll/process" element={<AdminPayrollProcess />} />

    <Route path="/admin/payroll/payslip" element={<AdminPayslip />} />

    {/* REPORTS */}

    <Route path="/admin/reports" element={<AdminReports />} />

    <Route path="/admin/reports/employees" element={<AdminEmployeeReports />} />

    <Route
      path="/admin/reports/attendance"
      element={<AdminAttendanceReports />}
    />

    <Route path="/admin/reports/leave" element={<AdminLeaveReports />} />

    <Route path="/admin/reports/payroll" element={<AdminPayrollReports />} />

    {/* SYSTEM CONFIGURATION */}

    <Route
      path="/admin/system-configuration"
      element={<AdminSystemConfiguration />}
    />

    <Route
      path="/admin/system-configuration/general"
      element={<AdminGeneral />}
    />

    <Route
      path="/admin/system-configuration/users"
      element={<AdminUserManagement />}
    />

    <Route
      path="/admin/system-configuration/roles"
      element={<AdminRolesPermissions />}
    />
  </Route>
);

export default AdminRoutes;
