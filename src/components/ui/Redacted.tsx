import React from 'react';
import { useDemo } from '../../context/DemoContext';

interface RedactedProps {
    children: React.ReactNode;
    /** 'value' = currency/number pill  |  'name' = text blur  |  'text' = generic inline redact */
    type?: 'value' | 'name' | 'text';
    className?: string;
}

export const Redacted: React.FC<RedactedProps> = ({ children, type = 'value', className }) => {
    const { isDemoMode } = useDemo();

    if (!isDemoMode) {
        return <>{children}</>;
    }

    if (type === 'value') {
        return (
            <span
                className={`inline-block select-none rounded px-1 bg-gray-300 dark:bg-gray-600 text-transparent ${className ?? ''}`}
                aria-hidden="true"
            >
                ████ kr
            </span>
        );
    }

    if (type === 'name') {
        return (
            <span
                className={`inline-block select-none blur-sm pointer-events-none ${className ?? ''}`}
                aria-hidden="true"
            >
                {children}
            </span>
        );
    }

    // type === 'text'
    return (
        <span
            className={`inline-block select-none rounded bg-gray-300 dark:bg-gray-600 text-transparent ${className ?? ''}`}
            aria-hidden="true"
        >
            ████████
        </span>
    );
};
