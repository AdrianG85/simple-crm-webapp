import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Trello, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
    { icon: LayoutDashboard, label: 'Översikt', path: '/' },
    { icon: Users, label: 'Kontakter', path: '/contacts' },
    { icon: Trello, label: 'Affärer', path: '/pipeline' },
    { icon: Calendar, label: 'Kalender', path: '/calendar' },
];

export const MobileNav: React.FC = () => {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 px-0 pb-safe-area transition-colors duration-200">
            <div className="grid grid-cols-5 h-16 w-full">
                {navItems.slice(0, 2).map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center h-full space-y-1 min-w-0",
                                isActive ? "text-primary-600 dark:text-primary-400" : "text-gray-400 dark:text-gray-500"
                            )
                        }
                    >
                        <item.icon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </NavLink>
                ))}

                {/* Center spacer for FAB */}
                <div className="flex items-center justify-center" />

                {navItems.slice(2).map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center h-full space-y-1 min-w-0",
                                isActive ? "text-primary-600 dark:text-primary-400" : "text-gray-400 dark:text-gray-500"
                            )
                        }
                    >
                        <item.icon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};
