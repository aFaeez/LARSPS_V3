namespace LARSPS_V3.Server.DTOs
{
    public class SubmitAPBRequest
    {
        public decimal APBAmount { get; set; }
        public DateTime APBDate { get; set; }
        public DateTime APBExpiryDate { get; set; }
        public DateTime? APBExtDate { get; set; } 
        public DateTime? APBProvidedDate { get; set; } 
        public string? APBRefNo { get; set; } 
        public string? APBBank { get; set; }
        public string? APBUserId { get; set; }
        public string? APBUserIPAddr { get; set; }
        public DateTime APBRecDate { get; set; }
        public string? APBCompId { get; set; }
        public string? APBLaNo { get; set; }
    }
}
