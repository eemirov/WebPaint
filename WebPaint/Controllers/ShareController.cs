using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using WebPaint.Models;

namespace WebPaint.Controllers
{
    [Authorize]
    public class ShareController : ApiController
    {
        // POST api/values
        public ShareSvgResult StoreHtml(ShareSvgModel model)
        {
	        var fileName = Guid.NewGuid() + ".html";
	        var path = HostingEnvironment.MapPath(string.Format("~/share/{0}", fileName));
			File.WriteAllText(path, model.Html);
	        var requestUrl = HttpContext.Current.Request.Url;

			return new ShareSvgResult()
	        {
				Url = string.Format("{0}://{1}/share/{2}", requestUrl.Scheme, requestUrl.Authority, fileName)
			};
		}


    }
}
