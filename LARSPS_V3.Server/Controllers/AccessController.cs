using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace YourProject.Controllers
{
    //public class AccessController : Controller
    //{
    //    private readonly IConfiguration _configuration;
    //    private readonly IHttpContextAccessor _httpContextAccessor;
    //    private readonly IMyCon _myCon; // Replace with actual DB service

    //    public AccessController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IMyCon myCon)
    //    {
    //        _configuration = configuration;
    //        _httpContextAccessor = httpContextAccessor;
    //        _myCon = myCon;
    //    }

    //    public IActionResult Index(string mod)
    //    {
    //        var session = _httpContextAccessor.HttpContext.Session;
    //        string project = session.GetString("Project");
    //        string userId = session.GetString("Login");
    //        string position = session.GetString("UsePosition");

    //        string hostName2 = HttpContext.Request.Scheme.ToUpper() == "HTTPS"
    //            ? _configuration["IISLoginDomain2"]
    //            : _configuration["IISLoginIP2"];

    //        string redirectURL = "";
    //        Dictionary<string, string> data = new()
    //        {
    //            { "userid", userId },
    //            { "userposition", position },
    //            { "project", project }
    //        };

    //        // Redirect Logic
    //        if (mod == "FAR" && !_myCon.IsAccessValid(_configuration["ModFinalAccount"], userId))
    //            return RedirectToErrorPage();
    //        if (mod == "SPE" && !_myCon.IsAccessValid(_configuration["ModScPerfEva"], userId))
    //            return RedirectToErrorPage();
    //        if (mod == "M_LAR" && !_myCon.IsAccessValid(_configuration["ModLAAccessRight"], userId))
    //            return RedirectToErrorPage();

    //        // Define URL Mapping
    //        Dictionary<string, string> moduleMapping = new()
    //        {
    //            { "FAR", _configuration["RptFinalAccount"] },
    //            { "SPE", _configuration["ScPerfMain"] },
    //            { "M_LAR", _configuration["MasLAAccess"] },
    //            { "M_QSLAR", _configuration["MasQSLAccess"] },
    //            { "M_QSL", _configuration["MasQSL"] },
    //            { "MPOBSCR", _configuration["RptMatPurSC"] },
    //            { "M_LTDS", _configuration["MasLATemplateDisplaySetup"] },
    //            { "E_LARRPT", "Landing?page=~/Report/RptLetterOfAwardRegister" },
    //            { "D_CAUpload", "Landing?page=~/Operation/CAUploadScannedLA" },
    //            { "D_EOT", "Landing?page=~/Operation/ExtensionOfTime" },
    //            { "M_LARegRptAut", "Landing?page=~/Master/LARegisteredReportAuthorisation" },
    //            { "M_LATrade", "Landing?page=~/Master/LATrade" },
    //            { "M_LAFormat", "Landing?page=~/Master/LetterAwardFormat3" },
    //            { "E_LABQSummary", "Landing?page=~/Report/LABQSummary" }
    //        };

    //        if (moduleMapping.ContainsKey(mod))
    //        {
    //            redirectURL = $"{HttpContext.Request.Scheme}://{hostName2}/LARSPSv2/{moduleMapping[mod]}";
    //            return RedirectWithPost(redirectURL, data);
    //        }

    //        return RedirectToAction("Index", "Home"); // Default Redirect
    //    }

    //    private IActionResult RedirectToErrorPage()
    //    {
    //        return Redirect("/ErrorPage?MsgType=Module");
    //    }

    //    private IActionResult RedirectWithPost(string url, Dictionary<string, string> data)
    //    {
    //        var form = "<form method='post' action='" + url + "'>";

    //        foreach (var item in data)
    //        {
    //            form += "<input type='hidden' name='" + item.Key + "' value='" + item.Value + "'/>";
    //        }

    //        form += "</form><script>document.forms[0].submit();</script>";

    //        return Content(form, "text/html");
    //    }
    //}
}
