
import axios from "axios";

// =====================================================
// MENU API CLIENT
// =====================================================

const menuClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL_MENU,
    timeout: 30000,
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

menuClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// =====================================================
// GET MENU BY MODULE ID
// =====================================================

export const getMenuByModuleId = async (moduleId, roleId) => {
    const response = await menuClient.get(
        `/Menu/GetMenuByID/${moduleId}`,
        {
            params: {
                RoleId: roleId,
            },
        }
    );

    return response.data;
};

export default menuClient;
