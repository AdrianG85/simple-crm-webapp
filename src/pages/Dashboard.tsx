import React from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Coins, Briefcase, CheckCircle, TrendingUp, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';

export const Dashboard: React.FC = () => {
    const { deals, contacts, loading } = useApp();
    const { theme, toggleTheme } = useTheme();

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

    return (
        <div className="space-y-6">
            <header className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Översikt</h1>
                    <p className="text-gray-500 dark:text-gray-400">Välkommen tillbaka! Här är läget just nu.</p>
                </div>

                {/* Mobile Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    className="md:hidden p-2 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    {theme === 'dark' ? (
                        <Sun className="w-5 h-5" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                </button>
            </header>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Value */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-32 relative overflow-hidden transition-colors">
                    <div className="absolute right-0 top-0 p-4 opacity-5 dark:opacity-10">
                        <Coins className="w-24 h-24 text-gray-900 dark:text-white" />
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 font-medium text-sm z-10">Total Pipeline</span>
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
                    <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">Se alla</button>
                </div>
                <div>
                    {topProjects.length > 0 ? (
                        <div className="divide-y divide-gray-50 dark:divide-gray-700">
                            {topProjects.map((deal) => {
                                const contact = contacts.find(c => c.id === deal.contactId);
                                return (
                                    <div key={deal.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm",
                                                deal.stage === 'won' ? 'bg-green-500' :
                                                    deal.stage === 'placed' ? 'bg-amber-400' : 'bg-primary-400'
                                            )}>
                                                {deal.title.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{deal.title}</h4>
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
                                                {deal.stage}
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
        </div>
    );
};
