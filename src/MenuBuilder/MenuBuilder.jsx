import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiChevronDown,
  FiChevronRight,
  FiFolder,
  FiFileText,
  FiLayers,
  FiGitBranch,
  FiMenu,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiCornerDownRight,
  FiList,
  FiHash,
  FiLink,
} from "react-icons/fi";

import "./MenuBuilder.css";

/* -------------------------------------------------------------------------- */
/* API CONFIGURATION                                                          */
/* -------------------------------------------------------------------------- */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");

const GET_ALL_URL = `${API_BASE_URL}/ScreenConfig/GetAllScreenConfig`;
const CREATE_URL = `${API_BASE_URL}/ScreenConfig/CreateScreenConfig`;

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const FORM_TYPES = [
  { value: "Menu", label: "Menu" },
  { value: "Form", label: "Form" },
  { value: "SubForm", label: "Subform" },
  { value: "InnerSubForm", label: "Inner subform" },
];

const SCREEN_TYPES = [
  { value: "Admin", label: "Admin" },
  { value: "User", label: "User" },
];

const EMPTY_FORM = {
  screenId: "",
  screenSubId: "0",
  rdhR0000Id: "",
  screenSequence: "0",
  screenTitle: "",
  formType: "Menu",
  screenType: "Admin",
  icon: "fa fa-folder",
  isSideMenu: true,
  projectName: "",
  screenName: "",
  isApp: false,
};

/* -------------------------------------------------------------------------- */
/* RESPONSE HELPERS                                                           */
/* -------------------------------------------------------------------------- */

const getResponseArray = (response) => {
  const candidates = [
    response?.data,
    response?.data?.data,
    response?.data?.result,
    response?.data?.results,
    response?.data?.items,
    response?.data?.data?.data,
    response?.data?.result?.data,
  ];

  return candidates.find(Array.isArray) || [];
};

const getValue = (item, ...keys) => {
  if (!item || typeof item !== "object") return undefined;

  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) {
      return item[key];
    }

    const actualKey = Object.keys(item).find(
      (existingKey) => existingKey.toLowerCase() === key.toLowerCase(),
    );

    if (
      actualKey &&
      item[actualKey] !== undefined &&
      item[actualKey] !== null
    ) {
      return item[actualKey];
    }
  }

  return undefined;
};

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  if (typeof value === "string") {
    return ["true", "1", "yes"].includes(value.trim().toLowerCase());
  }

  return false;
};

const normalizeId = (value) => String(value ?? "").trim();

/* -------------------------------------------------------------------------- */
/* LOGIN MODULE HELPERS                                                       */
/* -------------------------------------------------------------------------- */

/*
  Main menu ID is the same as rdhR0000Id.

  Example login response:

  {
    "User": {
      "Menus": [
        {
          "ID": 1,
          "MenuName": "Core Settings",
          "Icon": "fas fa-cogs"
        },
        {
          "ID": 2,
          "MenuName": "Authorization",
          "Icon": "fas fa-user-shield"
        }
      ]
    }
  }

  Module ID = Menu ID = rdhR0000Id
*/

const getLoggedInModules = () => {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return [];

    const parsedUser = JSON.parse(storedUser);

    const menus =
      parsedUser?.Menus ||
      parsedUser?.menus ||
      parsedUser?.User?.Menus ||
      parsedUser?.User?.menus ||
      [];

    if (!Array.isArray(menus)) return [];

    const uniqueModules = new Map();

    menus.forEach((menu) => {
      const id = getValue(menu, "ID", "Id", "id");

      const name = getValue(
        menu,
        "MenuName",
        "menuName",
        "Name",
        "name",
      );

      if (id === undefined || id === null || normalizeId(id) === "") {
        return;
      }

      const normalizedId = normalizeId(id);

      if (!uniqueModules.has(normalizedId)) {
        uniqueModules.set(normalizedId, {
          ID: normalizedId,
          MenuName: String(name || "").trim() || `Module ${normalizedId}`,
          Icon: getValue(menu, "Icon", "icon") || "",
        });
      }
    });

    return Array.from(uniqueModules.values());
  } catch (error) {
    console.error("Unable to read login modules:", error);
    return [];
  }
};

/* -------------------------------------------------------------------------- */
/* SCREEN NORMALIZATION                                                       */
/* -------------------------------------------------------------------------- */

