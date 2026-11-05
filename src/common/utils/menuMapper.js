
export const buildMenuTree = (menuData = []) => {
    if (!Array.isArray(menuData)) {
        return [];
    }

    // Only assigned menus should be displayed.
    const assignedMenus = menuData
        .filter((item) => item.isAssigned === true)
        .map((item) => ({
            id: item.screenID,
            parentId: item.screenSubID,
            label: item.screenTitle,
            path: item.screenName,
            sequence: Number(item.screenSequence) || 0,
            icon: item.icon,
            isSideMenu: item.isSideMenu,
            formType: item.formType,
            children: [],
        }));

    const menuMap = new Map();

    assignedMenus.forEach((item) => {
        menuMap.set(Number(item.id), item);
    });

    const rootMenus = [];

    assignedMenus.forEach((item) => {
        const parent = menuMap.get(Number(item.parentId));

        if (parent) {
            parent.children.push(item);
        } else {
            // Root or item whose parent is not assigned/returned.
            rootMenus.push(item);
        }
    });

    const sortMenus = (items) => {
        items.sort((a, b) => a.sequence - b.sequence);

        items.forEach((item) => {
            sortMenus(item.children);
        });
    };

    sortMenus(rootMenus);

    return rootMenus;
};
