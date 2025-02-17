import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "./Path";

/****Layouts*****/
const FullLayout = lazy(() => import("../layouts/FullLayout.tsx"));
/***** Pages ****/
const Login = lazy(() => import("../views/Login/Login.tsx"));
const MasterPage = lazy(() => import("../views/MasterPage.tsx"));
const MainPage = lazy(() => import("../views/MainPage.tsx"));
const BankGuarantee = lazy(() => import("../views/DO_BG/BankGuarantee.tsx"));

/*****Routes******/
const ThemeRoutes = [
    // Login as a parent route
    {
        path: ROUTES.login,
        element: <Login />,
        children: [
            { path: ROUTES.login, exact: true, element: <Login /> },
        ],
    },
    {
        path: "/",
        element: <FullLayout />,
        children: [
            { path: "/", element: <Navigate to={ROUTES.master} /> },
            { path: ROUTES.main, exact: true, element: <MainPage /> },
            { path: ROUTES.master, exact: true, element: <MasterPage /> },
            { path: ROUTES.bankGuarantee, exact: true, element: <BankGuarantee /> },
        ],
    },
];

export default ThemeRoutes;
