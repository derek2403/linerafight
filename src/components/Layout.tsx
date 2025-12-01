import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
            <div className="relative w-[375px] h-[667px] bg-white rounded-3xl overflow-hidden shadow-2xl border-8 border-gray-800 flex flex-col">
                {children}
            </div>
        </div>
    );
};
