import { cn } from '@/lib/utils';
import { removeAuthToken } from '@/utils/token';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

function AdminNavbar() {
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
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-end h-16">
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
    );
}

export default AdminNavbar
