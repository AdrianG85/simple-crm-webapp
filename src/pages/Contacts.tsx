import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Mail, Phone, Building2, User, Bell } from 'lucide-react';
import { ContactModal } from '../components/ContactModal';
import type { Contact } from '../types';
import { cn } from '../lib/utils';

export const ContactsPage: React.FC = () => {
    const { contacts, addContact, updateContact, deleteContact } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredContacts = contacts.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = async (contact: Contact) => {
        try {
            await addContact(contact);
        } catch (error) {
            console.error('Failed to add contact:', error);
            alert('Kunde inte spara kontakten. Kontrollera att du kört SQL-skriptet i Supabase.');
        }
    };

    const handleUpdate = async (contact: Contact) => {
        try {
            await updateContact(contact);
        } catch (error) {
            console.error('Failed to update contact:', error);
            alert('Kunde inte uppdatera kontakten.');
        }
    };

    const openCreateModal = () => {
        setEditingContact(null);
        setIsModalOpen(true);
    };

    const openEditModal = (contact: Contact) => {
        setEditingContact(contact);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Våra Kontakter</h1>
                    <p className="text-gray-500">Hantera dina kunder och relaterade personer.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="hidden md:flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Ny Kontakt
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Sök på namn eller företag..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                        <div
                            key={contact.id}
                            onClick={() => openEditModal(contact)}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
                                            {contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        {contact.createdBy && (
                                            <div
                                                title={`Skapad av: ${contact.createdBy}`}
                                                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-800 border-2 border-primary-50 dark:border-gray-700 flex items-center justify-center text-primary-600 dark:text-primary-400 text-[10px] font-black"
                                            >
                                                {contact.createdBy?.[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{contact.name}</h3>
                                        {contact.company && (
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Building2 className="w-3 h-3" /> {contact.company}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdate({ ...contact, followUp: !contact.followUp });
                                    }}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        contact.followUp
                                            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                            : "text-gray-300 hover:bg-gray-100 dark:text-gray-600 dark:hover:bg-gray-800"
                                    )}
                                    title={contact.followUp ? "Följ upp aktiv" : "Markera för uppföljning"}
                                >
                                    <Bell className={cn("w-5 h-5", contact.followUp && "fill-current")} />
                                </button>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                {contact.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span>{contact.email}</span>
                                    </div>
                                )}
                                {contact.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{contact.phone}</span>
                                    </div>
                                )}
                                {contact.notes && (
                                    <div className="mt-3 pt-3 border-t border-gray-50 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Anteckningar</span>
                                        <p className="text-xs text-gray-500 line-clamp-2 italic">"{contact.notes}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-gray-400">
                        <User className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>Inga kontakter hittades.</p>
                    </div>
                )}
            </div>

            <ContactModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={editingContact ? handleUpdate : handleCreate}
                onDelete={deleteContact}
                initialData={editingContact}
            />
        </div >
    );
};
