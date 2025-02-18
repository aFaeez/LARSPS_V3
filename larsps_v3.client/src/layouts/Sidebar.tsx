import { useState, useEffect } from "react";
import { Button, Nav, NavItem } from "reactstrap";
import { Link, useLocation } from "react-router-dom";
import user1 from "../assets/images/users/user4.jpg";
import probg from "../assets/images/bg/ytl.png";
import { ROUTES } from "../routes/Path";
import { useSession } from "../context/SessionContext";
import { GetMenuChildRequest, GetMenuChildResponse, GetMenuParentRequest, GetMenuParentResponse } from "../services/apiClient";
import * as API from "../services/apiService";

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
    const { userId, isITAdmin, systemName, fullName } = useSession();
    const [menuItemsParent, setMenuItemsParent] = useState<GetMenuParentResponse[]>([]);
    const [menuItems, setMenuItems] = useState<Record<number, GetMenuChildResponse[]>>({});
    const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const location = useLocation();

    useEffect(() => {
        const loadMenusParent = async () => {
            try {
                
                const requestData: GetMenuParentRequest = {
                    queryType: "GENERATE_MENU",
                    userID: userId,
                    menuSystemName: systemName,
                    isITAdmin: isITAdmin,
                    menuSubSystemName: systemName
                } as unknown as GetMenuParentRequest;
                
                const fetchedMenusParents = await API.fetchParentMenus(requestData);
                const sortedParents = fetchedMenusParents
                    .filter((menu): menu is GetMenuParentResponse => menu.menuOrder !== null && menu.menuOrder !== undefined && menu.menuId !== undefined) // Ensure menuId exists
                    .sort((a, b) => (a.menuOrder ?? Infinity) - (b.menuOrder ?? Infinity));

                setMenuItemsParent(sortedParents);

                // Fetch child menus for each parent
                const childMenusData: Record<number, GetMenuChildResponse[]> = {};

                for (const parent of sortedParents) {
                    if (parent.menuId !== undefined) { // Ensure parent.menuId is defined
                        const childRequest: GetMenuChildRequest = {
                            queryType: "GENERATE_MENU_CHILD",
                            userID: userId,
                            menuSystemName: systemName,
                            isITAdmin: isITAdmin,
                            menuParentID: parent.menuId.toString()
                        } as unknown as GetMenuChildRequest;
                        const fetchedChildMenus = await API.fetchMenus(childRequest);

                        childMenusData[parent.menuId] = fetchedChildMenus
                            .filter((menu): menu is GetMenuChildResponse => menu.menuOrder !== null && menu.menuOrder !== undefined) // Ensure menuOrder exists
                            .sort((a, b) => (a.menuOrder ?? Infinity) - (b.menuOrder ?? Infinity));
                    }
                }
                setMenuItems(childMenusData);
            } catch (error) {
                console.error("Failed to fetch menus:", error);
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
                <div className="bg-dark text-white p-2 opacity-75">{fullName}</div>
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
                </Nav>


                <Nav className="d-flex flex-column">
                    {menuItemsParent.length > 0 &&
                        menuItemsParent.map((parentMenu) => (
                            <div key={parentMenu.menuId} className="mb-2">
                                {/* Parent Menu - Single Line */}
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

                                {/* Child Menus - Appears Under Parent */}
                                {openMenus[parentMenu.menuId] && (
                                    <div className="ms-4">
                                        {menuItems[parentMenu.menuId]?.map((menu: GetMenuChildResponse) => (
                                            <NavItem key={menu.menuId} className="ms-3">
                                                <Link to={menu.menuURL} className="nav-link text-secondary">{menu.menuName}</Link>
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
