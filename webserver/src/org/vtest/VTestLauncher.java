package org.vtest;

import org.nutz.lang.Lang;
import org.nutz.lang.Strings;
import org.nutz.log.Log;
import org.nutz.log.Logs;

public class VTestLauncher {

	private static final Log log = Logs.get();

	public static void main(String[] args) {
		String path = Strings.sBlank(Lang.first(args), VTests.CONF_PATH);

		log.infof("launch by '%s'", path);

		final VTestServer server = new VTestServer(new VTestConfig(path));

		server.run();

		log.info("Server is down!");
	}

}
