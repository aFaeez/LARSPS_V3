using Azure;
using LARSPS_V3.Server;
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
        //app.MapPost("/GetProject", async ([FromServices] DataBaseContext dbContext, [FromBody] JsonObject body) =>
        //{
        //    try
        //    {
        //        // Default userId
        //        var userIdString = "KHTAN";

        //        // Get the intPrjStatus from request body or default to 1
        //        var statusIdInt = body.TryGetPropertyValue("intPrjStatus", out var statusIdNode)
        //            ? statusIdNode?.GetValue<int>() ?? 1
        //            : 1;

        //        // Check if either value is invalid (e.g., null or empty)
        //        if (string.IsNullOrEmpty(userIdString) || statusIdInt == null)
        //        {
        //            return Results.BadRequest("Invalid UserID or intPrjStatus.");
        //        }

        //        // SQL query to retrieve project data
        //        var sql = @"
        //        EXEC [dbo].[spLS_GetProject]
        //        @UserID = @UserID,
        //        @intPrjStatus = @intPrjStatus";

        //        var parameters = new[] {
        //            new Microsoft.Data.SqlClient.SqlParameter("@UserID", userIdString),
        //            new Microsoft.Data.SqlClient.SqlParameter("@intPrjStatus", statusIdInt)
        //        };

        //        // Retrieve the result list by executing the stored procedure
        //        var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);

        //        // Return the project data as a response
        //        return Results.Ok(resultList);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Results.Problem(detail: ex.Message, statusCode: 500); // Return detailed error message
        //    }
        //});

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

        #region LOGIN
        app.MapPost("/LoginLAR", async ([FromServices] DataBaseContext dbContext, [FromBody] JsonObject body) =>
        {
            try
            {
                if (body.TryGetPropertyValue("loginID", out var loginIDNode) && loginIDNode != null &&
                    body.TryGetPropertyValue("password", out var passwordNode) && passwordNode != null)
                {
                    string loginID = loginIDNode.ToString();
                    string password = passwordNode.ToString();

                    var sql = @"
                    EXEC [dbo].[uspUser]
                    @QueryType = @QueryType,
                    @UserId = @UserId,
                    @MenuSystemName = @MenuSystemName";

                    var parameters = new[] {
                        new Microsoft.Data.SqlClient.SqlParameter("@QueryType", "USER_LARSPSv2"),
                        new Microsoft.Data.SqlClient.SqlParameter("@UserId", loginID),
                        new Microsoft.Data.SqlClient.SqlParameter("@MenuSystemName", DBNull.Value)
                    };

                    var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
                    return Results.Ok(resultList);
                }
                else
                {
                    return Results.BadRequest("Missing or invalid parameter in the request body.");
                }
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
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

        #region BankGuarantee
        //app.MapPost("/GetBG", async ([FromServices] DataBaseContext dbContext, [FromBody] JsonObject body) =>
        //{
        //    try
        //    {
        //        // Validate and retrieve parameters from the request body
        //        if (body.TryGetPropertyValue("compIdStr", out var compIdNode) &&
        //            body.TryGetPropertyValue("projectStr", out var projectNode) &&
        //            compIdNode != null && projectNode != null)
        //        {
        //            var compIdStr = compIdNode.ToString();
        //            var projectStr = projectNode.ToString();

        //            // Define the SQL stored procedure and parameters
        //            var sql = @"
        //            EXEC [dbo].[spLS_GetBG]
        //            @CompId = @CompId,
        //            @Project = @Project";

        //            var parameters = new[]
        //            {
        //                new Microsoft.Data.SqlClient.SqlParameter("@CompId", compIdStr),
        //                new Microsoft.Data.SqlClient.SqlParameter("@Project", projectStr)
        //            };

        //            var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
        //            return Results.Ok(resultList);
        //        }
        //        else
        //        {
        //            return Results.BadRequest("Invalid request body. Please provide 'compIdStr' and 'projectStr'.");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return Results.Problem(detail: ex.Message, statusCode: 500);
        //    }
        //});

        //app.MapPost("/GetBGSub", async ([FromServices] DataBaseContext dbContext, [FromBody] JsonObject body) =>
        //{
        //    try
        //    {
        //        if (body.TryGetPropertyValue("strLaNo", out var LaNoNode) && LaNoNode != null)
        //        {
        //            var LaNo = LaNoNode.ToString();
        //            var sql = @"
        //            EXEC [dbo].[spLS_GetBGSub]
        //            @LaNo = @LaNo";

        //            var parameters = new[] {
        //                new Microsoft.Data.SqlClient.SqlParameter("@LaNo", LaNo)
        //            };

        //            var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
        //            return Results.Ok(resultList);
        //        }
        //        else
        //        {
        //            return Results.BadRequest("Missing or invalid 'strLaNo' in the request body.");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return Results.Problem(detail: ex.Message, statusCode: 500);
        //    }
        //});

        //app.MapPost("/GetAPB", async ([FromServices] DataBaseContext dbContext, [FromBody] JsonObject body) =>
        //{
        //    try
        //    {
        //        if (body.TryGetPropertyValue("compIdStr", out var compIdNode) &&
        //            body.TryGetPropertyValue("projectStr", out var projectNode) &&
        //            body.TryGetPropertyValue("strLaNo", out var LaNoNode) &&
        //            compIdNode != null && projectNode != null && LaNoNode != null)
        //        {
        //            var compIdStr = compIdNode.ToString();
        //            var projectStr = projectNode.ToString();
        //            var LaNo = LaNoNode.ToString();
        //            var sql = @"
        //            EXEC [dbo].[spLS_GetAdvPaymBondDetails]
        //            @CompId = @CompId,
        //            @Project = @Project,
        //            @HawLaNo = @HawLaNo";

        //            var parameters = new[] {
        //                new Microsoft.Data.SqlClient.SqlParameter("@CompId", compIdStr),
        //                new Microsoft.Data.SqlClient.SqlParameter("@Project", projectStr),
        //                new Microsoft.Data.SqlClient.SqlParameter("@HawLaNo", LaNo)
        //            };

        //            var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
        //            return Results.Ok(resultList);
        //        }
        //        else
        //        {
        //            return Results.BadRequest("Missing or invalid parameter in the request body.");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return Results.Problem(detail: ex.Message, statusCode: 500);
        //    }
        //});

        //app.MapPost("/SubmitBG", async ([FromServices] DataBaseContext dbContext, [FromBody] JsonElement body) =>
        //{
        //    try
        //    {
        //        if (body.TryGetProperty("strSQL", out var strNode) && strNode.ValueKind == JsonValueKind.String)
        //        {
        //            var strSQL = strNode.GetString();

        //            // Validate the SQL string (Optional but recommended for security)
        //            if (string.IsNullOrWhiteSpace(strSQL))
        //            {
        //                return Results.BadRequest("SQL string is empty or invalid.");
        //            }

        //            // Parse BGDate and BGExpiryDate from the body (assuming the data is part of the request)
        //            if (body.TryGetProperty("BGDate", out var bgDateNode) && body.TryGetProperty("BGExpiryDate", out var bgExpiryDateNode))
        //            {
        //                DateTime BGDate = DateTime.Parse(bgDateNode.GetString());
        //                DateTime BGExpiryDate = DateTime.Parse(bgExpiryDateNode.GetString());

        //                // Call the validation function
        //                if (!BGValidator.IsValidBGDateRange(BGDate, BGExpiryDate, out var errorMessage))
        //                {
        //                    return Results.BadRequest(errorMessage); // Return error message if validation fails
        //                }
        //            }

        //            // Proceed with other validations and SQL execution
        //            var sql = @"
        //            EXEC [dbo].[spLS_InsertBG]
        //            @StrSQL";

        //            var parameters = new[]
        //            {
        //                new Microsoft.Data.SqlClient.SqlParameter("@StrSQL", strSQL)
        //            };

        //            var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
        //            return Results.Ok(resultList);
        //        }
        //        else
        //        {
        //            return Results.BadRequest("Missing or invalid parameter in the request body.");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return Results.Problem(detail: ex.Message, statusCode: 500);
        //    }
        //});

        //app.MapPost("/Activator", async ([FromServices] DataBaseContext dbContext, [FromBody] JsonObject body) =>
        //{
        //    try
        //    {
        //        if (body.TryGetPropertyValue("AppStatStr", out var appStatNode) &&
        //            body.TryGetPropertyValue("UserIdStr", out var userIpNode) &&
        //            body.TryGetPropertyValue("IPAddrStr", out var ipAddrNode) &&
        //            body.TryGetPropertyValue("DateCurrStr", out var dateCurrNode) &&
        //            body.TryGetPropertyValue("typeStr", out var typeNode) &&
        //            body.TryGetPropertyValue("compIDStr", out var compIdNode) &&
        //            body.TryGetPropertyValue("laNoStr", out var laNoNode) &&
        //            appStatNode != null && userIpNode != null && ipAddrNode != null && dateCurrNode != null && typeNode != null && compIdNode != null && laNoNode != null)
        //        {
        //            var AppStatStr = appStatNode.ToString();
        //            var UserIdStr = userIpNode.ToString();
        //            var IPAddrStr = ipAddrNode.ToString();
        //            var DateCurrStr = dateCurrNode.ToString();
        //            var typeStr = typeNode.ToString();
        //            var compIDStr = compIdNode.ToString();
        //            var laNoStr = laNoNode.ToString();

        //            var sql = @"
        //            EXEC [dbo].[spLS_Activator]
        //            @QueryType = @QueryType,
        //            @AppStat = @AppStat,
        //            @UserId = @UserId,
        //            @IPAddr = @IPAddr,
        //            @DateCurr = @DateCurr,
        //            @CompId = @CompId,
        //            @LaNo = @LaNo";

        //            var parameters = new[]
        //            {
        //                new Microsoft.Data.SqlClient.SqlParameter("@QueryType", typeStr),
        //                new Microsoft.Data.SqlClient.SqlParameter("@AppStat", AppStatStr),
        //                new Microsoft.Data.SqlClient.SqlParameter("@UserId", UserIdStr),
        //                new Microsoft.Data.SqlClient.SqlParameter("@IPAddr", IPAddrStr),
        //                new Microsoft.Data.SqlClient.SqlParameter("@DateCurr", DateCurrStr),
        //                new Microsoft.Data.SqlClient.SqlParameter("@CompId", compIDStr),
        //                new Microsoft.Data.SqlClient.SqlParameter("@LaNo", laNoStr)
        //            };

        //            var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
        //            return Results.Ok(resultList);
        //        }
        //        else
        //        {
        //            return Results.BadRequest("Invalid request body. Please provide correct string.");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return Results.Problem(detail: ex.Message, statusCode: 500);
        //    }
        //});

        //app.MapPost("/SubmitAPB", async ([FromServices] DataBaseContext dbContext, [FromBody] JsonElement body) =>
        //{
        //    try
        //    {
        //        if (body.TryGetProperty("strSQL", out var strNode) && strNode.ValueKind == JsonValueKind.String)
        //        {
        //            var strSQL = strNode.GetString();

        //            if (string.IsNullOrWhiteSpace(strSQL))
        //            {
        //                return Results.BadRequest("SQL string is empty or invalid.");
        //            }

        //            if (body.TryGetProperty("APBDate", out var apbDateNode) && body.TryGetProperty("APBExpiryDate", out var apbExpiryDateNode))
        //            {
        //                DateTime APBDate = DateTime.Parse(apbDateNode.GetString());
        //                DateTime APBExpiryDate = DateTime.Parse(apbExpiryDateNode.GetString());

        //                if (!BGValidator.IsValidBGDateRange(APBDate, APBExpiryDate, out var errorMessage))
        //                {
        //                    return Results.BadRequest(errorMessage); 
        //                }
        //            }

        //            var sql = @"
        //            EXEC [dbo].[spLS_InsertAPB]
        //            @StrSQL";

        //            var parameters = new[]
        //            {
        //                new Microsoft.Data.SqlClient.SqlParameter("@StrSQL", strSQL)
        //            };

        //            var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
        //            return Results.Ok(resultList);
        //        }
        //        else
        //        {
        //            return Results.BadRequest("Missing or invalid parameter in the request body.");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return Results.Problem(detail: ex.Message, statusCode: 500);
        //    }
        //});
        #endregion

        #region Bank Guarantee DTO
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

        app.MapPost("/SubmitBG", async ([FromServices] DataBaseContext dbContext, [FromBody] SubmitBGRequest request) =>
        {
            try
            {
                if (!BGValidator.IsValidBGDateRange(request.BGDate, request.BGExpiryDate, out var errorMessage))
                {
                    return Results.BadRequest(errorMessage);
                }

                var sql = "EXEC [dbo].[spLS_InsertBG] @StrSQL";

                var parameters = new[]
                {
                    new Microsoft.Data.SqlClient.SqlParameter("@StrSQL", request.StrSQL)
                };

                var resultList = await DbHelper.ExecuteStoredProcedureAsync(dbContext, sql, parameters);
                return Results.Ok(resultList);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        });


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

        #region APB DTO
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

        app.MapPost("/SubmitAPB", async ([FromServices] DataBaseContext dbContext, [FromBody] SubmitAPBRequest request) =>
        {
            try
            {
                if (!BGValidator.IsValidBGDateRange(request.APBDate, request.APBExpiryDate, out var errorMessage))
                {
                    return Results.BadRequest(errorMessage);
                }

                var sql = "EXEC [dbo].[spLS_InsertAPB] @StrSQL";

                var parameters = new[]
                {
                    new Microsoft.Data.SqlClient.SqlParameter("@StrSQL", request.StrSQL)
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