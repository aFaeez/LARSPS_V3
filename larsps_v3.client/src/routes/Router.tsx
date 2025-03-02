import { lazy, useState, useEffect } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import Path from "./Path";
import * as API from "../services/apiService";
import { Settings } from "../dto/dtos";
import RedirectHandler from "./RedirectHandler.tsx";
/****Layouts*****/
const FullLayout = lazy(() => import("../layouts/FullLayout.tsx"));
/***** Pages ****/
const Login = lazy(() => import("../views/Login/Login.tsx"));
const MasterPage = lazy(() => import("../views/MasterPage.tsx"));
const MainPage = lazy(() => import("../views/MainPage.tsx"));
const BankGuarantee = lazy(() => import("../views/Operation/BankGuarantee.tsx"));
const NotFound = lazy(() => import("../views/NotFound.tsx"));


/*****Routes Component******/
const Themeroutes = (): RouteObject[] => {
    const { isLoading, routes } = Path();
    const [config, setConfig] = useState<Settings>();
    const [isConfigLoaded, setIsConfigLoaded] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await API.WebConfig();
                //console.log("Config Fetched:", response);

                setConfig(response);
                setIsConfigLoaded(true);
            } catch (error) {
                console.error("Error fetching config:", error);
                setIsConfigLoaded(true); // Ensure it doesn't hang on loading
            }
        };
        fetchConfig();
    }, []);

    // Prevent rendering routes if config is not loaded
    if (!isConfigLoaded) {
        return [{ path: "*", element: <div>Loading...</div> }];
    }

    // If config failed to load, show an error page
    if (!config) {
        return [{ path: "*", element: <div>Error loading configuration.</div> }];
    }

    if (isLoading) {
        return [
            { path: `/${config?.systemName}/login`, element: <Login /> }
        ];
    }

    return [
        {
            path: "/",
            element: <Navigate to={`/${config?.systemName}/Login`} replace />,
        },
        {
            path: `${config?.systemName}/Login`,
            element: <Login />,
        },
        {
            path: "/",
            element: <FullLayout />,
            children: [
                { path: config?.systemName, element: <Navigate to={`/${config?.systemName}/Login`} replace /> },
                { path: `${config?.systemName}/${config?.landingPage?.replace(/^~\//, "")}`, element: <MasterPage /> },
                { path: `${config?.systemName}/${config?.mainPage?.replace(/^~\//, "")}`, element: <MainPage /> },
                { path: routes["bank guarantee/advance payment bond"], element: <BankGuarantee /> },
            ],
        },
        // Redirect Routes
        ...Object.values(routes).map((route) => ({
            path: route,
            element: <RedirectHandler />,
        })),
        //{ path: "/LARSPSv2/Operation/ExtensionOfTime", element: <RedirectHandler /> },
        {
            path: "*",
            element: <NotFound />,
        },
    ];
};
export default Themeroutes;