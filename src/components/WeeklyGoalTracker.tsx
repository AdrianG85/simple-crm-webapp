import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

interface UserProgress {
    email: string;
    initial: string;
    count: number;
    goalMet: boolean;
}

export const WeeklyGoalTracker: React.FC = () => {
    const { contacts } = useApp();
    const WEEKLY_GOAL = 1;

    // Hardcoded team members
    const TEAM_MEMBERS = [
        'adrian@adgs.se',
        'dejan@adgs.se'
    ];

    const weeklyProgress = useMemo(() => {
        // Get the start of the current week (Monday)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + diff);
        weekStart.setHours(0, 0, 0, 0);

        // Count contacts created this week by each user
        const userCounts = new Map<string, number>();

        contacts.forEach(contact => {
            if (contact.createdBy && contact.createdAt) {
                const createdDate = new Date(contact.createdAt);
                if (createdDate >= weekStart) {
                    const current = userCounts.get(contact.createdBy) || 0;
                    userCounts.set(contact.createdBy, current + 1);
                }
            }
        });

        // Create progress for all team members (even if they have 0 contacts)
        const progress: UserProgress[] = TEAM_MEMBERS.map(email => {
            const count = userCounts.get(email) || 0;
            return {
                email,
                initial: email[0].toUpperCase(),
                count,
                goalMet: count >= WEEKLY_GOAL
            };
        });

        // Sort by email to maintain consistent order
        return progress.sort((a, b) => a.email.localeCompare(b.email));
    }, [contacts]);

    // Get current week number
    const weekNumber = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now.getTime() - start.getTime();
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.floor(diff / oneWeek) + 1;
    }, []);

    return (
        <>
            {/* Mobile: Horizontal Scroll Chips */}
            <div className="md:hidden mb-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                        V.{weekNumber} Mål:
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-4 pb-2">
                    {weeklyProgress.map((user) => (
                        <div
                            key={user.email}
                            className={cn(
                                "flex-shrink-0 px-4 py-3 rounded-xl border-2 min-w-[120px] text-center flex flex-col items-center justify-center",
                                user.goalMet
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                    : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                            )}
                        >
                            <div className="flex items-center justify-center gap-2 mb-2 w-full">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize truncate">
                                    {user.email.split('@')[0]}
                                </span>
                                <span className="text-lg flex-shrink-0">
                                    {user.goalMet ? '✅' : '⚠️'}
                                </span>
                            </div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                                {user.count}/{WEEKLY_GOAL}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop: Separate Cards */}
            <div className="hidden md:flex md:flex-col md:gap-3">
                {/* Header Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📈</span>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Veckans Mål</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Vecka {weekNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Individual User Cards */}
                {weeklyProgress.map((user) => (
                    <div
                        key={user.email}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary-600 dark:bg-primary-500 text-white flex items-center justify-center text-xs font-bold">
                                    {user.initial}
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                    {user.email.split('@')[0]}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {user.count}/{WEEKLY_GOAL}
                                </span>
                                <span className="text-lg">
                                    {user.goalMet ? '✅' : '⚠️'}
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden mb-2">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-300",
                                    user.goalMet
                                        ? "bg-green-500 dark:bg-green-400"
                                        : "bg-amber-500 dark:bg-amber-400"
                                )}
                                style={{ width: `${Math.min((user.count / WEEKLY_GOAL) * 100, 100)}%` }}
                            />
                        </div>
                        {user.goalMet ? (
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                MÅL UPPNÅTT!
                            </p>
                        ) : (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                Behöver {WEEKLY_GOAL - user.count} till
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};
