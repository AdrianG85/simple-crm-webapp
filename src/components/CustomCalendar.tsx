import React, { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarEvent } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, parse } from 'date-fns';
import { sv } from 'date-fns/locale';

interface CustomCalendarProps {
    events: CalendarEvent[];
    onDateClick?: (date: Date, eventsOnDate: CalendarEvent[]) => void;
}

function eventDotColor(type: CalendarEvent['type']): string {
    switch (type) {
        case 'deal-deadline': return 'bg-blue-500';
        case 'new-deal': return 'bg-amber-400';
        case 'new-contact': return 'bg-green-500';
    }
}

function eventLabelColor(type: CalendarEvent['type']): string {
    switch (type) {
        case 'deal-deadline': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200';
        case 'new-deal': return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200';
        case 'new-contact': return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200';
    }
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({ events, onDateClick }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const monthInputRef = useRef<HTMLInputElement>(null);

    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentMonth]);

    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        events.forEach(ev => {
            if (!map.has(ev.date)) map.set(ev.date, []);
            map.get(ev.date)!.push(ev);
        });
        return map;
    }, [events]);

    const getEventsForDate = (date: Date): CalendarEvent[] => {
        return eventsByDate.get(format(date, 'yyyy-MM-dd')) || [];
    };

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => setCurrentMonth(new Date());

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value) setCurrentMonth(parse(value, 'yyyy-MM', new Date()));
    };

    const triggerDatePicker = () => {
        if (monthInputRef.current) {
            if ('showPicker' in HTMLInputElement.prototype) {
                (monthInputRef.current as any).showPicker();
            } else {
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
                        className="sr-only"
                        value={format(currentMonth, 'yyyy-MM')}
                        onChange={handleDateChange}
                    />
                </div>

                {/* Legend */}
                <div className="hidden md:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Deadline</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Ny affär</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Ny kontakt</span>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handleToday} className="px-3 py-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                        Idag
                    </button>
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 flex-none">
                {weekDays.map(day => (
                    <div key={day} className="p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-auto">
                {calendarDays.map((day, idx) => {
                    const eventsOnDate = getEventsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isToday = isSameDay(day, today);
                    const hasEvents = eventsOnDate.length > 0;

                    return (
                        <button
                            key={idx}
                            onClick={() => onDateClick?.(day, eventsOnDate)}
                            className={`
                                relative p-1 md:p-2 border-r border-b border-gray-200 dark:border-gray-700
                                hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left
                                ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
                                ${isToday ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                            `}
                        >
                            <div className="flex flex-col h-full">
                                {/* Date number */}
                                <span className={`
                                    text-xs md:text-sm font-medium mb-0.5 self-start
                                    ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}
                                    ${isToday ? 'bg-primary-600 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center' : ''}
                                `}>
                                    {format(day, 'd')}
                                </span>

                                {hasEvents && (
                                    <div className="flex flex-col gap-0.5 overflow-hidden mt-0.5">
                                        {/* Mobile: just dots */}
                                        <div className="flex md:hidden flex-wrap gap-0.5">
                                            {eventsOnDate.slice(0, 3).map((ev, i) => (
                                                <span key={i} className={`w-1.5 h-1.5 rounded-full ${eventDotColor(ev.type)}`} title={ev.title} />
                                            ))}
                                            {eventsOnDate.length > 3 && <span className="text-[9px] text-gray-400">+{eventsOnDate.length - 3}</span>}
                                        </div>
                                        {/* Desktop: labelled chips */}
                                        <div className="hidden md:flex flex-col gap-0.5">
                                            {eventsOnDate.slice(0, 2).map((ev, i) => (
                                                <span key={i} className={`flex items-center gap-0.5 text-[9px] font-medium px-1 py-0.5 rounded truncate ${eventLabelColor(ev.type)}`}>
                                                    <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${eventDotColor(ev.type)}`} />
                                                    <span className="truncate">{ev.title}</span>
                                                </span>
                                            ))}
                                            {eventsOnDate.length > 2 && (
                                                <span className="text-[9px] text-gray-400 dark:text-gray-500 pl-1">+{eventsOnDate.length - 2} till</span>
                                            )}
                                        </div>
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
