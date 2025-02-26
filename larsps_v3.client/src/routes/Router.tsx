import { lazy, useState, useEffect } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import useFetchMenuData from "./Path";
import * as API from "../services/apiService";
import { Settings } from "../dto/dtos";
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
    const { isLoading, routes } = useFetchMenuData();
    const [config, setConfig] = useState<Settings>();

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await API.WebConfig();
                setConfig(response);

            } catch (error) {
                console.error("Error fetching config:", error);
            }
        };
        fetchConfig();
    }, []);

    if (isLoading) {
        return [
            { path: `/${config?.systemName}/login`, element: <Login /> }
        ];
    }

    return [
        {
            path: "/",
            element: <Navigate to={`/${config?.systemName}/login`} replace />,
        },
        {
            path: `${config?.systemName}/Login`,
            element: <Login />,
        },
        {
            path: "/",
            element: <FullLayout />,
            children: [
                { path: config?.systemName, element: <Navigate to={`/${config?.systemName}/login`} replace /> },
                { path: `${config?.systemName}/${config?.landingPage?.replace(/^~\//, "")}`, element: <MasterPage /> },
                { path: `${config?.systemName}/${config?.mainPage?.replace(/^~\//, "")}`, element: <MainPage /> },
                { path: routes["bank guarantee/advance payment bond"], element: <BankGuarantee /> },
            ],
        },
        {
            path: "*",
            element: <NotFound />,
        },
    ];
};
export default Themeroutes;