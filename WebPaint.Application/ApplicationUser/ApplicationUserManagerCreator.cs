using Microsoft.AspNet.Identity;
using Autofac;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security.DataProtection;
using WebPaint.Core;

namespace WebPaint.Application
{
	public static class ApplicationUserManagerCreator
	{
		public static ApplicationUserManager Create(IDataProtectionProvider dataProtectionProvider, IComponentContext context)
		{
			var manager = new ApplicationUserManager(context.Resolve<IUserStore<ApplicationUser>>());
			// Configure validation logic for usernames
			manager.UserValidator = new UserValidator<ApplicationUser>(manager)
			{
				AllowOnlyAlphanumericUserNames = false,
				RequireUniqueEmail = true
			};
			// Configure validation logic for passwords
			manager.PasswordValidator = new PasswordValidator
			{
				RequireNonLetterOrDigit = false,
				RequireDigit = false,
				RequireLowercase = false,
				RequireUppercase = false
			};
			if (dataProtectionProvider != null)
			{
				manager.UserTokenProvider = new DataProtectorTokenProvider<ApplicationUser>(context.Resolve<IDataProtector>());
			}
			return manager;
		}
	}
}
