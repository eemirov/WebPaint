using System.Collections.Generic;
using System.Security.Principal;
using System.Threading.Tasks;

namespace WebPaint.Application
{
	public interface IAuthorizationService
	{
		ExternalLoginData GetExternalLoginData(IPrincipal user);
		void Logout();
		Task<UserLoginInfoModels> GetUserInfoLogins(IPrincipal user, string loginProvider);
		Task<IErrorResult> AddExternalLogin(IPrincipal user, string externalAccessToken);
		Task<IErrorResult> GetExternalLogin(IPrincipal user, string provider);
		AuthenticationDescriptionModels GetAuthenticationDescriptions(bool generateState = false);
		Task<IErrorResult> Register(string email, string password);
		Task<IErrorResult> RegisterExternal();
	}
}