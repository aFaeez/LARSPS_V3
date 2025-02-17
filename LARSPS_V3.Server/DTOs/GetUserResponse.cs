using System.Xml.Linq;

namespace LARSPS_V3.Server.DTOs
{
    public class GetUserResponse
    {
        public string UserId { get; set; } = string.Empty;
        public DateTime AccessStartDate { get; set; }
        public DateTime AccessEndDate { get; set; }
        public int IsActive { get; set; }
        public string MSName { get; set; } = string.Empty;
        public string MSEmail { get; set; } = string.Empty;
        public string MSDDepartment { get; set; } = string.Empty;
        public string MSDPostingLocation { get; set; } = string.Empty;
        public string MSDPostingCode { get; set; } = string.Empty;
        public string MSDDesignation { get; set; } = string.Empty;
        public int MSIsActive { get; set; }
        public string RoleName { get; set; } = string.Empty;
    }
}
