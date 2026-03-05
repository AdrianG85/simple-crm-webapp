import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CustomCalendar } from '../components/CustomCalendar';
import { WeeklyGoalTracker } from '../components/WeeklyGoalTracker';
import type { CalendarEvent } from '../types';

function shortUser(email?: string) {
    if (!email) return null;
    return email.includes('@') ? email.split('@')[0] : email;
}

function eventTypeLabel(type: CalendarEvent['type']): string {
    switch (type) {
        case 'deal-deadline': return 'Deadline – Affär';
        case 'new-deal': return 'Ny affär skapad';
        case 'new-contact': return 'Ny kontakt skapad';
    }
}

function eventTypeBadge(type: CalendarEvent['type']): string {
    switch (type) {
        case 'deal-deadline': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'new-deal': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        case 'new-contact': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
}

function stageLabel(stage?: string): string {
    switch (stage) {
        case 'potential': return 'Möjlighet';
        case 'placed': return 'Planerat';
        case 'won': return 'Vunnet';
        case 'lost': return 'Förlorat';
        default: return stage || '';
    }
}

export const CalendarPage: React.FC = () => {
    const { deals, contacts, loading } = useApp();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);

    // Build combined calendar events
    const events = useMemo((): CalendarEvent[] => {
        const ev: CalendarEvent[] = [];

        // 1. Deal deadlines (existing expected close dates for active deals)
        deals
            .filter(d => d.expectedCloseDate && d.stage !== 'won' && d.stage !== 'lost')
            .forEach(d => ev.push({
                id: `${d.id}-deadline`,
                title: d.title,
                type: 'deal-deadline',
                date: d.expectedCloseDate!,
                createdBy: d.createdBy,
                stage: d.stage,
                value: d.value,
                currency: d.currency,
            }));

        // 2. New deals by creation date
        deals
            .filter(d => d.createdAt)
            .forEach(d => ev.push({
                id: `${d.id}-created`,
                title: d.title,
                type: 'new-deal',
                date: d.createdAt.substring(0, 10),
                createdBy: d.createdBy,
                stage: d.stage,
                value: d.value,
                currency: d.currency,
            }));

        // 3. New contacts by creation date
        contacts
            .filter(c => c.createdAt)
            .forEach(c => ev.push({
                id: `${c.id}-created`,
                title: c.name,
                type: 'new-contact',
                date: c.createdAt.substring(0, 10),
                createdBy: c.createdBy,
            }));

        return ev;
    }, [deals, contacts]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const handleDateClick = (date: Date, eventsOnDate: CalendarEvent[]) => {
        if (eventsOnDate.length > 0) {
            setSelectedDate(date);
            setSelectedEvents(eventsOnDate);
        }
    };

    const handleCloseModal = () => {
        setSelectedDate(null);
        setSelectedEvents([]);
    };

    return (
        <div className="space-y-4 h-auto md:h-[calc(100vh-8rem)] flex flex-col pb-24 md:pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-none">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kalender</h1>
                    <p className="text-gray-500 dark:text-gray-400">Se affärsdeadlines, nya affärer och nya kontakter.</p>
                </div>
            </div>

            {/* Calendar View - Desktop with Sidebar */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
                {/* Desktop Sidebar */}
                <div className="hidden md:block w-64 flex-shrink-0">
                    <WeeklyGoalTracker />
                </div>

                {/* Calendar */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-[500px] md:min-h-0">
                    {/* Mobile Goal Tracker */}
                    <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-700">
                        <WeeklyGoalTracker />
                    </div>
                    <CustomCalendar events={events} onDateClick={handleDateClick} />
                </div>
            </div>

            {/* Event Details Modal */}
            {selectedDate && selectedEvents.length > 0 && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl w-full md:max-w-lg max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 pb-24 md:pb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                {selectedDate.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}
                                <span className="ml-2 text-sm font-normal text-gray-400">({selectedEvents.length} händelser)</span>
                            </h3>
                            <div className="space-y-3">
                                {selectedEvents.map(ev => (
                                    <div key={ev.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{ev.title}</h4>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${eventTypeBadge(ev.type)}`}>
                                                {eventTypeLabel(ev.type)}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                            {ev.value !== undefined && (
                                                <p>Värde: <span className="font-medium text-gray-700 dark:text-gray-200">
                                                    {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: ev.currency || 'SEK', maximumFractionDigits: 0 }).format(ev.value)}
                                                </span></p>
                                            )}
                                            {ev.stage && (
                                                <p>Status: <span className="font-medium text-gray-700 dark:text-gray-200">{stageLabel(ev.stage)}</span></p>
                                            )}
                                            {ev.createdBy && (
                                                <p className="flex items-center gap-1">
                                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold text-[9px]">
                                                        {shortUser(ev.createdBy)?.[0]?.toUpperCase()}
                                                    </span>
                                                    Tillagd av: <span className="font-medium text-gray-700 dark:text-gray-200">{shortUser(ev.createdBy)}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="mt-4 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                            >
                                Stäng
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};
