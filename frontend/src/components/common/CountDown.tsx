import { useState, useEffect } from 'react';
import { differenceInSeconds, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
    endTime: Date;
    className?: string;
    onComplete?: () => void; // Optional callback for when countdown ends
}

const CountDown = ({ endTime, className, onComplete }: CountdownTimerProps) => {
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [isEnded, setIsEnded] = useState<boolean>(false);

    useEffect(() => {
        const interval = setInterval(() => {
            updateCountdown();
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    const updateCountdown = () => {
        const now = new Date();
        const distance = differenceInSeconds(endTime, now);

        if (distance < 0) {
            setTimeRemaining('Ended');
            setIsEnded(true);
            if (onComplete) {
                onComplete(); // Trigger the action if `onComplete` is provided
            }
            return;
        }

        const days = differenceInDays(endTime, now);
        const hours = differenceInHours(endTime, now) - days * 24;
        const minutes = differenceInMinutes(endTime, now) - days * 24 * 60 - hours * 60;
        const seconds = distance - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

        setTimeRemaining(
            `${days > 0 ? `${days}d ` : ''} ${hours > 0 ? `${hours}h ` : ''} ${minutes > 0 ? `${minutes}m ` : ''} ${seconds > 0 ? `${seconds}s` : ''}`
        );
    };

    return <div className={cn(className, '')}>{isEnded ? 'Ended' : timeRemaining}</div>;
};

export default CountDown;
