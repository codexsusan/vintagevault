
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '@/utils/storage';

export default function InitialRoute() {
    const navigate = useNavigate();
    const isAuth = !!getAuthToken();

    useEffect(() => {
        if (isAuth) {
            navigate('/home');
        } else {
            navigate('/auth/login');
        }
    }, [isAuth, navigate]);

    return null;
}