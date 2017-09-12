using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebPaint.Application
{
	public class UserLoginInfoModels : List<UserLoginInfoModel>
	{
		public string UserName { get; set; }
	}

	public class UserLoginInfoModel
	{
		public string LoginProvider { get; set; }

		public string ProviderKey { get; set; }
	}
}
