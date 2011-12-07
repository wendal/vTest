package org.vtest.ui;

import org.nutz.dao.Cnd;
import org.nutz.ioc.annotation.InjectName;
import org.nutz.ioc.loader.annotation.IocBean;
import org.nutz.mvc.annotation.At;
import org.nutz.mvc.annotation.Param;
import org.vtest.TestDataMaker;
import org.vtest.VTests;
import org.vtest.model.Report;

@InjectName
@IocBean
@At("/report")
public class ReportModule extends BasicModule {

	@At
	public Object list() {
		return dao.query(Report.class, null, null);
	}

	@At
	public Object delete(@Param("id") int id) {
		dao.delete(Report.class, id);
		return VTests.MSG_OK;
	}

	@At
	public Object clear(@Param("ids") int[] ids) {
		dao.clear(Report.class, Cnd.where("id", "in", ids));
		return VTests.MSG_OK;
	}

	@At
	public Object testData(@Param("num") int num) {
		TestDataMaker.makeTestData(num, dao, new Class<?>[]{Report.class});
		return VTests.MSG_OK;
	}

}
