import axiosInstance from "./axiosInstance";
import * as globalVariable from "./globalVariable";
import { ProjectDTO, StatusOptionDTO, BGDTO, BGSub, BGDashboard, UserQSME, APB, AttachmentTable } from "../dto/dtos";

export const getCompanyName = (): string => {
    return globalVariable.COMPANY_NAME;
};

const apiService = {
    // Fetch user projects from the stored procedure
    getUserProjects: async (): Promise<any[]> => {
        try {
            const response = await axiosInstance.post("/settedStoredProc"); // No pagination params sent
            if (response.data && Array.isArray(response.data)) {
                return response.data; // Return the array of user projects
            }
            return []; // Default to empty array if no data
        } catch (error: any) {
            console.error("Error fetching user projects:", error.message || error);
            throw new Error(error?.response?.data?.message || "Unable to fetch user projects. Please try again.");
        }
    },
};
export default apiService;

//----------------------------------------------------------------------------------------------------------------------
// Fetch project data by status ID
export const FetchProjectsByStatus = async (statusID: number): Promise<ProjectDTO[]> => {
    try {
        const response = await axiosInstance.post("/GetProject", { intPrjStatus: statusID });
        //console.log("API Response for Projects:", response.data); // Debugging
        return response.data;
    } catch (error) {
        console.error("Error fetching projects by status:", error);
        throw new Error("Failed to fetch projects. Please try again.");
    }
};

// Fetch status options
export const FetchProjectStatusOptions = async (): Promise<StatusOptionDTO[]> => {
    try {
        const response = await axiosInstance.post("/GetProjectStatus");
        //console.log("API Response for Status Options:", response.data); // Debugging
        return response.data;
    } catch (error) {
        console.error("Error fetching project status options:", error);
        throw new Error("Failed to fetch project status options. Please try again.");
    }
};

// Fetch BG Sub
export const FetchGetBG = async (UPProjectId: string): Promise<BGDTO[]> => {
    try {
        const CompId = getCompanyName();
        const response = await axiosInstance.post("/GetBG", { compIdStr: CompId, projectStr: UPProjectId });

        // Map the API data to enforce DTO structure
        const mappedData: BGDTO[] = response.data.map((item: any) => ({
            UPProjectId: item.UPProjectId || "N/A",
            ProProjectDesc: item.ProProjectDesc || "N/A",
            ProProjectType: typeof item.ProProjectType === "string" ? item.ProProjectType : null, // Convert objects to null
            ProjWithFS: item.ProjWithFS || 0,
            HawLaNo: item.HawLaNo || "N/A",
            ComName: item.ComName || "N/A",
            HawWorkScope: item.HawWorkScope || "N/A",
            SupLaAmt: globalVariable.FormatCurrency(item.SupLaAmt) || 0,
            BGQSAppStat: globalVariable.IsEmptyObject(item.BGQSAppStat) ? null : item.BGQSAppStat,
            APBQSAppStat: globalVariable.IsEmptyObject(item.APBQSAppStat) ? null : item.APBQSAppStat,
            BGQSAppUserId: globalVariable.IsEmptyObject(item.BGQSAppUserId) ? null : item.BGQSAppUserId,
            // Validate and format date values
            BGQSAppDate: globalVariable.ValidateAndFormatDate(item.BGQSAppDate),
            BGUserId: item.BGUserId || "N/A",
            BGUserIPAddr: item.BGUserIPAddr || "N/A",
            BGRecDate: globalVariable.ValidateAndFormatDate(item.BGRecDate), 
            HawRecId: item.HawRecId || 0,
            BGExtWaived: item.BGExtWaived || "N/A",
            BGExtWaivedUserId: typeof item.BGExtWaivedUserId === "string" ? item.BGExtWaivedUserId : "N/A",
            BGExtWaivedDate: globalVariable.ValidateAndFormatDate(item.BGExtWaivedDate), 
        }));

        return mappedData;
    } catch (error) {
        console.error("Error fetching GetBG:", error);
        throw new Error("Failed to fetch GetBG. Please try again.");
    }
};

