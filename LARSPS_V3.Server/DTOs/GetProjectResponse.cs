namespace LARSPS_V3.Server.DTOs
{
    public class GetProjectResponse
    {
        public string ProProjectId { get; set; } = string.Empty;
        public string ProProjectDesc { get; set; } = string.Empty;
        public string ProProjectType { get; set; } = string.Empty;
        public int ProjWithFS { get; set; }
    }
}