const normalizeScreen = (item, index) => ({
  screenId: getValue(item, "screenId", "ScreenId") ?? "",

  screenSubId: getValue(item, "screenSubId", "ScreenSubId") ?? "0",

  rdhR0000Id: getValue(item, "rdhR0000Id", "RdhR0000Id") ?? "",

  screenSequence:
    getValue(item, "screenSequence", "ScreenSequence") ?? index + 1,

  screenTitle:
    getValue(item, "screenTitle", "ScreenTitle") ?? "Untitled screen",

  formType: getValue(item, "formType", "FormType") ?? "Form",

  screenType: getValue(item, "screenType", "ScreenType") ?? "Admin",

  icon: getValue(item, "icon", "Icon") ?? "fa fa-folder",

  isSideMenu: toBoolean(getValue(item, "isSideMenu", "IsSideMenu")),

  projectName: getValue(item, "projectName", "ProjectName") ?? "",

  screenName: getValue(item, "screenName", "ScreenName") ?? "",

  isApp: toBoolean(getValue(item, "isApp", "IsApp")),

  isDeactivated: toBoolean(
    getValue(item, "isDeactivated", "IsDeactivated"),
  ),

  _key: `${String(
    getValue(item, "screenId", "ScreenId") ?? "screen",
  )}-${index}`,
});

const getParentId = (screen) => normalizeId(screen.screenSubId || "0");

const getScreenId = (screen) => normalizeId(screen.screenId);

const getTypeIcon = (formType) => {
  const type = String(formType || "").toLowerCase();

  if (type.includes("inner")) return FiGitBranch;
  if (type.includes("sub")) return FiLayers;
  if (type.includes("form")) return FiFileText;

  return FiFolder;
};

