import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Trophy, CheckCircle2, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

interface Goal {
    target: number;
    rewards: string[];
    estimatedCost: number;
}

const GOALS: Goal[] = [
    { target: 10_000, rewards: ['Första middagen på företaget'], estimatedCost: 1_500 },
    { target: 100_000, rewards: ['Middag med respektive'], estimatedCost: 8_000 },
    {
        target: 250_000,
        rewards: [
            'Dejan: Körkort',
            'Claude Code Enterprise',
            'Adrian: Ge tillbaka Didi 12 500 kr för sponsring av företaget',
        ],
        estimatedCost: 60_000,
    },
    { target: 500_000, rewards: ['2x Nya High-end Laptops'], estimatedCost: 80_000 },
    { target: 1_000_000, rewards: ['Företagsresa med respektive (Kick-off)'], estimatedCost: 120_000 },
];

const formatSEK = (value: number) =>
    new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(value);

interface GoalsOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GoalsOverlay: React.FC<GoalsOverlayProps> = ({ isOpen, onClose }) => {
    const { deals } = useApp();

    const wonTotalValue = deals
        .filter(d => d.stage === 'won')
        .reduce((sum, deal) => sum + deal.value, 0);

    const nextGoalIndex = GOALS.findIndex(g => wonTotalValue < g.target);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-bold text-[10px] tracking-tighter shadow-sm">
                            ADGS
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Företagsmål
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Vunna affärer: <span className="font-semibold text-green-600 dark:text-green-400">{formatSEK(wonTotalValue)}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Goals List */}
                <div className="overflow-y-auto flex-1 p-4 space-y-3">
                    {GOALS.map((goal, index) => {
                        const isCompleted = wonTotalValue >= goal.target;
                        const isNext = index === nextGoalIndex;
                        const prevTarget = index === 0 ? 0 : GOALS[index - 1].target;
                        const progress = isCompleted
                            ? 100
                            : Math.min(100, Math.max(0, ((wonTotalValue - prevTarget) / (goal.target - prevTarget)) * 100));

                        return (
                            <div
                                key={goal.target}
                                className={cn(
                                    "rounded-xl border p-4 transition-all",
                                    isCompleted
                                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                        : isNext
                                            ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-700 ring-2 ring-yellow-400/30"
                                            : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-70"
                                )}
                            >
                                {/* Top row */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        ) : isNext ? (
                                            <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
                                        )}
                                        <span className={cn(
                                            "font-bold text-base",
                                            isCompleted ? "text-green-700 dark:text-green-400" :
                                                isNext ? "text-yellow-700 dark:text-yellow-400" :
                                                    "text-gray-700 dark:text-gray-300"
                                        )}>
                                            {formatSEK(goal.target)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 text-right flex-shrink-0">
                                        Est. kostnad: <span className="font-semibold">{formatSEK(goal.estimatedCost)}</span>
                                    </span>
                                </div>

                                {/* Rewards */}
                                <div className="text-sm text-gray-700 dark:text-gray-300 mb-3 space-y-1">
                                    {goal.rewards.map((r, i) => (
                                        <p key={i} className="leading-snug">🎁 {r}</p>
                                    ))}
                                </div>

                                {/* Progress bar */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                                        <span>{isCompleted ? 'Uppnått! 🎉' : isNext ? `${formatSEK(goal.target - wonTotalValue)} kvar` : 'Ej påbörjat'}</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-700",
                                                isCompleted ? "bg-green-500" :
                                                    isNext ? "bg-yellow-400" :
                                                        "bg-gray-300 dark:bg-gray-600"
                                            )}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>,
        document.body
    );
};
