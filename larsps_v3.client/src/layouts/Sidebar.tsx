import { useState, useEffect } from "react";
import { Button, Nav, NavItem } from "reactstrap";
import { Link, useLocation } from "react-router-dom";
import user1 from "../assets/images/users/user4.jpg";
import probg from "../assets/images/bg/ytl.png";
import { ROUTES } from "../routes/Path";

import { fetchMenus, fetchParentMenus } from "../services/apiService";
import { GetMenuChildRequest, GetMenuChildResponse, GetMenuParentRequest } from "../services/apiClient";

const navigation = [
    {
        title: "Dashboard",
        href: ROUTES.main,
        icon: "bi bi-speedometer2",
    },
    {
        title: "Daily Operation",
        href: "/dailyoperation",
        icon: "bi bi-calendar-day",
        subMenu: [
            { title: "Bank Guarantee/Advance Payment Bond", href: ROUTES.bankGuarantee }
        ]
    },
];

const Sidebar = () => {
    const [menuItems, setMenuItems] = useState<GetMenuChildResponse[]>([]);
    const [openDynamicMenu, setOpenDynamicMenu] = useState(false); // Toggle state for dynamic menu
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const location = useLocation();

    // Function to load menu items from API
    useEffect(() => {
        const loadMenus = async () => {
            try {
                // Use a plain object instead of a class instance
                const requestData = {
                    queryType: "GENERATE_MENU_CHILD",
                    userID: "KBTAN",
                    menuSystemName: "SPS",
                    isITAdmin: "0",
                    menuParentID: "476"
                };

                const fetchedMenus = await fetchMenus(requestData as GetMenuChildRequest);
                setMenuItems(fetchedMenus);
            } catch (error) {
                console.error("Failed to fetch menus:", error);
            }
        };
        loadMenus();
    }, []);

    const [menuItemsParent, setMenuItemsParent] = useState<GetMenuParentRequest[]>([]);

    useEffect(() => {
        const loadMenusParent = async () => {
            try {
                const requestData = {
                    queryType: "GENERATE_MENU",
                    userID: "KBTAN",
                    menuSystemName: "SPS",
                    isITAdmin: "0",
                    menuSubSystemName: ""
                };

                const fetchedMenusParents = await fetchParentMenus(requestData as GetMenuParentRequest);
                console.log("Checkpoint:", fetchedMenusParents);
                setMenuItemsParent(fetchedMenusParents);
            } catch (error) {
                console.error("Failed to fetch parent menus:", error);
            }
        };
        loadMenusParent();
    }, []);

    // Function to toggle submenu
    const toggleMenu = (index: number) => {
        setOpenMenu(openMenu === index ? null : index);
    };

    const showMobilemenu = () => {
        document.getElementById("sidebarArea")?.classList.toggle("showSidebar");
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
                <div className="bg-dark text-white p-2 opacity-75">Steave Rojer</div>
            </div>
            <div className="p-1 mt-1">
                <Nav vertical className="sidebarNav">
                    {/* Static Navigation */}
                    {navigation.map((navi, index) => (
                        <NavItem key={index} className="sidenav-bg">
                            {navi.subMenu ? (
                                // Item has a submenu ? Toggle submenu
                                <div
                                    className={location.pathname === navi.href ? "active nav-link py-3" : "nav-link text-secondary py-3"}
                                    onClick={() => toggleMenu(index)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <i className={navi.icon}></i>
                                    <span className="ms-1">{navi.title}</span>
                                    <i className={`bi ms-auto ${openMenu === index ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
                                </div>
                            ) : (
                                // No submenu ? Normal link
                                <Link to={navi.href} className="nav-link text-secondary py-3">
                                    <i className={navi.icon}></i>
                                    <span className="ms-1">{navi.title}</span>
                                </Link>
                            )}

                            {/* Static Submenu */}
                            {openMenu === index &&
                                navi.subMenu?.map((sub, subIndex) => (
                                    <NavItem key={subIndex} className="ms-3">
                                        <Link to={sub.href} className="nav-link text-secondary">{sub.title}</Link>
                                    </NavItem>
                                ))}
                        </NavItem>
                    ))}


                    {/* Dynamic Menu from API with Toggle Functionality */}
                    {menuItems.length > 0 && (
                        <NavItem className="sidenav-bg">
                            <div
                                className="nav-link text-secondary d-flex align-items-center"
                                onClick={() => setOpenDynamicMenu(!openDynamicMenu)}
                                style={{ cursor: "pointer" }}
                            >
                                <span>Daily Operation (LARSPSv1)</span>
                                <i className={`bi ms-auto ${openDynamicMenu ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
                            </div>

                            {/* Show/Hide Dynamic Menu Items */}
                            {openDynamicMenu &&
                                menuItems.map((menu) => (
                                    <NavItem key={menu.menuId} className="ms-3">
                                        <Link to={menu.menuURL} className="nav-link text-secondary">{menu.menuName}</Link>
                                    </NavItem>
                                ))
                            }
                        </NavItem>
                    )}
                </Nav>

            </div>
        </div>
    );
};

export default Sidebar;
