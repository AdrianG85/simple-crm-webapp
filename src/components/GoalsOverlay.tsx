import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Trophy, CheckCircle2, Star, Pencil, Check, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Goal } from '../context/AppContext';
import { useDemo } from '../context/DemoContext';
import { Redacted } from './ui/Redacted';
import { cn } from '../lib/utils';

const formatSEK = (value: number) =>
    new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(value);

interface GoalsOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

// Local draft type for edit mode (uses string inputs before parsing to numbers)
interface GoalDraft {
    id: string | null; // null = new, not yet saved
    target: string;
    estimated_cost: string;
    rewards: string[];
    sort_order: number;
}

function goalToDraft(g: Goal): GoalDraft {
    return {
        id: g.id,
        target: String(g.target),
        estimated_cost: String(g.estimated_cost),
        rewards: [...g.rewards],
        sort_order: g.sort_order,
    };
}

export const GoalsOverlay: React.FC<GoalsOverlayProps> = ({ isOpen, onClose }) => {
    const { deals, goals, addGoal, updateGoal, deleteGoal } = useApp();
    const { isDemoMode } = useDemo();

    const [editMode, setEditMode] = useState(false);
    const [drafts, setDrafts] = useState<GoalDraft[]>([]);
    const [saving, setSaving] = useState(false);

    const wonTotalValue = deals
        .filter(d => d.stage === 'won')
        .reduce((sum, deal) => sum + deal.value, 0);

    // Enter edit mode: clone goals into local drafts
    const handleEdit = () => {
        setDrafts(goals.map(goalToDraft));
        setEditMode(true);
    };

    // Cancel edit mode
    const handleCancel = () => {
        setDrafts([]);
        setEditMode(false);
    };

    // Save all draft changes to Supabase
    const handleSave = async () => {
        setSaving(true);
        try {
            const existingIds = goals.map(g => g.id);
            const draftIds = drafts.filter(d => d.id).map(d => d.id as string);

            // Delete goals that were removed
            for (const id of existingIds) {
                if (!draftIds.includes(id)) {
                    await deleteGoal(id);
                }
            }

            // Update or insert
            for (let i = 0; i < drafts.length; i++) {
                const d = drafts[i];
                const payload = {
                    target: parseFloat(d.target) || 0,
                    estimated_cost: parseFloat(d.estimated_cost) || 0,
                    rewards: d.rewards.filter(r => r.trim()),
                    sort_order: i,
                };
                if (d.id) {
                    await updateGoal(d.id, payload);
                } else {
                    await addGoal(payload);
                }
            }
            setEditMode(false);
            setDrafts([]);
        } catch (e) {
            console.error('Failed to save goals:', e);
        } finally {
            setSaving(false);
        }
    };

    // Add a new blank goal draft
    const handleAddGoal = () => {
        setDrafts(prev => [
            ...prev,
            { id: null, target: '', estimated_cost: '', rewards: [''], sort_order: prev.length },
        ]);
    };

    // Remove a goal draft entirely
    const handleRemoveDraft = (idx: number) => {
        setDrafts(prev => prev.filter((_, i) => i !== idx));
    };

    // Update a field on a draft
    const updateDraft = (idx: number, field: keyof Omit<GoalDraft, 'rewards'>, value: string | number) => {
        setDrafts(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
    };

    // Update a reward line
    const updateReward = (draftIdx: number, rewardIdx: number, value: string) => {
        setDrafts(prev => prev.map((d, i) => {
            if (i !== draftIdx) return d;
            const rewards = [...d.rewards];
            rewards[rewardIdx] = value;
            return { ...d, rewards };
        }));
    };

    // Add a reward to a draft
    const addReward = (draftIdx: number) => {
        setDrafts(prev => prev.map((d, i) =>
            i === draftIdx ? { ...d, rewards: [...d.rewards, ''] } : d
        ));
    };

    // Remove a reward line
    const removeReward = (draftIdx: number, rewardIdx: number) => {
        setDrafts(prev => prev.map((d, i) => {
            if (i !== draftIdx) return d;
            return { ...d, rewards: d.rewards.filter((_, ri) => ri !== rewardIdx) };
        }));
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Reset edit mode when closed
            setEditMode(false);
            setDrafts([]);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    // For view mode progress calculation
    const sortedGoals = [...goals].sort((a, b) => a.sort_order - b.sort_order);
    const nextGoalIndex = isDemoMode ? 0 : sortedGoals.findIndex(g => wonTotalValue < g.target);

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={editMode ? undefined : onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-bold text-[10px] tracking-tighter shadow-sm">
                            ADGS
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Mål
                            </h2>
                            {!editMode && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Vunna affärer: <span className="font-semibold text-green-600 dark:text-green-400">
                                        <Redacted>{formatSEK(wonTotalValue)}</Redacted>
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {editMode ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="px-3 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
                                >
                                    Avbryt
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-40"
                                >
                                    <Check className="w-4 h-4" />
                                    {saving ? 'Sparar...' : 'Klar'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Redigera
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 p-4 space-y-3">

                    {/* ── EDIT MODE ── */}
                    {editMode ? (
                        <>
                            {drafts.length === 0 && (
                                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                                    Inga mål ännu. Lägg till ditt första!
                                </p>
                            )}
                            {drafts.map((draft, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-4 space-y-3"
                                >
                                    {/* Target + Cost row */}
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">
                                                Målbelopp (SEK)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="100000"
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                value={draft.target}
                                                onChange={e => updateDraft(idx, 'target', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">
                                                Est. kostnad (SEK)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="5000"
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                value={draft.estimated_cost}
                                                onChange={e => updateDraft(idx, 'estimated_cost', e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDraft(idx)}
                                            className="mt-5 flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Ta bort mål"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Rewards */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">
                                            Belöningar
                                        </label>
                                        <div className="space-y-2">
                                            {draft.rewards.map((r, ri) => (
                                                <div key={ri} className="flex items-center gap-2">
                                                    <span className="text-base">🎁</span>
                                                    <input
                                                        type="text"
                                                        placeholder="Beskriv belöning..."
                                                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                        value={r}
                                                        onChange={e => updateReward(idx, ri, e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeReward(idx, ri)}
                                                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => addReward(idx)}
                                            className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Lägg till belöning
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Add new goal button */}
                            <button
                                type="button"
                                onClick={handleAddGoal}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Nytt mål
                            </button>
                        </>
                    ) : (
                        /* ── VIEW MODE ── */
                        <>
                            {sortedGoals.length === 0 ? (
                                <div className="text-center py-10 space-y-2">
                                    <Trophy className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
                                    <p className="text-sm text-gray-400 dark:text-gray-500">
                                        Inga mål ännu. Tryck på <strong>Redigera</strong> för att lägga till!
                                    </p>
                                </div>
                            ) : (
                                sortedGoals.map((goal, index) => {
                                    const isCompleted = !isDemoMode && wonTotalValue >= goal.target;
                                    const isNext = index === nextGoalIndex;
                                    const prevTarget = index === 0 ? 0 : sortedGoals[index - 1].target;
                                    const progress = isDemoMode ? 0 : isCompleted
                                        ? 100
                                        : Math.min(100, Math.max(0, ((wonTotalValue - prevTarget) / (goal.target - prevTarget)) * 100));

                                    return (
                                        <div
                                            key={goal.id}
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
                                                        <Redacted>{formatSEK(goal.target)}</Redacted>
                                                    </span>
                                                </div>
                                                {goal.estimated_cost > 0 && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 text-right flex-shrink-0">
                                                        Est. kostnad: <span className="font-semibold"><Redacted>{formatSEK(goal.estimated_cost)}</Redacted></span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Rewards */}
                                            {goal.rewards.length > 0 && (
                                                <div className="text-sm text-gray-700 dark:text-gray-300 mb-3 space-y-1">
                                                    {goal.rewards.map((r, i) => (
                                                        <p key={i} className="leading-snug">🎁 <Redacted type="text">{r}</Redacted></p>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Progress bar */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                                                    <span>{isCompleted ? 'Uppnått! 🎉' : isNext && !isDemoMode ? `${formatSEK(goal.target - wonTotalValue)} kvar` : 'Ej påbörjat'}</span>
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
                                })
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
