import axios from "axios";

const MODULE_BASE_URLS = {
  coreSettings: import.meta.env.VITE_API_BASE_URL_MODULES,
  onboarding: import.meta.env.VITE_API_BASE_URL_ONBOARDING,
};

const coreSettingsClient = axios.create({
  baseURL: MODULE_BASE_URLS.coreSettings,
  timeout: 30000,
});

// Add authentication token and select the module base URL.
coreSettingsClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Select the base URL using config.module.
    if (config.module) {
      const moduleBaseURL = MODULE_BASE_URLS[config.module];

      if (!moduleBaseURL) {
        return Promise.reject(
          new Error(`Unknown API module: ${config.module}`)
        );
      }

      config.baseURL = moduleBaseURL;
      delete config.module;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    } else if (config.data !== undefined && config.data !== null) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default coreSettingsClient;