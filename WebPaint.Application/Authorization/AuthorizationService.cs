using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security.OAuth;
using WebPaint.Core;

namespace WebPaint.Application
{
	public class AuthorizationService: IAuthorizationService
	{
		private readonly IAuthenticationManager _authentication;
		private readonly ApplicationUserManager _userManager;
		private readonly ISecureDataFormat<AuthenticationTicket> _accessTokenFormat;

		public AuthorizationService(IAuthenticationManager authentication, ApplicationUserManager userManager, 
			ISecureDataFormat<AuthenticationTicket> accessTokenFormat)
		{
			_authentication = authentication;
			_userManager = userManager;
			_accessTokenFormat = accessTokenFormat;
		}

		public ExternalLoginData GetExternalLoginData(IPrincipal user)
		{
			return ExternalLoginData.FromIdentity(user.Identity as ClaimsIdentity);
		}

		public void Logout()
		{
			_authentication.SignOut(CookieAuthenticationDefaults.AuthenticationType);
		}

		public async Task<UserLoginInfoModels> GetUserInfoLogins(IPrincipal user, string loginProvider)
		{
			IdentityUser appUser = await _userManager.FindByIdAsync(user.Identity.GetUserId());

			if (appUser == null)
			{
				return null;
			}

			var logins = new UserLoginInfoModels()
			{
				UserName = appUser.UserName
			};

			foreach (IdentityUserLogin linkedAccount in appUser.Logins)
			{
				logins.Add(new UserLoginInfoModel
				{
					LoginProvider = linkedAccount.LoginProvider,
					ProviderKey = linkedAccount.ProviderKey
				});
			}

			if (appUser.PasswordHash != null)
			{
				logins.Add(new UserLoginInfoModel
				{
					LoginProvider = loginProvider,
					ProviderKey = appUser.UserName,
				});
			}

			return logins;
		}

		public async Task<IErrorResult> AddExternalLogin(IPrincipal user, string externalAccessToken)
		{
			_authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);

			var ticket = _accessTokenFormat.Unprotect(externalAccessToken);

			if (ticket == null || ticket.Identity == null || (ticket.Properties != null
					&& ticket.Properties.ExpiresUtc.HasValue
					&& ticket.Properties.ExpiresUtc.Value < DateTimeOffset.UtcNow))
			{
				return new BadRequestResult("External login failure.");
			}

			ExternalLoginData externalData = ExternalLoginData.FromIdentity(ticket.Identity);

			if (externalData == null)
			{
				return new BadRequestResult("The external login is already associated with an account.");
			}

			var result = await _userManager.AddLoginAsync(user.Identity.GetUserId(),
				new UserLoginInfo(externalData.LoginProvider, externalData.ProviderKey));

			if (!result.Succeeded)
			{
				return new ErrorResult(result);
			}

			return null;
		}

		public async Task<IErrorResult> GetExternalLogin(IPrincipal user, string provider)
		{
			if (!user.Identity.IsAuthenticated)
			{
				return new ChallangeErrorResult(_authentication);
			}

			ExternalLoginData externalLogin = GetExternalLoginData(user);

			if (externalLogin == null)
			{
				return new InternalErrorResult();
			}

			if (externalLogin.LoginProvider != provider)
			{
				_authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);
				return new ChallangeErrorResult(_authentication);
			}

			var appUser = await _userManager.FindAsync(new UserLoginInfo(externalLogin.LoginProvider,
				externalLogin.ProviderKey));

			bool hasRegistered = appUser != null;

			if (hasRegistered)
			{
				_authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);

				ClaimsIdentity oAuthIdentity = await appUser.GenerateUserIdentityAsync(_userManager,
					OAuthDefaults.AuthenticationType);
				ClaimsIdentity cookieIdentity = await appUser.GenerateUserIdentityAsync(_userManager,
					CookieAuthenticationDefaults.AuthenticationType);

				AuthenticationProperties properties = ApplicationOAuthProvider.CreateProperties(appUser.UserName);
				_authentication.SignIn(properties, oAuthIdentity, cookieIdentity);
			}
			else
			{
				IEnumerable<Claim> claims = externalLogin.GetClaims();
				ClaimsIdentity identity = new ClaimsIdentity(claims, OAuthDefaults.AuthenticationType);
				_authentication.SignIn(identity);
			}

			return null;
		}

		public AuthenticationDescriptionModels GetAuthenticationDescriptions(bool generateState = false)
		{
			var descriptions = _authentication.GetExternalAuthenticationTypes();
			var result = new AuthenticationDescriptionModels();

			if (generateState)
			{
				const int strengthInBits = 256;
				result.State = RandomOAuthStateGenerator.Generate(strengthInBits);
			}
			else
			{
				result.State = null;
			}

			result.AddRange(descriptions.Select(d => new AuthenticationDescriptionModel()
			{
				Caption = d.Caption,
				AuthenticationType = d.AuthenticationType
			}));

			return result;
		}

		public async Task<IErrorResult> Register(string email, string password)
		{
			var user = new ApplicationUser() { UserName = email, Email = email };

			var result = await _userManager.CreateAsync(user, password);

			if (!result.Succeeded)
			{
				return new ErrorResult(result);
			}

			return null;
		}

		public async Task<IErrorResult> RegisterExternal()
		{
			var info = await _authentication.GetExternalLoginInfoAsync();
			if (info == null)
			{
				return new InternalErrorResult();
			}

			var user = await _userManager.FindByEmailAsync(info.Email);
			var isNewUser = false;

			if (user == null)
			{
				user = new ApplicationUser() { UserName = info.Email, Email = info.Email };
				isNewUser = true;
			}

			if (isNewUser)
			{
				var result = await _userManager.CreateAsync(user);
				if (!result.Succeeded)
				{
					return new ErrorResult(result);
				}
			}

			var addResult = await _userManager.AddLoginAsync(user.Id, info.Login);
			if (!addResult.Succeeded)
			{
				return new ErrorResult(addResult);
			}

			return null;
		}
	}

	internal static class RandomOAuthStateGenerator
	{
		private static RandomNumberGenerator _random = new RNGCryptoServiceProvider();

		public static string Generate(int strengthInBits)
		{
			const int bitsPerByte = 8;

			if (strengthInBits % bitsPerByte != 0)
			{
				throw new ArgumentException("strengthInBits must be evenly divisible by 8.", "strengthInBits");
			}

			int strengthInBytes = strengthInBits / bitsPerByte;

			byte[] data = new byte[strengthInBytes];
			_random.GetBytes(data);
			return HttpServerUtility.UrlTokenEncode(data);
		}
	}

}
