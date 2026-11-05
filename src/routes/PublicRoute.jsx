import { Navigate } from "react-router-dom";

import useAuthStore from "../auth/store/authStore";

const PublicRoute = ({ children }) => {
    const {
        isAuthenticated,
        user,
    } = useAuthStore();

    if (isAuthenticated) {
        if (
            String(user?.role).toLowerCase() === "admin"
        ) {
            return (
                <Navigate
                    to="/admin/dashboard"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return children;
};

export default PublicRoute;