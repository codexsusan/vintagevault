
import Navbar from '@/components/common/Navbar'
import ProtectedRoute from '@/router/ProtectedRoute'
import { Outlet } from 'react-router-dom'

function UserLayout() {
    return (
        <ProtectedRoute>
            <div className="h-full font-inter">
                <div className="h-[75px] fixed inset-y-0 w-full z-50">
                    <Navbar />
                </div>
                <main className=" pt-[75px] h-full">
                    <Outlet />
                </main>
            </div>
        </ProtectedRoute>
    )
}

export default UserLayout