// Fetch BG Sub
export const FetchBGSub = async (LANo: string): Promise<BGSub[]> => {
    try {
        const response = await axiosInstance.post("/GetBGSub", { strLaNo: LANo });

        const mappedData: BGSub[] = response.data.map((item: any) => ({
            BGLaNo: item.BGLaNo || "N/A",
            BGAmount: globalVariable.FormatCurrency(item.BGAmount),
            BGDate: globalVariable.ValidateAndFormatDate(item.BGDate),
            BGExpiryDate: globalVariable.ValidateAndFormatDate(item.BGExpiryDate),
            BGToExtend: globalVariable.IsEmptyObject(item.BGToExtend) ? null : item.BGToExtend,
            BGExtDate: globalVariable.ValidateAndFormatDate(item.BGExtDate), 
            BGProvidedDate: globalVariable.ValidateAndFormatDate(item.BGProvidedDate), 
            BGRefNo: globalVariable.IsEmptyObject(item.BGRefNo) ? null : item.BGRefNo,
            BGBank: globalVariable.IsEmptyObject(item.BGBank) ? null : item.BGBank,
            HawDateExt: globalVariable.ValidateAndFormatDate(item.HawDateExt), 
            Attachment: globalVariable.IsEmptyObject(item.Attachment)? null : item.Attachment,
            HawProjId: globalVariable.IsEmptyObject(item.HawProjId) ? null : item.HawProjId,
            HawRecId: item.HawRecId || 0,
            PBReplacementLetter: globalVariable.IsEmptyObject(item.PBReplacementLetter) ? null : item.PBReplacementLetter,
            PBReplacementLetterOption: globalVariable.IsEmptyObject(item.PBReplacementLetter) ? null : item.PBReplacementLetter,
            BGUserId: globalVariable.IsEmptyObject(item.BGUserId) ? null : item.BGUserId,
            BGRecDate: globalVariable.ValidateAndFormatDate(item.BGRecDate), 
            BGRecId: item.BGRecId || 0,
        }));
        return mappedData;
    } catch (error) {
        console.error("Error fetching BGSub:", error);
        throw new Error("Failed to fetch BGSub. Please try again.");
    }
};

// Fetch APB
export const FetchAPB = async (strProjId: string, strLaNo: string): Promise<APB[]> => {
    try {
        const CompId = getCompanyName();
        const response = await axiosInstance.post("/GetAPB", { compIdStr: CompId, projectStr: strProjId, strLaNo: strLaNo });

        const mappedData: APB[] = response.data.map((item: any) => ({
            APBLaNo: globalVariable.IsEmptyObject(item.APBLaNo) ? null : item.APBLaNo,
            APBAmount: globalVariable.FormatCurrency(item.APBAmount),
            APBDate: globalVariable.ValidateAndFormatDate(item.APBDate),
            APBExpiryDate: globalVariable.ValidateAndFormatDate(item.APBExpiryDate),
            APBExtDate: globalVariable.ValidateAndFormatDate(item.APBExtDate),
            APBProvidedDate: globalVariable.ValidateAndFormatDate(item.APBProvidedDate),
            APBRefNo: globalVariable.IsEmptyObject(item.APBRefNo) ? null : item.APBRefNo,
            APBBank: globalVariable.IsEmptyObject(item.APBBank) ? null : item.APBBank,
            APBRecId: item.APBRecId || 0,
            Attachment: item.Attachment || "N/A",
            HawRecId: item.HawRecId || "N/A",
            HawProjId: item.HawProjId || "N/A",
        }));
        return mappedData;
    } catch (error) {
        console.error("Error fetching APB:", error);
        throw new Error("Failed to fetch APB. Please try again.");
    }
};

// GET BGDashboard_TotLA
export const GetTotLA = async (UPProjectId: string): Promise<BGDashboard[]> => {
    try {
        const CompId = getCompanyName();
        const response = await axiosInstance.post("/BGDashboard_TotLA", { compIdStr: CompId, projectStr: UPProjectId });
        return response.data;
    } catch (error) {
        console.error("Error fetching GetBGDashboard_TotLABG:", error);
        throw new Error("Failed to fetch BGDashboard_TotLA. Please try again.");
    }
};

