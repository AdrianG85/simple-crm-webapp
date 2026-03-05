import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    sidePanel?: React.ReactNode; // optional desktop-only side panel
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, sidePanel }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex items-stretch gap-3 w-full max-w-[900px]">

                {/* Main modal card */}
                <div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex-1 min-w-0 overflow-hidden animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-4 max-h-[80vh] overflow-y-auto">
                        {children}
                    </div>
                </div>

                {/* Side panel — desktop only, slides in when provided */}
                {sidePanel && (
                    <div
                        className="hidden md:flex flex-col flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-y-auto flex-shrink-0 animate-in slide-in-from-right-4 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {sidePanel}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
