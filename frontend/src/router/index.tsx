import AdminLayout from "@/layout/AdminLayout";
import UserLayout from "@/layout/UserLayout";
import AddItem from "@/pages/admin/AddItem";
import Dashboard from "@/pages/admin/Dashboard";
import UpdateItem from "@/pages/admin/UpdateItem";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/user/Home";
import ItemDetails from "@/pages/user/ItemDetails";
import ProfilePage from "@/pages/user/ProfilePage";
import { createBrowserRouter } from "react-router-dom";
import InitialRoute from "./InitialRoute";

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
        path: "/auth/register",
        element: <Register />,
    },
    {
        path: "/",
        element: <UserLayout />,
        children: [
            {
                path: "/profile",
                element: <ProfilePage />
            },
            {
                path: "/home",
                element: <Home />
            },
            {
                path: "/item/:id",
                element: <ItemDetails />
                // element: <Home />
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
                path: "item/new",
                element: <AddItem />
            },
            {
                path: "item/update/:id",
                element: <UpdateItem />
            },
        ]
    },
    { path: "*", element: <NotFound /> },
]);

export default router;