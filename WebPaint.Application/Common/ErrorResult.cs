using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;

namespace WebPaint.Application
{
	public interface IErrorResult
	{
	}

	public class ErrorResult: IErrorResult
	{
		public bool Succeeded { get; }
		public IEnumerable<string> Errors { get; }

		public ErrorResult(IdentityResult iresult)
		{
			Errors = iresult.Errors;
			Succeeded = iresult.Succeeded;
		}
	}

	public class BadRequestResult : IErrorResult
	{
		public string Message { get; }

		public BadRequestResult(string msg)
		{
			Message = msg;
		}
	}

	public class ChallangeErrorResult : IErrorResult
	{
		public IAuthenticationManager Authentication { get; }

		public ChallangeErrorResult(IAuthenticationManager authentication)
		{
			Authentication = authentication;
		}
	}

	public class InternalErrorResult : IErrorResult
	{
		
	}
}
