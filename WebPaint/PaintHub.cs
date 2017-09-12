using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;

namespace WebPaint
{
	[Authorize]
	public class PaintHub : Hub
	{
		private static readonly Dictionary<string, bool> _connections = new Dictionary<string, bool>();

		public void ItemChanged(string data)
		{
			Clients.AllExcept(Context.ConnectionId).addItem(data);
		}

		public void SendCanvasData(string userConnectionId, string data)
		{
			Clients.Client(userConnectionId).updateCanvas(data);
		}

		public void ItemRemoved(string id)
		{
			Clients.All.removeItem(id);
		}

		public override Task OnConnected()
		{
			lock (_connections)
			{
				if (_connections.Count > 0)
				{
					Clients.Client(_connections.FirstOrDefault().Key).getCanvas(Context.ConnectionId);
				}
			}
			

			lock (_connections)
			{
				_connections[Context.ConnectionId] = true;
			}

			return base.OnConnected();
		}

		public override Task OnDisconnected(bool stopCalled)
		{
			lock (_connections)
			{
				_connections.Remove(Context.ConnectionId);
			}
			return base.OnDisconnected(stopCalled);
		}

	}
}