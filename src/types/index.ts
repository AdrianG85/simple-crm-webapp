export type DealStage = 'potential' | 'placed' | 'won' | 'lost';

export interface Contact {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface Deal {
    id: string;
    title: string;
    contactId: string;
    value: number;
    currency: string;
    stage: DealStage;
    expectedCloseDate: string | null;
    notes: string;
    createdAt: string;
    updatedAt: string;
}
