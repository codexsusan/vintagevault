import UserLayout from "@/layout/UserLayout";
import Login from "@/pages/auth/Login";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/user/Home";
import { createBrowserRouter } from "react-router-dom";
import InitialRoute from "./InitialRoute";
import AdminLayout from "@/layout/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import AddItem from "@/pages/admin/AddItem";

const router = createBrowserRouter([
    {
        path: "/",
        element: <InitialRoute />,
    },
    {
        path: "/auth/login",
        element: <Login />,
    },
    {
        path: "/",
        element: <UserLayout />,
        errorElement: <NotFound />,
        children: [
            {
                path: "/home",
                element: <Home />
            },
        ]
    },
    {
        path: "/admin",
        element: <AdminLayout />,
        // errorElement: <NotFound />,
        children: [
            {
                path: "dashboard",
                element: <Dashboard />
            },
            {
                path: "new",
                element: <AddItem />
            }
        ]
    },
    { path: "*", element: <NotFound /> },
]);

export default router;