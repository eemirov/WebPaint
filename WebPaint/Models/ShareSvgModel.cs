using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebPaint.Models
{
	public class ShareSvgModel
	{
		[Required]
		public string Html { get; set; }
	}

	public class ShareSvgResult
	{
		public string Url { get; set; }
	}

}