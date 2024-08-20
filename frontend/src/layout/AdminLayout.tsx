import AdminNavbar from "@/components/common/AdminNavbar";
import Sidebar from "@/components/common/Sidebar";

import ProtectedRoute from "@/router/ProtectedRoute";
import { Outlet } from "react-router-dom";

function AdminLayout() {
    return (
        <ProtectedRoute>
            <div className="h-full font-inter">
                <div className="h-[75px] md:pl-56 fixed inset-y-0 w-full z-50">
                    <AdminNavbar />
                </div>
                <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
                    <Sidebar />
                </div>
                <main className="md:pl-56 pt-[75px] h-full">
                    <Outlet />
                </main>
            </div>
        </ProtectedRoute>
    );
}

export default AdminLayout;