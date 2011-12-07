package org.vtest;

import java.sql.Timestamp;

public class VTests {

	private VTests() {}

	public static final String CONF_PATH = "vtest.properties";

	public static final String APP_ROOT = "app-root";

	public static final String APP_PORT = "app-port";

	public static final String APP_RS = "app-rs";

	public static final String ADMIN_PORT = "admin-port";

	public static final String APP_CLASSPATH = "app-classpath";

	public static final String USE_TEST_MODE = "use-test-mode";

	public static final String TEST_MAX = "test-max";

	public static final String VTEST_CONF = "vtestConf";

	public static final String MSG_OK = "ok";

	public static Timestamp now() {
		return new Timestamp(System.currentTimeMillis());
	}

}
