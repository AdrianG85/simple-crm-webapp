import React, { useState, useEffect } from 'react';
import type { Contact } from '../types';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { ActivityLog } from './ActivityLog';
import { ArrowRight } from 'lucide-react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (contact: Contact) => void;
    onDelete?: (id: string) => void;
    initialData?: Contact | null;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSubmit, onDelete, initialData }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [formData, setFormData] = useState<Partial<Contact>>({
        name: '',
        company: '',
        email: '',
        phone: '',
        notes: '',
        followUp: false,
        metKontaktVia: '',
        nastaSteg: '',
        socialUrl: '',
        hemsida: '',
        nextAction: '',
        nextActionDate: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ name: '', company: '', email: '', phone: '', notes: '', followUp: false, metKontaktVia: '', nastaSteg: '', socialUrl: '', hemsida: '', nextAction: '', nextActionDate: '' });
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
                title="Ta bort kontakt?"
                message={`Är du säker på att du vill ta bort "${initialData?.name}"? Denna åtgärd kan inte ångras.`}
                confirmLabel="Ja, ta bort"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowConfirm(false)}
            />
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Hemsida</label>
                        <input
                            type="text"
                            placeholder="www.example.se"
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            value={formData.hemsida || ''}
                            onChange={(e) => setFormData({ ...formData, hemsida: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Vart lärde du känna kontakten?</label>
                        <select
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            value={formData.metKontaktVia || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData({
                                    ...formData,
                                    metKontaktVia: val,
                                    socialUrl: (val === 'Facebook' || val === 'LinkedIn') ? formData.socialUrl : '',
                                });
                            }}
                        >
                            <option value="">– Välj –</option>
                            <option value="Facebook">Facebook</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Live">Live</option>
                        </select>
                    </div>

                    {(formData.metKontaktVia === 'Facebook' || formData.metKontaktVia === 'LinkedIn') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                {formData.metKontaktVia === 'Facebook' ? 'Facebook' : 'LinkedIn'} profil
                            </label>
                            <input
                                type="text"
                                placeholder={formData.metKontaktVia === 'Facebook'
                                    ? 'facebook.com/användarnamn'
                                    : 'linkedin.com/in/användarnamn'
                                }
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={formData.socialUrl || ''}
                                onChange={(e) => setFormData({ ...formData, socialUrl: e.target.value })}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Anteckningar</label>
                        <textarea
                            rows={3}
                            placeholder="Hur kan vi hjälpa denna kontakten och hur kan denna kontakten hjälpa oss?"
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

                    {formData.followUp && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Nästa steg</label>
                            <textarea
                                rows={3}
                                placeholder="Vad är nästa steg med den här kontakten?"
                                className="w-full px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                                value={formData.nastaSteg || ''}
                                onChange={(e) => setFormData({ ...formData, nastaSteg: e.target.value })}
                            />
                        </div>
                    )}

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

                {/* Next Action + Activity Log — only when editing existing contact */}
                {initialData?.id && (
                    <div className="px-4 pb-4 space-y-4">
                        <hr className="border-gray-100 dark:border-gray-700" />

                        {/* Next Action */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <ArrowRight className="w-4 h-4 text-amber-500" />
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nästa åtgärd</h4>
                            </div>
                            <input
                                type="text"
                                placeholder="T.ex. Skicka offert, Boka möte..."
                                className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                value={formData.nextAction || ''}
                                onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                            />
                            <input
                                type="date"
                                className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                value={formData.nextActionDate || ''}
                                onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (initialData) {
                                        import('../lib/supabase').then(({ supabase }) => {
                                            supabase.from('contacts').update({
                                                next_action: formData.nextAction,
                                                next_action_date: formData.nextActionDate || null,
                                            }).eq('id', initialData.id);
                                        });
                                    }
                                }}
                                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                            >
                                Spara nästa åtgärd
                            </button>
                        </div>

                        <hr className="border-gray-100 dark:border-gray-700" />

                        {/* Activity Log */}
                        <ActivityLog contactId={initialData.id} />
                    </div>
                )}
            </Modal>
        </>
    );
};
