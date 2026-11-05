import { Routes, Route } from "react-router-dom";

import authRoutes from "../auth/route/authRoutes";

import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";
import WorkspaceRedirect from "./WorkspaceRedirect";
import MenuBuilder from "../MenuBuilder/MenuBuilder"

// =====================================================
// MAIN APP ROUTES
// =====================================================

const AppRoutes = () => {
  return (
    <Routes>
      {/* AUTHENTICATION ROUTES */}

      {authRoutes}

      {/* USER PORTAL */}

      {UserRoutes}

      {/* ADMIN PORTAL */}

      {AdminRoutes}

      <Route
        path="/menu-builder"
        element={<MenuBuilder />}
      />

      {/* ROOT REDIRECT */}

      <Route
        path="/"
        element={<WorkspaceRedirect />}
      />

      {/* FALLBACK */}

      <Route
        path="*"
        element={<WorkspaceRedirect />}
      />
    </Routes>
  );
};

export default AppRoutes;