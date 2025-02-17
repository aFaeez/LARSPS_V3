using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using LARSPS_V3.Server;
using LARSPS_V3.API.Modules;
using LARSPS_V3.Server.Common;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//string of connection can be obtain here
builder.Services.AddSingleton<Common>();

builder.Services.AddDbContext<DataBaseContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("myAppConnLARSPSv2"));
});
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("CorsPolicy", policyBuilder =>
    {
        policyBuilder.AllowAnyHeader()
                     .AllowAnyMethod()
                     .SetIsOriginAllowed(_ => true) // Allow all origins
                     .AllowCredentials();
    });
});


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error-local-development");
    app.Map("/error-local-development", (HttpContext context) =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        return Results.Problem(detail: exception?.Message, title: "Internal Server Error");
    });
}
else
{
    app.UseExceptionHandler("/error");
    app.Map("/error", () => Results.Problem("An unexpected error occurred."));
}


app.UseExceptionHandler(_ => { });
app.UseCors("CorsPolicy");
app.UseHttpsRedirection();
app.GetSP();
app.Run();
