import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomCalendar } from '../components/CustomCalendar';
import type { Deal } from '../types';

export const CalendarPage: React.FC = () => {
    const { deals, loading } = useApp();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedDeals, setSelectedDeals] = useState<Deal[]>([]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const handleDateClick = (date: Date, dealsOnDate: Deal[]) => {
        if (dealsOnDate.length > 0) {
            setSelectedDate(date);
            setSelectedDeals(dealsOnDate);
        }
    };

    const handleCloseModal = () => {
        setSelectedDate(null);
        setSelectedDeals([]);
    };

    return (
        <div className="space-y-4 h-auto md:h-[calc(100vh-8rem)] flex flex-col pb-24 md:pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-none">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kalender</h1>
                    <p className="text-gray-500 dark:text-gray-400">Se dina affärsdeadlines i kalendervyn.</p>
                </div>
            </div>

            {/* Calendar View */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-[500px] md:min-h-0">
                <CustomCalendar deals={deals} onDateClick={handleDateClick} />
            </div>

            {/* Deal Details Modal */}
            {selectedDate && selectedDeals.length > 0 && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                Affärer - {selectedDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}
                            </h3>
                            <div className="space-y-3">
                                {selectedDeals.map(deal => (
                                    <div
                                        key={deal.id}
                                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{deal.title}</h4>
                                            <span
                                                className={`
                                                    text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap
                                                    ${deal.stage === 'potential' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}
                                                `}
                                            >
                                                {deal.stage === 'potential' ? 'Möjlighet' : 'Planerat'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Värde: {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: deal.currency, maximumFractionDigits: 0 }).format(deal.value)}
                                        </p>
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
            )}
        </div>
    );
};
