import { cn } from '@/lib/utils';

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { removeAuthToken } from '@/utils/token';

export default function UserNavbar() {
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [isDelayedVisible, setIsDelayedVisible] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        removeAuthToken();
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


    return (
        <nav id='navbar' className={cn(
            "bg-white fixed top-0 left-0 right-0 transition-transform duration-300 ease-in-out z-50  shadow-md ",
            isDelayedVisible ? 'transform translate-y-0' : 'transform -translate-y-full'
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo Section */}
                    <div className="hidden md:flex flex-shrink-0">
                        <Link to="/home" className="text-xl font-bold text-gray-800">
                            VintageVault
                        </Link>
                    </div>

                    {/* Search Bar Section */}
                    <div className="flex-1 max-w-xl px-4">
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full bg-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search products..."
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
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
