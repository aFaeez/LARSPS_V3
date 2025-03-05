// Define types for the status options and project data
export interface StatusOptionDTO {
    StatusID: number;
    StatusDesc: string;
}

export interface ProjectDTO {
    UPProjectId?: string; // Mark as optional if it might be missing
    ProProjectDesc?: string;
    ProProjectType?: string | object | null;
    ProjWithFS?: number;
}

export interface User {
    UserId: string;
    AccessStartDate?: string | null;
    AccessEndDate?: string | null;
    IsActive: number;
    MSName?: string;
    MSEmail?: string;
    MSDDepartment?: string;
    MSDPostingLocation?: string;
    MSDPostingCode?: string;
    MSDDesignation?: string;
    MSIsActive: number;
    RoleName?: string;
}


export interface BGDTO {
    UPProjectId: string;
    ProProjectDesc: string;
    ProProjectType: string | null; // Ensures it's not an object
    ProjWithFS: number;
    HawLaNo: string;
    ComName: string;
    HawWorkScope: string;
    SupLaAmt: number;
    BGQSAppStat?: string;
    APBQSAppStat?: string;
    BGQSAppUserId?: string;
    BGQSAppDate?: string; // Convert date to string for rendering
    BGUserId?: string;
    BGUserIPAddr?: string; // String for IP Address
    BGRecDate: string; // Convert date to string
    HawRecId: number;
    BGExtWaived: string;
    BGExtWaivedUserId?: string; // Ensure it's not an object
    BGExtWaivedDate?: string; // Convert date to string
}

export interface BGSub {
    BGLaNo: string;
    BGAmount: number;
    BGDate?: string | null; 
    BGExpiryDate?: string | null;
    BGToExtend: string;
    BGExtDate?: string | null;
    BGProvidedDate?: string | null;
    BGQSAppStat?: number
    BGQSAppUserId?: string;
    BGQSAppUserIPAddr?: string;
    BGQSAppDate?: string;
    BGRefNo?: string | null;
    BGBank?: string | null;
    BGIsWaived?: number
    BGQSWaivedUserId?: string;
    BGQSWaivedUserIPAddr?: string;
    BGQSWaivedDate?: string;
    HawDateExt?: string | null;
    Attachment?: string; 
    HawProjId: string; 
    HawRecId: number;
    PBReplacementLetter?: string | null;
    PBReplacementLetterOption: string;
    BGUserId: string; 
    BGUserIPAddr: string;
    BGRecDate: string;
    BGRecId: number; 
}

export interface APB {
    APBLaNo: string; 
    APBAmount: number;
    APBDate?: string | null; 
    APBExpiryDate?: string | null;
    APBExtDate?: string | null; 
    APBProvidedDate?: string | null; 
    APBQSAppStat?: number
    APBQSAppUserId?: string;
    APBQSAppUserIPAddr?: string;
    APBQSAppDate?: string;
    APBRefNo?: string | null;
    APBBank?: string | null;
    APBRecId: number;
    Attachment?: string | null;
    HawRecId: number;
    HawProjId: string;
}

export interface SubBGTemplateProps {
    strLA: string;
}
export interface APBTemplateProps {
    strProjId: string;
    strLA: string;
}

export interface BGDashboard {
    TotalCount: number;
}


export interface LARDashboard {
    TotalRecords: number;
}

export interface UserQSME {
    hawQSME?: string | null;
}

export interface AttachmentTable {
    BGAPRecId: number;
    BGAPProjId: string;
    BGAPLaNo: string;
    BGAPHawRecId: number;
    BGAPType: string;
    BGPBRLPercent: string;
    BGAPNo: number;
    BGAPUserId: string;
    BGAPFile: string;
    APBFile: string;
    BGAPIP: string;
    BGAPDate: Date | string;
    BGAPDeleted: string;
    BGRLDeletedBy?: string;
    BGRLDeletedDT?: Date | string;
    BGRLDeletedIP?: string;
    BGRLApprovedStat?: number;
    BGRLApprovedBy?: string;
    BGRLApprovedDT?: Date | string;
    BGRLApprovedIP?: string;
    BGRLRejectReason?: string;
    AllowDelete?: string;
    FullFilePath?: string;
}


export interface Settings {
    itadmin: string;
    isDebug: string;
    connDb: string;
    parentSystemName: string;
    systemName: string;
    systemURL: string;
    companyName: string;
    uploadPath: string;
    userName: string;
    userPwd: string;
    landingPage: string;
    mainPage: string;
    defaultPage: string;
    logoutPage: string;
    errorPage: string;
}