﻿namespace LARSPS_V3.Server.DTOs
{
    public class GetMenuParentRequest
    {
        public string QueryType { get; set; } = string.Empty;
        public string MenuSystemName { get; set; } = string.Empty;
        public string UserID { get; set; } = string.Empty;
        public string IsITAdmin { get; set; } = string.Empty;
        public string MenuSubSystemName { get; set; } = string.Empty;
    }
}
