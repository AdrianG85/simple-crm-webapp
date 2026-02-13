import React, { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Deal } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, parse } from 'date-fns';
import { sv } from 'date-fns/locale';

interface CustomCalendarProps {
    deals: Deal[];
    onDateClick?: (date: Date, dealsOnDate: Deal[]) => void;
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({ deals, onDateClick }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const monthInputRef = useRef<HTMLInputElement>(null);

    // Get all days to display (including days from prev/next month to fill the grid)
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentMonth]);

    // Map deals to dates
    const dealsByDate = useMemo(() => {
        const map = new Map<string, Deal[]>();
        deals.forEach(deal => {
            if (deal.expectedCloseDate && deal.stage !== 'won' && deal.stage !== 'lost') {
                const dateKey = deal.expectedCloseDate; // Already in YYYY-MM-DD format
                if (!map.has(dateKey)) {
                    map.set(dateKey, []);
                }
                map.get(dateKey)!.push(deal);
            }
        });
        return map;
    }, [deals]);

    const getDealsForDate = (date: Date): Deal[] => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return dealsByDate.get(dateKey) || [];
    };

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => setCurrentMonth(new Date());

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value; // format: YYYY-MM
        if (value) {
            const newDate = parse(value, 'yyyy-MM', new Date());
            setCurrentMonth(newDate);
        }
    };

    const triggerDatePicker = () => {
        if (monthInputRef.current) {
            if ('showPicker' in HTMLInputElement.prototype) {
                // Modern browsers supporting showPicker()
                (monthInputRef.current as any).showPicker();
            } else {
                // Fallback for older browsers
                monthInputRef.current.click();
            }
        }
    };

    const weekDays = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
    const today = new Date();

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-none">
                <div className="relative">
                    <button
                        onClick={triggerDatePicker}
                        className="text-lg font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1 -ml-3 rounded-xl transition-colors flex items-center gap-1 group"
                    >
                        {format(currentMonth, 'MMMM yyyy', { locale: sv })}
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                            Ändra
                        </span>
                    </button>
                    <input
                        ref={monthInputRef}
                        type="month"
                        className="sr-only" // Hidden visually but accessible
                        value={format(currentMonth, 'yyyy-MM')}
                        onChange={handleDateChange}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleToday}
                        className="px-3 py-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                        Idag
                    </button>
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 flex-none">
                {weekDays.map(day => (
                    <div
                        key={day}
                        className="p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-auto">
                {calendarDays.map((day, idx) => {
                    const dealsOnDate = getDealsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isToday = isSameDay(day, today);
                    const hasDeals = dealsOnDate.length > 0;

                    return (
                        <button
                            key={idx}
                            onClick={() => onDateClick?.(day, dealsOnDate)}
                            className={`
                                relative p-2 border-r border-b border-gray-200 dark:border-gray-700 
                                hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                                ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
                                ${isToday ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                            `}
                        >
                            <div className="flex flex-col items-center justify-start h-full">
                                <span
                                    className={`
                                        text-sm font-medium mb-1
                                        ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}
                                        ${isToday ? 'bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
                                    `}
                                >
                                    {format(day, 'd')}
                                </span>
                                {hasDeals && (
                                    <div className="flex flex-wrap gap-1 justify-center">
                                        {dealsOnDate.slice(0, 3).map((deal, i) => (
                                            <div
                                                key={i}
                                                className={`
                                                    w-1.5 h-1.5 rounded-full
                                                    ${deal.stage === 'potential' ? 'bg-blue-500' : 'bg-amber-500'}
                                                `}
                                                title={deal.title}
                                            />
                                        ))}
                                        {dealsOnDate.length > 3 && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                +{dealsOnDate.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
