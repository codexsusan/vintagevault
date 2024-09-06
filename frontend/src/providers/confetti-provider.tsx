import { createContext, ReactNode, useState } from "react";
import ReactConfetti from "react-confetti";

type ConfettiContextType = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

export const ConfettiContext = createContext<ConfettiContextType | undefined>(undefined);

export const ConfettiProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    return (
        <ConfettiContext.Provider value={{ isOpen, onOpen, onClose }}>
            {children}
            {isOpen && (
                <ReactConfetti
                    className="pointer-events-none z-[100]"
                    numberOfPieces={500}
                    recycle={false}
                    onConfettiComplete={onClose}
                />
            )}
        </ConfettiContext.Provider>
    );
};


