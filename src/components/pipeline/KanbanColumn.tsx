import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableDealCard } from './SortableDealCard';
import type { Deal, DealStage, Contact } from '../../types';
import { cn } from '../../lib/utils';

interface KanbanColumnProps {
    column: { id: DealStage; label: string; color: string };
    deals: Deal[];
    contacts: Contact[];
    onEditDeal: (deal: Deal) => void;
    onMoveDeal: (e: React.MouseEvent, deal: Deal, direction: 'next' | 'prev') => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, deals, contacts, onEditDeal, onMoveDeal }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-1 min-w-[280px] flex flex-col bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border transition-colors max-h-full",
                isOver ? "border-primary-500 bg-primary-50/30 dark:bg-primary-900/10" : "border-gray-100 dark:border-gray-700"
            )}
        >
            {/* Column Header */}
            <div className={cn("p-4 border-b border-gray-100 dark:border-gray-700 rounded-t-2xl font-medium flex justify-between items-center sticky top-0 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm z-10", column.color)}>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{column.label}</span>
                    <span className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs font-bold">{deals.length}</span>
                </div>
            </div>

            {/* Column Content */}
            <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar min-h-[150px]">
                <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
                    {deals.length > 0 ? (
                        deals.map((deal) => {
                            const contact = contacts.find(c => c.id === deal.contactId);
                            return (
                                <SortableDealCard
                                    key={deal.id}
                                    deal={deal}
                                    contactName={contact?.name}
                                    onClick={onEditDeal}
                                    onMove={onMoveDeal}
                                />
                            );
                        })
                    ) : (
                        <div className="h-24 flex items-center justify-center text-gray-300 dark:text-gray-600 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                            <span className="text-xs">Dra hit för att ändra fas</span>
                        </div>
                    )}
                </SortableContext>
            </div>

            {/* Column Footer Summary */}
            <div className="p-3 text-right bg-white/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 rounded-b-2xl">
                Totalt: {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(totalValue)}
            </div>
        </div>
    );
};
