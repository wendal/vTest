package org.vtest.ui;

import org.nutz.dao.Cnd;
import org.nutz.ioc.annotation.InjectName;
import org.nutz.ioc.loader.annotation.IocBean;
import org.nutz.mvc.annotation.At;
import org.nutz.mvc.annotation.Param;
import org.vtest.TestDataMaker;
import org.vtest.VTests;
import org.vtest.model.Task;

@InjectName
@IocBean
@At("/task")
public class TaskModule extends BasicModule {

	@Override
	@At
	public Object list() {
		return dao.query(Task.class, null, null);
	}

	@Override
	@At
	public Object delete(@Param("id") int id) {
		dao.delete(Task.class, id);
		return VTests.MSG_OK;
	}

	@Override
	@At
	public Object clear(@Param("ids") int[] ids) {
		dao.clear(Task.class, Cnd.where("id", "in", ids));
		return VTests.MSG_OK;
	}

	@Override
	@At
	public Object testData(@Param("num") int num) {
		TestDataMaker.makeTestData(num, dao, new Class<?>[]{Task.class});
		return VTests.MSG_OK;
	}
}
