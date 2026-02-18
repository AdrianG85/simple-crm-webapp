import React, { createContext, useContext, useState, useEffect } from 'react';

interface DemoContextType {
    isDemoMode: boolean;
    toggleDemoMode: () => void;
}

const DemoContext = createContext<DemoContextType>({
    isDemoMode: false,
    toggleDemoMode: () => { },
});

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
        try {
            return localStorage.getItem('adgs_demo_mode') === 'true';
        } catch {
            return false;
        }
    });

    useEffect(() => {
        localStorage.setItem('adgs_demo_mode', String(isDemoMode));
    }, [isDemoMode]);

    const toggleDemoMode = () => setIsDemoMode(prev => !prev);

    return (
        <DemoContext.Provider value={{ isDemoMode, toggleDemoMode }}>
            {children}
        </DemoContext.Provider>
    );
};

export const useDemo = () => useContext(DemoContext);
