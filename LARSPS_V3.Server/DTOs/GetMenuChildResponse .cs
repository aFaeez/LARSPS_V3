namespace LARSPS_V3.Server.DTOs
{
    public class GetMenuChildResponse
    {
        public int MenuId { get; set; }
        public string MenuName { get; set; } = string.Empty;
        public int MenuParentId { get; set; }
        public string MenuURL { get; set; } = string.Empty;
        public int MenuOrder { get; set; }
    }
}
