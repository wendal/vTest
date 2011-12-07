package org.vtest;

import org.nutz.ioc.impl.PropertiesProxy;
import org.nutz.lang.Lang;
import org.nutz.lang.Strings;
import org.nutz.lang.util.Disks;

public class VTestConfig {

	private PropertiesProxy pp;

	public VTestConfig(String path) {
		pp = new PropertiesProxy();
		pp.setPaths(path);
	}

	public String getAppRoot() {
		return get(VTests.APP_ROOT);
	}

	public int getAppPort() {
		return getInt(VTests.APP_PORT);
	}

	public String getAppRs() {
		return get(VTests.APP_RS);
	}

	public int getAdminPort() {
		return getInt(VTests.ADMIN_PORT);
	}

	public String getAppClasspath() {
		String str = get(VTests.APP_CLASSPATH);
		String[] ss = Strings.splitIgnoreBlank(str, "\n");
		for (int i = 0; i < ss.length; i++) {
			ss[i] = Disks.normalize(ss[i]);
		}
		return Lang.concat(",", ss).toString();
	}

	private String get(String key) {
		return pp.get(key);
	}

	private int getInt(String key) {
		return Integer.valueOf(pp.get(key));
	}

}
