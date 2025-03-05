namespace LARSPS_V3.Server.Modules
{
    using System;
    using System.Runtime.InteropServices;
    using System.Security.Principal;

    public class ImpersonationHelper
    {
        [DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        public static extern bool LogonUser(
            string lpszUsername,
            string lpszPassword,
            int dwLogonType,
            int dwLogonProvider,
            out IntPtr phToken);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto)]
        public extern static bool CloseHandle(IntPtr handle);

        private const int LOGON32_LOGON_NEW_CREDENTIALS = 9;
        private const int LOGON32_PROVIDER_DEFAULT = 0;

        public static void RunAsUser( string username, string password, Action action)
        {
            IntPtr userToken = IntPtr.Zero;

            bool success = LogonUser(username,  password, LOGON32_LOGON_NEW_CREDENTIALS, LOGON32_PROVIDER_DEFAULT, out userToken);

            if (!success)
            {
                throw new UnauthorizedAccessException("Failed to log in to the network share.");
            }

            using (WindowsIdentity identity = new WindowsIdentity(userToken))
            {
                WindowsIdentity.RunImpersonated(identity.AccessToken, action);
            }

            CloseHandle(userToken);
        }
    }

}
