package org.vtest;

import org.nutz.dao.impl.NutDao;
import org.nutz.ioc.Ioc;
import org.nutz.log.Log;
import org.nutz.log.Logs;
import org.nutz.mvc.NutConfig;
import org.nutz.mvc.Setup;
import org.vtest.model.Report;
import org.vtest.model.Robot;
import org.vtest.model.Task;

public class VTestSetup implements Setup {

	private static final Log log = Logs.get();

	private static Class<?>[] clzs = new Class<?>[]{Robot.class, Task.class, Report.class};

	@Override
	public void init(NutConfig config) {
		log.info("DataBase Init");
		Ioc ioc = config.getIoc();
		NutDao dao = ioc.get(NutDao.class, "dao");
		// 创建表
		for (int i = 0; i < clzs.length; i++) {
			dao.create(clzs[i], false);
		}
		// 测试数据
		VTestConfig vc = new VTestConfig(ioc);
		if (vc.getUseTestMode()) {
			log.info("Add TestData to Database");
			TestDataMaker.makeTestData(vc.getTestMax(), dao, clzs);
		}
	}

	@Override
	public void destroy(NutConfig config) {}

}
