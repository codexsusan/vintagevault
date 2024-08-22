import { useState, useEffect } from 'react';
import { differenceInSeconds, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
    endTime: Date;
    classname?: string;
}

const CountDown = ({ endTime, classname }: CountdownTimerProps) => {
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
            return;
        }

        const days = differenceInDays(endTime, now);
        const hours = differenceInHours(endTime, now) - days * 24;
        const minutes = differenceInMinutes(endTime, now) - days * 24 * 60 - hours * 60;
        const seconds = distance - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

        setTimeRemaining(
            `${days}d ${hours}h ${minutes}m ${seconds}s`
        );
    };

    return <div className={cn(classname, '')}>{isEnded ? 'Ended' : timeRemaining}</div>;
};

export default CountDown;