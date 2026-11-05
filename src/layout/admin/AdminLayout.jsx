import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import PageTransition from "../../common/components/Animations/OverallPageTransition";
import Sidebar from "../../common/components/Sidebar/Sidebar";
import Header from "../../common/components/Header/Header";
import ModuleNav from "../../common/components/ModuleNav/ModuleNav";

import "../../layout/RadiantHRLayout.css";

import "../../common/components/Sidebar/Sidebar.css";
import "../../common/components/Header/Header.css";
import "../../common/components/ModuleNav/ModuleNav.css";

function AdminLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="hrms-layout">

            {/* =====================================================
                SIDEBAR
            ====================================================== */}

            <Sidebar
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                mode="admin"
            />

            {/* =====================================================
                MAIN
            ====================================================== */}

            <div className="hrms-main">

                {/* =================================================
                    HEADER
                ================================================== */}

                <Header
                    setMobileOpen={setMobileOpen}
                />

                {/* =================================================
                    MODULE NAV
                ================================================== */}

                <ModuleNav
                    mode="admin"
                />

                {/* =================================================
                    CONTENT
                ================================================== */}

                <main
                    className={`hrms-content ${
                        location.pathname === "/admin"
                            ? "dashboard-content"
                            : ""
                    }`}
                >
                   <AnimatePresence mode="wait">
                    <PageTransition key={location.pathname}>
                        <Outlet />
                    </PageTransition>
                </AnimatePresence>
                </main>

            </div>

        </div>
    );
}

export default AdminLayout;