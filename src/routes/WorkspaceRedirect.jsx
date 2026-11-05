import { Navigate } from "react-router-dom";
import useAuthStore from "../auth/store/authStore";

const WorkspaceRedirect = () => {
  const { isAuthenticated, workspace } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={workspace === "admin" ? "/admin/coresettings/dashboard" : "/dashboard"}
      replace
    />
  );
};

export default WorkspaceRedirect;