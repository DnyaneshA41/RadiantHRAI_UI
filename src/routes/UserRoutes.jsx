import { Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import UserLayout from "../layout/user/UserLayout";
import WelcomeBoard from "../user/onboarding/pages/WelcomeBoard/WelcomeBoard";
import AttendanceDashboard from "../user/me/pages/Attendance/AttendanceDashboard";
import LeaveDashboard from "../user/me/pages/Leave/LeaveDashboard";

// =====================================================
// USER PAGES
// =====================================================

const Dashboard = () => (
  <div>
    <h1>Dashboard</h1>
    <p>Dashboard page</p>
  </div>
);

const Preboarding = () => (
  <div>
    <h1>Preboarding</h1>
    <p>Preboarding page</p>
  </div>
);


const BlockSuspend = () => (
  <div>
    <h1>Block or Suspend</h1>
    <p>Block or Suspend page</p>
  </div>
);

const ReassignLeads = () => (
  <div>
    <h1>Reassign Leads</h1>
    <p>Reassign Leads page</p>
  </div>
);

const InactiveEmployees = () => (
  <div>
    <h1>Inactive Employees</h1>
    <p>Inactive Employees page</p>
  </div>
);

const ExecutiveOverview = () => (
  <div>
    <h1>Executive Overview</h1>
    <p>Executive Overview page</p>
  </div>
);


const Payroll = () => (
  <div>
    <h1>Payroll</h1>
    <p>Payroll page</p>
  </div>
);

// =====================================================
// USER ROUTES
// =====================================================

const UserRoutes = (
  <Route
    element={
      <ProtectedRoute allowedRoles={["User"]}>
        <UserLayout />
      </ProtectedRoute>
    }
  >
    <Route path="/dashboard" element={<Dashboard />} />

    <Route path="/preboarding" element={<Preboarding />} />

    <Route path="/onboarding" element={<WelcomeBoard />} />

    <Route
      path="/onboarding/block-suspend"
      element={<BlockSuspend />}
    />

    <Route
      path="/onboarding/reassign-leads"
      element={<ReassignLeads />}
    />

    <Route
      path="/onboarding/inactive-employees"
      element={<InactiveEmployees />}
    />

    <Route path="/me" element={<AttendanceDashboard />} />
    <Route path="/me/leave" element={<LeaveDashboard />} />

    <Route
      path="/executive-overview"
      element={<ExecutiveOverview />}
    />

    <Route path="/payroll" element={<Payroll />} />
  </Route>
);

export default UserRoutes;