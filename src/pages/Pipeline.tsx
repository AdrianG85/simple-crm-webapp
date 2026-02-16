import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';
import { DealModal } from '../components/DealModal';
import type { Deal, DealStage } from '../types';
import { cn } from '../lib/utils';
import {
    DndContext,
    rectIntersection,
    closestCenter,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    useDroppable,
    pointerWithin,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, CollisionDetection } from '@dnd-kit/core';
import { restrictToWindowEdges, snapCenterToCursor } from '@dnd-kit/modifiers';
import { KanbanColumn } from '../components/pipeline/KanbanColumn';
import { SortableDealCard } from '../components/pipeline/SortableDealCard';

const COLUMNS: { id: DealStage; label: string; color: string }[] = [
    { id: 'potential', label: 'Möjlighet', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    { id: 'placed', label: 'Planerat / Offererat', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { id: 'won', label: 'Vunnet', color: 'bg-green-100 text-green-800 border-green-200' },
    { id: 'lost', label: 'Förlorat / Avböjt', color: 'bg-red-50 text-red-800 border-red-100' },
];

interface StageDropZoneProps {
    column: typeof COLUMNS[0];
    isActive: boolean;
    count: number;
    onClick: () => void;
}

const StageDropZone: React.FC<StageDropZoneProps> = ({ column, isActive, count, onClick }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `mobile-${column.id}`, // Prefix to avoid collision with desktop columns
        disabled: false,
    });

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            role="button"
            tabIndex={0}
            className={cn(
                "relative flex flex-col items-center justify-center px-1 py-2.5 rounded-xl text-xs font-medium transition-all border outline-none cursor-pointer select-none pointer-events-auto",
                isActive
                    ? "bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400 shadow-sm ring-1 ring-primary-600 dark:ring-primary-400"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750",
                isOver && "scale-105 border-primary-500 bg-primary-50 dark:bg-primary-900/40 ring-4 ring-primary-500/30 z-20 shadow-lg"
            )}
        >
            <span className="truncate w-full text-center px-1">{column.label.split(' / ')[0]}</span>
            <span className={cn(
                "mt-0.5 px-1.5 py-0 rounded-full text-[9px] font-bold",
                isActive
                    ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            )}>
                {count}
            </span>
        </div>
    );
};

