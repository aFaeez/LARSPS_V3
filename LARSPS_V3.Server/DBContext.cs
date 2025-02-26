using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace LARSPS_V3.Server
{
    public class DataBaseContext : DbContext
    {
        public DataBaseContext(DbContextOptions options) : base(options)
        {
        }

        // Function to execute stored procedure and return a list
        public async Task<List<T>> ExecuteStoredProcedure<T>(string storedProcName, params SqlParameter[] parameters) where T : class
        {
            return await this.Set<T>()
                .FromSqlRaw($"EXEC {storedProcName}", parameters)
                .ToListAsync();
        }

        // Function to execute stored procedure without returning data
        public async Task<int> ExecuteStoredProcedureNonQuery(string storedProcName, params SqlParameter[] parameters)
        {
            return await this.Database.ExecuteSqlRawAsync($"EXEC {storedProcName}", parameters);
        }
    }
}
