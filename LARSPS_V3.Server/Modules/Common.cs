
namespace LARSPS_V3.Server.Common
{
    public class Common
    {
        private readonly IConfiguration _configuration;

        public Common(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GetConnectionLARSPSv2()
        {
            return _configuration.GetConnectionString("myAppConnLARSPSv2");
        }

        public string GetConnectionEMP()
        {
            return _configuration.GetConnectionString("myAppConnEMP");
        }

    }
}
