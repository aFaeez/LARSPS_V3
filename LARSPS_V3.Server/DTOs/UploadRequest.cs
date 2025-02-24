namespace LARSPS_V3.Server.DTOs
{
    public class UploadRequest
    {
        public long? BGAPRecId { get; set; }
        public string BGAPProjId { get; set; }
        public string BGAPLaNo { get; set; }
        public long? BGAPHawRecId { get; set; }
        public string BGAPType { get; set; }
        public decimal? BGPBRLPercent { get; set; }
        public int? BGAPNo { get; set; }
        public string BGAPUserId { get; set; }
        public string BGAPFile { get; set; }
        public string BGAPIP { get; set; }
        public DateTime? BGAPDate { get; set; }
        public char? BGAPDeleted { get; set; }
        public string BGRLDeletedBy { get; set; }
        public DateTime? BGRLDeletedDT { get; set; }
        public string BGRLDeletedIP { get; set; }
        public int? BGRLApprovedStat { get; set; }
        public string BGRLApprovedBy { get; set; }
        public DateTime? BGRLApprovedDT { get; set; }
        public string BGRLApprovedIP { get; set; }
        public string BGRLRejectReason { get; set; }
    }

}
