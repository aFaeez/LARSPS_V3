import { createContext, useContext, useState, ReactNode } from "react";
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectContextType {
    selectedProject: any;
    setSelectedProject: (project: any) => void;
}

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    const [selectedProject, setSelectedProject] = useState(null);

    return (
        <ProjectContext.Provider value={{ selectedProject, setSelectedProject }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const UseProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error("useProject must be used within a ProjectProvider");
    }
    return context;
};

// Utility function to safely render data
export const SafeRender = (value: any): string => {
    if (value === null || value === undefined || value === "{}") return ""; // Handle empty objects as well
    if (typeof value === "object") {
        return value.id || ""; // Extract a specific property or display empty ""
    }
    return value.toString();
};


export const SafeRenderDate = (date: any) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "";
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Ensures YYYY-MM-DD format
};

export const SafeRenderDatewithTime = (date: any) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "";

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');

    const hours = String(parsedDate.getHours()).padStart(2, '0');
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`; // Includes date and time
};

export const GetCurrentDateTime = () => {
    const now = new Date();

    const padZero = (num: number) => num.toString().padStart(2, '0');

    const year = now.getFullYear();
    const month = padZero(now.getMonth() + 1); // Months are 0-based
    const day = padZero(now.getDate());
    const hours = padZero(now.getHours());
    const minutes = padZero(now.getMinutes());
    const seconds = padZero(now.getSeconds());
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0'); // Pad to 3 digits

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

export async function GetUserIPAddress(): Promise<string> {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip; // Returns public IP address
    } catch (error) {
        console.error("Failed to fetch IP address:", error);
        return "Unknown";
    }
}

export function ValidateAndFormatDate(date: any): string {
    if (!date) return "";

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "";

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");
    const hours = String(parsedDate.getHours()).padStart(2, "0");
    const minutes = String(parsedDate.getMinutes()).padStart(2, "0");
    const seconds = String(parsedDate.getSeconds()).padStart(2, "0");
    const milliseconds = String(parsedDate.getMilliseconds()).padStart(3, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

export function ValidateAndFormatDateOnly(date: any): string {
    if (!date) return "";

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "";

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function validateAndISOFormatDate(date: any): string | null {
    if (!date) return null; // Instead of ""

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return null; // Return null for invalid dates

    return parsedDate.toISOString();
}


export function ValidateAndFormatDateAndTime(date: any): string {
    if (!date) return "";

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "";

    const day = String(parsedDate.getDate()).padStart(2, "0");
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const year = parsedDate.getFullYear();
    let hours = parsedDate.getHours();
    const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

    const amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day}-${month}-${year} ${hours}:${minutes} ${amPm}`;
}

// Utility function to check if a value is an empty object
export function IsEmptyObject(value: any): boolean {
    return value && Object.keys(value).length === 0 && value.constructor === Object;
}

// Utility function to format numbers
export function FormatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", { style: "decimal", minimumFractionDigits: 2 }).format(amount);
}

export function ITAdminChecker(user: string, itadmin: string): number {
    if (!user || !itadmin) return 0; // Return 0 if inputs are missing

    const itAdminList = itadmin.split(',').map(admin => admin.trim()); // Convert to array
    return itAdminList.includes(user) ? 1 : 0; // Return 1 if user is in the list, else 0
}