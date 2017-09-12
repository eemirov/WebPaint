using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using Microsoft.Owin.Security;

namespace WebPaint.Results
{
    public class ChallengeResult : IHttpActionResult
    {
        public ChallengeResult(string loginProvider, ApiController controller, IAuthenticationManager authentication)
        {
            LoginProvider = loginProvider;
            Request = controller.Request;
	        Authentication = authentication;
        }

        public string LoginProvider { get; set; }
        public HttpRequestMessage Request { get; set; }
		public IAuthenticationManager Authentication { get; set; }

		public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        {
            Authentication.Challenge(LoginProvider);

            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.Unauthorized);
            response.RequestMessage = Request;
            return Task.FromResult(response);
        }
    }
}
