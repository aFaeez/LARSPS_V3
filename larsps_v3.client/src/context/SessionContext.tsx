import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import axiosInstance from "../services/axiosInstance";
interface SessionContextType {
    userId: string | null;
    isITAdmin: number;
    connDb: string | null;
    systemName: string | null;
    companyName: string | null;
    setUserId: (userId: string) => void;
    setIsITAdmin: (isAdmin: number) => void;
}

// Create the context
const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
    children: ReactNode;
}

// Custom hook to access session context
export const useSession = (): SessionContextType => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

// Context provider component
export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
    const [userId, setUserId] = useState<string | null>(sessionStorage.getItem('UserId'));
    const [isITAdmin, setIsITAdmin] = useState<number>(0);
    const [connDb, setConnDb] = useState<string | null>(null);
    const [systemName, setSystemName] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState<string | null>(null);

    // Fetch system settings including ITADMIN role
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                console.log("Fetching system settings...");
                const response = await axiosInstance.get("/api/settings");

                if (!response || !response.data) {
                    console.error("API response is undefined or empty!");
                    return;
                }

                console.log('Received settings:', response.data);

                const data = response.data;
                console.log('IT Admin List:', data.itadmin);

                const itAdminList = (data.itadmin || "").split(',').map((admin: string) => admin.trim());
                const isAdmin = itAdminList.includes(userId ?? '') ? 1 : 0;

                setIsITAdmin(isAdmin);
                setConnDb(data.connDb || null);
                setSystemName(data.systemName || null);
                setCompanyName(data.companyName || null);

                sessionStorage.setItem('IsITAdmin', isAdmin.toString());
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };
        if (userId) {
            fetchSettings();
        }
    }, [userId]);



    return (
        <SessionContext.Provider value={{ userId, isITAdmin, connDb, systemName, companyName, setUserId, setIsITAdmin }}>
            {children}
        </SessionContext.Provider>
    );
};
