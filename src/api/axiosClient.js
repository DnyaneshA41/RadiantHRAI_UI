import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL_LOGIN,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});
console.log("LOGIN API BASE URL:", axiosClient.defaults.baseURL);

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("auth");
            localStorage.removeItem("user");
        }

        return Promise.reject(error);
    }
);

export default axiosClient;