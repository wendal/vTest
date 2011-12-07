package org.vtest.ui;

import org.nutz.dao.Cnd;
import org.nutz.ioc.annotation.InjectName;
import org.nutz.ioc.loader.annotation.IocBean;
import org.nutz.mvc.annotation.At;
import org.nutz.mvc.annotation.Param;
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
		// 清空数据库
		dao.clear(Report.class);
		// 添加测试数据
		if (num == 0) {
			num = 1;
		}
		for (int i = 0; i < num; i++) {
			dao.fastInsert(getAnReport());
		}
		return VTests.MSG_OK;
	}

	private Object getAnReport() {
		Report report = new Report();
		report.setErr(random.nextInt(2));
		report.setLm(VTests.now());
		report.setMsg("OK");
		report.setRid(random.nextInt(100));
		report.setStep(random.nextInt(5));
		report.setTid(random.nextInt(100));
		report.setTotal(random.nextInt(3000));
		report.setDura(random.nextInt(500)
						+ ","
						+ random.nextInt(5000)
						+ ","
						+ random.nextInt(3000));
		return report;
	}

}
