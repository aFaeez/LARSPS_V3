namespace LARSPS_V3.Server.DTOs
{
    public class SubmitBGRequest
    {
        public DateTime? BGDate { get; set; }
        public DateTime? BGExpiryDate { get; set; }
        public string BGToExtend { get; set; } = string.Empty;
        public DateTime? BGExtDate { get; set; }
        public string BGRefNo { get; set; } = string.Empty;
        public string BGBank { get; set; } = string.Empty;
        public string BGUserId { get; set; } = string.Empty;
        public string BGUserIPAddr { get; set; } = string.Empty;
        public DateTime? BGRecDate { get; set; }
        public string BGCompId { get; set; } = string.Empty;
        public string BGLaNo { get; set; } = string.Empty;
    }
}
