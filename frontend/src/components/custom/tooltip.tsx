
import React, { ReactNode } from 'react';

interface TooltipProps {
    text: string;
    children: ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
    return (
        <div className="relative group">
            {children}
            {
                text.length > 0 && (
                    <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 top-full left-1/2 transform -translate-x-1/2 translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className='text-base'>{text}</span>
                        <svg className="absolute text-gray-800 h-2 w-full left-0 bottom-full" x="0px" y="0px" viewBox="0 0 255 255">
                            <polygon className="fill-current" points="0,255 127.5,127.5 255,255" />
                        </svg>
                    </div>
                )
            }

        </div>
    );
};

export default Tooltip;