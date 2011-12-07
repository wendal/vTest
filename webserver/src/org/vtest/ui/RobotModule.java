package org.vtest.ui;

import org.nutz.dao.Cnd;
import org.nutz.ioc.annotation.InjectName;
import org.nutz.ioc.loader.annotation.IocBean;
import org.nutz.mvc.annotation.At;
import org.nutz.mvc.annotation.Param;
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
		// 清空数据库
		dao.clear(Robot.class);
		// 添加测试数据
		if (num == 0) {
			num = 1;
		}
		for (int i = 0; i < num; i++) {
			dao.fastInsert(getAnRobot());
		}
		return VTests.MSG_OK;
	}

	public Robot getAnRobot() {
		Robot robot = new Robot();
		robot.setIpv4("192.168.1." + random.nextInt(255));
		robot.setHnm(stringGenerator.next());
		robot.setPrid(String.valueOf(random.nextInt(10000)));
		robot.setLm(VTests.now());
		return robot;
	}

}
