import Navbar from "@/components/common/Navbar";
import ProtectedRoute from "@/router/ProtectedRoute";
import { getUserRole, USER } from "@/utils/storage";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

function AdminLayout() {

    const currentUserRole = getUserRole();
    const navigate = useNavigate();

    if (currentUserRole === USER) {
        navigate("/home");
        return <Navigate to="/home" replace />
    }
    return (
        <ProtectedRoute>
            <div className="h-full font-inter">
                <div className="h-[75px] md:pl-56 fixed inset-y-0 w-full z-50">
                    <Navbar />
                </div>
                <main className="pt-[75px] h-full">
                    <Outlet />
                </main>
            </div>
        </ProtectedRoute>
    );
}

export default AdminLayout;