package org.vtest.ui;

import org.nutz.ioc.annotation.InjectName;
import org.nutz.ioc.loader.annotation.IocBean;
import org.nutz.mvc.annotation.At;
import org.nutz.mvc.annotation.Param;
import org.vtest.TestDataMaker;
import org.vtest.VTests;
import org.vtest.model.Report;
import org.vtest.model.Robot;
import org.vtest.model.Task;

@InjectName
@IocBean
@At("/td")
public class TestDataModule extends BasicModule {

	@Override
	public Object list() {
		return null;
	}

	@Override
	public Object delete(int id) {
		return null;
	}

	@Override
	public Object clear(int[] ids) {
		return null;
	}

	@Override
	@At
	public Object testData(@Param("num") int num) {
		TestDataMaker.makeTestData(num, dao, new Class<?>[]{Robot.class, Task.class, Report.class});
		return VTests.MSG_OK;
	}

}
