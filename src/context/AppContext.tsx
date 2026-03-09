import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Contact, Deal } from '../types';

export interface Goal {
    id: string;
    group_id: string;
    target: number;
    estimated_cost: number;
    rewards: string[];
    sort_order: number;
}

interface AppContextType {
    contacts: Contact[];
    deals: Deal[];
    goals: Goal[];
    loading: boolean;
    addContact: (contact: Partial<Contact>) => Promise<void>;
    updateContact: (contact: Contact) => Promise<void>;
    deleteContact: (id: string) => Promise<void>;
    addDeal: (deal: Partial<Deal>) => Promise<void>;
    updateDeal: (deal: Deal) => Promise<void>;
    deleteDeal: (id: string) => Promise<void>;
    addActivity: (contactId: string, note: string, rubrik?: string) => Promise<void>;
    deleteActivity: (id: string) => Promise<void>;
    addDealActivity: (dealId: string, note: string, rubrik?: string) => Promise<void>;
    deleteDealActivity: (id: string) => Promise<void>;
    addGoal: (goal: Omit<Goal, 'id' | 'group_id'>) => Promise<void>;
    updateGoal: (id: string, changes: Partial<Omit<Goal, 'id' | 'group_id'>>) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Initial load — re-run whenever the auth user changes (fixes post-login race condition)
    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setContacts([]);
            setDeals([]);
            setGoals([]);
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
        await Promise.all([fetchContacts(), fetchDeals(), fetchGoals()]);
        setLoading(false);
    };

    const fetchGoals = async () => {
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .order('sort_order', { ascending: true });
        if (error) { console.error('Error fetching goals:', error); return; }
        setGoals((data || []).map((row: any) => ({
            id: row.id,
            group_id: row.group_id,
            target: row.target,
            estimated_cost: row.estimated_cost,
            rewards: Array.isArray(row.rewards) ? row.rewards : [],
            sort_order: row.sort_order,
        })));
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

    const addActivity = async (contactId: string, note: string, rubrik?: string) => {
        const { error } = await supabase
            .from('contact_activities')
            .insert([{ contact_id: contactId, note, rubrik: rubrik || '', created_by: user?.email }]);
        if (error) throw error;
    };

    const deleteActivity = async (id: string) => {
        const { error } = await supabase.from('contact_activities').delete().eq('id', id);
        if (error) throw error;
    };

    const addDealActivity = async (dealId: string, note: string, rubrik?: string) => {
        const { error } = await supabase
            .from('deal_activities')
            .insert([{ deal_id: dealId, note, rubrik: rubrik || '', created_by: user?.email }]);
        if (error) throw error;
    };

    const deleteDealActivity = async (id: string) => {
        const { error } = await supabase.from('deal_activities').delete().eq('id', id);
        if (error) throw error;
    };

    // Resolve the group_id for the current user
    const getUserGroupId = () => {
        const email = user?.email || '';
        return ['adrian@adgs.se', 'dejan@adgs.se'].includes(email) ? 'adgs' : email;
    };

    const addGoal = async (goal: Omit<Goal, 'id' | 'group_id'>) => {
        const { error } = await supabase.from('goals').insert([{ ...goal, group_id: getUserGroupId() }]);
        if (error) throw error;
        await fetchGoals();
    };

    const updateGoal = async (id: string, changes: Partial<Omit<Goal, 'id' | 'group_id'>>) => {
        const { error } = await supabase.from('goals').update(changes).eq('id', id);
        if (error) throw error;
        await fetchGoals();
    };

    const deleteGoal = async (id: string) => {
        const { error } = await supabase.from('goals').delete().eq('id', id);
        if (error) throw error;
        await fetchGoals();
    };

    return (
        <AppContext.Provider value={{
            contacts, deals, goals, loading,
            addContact, updateContact, deleteContact,
            addDeal, updateDeal, deleteDeal,
            addActivity, deleteActivity,
            addDealActivity, deleteDealActivity,
            addGoal, updateGoal, deleteGoal,
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
