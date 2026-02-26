import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Contact, Deal } from '../types';

interface AppContextType {
    contacts: Contact[];
    deals: Deal[];
    loading: boolean;
    addContact: (contact: Partial<Contact>) => Promise<void>;
    updateContact: (contact: Contact) => Promise<void>;
    deleteContact: (id: string) => Promise<void>;
    addDeal: (deal: Partial<Deal>) => Promise<void>;
    updateDeal: (deal: Deal) => Promise<void>;
    deleteDeal: (id: string) => Promise<void>;
    addActivity: (contactId: string, note: string) => Promise<void>;
    deleteActivity: (id: string) => Promise<void>;
    addDealActivity: (dealId: string, note: string) => Promise<void>;
    deleteDealActivity: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Initial load — re-run whenever the auth user changes (fixes post-login race condition)
    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setContacts([]);
            setDeals([]);
            setLoading(false);
        }

        const contactsSubscription = supabase
            .channel('public:contacts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
                fetchContacts();
            })
            .subscribe();

        const dealsSubscription = supabase
            .channel('public:deals')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, () => {
                fetchDeals();
            })
            .subscribe();

        return () => {
            contactsSubscription.unsubscribe();
            dealsSubscription.unsubscribe();
        };
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchContacts(), fetchDeals()]);
        setLoading(false);
    };

    const fetchContacts = async () => {
        const { data, error } = await supabase.from('contacts').select('*').order('name');
        if (error) { console.error('Error fetching contacts:', error); return; }
        setContacts(data || []);
    };

    const fetchDeals = async () => {
        const { data, error } = await supabase.from('deals').select('*').order('createdAt', { ascending: false });
        if (error) { console.error('Error fetching deals:', error); return; }
        setDeals(data || []);
    };

    const addContact = async (contact: Partial<Contact>) => {
        const { error } = await supabase.from('contacts').insert([{ ...contact, createdBy: user?.email }]);
        if (error) throw error;
        await fetchContacts();
    };

    const updateContact = async (updatedContact: Contact) => {
        const { error } = await supabase.from('contacts').update(updatedContact).eq('id', updatedContact.id);
        if (error) throw error;
        await fetchContacts();
    };

    const deleteContact = async (id: string) => {
        const { error } = await supabase.from('contacts').delete().eq('id', id);
        if (error) throw error;
        await fetchContacts();
    };

    const addDeal = async (deal: Partial<Deal>) => {
        const { error } = await supabase.from('deals').insert([{ ...deal, createdBy: user?.email }]);
        if (error) throw error;
        await fetchDeals();
    };

    const updateDeal = async (updatedDeal: Deal) => {
        const { error } = await supabase.from('deals').update(updatedDeal).eq('id', updatedDeal.id);
        if (error) throw error;
        await fetchDeals();
    };

    const deleteDeal = async (id: string) => {
        const { error } = await supabase.from('deals').delete().eq('id', id);
        if (error) throw error;
        await fetchDeals();
    };

    const addActivity = async (contactId: string, note: string) => {
        const { error } = await supabase
            .from('contact_activities')
            .insert([{ contact_id: contactId, note, created_by: user?.email }]);
        if (error) throw error;
    };

    const deleteActivity = async (id: string) => {
        const { error } = await supabase.from('contact_activities').delete().eq('id', id);
        if (error) throw error;
    };

    const addDealActivity = async (dealId: string, note: string) => {
        const { error } = await supabase
            .from('deal_activities')
            .insert([{ deal_id: dealId, note, created_by: user?.email }]);
        if (error) throw error;
    };

    const deleteDealActivity = async (id: string) => {
        const { error } = await supabase.from('deal_activities').delete().eq('id', id);
        if (error) throw error;
    };

    return (
        <AppContext.Provider value={{
            contacts, deals, loading,
            addContact, updateContact, deleteContact,
            addDeal, updateDeal, deleteDeal,
            addActivity, deleteActivity,
            addDealActivity, deleteDealActivity,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useApp must be used within an AppProvider');
    return context;
};
