import { useEffect } from "react";

import AppRoutes from "./routes/AppRoutes";
import useAuthStore from "./auth/store/authStore";

function App() {
    const initializeAuth = useAuthStore(
        (state) => state.initializeAuth
    );

    const isInitialized = useAuthStore(
        (state) => state.isInitialized
    );

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    if (!isInitialized) {
        return null;
    }

    return <AppRoutes />;
}

export default App;