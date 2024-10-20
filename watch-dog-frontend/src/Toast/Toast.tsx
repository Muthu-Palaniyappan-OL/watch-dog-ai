// Toast.tsx
import React from 'react';

interface ToastProps {
    id: number;
    message: string;
    icon: JSX.Element;
    onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, icon, onDismiss }) => {
    return (
        <div className="flex items-center w-full max-w-xs p-4  rounded-lg shadow text-white bg-sky-500" role="alert">
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8  bg-red-500 rounded-lg  text:white">
                {icon}
            </div>
            <div className="ms-3 text-sm font-semibold">{message}</div>
            <button
                type="button"
                className="ms-auto -mx-1.5 -my-1.5 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 text-white bg-sky-500"
                onClick={() => onDismiss(id)}
                aria-label="Close"
            >
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
            </button>
        </div>
    );
};

export default Toast;
