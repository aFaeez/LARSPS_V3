using System.Data.Common;
using LARSPS_V3.Server;
using Microsoft.EntityFrameworkCore;

namespace LARSPS_V3.API.Modules;
public static class DbHelper
{
    public static async Task<List<Dictionary<string, object>>> ExecuteStoredProcedureAsync(
        DataBaseContext dbContext,
        string sql,
        params DbParameter[] parameters)
    {
        try
        {
            using var command = dbContext.Database.GetDbConnection().CreateCommand();
            command.CommandText = sql;
            command.CommandType = System.Data.CommandType.Text;

            // Add parameters
            if (parameters != null)
            {
                foreach (var parameter in parameters)
                {
                    command.Parameters.Add(parameter);
                }
            }

            // Open connection and execute the command
            await dbContext.Database.OpenConnectionAsync();
            using var reader = await command.ExecuteReaderAsync();

            // Parse the results
            var resultList = new List<Dictionary<string, object>>();
            while (await reader.ReadAsync())
            {
                var row = new Dictionary<string, object>();
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    row[reader.GetName(i)] = reader.GetValue(i);
                }
                resultList.Add(row);
            }

            return resultList;
        }
        finally
        {
            // Ensure the connection is closed
            await dbContext.Database.CloseConnectionAsync();
        }
    }
}
