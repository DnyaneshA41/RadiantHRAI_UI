import axiosClient from "../../api/axiosClient";

export const loginApi = async ({ clientId, id, pass, sourceID }) => {
    const response = await axiosClient.post("/Login/login", {
        clientId,
        id,
        pass,
        sourceID,
    });

    return response.data;
};