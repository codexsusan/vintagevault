import { cn } from '@/lib/utils';

import { ADMIN, getUserRole, removeAuthToken, removeUserRole, USER } from '@/utils/storage';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

import { LogOut, User, UserPen } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { useQueryClient } from '@tanstack/react-query';

export default function Navbar() {
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [isDelayedVisible, setIsDelayedVisible] = useState(true);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleLogout = () => {
        queryClient.clear();
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

                    <div className="flex flex-shrink-0">
                        <Link to={navigateTo} className="text-xl font-bold text-gray-800">
                            VintageVault
                        </Link>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full bg-slate-50">
                                <User className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent >
                            {
                                currentUserRole === USER && (
                                    <Link to={"/profile"}>
                                        <DropdownMenuItem className="hover:cursor-pointer flex justify-around font-medium font-inter" >
                                            <UserPen className="h-5 w-5" />
                                            <p>Profile</p>
                                        </DropdownMenuItem>
                                    </Link>
                                )
                            }

                            <DropdownMenuItem onClick={handleLogout} className="hover:cursor-pointer flex justify-around font-medium font-inter">
                                <LogOut className="h-5 w-5" />
                                <p>Log out</p>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav >
    )
}
