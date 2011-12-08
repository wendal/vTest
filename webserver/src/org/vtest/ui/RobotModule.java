package org.vtest.ui;

import org.nutz.dao.Cnd;
import org.nutz.ioc.annotation.InjectName;
import org.nutz.ioc.loader.annotation.IocBean;
import org.nutz.mvc.annotation.At;
import org.nutz.mvc.annotation.Param;
import org.vtest.TestDataMaker;
import org.vtest.VTests;
import org.vtest.model.Robot;

@InjectName
@IocBean
@At("/robot")
public class RobotModule extends BasicModule {

	@At
	public Object list() {
		return dao.query(Robot.class, null, null);
	}

	@At
	public Object delete(@Param("id") int id) {
		dao.delete(Robot.class, id);
		return VTests.MSG_OK;
	}

	@At
	public Object clear(@Param("ids") int[] ids) {
		dao.clear(Robot.class, Cnd.where("id", "in", ids));
		return VTests.MSG_OK;
	}

	@At
	public Object testData(@Param("num") int num) {
		TestDataMaker.makeTestData(num, dao, new Class<?>[]{Robot.class});
		return VTests.MSG_OK;
	}

}
