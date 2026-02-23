import React, { useState, useEffect } from 'react';
import type { Deal, DealStage } from '../types';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { useApp } from '../context/AppContext';

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
    const [formData, setFormData] = useState<Partial<Deal>>({
        title: '',
        contactId: '',
        value: 0,
        currency: 'SEK',
        stage: 'potential',
        expectedCloseDate: '',
        notes: '',
        followUp: false,
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                title: '',
                contactId: '',
                value: 0,
                currency: 'SEK',
                stage: 'potential',
                expectedCloseDate: new Date().toISOString().split('T')[0], // Today as default
                notes: '',
                followUp: false,
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.contactId) return;

        const deal: Partial<Deal> = {
            ...formData,
            title: formData.title,
            contactId: formData.contactId,
            value: Number(formData.value) || 0,
            currency: formData.currency || 'SEK',
            stage: (formData.stage as DealStage) || 'potential',
            expectedCloseDate: formData.expectedCloseDate || null,
            notes: formData.notes || '',
        };

        // Remove ID and timestamps for new items (Supabase handles them)
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
            <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Redigera Affär' : 'Ny Affär'}>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <select
                            required
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            value={formData.contactId || ''}
                            onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                        >
                            <option value="" disabled>Välj kund...</option>
                            {contacts.map(contact => (
                                <option key={contact.id} value={contact.id}>
                                    {contact.name} {contact.company ? `(${contact.company})` : ''}
                                </option>
                            ))}
                        </select>
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
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={formData.expectedCloseDate || ''}
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

                    <div>
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
        </>
    );
};
