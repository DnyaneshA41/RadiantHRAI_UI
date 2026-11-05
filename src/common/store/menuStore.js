
import { create } from "zustand";

import { getMenuByModuleId } from "../../common/services/menuApi";

// =====================================================
// MENU STORE
// =====================================================

const useMenuStore = create((set, get) => ({
    // Menu response stored by RoleID + ModuleID
    moduleMenus: {},

    // Loading state stored separately from menu data
    loadingModules: {},

    // API errors stored by RoleID + ModuleID
    errors: {},

    // =================================================
    // FETCH MENU FOR A MODULE
    // =================================================

    fetchModuleMenu: async (moduleId, roleId, forceRefresh = false) => {
        if (!moduleId || !roleId) {
            return [];
        }

        const cacheKey = `${roleId}_${moduleId}`;

        // Return existing store data if already available
        if (!forceRefresh && get().moduleMenus[cacheKey]) {
            return get().moduleMenus[cacheKey];
        }

        // Avoid duplicate fetches while the same module is loading
        if (get().loadingModules[cacheKey]) {
            return [];
        }

        set((state) => ({
            loadingModules: {
                ...state.loadingModules,
                [cacheKey]: true,
            },
            errors: {
                ...state.errors,
                [cacheKey]: null,
            },
        }));

        try {
           
            const response = await getMenuByModuleId(moduleId, roleId);
         
            const menuData = Array.isArray(response) ? response : [];

            set((state) => ({
                moduleMenus: {
                    ...state.moduleMenus,
                    [cacheKey]: menuData,
                },
            }));

            return menuData;
        } catch (error) {
            console.error("Failed to fetch module menu:", error);

            set((state) => ({
                errors: {
                    ...state.errors,
                    [cacheKey]:
                        error?.response?.data?.Message ||
                        error?.message ||
                        "Unable to load menu.",
                },
            }));

            return [];
        } finally {
            set((state) => ({
                loadingModules: {
                    ...state.loadingModules,
                    [cacheKey]: false,
                },
            }));
        }
    },

    // =================================================
    // CLEAR MENU DATA
    // =================================================

    clearMenus: () => {
        set({
            moduleMenus: {},
            loadingModules: {},
            errors: {},
        });
    },
}));

export default useMenuStore;
