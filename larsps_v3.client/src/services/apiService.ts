import axiosInstance from "./axiosInstance";
import * as globalVariable from "./globalVariable";
import * as apiClient from "./apiClient";
import { StatusOptionDTO, BGDTO, BGSub, BGDashboard, APB, AttachmentTable, Settings, LARDashboard } from "../dto/dtos";

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

export const WebConfig = async (): Promise<Settings> => {
    try {
        const response = await axiosInstance.get<Settings>("/api/settings");
        return response.data;
    } catch (error) {
        console.error("Error fetching settings. Please try again.", error);
        throw new Error("Failed to fetch settings. Please try again.");
    }
};

export const FetchRedirectData = async (): Promise<{ redirectURL: string }> => {
    try {
        const response = await axiosInstance.get<{ redirectURL: string }>("/api/redirect", {
            params: {
                mod: new URLSearchParams(window.location.search).get("mod"),
                userid: sessionStorage.getItem("Login"),
                position: sessionStorage.getItem("UsePosition"),
                project: sessionStorage.getItem("Project"),
            },
        });

        if (!response.data.redirectURL) {
            throw new Error("Invalid redirect URL");
        }

        return response.data;
    } catch (error) {
        console.error("Error fetching settings. Please try again.", error);
        throw new Error("Failed to fetch redirect data.");
    }
};


//----------------------------------------------------------------------------------------------------------------------
// Fetch project data by status ID
//export const FetchProjectsByStatus = async (statusID: number): Promise<ProjectDTO[]> => {
//    try {
//        const response = await axiosInstance.post("/GetProject", { intPrjStatus: statusID });
//        //console.log("API Response for Projects:", response.data); // Debugging
//        return response.data;
//    } catch (error) {
//        console.error("Error fetching projects by status:", error);
//        throw new Error("Failed to fetch projects. Please try again.");
//    }
//};

