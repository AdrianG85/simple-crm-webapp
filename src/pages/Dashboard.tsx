import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Coins, Briefcase, CheckCircle, TrendingUp, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { DealModal } from '../components/DealModal';
import type { Deal } from '../types';

export const Dashboard: React.FC = () => {
    const { deals, contacts, loading, updateDeal, deleteDeal } = useApp();
    const { theme, toggleTheme } = useTheme();
    const { signOut } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
    const [lastTap, setLastTap] = useState<number>(0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Metrics Calculations
    const totalPipelineValue = deals
        .filter(d => d.stage !== 'lost')
        .reduce((sum, deal) => sum + deal.value, 0);

    const activeCasesCount = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length;
    const wonCasesCount = deals.filter(d => d.stage === 'won').length;

    // Sort deals by value for Top Projects (descending)
    const topProjects = [...deals]
        .filter(d => d.stage !== 'lost')
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const handleEditDeal = (deal: Deal) => {
        setEditingDeal(deal);
        setIsModalOpen(true);
    };

    const handleUpdate = async (deal: Deal) => {
        try {
            await updateDeal(deal);
        } catch (error) {
            console.error('Failed to update deal:', error);
            alert('Kunde inte uppdatera affären.');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDeal(id);
        } catch (error) {
            console.error('Failed to delete deal:', error);
            alert('Kunde inte ta bort affären.');
        }
    };

    const handleTouchStart = (deal: Deal) => {
        const now = Date.now();
        if (now - lastTap < 300) {
            handleEditDeal(deal);
        }
        setLastTap(now);
    };

    return (
        <div className="space-y-6">
            <header className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Översikt</h1>
                    <p className="text-gray-500 dark:text-gray-400">Välkommen tillbaka! Här är läget just nu.</p>
                </div>

                {/* Mobile Controls */}
                <div className="flex items-center gap-2 md:hidden">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-5 h-5" />
                        ) : (
                            <Moon className="w-5 h-5" />
                        )}
                    </button>
                    <button
                        onClick={() => signOut()}
                        className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        aria-label="Logga ut"
                        title="Logga ut"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Value */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-32 relative overflow-hidden transition-colors">
                    <div className="absolute right-0 top-0 p-4 opacity-5 dark:opacity-10">
                        <Coins className="w-24 h-24 text-gray-900 dark:text-white" />
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 font-medium text-sm z-10">Total försäljning</span>
                    <div className="z-10">
                        <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-400">
                            {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(totalPipelineValue)}
                        </h2>
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" /> Nuvarande värde
                        </p>
                    </div>
                </div>

                {/* Active Cases */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-32 transition-colors">
                    <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">Aktiva Affärer</span>
                    <div className="flex items-end justify-between">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{activeCasesCount}</h2>
                        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-xs font-medium">
                            Pågående
                        </div>
                    </div>
                </div>

                {/* Won Cases */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-32 transition-colors">
                    <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">Vunna Affärer</span>
                    <div className="flex items-end justify-between">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{wonCasesCount}</h2>
                        <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-lg text-xs font-medium">
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            Klart
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Projects List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">Största Projektvärden</h3>
                    <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium focus:outline-none">Se alla</button>
                </div>
                <div>
                    {topProjects.length > 0 ? (
                        <div className="divide-y divide-gray-50 dark:divide-gray-700">
                            {topProjects.map((deal) => {
                                const contact = contacts.find(c => c.id === deal.contactId);
                                return (
                                    <div
                                        key={deal.id}
                                        onDoubleClick={() => handleEditDeal(deal)}
                                        onTouchStart={() => handleTouchStart(deal)}
                                        className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer select-none group"
                                        title="Dubbelklicka för att redigera"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm",
                                                deal.stage === 'won' ? 'bg-green-500' :
                                                    deal.stage === 'placed' ? 'bg-amber-400' : 'bg-primary-400'
                                            )}>
                                                {deal.title.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{deal.title}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Kund: {contact?.name || 'Okänd'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-gray-900 dark:text-white block">
                                                {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(deal.value)}
                                            </span>
                                            <span className={cn(
                                                "text-xs capitalize px-2 py-0.5 rounded-full inline-block mt-1",
                                                deal.stage === 'won' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                                    deal.stage === 'placed' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' :
                                                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                            )}>
                                                {deal.stage === 'potential' ? 'Möjlighet' :
                                                    deal.stage === 'placed' ? 'Planerat' :
                                                        deal.stage === 'won' ? 'Vunnet' : 'Förlorat'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                            <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>Inga affärer än. Börja med att lägga till din första affär!</p>
                        </div>
                    )}
                </div>
            </div>

            <DealModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleUpdate}
                onDelete={handleDelete}
                initialData={editingDeal}
            />
        </div>
    );
};
