import { useState, useEffect } from "react";
import { Button, Nav, NavItem } from "reactstrap";
import { Link } from "react-router-dom";
import user1 from "../assets/images/users/user4.jpg";
import probg from "../assets/images/bg/ytl.png";
import { useSession } from "../context/SessionContext";
import { GetMenuChildResponse, GetMenuParentResponse } from "../services/apiClient";
import * as API from "../services/apiService";
import useFetchMenuData from "../routes/Path"; 

const Sidebar = () => {
    const { userId, isITAdmin, parentSystemName, fullName } = useSession();
    const [menuItemsParent, setMenuItemsParent] = useState<GetMenuParentResponse[]>([]);
    const [menuItems, setMenuItems] = useState<Record<number, GetMenuChildResponse[]>>({});
    const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});
    const { routes } = useFetchMenuData();

    
    //useEffect(() => {
    //    const loadMenusParent = async () => {
    //        try {
                
    //            const requestData: GetMenuParentRequest = {
    //                queryType: "GENERATE_MENU",
    //                userID: userId,
    //                menuSystemName: parentSystemName,
    //                isITAdmin: isITAdmin,
    //                menuSubSystemName: parentSystemName
    //            } as unknown as GetMenuParentRequest;
                
    //            const fetchedMenusParents = await API.fetchParentMenus(requestData);
    //            const sortedParents = fetchedMenusParents
    //                .filter((menu): menu is GetMenuParentResponse => menu.menuOrder !== null && menu.menuOrder !== undefined && menu.menuId !== undefined) // Ensure menuId exists
    //                .sort((a, b) => (a.menuOrder ?? Infinity) - (b.menuOrder ?? Infinity));

    //            setMenuItemsParent(sortedParents);

    //            // Fetch child menus for each parent
    //            const childMenusData: Record<number, GetMenuChildResponse[]> = {};

    //            for (const parent of sortedParents) {
    //                if (parent.menuId !== undefined) { // Ensure parent.menuId is defined
    //                    const childRequest: GetMenuChildRequest = {
    //                        queryType: "GENERATE_MENU_CHILD",
    //                        userID: userId,
    //                        menuSystemName: parentSystemName,
    //                        isITAdmin: isITAdmin,
    //                        menuParentID: parent.menuId.toString()
    //                    } as unknown as GetMenuChildRequest;
    //                    const fetchedChildMenus = await API.fetchMenus(childRequest);
                        
    //                    childMenusData[parent.menuId] = fetchedChildMenus
    //                        .filter((menu): menu is GetMenuChildResponse => menu.menuOrder !== null && menu.menuOrder !== undefined) // Ensure menuOrder exists
    //                        .sort((a, b) => (a.menuOrder ?? Infinity) - (b.menuOrder ?? Infinity));

    //                    //Console log each menu's menuURL
    //                    fetchedChildMenus.forEach(menu => {
    //                        console.log(`Menu Name: ${menu.menuName}, Menu URL: ${menu.menuURL}`);
    //                    });
    //                }
    //            }
                
    //            setMenuItems(childMenusData);
    //        } catch (error) {
    //            console.error("Failed to fetch menus:", error);
    //        }
    //    };

    //    loadMenusParent();
    //}, []);

    useEffect(() => {
        const loadMenus = async () => {
            if (userId  && parentSystemName) {
                const { sortedParents, childMenusData } = await API.GetMenus(userId, isITAdmin, parentSystemName);
                setMenuItemsParent(sortedParents);
                setMenuItems(childMenusData);
            }
        };
        loadMenus();
    }, [userId, isITAdmin, parentSystemName]);

    const showMobilemenu = () => {
        document.getElementById("sidebarArea")?.classList.toggle("showSidebar");
    };

    const handleMenuClick = (menuURL) => {
        let formattedURL = menuURL;
        // Remove "/LARSPSv2/" or "/LARSPS/" and replace with "~"
        formattedURL = formattedURL.replace(/^\/LARSPSv2\/|^\/LARSPS\//, "~/");
        sessionStorage.setItem("Page", formattedURL);
    };

    return (
        <div>
            <div className="d-flex align-items-center"></div>
            <div
                className="profilebg"
                style={{ background: `url(${probg}) no-repeat` }}
            >
                <div className="p-2 d-flex">
                    <img src={user1} alt="user" width="50" className="rounded-circle" />
                    <Button
                        color="white"
                        className="ms-auto text-white d-lg-none"
                        onClick={() => showMobilemenu()}
                    >
                        <i className="bi bi-x"></i>
                    </Button>

                </div>
                <div className="bg-dark text-white p-2 opacity-75">{fullName}</div>
            </div>
            <div className="p-1 mt-1">
                <Nav className="d-flex flex-column">
                    {/* Root-Level Dashboard */}
                    {menuItemsParent.some(parent => parent.menuName === "DASHBOARD") && (
                        <NavItem className="sidenav-bg">
                            <Link to={routes["dashboard"]} className="nav-link text-secondary py-3 d-flex align-items-center">
                                <i className="bi bi-speedometer2 me-2"></i> {/* Dashboard Icon */}
                                <span>Dashboard</span>
                            </Link>
                        </NavItem>
                    )}

                    {/* Other Parent Menus */}
                    {menuItemsParent
                        .filter(parentMenu => parentMenu.menuName !== "DASHBOARD" && parentMenu.menuName !== "MASTER (V3)") // Exclude Dashboard Master v3
                        .map((parentMenu) => (
                            <div key={parentMenu.menuId} className="mb-2">
                                {/* Parent Menu */}
                                <NavItem className="sidenav-bg d-flex align-items-center justify-content-between">
                                    <span className="nav-link text-secondary">{parentMenu.menuName}</span>
                                    <i
                                        className={`bi ms-auto ${openMenus[parentMenu.menuId] ? "bi-chevron-up" : "bi-chevron-down"}`}
                                        onClick={() => setOpenMenus(prev => ({
                                            ...prev,
                                            [parentMenu.menuId]: !prev[parentMenu.menuId]
                                        }))}
                                        style={{ cursor: "pointer" }}
                                    ></i>
                                </NavItem>

                                {/* Child Menus */}
                                {openMenus[parentMenu.menuId] && (
                                    <div className="ms-4">
                                        {menuItems[parentMenu.menuId]?.map((menu: GetMenuChildResponse) => (
                                            <NavItem key={menu.menuId} className="ms-3">
                                                <Link
                                                    to={menu.menuURL}
                                                    className="nav-link text-secondary"
                                                    onClick={() => handleMenuClick(menu.menuURL)}
                                                >
                                                    {menu.menuName}
                                                </Link>
                                            </NavItem>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                </Nav>
            </div>
        </div>
    );
};

export default Sidebar;
