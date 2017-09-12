using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using WebPaint.Application;
using WebPaint.Models;
using WebPaint.Results;
using BadRequestResult = WebPaint.Application.BadRequestResult;

namespace WebPaint.Controllers
{
    [Authorize]
    [RoutePrefix("api/Account")]
    public class AccountController : ApiController
    {
        private const string LocalLoginProvider = "Local";
	    private readonly IAuthorizationService _authorizationService;

		public AccountController(IAuthorizationService authorizationService)
		{
			_authorizationService = authorizationService;
		}

        // GET api/Account/UserInfo
        [HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
        [Route("UserInfo")]
        public UserInfoViewModel GetUserInfo()
        {
			var externalLogin = _authorizationService.GetExternalLoginData(User);

            return new UserInfoViewModel
            {
                UserName = User.Identity.GetUserName(),
                HasRegistered = externalLogin == null,
                LoginProvider = externalLogin != null ? externalLogin.LoginProvider : null
            };
        }

        // POST api/Account/Logout
        [Route("Logout")]
        public IHttpActionResult Logout()
        {
			_authorizationService.Logout();
            return Ok();
        }

        // GET api/Account/ManageInfo?returnUrl=%2F&generateState=true
        [Route("ManageInfo")]
        public async Task<ManageInfoViewModel> GetManageInfo(string returnUrl, bool generateState = false)
        {
	        var logins = await _authorizationService.GetUserInfoLogins(User, LocalLoginProvider);

	        if (logins == null)
		        return null;

			return new ManageInfoViewModel
            {
                LocalLoginProvider = LocalLoginProvider,
                Email = logins.UserName,
                Logins = logins.Select(l => new UserLoginInfoViewModel(){LoginProvider = l.LoginProvider, ProviderKey = l.ProviderKey}),
                ExternalLoginProviders = GetExternalLogins(returnUrl, generateState)
            };
        }

        // POST api/Account/AddExternalLogin
        [Route("AddExternalLogin")]
        public async Task<IHttpActionResult> AddExternalLogin(AddExternalLoginBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

	        var result = await _authorizationService.AddExternalLogin(User, model.ExternalAccessToken);

	        if (result is BadRequestResult)
	        {
		        return BadRequest((result as BadRequestResult).Message);
	        }

			if (result is ErrorResult)
			{
				var error = result as ErrorResult;
				if (!error.Succeeded)
					return GetErrorResult(error);
			}

            return Ok();
        }

        // GET api/Account/ExternalLogin
        [OverrideAuthentication]
        [HostAuthentication(DefaultAuthenticationTypes.ExternalCookie)]
        [AllowAnonymous]
        [Route("ExternalLogin", Name = "ExternalLogin")]
        public async Task<IHttpActionResult> GetExternalLogin(string provider, string error = null)
        {
            if (error != null)
            {
                return Redirect(Url.Content("~/") + "#error=" + Uri.EscapeDataString(error));
            }

	        var result = await _authorizationService.GetExternalLogin(User, provider);

            if (result is ChallangeErrorResult)
            {
                return new ChallengeResult(provider, this, (result as ChallangeErrorResult).Authentication);
            }

            if (result is InternalErrorResult)
            {
                return InternalServerError();
            }

            return Ok();
        }

        // GET api/Account/ExternalLogins?returnUrl=%2F&generateState=true
        [AllowAnonymous]
        [Route("ExternalLogins")]
        public IEnumerable<ExternalLoginViewModel> GetExternalLogins(string returnUrl, bool generateState = false)
        {
	        var descriptions = _authorizationService.GetAuthenticationDescriptions(generateState);
			var logins = new List<ExternalLoginViewModel>(descriptions.Count);

			foreach (var description in descriptions)
            {
                var login = new ExternalLoginViewModel
                {
                    Name = description.Caption,
                    Url = Url.Route("ExternalLogin", new
                    {
                        provider = description.AuthenticationType,
                        response_type = "token",
                        client_id = Startup.PublicClientId,
                        redirect_uri = new Uri(Request.RequestUri, returnUrl).AbsoluteUri,
                        state = descriptions.State
					}),
                    State = descriptions.State
				};
                logins.Add(login);
            }

            return logins;
        }

        // POST api/Account/Register
        [AllowAnonymous]
        [Route("Register")]
        public async Task<IHttpActionResult> Register(RegisterBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

	        var result = await _authorizationService.Register(model.Email, model.Password) as ErrorResult;

	        if (result != null  && !result.Succeeded)
	        {
		        return GetErrorResult(result);
	        }

            return Ok();
        }

        // POST api/Account/RegisterExternal
        [OverrideAuthentication]
        [HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
        [Route("RegisterExternal")]
        public async Task<IHttpActionResult> RegisterExternal()
        {
	        var result = await _authorizationService.RegisterExternal();

            if (result is InternalErrorResult)
            {
                return InternalServerError();
            }

	        if (result is ErrorResult)
	        {
		        var error = result as ErrorResult;
		        if (!error.Succeeded)
		        {
			        return GetErrorResult(error);
		        }
	        }

            return Ok();
        }

        #region Helpers

        private IHttpActionResult GetErrorResult(ErrorResult result)
        {
            if (result == null)
            {
                return InternalServerError();
            }

            if (!result.Succeeded)
            {
                if (result.Errors != null)
                {
                    foreach (string error in result.Errors)
                    {
                        ModelState.AddModelError("", error);
                    }
                }

                if (ModelState.IsValid)
                {
                    // No ModelState errors are available to send, so just return an empty BadRequest.
                    return BadRequest();
                }

                return BadRequest(ModelState);
            }

            return null;
        }

        #endregion
    }
}
