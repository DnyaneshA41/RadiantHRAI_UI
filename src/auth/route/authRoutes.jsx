import { Route } from "react-router-dom";

import Login from "../pages/Login/Login";
// import PublicRoute from "../../routes/PublicRoute";

const authRoutes = (
    <>
        <Route
            path="/login"
            element={
                // <PublicRoute>
                    <Login />
                // </PublicRoute>
            }
        />
    </>
);

export default authRoutes;