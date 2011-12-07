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

	@Override
	public void init(NutConfig config) {
		log.info("DataBase Init");
		Ioc ioc = config.getIoc();
		NutDao dao = ioc.get(NutDao.class, "dao");
		// 创建表
		dao.create(Robot.class, false);
		dao.create(Task.class, false);
		dao.create(Report.class, false);
	}

	@Override
	public void destroy(NutConfig config) {}

}
