import { useEffect, useState } from "react";
//import { GetMenuParentRequest, GetMenuChildRequest } from "../services/apiClient";
import { useSession } from "../context/SessionContext";
import * as API from "../services/apiService";

// ROUTES will now be dynamically set
const Path = () => {
    const { userId, isITAdmin, parentSystemName } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [routes, setRoutes] = useState<Record<string, string>>({});

    //useEffect(() => {
    //    const fetchData = async () => {
    //        try {
    //            if (userId) {

    //                const requestData: GetMenuParentRequest = {
    //                    queryType: "GENERATE_MENU",
    //                    userID: userId,
    //                    menuSystemName: parentSystemName,
    //                    isITAdmin: isITAdmin,
    //                    menuSubSystemName: parentSystemName
    //                } as unknown as GetMenuParentRequest;

    //                const fetchedParents = await API.fetchParentMenus(requestData);
    //                const sortedParents = fetchedParents
    //                    .filter(menu => menu.menuOrder !== null && menu.menuId !== undefined)
    //                    .sort((a, b) => (a.menuOrder ?? Infinity) - (b.menuOrder ?? Infinity));

    //                const newRoutes: Record<string, string> = {};

    //                for (const parent of sortedParents) {
    //                    if (parent.menuId !== undefined) {
    //                        const childRequest: GetMenuChildRequest = {
    //                            queryType: "GENERATE_MENU_CHILD",
    //                            userID: userId,
    //                            menuSystemName: parentSystemName,
    //                            isITAdmin: isITAdmin,
    //                            menuParentID: parent.menuId.toString()
    //                        } as unknown as GetMenuChildRequest;

    //                        const fetchedChildren = await API.fetchMenus(childRequest);
    //                        const sortedChildren = fetchedChildren
    //                            .filter(menu => typeof menu.menuURL === "string" && menu.menuURL.trim() !== "")
    //                            .sort((a, b) => (a.menuOrder ?? Infinity) - (b.menuOrder ?? Infinity));

    //                        if (parent.menuName) {
    //                            const lowerMenuName = parent.menuName.toLowerCase();
    //                            if (["master (v3)", "dashboard"].includes(lowerMenuName)) {
    //                                newRoutes[lowerMenuName] = parent.menuURL ?? ""; // Fixed assignment
    //                            }
    //                        }


    //                        for (const menu of sortedChildren) {
    //                            if (menu.menuName) {
    //                                const lowerMenuName = menu.menuName.toLowerCase();
    //                                if (["bank guarantee/advance payment bond"].includes(lowerMenuName)) {
    //                                    newRoutes[lowerMenuName] = menu.menuURL ?? ""; // Fixed assignment
    //                                }

    //                            }
    //                        }
    //                    }
    //                }
    //                //console.log("🚀 Final Routes:", newRoutes); // Debugging log
    //                setRoutes(newRoutes); // Update state with dynamic routes

    //            }

    //        } catch (error) {
    //            console.error("Failed to fetch menus:", error);
    //        } finally {
    //            setIsLoading(false);
    //        }
    //    };

    //    fetchData();
    //}, [userId, isITAdmin, parentSystemName]);

    useEffect(() => {
        const fetchData = async () => {
            if (userId && parentSystemName) {
                const { sortedParents, childMenusData } = await API.GetMenus(userId, isITAdmin, parentSystemName);

                const newRoutes: Record<string, string> = {};
                sortedParents.forEach(parent => {
                    if (parent.menuName && parent.menuURL) newRoutes[parent.menuName.toLowerCase()] = parent.menuURL;
                });

                Object.values(childMenusData).flat().forEach(menu => {
                    if (menu.menuName && menu.menuURL) newRoutes[menu.menuName.toLowerCase()] = menu.menuURL;
                });
                console.log("🚀 Final Routes:", newRoutes); // Debugging log
                setRoutes(newRoutes);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId, isITAdmin, parentSystemName]);

    return { isLoading, routes };
};

export default Path;
