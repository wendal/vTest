package org.vtest;

import java.io.File;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.webapp.WebAppContext;
import org.nutz.lang.Files;
import org.nutz.lang.socket.SocketAction;
import org.nutz.lang.socket.SocketContext;
import org.nutz.lang.socket.Sockets;
import org.nutz.log.Log;
import org.nutz.log.Logs;

class VTestServer {

	private static final Log log = Logs.get();

	private Server server;

	private VTestConfig vc;

	public VTestServer(VTestConfig vTestConfig) {
		vc = vTestConfig;
	}

	void run() {
		try {

			server = new Server(vc.getAppPort());
			// 设置应用上下文
			File root = Files.findFile(vc.getAppRoot());
			String warUrlString = root.toURI().toURL().toExternalForm();
			WebAppContext appContext = new WebAppContext(warUrlString, "/");
			appContext.setExtraClasspath(vc.getAppClasspath());
			server.setHandler(appContext);

			// 启动
			server.start();

			if (log.isInfoEnabled())
				log.info("Server is up!");

			// 管理
			if (log.isInfoEnabled())
				log.infof("Create admin port at %d", vc.getAdminPort());

			Sockets.localListenOne(vc.getAdminPort(), "stop", new SocketAction() {
				public void run(SocketContext context) {
					if (null != server)
						try {
							server.stop();
						}
						catch (Exception e4stop) {
							if (log.isErrorEnabled())
								log.error("Fail to stop!", e4stop);
						}
					Sockets.close();
				}
			});

		}
		catch (Throwable e) {
			if (log.isWarnEnabled())
				log.warn("Unknow error", e);
		}

	}

	@Override
	protected void finalize() throws Throwable {
		if (null != server)
			try {
				server.stop();
			}
			catch (Throwable e) {
				if (log.isErrorEnabled())
					log.error("Fail to stop!", e);
				throw e;
			}
		super.finalize();
	}

}
