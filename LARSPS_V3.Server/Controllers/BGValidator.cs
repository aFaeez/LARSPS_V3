namespace LARSPS_V3.Server.Controllers
{
    public class BGValidator
    {
        // Function to validate that BGDate is before BGExpiryDate
        public static bool IsValidBGDateRange(DateTime Date1, DateTime Date2, out string errorMessage)
        {
            errorMessage = string.Empty;

            // Check if BGDate is before BGExpiryDate
            if (Date1 >= Date2)
            {
                errorMessage = "Backdated is not allow";
                return false;
            }

            // If validation passes
            return true;
        }
    }
}
