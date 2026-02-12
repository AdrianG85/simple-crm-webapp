import React, { useState, useEffect } from 'react';
import type { Contact } from '../types';
import { Modal } from './ui/Modal';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (contact: Contact) => void;
    onDelete?: (id: string) => void;
    initialData?: Contact | null;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSubmit, onDelete, initialData }) => {
    const [formData, setFormData] = useState<Partial<Contact>>({
        name: '',
        company: '',
        email: '',
        phone: '',
        notes: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ name: '', company: '', email: '', phone: '', notes: '' });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        const contact: Partial<Contact> = {
            ...formData,
            name: formData.name,
            company: formData.company || '',
            email: formData.email || '',
            phone: formData.phone || '',
            notes: formData.notes || '',
        };

        // Remove ID and timestamps for new items (Supabase handles them)
        if (!initialData) {
            delete contact.id;
            delete contact.createdAt;
            delete contact.updatedAt;
        }

        onSubmit(contact as Contact);
        onClose();
    };

    const handleDelete = () => {
        if (initialData?.id && onDelete) {
            if (window.confirm('Är du säker på att du vill ta bort den här kontakten?')) {
                onDelete(initialData.id);
                onClose();
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Redigera Kontakt' : 'Ny Kontakt'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Namn *</label>
                    <input
                        type="text"
                        required
                        placeholder="För- och efternamn"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Företag</label>
                    <input
                        type="text"
                        placeholder="Företagsnamn"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.company || ''}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">E-post</label>
                    <input
                        type="email"
                        placeholder="exempel@foretag.se"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Telefon</label>
                    <input
                        type="tel"
                        placeholder="070-123 45 67"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Anteckningar</label>
                    <textarea
                        rows={3}
                        placeholder="Detaljer om kontakten..."
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
                            Ta bort kontakt
                        </button>
                    )}
                </div>
            </form>
        </Modal>
    );
};
