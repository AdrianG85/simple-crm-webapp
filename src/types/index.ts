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
    createdBy?: string;
    followUp?: boolean;
    metKontaktVia?: string;
    nastaSteg?: string;
    socialUrl?: string;
    hemsida?: string;
    nextAction?: string;
    nextActionDate?: string;
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
    createdBy?: string;
    followUp?: boolean;
}

export interface ContactActivity {
    id: string;
    contactId: string;
    note: string;
    createdAt: string;
    createdBy?: string;
}