// GET BGDashboard_Approved
export const GetApproved = async (UPProjectId: string): Promise<BGDashboard[]> => {
    try {
        const CompId = getCompanyName();
        const response = await axiosInstance.post("/BGDashboard_Approved", { compIdStr: CompId, projectStr: UPProjectId });
        return response.data;
    } catch (error) {
        console.error("Error fetching BGDashboard_Approved:", error);
        throw new Error("Failed to fetch BGDashboard_Approved. Please try again.");
    }
};

// GET BGDashboard_Pending
export const GetPending = async (UPProjectId: string): Promise<BGDashboard[]> => {
    try {
        const CompId = getCompanyName();
        const response = await axiosInstance.post("/BGDashboard_Pending", { compIdStr: CompId, projectStr: UPProjectId });
        return response.data;
    } catch (error) {
        console.error("Error fetching BGDashboard_Pending:", error);
        throw new Error("Failed to fetch BGDashboard_Pending. Please try again.");
    }
};


const allowedColumns: (keyof BGSub)[] = [
    "BGDate",
    "BGExpiryDate",
    "BGToExtend",
    "BGExtDate",
    "BGRefNo",
    "BGBank",
    "BGUserId",
    "BGUserIPAddr",
    "BGRecDate"
];

// Submit BG
export const SubmitBG = async (formData: BGSub[]): Promise<BGSub[]> => {
    try {
        const CompId = getCompanyName();
        const sqlString = formData.map((item) => {
            const columnAssignments = allowedColumns
                .filter((key) => key in item)
                .map((key) => {
                    if (key === "BGToExtend") {
                        const transformedValue = item.BGToExtend === "Yes" ? 1 : item.BGToExtend === "No" ? 0 : item.BGToExtend;
                        return `${key}='${transformedValue}'`;
                    }
                    return `${key}='${item[key]}'`; 
                })
                .join(", ");

            return `${columnAssignments} WHERE BGCompId='${CompId}' AND BGLaNo='${item.BGLaNo}' AND BGActive='1'`;
        });

        //console.log("Generated SQL String:", sqlString);
        const response = await axiosInstance.post("/SubmitBG", { strSQL: sqlString.join("; ") });
        //console.log("API Response for Submit BG:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Submit BG:", error);
        throw new Error("Failed to Submit BG. Please try again.");
    }
};


const allowedColumnsAPB: (keyof APB)[] = [
    "APBAmount",
    "APBDate",
    "APBExpiryDate",
    "APBExtDate",
    "APBProvidedDate",
    "APBRefNo",
    "APBBank"
];

// Submit APB
export const SubmitAPB = async (formData: APB[]): Promise<APB[]> => {
    try {
        const CompId = getCompanyName();
        const sqlString = formData.map((item) => {
            const columnAssignments = allowedColumnsAPB
                .filter((key) => key in item)
                .map((key) => {
                    return `${key}='${item[key]}'`;
                })
                .join(", ");

            return `${columnAssignments} WHERE APBCompId='${CompId}' AND APBLaNo='${item.APBLaNo}' AND APBActive='1'`;
        });
        //console.log("Generated SQL String:", sqlString);
        const response = await axiosInstance.post("/SubmitAPB", { strSQL: sqlString.join("; ") });
        //console.log("API Response for Submit APB:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Submit APB:", error);
        throw new Error("Failed to Submit APB. Please try again.");
    }
};

// Activator   #1 Activate BG   #2 Activate APB   #3 Activate Waived
export const Activator = async (AppStat: string, UserId: string, IPAddr: string, DateCurr: string, type: string, LANo: string): Promise<any[]> => {
    const CompId = getCompanyName();
    try {
        const response = await axiosInstance.post("/Activator", { AppStatStr: AppStat, UserIdStr: UserId, IPAddrStr: IPAddr, DateCurrStr: DateCurr, typeStr: type, compIDStr: CompId, laNoStr: LANo });
        return response.data;
    } catch (error) {
        console.error("Error activate" + type, error);
        throw new Error("Failed to activate. Please try again.");
    }
};

