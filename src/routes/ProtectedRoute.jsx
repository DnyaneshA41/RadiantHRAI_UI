import { Navigate, useLocation } from "react-router-dom";

import useAuthStore from "../auth/store/authStore";

const ProtectedRoute = ({ children }) => {
    const location = useLocation();

    const {
        isAuthenticated,
    } = useAuthStore();

    /* =========================================================
       NOT AUTHENTICATED
    ========================================================= */

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

  

    return children;
};

export default ProtectedRoute;