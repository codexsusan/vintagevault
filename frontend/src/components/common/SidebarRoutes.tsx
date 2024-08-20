import { Layout, LayoutList, User, Users } from "lucide-react";
import SidebarItem from "./SidebarItem";

const routes = [
    {
        icon: Layout,
        label: "Dashboard",
        href: "/admin/dashboard",
    },
    {
        icon: LayoutList,
        label: "Drafts",
        href: "/admin/drafts",
    },
    {
        icon: Users,
        label: "Users",
        href: "/users",
    },
    {
        icon: User,
        label: "Profile",
        href: "/profile",
    },

];

const SidebarRoutes = () => {
    return (
        <div className="flex flex-col w-full">
            {routes.map((route) => {
                return (
                    <SidebarItem
                        key={route.href}
                        icon={route.icon}
                        label={route.label}
                        href={route.href}
                    />
                );
            })}
        </div>
    );
};

export default SidebarRoutes;