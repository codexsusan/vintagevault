import { getAuthToken } from "@/utils/storage";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({
    children,
}: {
    children: JSX.Element;
}) {
    const { pathname } = useLocation();

    const isAuth = !!getAuthToken();

    if (isAuth) {
        return <>{children}</>;
    }

    return <Navigate to="/auth/login" replace state={{ referrer: pathname }} />;
}