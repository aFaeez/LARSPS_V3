import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import useFetchMenuData from "./Path";

/****Layouts*****/
const FullLayout = lazy(() => import("../layouts/FullLayout.tsx"));
/***** Pages ****/
const Login = lazy(() => import("../views/Login/Login.tsx"));
const MasterPage = lazy(() => import("../views/MasterPage.tsx"));
const MainPage = lazy(() => import("../views/MainPage.tsx"));
const BankGuarantee = lazy(() => import("../views/Operation/BankGuarantee.tsx"));
const NotFound = lazy(() => import("../views/NotFound.tsx"));

const BASE_PATH = "/LARSPSv3";

/*****Routes Component******/
const Themeroutes = (): RouteObject[] => {
    const { isLoading, routes } = useFetchMenuData();

    if (isLoading) {
        return [
            { path: `${BASE_PATH}/login`, element: <Login /> }
        ];
    }

    return [
        {
            path: "/",
            element: <Navigate to={`${BASE_PATH}/login`} replace />,
        },
        {
            path: `${BASE_PATH}/login`,
            element: <Login />,
        },
        {
            path: "/",
            element: <FullLayout />,
            children: [
                { path: BASE_PATH, element: <Navigate to={`${BASE_PATH}/login`} replace /> },
                //{ path: routes["master (v3)"], element: <MasterPage /> },
                { path: routes?.master ? routes["master (v3)"] : `LARSPSv3/MasterPage`, element: <MasterPage /> },
                { path: routes["dashboard"], element: <MainPage /> },
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