export const FetchProjectsByStatus = async (requestData: apiClient.GetProjectRequest): Promise<apiClient.GetProjectResponse[]> => {
    try {
        const response = await axiosInstance.post<apiClient.GetProjectResponse[]>("/GetProject", requestData, {
            headers: { "Content-Type": "application/json" }
        });

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

// GET TotalProject
export const GetTotalProject = async (userId: string, companyName: string): Promise<LARDashboard[]> => {
    try {
        const response = await axiosInstance.post("/LARDashboard_1", { compIdStr: companyName, userIdStr: userId });
        console.log("Checkpoint 1: " + response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching LARDashboard_1:", error);
        throw new Error("Failed to fetch LARDashboard_1. Please try again.");
    }
};

// GET PendingApprovals
export const GetPendingApprovals = async (userId: string, companyName: string): Promise<LARDashboard[]> => {
    try {
        const response = await axiosInstance.post("/LARDashboard_2", { compIdStr: companyName, userIdStr: userId });
        return response.data;
    } catch (error) {
        console.error("Error fetching LARDashboard_2:", error);
        throw new Error("Failed to fetch LARDashboard_2. Please try again.");
    }
};

// GET NearExpiry
export const GetNearExpiry = async (userId: string, companyName: string): Promise<LARDashboard[]> => {
    try {
        const response = await axiosInstance.post("/LARDashboard_3", { compIdStr: companyName, userIdStr: userId });
        return response.data;
    } catch (error) {
        console.error("Error fetching LARDashboard_3:", error);
        throw new Error("Failed to fetch LARDashboard_3. Please try again.");
    }
};

// Fetch BG Sub
export const FetchGetBG = async (UPProjectId: string,companyName: string): Promise<BGDTO[]> => {
    try {
        const response = await axiosInstance.post("/GetBG", { compIdStr: companyName, projectStr: UPProjectId });

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
export const FetchAPB = async (strProjId: string, strLaNo: string, companyName: string): Promise<APB[]> => {
    try {
        const response = await axiosInstance.post("/GetAPB", { compIdStr: companyName, projectStr: strProjId, strLaNo: strLaNo });

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
export const GetTotLA = async (UPProjectId: string, companyName: string): Promise<BGDashboard[]> => {
    try {
        const response = await axiosInstance.post("/BGDashboard_TotLA", { compIdStr: companyName, projectStr: UPProjectId });
        return response.data;
    } catch (error) {
        console.error("Error fetching GetBGDashboard_TotLABG:", error);
        throw new Error("Failed to fetch BGDashboard_TotLA. Please try again.");
    }
};

// GET BGDashboard_Approved
export const GetApproved = async (UPProjectId: string, companyName: string): Promise<BGDashboard[]> => {
    try {
        const response = await axiosInstance.post("/BGDashboard_Approved", { compIdStr: companyName, projectStr: UPProjectId });
        return response.data;
    } catch (error) {
        console.error("Error fetching BGDashboard_Approved:", error);
        throw new Error("Failed to fetch BGDashboard_Approved. Please try again.");
    }
};

// GET BGDashboard_Pending
export const GetPending = async (UPProjectId: string, companyName: string): Promise<BGDashboard[]> => {
    try {
        const response = await axiosInstance.post("/BGDashboard_Pending", { compIdStr: companyName, projectStr: UPProjectId });
        return response.data;
    } catch (error) {
        console.error("Error fetching BGDashboard_Pending:", error);
        throw new Error("Failed to fetch BGDashboard_Pending. Please try again.");
    }
};

//const allowedColumns: (keyof BGSub)[] = [
//    "BGDate",
//    "BGExpiryDate",
//    "BGToExtend",
//    "BGExtDate",
//    "BGRefNo",
//    "BGBank",
//    "BGUserId",
//    "BGUserIPAddr",
//    "BGRecDate"
//];

//export const SubmitBG = async (formData: BGSub[], companyName: string): Promise<BGSub[]> => {
//    try {
//        const sqlString = formData.map((item) => {
//            const columnAssignments = allowedColumns
//                .filter((key) => key in item)
//                .map((key) => {
//                    if (key === "BGToExtend") {
//                        const transformedValue = item.BGToExtend === "Yes" ? 1 : item.BGToExtend === "No" ? 0 : item.BGToExtend;
//                        return `${key}='${transformedValue}'`;
//                    }
//                    return `${key}='${item[key]}'`; 
//                })
//                .join(", ");

//            return `${columnAssignments} WHERE BGCompId='${companyName}' AND BGLaNo='${item.BGLaNo}' AND BGActive='1'`;
//        });

//        console.log("Generated SQL String:", sqlString);
//        const response = await axiosInstance.post("/SubmitBG", { strSQL: sqlString.join("; ") });
//        console.log("API Response for Submit BG:", response.data);
//        return response.data;
//    } catch (error) {
//        console.error("Error Submit BG:", error);
//        throw new Error("Failed to Submit BG. Please try again.");
//    }
//};

// Submit BG
export const SubmitBG = async (formData: apiClient.SubmitBGRequest): Promise<apiClient.GeneralResponse> => {
    try {
        console.log("Form Data:", formData);
        const response = await axiosInstance.post<apiClient.GeneralResponse>("/SubmitBG", formData, {
            headers: { "Content-Type": "application/json" }
        });
        
        return response.data;
    } catch (error) {
        console.error("Failed to update BG:", error);
        throw new Error("Failed to update Bank Guarantee");
    }
};

export const SubmitAPB = async (formData: apiClient.SubmitAPBRequest): Promise<apiClient.GeneralResponse> => {
    try {
        console.log("Form Data:", formData);
        const response = await axiosInstance.post<apiClient.GeneralResponse>("/SubmitAPB", formData, {
            headers: { "Content-Type": "application/json" }
        });

        return response.data;
    } catch (error) {
        console.error("Failed to update APB:", error);
        throw new Error("Failed to update APB");
    }
};


//const allowedColumnsAPB: (keyof APB)[] = [
//    "APBAmount",
//    "APBDate",
//    "APBExpiryDate",
//    "APBExtDate",
//    "APBProvidedDate",
//    "APBRefNo",
//    "APBBank"
//];



// Submit APB
//export const SubmitAPB = async (formData: APB[],companyName: string): Promise<APB[]> => {
//    try {
//        const sqlString = formData.map((item) => {
//            const columnAssignments = allowedColumnsAPB
//                .filter((key) => key in item)
//                .map((key) => {
//                    return `${key}='${item[key]}'`;
//                })
//                .join(", ");

//            return `${columnAssignments} WHERE APBCompId='${companyName}' AND APBLaNo='${item.APBLaNo}' AND APBActive='1'`;
//        });
//        //console.log("Generated SQL String:", sqlString);
//        const response = await axiosInstance.post("/SubmitAPB", { strSQL: sqlString.join("; ") });
//        //console.log("API Response for Submit APB:", response.data);
//        return response.data;
//    } catch (error) {
//        console.error("Error Submit APB:", error);
//        throw new Error("Failed to Submit APB. Please try again.");
//    }
//};

// Activator   #1 Activate BG   #2 Activate APB   #3 Activate Waived
export const Activator = async (AppStat: string, UserId: string, IPAddr: string, DateCurr: string, type: string, LANo: string, companyName: string): Promise<any[]> => {
    try {
        const response = await axiosInstance.post("/Activator", { AppStatStr: AppStat, UserIdStr: UserId, IPAddrStr: IPAddr, DateCurrStr: DateCurr, typeStr: type, compIDStr: companyName, laNoStr: LANo });
        return response.data;
    } catch (error) {
        console.error("Error activate" + type, error);
        throw new Error("Failed to activate. Please try again.");
    }
};

// Fetch GetUserQSME
//export const GetUserQSME = async (): Promise<UserQSME[]> => {
//    try {
//        const response = await axiosInstance.post("/GetUserQSME");
//        return response.data;
//    } catch (error) {
//        console.error("Error fetching project status options:", error);
//        throw new Error("Failed to fetch project status options. Please try again.");
//    }
//};



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

export const UploadFile = async (formData: apiClient.UploadRequest): Promise<apiClient.GeneralResponse> => {
    try {
        console.log("Form Data:", formData);
        const response = await axiosInstance.post<apiClient.GeneralResponse>("/UpsertBGApUpload", formData, {
            headers: { "Content-Type": "application/json" }
        });

        return response.data;
    } catch (error) {
        console.error("Failed to upload attachment:", error);
        throw new Error("Failed to upload attachment");
    }
};




export const LoginCred = async (requestData: apiClient.GetUserRequest): Promise<apiClient.GetUserResponse[]> => {
    try {
        const response = await axiosInstance.post<apiClient.GetUserResponse[]>("/GetUser", requestData, {
            headers: { "Content-Type": "application/json" }
        });

        return response.data;
    } catch (error) {
        console.error("Failed login please try again:", error);
        throw new Error("Failed login please try again");
    }
};

//parent
export const fetchParentMenus = async (requestData: apiClient.GetMenuParentRequest): Promise<apiClient.GetMenuParentResponse[]> => {
    try {
        const response = await axiosInstance.post<apiClient.GetMenuParentResponse[]>("/GetMenuParent", requestData, {
            headers: { "Content-Type": "application/json" }
        });

        return response.data; 
    } catch (error) {
        console.error("Failed to fetch menus:", error);
        throw new Error("Failed to fetch menus");
    }
};


//child
export const fetchMenus = async (requestData: apiClient.GetMenuChildRequest): Promise<apiClient.GetMenuChildResponse[]> => {
    try {

        const response = await axiosInstance.post<apiClient.GetMenuChildResponse[]>("/GetMenuChild", requestData, {
            headers: { "Content-Type": "application/json" }
        });

        return response.data; 
    } catch (error) {
        console.error("Failed to fetch menus:", error);
        throw new Error("Failed to fetch menus");
    }
};