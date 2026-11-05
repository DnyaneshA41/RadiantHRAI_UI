
import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

import useMenuStore from "../../../common/store/menuStore";
import useAuthStore from "../../../auth/store/authStore";


import { ADMIN_MODULE_ROUTES } from "../../../common/utils/moduleConfig";

import { buildMenuTree } from "../../../common/utils/menuMapper";

import "./ModuleNav.css";

/* =========================================================
   USER MODULE NAVIGATION
   KEEP EXISTING USER NAVIGATION
========================================================= */

const userModuleNavigation = {
    "/preboarding": [
        { label: "PREBOARDING", path: "/preboarding" },
        { label: "CANDIDATES", path: "/preboarding/candidates" },
        { label: "OFFER LETTER", path: "/preboarding/offer-letter" },
    ],

    "/onboarding": [
        { label: "WELCOME BOARD", path: "/onboarding" },
        { label: "BLOCK OR SUSPEND", path: "/onboarding/block-suspend" },
        { label: "REASSIGN LEADS", path: "/onboarding/reassign-leads" },
        { label: "IN-ACTIVE EMPLOYEES", path: "/onboarding/inactive-employees" },
    ],

    "/me": [
        { label: "ATTENDANCE", path: "/me" },
        { label: "LEAVE", path: "/me/leave" },
    ],

    "/executive-overview": [
        { label: "EXECUTIVE OVERVIEW", path: "/executive-overview" },
        { label: "EMPLOYEE ANALYTICS", path: "/executive-overview/employee-analytics" },
        { label: "PAYROLL ANALYTICS", path: "/executive-overview/payroll-analytics" },
        { label: "ATTENDANCE ANALYTICS", path: "/executive-overview/attendance-analytics" },
    ],

    "/payroll": [
        { label: "PAYROLL", path: "/payroll" },
        { label: "SALARY", path: "/payroll/salary" },
        { label: "PAYSLIP", path: "/payroll/payslip" },
        { label: "PAYROLL PROCESS", path: "/payroll/process" },
    ],
};

/* =========================================================
   ADMIN MODULE NAVIGATION
   GENERATED FROM API RESPONSE
========================================================= */

function AdminMenuItems({ items }) {
    return items.map((item) => {
        const hasChildren =
            item.isSideMenu === true &&
            Array.isArray(item.children) &&
            item.children.length > 0;

        return (
            <div key={item.id} className="admin-module-nav-item">
                {item.path ? (
                    <NavLink
                        to={item.path}
                        end
                        className={({ isActive }) =>
                            `module-nav-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ) : (
                    <span className="module-nav-link">
                        {item.label}
                    </span>
                )}

                {hasChildren && (
                    <div className="admin-module-nav-children">
                        <AdminMenuItems items={item.children} />
                    </div>
                )}
            </div>
        );
    });
}

/* =========================================================
   MODULE NAV COMPONENT
========================================================= */

function ModuleNav({ mode = "user" }) {
    const location = useLocation();
    
    /* ---------------------------------------------------------
       AUTH STORE
    --------------------------------------------------------- */

    const roleId = useAuthStore(
        (state) => state.roleId
    );

    const menus = useAuthStore(
        (state) => state.menus
    );

    /* ---------------------------------------------------------
       MENU STORE
    --------------------------------------------------------- */

    const moduleMenus = useMenuStore(
        (state) => state.moduleMenus
    );

    const loadingModules = useMenuStore(
        (state) => state.loadingModules
    );

    const fetchModuleMenu = useMenuStore(
        (state) => state.fetchModuleMenu
    );

    /* ---------------------------------------------------------
       GLOBAL DASHBOARD PAGES
    --------------------------------------------------------- */

  const isGlobalDashboard =
    mode === "user" && location.pathname === "/dashboard";

    /* ---------------------------------------------------------
       IDENTIFY CURRENT ADMIN MODULE
    --------------------------------------------------------- */

const currentModule =
    mode === "admin" && Array.isArray(menus)
        ? menus.find((menu) => {
              const moduleId = Number(menu.ID);

              // Admin landing page opens Core Settings Dashboard
              if (location.pathname === "/admin") {
                  return moduleId === 1;
              }

              const moduleRoute = ADMIN_MODULE_ROUTES[moduleId];

              return (
                  moduleRoute &&
                  (
                      location.pathname === moduleRoute ||
                      location.pathname.startsWith(`${moduleRoute}/`)
                  )
              );
          })
        : null;

    /* ---------------------------------------------------------
       ADMIN MENU CACHE KEY
    --------------------------------------------------------- */

    const cacheKey =
        currentModule && roleId
            ? `${roleId}_${currentModule.ID}`
            : null;

    /* ---------------------------------------------------------
       FETCH ADMIN MENU ON REFRESH / PAGE LOAD

       If the user refreshes a module page, Zustand's in-memory
       menu cache is empty. Fetch the menu automatically.
    --------------------------------------------------------- */

    useEffect(() => {
        if (
            mode !== "admin" ||
            !currentModule?.ID ||
            !roleId ||
            !cacheKey ||
            isGlobalDashboard
        ) {
            return;
        }

        const hasCachedMenu = Object.prototype.hasOwnProperty.call(
            moduleMenus,
            cacheKey
        );

        const isLoading = Boolean(
            loadingModules[cacheKey]
        );

        if (!hasCachedMenu && !isLoading) {
            fetchModuleMenu(
                currentModule.ID,
                roleId
            );
        }
    }, [
        mode,
        currentModule?.ID,
        roleId,
        cacheKey,
        isGlobalDashboard,
        moduleMenus,
        loadingModules,
        fetchModuleMenu,
    ]);

    /* ---------------------------------------------------------
       GLOBAL DASHBOARD RENDER
    --------------------------------------------------------- */

    if (isGlobalDashboard) {
        return null;
    }

    /* ---------------------------------------------------------
       USER MODULE NAVIGATION
       EXISTING BEHAVIOUR UNCHANGED
    --------------------------------------------------------- */

    if (mode === "user") {
        const currentPath = Object.keys(
            userModuleNavigation
        ).find(
            (path) =>
                location.pathname === path ||
                location.pathname.startsWith(`${path}/`)
        );

        const items = currentPath
            ? userModuleNavigation[currentPath]
            : [];

        if (!items.length) {
            return null;
        }

        return (
            <nav className="module-nav">
                <div className="module-nav-scroll">
                    {items.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === currentPath}
                            className={({ isActive }) =>
                                `module-nav-link ${
                                    isActive ? "active" : ""
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </nav>
        );
    }

    /* ---------------------------------------------------------
       ADMIN MODULE NAVIGATION
    --------------------------------------------------------- */

    if (!currentModule || !cacheKey) {
        return null;
    }

    const rawMenuData = moduleMenus[cacheKey] || [];

    const menuTree = buildMenuTree(rawMenuData);

    // Hide the root menu and display its children as submenus.
    const visibleMenus = menuTree.flatMap((item) =>
        Number(item.parentId) === 0
            ? item.children
            : [item]
    );

    if (!visibleMenus.length) {
        return null;
    }

    return (
        <nav className="module-nav">
            <div className="module-nav-scroll">
                <AdminMenuItems items={visibleMenus} />
            </div>
        </nav>
    );
}

export default ModuleNav;
