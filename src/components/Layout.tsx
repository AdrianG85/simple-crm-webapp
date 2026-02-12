import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { MobileFAB } from './MobileFAB';

export const Layout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-200">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen transition-all">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Navigation */}
            <MobileNav />

            {/* Mobile FAB */}
            <MobileFAB />
        </div>
    );
};
