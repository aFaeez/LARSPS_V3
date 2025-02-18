import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axiosInstance from "../services/axiosInstance";

interface SessionContextType {
    userId: string | null;
    isITAdmin: number;
    connDb: string | null;
    systemName: string | null;
    companyName: string | null;
    fullName: string | null;
    setUserId: (userId: string) => void;
    setIsITAdmin: (isAdmin: number) => void;
    setConnDb: (connDb: string) => void;
    setSystemName: (systemName: string) => void;
    setCompanyName: (companyName: string) => void;
    setFullName: (fullName: string) => void;
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
    const [userId, setUserId] = useState<string | null>(sessionStorage.getItem('UserId') ?? null);
    const [isITAdmin, setIsITAdmin] = useState<number>(parseInt(sessionStorage.getItem('IsITAdmin') || '0', 10));
    const [connDb, setConnDb] = useState<string | null>(sessionStorage.getItem('ConnDb') ?? null);
    const [systemName, setSystemName] = useState<string | null>(sessionStorage.getItem('SystemName') ?? null);
    const [companyName, setCompanyName] = useState<string | null>(sessionStorage.getItem('CompanyName') ?? null);
    const [fullName, setFullName] = useState<string | null>(sessionStorage.getItem('FullName') ?? null);


    // Sync state with sessionStorage when values change
    useEffect(() => {
        if (userId) sessionStorage.setItem('UserId', userId);
        if (connDb) sessionStorage.setItem('ConnDb', connDb);
        if (systemName) sessionStorage.setItem('SystemName', systemName);
        if (companyName) sessionStorage.setItem('CompanyName', companyName);
        if (fullName) sessionStorage.setItem('FullName', fullName); 
        sessionStorage.setItem('IsITAdmin', isITAdmin.toString());
    }, [userId, isITAdmin, connDb, systemName, companyName,fullName]);

    //macam tak pakai
    // Fetch system settings including ITADMIN role
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axiosInstance.get("/api/settings");

                if (!response || !response.data) {
                    console.error("API response is undefined or empty!");
                    return;
                }
                const data = response.data;
                const itAdminList = (data.itadmin || "").split(',').map((admin: string) => admin.trim());
                const isAdmin = itAdminList.includes(userId ?? '') ? 1 : 0;

                setIsITAdmin(isAdmin);
                setConnDb(data.connDb || null);
                setSystemName(data.systemName || null);
                setCompanyName(data.companyName || null);
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };
        if (userId) {
            fetchSettings();
        }
    }, [userId]);

    return (
        <SessionContext.Provider value={{ userId, isITAdmin, connDb, systemName, companyName, fullName, setUserId, setIsITAdmin, setConnDb, setSystemName, setCompanyName, setFullName }}>
            {children}
        </SessionContext.Provider>
    );
};
