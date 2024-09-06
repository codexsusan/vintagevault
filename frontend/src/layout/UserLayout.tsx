
import Navbar from '@/components/common/Navbar';
import { ConfettiProvider } from '@/providers/confetti-provider';
import ProtectedRoute from '@/router/ProtectedRoute';
import { ADMIN, getUserRole } from '@/utils/storage';
import { Navigate, Outlet } from 'react-router-dom';

function UserLayout() {

    const currentUserRole = getUserRole();


    console.log({ currentUserRole });

    if (currentUserRole === ADMIN) {
        return <Navigate to="/admin/dashboard" replace />
    }
    return (
        <ProtectedRoute>
            <div className="h-full font-inter">
                <div className="h-[75px] fixed inset-y-0 w-full z-50">
                    <Navbar />
                </div>
                <main className=" pt-[75px] h-full">
                    <ConfettiProvider>
                        <Outlet />
                    </ConfettiProvider>
                </main>
            </div>
        </ProtectedRoute>
    )
}

export default UserLayout
