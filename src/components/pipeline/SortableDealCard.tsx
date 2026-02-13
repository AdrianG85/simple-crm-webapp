import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle } from 'lucide-react';
import type { Deal } from '../../types';
import { cn } from '../../lib/utils';

interface SortableDealCardProps {
    deal: Deal;
    contactName?: string;
    onClick: (deal: Deal) => void;
}

export const SortableDealCard: React.FC<SortableDealCardProps> = ({ deal, contactName, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: deal.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    const lastClickTimeRef = React.useRef<number>(0);

    const handleCardClick = () => {
        const isMobile = window.innerWidth < 768;
        if (!isMobile) {
            onClick(deal);
            return;
        }

        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        if (now - lastClickTimeRef.current < DOUBLE_TAP_DELAY) {
            onClick(deal);
            lastClickTimeRef.current = 0;
        } else {
            lastClickTimeRef.current = now;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            data-dnd-id={deal.id}
            {...attributes}
            {...listeners}
            onClick={handleCardClick}
            className={cn(
                "bg-white dark:bg-gray-700 p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-[background-color,border-color,box-shadow,opacity] cursor-grab active:cursor-grabbing group relative touch-none",
                isDragging && "opacity-30 border-primary-300 dark:border-primary-700"
            )}
        >
            <div className="flex justify-between items-start mb-1 md:mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 text-sm md:text-base">{deal.title}</h4>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-200">
                    {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: deal.currency || 'SEK', maximumFractionDigits: 0 }).format(deal.value)}
                </span>
            </div>
            <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-2 md:mb-3 flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                {deal.expectedCloseDate || 'Inget datum'}
            </p>

            <div className="mt-1 md:mt-2 pt-1 md:pt-2 border-t border-gray-50 dark:border-gray-600">
                <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 truncate">
                    Kund: {contactName || 'Okänd'}
                </span>
            </div>
        </div>
    );
};
