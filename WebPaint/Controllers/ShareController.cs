using System;
using System.IO;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using System.Xml;
using Svg;
using WebPaint.Models;
using System.Drawing.Imaging;

namespace WebPaint.Controllers
{
    [Authorize]
    public class ShareController : ApiController
    {
        // POST api/values
	    public ShareSvgResult StoreSVG(ShareSvgModel model)
	    {
		    var fileName = Guid.NewGuid() + ".png";
		    var path = HostingEnvironment.MapPath(string.Format("~/share/{0}", fileName));

		    var xmlDoc = new XmlDocument();
			try
			{
				xmlDoc.LoadXml(model.Html);
			}
			catch (XmlException ex)
			{
				return null;
			}

			var svgDocument = SvgDocument.Open(xmlDoc);
			using (var bmp = svgDocument.Draw())
			{
				using (var bitmap = svgDocument.Draw(bmp.Width, bmp.Height)) //I render again
				{
					bitmap.Save(path, ImageFormat.Png);
				}
			}

		    var requestUrl = HttpContext.Current.Request.Url;

		    return new ShareSvgResult()
		    {
			    Url = string.Format("{0}://{1}/share/{2}", requestUrl.Scheme, requestUrl.Authority, fileName)
		    };
	    }

    }
}
