import { create } from "zustand";

const clearAuthStorage = () => {
  const keys = [
    "auth",
    "user",
    "token",
    "refreshToken",
    "accessId",
    "workspace",
    "employeeId",
    "employeeName",
    "roleId",
    "sourceID",
    "menus",
  ];

  keys.forEach((key) => {
    localStorage.removeItem(key);
  });
};

const getStoredMenus = (user) => {
  try {
    const storedMenus = localStorage.getItem("menus");

    if (storedMenus) {
      return JSON.parse(storedMenus);
    }

    return Array.isArray(user?.Menus) ? user.Menus : [];
  } catch {
    return [];
  }
};

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  roleId: null,
  menus: [],
  isAuthenticated: false,
  workspace: "user",
  isInitialized: false,

  /* =========================================================
       LOGIN
    ========================================================= */

  login: (user, token) => {
    const menus = Array.isArray(user?.Menus) ? user.Menus : [];

    const roleId = user?.RoleID ?? null;

    localStorage.setItem("auth", "true");
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    localStorage.setItem("workspace", "user");
    localStorage.setItem("menus", JSON.stringify(menus));

    localStorage.setItem("employeeId", String(user?.EmployeeID ?? ""));

    localStorage.setItem("employeeName", user?.EmployeeName || "");

    localStorage.setItem("roleId", String(roleId ?? ""));

    localStorage.setItem("sourceID", String(user?.SourceID || ""));

    set({
      user,
      token,
      roleId,
      menus,
      isAuthenticated: true,
      workspace: "user",
      isInitialized: true,
    });
  },

  /* =========================================================
       UPDATE MENUS
    ========================================================= */

  setMenus: (menus) => {
    const updatedMenus = Array.isArray(menus) ? menus : [];

    localStorage.setItem("menus", JSON.stringify(updatedMenus));

    set({
      menus: updatedMenus,
    });
  },

  /* =========================================================
       WORKSPACE
    ========================================================= */

  setWorkspace: (workspace) => {
    localStorage.setItem("workspace", workspace);

    set({
      workspace,
    });
  },

  /* =========================================================
       LOGOUT
    ========================================================= */

  logout: () => {
    clearAuthStorage();

    set({
      user: null,
      token: null,
      roleId: null,
      menus: [],
      isAuthenticated: false,
      workspace: "user",
      isInitialized: true,
    });
  },

  /* =========================================================
       INITIALIZE AUTHENTICATION
    ========================================================= */

  initializeAuth: () => {
    const auth = localStorage.getItem("auth");
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const workspace = localStorage.getItem("workspace") || "user";

    if (auth === "true" && storedUser && token) {
      try {
        const user = JSON.parse(storedUser);

        if (!user || typeof user !== "object") {
          throw new Error("Invalid stored user");
        }

        const menus = getStoredMenus(user);

        const roleId =
          user?.RoleID ??
          (localStorage.getItem("roleId")
            ? Number(localStorage.getItem("roleId"))
            : null);

        set({
          user,
          token,
          roleId,
          menus,
          isAuthenticated: true,
          workspace,
          isInitialized: true,
        });

        return;
      } catch {
        clearAuthStorage();
      }
    }

    set({
      user: null,
      token: null,
      roleId: null,
      menus: [],
      isAuthenticated: false,
      workspace: "user",
      isInitialized: true,
    });
  },
}));

export default useAuthStore;
