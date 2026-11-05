
import { useMemo, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import useAuthStore from "../../../auth/store/authStore";
import useMenuStore from "../../../common/store/menuStore";

import "./Sidebar.css";

import {
    FiHome,
    FiUserPlus,
    FiUserCheck,
    FiClock,
    FiCalendar,
    FiDollarSign,
    FiBarChart2,
    FiSettings,
    FiX,
    FiUser,
    FiFolder,
    FiShield,
    FiFileText,
} from "react-icons/fi";

import SettingsPanel from "../Settings/SettingsPanel";

const MENU_ICONS = {
    FiHome,
    FiUserPlus,
    FiUserCheck,
    FiClock,
    FiCalendar,
    FiDollarSign,
    FiBarChart2,
    FiSettings,
    FiUser,
    FiFolder,
    FiShield,
    FiFileText,
};

const MENU_ROUTES = {
    1: {
        user: "/coresettings",
        admin: "/admin/coresettings",
    },

    2: {
        user: "/authorization/roles",
        admin: "/admin/authorization/roleNaccess",
    },

    3: {
        user: "/onboarding",
        admin: "/admin/onboarding",
    },

    4: {
        user: "/attendance",
        admin: "/admin/attendance",
    },

    5: {
        user: "/leave",
        admin: "/admin/leave",
    },

    6: {
        user: "/payroll",
        admin: "/admin/payroll",
    },

    7: {
        user: "/reports",
        admin: "/admin/reports",
    },
};

const getMenuIcon = (iconName) => {
    return MENU_ICONS[iconName] || FiFolder;
};

const getMenuRoute = (menu, mode) => {
    const menuId = Number(menu.ID);

    const configuredRoute = MENU_ROUTES[menuId]?.[mode];

    if (configuredRoute) {
        return configuredRoute;
    }

    const slug = String(menu.MenuName || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

    return mode === "admin"
        ? `/admin/${slug}`
        : `/${slug}`;
};

function Sidebar({
    mobileOpen = false,
    setMobileOpen,
    mode = "user",
}) {
    const [showSettings, setShowSettings] = useState(false);

    const [activeModuleId, setActiveModuleId] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    /* =====================================================
       AUTH STORE
    ===================================================== */

    const setWorkspace = useAuthStore(
        (state) => state.setWorkspace
    );

    const menus = useAuthStore(
        (state) => state.menus
    );

    const roleId = useAuthStore(
        (state) => state.roleId
    );

    /* =====================================================
       MENU STORE
    ===================================================== */

    const fetchModuleMenu = useMenuStore(
        (state) => state.fetchModuleMenu
    );

    const loadingModules = useMenuStore(
        (state) => state.loadingModules
    );

    /* =====================================================
       SIDEBAR MODULE ITEMS
    ===================================================== */

    const menuItems = useMemo(() => {
        if (!Array.isArray(menus)) {
            return [];
        }

        return menus
            .filter((menu) => menu?.ID && menu?.MenuName)
            .map((menu) => ({
                id: menu.ID,
                label: menu.MenuName,
                path: getMenuRoute(menu, mode),
                icon: getMenuIcon(menu.Icon),
            }));
    }, [menus, mode]);

    /* =====================================================
       ADMIN MODULE CLICK
    ===================================================== */

    const handleAdminModuleClick = async (moduleId) => {
        if (!moduleId || !roleId) {
            console.error("Module ID or Role ID is missing.");
            return;
        }

        const cacheKey = `${roleId}_${moduleId}`;

        setActiveModuleId(moduleId);

        try {
            const menuData = await fetchModuleMenu(
                moduleId,
                roleId
            );

            if (!Array.isArray(menuData) || menuData.length === 0) {
                console.error("No menu data returned for this module.");
                return;
            }

            // Find the module dashboard returned by the API.
            const dashboard = menuData.find(
                (item) =>
                    Number(item.screenSequence) === 0 &&
                    Number(item.screenSubID) === 0 &&
                    item.isAssigned === true
            );

            if (!dashboard?.screenName) {
                console.error(
                    "Dashboard route was not found in the module menu response."
                );
                return;
            }

            navigate(dashboard.screenName);
        
            setMobileOpen?.(false);
        } catch (error) {
            console.error("Unable to open Admin module:", error);
        } finally {
            setActiveModuleId(null);
        }
    };

    /* =====================================================
       SWITCH USER / ADMIN PANEL
    ===================================================== */

const handlePanelSwitch = () => {
    setShowSettings(false);

    if (mode === "admin") {
        setWorkspace("user");
        navigate("/dashboard");
    } else {
        setWorkspace("admin");
        navigate("/admin/coresettings/dashboard");
    }
};

    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const handleMenuClick = () => {
        setMobileOpen?.(false);
    };

    /* =====================================================
       SETTINGS
    ===================================================== */

    const handleSettingsOpen = () => {
        setShowSettings(true);
    };

    const handleSettingsClose = () => {
        setShowSettings(false);
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <>
            {/* MOBILE OVERLAY */}

            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileOpen?.(false)}
                />
            )}

            {/* SIDEBAR */}

            <aside
                className={`hrms-sidebar ${
                    mobileOpen ? "mobile-sidebar-open" : ""
                }`}
            >
                {/* MOBILE CLOSE */}

                <button
                    type="button"
                    className="sidebar-mobile-close"
                    onClick={() => setMobileOpen?.(false)}
                    aria-label="Close navigation"
                    title="Close menu"
                >
                    <FiX size={20} />
                </button>

                {/* LOGO */}

                <div className="sidebar-logo-area">
                    <img
                        src="/CompanyLogo.png"
                        alt="Company Logo"
                        className="sidebar-logo"
                        onError={(event) => {
                            event.currentTarget.style.display = "none";
                        }}
                    />
                </div>

            {/* MAIN MENU */}

<nav className="sidebar-menu">

    {/* USER DASHBOARD - KEEP EXISTING BEHAVIOUR */}

    {mode === "user" && (
        <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={handleMenuClick}
        >
            <span className="sidebar-icon">
                <FiHome size={23} strokeWidth={2} />
            </span>

            <span className="sidebar-label">
                Dashboard
            </span>
        </NavLink>
    )}

    {/* =====================================================
    ME - HARDCODED USER MAIN MENU
===================================================== */}

{mode === "user" && (
    <NavLink
        to="/me"
        end
        className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
        }
        onClick={handleMenuClick}
    >
        <span className="sidebar-icon">
            <FiUser size={23} strokeWidth={2} />
        </span>

        <span className="sidebar-label">
            ME
        </span>
    </NavLink>
)}

    {/* MODULE MENUS */}

    {menuItems.map((item) => {
        const Icon = item.icon;

        const isLoading =
            mode === "admin" &&
            activeModuleId === item.id &&
            Boolean(loadingModules[`${roleId}_${item.id}`]);

        // USER NAVIGATION: KEEP EXISTING BEHAVIOUR
        if (mode === "user") {
            return (
                <NavLink
                    key={item.id}
                    to={item.path}
                    end
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                    onClick={handleMenuClick}
                >
                    <span className="sidebar-icon">
                        <Icon size={23} strokeWidth={2} />
                    </span>

                    <span className="sidebar-label">
                        {item.label}
                    </span>
                </NavLink>
            );
        }

        // ADMIN NAVIGATION: FETCH API MENU
        return (
            <button
                key={item.id}
                type="button"
               className={`sidebar-link ${
    activeModuleId === item.id ||
    location.pathname === item.path ||
    location.pathname.startsWith(`${item.path}/`)
        ? "active"
        : ""
}`}
                onClick={() => handleAdminModuleClick(item.id)}
                disabled={isLoading}
            >
                <span className="sidebar-icon">
                    <Icon size={23} strokeWidth={2} />
                </span>

                <span className="sidebar-label">
                    {item.label}
                </span>

                {isLoading && (
                    <span className="sidebar-loading">
                        ...
                    </span>
                )}
            </button>
        );
    })}
</nav>

                {/* FOOTER SETTINGS */}

                <div className="sidebar-footer">
                    <button
                        type="button"
                        className="sidebar-link sidebar-settings-link"
                        onClick={handleSettingsOpen}
                        aria-label="Settings"
                        title="Settings"
                    >
                        <span className="sidebar-icon">
                            <FiSettings
                                size={23}
                                strokeWidth={2}
                            />
                        </span>
                    </button>
                </div>
            </aside>

            {/* SETTINGS PANEL */}

            <SettingsPanel
                show={showSettings}
                onClose={handleSettingsClose}
                onAdminPanel={handlePanelSwitch}
                isAdmin={mode === "admin"}
            />
        </>
    );
}

export default Sidebar;
