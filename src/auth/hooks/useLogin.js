import { useState } from "react";
import { loginApi } from "../services/loginApi";

const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const login = async ({ clientId, id, pass,sourceID }) => {
        setLoading(true);
        setError("");

        try {
            const response = await loginApi({
                clientId,
                id,
                pass,
                sourceID,
            });

            return response;
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Login failed. Please try again.";

            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        login,
        loading,
        error,
    };
};

export default useLogin;