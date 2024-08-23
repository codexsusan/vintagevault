import { cn } from '@/lib/utils';

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ADMIN, getUserRole, removeAuthToken, removeUserRole, USER } from '@/utils/storage';

export default function Navbar() {
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [isDelayedVisible, setIsDelayedVisible] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        removeAuthToken();
        removeUserRole();
        navigate("/auth/login");
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.scrollY;
            const visible = prevScrollPos > currentScrollPos || currentScrollPos < 10;

            setPrevScrollPos(currentScrollPos);

            if (visible) {
                setIsDelayedVisible(true);
            } else {
                const timer = setTimeout(() => setIsDelayedVisible(false), 200); // 200ms delay
                return () => clearTimeout(timer);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [prevScrollPos]);  // This effect will run when the scroll position changes

    const currentUserRole = getUserRole();

    const navigateTo =
        currentUserRole === ADMIN ?
            "/admin/dashboard" :
            currentUserRole === USER ?
                "/home" : "/auth/login";

    return (
        <nav id='navbar' className={cn(
            "bg-white fixed top-0 left-0 right-0 transition-transform duration-300 ease-in-out z-50  shadow-md ",
            isDelayedVisible ? 'transform translate-y-0' : 'transform -translate-y-full'
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo Section */}
                    <div className="hidden md:flex flex-shrink-0">
                        <Link to={navigateTo} className="text-xl font-bold text-gray-800">
                            VintageVault
                        </Link>
                    </div>

                    {/* Logout Button */}
                    <Button
                        className='bg-blue-600 hover:bg-blue-700'
                        onClick={handleLogout}
                        size={"default"}
                        variant={"outline"}>
                        <span className="text-base font-normal text-white">Logout</span>
                    </Button>
                </div>
            </div>
        </nav >
    )
}