const getTypeLabel = (formType) => {
  const type = String(formType || "").toLowerCase();

  if (type === "innersubform" || type === "inner subform") {
    return "Inner subform";
  }

  if (type === "subform" || type === "sub form") {
    return "Subform";
  }

  if (type === "menu") return "Menu";

  return "Form";
};

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const ScreenConfig = () => {
  const [screens, setScreens] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const [selectedScreenId, setSelectedScreenId] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /* ------------------------------------------------------------------------ */
  /* MODULE OPTIONS                                                           */
  /* ------------------------------------------------------------------------ */

  const moduleOptions = useMemo(() => getLoggedInModules(), []);

  const selectedModule = useMemo(
    () =>
      moduleOptions.find(
        (module) =>
          normalizeId(module.ID) === normalizeId(formData.rdhR0000Id),
      ),
    [moduleOptions, formData.rdhR0000Id],
  );

  /* ------------------------------------------------------------------------ */
  /* GET ALL SCREEN CONFIGURATIONS                                            */
  /* ------------------------------------------------------------------------ */

  const fetchScreens = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setErrorMessage(
          "Authentication token not found. Please log in again.",
        );
        return;
      }

      const response = await axios.get(GET_ALL_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const rawScreens = getResponseArray(response);

      const normalizedScreens = rawScreens.map(normalizeScreen);

      setScreens(normalizedScreens);

      setExpandedIds((previous) => {
        const next = new Set(previous);

        normalizedScreens.forEach((screen) => {
          const parentId = getParentId(screen);

          const parentExists = normalizedScreens.some(
            (candidate) => getScreenId(candidate) === parentId,
          );

          if (parentId === "0" || !parentExists) {
            next.add(getScreenId(screen));
          }
        });

        return next;
      });
    } catch (error) {
      console.error("Failed to load screen configurations:", error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.title ||
          "Unable to load screen configurations. Please check the API URL and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScreens();
  }, [fetchScreens]);

  /* ------------------------------------------------------------------------ */
  /* MODULE ROOT SCREEN                                                       */
  /* ------------------------------------------------------------------------ */

  /*
    The main menu ID and rdhR0000Id are the same.

    A module root is identified by:
      screenId === selected module ID
      rdhR0000Id === selected module ID
      screenSubId === 0

    Example:
      Module ID: 1
      Root screen ID: 1
      Parent ID: 0
      Sequence: 0

    Screens created under this root will use screenSubId = 1.
  */

  const getModuleRootScreen = useCallback(
    (moduleId) => {
      const normalizedModuleId = normalizeId(moduleId);

      if (!normalizedModuleId) return null;

      return (
        screens.find(
          (screen) =>
            getScreenId(screen) === normalizedModuleId &&
            normalizeId(screen.rdhR0000Id) === normalizedModuleId &&
            getParentId(screen) === "0" &&
            !screen.isDeactivated,
        ) || null
      );
    },
    [screens],
  );

  /*
    Only show parent screens belonging to the selected module.
    This prevents selecting a parent from another module.
  */

  const moduleScreens = useMemo(() => {
    const moduleId = normalizeId(formData.rdhR0000Id);

    if (!moduleId) return [];

    return screens
      .filter(
        (screen) =>
          normalizeId(screen.rdhR0000Id) === moduleId &&
          !screen.isDeactivated,
      )
      .sort((a, b) => {
        const sequenceDifference =
          Number(a.screenSequence || 0) - Number(b.screenSequence || 0);

        if (sequenceDifference !== 0) return sequenceDifference;

        return String(a.screenTitle).localeCompare(String(b.screenTitle));
      });
  }, [screens, formData.rdhR0000Id]);

  /* ------------------------------------------------------------------------ */
  /* HIERARCHY CALCULATIONS                                                   */
  /* ------------------------------------------------------------------------ */

  const screenIdSet = useMemo(
    () => new Set(screens.map((screen) => getScreenId(screen))),
    [screens],
  );

  const getChildren = useCallback(
    (parentId) =>
      screens
        .filter(
          (screen) =>
            getParentId(screen) === normalizeId(parentId) &&
            !screen.isDeactivated,
        )
        .sort((a, b) => {
          const sequenceDifference =
            Number(a.screenSequence || 0) - Number(b.screenSequence || 0);

          if (sequenceDifference !== 0) return sequenceDifference;

          return String(a.screenTitle).localeCompare(String(b.screenTitle));
        }),
    [screens],
  );

  const rootScreens = useMemo(
    () =>
      screens
        .filter((screen) => {
          const parentId = getParentId(screen);

          return (
            !screen.isDeactivated &&
            (parentId === "0" ||
              parentId === "" ||
              !screenIdSet.has(parentId) ||
              parentId === getScreenId(screen))
          );
        })
        .sort(
          (a, b) =>
            Number(a.screenSequence || 0) - Number(b.screenSequence || 0),
        ),
    [screens, screenIdSet],
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const screenMatchesSearch = useCallback(
    (screen) => {
      if (!normalizedSearch) return true;

      const searchableText = [
        screen.screenId,
        screen.screenSubId,
        screen.screenTitle,
        screen.formType,
        screen.screenType,
        screen.projectName,
        screen.screenName,
        screen.icon,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    },
    [normalizedSearch],
  );

  const hasMatchingDescendant = useCallback(
    (screen, visited = new Set()) => {
      const id = getScreenId(screen);

      if (visited.has(id)) return false;

      const nextVisited = new Set(visited);
      nextVisited.add(id);

      return getChildren(id).some(
        (child) =>
          screenMatchesSearch(child) ||
          hasMatchingDescendant(child, nextVisited),
      );
    },
    [getChildren, screenMatchesSearch],
  );

  const getVisibleChildren = useCallback(
    (parentId) =>
      getChildren(parentId).filter(
        (child) =>
          screenMatchesSearch(child) ||
          hasMatchingDescendant(child, new Set([normalizeId(parentId)])),
      ),
    [getChildren, hasMatchingDescendant, screenMatchesSearch],
  );

  const visibleRootScreens = useMemo(() => {
    if (!normalizedSearch) return rootScreens;

    const rootMatches = rootScreens.filter(
      (screen) =>
        screenMatchesSearch(screen) ||
        hasMatchingDescendant(screen, new Set()),
    );

    const representedIds = new Set();

    const markRepresented = (screen, visited = new Set()) => {
      const id = getScreenId(screen);

      if (visited.has(id)) return;

      const nextVisited = new Set(visited);
      nextVisited.add(id);

      representedIds.add(id);

      getChildren(id).forEach((child) =>
        markRepresented(child, nextVisited),
      );
    };

    rootMatches.forEach((screen) => markRepresented(screen));

    const orphanMatches = screens.filter(
      (screen) =>
        !screen.isDeactivated &&
        screenMatchesSearch(screen) &&
        !representedIds.has(getScreenId(screen)),
    );

    return [...rootMatches, ...orphanMatches];
  }, [
    normalizedSearch,
    rootScreens,
    screens,
    screenMatchesSearch,
    hasMatchingDescendant,
    getChildren,
  ]);

  /* ------------------------------------------------------------------------ */
  /* SEQUENCE CALCULATION                                                     */
  /* ------------------------------------------------------------------------ */

  const getNextSequence = useCallback(
    (parentId, moduleId) => {
      const normalizedParentId = normalizeId(parentId);
      const normalizedModuleId = normalizeId(moduleId);

      /*
        If no parent is selected, this is a root-level screen.
        Root-level sequence must be 0.
      */
      if (normalizedParentId === "0" || normalizedParentId === "") {
        return 0;
      }

      /*
        For a child screen, calculate the next sequence
        among screens with the same parent and module.
      */
      const siblings = screens.filter(
        (screen) =>
          getParentId(screen) === normalizedParentId &&
          normalizeId(screen.rdhR0000Id) === normalizedModuleId &&
          !screen.isDeactivated,
      );

      return (
        siblings.reduce(
          (max, screen) =>
            Math.max(max, Number(screen.screenSequence || 0)),
          0,
        ) + 1
      );
    },
    [screens],
  );

  /* ------------------------------------------------------------------------ */
  /* FORM BEHAVIOR                                                            */
  /* ------------------------------------------------------------------------ */

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;

    setSuccessMessage("");
    setErrorMessage("");

    if (name === "rdhR0000Id") {
      const module = moduleOptions.find(
        (item) => normalizeId(item.ID) === normalizeId(value),
      );

      const rootScreen = getModuleRootScreen(value);

      const defaultParentId = rootScreen
        ? getScreenId(rootScreen)
        : "0";

      const nextSequence = getNextSequence(
        defaultParentId,
        value,
      );

      setFormData((previous) => ({
        ...previous,
        rdhR0000Id: value,
        projectName: module?.MenuName || "",
        screenSubId: defaultParentId,
        screenSequence: String(nextSequence),
      }));

      setSelectedScreenId(defaultParentId === "0" ? "" : defaultParentId);

      return;
    }

    setFormData((previous) => {
      const updated = {
        ...previous,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "screenSubId") {
        updated.screenSequence = String(
          getNextSequence(value, previous.rdhR0000Id),
        );
      }

      if (name === "formType") {
        if (value === "Menu") {
          updated.isSideMenu = true;
          updated.icon = updated.icon || "fa fa-folder";
        } else {
          updated.isSideMenu = false;
        }
      }

      return updated;
    });

    if (name === "screenSubId") {
      setSelectedScreenId(value === "0" ? "" : value);
    }
  };

  const handleReset = () => {
    setFormData(EMPTY_FORM);
    setSelectedScreenId("");
    setSuccessMessage("");
    setErrorMessage("");
  };

  const selectParent = (screen) => {
    const parentId = getScreenId(screen);

    const nextSequence = getNextSequence(
      parentId,
      formData.rdhR0000Id,
    );

    setFormData((previous) => ({
      ...previous,
      screenSubId: parentId,
      screenSequence: String(nextSequence),
    }));

    setSelectedScreenId(parentId);
    setSuccessMessage("");
    setErrorMessage("");
  };

  /* ------------------------------------------------------------------------ */
  /* POST: CREATE SCREEN CONFIGURATION                                        */
  /* ------------------------------------------------------------------------ */

  const handleCreate = async (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const screenId = normalizeId(formData.screenId);
    const parentId = normalizeId(formData.screenSubId || "0");
    const moduleId = normalizeId(formData.rdhR0000Id);

    if (!screenId) {
      setErrorMessage("Please enter a Screen ID.");
      return;
    }

    if (!moduleId) {
      setErrorMessage("Please select a Module.");
      return;
    }

    if (!moduleOptions.some((module) => normalizeId(module.ID) === moduleId)) {
      setErrorMessage("Please select a valid module.");
      return;
    }

    if (!formData.screenTitle.trim()) {
      setErrorMessage("Please enter a screen title.");
      return;
    }

    if (!formData.screenName.trim()) {
      setErrorMessage("Please enter the screen route/path.");
      return;
    }

    if (screens.some((screen) => getScreenId(screen) === screenId)) {
      setErrorMessage(
        `Screen ID ${screenId} already exists. Please enter a unique Screen ID.`,
      );
      return;
    }

    if (parentId === screenId) {
      setErrorMessage("A screen cannot be its own parent.");
      return;
    }

    if (parentId !== "0") {
      const selectedParent = moduleScreens.find(
        (screen) => getScreenId(screen) === parentId,
      );

      if (!selectedParent) {
        setErrorMessage(
          "Please select a valid parent screen from the selected module.",
        );
        return;
      }
    }

    const payload = {
      screenId: Number(formData.screenId),

      screenSubId: parentId === "" ? 0 : Number(parentId),

      // Main menu ID = rdhR0000Id.
      rdhR0000Id: Number(formData.rdhR0000Id),

      // Root-level screens always use sequence 0.
      screenSequence:
        parentId === "0" ? 0 : Number(formData.screenSequence),

      screenTitle: formData.screenTitle.trim(),

      formType: formData.formType,

      screenType: formData.screenType,

      icon: formData.icon.trim(),

      isSideMenu: Boolean(formData.isSideMenu),

      projectName: formData.projectName.trim(),

      screenName: formData.screenName.trim(),

      isApp: Boolean(formData.isApp),
    };

    if (
      !Number.isFinite(payload.screenId) ||
      !Number.isFinite(payload.screenSubId) ||
      !Number.isFinite(payload.rdhR0000Id) ||
      !Number.isFinite(payload.screenSequence)
    ) {
      setErrorMessage(
        "Screen ID, Parent Screen ID, Module ID, and Sequence must be valid numbers.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setErrorMessage(
          "Authentication token not found. Please log in again.",
        );
        return;
      }

      await axios.post(CREATE_URL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setSuccessMessage("Screen configuration created successfully.");

      setFormData(EMPTY_FORM);
      setSelectedScreenId("");

      await fetchScreens();
    } catch (error) {
      console.error("Failed to create screen configuration:", error);

      const responseData = error?.response?.data;

      setErrorMessage(
        responseData?.message ||
          responseData?.title ||
          (typeof responseData === "string" ? responseData : "") ||
          "Unable to create the screen configuration. Please verify the payload and API response.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* HIERARCHY TREE                                                           */
  /* ------------------------------------------------------------------------ */

  const renderNode = (screen, depth = 0, ancestry = new Set()) => {
    const id = getScreenId(screen);

    const childScreens = getVisibleChildren(id);
    const hasChildren = childScreens.length > 0;

    const expanded = expandedIds.has(id) || Boolean(normalizedSearch);
    const isSelected = selectedScreenId === id;

    const TypeIcon = getTypeIcon(screen.formType);

    if (ancestry.has(id)) {
      return (
        <div className="sc-tree-warning" key={screen._key}>
          Circular parent reference detected for screen {id}.
        </div>
      );
    }

    const nextAncestry = new Set(ancestry);
    nextAncestry.add(id);

    return (
      <div className="sc-tree-branch" key={screen._key}>
        <div
          className={`sc-tree-node ${isSelected ? "is-selected" : ""}`}
          style={{ "--node-depth": depth }}
        >
          <button
            type="button"
            className="sc-tree-expand"
            aria-label={expanded ? "Collapse node" : "Expand node"}
            disabled={!hasChildren}
            onClick={() => {
              setExpandedIds((previous) => {
                const next = new Set(previous);

                if (next.has(id)) {
                  next.delete(id);
                } else {
                  next.add(id);
                }

                return next;
              });
            }}
          >
            {hasChildren ? (
              expanded ? <FiChevronDown /> : <FiChevronRight />
            ) : (
              <span className="sc-tree-expand-placeholder" />
            )}
          </button>

          <div className="sc-tree-type-icon">
            <TypeIcon />
          </div>

          <button
            type="button"
            className="sc-tree-node-content"
            onClick={() => selectParent(screen)}
            title="Select this screen as the parent for a new screen"
          >
            <span className="sc-tree-node-title">
              {screen.screenTitle || "Untitled screen"}
            </span>

            <span className="sc-tree-node-meta">
              <span className="sc-tree-id">ID: {id || "—"}</span>

              <span className="sc-tree-type">
                {getTypeLabel(screen.formType)}
              </span>
            </span>
          </button>

          <span
            className={`sc-screen-type ${
              String(screen.screenType).toLowerCase() === "admin"
                ? "sc-screen-type-admin"
                : "sc-screen-type-user"
            }`}
          >
            {screen.screenType || "—"}
          </span>

          <button
            type="button"
            className="sc-node-add"
            title="Add a child under this screen"
            onClick={() => selectParent(screen)}
          >
            <FiPlus />
          </button>
        </div>

        {hasChildren && expanded && (
          <div className="sc-tree-children">
            {childScreens.map((child) =>
              renderNode(child, depth + 1, nextAncestry),
            )}
          </div>
        )}
      </div>
    );
  };

  /* ------------------------------------------------------------------------ */
  /* SUMMARY COUNTS                                                           */
  /* ------------------------------------------------------------------------ */

  const selectedParent = moduleScreens.find(
    (screen) => getScreenId(screen) === normalizeId(formData.screenSubId),
  );

  const menuCount = screens.filter(
    (screen) => String(screen.formType).toLowerCase() === "menu",
  ).length;

  const formCount = screens.filter((screen) =>
    String(screen.formType).toLowerCase().includes("form"),
  ).length;

  const projectCount = new Set(
    screens.map((screen) => screen.projectName).filter(Boolean),
  ).size;

  /* ------------------------------------------------------------------------ */
  /* JSX                                                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="sc-page">
      {/* PAGE HEADER */}
      <div className="sc-page-header">
        <div>
          <div className="sc-breadcrumb">
            <span>Administration</span>
            <FiChevronRight />
            <span>Screen Configuration</span>
          </div>

          <h1 className="sc-page-title">Screen Hierarchy Builder</h1>

          <p className="sc-page-subtitle">
            Configure menus, forms, and nested screens in one place.
          </p>
        </div>

        <button
          type="button"
          className="sc-button sc-button-secondary sc-refresh-button"
          onClick={fetchScreens}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? "sc-spin" : ""} />
          Refresh hierarchy
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="sc-summary-grid">
        <div className="sc-summary-card">
          <div className="sc-summary-icon">
            <FiGitBranch />
          </div>

          <div>
            <span className="sc-summary-label">Total screens</span>
            <strong className="sc-summary-value">{screens.length}</strong>
          </div>
        </div>

        <div className="sc-summary-card">
          <div className="sc-summary-icon">
            <FiMenu />
          </div>

          <div>
            <span className="sc-summary-label">Menus</span>
            <strong className="sc-summary-value">{menuCount}</strong>
          </div>
        </div>

        <div className="sc-summary-card">
          <div className="sc-summary-icon">
            <FiFileText />
          </div>

          <div>
            <span className="sc-summary-label">Forms & subforms</span>
            <strong className="sc-summary-value">{formCount}</strong>
          </div>
        </div>

        <div className="sc-summary-card">
          <div className="sc-summary-icon">
            <FiLayers />
          </div>

          <div>
            <span className="sc-summary-label">Projects</span>
            <strong className="sc-summary-value">{projectCount}</strong>
          </div>
        </div>
      </div>

      {/* ALERTS */}
      {(successMessage || errorMessage) && (
        <div
          className={`sc-alert ${
            errorMessage ? "sc-alert-error" : "sc-alert-success"
          }`}
          role="status"
        >
          {errorMessage ? <FiAlertCircle /> : <FiCheckCircle />}

          <span>{errorMessage || successMessage}</span>

          <button
            type="button"
            className="sc-alert-close"
            aria-label="Dismiss message"
            onClick={() => {
              setErrorMessage("");
              setSuccessMessage("");
            }}
          >
            <FiX />
          </button>
        </div>
      )}

      {/* WORKSPACE */}
      <div className="sc-workspace">
        {/* LEFT PANEL */}
        <section className="sc-panel sc-builder-panel">
          <div className="sc-panel-header">
            <div className="sc-panel-heading">
              <div className="sc-panel-heading-icon">
                <FiPlus />
              </div>

              <div>
                <h2>Create screen</h2>
                <p>Add a new item to the hierarchy.</p>
              </div>
            </div>

            <span className="sc-required-note">
              <span>*</span> Required fields
            </span>
          </div>

          <form className="sc-form" onSubmit={handleCreate}>
            {/* SECTION 01 */}
            <div className="sc-section-heading">
              <span className="sc-section-number">01</span>

              <div>
                <h3>Screen details</h3>
                <p>Identify the screen and its position.</p>
              </div>
            </div>

            <div className="sc-form-grid sc-form-grid-two">
              {/* SCREEN ID */}
              <div className="sc-field">
                <label htmlFor="screenId">
                  Screen ID <span>*</span>
                </label>

                <div className="sc-input-with-icon">
                  <FiHash />

                  <input
                    id="screenId"
                    name="screenId"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.screenId}
                    onChange={updateField}
                    placeholder="Enter unique screen ID"
                    required
                  />
                </div>

                <small>Enter a unique ID manually.</small>
              </div>

              {/* MODULE */}
              <div className="sc-field">
                <label htmlFor="rdhR0000Id">
                  Module <span>*</span>
                </label>

                <div className="sc-input-with-icon">
                  <FiHash />

                  <select
                    id="rdhR0000Id"
                    name="rdhR0000Id"
                    value={formData.rdhR0000Id}
                    onChange={updateField}
                    required
                  >
                    <option value="">Select module</option>

                    {moduleOptions.map((module) => (
                      <option key={module.ID} value={module.ID}>
                        {module.MenuName} (ID: {module.ID})
                      </option>
                    ))}
                  </select>
                </div>

                <small>
                  Module ID is taken from the main menu ID.
                </small>

                {moduleOptions.length === 0 && (
                  <small>
                    No modules found in the stored login response. Please log
                    in again.
                  </small>
                )}
              </div>
            </div>

            {/* SCREEN TITLE */}
            <div className="sc-field">
              <label htmlFor="screenTitle">
                Screen title <span>*</span>
              </label>

              <input
                id="screenTitle"
                name="screenTitle"
                type="text"
                value={formData.screenTitle}
                onChange={updateField}
                placeholder="e.g. Employee Management"
                maxLength={150}
                required
              />
            </div>

            <div className="sc-form-grid sc-form-grid-two">
              {/* FORM TYPE */}
              <div className="sc-field">
                <label htmlFor="formType">
                  Screen category <span>*</span>
                </label>

                <select
                  id="formType"
                  name="formType"
                  value={formData.formType}
                  onChange={updateField}
                  required
                >
                  {FORM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* SCREEN TYPE */}
              <div className="sc-field">
                <label htmlFor="screenType">
                  Screen access <span>*</span>
                </label>

                <select
                  id="screenType"
                  name="screenType"
                  value={formData.screenType}
                  onChange={updateField}
                  required
                >
                  {SCREEN_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SECTION 02 */}
            <div className="sc-section-heading sc-section-heading-spaced">
              <span className="sc-section-number">02</span>

              <div>
                <h3>Hierarchy & routing</h3>
                <p>Choose where the screen belongs.</p>
              </div>
            </div>

            {/* PARENT SCREEN */}
            <div className="sc-field">
              <label htmlFor="screenSubId">Parent screen</label>

              <div className="sc-input-with-icon">
                <FiCornerDownRight />

                <select
                  id="screenSubId"
                  name="screenSubId"
                  value={formData.screenSubId}
                  onChange={updateField}
                  disabled={!formData.rdhR0000Id}
                >
                  <option value="0">Root level — no parent</option>

                  {moduleScreens.map((screen) => (
                    <option
                      key={screen._key}
                      value={getScreenId(screen)}
                      disabled={
                        getScreenId(screen) ===
                        normalizeId(formData.screenId)
                      }
                    >
                      {screen.screenTitle} (ID: {getScreenId(screen)})
                      {getScreenId(screen) ===
                      normalizeId(formData.rdhR0000Id)
                        ? " — Module root"
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <small>
                {!formData.rdhR0000Id
                  ? "Select a module first."
                  : selectedParent
                    ? `Selected parent: ${selectedParent.screenTitle}`
                    : getModuleRootScreen(formData.rdhR0000Id)
                      ? "No parent selected. Select a parent screen."
                      : "No module root exists yet. This screen will be created at root level with sequence 0."}
              </small>
            </div>

            <div className="sc-form-grid sc-form-grid-two">
              {/* SEQUENCE */}
              <div className="sc-field">
                <label htmlFor="screenSequence">
                  Display sequence <span>*</span>
                </label>

                <input
                  id="screenSequence"
                  name="screenSequence"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.screenSequence}
                  onChange={updateField}
                  required
                />

                <small>
                  {formData.screenSubId === "0"
                    ? "Root-level screens use sequence 0."
                    : "Order among screens with the same parent."}
                </small>
              </div>

              {/* PROJECT NAME */}
              <div className="sc-field">
                <label htmlFor="projectName">Project name</label>

                <input
                  id="projectName"
                  name="projectName"
                  type="text"
                  value={formData.projectName}
                  onChange={updateField}
                  placeholder="e.g. Core Settings"
                  maxLength={150}
                />
              </div>
            </div>

            {/* SCREEN ROUTE */}
            <div className="sc-field">
              <label htmlFor="screenName">
                Screen route / path <span>*</span>
              </label>

              <div className="sc-input-with-icon">
                <FiLink />

                <input
                  id="screenName"
                  name="screenName"
                  type="text"
                  value={formData.screenName}
                  onChange={updateField}
                  placeholder="/admin/coresettings/subentity"
                  maxLength={300}
                  required
                />
              </div>

              <small>Enter the route used by your React application.</small>
            </div>

            {/* ICON */}
            <div className="sc-field">
              <label htmlFor="icon">Icon class</label>

              <div className="sc-input-with-icon">
                <FiFolder />

                <input
                  id="icon"
                  name="icon"
                  type="text"
                  value={formData.icon}
                  onChange={updateField}
                  placeholder="fa fa-cog"
                  maxLength={100}
                />
              </div>

              <small>
                Example: <code>fa fa-cog</code>,{" "}
                <code>fa fa-users</code>
              </small>
            </div>

            {/* SECTION 03 */}
            <div className="sc-section-heading sc-section-heading-spaced">
              <span className="sc-section-number">03</span>

              <div>
                <h3>Display options</h3>
                <p>Configure how the screen behaves.</p>
              </div>
            </div>

            <div className="sc-toggle-list">
              <label className="sc-toggle-row" htmlFor="isSideMenu">
                <span className="sc-toggle-copy">
                  <strong>Display as side menu</strong>
                  <small>
                    Enable if this item should display a menu list.
                  </small>
                </span>

                <input
                  id="isSideMenu"
                  name="isSideMenu"
                  type="checkbox"
                  checked={formData.isSideMenu}
                  onChange={updateField}
                />

                <span className="sc-toggle-track" aria-hidden="true" />
              </label>

              <label className="sc-toggle-row" htmlFor="isApp">
                <span className="sc-toggle-copy">
                  <strong>Mobile App</strong>
                </span>

                <input
                  id="isApp"
                  name="isApp"
                  type="checkbox"
                  checked={formData.isApp}
                  onChange={updateField}
                />

                <span className="sc-toggle-track" aria-hidden="true" />
              </label>
            </div>

            {/* PAYLOAD PREVIEW */}
            <div className="sc-payload-preview">
              <div className="sc-payload-preview-icon">
                <FiCheckCircle />
              </div>

              <div>
                <strong>Ready to create</strong>

                <p>
                  The form values will be sent to the CreateScreenConfig API
                  as JSON.
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="sc-form-actions">
              <button
                type="button"
                className="sc-button sc-button-secondary"
                onClick={handleReset}
                disabled={submitting}
              >
                <FiX />
                Clear form
              </button>

              <button
                type="submit"
                className="sc-button sc-button-primary"
                disabled={submitting || moduleOptions.length === 0}
              >
                {submitting ? (
                  <>
                    <FiRefreshCw className="sc-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FiPlus />
                    Create screen
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT PANEL */}
        <section className="sc-panel sc-hierarchy-panel">
          <div className="sc-panel-header sc-hierarchy-header">
            <div className="sc-panel-heading">
              <div className="sc-panel-heading-icon">
                <FiGitBranch />
              </div>

              <div>
                <h2>Screen hierarchy</h2>
                <p>Explore and build your screen structure.</p>
              </div>
            </div>

            <span className="sc-count-badge">
              {screens.length} screens
            </span>
          </div>

          {/* SEARCH */}
          <div className="sc-hierarchy-toolbar">
            <div className="sc-search-box">
              <FiSearch />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search title, ID, route..."
                aria-label="Search screens"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>

            <div className="sc-toolbar-actions">
              <button
                type="button"
                className="sc-icon-button"
                title="Expand all root nodes"
                onClick={() =>
                  setExpandedIds(
                    new Set(rootScreens.map((screen) => getScreenId(screen))),
                  )
                }
              >
                <FiChevronDown />
              </button>

              <button
                type="button"
                className="sc-icon-button"
                title="Collapse all nodes"
                onClick={() => setExpandedIds(new Set())}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          {/* LEGEND */}
          <div className="sc-hierarchy-legend">
            <span>
              <span className="sc-legend-dot sc-legend-menu" />
              Menu
            </span>

            <span>
              <span className="sc-legend-dot sc-legend-form" />
              Form
            </span>

            <span>
              <span className="sc-legend-dot sc-legend-subform" />
              Nested form
            </span>
          </div>

          {/* TREE */}
          <div className="sc-tree-canvas">
            {loading ? (
              <div className="sc-loading-state">
                <FiRefreshCw className="sc-spin" />
                <strong>Loading hierarchy</strong>
                <span>Retrieving screen configurations...</span>
              </div>
            ) : screens.length === 0 ? (
              <div className="sc-empty-state">
                <div className="sc-empty-icon">
                  <FiGitBranch />
                </div>

                <h3>No screens found</h3>

                <p>
                  Create your first screen using the form on the left. It will
                  appear here after the API confirms creation.
                </p>

                <button
                  type="button"
                  className="sc-button sc-button-secondary"
                  onClick={fetchScreens}
                >
                  <FiRefreshCw />
                  Reload screens
                </button>
              </div>
            ) : visibleRootScreens.length === 0 ? (
              <div className="sc-empty-state sc-empty-state-small">
                <FiSearch />
                <h3>No matching screens</h3>
                <p>Try another title, ID, project, or route.</p>
              </div>
            ) : (
              <div className="sc-tree">
                {visibleRootScreens.map((screen) => renderNode(screen))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="sc-hierarchy-footer">
            <div className="sc-footer-info">
              <FiList />

              <span>
                Select a node or click{" "}
                <FiPlus className="sc-inline-icon" /> to set it as the parent.
              </span>
            </div>

            <span className="sc-root-count">
              {rootScreens.length} root{" "}
              {rootScreens.length === 1 ? "item" : "items"}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ScreenConfig;