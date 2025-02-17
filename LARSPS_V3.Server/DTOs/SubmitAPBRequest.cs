namespace LARSPS_V3.Server.DTOs
{
    public class SubmitAPBRequest
    {
        public string StrSQL { get; set; } = string.Empty;
        public DateTime APBDate { get; set; }
        public DateTime APBExpiryDate { get; set; }
    }
}
