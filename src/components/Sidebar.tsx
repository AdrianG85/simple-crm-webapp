import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, Users, Trello, Calendar, Moon, Sun, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { icon: LayoutDashboard, label: 'Översikt', path: '/' },
    { icon: Users, label: 'Våra kontakter', path: '/contacts' },
    { icon: Trello, label: 'Våra affärer', path: '/pipeline' },
    { icon: Calendar, label: 'Kalender', path: '/calendar' },
];

export const Sidebar: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        if (window.confirm('Är du säker på att du vill logga ut?')) {
            await signOut();
        }
    };

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen fixed left-0 top-0 z-30 transition-colors duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 p-2 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-bold text-[10px] tracking-tighter shadow-sm flex-shrink-0">
                        ADGS
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-medium text-gray-600 dark:text-gray-200 truncate tracking-tight">{user?.email}</p>
                    </div>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-1">
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
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-4 py-2 w-full rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <span className="font-medium">{theme === 'light' ? 'Mörkt läge' : 'Ljust läge'}</span>
                </button>

                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-2 w-full rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logga ut</span>
                </button>

            </div>
        </aside>
    );
};
