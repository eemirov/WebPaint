using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebPaint.Application
{
	public class AuthenticationDescriptionModels : List<AuthenticationDescriptionModel>
	{
		public string State { get; set; }
	}

	public class AuthenticationDescriptionModel
	{
		public string Caption { get; set; }
		public string AuthenticationType { get; set; }
	}
}
