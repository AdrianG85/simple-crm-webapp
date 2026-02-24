import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { ConfirmDialog } from './ui/ConfirmDialog';
import type { ContactActivity } from '../types';
import { PlusCircle, Trash2, BookOpen } from 'lucide-react';

interface ActivityLogProps {
    contactId: string;
}

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('sv-SE', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ contactId }) => {
    const { addActivity, deleteActivity } = useApp();
    const [activities, setActivities] = useState<ContactActivity[]>([]);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const fetchActivities = useCallback(async () => {
        const { data, error } = await supabase
            .from('contact_activities')
            .select('*')
            .eq('contact_id', contactId)
            .order('created_at', { ascending: false });

        if (error) { console.error('Error fetching activities:', error); return; }

        setActivities((data || []).map((row: any) => ({
            id: row.id,
            contactId: row.contact_id,
            note: row.note,
            createdAt: row.created_at,
            createdBy: row.created_by,
        })));
    }, [contactId]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const handleAdd = async () => {
        if (!note.trim()) return;
        setSaving(true);
        try {
            await addActivity(contactId, note.trim());
            setNote('');
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
            await deleteActivity(deleteTarget);
            await fetchActivities();
        } catch (e) {
            console.error('Failed to delete activity:', e);
        } finally {
            setDeleteTarget(null);
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

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Dagbok / Aktivitetslogg</h4>
            </div>

            {/* Add new entry */}
            <div className="flex flex-col gap-2 mb-4">
                <textarea
                    rows={2}
                    placeholder="Vad hände? T.ex. 'Ringde och pratade om offert...'"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
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
                            className="group relative flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600"
                        >
                            {/* Timeline dot */}
                            <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-primary-500" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words">{a.note}</p>
                                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                    {formatDate(a.createdAt)}{a.createdBy ? ` · ${a.createdBy}` : ''}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(a.id)}
                                className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 text-gray-300 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-all"
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
