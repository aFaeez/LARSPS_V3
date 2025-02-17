namespace LARSPS_V3.Server.DTOs
{
    public class SubmitBGRequest
    {
        public string StrSQL { get; set; } = string.Empty;  
        public DateTime BGDate { get; set; }
        public DateTime BGExpiryDate { get; set; }
    }

}
