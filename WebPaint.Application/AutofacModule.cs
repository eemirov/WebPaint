using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Autofac;
using System.Data.Entity;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.DataHandler;
using Microsoft.Owin.Security.DataHandler.Serializer;
using Microsoft.Owin.Security.DataProtection;
using WebPaint.Core;

namespace WebPaint.Application
{
	public class AutofacModule: Module
	{
		private readonly IDataProtectionProvider _dataProtectionProvider;

		public AutofacModule(IDataProtectionProvider dataProtectionProvider)
		{
			_dataProtectionProvider = dataProtectionProvider;
		}

		protected override void Load(ContainerBuilder builder)
		{
			builder.RegisterType<ApplicationDbContext>().As<DbContext>();
			builder.RegisterType<UserStore<ApplicationUser>>()
				.As<IUserStore<ApplicationUser>>();

			builder.RegisterType<TicketDataFormat>()
				.As<ISecureDataFormat<AuthenticationTicket>>();
			builder.RegisterType<TicketSerializer>()
				.As<IDataSerializer<AuthenticationTicket>>();
			builder.Register(c => _dataProtectionProvider.Create("ASP.NET Identity"))
				.As<IDataProtector>();

			builder.Register<IAuthenticationManager>((c, p) => c.Resolve<IOwinContext>()
				.Authentication).InstancePerRequest();

			builder.Register((c, p) => ApplicationUserManagerCreator.Create(_dataProtectionProvider, c));


			builder.RegisterType<AuthorizationService>().As<IAuthorizationService>().InstancePerRequest();

			base.Load(builder);
		}

	}
}
