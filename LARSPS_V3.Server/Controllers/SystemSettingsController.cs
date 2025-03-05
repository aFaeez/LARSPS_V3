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

                parentSystemName = _configuration["AppSettings:ParentSystemName"],
                systemName = _configuration["AppSettings:SystemName"],
                systemURL = _configuration["AppSettings:SystemURL"],
                companyName = _configuration["AppSettings:CompanyName"],

                uploadPath = _configuration["AppSettings:LAN_UPLOAD_PATH"],
                userDomain = _configuration["AppSettings:UploadUser_Domain"],
                userName = _configuration["AppSettings:UploadUser_Name"],
                userPwd = _configuration["AppSettings:UploadUser_Pwd"],

                landingPage = _configuration["AppSettings:LandingPage"],
                mainPage = _configuration["AppSettings:MainPage"],
                defaultPage = _configuration["AppSettings:DefaultPage"],
                logoutPage = _configuration["AppSettings:LogoutPage"],
                errorPage = _configuration["AppSettings:ErrorPage"],

                itEmail = _configuration["AppSettings:ITEmail"],
                recipient = _configuration["AppSettings:Recipient"],
                isBlockEmail = _configuration["AppSettings:IsBlockEmail"],

                // Host Config - Allowed Hosts as an array
                allowedHosts = _configuration.GetSection("AppSettings:HostConfig:AllowedHosts").Get<string[]>()
            };
            return Ok(settings);
        }

    }

}
