namespace LARSPS_V3.Server.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Configuration;

    [Route("api/settings")]
    [ApiController]
    public class SystemSettingsController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public SystemSettingsController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public IActionResult GetSettings()
        {
            var settings = new
            {
                itadmin = _configuration["AppSettings:ITADMIN"],
                isDebug = _configuration["AppSettings:IsDebug"],
                connDb = _configuration["AppSettings:ConnDbLARSPSv2"],
                systemName = _configuration["AppSettings:SystemName"],
                companyName = _configuration["AppSettings:CompanyName"]
            };
            return Ok(settings);
        }

    }

}
