using Microsoft.EntityFrameworkCore;

namespace LARSPS_V3.Server
{
    public class DataBaseContext : DbContext
    {
        public DataBaseContext(DbContextOptions options) : base(options)
        {
        }
    }
}