export const PipelinePage: React.FC = () => {
    const { deals, contacts, addDeal, updateDeal, deleteDeal } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
    const [activeStage, setActiveStage] = useState<DealStage>('potential');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeWidth, setActiveWidth] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 8,
            },
        })
    );

    // Custom collision detection strategy that filters out the active draggable
    // This prevents the dragged card from being detected as its own drop target
    const customCollisionDetection: CollisionDetection = (args) => {
        const { active } = args;

        // First try rectIntersection - more reliable for overlapping elements
        const rectCollisions = rectIntersection(args);
        const filteredRectCollisions = rectCollisions.filter(c => c.id !== active.id);

        if (filteredRectCollisions.length > 0) {
            return filteredRectCollisions;
        }

        // Then try pointer-based detection for precision
        const pointerCollisions = pointerWithin(args);
        const filteredPointerCollisions = pointerCollisions.filter(c => c.id !== active.id);

        if (filteredPointerCollisions.length > 0) {
            return filteredPointerCollisions;
        }

        // Fallback to closestCenter for reliability
        const closestCollisions = closestCenter(args);

        // CRITICAL: Filter out the active draggable itself!
        // The dragged card is always closest to itself, so it appears first in the array
        const filteredClosestCollisions = closestCollisions.filter(c => c.id !== active.id);

        return filteredClosestCollisions;
    };

    const handleCreate = async (deal: Deal) => {
        try {
            await addDeal(deal);
        } catch (error) {
            console.error('Failed to add deal:', error);
            alert('Kunde inte spara affären.');
        }
    };

    const handleUpdate = async (deal: Deal) => {
        try {
            await updateDeal(deal);
        } catch (error) {
            console.error('Failed to update deal:', error);
            alert('Kunde inte uppdatera affären.');
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);

        const activeElement = document.querySelector(`[data-dnd-id="${active.id}"]`);
        if (activeElement) {
            setActiveWidth(activeElement.clientWidth);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        const dealId = active.id as string;
        const overId = over.id as string;

        const activeDeal = deals.find((d) => d.id === dealId);
        if (!activeDeal) return;

        let targetId = overId;
        const isMobileDrop = targetId.startsWith('mobile-');

        if (isMobileDrop) {
            targetId = targetId.replace('mobile-', '');
        }

        const isColumn = COLUMNS.some((c) => c.id === targetId);

        if (isColumn) {
            const newStage = targetId as DealStage;
            if (activeDeal.stage !== newStage) {
                try {
                    await updateDeal({ ...activeDeal, stage: newStage });
                    if (window.innerWidth < 768) {
                        setActiveStage(newStage);
                    }
                } catch (error) {
                    console.error('Failed to move deal:', error);
                }
            }
        } else {
            const overDeal = deals.find((d) => d.id === overId);
            if (overDeal && activeDeal.stage !== overDeal.stage) {
                try {
                    await updateDeal({ ...activeDeal, stage: overDeal.stage });
                } catch (error) {
                    console.error('Failed to move deal:', error);
                }
            }
        }
    };

    const openCreateModal = () => {
        setEditingDeal(null);
        setIsModalOpen(true);
    };

    const openEditModal = (deal: Deal) => {
        setEditingDeal(deal);
        setIsModalOpen(true);
    };

    const activeDeal = deals.find(d => d.id === activeId);
    const activeContact = activeDeal ? contacts.find(c => c.id === activeDeal.contactId) : null;

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-none">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Våra affärer</h1>
                    <p className="text-gray-500 dark:text-gray-400">Överblick över alla dina affärsmöjligheter.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="hidden md:flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 dark:shadow-none"
                >
                    <Plus className="w-5 h-5" />
                    Ny Affär
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={customCollisionDetection}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* Mobile View */}
                <div className="md:hidden flex-1 flex flex-col min-h-0 px-1">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        {COLUMNS.map((column) => (
                            <StageDropZone
                                key={column.id}
                                column={column}
                                isActive={activeStage === column.id}
                                count={deals.filter(d => d.stage === column.id).length}
                                onClick={() => setActiveStage(column.id)}
                            />
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 pt-1 pb-20 overscroll-none">
                        {(() => {
                            const column = COLUMNS.find(c => c.id === activeStage)!;
                            const columnDeals = deals.filter(d => d.stage === activeStage);
                            const totalValue = columnDeals.reduce((sum, d) => sum + d.value, 0);

                            return (
                                <div className="space-y-2">
                                    <div className={cn("p-3 rounded-xl border mb-2 flex justify-between items-center transition-colors", column.color.replace('bg-', 'bg-opacity-20 ' + column.color.split(' ')[0]))}>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{column.label}</span>
                                        <span className="font-bold text-gray-900 dark:text-white text-sm">{new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(totalValue)}</span>
                                    </div>

                                    {columnDeals.length > 0 ? (
                                        columnDeals.map((deal) => {
                                            const contact = contacts.find(c => c.id === deal.contactId);
                                            return (
                                                <SortableDealCard
                                                    key={deal.id}
                                                    deal={deal}
                                                    contactName={contact?.name}
                                                    onClick={openEditModal}
                                                />
                                            );
                                        })
                                    ) : (
                                        <div className="py-12 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                                            <Plus className="w-12 h-12 opacity-50 mb-2" />
                                            <span className="text-sm">Inga affärer i denna fas</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block flex-1 overflow-x-auto overflow-y-hidden pb-4">
                    <div className="flex h-full gap-4">
                        {COLUMNS.map((column) => (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                deals={deals.filter(d => d.stage === column.id)}
                                contacts={contacts}
                                onEditDeal={openEditModal}
                            />
                        ))}
                    </div>
                </div>

                <DragOverlay
                    modifiers={window.innerWidth < 768 ? [snapCenterToCursor, restrictToWindowEdges] : [restrictToWindowEdges]}
                    dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({
                            styles: {
                                active: {
                                    opacity: '0.5',
                                },
                            },
                        }),
                    }}
                >
                    {activeId && activeDeal ? (
                        <div
                            style={{
                                width: window.innerWidth < 768 ? '180px' : (activeWidth ? `${activeWidth}px` : 'auto'),
                            }}
                            className={cn(
                                "opacity-100 shadow-2xl rounded-xl ring-2 ring-primary-500 bg-white dark:bg-gray-800 pointer-events-none transition-transform duration-200",
                                window.innerWidth >= 768 ? "scale-105 rotate-2 cursor-grabbing" : "scale-90 rotate-0"
                            )}
                        >
                            <SortableDealCard
                                deal={activeDeal}
                                contactName={activeContact?.name}
                                onClick={() => { }}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <DealModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={editingDeal ? handleUpdate : handleCreate}
                onDelete={deleteDeal}
                initialData={editingDeal}
            />
        </div>
    );
};
