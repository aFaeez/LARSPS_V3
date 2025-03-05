using Azure;
using LARSPS_V3.Server;
using LARSPS_V3.Server.Modules;
using LARSPS_V3.Server.Controllers;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Nodes;
using YTL.Security.Login;
using Microsoft.Data.SqlClient;
using LARSPS_V3.Server.Common;
using LARSPS_V3.Server.DTOs;

namespace LARSPS_V3.API.Modules;

public static class ProjectStoredProcedureModule
{
    public static void GetSP(this IEndpointRouteBuilder app)
    {
        #region Main Page Project
        app.MapPost("/GetProject", async ([FromServices] DataBaseContext dbContext, [FromBody] GetProjectRequest request) =>
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.UserID))
                {
                    return Results.BadRequest("Missing or invalid fields in the request body.");
                }

                var sql = @"
                EXEC [dbo].[spLS_GetProject]
                @UserID = @UserID,
                @projStatus = @projStatus";

                var parameters = new[] {
                    new Microsoft.Data.SqlClient.SqlParameter("@UserID", request.UserID),
                    new Microsoft.Data.SqlClient.SqlParameter("@projStatus", request.projStatus)
                };

                var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);

                var list = resultList.Select(row => new GetProjectResponse
                {
                    ProProjectId = row["ProProjectId"]?.ToString() ?? string.Empty,
                    ProProjectDesc = row["ProProjectDesc"]?.ToString() ?? string.Empty,
                    ProProjectType = row["ProProjectType"]?.ToString() ?? string.Empty,
                    ProjWithFS = row["ProjWithFS"] != DBNull.Value ? Convert.ToInt32(row["ProjWithFS"]) : 0
                }).ToList();

                return Results.Ok(list);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        }).WithName("GetProject")
        .Produces<List<GetProjectResponse>>(200)
        .Produces(400)
        .Produces(500);

        app.MapPost("/GetProjectStatus", async ([FromServices] DataBaseContext dbContext) =>
        {
            var sql = $@"
            EXEC [bcs].[spLS_GetListData]
            @vchListName = @vchListName";

            var parameters = new[]
            {
               new Microsoft.Data.SqlClient.SqlParameter("@vchListName", "ProjectStatus")
            };

            var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
            return Results.Ok(resultList);
        });
        #endregion

        #region LAR Dashboard

        async Task<IResult> HandleLARDashboard(DataBaseContext dbContext, JsonObject body, string queryType)
        {
            try
            {
                if (body.TryGetPropertyValue("compIdStr", out var compIdNode) && body.TryGetPropertyValue("userIdStr", out var useridNode) && compIdNode != null && useridNode != null)
                {
                    var compIdStr = compIdNode.ToString();
                    var userIdStr = useridNode.ToString();

                    var sql = @"
                    EXEC [dbo].[spLS_LARDashboard]
                    @QueryType = @QueryType,
                    @CompId = @CompId,
                    @UserID = @UserID";

                    var parameters = new[]
                    {
                        new Microsoft.Data.SqlClient.SqlParameter("@QueryType", queryType),
                        new Microsoft.Data.SqlClient.SqlParameter("@CompId", compIdStr),
                        new Microsoft.Data.SqlClient.SqlParameter("@UserID", userIdStr)
                    };

                    var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
                    return Results.Ok(resultList);
                }
                else
                {
                    return Results.BadRequest("Invalid request body. Please provide 'CompId' and 'UserID'.");
                }
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        }

        app.MapPost("/LARDashboard_1", async (DataBaseContext dbContext, JsonObject body) =>
        {
            return await HandleLARDashboard(dbContext, body, "TotalProject");
        });

        app.MapPost("/LARDashboard_2", async (DataBaseContext dbContext, JsonObject body) =>
        {
            return await HandleLARDashboard(dbContext, body, "PendingApprovals");
        });

        app.MapPost("/LARDashboard_3", async (DataBaseContext dbContext, JsonObject body) =>
        {
            return await HandleLARDashboard(dbContext, body, "NearExpiry");
        });

        #endregion

        #region BGDashboard 
        async Task<IResult> HandleBGDashboardRequest(DataBaseContext dbContext, JsonObject body, string queryType)
        {
            try
            {
                // Validate and retrieve parameters from the request body
                if (body.TryGetPropertyValue("compIdStr", out var compIdNode) &&
                    body.TryGetPropertyValue("projectStr", out var projectNode) &&
                    compIdNode != null && projectNode != null)
                {
                    var compIdStr = compIdNode.ToString();
                    var projectStr = projectNode.ToString();

                    // Define the SQL stored procedure and parameters
                    var sql = @"
                    EXEC [dbo].[spLS_BGDashboard]
                    @QueryType = @QueryType,
                    @CompId = @CompId,
                    @Project = @Project";

                    var parameters = new[]
                    {
                        new Microsoft.Data.SqlClient.SqlParameter("@QueryType", queryType),
                        new Microsoft.Data.SqlClient.SqlParameter("@CompId", compIdStr),
                        new Microsoft.Data.SqlClient.SqlParameter("@Project", projectStr)
                    };

                    var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
                    return Results.Ok(resultList);
                }
                else
                {
                    return Results.BadRequest("Invalid request body. Please provide 'compIdStr' and 'projectStr'.");
                }
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        }

        // Map different endpoints for specific query types
        app.MapPost("/BGDashboard_TotLA", async (DataBaseContext dbContext, JsonObject body) =>
        {
            return await HandleBGDashboardRequest(dbContext, body, "TotalLA");
        });

        app.MapPost("/BGDashboard_Approved", async (DataBaseContext dbContext, JsonObject body) =>
        {
            return await HandleBGDashboardRequest(dbContext, body, "Approved");
        });

        app.MapPost("/BGDashboard_Pending", async (DataBaseContext dbContext, JsonObject body) =>
        {
            return await HandleBGDashboardRequest(dbContext, body, "Pending");
        });
        #endregion

        #region Bank Guarantee
        app.MapPost("/GetBG", async ([FromServices] DataBaseContext dbContext, [FromBody] GetBGRequest request) =>
        {
            try
            {
                var sql = "EXEC [dbo].[spLS_GetBG] @CompId, @Project";

                var parameters = new[]
                {
                    new Microsoft.Data.SqlClient.SqlParameter("@CompId", request.CompIdStr),
                    new Microsoft.Data.SqlClient.SqlParameter("@Project", request.ProjectStr)
                };

                var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
                return Results.Ok(resultList);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });

        app.MapPost("/GetBGSub", async ([FromServices] DataBaseContext dbContext, [FromBody] GetBGSubRequest request) =>
        {
            try
            {
                var sql = "EXEC [dbo].[spLS_GetBGSub] @LaNo";

                var parameters = new[]
                {
                    new Microsoft.Data.SqlClient.SqlParameter("@LaNo", request.StrLaNo)
                };

                var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
                return Results.Ok(resultList);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });

        //app.MapPost("/SubmitBG", async ([FromServices] DataBaseContext dbContext, [FromBody] SubmitBGRequest request) =>
        //{
        //    try
        //    {
        //        if (!BGValidator.IsValidBGDateRange(request.BGDate, request.BGExpiryDate, out var errorMessage))
        //        {
        //            return Results.BadRequest(errorMessage);
        //        }

        //        var sql = "EXEC [dbo].[spLS_InsertBG] @StrSQL";

        //        var parameters = new[]
        //        {
        //            new Microsoft.Data.SqlClient.SqlParameter("@StrSQL", request.StrSQL)
        //        };

        //        var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
        //        return Results.Ok(resultList);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Results.Problem(detail: ex.Message, statusCode: 500);
        //    }
        //});

        app.MapPost("/SubmitBG", async ([FromServices] DataBaseContext dbContext, [FromBody] SubmitBGRequest request) =>
        {
            try
            {
                if (!BGValidator.IsValidBGDateRange(request.BGDate, request.BGExpiryDate, out var errorMessage))
                {
                    return Results.BadRequest(new GeneralResponse { Success = false, Message = errorMessage });
                }

                var sql = "EXEC [dbo].[spLS_UpdateBG] @BGDate, @BGExpiryDate, @BGToExtend, @BGExtDate, @BGRefNo, @BGBank, @BGUserId, @BGUserIPAddr, @BGRecDate, @BGCompId, @BGLaNo";

                var parameters = new[] {
                    new SqlParameter("@BGDate", request.BGDate),
                    new SqlParameter("@BGExpiryDate", request.BGExpiryDate),
                    new SqlParameter("@BGToExtend", string.IsNullOrEmpty(request.BGToExtend) ? DBNull.Value : request.BGToExtend),
                    new SqlParameter("@BGExtDate", request.BGExtDate),
                    new SqlParameter("@BGRefNo", string.IsNullOrEmpty(request.BGRefNo) ? DBNull.Value : request.BGRefNo),
                    new SqlParameter("@BGBank", string.IsNullOrEmpty(request.BGBank) ? DBNull.Value : request.BGBank),
                    new SqlParameter("@BGUserId", string.IsNullOrEmpty(request.BGUserId) ? DBNull.Value : request.BGUserId),
                    new SqlParameter("@BGUserIPAddr", string.IsNullOrEmpty(request.BGUserIPAddr) ? DBNull.Value : request.BGUserIPAddr),
                    new SqlParameter("@BGRecDate", request.BGRecDate),
                    new SqlParameter("@BGCompId", string.IsNullOrEmpty(request.BGCompId) ? DBNull.Value : request.BGCompId),
                    new SqlParameter("@BGLaNo", string.IsNullOrEmpty(request.BGLaNo) ? DBNull.Value : request.BGLaNo)
                };

                var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
                return Results.Ok(new GeneralResponse { Success = true, Message = "Bank Guarantee submitted successfully!"});
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        }).WithName("SubmitBG")
        .Produces<List<GeneralResponse>>(200)
        .Produces(400)
        .Produces(500); ;

        app.MapPost("/Activator", async ([FromServices] DataBaseContext dbContext, [FromBody] ActivatorRequest request) =>
        {
            try
            {
                var sql = @"
                EXEC [dbo].[spLS_Activator]
                @QueryType, @AppStat, @UserId, @IPAddr, @DateCurr, @CompId, @LaNo";

                var parameters = new[]
                {
                    new Microsoft.Data.SqlClient.SqlParameter("@QueryType", request.TypeStr),
                    new Microsoft.Data.SqlClient.SqlParameter("@AppStat", request.AppStatStr),
                    new Microsoft.Data.SqlClient.SqlParameter("@UserId", request.UserIdStr),
                    new Microsoft.Data.SqlClient.SqlParameter("@IPAddr", request.IPAddrStr),
                    new Microsoft.Data.SqlClient.SqlParameter("@DateCurr", request.DateCurrStr),
                    new Microsoft.Data.SqlClient.SqlParameter("@CompId", request.CompIDStr),
                    new Microsoft.Data.SqlClient.SqlParameter("@LaNo", request.LaNoStr)
                };

                var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
                return Results.Ok(resultList);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });
        #endregion

        #region Advance Payment Bond
        app.MapPost("/GetAPB", async ([FromServices] DataBaseContext dbContext, [FromBody] GetAPBRequest request) =>
        {
            try
            {
                var sql = "EXEC [dbo].[spLS_GetAdvPaymBondDetails] @CompId, @Project, @HawLaNo";

                var parameters = new[]
                {
                    new Microsoft.Data.SqlClient.SqlParameter("@CompId", request.CompIdStr),
                    new Microsoft.Data.SqlClient.SqlParameter("@Project", request.ProjectStr),
                    new Microsoft.Data.SqlClient.SqlParameter("@HawLaNo", request.StrLaNo)
                };

                var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
                return Results.Ok(resultList);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });

        //app.MapPost("/SubmitAPB", async ([FromServices] DataBaseContext dbContext, [FromBody] SubmitAPBRequest request) =>
        //{
        //    try
        //    {
        //        if (!BGValidator.IsValidBGDateRange(request.APBDate, request.APBExpiryDate, out var errorMessage))
        //        {
        //            return Results.BadRequest(errorMessage);
        //        }

        //        var sql = "EXEC [dbo].[spLS_UpdateAPB] @StrSQL";

        //        var parameters = new[]
        //        {
        //            new Microsoft.Data.SqlClient.SqlParameter("@StrSQL", request.StrSQL)
        //        };

        //        var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
        //        return Results.Ok(resultList);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Results.Problem(detail: ex.Message, statusCode: 500);
        //    }
        //});

        app.MapPost("/SubmitAPB", async ([FromServices] DataBaseContext dbContext, [FromBody] SubmitAPBRequest request) =>
        {
            try
            {
                if (!BGValidator.IsValidBGDateRange(request.APBDate, request.APBExpiryDate, out var errorMessage))
                {
                    return Results.BadRequest(new GeneralResponse { Success = false, Message = errorMessage });
                }

                var sql = "EXEC [dbo].[spLS_UpdateAPB] @APBAmount, @APBDate, @APBExpiryDate, @APBExtDate,@APBProvidedDate, @APBRefNo, @APBBank, @APBUserId, @APBUserIPAddr, @APBRecDate, @APBCompId, @APBLaNo";

                var parameters = new[] {
                    new SqlParameter("@APBAmount", request.APBAmount),
                    new SqlParameter("@APBDate", request.APBDate),
                    new SqlParameter("@APBExpiryDate", request.APBExpiryDate),
                    new SqlParameter("@APBExtDate", request.APBExtDate),
                    new SqlParameter("@APBProvidedDate", request.APBProvidedDate),
                    new SqlParameter("@APBRefNo", string.IsNullOrEmpty(request.APBRefNo) ? DBNull.Value : request.APBRefNo),
                    new SqlParameter("@APBBank", string.IsNullOrEmpty(request.APBBank) ? DBNull.Value : request.APBBank),
                    new SqlParameter("@APBUserId", string.IsNullOrEmpty(request.APBUserId) ? DBNull.Value : request.APBUserId),
                    new SqlParameter("@APBUserIPAddr", string.IsNullOrEmpty(request.APBUserIPAddr) ? DBNull.Value : request.APBUserIPAddr),
                    new SqlParameter("@APBRecDate", request.APBRecDate),
                    new SqlParameter("@APBCompId", string.IsNullOrEmpty(request.APBCompId) ? DBNull.Value : request.APBCompId),
                    new SqlParameter("@APBLaNo", string.IsNullOrEmpty(request.APBLaNo) ? DBNull.Value : request.APBLaNo)
                };

                var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
                return Results.Ok(new GeneralResponse { Success = true, Message = "Advance Payment Bank submitted successfully!" });
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        }).WithName("SubmitAPB")
        .Produces<List<GeneralResponse>>(200)
        .Produces(400)
        .Produces(500);
        #endregion

        #region Upload File
        app.MapPost("/GetFile", async ([FromServices] DataBaseContext dbContext, [FromBody] GetFileRequestDto requestDto) =>
        {
            try
            {
                if (string.IsNullOrWhiteSpace(requestDto.LaNoStr) || string.IsNullOrWhiteSpace(requestDto.ProjectStr))
                {
                    return Results.BadRequest("Missing or invalid 'LaNoStr' or 'ProjectStr' in the request body.");
                }

                var sql = @"
                EXEC [dbo].[spLS_GetFile]
                @Project = @Project,
                @LaNo = @LaNo";

                var parameters = new[]
                {
                    new Microsoft.Data.SqlClient.SqlParameter("@Project", requestDto.ProjectStr),
                    new Microsoft.Data.SqlClient.SqlParameter("@LaNo", requestDto.LaNoStr)
                };

                var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
                return Results.Ok(resultList);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });

        app.MapPost("/UpsertBGApUpload", async ([FromServices] DataBaseContext dbContext, [FromBody] UploadRequest request) =>
        {
            try
            {
                var sql = @"EXEC [dbo].[spLS_UpsertBGApUpload] @QueryType, @CompId, @BGAPRecId, @BGAPProjId, @BGAPLaNo, @BGAPHawRecId, @BGAPType, @BGPBRLPercent, 
                      @BGAPNo, @BGAPUserId, @BGAPFile, @BGAPIP, @BGAPDate, @BGAPDeleted, @BGRLDeletedBy, @BGRLDeletedDT, 
                      @BGRLDeletedIP, @BGRLApprovedStat, @BGRLApprovedBy, @BGRLApprovedDT, @BGRLApprovedIP, @BGRLRejectReason";

                var parameters = new SqlParameter[]
                {
                    new SqlParameter("@QueryType", request.QueryType ?? (object)DBNull.Value),
                    new SqlParameter("@CompId", request.CompId ?? (object)DBNull.Value),
                    new SqlParameter("@BGAPRecId", request.BGAPRecId ?? (object)DBNull.Value),
                    new SqlParameter("@BGAPProjId", request.BGAPProjId ?? (object)DBNull.Value),
                    new SqlParameter("@BGAPLaNo", request.BGAPLaNo ?? (object)DBNull.Value),
                    new SqlParameter("@BGAPHawRecId", request.BGAPHawRecId ?? (object)DBNull.Value),
                    new SqlParameter("@BGAPType", request.BGAPType ?? (object)DBNull.Value),
                    new SqlParameter("@BGPBRLPercent", request.BGPBRLPercent ?? (object)DBNull.Value),
                    new SqlParameter("@BGAPNo", request.BGAPNo ?? (object)DBNull.Value),
                    new SqlParameter("@BGAPUserId", request.BGAPUserId ?? (object)DBNull.Value),
                    new SqlParameter("@BGAPFile", request.BGAPFile ?? (object)DBNull.Value),
                    new SqlParameter("@BGAPIP", request.BGAPIP ?? (object)DBNull.Value),
                    new SqlParameter("@BGAPDate", request.BGAPDate ?? (object)DBNull.Value),
                    new SqlParameter("@BGAPDeleted", request.BGAPDeleted ?? (object)DBNull.Value),
                    new SqlParameter("@BGRLDeletedBy", request.BGRLDeletedBy ?? (object)DBNull.Value),
                    new SqlParameter("@BGRLDeletedDT", request.BGRLDeletedDT ?? (object)DBNull.Value),
                    new SqlParameter("@BGRLDeletedIP", request.BGRLDeletedIP ?? (object)DBNull.Value),
                    new SqlParameter("@BGRLApprovedStat", request.BGRLApprovedStat ?? (object)DBNull.Value),
                    new SqlParameter("@BGRLApprovedBy", request.BGRLApprovedBy ?? (object)DBNull.Value),
                    new SqlParameter("@BGRLApprovedDT", request.BGRLApprovedDT ?? (object)DBNull.Value),
                    new SqlParameter("@BGRLApprovedIP", request.BGRLApprovedIP ?? (object)DBNull.Value),
                    new SqlParameter("@BGRLRejectReason", request.BGRLRejectReason ?? (object)DBNull.Value)
                };

                var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
                return Results.Ok(new GeneralResponse { Success = true, Message = "Document successfully uploaded!" });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        }).WithName("UpsertBGApUpload")
        .Produces<List<GeneralResponse>>(200)
        .Produces(400)
        .Produces(500);

        app.MapPost("/GetPhysicalFile", async ([FromServices] IConfiguration _configuration, [FromBody] FileRequest fileRequest) =>
        {
            var settings = new
            {
                uploadPath = _configuration["AppSettings:LAN_UPLOAD_PATH"],
                userDomain = _configuration["AppSettings:UploadUser_Domain"],
                userName = _configuration["AppSettings:UploadUser_Name"],
                userPwd = _configuration["AppSettings:UploadUser_Pwd"]
            };

            string filePath = Path.Combine(settings.uploadPath, fileRequest.FileName);

            if (!System.IO.File.Exists(filePath))
            {
                return Results.NotFound("File not found");
            }

            byte[] fileBytes = File.ReadAllBytes(filePath);

            return Results.File(fileBytes, "application/octet-stream", fileRequest.FileName);
        })
        .WithMetadata(new EndpointNameMetadata("GetPhysicalFile"));


        app.MapPost("/BGPhysicalFile", async (HttpContext context) =>
        {
            try
            {
                var form = await context.Request.ReadFormAsync();
                var file = form.Files.FirstOrDefault();

                if (file == null || file.Length == 0)
                    return Results.BadRequest(new { success = false, message = "No file uploaded" });

                if (file.ContentType != "application/pdf" || !file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                    return Results.BadRequest(new { success = false, message = "Only PDF files are allowed." });

                string uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");

                if (!Directory.Exists(uploadFolder))
                    Directory.CreateDirectory(uploadFolder);

                string filePath = Path.Combine(uploadFolder, file.FileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Results.Ok(new { success = true, filePath = $"/uploads/{file.FileName}" });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });
        #endregion

        #region ACM Connection
        app.MapPost("/GetUser", async ([FromServices] DataBaseContext dbContext, [FromBody] GetUserRequest request) =>
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.QueryType) ||
                    string.IsNullOrWhiteSpace(request.UserID) ||
                    string.IsNullOrWhiteSpace(request.MenuSystemName))
                {
                    return Results.BadRequest("Missing or invalid fields in the request body.");
                }

                var sql = @"
                EXEC [dbo].[uspUser]
                @QueryType = @QueryType,
                @UserID = @UserID,
                @MenuSystemName = @MenuSystemName";

                var parameters = new[]
                {
                    new Microsoft.Data.SqlClient.SqlParameter("@QueryType", request.QueryType),
                    new Microsoft.Data.SqlClient.SqlParameter("@UserID", request.UserID),
                    new Microsoft.Data.SqlClient.SqlParameter("@MenuSystemName", request.MenuSystemName)
                };

                var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
                var list = resultList.Select(row => new GetUserResponse
                {
                    UserId = row["UserId"]?.ToString() ?? string.Empty,
                    AccessStartDate = row["AccessStartDate"] != DBNull.Value ? Convert.ToDateTime(row["AccessStartDate"]) : default,
                    AccessEndDate = row["AccessEndDate"] != DBNull.Value ? Convert.ToDateTime(row["AccessEndDate"]) : default,
                    IsActive = row["IsActive"] != DBNull.Value ? Convert.ToInt32(row["IsActive"]) : 0,
                    MSName = row["MSName"]?.ToString() ?? string.Empty,
                    MSEmail = row["MSEmail"]?.ToString() ?? string.Empty,
                    MSDDepartment = row["MSDDepartment"]?.ToString() ?? string.Empty,
                    MSDPostingLocation = row["MSDPostingLocation"]?.ToString() ?? string.Empty,
                    MSDPostingCode = row["MSDPostingCode"]?.ToString() ?? string.Empty,
                    MSDDesignation = row["MSDDesignation"]?.ToString() ?? string.Empty,
                    MSIsActive = row["MSIsActive"] != DBNull.Value ? Convert.ToInt32(row["MSIsActive"]) : 0,
                    RoleName = row["RoleName"]?.ToString() ?? string.Empty
                }).ToList();

                return Results.Ok(list);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        }).WithName("GetUser")
        .Produces<List<GetUserResponse>>(200)
        .Produces(400)
        .Produces(500);


        //GetMenuParent
        app.MapPost("/GetMenuParent", async ([FromServices] DataBaseContext dbContext, [FromBody] GetMenuParentRequest request) =>
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.QueryType) ||
                    string.IsNullOrWhiteSpace(request.MenuSystemName) ||
                    string.IsNullOrWhiteSpace(request.UserID) )
                {
                    return Results.BadRequest("Missing or invalid fields in the request body.");
                }

                var sql = @"
                EXEC [dbo].[uspUserAccessMenu]
                @QueryType = @QueryType,
                @MenuSystemName = @MenuSystemName,
                @UserID = @UserID,
                @IsITAdmin = @IsITAdmin, 
                @MenuSubSystemName = @MenuSubSystemName";

                var parameters = new[]
                {
                    new Microsoft.Data.SqlClient.SqlParameter("@QueryType", request.QueryType),
                    new Microsoft.Data.SqlClient.SqlParameter("@MenuSystemName", request.MenuSystemName),
                    new Microsoft.Data.SqlClient.SqlParameter("@UserID", request.UserID),
                    new Microsoft.Data.SqlClient.SqlParameter("@IsITAdmin", request.IsITAdmin),
                    new Microsoft.Data.SqlClient.SqlParameter("@MenuSubSystemName", request.MenuSubSystemName)
                };

                var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
                var menuParentList = resultList.Select(row => new GetMenuParentResponse
                {
                    MenuId = row.ContainsKey("MenuID") ? Convert.ToInt32(row["MenuID"]) : 0,
                    MenuName = row.ContainsKey("MenuName") ? row["MenuName"]?.ToString() ?? string.Empty : string.Empty,
                    MenuParentId = row.ContainsKey("MenuParentId") ? Convert.ToInt32(row["MenuParentId"]) : 0,
                    MenuURL = row.ContainsKey("MenuURL") ? row["MenuURL"]?.ToString() ?? string.Empty : string.Empty,
                    MenuOrder = row.ContainsKey("MenuOrder") ? Convert.ToInt32(row["MenuOrder"]) : 0
                }).ToList();

                return Results.Ok(menuParentList);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        }).WithName("GetMenuParent")
        .Produces<List<GetMenuParentResponse>>(200)
        .Produces(400)
        .Produces(500);

        //Get Menu Child
        app.MapPost("/GetMenuChild", async ([FromServices] DataBaseContext dbContext, [FromBody] GetMenuChildRequest request) =>
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.QueryType) ||
                    string.IsNullOrWhiteSpace(request.UserID) ||
                    string.IsNullOrWhiteSpace(request.MenuSystemName) ||
                    string.IsNullOrWhiteSpace(request.MenuParentID))
                {
                    return Results.BadRequest("Missing or invalid fields in the request body.");
                }

                var sql = @"
                EXEC [dbo].[uspUserAccessMenu]
                @QueryType = @QueryType,
                @MenuSystemName = @MenuSystemName,
                @UserID = @UserID,
                @IsITAdmin = @IsITAdmin, 
                @MenuParentID = @MenuParentID";

                var parameters = new[]
                {
                    new Microsoft.Data.SqlClient.SqlParameter("@QueryType", request.QueryType),
                    new Microsoft.Data.SqlClient.SqlParameter("@MenuSystemName", request.MenuSystemName),
                    new Microsoft.Data.SqlClient.SqlParameter("@UserID", request.UserID),
                    new Microsoft.Data.SqlClient.SqlParameter("@IsITAdmin", request.IsITAdmin),
                    new Microsoft.Data.SqlClient.SqlParameter("@MenuParentID", request.MenuParentID)
                };

                var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
                var menuChildList = resultList.Select(row => new GetMenuChildResponse
                {
                    MenuId = row.ContainsKey("MenuID") ? Convert.ToInt32(row["MenuID"]) : 0,
                    MenuName = row.ContainsKey("MenuName") ? row["MenuName"]?.ToString() ?? string.Empty : string.Empty,
                    MenuParentId = row.ContainsKey("MenuParentId") ? Convert.ToInt32(row["MenuParentId"]) : 0,
                    MenuURL = row.ContainsKey("MenuURL") ? row["MenuURL"]?.ToString() ?? string.Empty : string.Empty,
                    MenuOrder = row.ContainsKey("MenuOrder") ? Convert.ToInt32(row["MenuOrder"]) : 0
                }).ToList();

                return Results.Ok(menuChildList);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        }).WithName("GetMenuChild")
        .Produces<List<GetMenuChildResponse>>(200)
        .Produces(400)
        .Produces(500);
        #endregion
    }
}