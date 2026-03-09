import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { PlusCircle, Trash2, Check, X } from 'lucide-react';

type EntityType = 'contact' | 'deal';

interface ActivityLogProps {
    entityType: EntityType;
    entityId: string;
}

interface Activity {
    id: string;
    rubrik?: string;
    note: string;
    createdAt: string;
    createdBy?: string;
}

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('sv-SE', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ entityType, entityId }) => {
    const { addActivity, deleteActivity, addDealActivity, deleteDealActivity } = useApp();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [note, setNote] = useState('');
    const [rubrik, setRubrik] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingNote, setEditingNote] = useState('');
    const [editingRubrik, setEditingRubrik] = useState('');
    const [updating, setUpdating] = useState(false);

    const table = entityType === 'contact' ? 'contact_activities' : 'deal_activities';
    const idColumn = entityType === 'contact' ? 'contact_id' : 'deal_id';

    const fetchActivities = useCallback(async () => {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq(idColumn, entityId)
            .order('created_at', { ascending: false });

        if (error) { console.error('Error fetching activities:', error); return; }

        setActivities((data || []).map((row: any) => ({
            id: row.id,
            rubrik: row.rubrik || '',
            note: row.note,
            createdAt: row.created_at,
            createdBy: row.created_by,
        })));
    }, [entityId, table, idColumn]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const handleAdd = async () => {
        if (!note.trim()) return;
        setSaving(true);
        try {
            if (entityType === 'contact') {
                await addActivity(entityId, note.trim(), rubrik.trim());
            } else {
                await addDealActivity(entityId, note.trim(), rubrik.trim());
            }
            setNote('');
            setRubrik('');
            await fetchActivities();
        } catch (e) {
            console.error('Failed to add activity:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            if (entityType === 'contact') {
                await deleteActivity(deleteTarget);
            } else {
                await deleteDealActivity(deleteTarget);
            }
            await fetchActivities();
        } catch (e) {
            console.error('Failed to delete activity:', e);
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleStartEdit = (a: Activity) => {
        setEditingId(a.id);
        setEditingRubrik(a.rubrik || '');
        setEditingNote(a.note);
    };

    const lastTapRef = useRef<{ id: string; time: number } | null>(null);

    const handleTouchEnd = (e: React.TouchEvent, a: Activity) => {
        const now = Date.now();
        if (lastTapRef.current && lastTapRef.current.id === a.id && now - lastTapRef.current.time < 350) {
            e.preventDefault(); // prevent subsequent click from firing
            handleStartEdit(a);
            lastTapRef.current = null;
        } else {
            lastTapRef.current = { id: a.id, time: now };
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingNote('');
        setEditingRubrik('');
    };

    const handleUpdate = async (id: string) => {
        if (!editingNote.trim()) return;
        setUpdating(true);
        try {
            await supabase.from(table).update({ rubrik: editingRubrik.trim(), note: editingNote.trim() }).eq('id', id);
            setEditingId(null);
            setEditingNote('');
            setEditingRubrik('');
            await fetchActivities();
        } catch (e) {
            console.error('Failed to update activity:', e);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="mt-2">
            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Ta bort anteckning?"
                message="Är du säker på att du vill ta bort den här anteckningen? Åtgärden kan inte ångras."
                confirmLabel="Ja, ta bort"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wider">Aktivitetslogg</label>

            {/* Add new entry */}
            <div className="flex flex-col gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Rubrik (valfri)"
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={rubrik}
                    onChange={(e) => setRubrik(e.target.value)}
                />
                <textarea
                    rows={2}
                    placeholder="Vad hände? T.ex. 'Ringde och pratade om offert...'"
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleAdd(); }}
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={saving || !note.trim()}
                    className="self-end flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-40 transition-colors"
                >
                    <PlusCircle className="w-4 h-4" />
                    {saving ? 'Sparar...' : 'Lägg till'}
                </button>
            </div>

            {/* Feed */}
            {activities.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
                    Inga anteckningar ännu. Lägg till din första!
                </p>
            ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {activities.map((a) => (
                        <div
                            key={a.id}
                            className="relative flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600"
                        >
                            <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-primary-500" />
                            <div className="flex-1 min-w-0">
                                {/* Edit mode — desktop only */}
                                {editingId === a.id ? (
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="Rubrik (valfri)"
                                            className="w-full px-2 py-1.5 rounded-lg border border-amber-300 dark:border-amber-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                                            value={editingRubrik}
                                            onChange={(e) => setEditingRubrik(e.target.value)}
                                        />
                                        <textarea
                                            rows={2}
                                            placeholder="Aktivitetslogg..."
                                            className="w-full px-2 py-1.5 rounded-lg border border-amber-300 dark:border-amber-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                            value={editingNote}
                                            onChange={(e) => setEditingNote(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && e.metaKey) handleUpdate(a.id);
                                                if (e.key === 'Escape') handleCancelEdit();
                                            }}
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                <X className="w-3 h-3" /> Avbryt
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleUpdate(a.id)}
                                                disabled={updating || !editingNote.trim()}
                                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium disabled:opacity-40 transition-colors"
                                            >
                                                <Check className="w-3 h-3" /> {updating ? 'Sparar...' : 'Spara'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* View mode — single click on desktop, double-tap on mobile */
                                    <div
                                        className="cursor-pointer"
                                        onClick={() => handleStartEdit(a)}
                                        onTouchEnd={(e) => handleTouchEnd(e, a)}
                                        title="Klicka / Dubbeltryck för att redigera"
                                    >
                                        {a.rubrik && (
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 md:hover:text-amber-500 transition-colors">
                                                {a.rubrik}
                                            </p>
                                        )}
                                        <p className={`text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words md:hover:text-amber-500 transition-colors ${a.rubrik ? 'text-gray-500 dark:text-gray-400 text-xs mt-0.5' : ''}`}>
                                            {a.note}
                                        </p>
                                    </div>
                                )}
                                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                    {formatDate(a.createdAt)}{a.createdBy ? ` · ${a.createdBy}` : ''}
                                </p>
                            </div>
                            {/* Trash — always visible, white → red on hover */}
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(a.id)}
                                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(a.id); }}
                                className="flex-shrink-0 p-1 text-white dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                title="Ta bort"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
