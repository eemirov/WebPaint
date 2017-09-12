using Microsoft.AspNet.Identity;

namespace WebPaint.Core
{
	public class ApplicationUserManager : UserManager<ApplicationUser>
	{
		public ApplicationUserManager(IUserStore<ApplicationUser> store)
			: base(store)
		{
		}
	}
}
