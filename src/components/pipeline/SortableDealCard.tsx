import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, Bell, GripVertical } from 'lucide-react';
import type { Deal } from '../../types';
import { cn } from '../../lib/utils';
import { useApp } from '../../context/AppContext';

interface SortableDealCardProps {
    deal: Deal;
    contactName?: string;
    onClick: (deal: Deal) => void;
}

export const SortableDealCard: React.FC<SortableDealCardProps> = ({ deal, contactName, onClick }) => {
    const { updateDeal } = useApp();
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
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const handleCardClick = () => {
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
            {...(isMobile ? {} : listeners)}
            onClick={handleCardClick}
            className={cn(
                "bg-white dark:bg-gray-700 p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-[background-color,border-color,box-shadow,opacity] group relative",
                !isMobile && "cursor-grab active:cursor-grabbing",
                isDragging && "opacity-30 border-primary-300 dark:border-primary-700"
            )}
        >
            {/* Mobile Drag Handle */}
            {isMobile && (
                <div
                    {...listeners}
                    className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                </div>
            )}

            <div className={cn("flex justify-between items-start mb-1 md:mb-2", isMobile && "ml-6")}>
                <div className="flex-1 mr-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 text-sm md:text-base">{deal.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            updateDeal({ ...deal, followUp: !deal.followUp });
                        }}
                        className={cn(
                            "p-1 rounded-md transition-all",
                            deal.followUp
                                ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20"
                                : "text-gray-300 hover:text-gray-400 dark:text-gray-600"
                        )}
                        title={deal.followUp ? "Följ upp aktiv" : "Markera för uppföljning"}
                    >
                        <Bell className={cn("w-3.5 h-3.5 md:w-4 md:h-4", deal.followUp && "fill-current")} />
                    </button>
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-200">
                        {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: deal.currency || 'SEK', maximumFractionDigits: 0 }).format(deal.value)}
                    </span>
                </div>
            </div>
            <p className={cn("text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-2 md:mb-3 flex items-center gap-1", isMobile && "ml-6")}>
                <AlertCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                {deal.expectedCloseDate || 'Inget datum'}
            </p>

            <div className={cn("mt-1 md:mt-2 pt-1 md:pt-2 border-t border-gray-50 dark:border-gray-600 flex justify-between items-center", isMobile && "ml-6")}>
                <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 truncate">
                    Kund: {contactName || 'Okänd'}
                </span>
                {deal.createdBy && (
                    <div
                        title={`Skapad av: ${deal.createdBy}`}
                        className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-[9px] font-bold border border-primary-200 dark:border-primary-800"
                    >
                        {deal.createdBy?.[0].toUpperCase()}
                    </div>
                )}
            </div>
        </div>
    );
};

