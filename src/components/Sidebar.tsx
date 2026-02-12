import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, Users, Trello, Calendar, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
    { icon: LayoutDashboard, label: 'Översikt', path: '/' },
    { icon: Users, label: 'Våra kontakter', path: '/contacts' },
    { icon: Trello, label: 'Våra affärer', path: '/pipeline' },
    { icon: Calendar, label: 'Kalender', path: '/calendar' },
];

export const Sidebar: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen fixed left-0 top-0 z-30 transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Simpel CRM</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium",
                                isActive
                                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                            )
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-4 py-2 w-full rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <span className="font-medium text-sm">{theme === 'light' ? 'Mörkt läge' : 'Ljust läge'}</span>
                </button>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-bold text-[10px] tracking-tighter shadow-sm">
                        ADGS
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">Spasovic & Gonzalez AB</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
