namespace LARSPS_V3.Server.DTOs
{
    public class GetUserRequest
    {
        public string QueryType { get; set; } = string.Empty;
        public string UserID { get; set; } = string.Empty;
        public string MenuSystemName { get; set; } = string.Empty;
    }
}
