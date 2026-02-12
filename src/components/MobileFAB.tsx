import React, { useState } from 'react';
import { Plus, UserPlus, Briefcase, X } from 'lucide-react';
import { ContactModal } from './ContactModal';
import { DealModal } from './DealModal';
import { useApp } from '../context/AppContext';

export const MobileFAB: React.FC = () => {
    const { addContact, addDeal } = useApp();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showDealModal, setShowDealModal] = useState(false);

    const handleOpenContactModal = () => {
        setIsMenuOpen(false);
        setShowContactModal(true);
    };

    const handleOpenDealModal = () => {
        setIsMenuOpen(false);
        setShowDealModal(true);
    };

    return (
        <>
            {/* Backdrop */}
            {isMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/20 z-40 transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Action Menu */}
            {isMenuOpen && (
                <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 items-center animate-in slide-in-from-bottom-4 duration-200">
                    <button
                        onClick={handleOpenDealModal}
                        className="flex items-center gap-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-5 py-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                        <Briefcase className="w-5 h-5" />
                        <span className="font-medium">Ny Affär</span>
                    </button>
                    <button
                        onClick={handleOpenContactModal}
                        className="flex items-center gap-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-5 py-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span className="font-medium">Ny Kontakt</span>
                    </button>
                </div>
            )}

            {/* FAB Button - Centered in mobile nav */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-primary-600 text-white p-3 rounded-full shadow-lg border-4 border-white dark:border-gray-900 transition-all hover:bg-primary-700 active:scale-95"
            >
                {isMenuOpen ? (
                    <X className="w-6 h-6 transition-transform rotate-0" />
                ) : (
                    <Plus className="w-6 h-6 transition-transform" />
                )}
            </button>

            {/* Modals */}
            {showContactModal && (
                <ContactModal
                    isOpen={showContactModal}
                    onClose={() => setShowContactModal(false)}
                    onSubmit={async (contact) => {
                        try {
                            await addContact(contact);
                            setShowContactModal(false);
                        } catch (error) {
                            console.error('Failed to add contact:', error);
                            alert('Kunde inte spara kontakten. Kontrollera att du kört SQL-skriptet i Supabase.');
                        }
                    }}
                />
            )}
            {showDealModal && (
                <DealModal
                    isOpen={showDealModal}
                    onClose={() => setShowDealModal(false)}
                    onSubmit={async (deal) => {
                        try {
                            await addDeal(deal);
                            setShowDealModal(false);
                        } catch (error) {
                            console.error('Failed to add deal:', error);
                            alert('Kunde inte spara affären. Kontrollera att du kört SQL-skriptet i Supabase.');
                        }
                    }}
                />
            )}
        </>
    );
};
