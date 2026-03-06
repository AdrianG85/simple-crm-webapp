import React, { useState, useEffect } from 'react';
import type { Deal, DealStage } from '../types';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { ActivityLog } from './ActivityLog';
import { SearchableSelect } from './ui/SearchableSelect';
import { useApp } from '../context/AppContext';
import { Bell, X, ChevronRight } from 'lucide-react';

interface DealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (deal: Deal) => void;
    onDelete?: (id: string) => void;
    initialData?: Deal | null;
}

const STAGES: { value: DealStage; label: string }[] = [
    { value: 'potential', label: 'Möjlighet' },
    { value: 'placed', label: 'Planerat / Offererat' },
    { value: 'won', label: 'Vunnet' },
    { value: 'lost', label: 'Förlorat' },
];

export const DealModal: React.FC<DealModalProps> = ({ isOpen, onClose, onSubmit, onDelete, initialData }) => {
    const { contacts } = useApp();
    const [showConfirm, setShowConfirm] = useState(false);
    const [showNastaSteg, setShowNastaSteg] = useState(false);
    const [formData, setFormData] = useState<Partial<Deal>>({
        title: '',
        contactId: '',
        value: 0,
        currency: 'SEK',
        stage: 'potential',
        expectedCloseDate: '',
        notes: '',
        followUp: false,
        nextAction: '',
        nextActionDate: '',
    });

    useEffect(() => {
        setShowNastaSteg(false);
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                title: '',
                contactId: '',
                value: 0,
                currency: 'SEK',
                stage: 'potential',
                expectedCloseDate: new Date().toISOString().split('T')[0],
                notes: '',
                followUp: false,
                nextAction: '',
                nextActionDate: '',
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.contactId) return;

        const expectedCloseDateRaw = formData.expectedCloseDate?.trim() || null;
        const nextActionDateRaw = formData.nextActionDate?.trim() || null;
        const nextActionRaw = formData.nextAction?.trim() || null;

        const deal: Partial<Deal> = {
            ...formData,
            title: formData.title?.trim(),
            contactId: formData.contactId,
            value: Number(formData.value) || 0,
            currency: formData.currency || 'SEK',
            stage: (formData.stage as DealStage) || 'potential',
            expectedCloseDate: expectedCloseDateRaw,
            notes: formData.notes || '',
            nextActionDate: nextActionDateRaw as unknown as string,
            nextAction: nextActionRaw as unknown as string,
        };

        if (!initialData) {
            delete deal.id;
            delete deal.createdAt;
            delete deal.updatedAt;
        }

        onSubmit(deal as Deal);
        onClose();
    };

    const handleDelete = () => {
        if (initialData?.id && onDelete) {
            setShowConfirm(true);
        }
    };

    const handleConfirmDelete = () => {
        if (initialData?.id && onDelete) {
            setShowConfirm(false);
            onDelete(initialData.id);
            onClose();
        }
    };

    // Desktop side panel — always shown when editing on desktop
    const sidePanel = initialData?.id ? (
        <div className="p-4 space-y-4">

            {/* Markera checkbox on left, Nästa steg header on right */}
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={formData.followUp || false}
                        onChange={(e) => setFormData({ ...formData, followUp: e.target.checked })}
                    />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary-600 transition-colors whitespace-nowrap">
                        Markera för uppföljning
                    </span>
                </label>
                <div className="flex items-center gap-2 ml-auto">
                    <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4 text-amber-500" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Nästa steg</h4>
                </div>
            </div>

            {/* nextActionDate */}
            <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Datum</label>
                <input
                    type="date"
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                    value={formData.nextActionDate || ''}
                    onClick={(e) => {
                        try {
                            if ('showPicker' in HTMLInputElement.prototype) {
                                (e.target as HTMLInputElement).showPicker();
                            }
                        } catch (err) {
                            // Ignore
                        }
                    }}
                    onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
                />
            </div>


            {/* nextAction — now labelled Rubrik */}
            <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Rubrik</label>
                <input
                    type="text"
                    placeholder="T.ex. Skicka offert, Boka möte..."
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={formData.nextAction || ''}
                    onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                />
            </div>



            {/* Activity Log — always visible in side panel when editing */}
            <ActivityLog entityType="deal" entityId={initialData.id} />
        </div>
    ) : undefined;

    return (
        <>
            <ConfirmDialog
                isOpen={showConfirm}
                title="Ta bort affär?"
                message={`Är du säker på att du vill ta bort "${initialData?.title}"? Denna åtgärd kan inte ångras.`}
                confirmLabel="Ja, ta bort"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowConfirm(false)}
            />
            <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Redigera Affär' : 'Ny Affär'} sidePanel={sidePanel}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Mobile-only: header row */}
                    <div className="md:hidden">
                        {!initialData?.id ? (
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    checked={formData.followUp || false}
                                    onChange={(e) => setFormData({ ...formData, followUp: e.target.checked })}
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 transition-colors">
                                    Markera för uppföljning
                                </span>
                            </label>
                        ) : (
                            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        checked={formData.followUp || false}
                                        onChange={(e) => setFormData({ ...formData, followUp: e.target.checked })}
                                    />
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary-600 transition-colors whitespace-nowrap">
                                        Markera för uppföljning
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowNastaSteg(true)}
                                    className="flex items-center gap-1.5 ml-auto group active:opacity-70"
                                >
                                    <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                        <Bell className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Nästa steg</h4>
                                    <ChevronRight className="w-4 h-4 text-amber-400" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Affärsnamn *</label>
                        <input
                            type="text"
                            required
                            placeholder="t.ex. Hemsida redesign"
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Kund / Kontakt *</label>
                        <SearchableSelect
                            required
                            options={contacts.map(contact => ({
                                value: contact.id,
                                label: `${contact.name} ${contact.company ? `(${contact.company})` : ''}`
                            }))}
                            value={formData.contactId || ''}
                            onChange={(value) => setFormData({ ...formData, contactId: value })}
                            placeholder="Välj kund..."
                            searchPlaceholder="Sök efter kund..."
                        />
                        {contacts.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">Du behöver lägga till kontakter först.</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Värde (kr)</label>
                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={formData.value || ''}
                                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Datum</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                                value={formData.expectedCloseDate || ''}
                                onClick={(e) => {
                                    try {
                                        if ('showPicker' in HTMLInputElement.prototype) {
                                            (e.target as HTMLInputElement).showPicker();
                                        }
                                    } catch (err) {
                                        // Ignore
                                    }
                                }}
                                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Status</label>
                        <select
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            value={formData.stage || 'potential'}
                            onChange={(e) => setFormData({ ...formData, stage: e.target.value as DealStage })}
                        >
                            {STAGES.map(stage => (
                                <option key={stage.value} value={stage.value}>{stage.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Anteckningar</label>
                        <textarea
                            rows={3}
                            placeholder="Detaljer om affären..."
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>



                    <div className="pt-4 flex flex-col gap-3">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 dark:text-white dark:border-gray-600 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Avbryt
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
                            >
                                {initialData ? 'Spara' : 'Lägg till'}
                            </button>
                        </div>
                        {initialData && onDelete && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="w-full px-4 py-2 rounded-xl text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                            >
                                Ta bort affär
                            </button>
                        )}
                    </div>
                </form>

            </Modal>

            {/* Mobile-only: Nästa steg bottom sheet */}
            {showNastaSteg && initialData?.id && (
                <div className="md:hidden fixed inset-0 z-[200] flex items-start justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShowNastaSteg(false)} />
                    {/* Sheet — same width as the modal card */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Sheet header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <Bell className="w-4 h-4 text-amber-500" />
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Nästa steg</h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowNastaSteg(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                        {/* Sheet content */}
                        <div className="overflow-y-auto flex-1 p-4 space-y-4">
                            {/* Markera checkbox */}
                            <label className="flex items-center gap-2 cursor-pointer group border-b border-gray-100 dark:border-gray-700 pb-3">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    checked={formData.followUp || false}
                                    onChange={(e) => setFormData({ ...formData, followUp: e.target.checked })}
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 transition-colors">
                                    Markera för uppföljning
                                </span>
                            </label>
                            {/* DATUM */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Datum</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                                    value={formData.nextActionDate || ''}
                                    onClick={(e) => {
                                        try {
                                            if ('showPicker' in HTMLInputElement.prototype) {
                                                (e.target as HTMLInputElement).showPicker();
                                            }
                                        } catch (err) {
                                            // Ignore
                                        }
                                    }}
                                    onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
                                />
                            </div>

                            {/* ActivityLog */}
                            <ActivityLog entityType="deal" entityId={initialData.id} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