// Fetch GetUserQSME
export const GetUserQSME = async (): Promise<UserQSME[]> => {
    try {
        const response = await axiosInstance.post("/GetUserQSME");
        return response.data;
    } catch (error) {
        console.error("Error fetching project status options:", error);
        throw new Error("Failed to fetch project status options. Please try again.");
    }
};



// Fetch Fetch Get File
export const FetchGetFile = async (LaNo: string, project: string): Promise<AttachmentTable[]> => {
    try {
        const response = await axiosInstance.post("/GetFile", { LaNoStr: LaNo, projectStr: project });

        // Map the API data to enforce DTO structure
        const mappedData: AttachmentTable[] = response.data.map((item: any) => ({
            BGAPRecId: item.BGAPRecId || 0,
            BGAPProjId: item.BGAPProjId || "N/A",
            BGAPLaNo: item.BGAPLaNo || "N/A",
            BGAPHawRecId: item.BGAPHawRecId || 0,
            BGAPType: item.BGAPType || "N/A",
            BGPBRLPercent: item.BGPBRLPercent || 0,
            BGAPNo: item.BGAPNo || 0,
            BGAPUserId: item.BGAPUserId || "N/A",
            BGAPFile: item.BGAPFile || "N/A",
            BGAPIP: item.BGAPIP || "N/A",
            BGAPDate: globalVariable.ValidateAndFormatDate(item.BGAPDate),
            BGAPDeleted: item.BGAPDeleted || "N/A",
            BGRLDeletedBy: item.BGRLDeletedBy || "N/A",
            BGRLDeletedDT: globalVariable.ValidateAndFormatDate(item.BGRLDeletedDT),
            BGRLDeletedIP: item.BGRLDeletedIP || "N/A",
            BGRLApprovedStat: item.BGRLApprovedStat || 0,
            BGRLApprovedBy: item.BGRLApprovedBy || "N/A",
            BGRLApprovedDT: globalVariable.ValidateAndFormatDate(item.BGRLApprovedDT),
            BGRLApprovedIP: item.BGRLApprovedIP || "N/A",
            BGRLRejectReason: item.BGRLRejectReason || "N/A",
            AllowDelete: item.AllowDelete || 0,
        }));

        return mappedData;
    } catch (error) {
        console.error("Error fetching GetFile:", error);
        throw new Error("Failed to fetch GetFile. Please try again.");
    }
};

import { GetMenuChildRequest, GetMenuChildResponse, GetMenuParentRequest, GetMenuParentResponse, GetUserRequest,GetUserResponse } from "./apiClient";

//export const LoginCred = async (credentials: { userid: string; password: string }): Promise<User> => {
//    try {
//        const response = await axiosInstance.post("/GetUser", credentials);
//        return response.data;
//    } catch (error) {
//        console.error("Error during login:", error);
//        throw new Error("Failed to login. Please try again.");
//    }
//};

export const LoginCred = async (requestData: GetUserRequest): Promise<GetUserResponse[]> => {
    try {
        const response = await axiosInstance.post<GetUserResponse[]>("/GetUser", requestData, {
            headers: { "Content-Type": "application/json" }
        });

        return response.data;
    } catch (error) {
        console.error("Failed login please try again:", error);
        throw new Error("Failed login please try again");
    }
};

//parent
export const fetchParentMenus = async (requestData: GetMenuParentRequest): Promise<GetMenuParentResponse[]> => {
    try {
        const response = await axiosInstance.post<GetMenuParentResponse[]>("/GetMenuParent", requestData, {
            headers: { "Content-Type": "application/json" }
        });

        return response.data; 
    } catch (error) {
        console.error("Failed to fetch menus:", error);
        throw new Error("Failed to fetch menus");
    }
};


//child
export const fetchMenus = async (requestData: GetMenuChildRequest): Promise<GetMenuChildResponse[]> => {
    try {
        const response = await axiosInstance.post<GetMenuChildResponse[]>("/GetMenuChild", requestData, {
            headers: { "Content-Type": "application/json" }
        });

        return response.data; 
    } catch (error) {
        console.error("Failed to fetch menus:", error);
        throw new Error("Failed to fetch menus");
    }
};