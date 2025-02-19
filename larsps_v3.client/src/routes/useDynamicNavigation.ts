import { useNavigate } from "react-router-dom";
import useFetchMenuData from "./Path"; // Import the fetch function

const useDynamicNavigation = () => {
    const navigate = useNavigate();
    const { routes } = useFetchMenuData(); // Fetch dynamic routes

    const goTo = (menuName: string) => {

        if (!routes) {
            console.warn("Routes data is undefined or empty");
            return;
        }
        const route = routes?.[menuName.toLowerCase()]; 
        if (route) {
            navigate(route);
        } else {
            console.warn(`Route not found for menu: "${menuName}"`);
        }
    };

    return { goTo };
};

export default useDynamicNavigation;
